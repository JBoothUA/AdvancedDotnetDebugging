import { Injectable, NgZone } from '@angular/core';
import { Position } from '../shared/shared-interfaces';
import { Tenant } from '../shared/tenant.class';
import { Location } from '../shared/location.class';
import { HttpService } from '../shared/http.service';
import { MapLayer, LayerFormat } from '../shared/map-layer.class';
import { PlatformImageProperties, MapControlPositions, MapCreateOptions } from '../shared/map-settings.class';
import { LocationFilterService } from '../shared/location-filter.service';
import { MapUtilityService } from '../map/map-utility.service';
import { Platform } from '../platforms/platform.class';

@Injectable()
export class AdminService {
	private map: L.Map;
	private leafletLayers: any[];
	private radToDegrees = 180 / Math.PI;
	private degreesToRad = Math.PI / 180;
	private userTenant: Tenant;
	private childTenants: Tenant[];
	private mapUtilityService: MapUtilityService;

	constructor(
		private httpService: HttpService,
		private ngZone: NgZone,
		private locFilterService: LocationFilterService) {
		this.leafletLayers = [];
	}

	public setMapInfo(map: L.Map, mapUtilServ: MapUtilityService) {
		this.map = map;
		this.mapUtilityService = mapUtilServ;
	}

	public getMapUtilityService(): MapUtilityService {
		return (this.mapUtilityService);
	}

	public formatLatLng(latLng: L.LatLng): string {
		let tempLat: string = latLng.lat.toLocaleString(undefined, { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 7 });
		let tempLng: string = latLng.lng.toLocaleString(undefined, { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 7 });
		let temp: string = tempLat + this.getListSeparator() + ' ' + tempLng;
		return (temp);
	}

	public formatPosition(position: Position): string {
		let tempLat: string = position.Coordinates[1].toLocaleString(undefined, { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 7 });
		let tempLng: string = position.Coordinates[0].toLocaleString(undefined, { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 7 });
		let temp: string = tempLat + this.getListSeparator() + ' ' + tempLng;
		return (temp);
	}

	public getListSeparator(): string {
		let list = ['a', 'b'];
		let listSeparator = list.toLocaleString().substring(1, 2);

		return (listSeparator);
	}

	public calculateImageAnchorsFromMap(mapLayer: MapLayer): any {
		let pixelBnds: L.Bounds = this.map.getPixelBounds();
		let curZoom: number = this.map.getZoom();
		let mapSize: L.Point = this.map.getSize();
		let scaledMapSize: L.Point = mapSize.divideBy(2);

		if (!mapLayer.ImageSize || mapLayer.ImageSize.length === 0) {
			mapLayer.ImageSize = [scaledMapSize.x, scaledMapSize.y];
		}

		let scaledImageSize: number[];
		let imageSize = mapLayer.ImageSize;
		if (imageSize && imageSize.length > 0) {
			let mapRatio = scaledMapSize.x / scaledMapSize.y;
			let imageRatio = imageSize[0] / imageSize[1];
			scaledImageSize = mapRatio > imageRatio ? [imageSize[0] * scaledMapSize.y / imageSize[1], scaledMapSize.y] : [scaledMapSize.x, imageSize[1] * scaledMapSize.x / imageSize[0]];
		}

		let size: L.Point;
		if (scaledImageSize) {
			size = L.point(scaledImageSize[0], scaledImageSize[1]);
		}
		else {
			size = scaledMapSize;
		}

		let center: L.Point = pixelBnds.getCenter();
		let sw: L.Point;
		let ne: L.Point;
		mapLayer.ImageProperties = new PlatformImageProperties(null);
		sw = L.point(center.x - (size.x/2), center.y + (size.y/2));
		ne = L.point(center.x + (size.x/2), center.y - (size.y/2));
		let swLL: L.LatLng = this.map.unproject(sw, curZoom);
		let neLL: L.LatLng = this.map.unproject(ne, curZoom);

		let anchors: Position[] = [];
		anchors.push({ Coordinates: [swLL.lng, neLL.lat], Type: 'Point' });
		anchors.push({ Coordinates: [neLL.lng, neLL.lat], Type: 'Point' });
		anchors.push({ Coordinates: [neLL.lng, swLL.lat], Type: 'Point' });
		anchors.push({ Coordinates: [swLL.lng, swLL.lat], Type: 'Point' });

		mapLayer.MapOrigin = { Coordinates: [(swLL.lng + neLL.lng) / 2, (swLL.lat, neLL.lat) / 2], Type: 'Point' };
 
		return (anchors);
	}

