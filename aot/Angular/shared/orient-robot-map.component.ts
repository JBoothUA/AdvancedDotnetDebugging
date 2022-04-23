import { Component, Input, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { MapService } from '../map/map.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { MapUtilityService } from '../map/map-utility.service';
import { MapCreateOptions } from './map-settings.class';

@Component({
	selector: 'orient-robot-map',
	templateUrl: 'orient-robot-map.component.html',
	styleUrls: ['orient-robot-map.component.css'],
	// Provide MapService and PlatformMapService so that we have a new instance of them
	providers: [MapService, PlatformMapService, MapUtilityService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrientRobotMap {
	@Input() dataItems: any[];
	@Input() orientationValue: string;
	@Input() zoom: number = 16;
	@Input() zoomControl: boolean = false;
	@Input() scrollWheelZoom: string | boolean = 'center';
	@Input() dragging: boolean = false;
	@Input() showAttribution: boolean = false;

	public orientMapId: string;
	protected ngUnsubscribe: Subject<void> = new Subject<void>();
	public map: L.Map;
	private markerGroup: L.FeatureGroup;

	constructor(private mapService: MapService, private zone: NgZone, private mapUtilityService: MapUtilityService) {
		this.orientMapId = 'orient-robot-map-' + this.createGUID();
	}

	ngAfterViewInit() {

		let mapOptions = new MapCreateOptions();
		mapOptions.AttributionControl = this.showAttribution;
		mapOptions.ZoomControl = this.zoomControl;
		mapOptions.ScrollWheelZoom = this.scrollWheelZoom;
		mapOptions.Dragging = this.dragging;
		mapOptions.Keyboard = this.dragging;
		mapOptions.DoubleClickZoom = false;
		mapOptions.MinZoom = 4;
		mapOptions.MaxZoom = 28;

		if (this.dataItems && this.dataItems.length === 1) {
			let coords = this.getPositionCoords(this.dataItems[0].Position);
			let center: L.LatLng = L.latLng([coords[1], coords[0]]);
			mapOptions.Center = center;
			mapOptions.Zoom = this.zoom;
		}

		this.map = this.mapUtilityService.createMap(this.orientMapId, mapOptions, (() => { this.finishMapSetup(this.map); }));
	}

	finishMapSetup(map: L.Map) {

		this.markerGroup = L.featureGroup();
		map.addLayer(this.markerGroup);
		this.setMaps(map);

		if (this.dataItems) {
			for (let ii = 0; ii < this.dataItems.length; ii++) {
				let dataItem = this.dataItems[ii];
				let id = this.getMarkerId(ii);
				let orientValue = this.orientationValue && this.orientationValue !== '' ? this.orientationValue : '0';
				let coords = this.getPositionCoords(dataItem.Position);
				let pt: L.LatLng = L.latLng([coords[1], coords[0]]);
				let html: string = '<div id="' + id + '" class="orientationMarker" style="transform:rotate(' + orientValue + 'deg)"></div>';
				let iconOptions: L.DivIconOptions = { html: html, iconSize: [25, 25] };
				let icon: L.DivIcon = L.divIcon(iconOptions);
				let markerOptions: L.MarkerOptions = { icon: icon, interactive: false };
				let marker: L.Marker = L.marker(pt, markerOptions);

				if (marker) {
					this.markerGroup.addLayer(marker);
				}
			}
			if (this.dataItems.length === 1) {
				this.setZoomCenter();
			}
			else {
				this.fitBoundsFromData();
			}
		}
	}

	ngOnDestroy(): void {
		this.mapService.destroyMap();
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	setMaps(map: L.Map): void {
		this.mapService.setMap(map);
	}

	setZoomCenter() {
		if (this.dataItems && this.dataItems.length === 1) {
			let coords = this.getPositionCoords(this.dataItems[0].Position);
			let center: L.LatLng = L.latLng([coords[1], coords[0]]);
			this.mapService.map.setView(center,this.zoom);
		}
	}

	public fitBoundsFromData() {
		if (this.dataItems && this.dataItems.length > 1) {
			let pts: L.LatLng[] = [];
			for (let ii = 0; ii < this.dataItems.length; ii++) {
				let coords = this.getPositionCoords(this.dataItems[ii].Position);
				pts.push(L.latLng([coords[1], coords[0]]));
			}
			let bnds = L.latLngBounds(pts).pad(0.25);
			this.mapService.map.fitBounds(bnds);
		}
	}

	public updateDataItems(dataItems: any) {
		this.markerGroup.clearLayers();
		this.dataItems = dataItems;
		if (this.dataItems) {
			for (let ii = 0; ii < this.dataItems.length; ii++) {
				let dataItem = this.dataItems[ii];
				let id = this.getMarkerId(ii);
				let orientValue = this.orientationValue && this.orientationValue !== '' ? this.orientationValue : '0';
				let coords = this.getPositionCoords(dataItem.Position);
				let pt: L.LatLng = L.latLng([coords[1], coords[0]]);
				let html: string = '<div id="' + id + '" class="orientationMarker" style="transform:rotate(' + orientValue + 'deg)"></div>';
				let iconOptions: L.DivIconOptions = { html: html, iconSize: [25, 25] };
				let icon: L.DivIcon = L.divIcon(iconOptions);
				let markerOptions: L.MarkerOptions = { icon: icon, interactive: false };
				let marker: L.Marker = L.marker(pt, markerOptions);

				if (marker) {
					this.markerGroup.addLayer(marker);
				}
			}

			if (this.dataItems.length === 1) {
				this.setZoomCenter();
			}
			else {
				this.fitBoundsFromData();
			}
		}

	}

	public getPositionCoords(position: any): number[] {
		let coords: number[] = [];
		if (position.Coordinates) {
			coords.push(position.Coordinates[0]);
			coords.push(position.Coordinates[1]);
		}
		else if (position.coordinates) {
			coords.push(position.coordinates[0]);
			coords.push(position.coordinates[1]);
		}
		return (coords);
	}

	public getZoomForBounds(bnds: L.LatLngBounds): number {
		let zoom = this.mapService.map.getBoundsZoom(bnds);
		return zoom;
	}

	public setOrientationValue(orientationValue: string) {
		if (orientationValue && orientationValue !== '') {
			for (let ii = 0; this.dataItems && (ii < this.dataItems.length); ii++) {
				let id = this.getMarkerId(ii);

				let newRotate: string = 'rotate(' + orientationValue + 'deg)';
				let $elem = $('#' + id);
				if ($elem.length > 0) {
					$elem.css('transform', newRotate);
				}
			}
		}
	}

	getMarkerId(index: number): string {
		if (!this.dataItems || !this.dataItems.length) {
			return;
		}

		if (this.dataItems[index].PointId) {
			return ('om-' + this.dataItems[index].PointId + '-' + this.orientMapId);
		} else {
			return ('om-' + this.dataItems[index].id + '-' + this.orientMapId);
		}
	}

	private createGUID() {
		let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			let cryptoObj = window.crypto;
			let r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});

		return (guid);
	}
}