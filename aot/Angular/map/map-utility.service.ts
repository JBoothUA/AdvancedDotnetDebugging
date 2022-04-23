import { Injectable, NgZone } from '@angular/core';
import { Position } from '../shared/shared-interfaces';
import { Tenant } from '../shared/tenant.class';
import { Location } from '../shared/location.class';
import { HttpService } from '../shared/http.service';
import { UserService } from '../shared/user.service';
import { MapLayer, LayerFormat } from '../shared/map-layer.class';
import { PlatformImageProperties, MapControlPositions, MapCreateOptions } from '../shared/map-settings.class';
import { LocationFilterService } from '../shared/location-filter.service';

@Injectable()
export class MapUtilityService {
	private map: L.Map;
	private leafletLayers: any[];
	private radToDegrees = 180 / Math.PI;
	private degreesToRad = Math.PI / 180;
	private userTenant: Tenant;
	private childTenants: Tenant[];

	public fitBoundsOptions: L.FitBoundsOptions = { padding: [5, 5] };


	constructor(
		private httpService: HttpService,
		private ngZone: NgZone,
		private userService: UserService,
		private locFilterService: LocationFilterService) {
		this.leafletLayers = [];

		this.userTenant = userService.currentUser.tenant;
		this.childTenants = userService.currentUser.childTenants;
	}

	public setUserTenantInfo(userTenant: Tenant, childTenants: Tenant[]) {
		this.userTenant = userTenant;
		this.childTenants = childTenants;
	}