	public calculatePlatformImageAnchors(mapLayer: MapLayer): any {
		let anchors: Position[];

		if (mapLayer.MapOrigin === null || (mapLayer.ImageProperties.Origin[0] === 0 && mapLayer.ImageProperties.Origin[1] === 0)) {
			return null;
		}

		let x = mapLayer.ImageProperties.Origin[0];
		let y = mapLayer.ImageProperties.Origin[1];
		let dist: any = {};
		dist.X = Math.abs(x);
		dist.Y = Math.abs(y);
		dist.Hypotenuse = Math.sqrt(x * x + y * y);

		let platOrigin: L.LatLng = this.mapUtilityService.convertPositionToLatLng(mapLayer.MapOrigin);

		let anchorsLL = this.getImageAnchorsByRotationDist(platOrigin, mapLayer.Rotation, dist);
		anchors = this.mapUtilityService.convertAnchorsLatLngToPosition(anchorsLL);

		return (anchors);
	}

	public getImageAnchorsByRotationDist(platformOrigin: L.LatLng, rotation: number, dist: any): L.LatLng[] {
		let imageCorners = this.getImageCornerLatLngs(platformOrigin, rotation, dist);
		let anchorsLL = [];

		anchorsLL.push(L.latLng(this.convertToDecDegrees(imageCorners.UpperLeft.lat), this.convertToDecDegrees(imageCorners.UpperLeft.lng)));
		anchorsLL.push(L.latLng(this.convertToDecDegrees(imageCorners.UpperRight.lat), this.convertToDecDegrees(imageCorners.UpperRight.lng)));
		anchorsLL.push(L.latLng(this.convertToDecDegrees(imageCorners.LowerRight.lat), this.convertToDecDegrees(imageCorners.LowerRight.lng)));
		anchorsLL.push(L.latLng(this.convertToDecDegrees(imageCorners.LowerLeft.lat), this.convertToDecDegrees(imageCorners.LowerLeft.lng)));

		return anchorsLL;

	}

	public getImageCornerLatLngs(platformOrigin: L.LatLng, rotation: number, dist: any): any {
		let imageCorners = {};
		let platOriginRad = this.convertLatLngToRadians(platformOrigin);
		let rotationRad = this.convertToRadians(rotation);

		let angle = Math.acos(dist.X / dist.Hypotenuse);
		imageCorners["UpperLeft"] = this.calcLatLngFromBearingDistance(platOriginRad, -angle - rotationRad, dist.Hypotenuse);
		imageCorners["UpperRight"] = this.calcLatLngFromBearingDistance(platOriginRad, angle - rotationRad, dist.Hypotenuse);

		angle = Math.acos(dist.Y / dist.Hypotenuse);
		imageCorners["LowerLeft"] = this.calcLatLngFromBearingDistance(platOriginRad, -(angle + (Math.PI / 2)) - rotationRad, dist.Hypotenuse);
		imageCorners["LowerRight"] = this.calcLatLngFromBearingDistance(platOriginRad, (angle + (Math.PI / 2)) - rotationRad, dist.Hypotenuse);

		return imageCorners;
	}

	public calcLatLngFromBearingDistance(startPt: L.LatLng, bearing: number, dist: number) {
		let R = 6371000;   // Earth radius in meters
		let dOverR = dist / R;
		let startLat = startPt.lat;
		let startLng = startPt.lng;

		let newLat = Math.asin(Math.sin(startLat) * Math.cos(dOverR) +
			Math.cos(startLat) * Math.sin(dOverR) * Math.cos(bearing));
		let newLng = startLng + Math.atan2(Math.sin(bearing) * Math.sin(dOverR) * Math.cos(startLat),
			Math.cos(dOverR) - Math.sin(startLat) * Math.sin(newLat));

		let newLatLng = L.latLng(newLat, newLng);
		return (newLatLng);
	}
	public rotateImageAnchors(anchors: L.LatLng[], center: L.LatLng, angle: number): any {

		anchors[0] = this.rotateLatLng(anchors[0], center, angle);
		anchors[1] = this.rotateLatLng(anchors[1], center, angle);
		anchors[2] = this.rotateLatLng(anchors[2], center, angle);
		anchors[3] = this.rotateLatLng(anchors[3], center, angle);

		return (anchors);
	}

	public rotateLatLng(latLng: L.LatLng, center: L.LatLng, angle: number): L.LatLng {
		// cx, cy - center of square coordinates
		// x, y - coordinates of a corner point of the square
		// theta is the angle of rotation
		let newLatLng: L.LatLng;
		let theta = this.convertToRadians(angle);
		let curZoom = this.map.getZoom();
		let centerPt:L.Point = this.map.project(center, curZoom);
		let pt:L.Point = this.map.project(latLng, curZoom);
		// translate point to origin
		let tempX:number = pt.x - centerPt.x;
		let tempY:number = pt.y - centerPt.y;

		// now apply rotation
		let rotatedX:number = tempX * Math.cos(theta) - tempY * Math.sin(theta);
		let rotatedY:number = tempX * Math.sin(theta) + tempY * Math.cos(theta);

		// translate back
		pt.x = rotatedX + centerPt.x;
		pt.y = rotatedY + centerPt.y;
		newLatLng = this.map.unproject(pt, curZoom);
		return (newLatLng);

	}

	public calculateNewCornerPts(newLatLng: L.LatLng, anchors: L.LatLng[], idx: number, maintainAspect: boolean): L.LatLng[] {
		let newAnchors: L.LatLng[] = [];
		let anchorPts: L.Point[] = [];
		let newCornerPt: L.Point;

		let pt1: L.Point = this.map.latLngToLayerPoint(anchors[0]);
		let pt2: L.Point = this.map.latLngToLayerPoint(anchors[1]);
		let pt3: L.Point = this.map.latLngToLayerPoint(anchors[2]);
		let pt4: L.Point = this.map.latLngToLayerPoint(anchors[3]);
		let newPt: L.Point = this.map.latLngToLayerPoint(newLatLng);
		if (maintainAspect) {
			let centerPt: L.Point = L.point((pt1.x + pt3.x) / 2, (pt1.y + pt3.y) / 2);
			let anchorPt: L.Point = this.map.latLngToLayerPoint(anchors[idx]);
			let dist1 = anchorPt.distanceTo(centerPt);
			let dist2 = newPt.distanceTo(centerPt);
			let scale = dist2 / dist1;

			for (let point of anchors) {
				let tempPt = this.map.latLngToLayerPoint(point);
				let x1: number = (tempPt.x - centerPt.x) * scale + centerPt.x;
				let y1: number = (tempPt.y - centerPt.y) * scale + centerPt.y;
				let scaledPt = L.point(x1, y1); 
				newAnchors.push(this.map.layerPointToLatLng(scaledPt));
			}
		}
		else {

			switch (idx) {
				case 0: {
					newAnchors.push(L.latLng([newLatLng.lat, newLatLng.lng]));

					newCornerPt = this.calculatePerpendicularIntersectPt(pt2, pt3, newPt);
					newAnchors.push(this.map.layerPointToLatLng(newCornerPt));

					newAnchors.push(L.latLng(anchors[2].lat, anchors[2].lng));

					newCornerPt = this.calculatePerpendicularIntersectPt(pt3, pt4, newPt);
					newAnchors.push(this.map.layerPointToLatLng(newCornerPt));
					break;
				}
				case 1: {
					newCornerPt = this.calculatePerpendicularIntersectPt(pt4, pt1, newPt);
					newAnchors.push(this.map.layerPointToLatLng(newCornerPt));

					newAnchors.push(L.latLng([newLatLng.lat, newLatLng.lng]));

					newCornerPt = this.calculatePerpendicularIntersectPt(pt3, pt4, newPt);
					newAnchors.push(this.map.layerPointToLatLng(newCornerPt));

					newAnchors.push(L.latLng(anchors[3].lat, anchors[3].lng));

					break;
				}
				case 2: {
					newAnchors.push(L.latLng(anchors[0].lat, anchors[0].lng));

					newCornerPt = this.calculatePerpendicularIntersectPt(pt1, pt2, newPt);
					newAnchors.push(this.map.layerPointToLatLng(newCornerPt));

					newAnchors.push(L.latLng([newLatLng.lat, newLatLng.lng]));

					newCornerPt = this.calculatePerpendicularIntersectPt(pt4, pt1, newPt);
					newAnchors.push(this.map.layerPointToLatLng(newCornerPt));

					break;
				}
				case 3: {
					newCornerPt = this.calculatePerpendicularIntersectPt(pt1, pt2, newPt);
					newAnchors.push(this.map.layerPointToLatLng(newCornerPt));

					newAnchors.push(L.latLng(anchors[1].lat, anchors[1].lng));

					newCornerPt = this.calculatePerpendicularIntersectPt(pt2, pt3, newPt);
					newAnchors.push(this.map.layerPointToLatLng(newCornerPt));

					newAnchors.push(L.latLng([newLatLng.lat, newLatLng.lng]));

					break;
				}
			}
		}

		return (newAnchors);
	}