	public createMap(mapElementId: string, options: MapCreateOptions = new MapCreateOptions(), callback: any = null): L.Map {
		let mapOptions: any = {};
		let custZoomCenter: boolean = false;

		let secInfo: any = {};
		secInfo.CustZoomLayers = {};
		this.leafletLayers = [];

		this.leafletLayers.push(L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}));

		if (this.leafletLayers[0]) {
			this.leafletLayers[0]._secInfo = {};
			this.leafletLayers[0]._secInfo.Id = 'openstreet';
		}

		if (this.userTenant.MapSettings && this.userTenant.MapSettings.Layers) {
			for (let mapLayer of this.userTenant.MapSettings.Layers) {
				if (this.isMapLayerValid(mapLayer) && mapLayer.IsShownOnStartup) {
					this.leafletLayers.push(this.createLayer(mapLayer));
				}
			}
		}

		this.createLayersFromLocations(this.userTenant.Locations, false);

		if (this.childTenants) {
			for (let tenant of this.childTenants) {
				this.createLayersFromLocations(tenant.Locations, false);
			}
		}

		for (let layer of this.leafletLayers) {
			if (layer._secInfo && layer._secInfo.CustMinZoom) {
				secInfo.CustZoomLayers[layer._secInfo.Id] = layer;
			}
		} 

		let zoomCenter: any;
		zoomCenter = this.getInitZoomCenter();

		if (options.Zoom != -1) {
			zoomCenter.Zoom = options.Zoom;
			custZoomCenter = true;
		}
		if (options.Center) {
			zoomCenter.Center = options.Center;
			custZoomCenter = true;
		}
		mapOptions.layers = this.leafletLayers;
		mapOptions.zoom = zoomCenter.Zoom;
		mapOptions.center = zoomCenter.Center;
		mapOptions.doubleClickZoom = options.DoubleClickZoom;
		mapOptions.scrollWheelZoom = options.ScrollWheelZoom;
		mapOptions.dragging = options.Dragging;
		mapOptions.keyboard = options.Keyboard;
		mapOptions.zoomControl = false;
		mapOptions.attributionControl = false;
		mapOptions.minZoom = options.MinZoom;
		mapOptions.maxZoom = options.MaxZoom;

		if (options.AdditionalOptions) {
			L.Util.extend(mapOptions, options.AdditionalOptions);
		}

		this.ngZone.runOutsideAngular(() => {
			this.map = new L.Map(mapElementId, mapOptions);
			(<any>this.map)._secInfo = secInfo;

			this.map.on('zoomend', this._onMapZoomEndForCustZooms, this);

			if (options.AttributionControl) {
				L.control.attribution({ position: <L.ControlPosition>(<string>MapControlPositions[options.AttributionControlPosition].toLowerCase()) }).addTo(this.map);
			}

			if (options.ZoomControl) {
				L.control.zoom({ position: <L.ControlPosition>(<string>MapControlPositions[options.ZoomControlPosition].toLowerCase()) }).addTo(this.map);
			}
		});

		setTimeout(() => {
			if (!custZoomCenter) {
				this.zoomToLocationBounds();
			}
			this.map.invalidateSize();
			if (callback) {
				callback(this.map);
			} 
		}, 500);

		return (this.map);
	}

	private getInitZoomCenter(): any {
		let zoomCenter: any = { Center: L.latLng([39.872977, -97.186965]), Zoom: 5 };
		let tenant = this.userTenant;
		if (tenant.Locations && tenant.Locations.length === 1) {
			if (tenant.Locations[0].MapSettings && tenant.Locations[0].MapSettings.MapCenter &&
				tenant.Locations[0].MapSettings.ZoomLevel !== -1) {
				zoomCenter.Center = this.convertPositionToLatLng(tenant.Locations[0].MapSettings.MapCenter);
				zoomCenter.Zoom = tenant.Locations[0].MapSettings.ZoomLevel;
			}
		}
		return (zoomCenter);
	}

	private zoomToLocationBounds(): any {
		let maxZoom: number = 0;
		if ((this.userTenant.Locations && this.userTenant.Locations.length > 1) || this.childTenants) {
			let polygon: L.Polygon;
			let pts: L.LatLng[] = [];
			let tenant = this.userTenant;
			if (tenant.Locations) {
				for (let location of tenant.Locations) {
					if (location.MapSettings && location.MapSettings.MapCenter) {
						if (maxZoom < location.MapSettings.ZoomLevel) {
							maxZoom = location.MapSettings.ZoomLevel;
						}

						pts.push(this.convertPositionToLatLng(location.MapSettings.MapCenter));
					}
				}
			}

			for (let childTenant of this.childTenants) {
				if (childTenant.Locations) {
					for (let location of childTenant.Locations) {
						if (location.MapSettings && location.MapSettings.MapCenter) {
							if (maxZoom < location.MapSettings.ZoomLevel) {
								maxZoom = location.MapSettings.ZoomLevel;
							}
							pts.push(this.convertPositionToLatLng(location.MapSettings.MapCenter));
						}
					}
				}
			}

			if (pts.length > 1) {
				let bnds: L.LatLngBounds = L.latLngBounds(pts).pad(0.2);
				let bndsZoom = this.map.getBoundsZoom(bnds);
				let center:L.LatLng = bnds.getCenter();
				if (bndsZoom > maxZoom) {
					bndsZoom = maxZoom;
				}

				this.map.setView(center, bndsZoom);
			}
		}
	}


	public isMapLayerValid(mapLayer: MapLayer): boolean {
		let valid: boolean = false;
		if (mapLayer.URL && mapLayer.URL.length > 0) {
			switch (mapLayer.LayerFormat) {
				case LayerFormat.PlatformImage:
				case LayerFormat.Image: {
					valid = mapLayer.Anchors && mapLayer.Anchors.length > 0 ? true : false;
					break;
				}
				case LayerFormat.WMS: {
					valid = mapLayer.WMSLayers && mapLayer.WMSLayers.length > 0 ? true : false;
					break;
				}
				default:
					valid = true;
			}
		}
		return (valid);
	}

	private deleteMap() {
		this.map.remove();
		this.map = null;
		this.leafletLayers = [];
	}

	private createLayersFromLocations(locations: Location[], addLayerToMap: boolean) {
		if (locations) {
			for (let location of locations) {
				if (location.MapSettings && location.MapSettings.Layers) {
					for (let mapLayer of location.MapSettings.Layers) {
						if (this.isMapLayerValid(mapLayer) && mapLayer.IsShownOnStartup) {
							let layer = this.createLayer(mapLayer);
							if (layer) {
								if (addLayerToMap) {
									this.addLayerToMap(layer);
								}
								else {
									this.leafletLayers.push(layer);
								}
							}
						}
					}
				}
			}
		}
	}

	public createLayer(mapLayer: MapLayer) {
		let layer: any;
		let options: any = {};
		let secInfo: any = {};
		secInfo.MapLayer = mapLayer;
		secInfo.Id = mapLayer.Id;

		switch (mapLayer.LayerFormat) {
			case LayerFormat.PlatformImage:
			case LayerFormat.Image: {

				options.opacity = mapLayer.Opacity;
				for (let option of mapLayer.Options) {
					options[option.Name] = option.Value;
				}

				if (mapLayer.Anchors.length === 4) {
					let anchorsLL: L.LatLng[] = this.convertAnchorsPositionToLatLng(mapLayer.Anchors);
					if (anchorsLL) {
						layer = L.imageTransform(mapLayer.URL, anchorsLL, options);
						if (mapLayer.IsMinMaxZoomDefined) {
							secInfo.CustMinZoom = mapLayer.MinZoomLevel;
							secInfo.CustMaxZoom = mapLayer.MaxZoomLevel;
						}
					}
				}
				break;
			}

			case LayerFormat.Tile: {
				let url = mapLayer.URL;

				if (mapLayer.IsMinMaxZoomDefined) {
					options.minZoom = mapLayer.MinZoomLevel;
					options.maxZoom = mapLayer.MaxZoomLevel;
				}

				options.opacity = mapLayer.Opacity;

				for (let option of mapLayer.Options) {
					if (option.Name === "crs") {
						if (option.Value === 'EPSG3857')
							option.Value = 'EPSG:3857';

						let crs;
						//crs = getCRSByName(optionValue);

						if (crs !== null) {
							options[option.Name] = crs;
						}
					}
					else {
						options[option.Name] = option.Value;
					}
				}

				layer = L.tileLayer(url, options);
				break;
			}

			case LayerFormat.WMS: {
				let url = mapLayer.URL;
				if (mapLayer.LayerFormat === LayerFormat.WMS) {
					options.layers = mapLayer.getCommaSeparatedWMSLayers();
					if (!options.layers || options.layers.length === 0) {
						return (null);
					}
				}

				if (mapLayer.IsMinMaxZoomDefined) {
					options.minZoom = mapLayer.MinZoomLevel;
					options.maxZoom = mapLayer.MaxZoomLevel;
				}

				options.opacity = mapLayer.Opacity;

				for (let option of mapLayer.Options) {
					if (option.Name === "crs") {
						if (option.Value === 'EPSG3857')
							option.Value = 'EPSG:3857';

						let crs;
						//crs = getCRSByName(optionValue);

						if (crs !== null) {
							options[option.Name] = crs;
						}
					}
					else {
						options[option.Name] = option.Value;
					}
				}
				if (!options.version) {
					options.version = '1.3.0';
				}
				if (!options.transparent)
					options.transparent = true;

				if (!options.format)
					options.format = 'image/png';

				layer = L.tileLayer.wms(url, options);
				break;
			}
		}

		if (layer) {
			layer._secInfo = secInfo;
		}

		return (layer);
	}

	private findLayerIndex(id: string): number {
		let idx: number = -1;
		idx = this.leafletLayers.findIndex((elem: any, index: number, array: any) => { return (elem._secInfo.Id === id); });
		return (idx);
	}

	public addLayerToMap(leafletLayer: any) {
		if (leafletLayer) {
			if (leafletLayer._secInfo.CustMinZoom) {
				if (!(<any>this.map)._secInfo.CustZoomLayers[leafletLayer._secInfo.Id]) {
					(<any>this.map)._secInfo.CustZoomLayers[leafletLayer._secInfo.Id] = leafletLayer;
					let curZoom = this.map.getZoom();
					if (!(curZoom >= leafletLayer._secInfo.CustMinZoom && curZoom <= leafletLayer._secInfo.CustMaxZoom)) {
						leafletLayer.setOpacity(0);
					}
				}
			}
			this.map.addLayer(leafletLayer);
			this.leafletLayers.push(leafletLayer);
		}
	}

	public removeLayerFromMap(id: string) {
		let idx = this.findLayerIndex(id);
		if (idx !== -1) {
			let leafletLayer = this.leafletLayers[idx];
			if (leafletLayer) {
				this.map.removeLayer(leafletLayer);
				this.leafletLayers.splice(idx, 1);
				if ((<any>this.map)._secInfo.CustZoomLayers[id]) {
					delete (<any>this.map)._secInfo.CustZoomLayers[id];
				}
			}
		}
	}
	public convertPositionToLatLng(position: Position): L.LatLng {
		let latLng: L.LatLng = L.latLng([position.Coordinates[1], position.Coordinates[0]]);
		return (latLng);
	}

	public convertLatLngToPosition(latLng: L.LatLng): Position {
		let pos: Position = { Coordinates: [latLng.lng, latLng.lat], Type: 'Point' };
		return (pos);
	}

	public convertAnchorsPositionToLatLng(anchors: Position[]): L.LatLng[] {
		let anchorsLL: L.LatLng[] = [];

		anchorsLL.push(this.convertPositionToLatLng(anchors[0]));
		anchorsLL.push(this.convertPositionToLatLng(anchors[1]));
		anchorsLL.push(this.convertPositionToLatLng(anchors[2]));
		anchorsLL.push(this.convertPositionToLatLng(anchors[3]));

		return (anchorsLL);
	}

	public convertAnchorsLatLngToPosition(anchors: L.LatLng[]): Position[] {
		let anchorsPos: Position[] = [];

		anchorsPos.push(this.convertLatLngToPosition(anchors[0]));
		anchorsPos.push(this.convertLatLngToPosition(anchors[1]));
		anchorsPos.push(this.convertLatLngToPosition(anchors[2]));
		anchorsPos.push(this.convertLatLngToPosition(anchors[3]));

		return (anchorsPos);
	}
	public redrawLayers() {
		for (let ii = this.leafletLayers.length - 1; ii > 0; ii--) {
			this.removeLayerFromMap(this.leafletLayers[ii]._secInfo.Id);
		}

		if (this.userTenant.MapSettings && this.userTenant.MapSettings.Layers) {
			for (let mapLayer of this.userTenant.MapSettings.Layers) {
				this.leafletLayers.push(this.createLayer(mapLayer));
				this.addLayerToMap(this.leafletLayers[this.leafletLayers.length - 1]);
			}
		}

		this.createLayersFromLocations(this.userTenant.Locations, true);

		if (this.childTenants) {
			for (let tenant of this.childTenants) {
				this.createLayersFromLocations(tenant.Locations, true);
			}
		}

	}

	public getLeafletLayer(id: string): any {
		let idx = this.findLayerIndex(id);
		return (idx !== -1 ? this.leafletLayers[idx] : null);
	}

	private _onMapZoomEndForCustZooms(event:any) {
		this._processMapZoomEnd(event.target);
	}

	private _processMapZoomEnd(map: any) {
		let secInfo:any = (<any>map)._secInfo;
		if (secInfo) {
			let custZoomLayers:any = secInfo.CustZoomLayers;
			//let legend = secInfo.LegendControl;
			//if (legend === null)
				//return;
			let curZoom = map.getZoom();
			if (custZoomLayers) {
				for (let id in custZoomLayers) {
					let layer = custZoomLayers[id];
					if (!layer._imgLoaded || (layer._imgLoaded && layer._imgLoaded === true)) {
						//if (legend.getLayerDisplayState(layerInfo.Layer._securityInfo.MapSrcDef.ID) === 'on') {
							if (curZoom >= layer._secInfo.CustMinZoom && curZoom <= layer._secInfo.CustMaxZoom) {
								layer.setOpacity(layer._secInfo.MapLayer.Opacity);
							}
							else {
								layer.setOpacity(0);
							}
						//}
					}
				}
			}
		}

	}

}