	public calculateAngleBetween2Lines(seg1Pt1: L.Point, seg1Pt2: L.Point, seg2Pt1: L.Point, seg2Pt2: L.Point) {
		let angle1:number = Math.atan2(seg1Pt1.y - seg1Pt2.y, seg1Pt1.x - seg1Pt2.x);
		let angle2:number = Math.atan2(seg2Pt1.y - seg2Pt2.y, seg2Pt1.x - seg2Pt2.x);
		return angle1 - angle2;
	}

	public calculatePerpendicularIntersectPt(segPt1: L.Point, segPt2: L.Point, pt: L.Point):L.Point {
		let k: number = ((segPt2.y - segPt1.y) * (pt.x - segPt1.x) - (segPt2.x - segPt1.x) *
			(pt.y - segPt1.y)) / (Math.pow((segPt2.y - segPt1.y), 2) + Math.pow((segPt2.x - segPt1.x), 2));

		let x4 = pt.x - k * (segPt2.y - segPt1.y);
		let y4 = pt.y + k * (segPt2.x - segPt1.x);
		let perpIntPt = L.point(x4, y4);
		return (perpIntPt);
	}

	public convertToRadians(decDegs: number): number {
		let rads = isNaN(decDegs) === true ? 0.0 : decDegs * this.degreesToRad;
		return rads;

	}

	public convertLatLngToRadians(latLng: L.LatLng): L.LatLng {
		return (L.latLng([this.convertToRadians(latLng.lat), this.convertToRadians(latLng.lng)]));
	}

	public convertToDecDegrees(rad: number): number {
		let decDegrees = isNaN(rad) === true ? 0.0 : rad * this.radToDegrees;
		return decDegrees;
	}

	public convertLatLngToDecDegrees(latLng: L.LatLng): L.LatLng {
		return (L.latLng([this.convertToDecDegrees(latLng.lat), this.convertToDecDegrees(latLng.lng)]));
	}

	public pointOnLine(start: L.Point, final: L.Point, distPx: number) {
		if (start.x === final.x && start.y === final.y) {
			return (L.point(start.x, start.y));
		}

		let ratio = 1 + distPx / start.distanceTo(final);
		return new L.Point(
			start.x + (final.x - start.x) * ratio,
			start.y + (final.y - start.y) * ratio
		);
	}
	public createWMSCapabilitiesModel_1_3_0(jsonObj: any): any {
		//convert the string into a xml doc object
		let wmsCapabilities: any = {};
		let layerId;
		let crsToken: string;
		let layerInfo: any = {};
		let layerDef: any;

		if (typeof jsonObj.WMS_Capabilities !== 'undefined') {
			if (typeof jsonObj.WMS_Capabilities['@version'] !== 'undefined') {
				wmsCapabilities.Version = jsonObj.WMS_Capabilities['@version'];
				if (wmsCapabilities.Version === '1.3.0') {
					crsToken = 'CRS';
				}
				else if (wmsCapabilities['Version'] === '1.1.1') {
					crsToken = 'SRS';
				}
			}

			if (typeof jsonObj.WMS_Capabilities.Capability !== 'undefined') {
				if (jsonObj.WMS_Capabilities.Capability.Request !== 'undefined') {
					if (jsonObj.WMS_Capabilities.Capability.Request.GetMap !== 'undefined') {
						if (jsonObj.WMS_Capabilities.Capability.Request.GetMap.Format !== 'undefined') {
							let formats = jsonObj.WMS_Capabilities.Capability.Request.GetMap.Format;
							if (!(formats.length > 0)) {
								let tempDef = formats;
								formats = [];
								formats.push(tempDef);
							}
							wmsCapabilities.Formats = [];
							for (let ii in formats) {
								let formatDef = formats[ii];
								wmsCapabilities.Formats.push(formatDef);
							}
						}
					}
				}

				if (typeof jsonObj.WMS_Capabilities.Capability.Layer !== 'undefined') {
					wmsCapabilities.Layers = [];
					if (!(jsonObj.WMS_Capabilities.Capability.Layer.length > 0)) {
						var tempDef = jsonObj.WMS_Capabilities.Capability.Layer;
						jsonObj.WMS_Capabilities.Capability.Layer = [];
						jsonObj.WMS_Capabilities.Capability.Layer.push(tempDef);
					}

					for (let ii in jsonObj.WMS_Capabilities.Capability.Layer) {
						layerDef = jsonObj.WMS_Capabilities.Capability.Layer[ii];

						layerInfo.Title = layerDef.Title;
						if (typeof layerDef.Name !== 'undefined') {
							layerInfo.Name = layerDef.Name;
							layerId = layerInfo.Name;
						}
						else
							layerId = layerInfo.Title;

						if (typeof layerDef.Abstract !== 'undefined')
							layerInfo.Abstract = layerDef.Abstract;
						if (typeof layerDef.EX_GeographicBoundingBox !== 'undefined') {
							var exBBox:any = {};
							exBBox.WestBoundLongitude = layerDef.EX_GeographicBoundingBox.westBoundLongitude;
							exBBox.EastBoundLongitude = layerDef.EX_GeographicBoundingBox.eastBoundLongitude;
							exBBox.SouthBoundLatitude = layerDef.EX_GeographicBoundingBox.southBoundLatitude;
							exBBox.NorthBoundLatitude = layerDef.EX_GeographicBoundingBox.northBoundLatitude;
							layerInfo.EX_GeographicBoundingBox = exBBox;
						}

						if (typeof layerDef.Title !== 'undefined') {
								layerInfo.Title = layerDef.Title;
						}

						if (typeof layerDef.BoundingBox !== 'undefined') {
							if (!(layerDef.BoundingBox.length > 0)) {
								let tempDef = layerDef.BoundingBox;
								layerDef.BoundingBox = [];
								layerDef.BoundingBox.push(tempDef);
							}
							layerInfo.BoundingBox = [];
							for (let bboxDef of layerDef.BoundingBox) {
								let bbox: any = {};
								if (typeof bboxDef['@' + crsToken] !== 'undefined') {
									bbox[crsToken] = bboxDef['@' + crsToken];
									bbox.MinX = bboxDef['@minx'];
									bbox.MinY = bboxDef['@miny'];
									bbox.MaxX = bboxDef['@maxx'];
									bbox.MaxY = bboxDef['@maxy'];
								}
								layerInfo.BoundingBox.push(bbox);

							}
						}

						if (typeof layerDef[crsToken] !== 'undefined') {
							if (!(layerDef.CRS.length > 0)) {
								let tempDef = layerDef[crsToken];
								layerDef[crsToken] = [];
								layerDef[crsToken].push(tempDef);
							}
							layerInfo.CRS = [];
							for (let crsDef of layerDef[crsToken]) {
								layerInfo.CRS.push(crsDef);
							}
						}
					}

					if (typeof layerDef.Layer !== 'undefined') {
						if (!(layerDef.Layer.length > 0)) {
							let tempDef = layerDef.Layer.Layer;
							layerDef.Layer.Layer = [];
							layerDef.Layer.push(tempDef);
						}

						layerInfo.Layers = [];

						for (let subLayerDef of layerDef.Layer) {
							let subLayerInfo: any = {};
							if (typeof (subLayerDef.Title) !== 'undefined') {
								subLayerInfo.Title = subLayerDef.Title;
							}
							if (typeof (subLayerDef.Name) !== 'undefined') {
								subLayerInfo.Name = subLayerDef.Name;
							}

							if (typeof (subLayerDef.Abstract) !== 'undefined') {
								subLayerInfo.Abstract = subLayerDef.Abstract;
							}
							if (typeof (subLayerDef.EX_GeographicBoundingBox) !== 'undefined') {
								let exBBox:any = {};
								exBBox.WestBoundLongitude = subLayerDef.EX_GeographicBoundingBox.westBoundLongitude;
								exBBox.EastBoundLongitude = subLayerDef.EX_GeographicBoundingBox.eastBoundLongitude;
								exBBox.SouthBoundLatitude = subLayerDef.EX_GeographicBoundingBox.southBoundLatitude;
								exBBox.NorthBoundLatitude = subLayerDef.EX_GeographicBoundingBox.northBoundLatitude;
								subLayerInfo.EX_GeographicBoundingBox = exBBox;
							}

							if (typeof (subLayerDef.BoundingBox) !== 'undefined') {
								if (!(subLayerDef.BoundingBox.length > 0)) {
									let tempDef = subLayerDef.BoundingBox;
									subLayerDef.BoundingBox = [];
									subLayerDef.BoundingBox.push(tempDef);
								}

								subLayerInfo.BoundingBox = [];
								for (let bboxDef of subLayerDef.BoundingBox) {
									let bbox: any = {};
									if (typeof bboxDef['@' + crsToken] !== 'undefined') {
										bbox[crsToken] = bboxDef['@' + crsToken];
										bbox.MinX = bboxDef['@minx'];
										bbox.MinY = bboxDef['@miny'];
										bbox.MaxX = bboxDef['@maxx'];
										bbox.MaxY = bboxDef['@maxy'];
									}
									subLayerInfo.BoundingBox.push(bbox);

								}
							}

							if (typeof (subLayerDef[crsToken]) !== 'undefined') {
								if (!(subLayerDef[crsToken].length > 0)) {
									let tempDef = subLayerDef[crsToken];
									subLayerDef[crsToken] = [];
									subLayerDef[crsToken].push(tempDef);
								}
								subLayerInfo.CRS = [];
								for (let crsDef of subLayerDef[crsToken]) {
									subLayerInfo.CRS.push(crsDef);
								}
							}
							subLayerInfo.ParentLayerID = layerId;
							layerInfo.Layers.push(subLayerInfo);
						}
						layerInfo.ParentLayerID = null;
						wmsCapabilities.Layers.push(layerInfo);
					}
				}
			}
			//Return the corrected json object
		}
		return wmsCapabilities;
	}

	public saveTenant(tenant: Tenant) {
		let url = '/tenants/save';
		this.displayLoadingScreen('Saving map settings information');
		this.httpService.post(url, tenant).then((data: any) => {
			if (data) {
				setTimeout(() => {
					this.removeLoadingScreen();
				}, 800);
			};
		});
	}

	public savePlatforms(platforms: Platform[]) {
		let url = '/platforms/platforms';
		this.displayLoadingScreen('Saving platform map information');

		for (let platform of platforms) {
			this.httpService.put(url, platform).then((data: any) => {
				if (data) {
					console.log("New map saved on platform");
				};
			});
		}
		setTimeout(() => {
			this.removeLoadingScreen();
		}, 800);
	}


	public displayLoadingScreen(message:string) {
		let loading = '<div id="loadingScreen" style="display:none;">' +
			'<i style="position:relative;font-size:20pt; top:27px;left:0;" class="fa-li fa fa-spinner fa-spin"></i>' +
			'<span style="font-weight:bold;position:absolute;top:25px;">' + message + '</span>' +
			'</div>';
		$("body").append('<div class="slide-in-menu-modal loadingModal"></div>');
		$("body").append(loading);

		$("#loadingScreen").fadeIn();
	}

	public removeLoadingScreen() {
		$("#loadingScreen").fadeOut("400");
		$("#loadingScreen").remove();
		$(".loadingModal").remove();
	}
}