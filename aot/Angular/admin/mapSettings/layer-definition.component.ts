import {
	Component,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
	NgZone,
	Input,
	Output,
	ElementRef,
	SimpleChange,
	ViewChild,
	EventEmitter,
	OnInit,
	trigger,
	state,
	style,
	transition,
	animate
} from '@angular/core';

import { HttpService } from '../../shared/http.service';
import { Tenant } from '../../shared/tenant.class';
import { ImageInfo, PlatformImageInfo, PlatformImageProperties } from '../../shared/map-settings.class';
import { Location } from '../../shared/location.class';
import { Modal } from '../../shared/modal.component';
import { Image } from '../../shared/shared-interfaces';
import { MapLayer, LayerFormat, LayerOption} from '../../shared/map-layer.class';
import { Slider } from 'primeng/components/slider/slider';
import { SelectItem } from 'primeng/components/common/selectitem';
import { AdminService } from '../admin.service';
import { UploadDialog } from '../upload-dialog.component';
import { MapUtilityService } from '../../map/map-utility.service';

import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

@Component({
	selector: 'layer-definition',
	templateUrl: 'layer-definition.component.html',
	styleUrls: ['layer-definition.component.css', '../../shared/primeng-slider.css'],
	animations: [
		trigger('slideOut', [
			state('in', style({
				display: 'none',
				left: '-408px'
			})),
			state('out', style({
				left: '*'
			})),
			transition('in <=> out', animate('400ms ease-in-out'))
		])],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class LayerDefinition implements OnInit {
	@Input() location: Location;
	@Input() tenant: Tenant;
	@Output() onDialogClose: EventEmitter<number> = new EventEmitter<number>();
	@Output() onEnableSave: EventEmitter<boolean> = new EventEmitter<boolean>();

	//@ViewChild(Slider) opacitySlider: Slider;
	@ViewChild(UploadDialog) uploadDialog: UploadDialog;
	@ViewChild(Modal) errorDialog: Modal;

	public mapLayer: MapLayer;
	private tempLayer: MapLayer = new MapLayer(null);
	private saveLayer: MapLayer;
	public availImages: ImageInfo[];   // LocationMapSettings or TenantMapSettings
	public availPlatformImages: PlatformImageInfo[];
	public map: L.Map;
	public newLayer: boolean = true;
	public newLeafletLayer: boolean = false;
	public editLayerName: boolean = false;

	private layerFormats: SelectItem[] = [];
	public wmsLayers: SelectItem[] = [];
	private images: SelectItem[] = [];

	public selectedWMSLayers: string[] = [];
	public opacityRange: number[] = [0,100];
	public opacityStr: string = '100%';
	public selectedImage: any;

	private leafletLayer: any;
	private polygon: L.Polygon;
	private rotateLine: L.Polyline;
	private rotateMarker: L.Marker;
	private rotateStartPt: L.Point;
	private rotateStartAngle: number;
	private rotateOriginPt: L.Point;
	private isRotatingPolygon: boolean = false;
	private layerRotation: number;

	private imageCenter: L.LatLng;

	private anchorsLL: L.LatLng[];
	private saveAnchorsLL: L.LatLng[];
	private polygonOptions: L.PolylineOptions;
	private markers: L.Marker[];
	private polygonGroup: L.FeatureGroup;
	private polygonElem: any;
	private isDraggingPolygon: boolean = false;
	private moveStartPt: L.LatLng;

	private currentMarkerIndex: number;

	private fitOptions: L.FitBoundsOptions;

	private wmsModel: any;

	public isShown: boolean = false;
	private canSave: boolean = false;
	public showLower: boolean = false;

	public errorMessage: string;
	public warningIcon: string = '../../Content/Images/warning.png';

	private mapUtilityService: MapUtilityService;

	private ngUnsubscribe: Subject<void> = new Subject<void>();

	LayerFormat: typeof LayerFormat = LayerFormat;

	constructor(
		private changeRef: ChangeDetectorRef,
		private ngZone: NgZone,
		private adminService: AdminService,
		private httpService: HttpService) {


		this.polygonOptions = { className:'ms-polygonStyles', interactive: true, dashArray: '5, 5', fillColor: '#e3f0f6', fillOpacity: .3 };
		this.polygonGroup = L.featureGroup();
		this.markers = [];

		this.fitOptions = { padding: [2, 2] };
	}

	ngOnInit() {
		if (this.mapLayer) {
			this.newLayer = false;
		}
		else {
			this.newLayer = true;
			this.mapLayer = new MapLayer(null);
		}

		if (this.location) {
			this.availImages = this.location.MapSettings.AvailableImages;
			this.availPlatformImages = this.location.MapSettings.AvailablePlatformImages;
		}
		else if (this.tenant) {
			this.availImages = this.tenant.MapSettings.AvailableImages;
		}
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
	public checkCanSave() {

		let temp = this.showLower;
		this.showLower = this.showLowerSection();
		if (temp !== this.showLower) {
			this.changeRef.detectChanges();
		}

		let canSave: boolean = this.validateLayerDef();

		if (canSave !== this.canSave)
			this.onEnableSave.emit(canSave);
	}

	public setMapUtilService(mapUtilServ: MapUtilityService) {
		this.mapUtilityService = mapUtilServ;
	}
	private validateLayerDef(): boolean {
		let valid: boolean = false;
		if (this.mapLayer.Name && this.mapLayer.Name.length > 0 && this.mapLayer.URL && this.mapLayer.URL.length > 0) {
			switch (this.mapLayer.LayerFormat) {
				case LayerFormat.PlatformImage:
				case LayerFormat.Image: {
					valid = this.mapLayer.Anchors && this.mapLayer.Anchors.length > 0 ? true : false;
					break;
				}
				case LayerFormat.WMS: {
					valid = this.mapLayer.WMSLayers && this.mapLayer.WMSLayers.length > 0 ? true : false;
					break;
				}
				default:
					valid = true;
			}
		}
		return (valid);
	}
	public setTenantLocation(tenant: Tenant, location: Location) {
		this.tenant = tenant;
		this.location = location;
		if (this.location) {
			this.availImages = this.location.MapSettings.AvailableImages;
			this.availPlatformImages = this.location.MapSettings.AvailablePlatformImages;
		}
		else if (this.tenant) {
			this.availImages = this.tenant.MapSettings.AvailableImages;
		}

		this.layerFormats = [];
		this.layerFormats.push({ label: 'Tile', value: LayerFormat.Tile });
		this.layerFormats.push({ label: 'WMS', value: LayerFormat.WMS });
		this.layerFormats.push({ label: 'Image', value: LayerFormat.Image });
		if (this.location) {
			this.layerFormats.push({ label: 'Robot Map', value: LayerFormat.PlatformImage });
		}
		this.layerFormats.push({ label: 'GeoJSON', value: LayerFormat.GeoJson });
		this.changeRef.detectChanges();
	}

	private getImageLabel(): string {
		let text: string;
		if (this.mapLayer.LayerFormat === LayerFormat.Image) {
			text = 'Image';
		}
		else if (this.mapLayer.LayerFormat === LayerFormat.PlatformImage) {
			text = 'Robot Map';
		}
		return (text);
	}

	public getFormatLabel(): string {

		let temp = this.layerFormats.find((elem) => { return(elem.value === this.mapLayer.LayerFormat) });
		if (temp) {
			return (temp.label);
		}
		else {
			return ('Unknown');
		}
	}

	private getImagePlaceholderText(): string {
		let text: string;
		if (this.mapLayer.LayerFormat === LayerFormat.Image) {
			text = 'Choose image';
		}
		else if (this.mapLayer.LayerFormat === LayerFormat.PlatformImage) {
			text = 'Choose robot map';
		}
		return (text);
	}

	public layerNameInputChanged(event: any) {
		this.mapLayer.Name = event.target.value;
		this.checkCanSave();
	}

	public layerFormatChanged(event: any) {
		this.mapLayer.LayerFormat = event.value;
		this.clearAllLayerMapData();
		this.images = [];
		this.selectedImage = null;
		this.mapLayer.URL = null;
		this.mapLayer.ImageProperties = null;
		this.mapLayer.Rotation = 0;
		this.layerRotation = 0;
		this.mapLayer.Anchors = [];
		this.markers = [];
		this.mapLayer.MapOrigin = null;
		this.mapLayer.Options = [];
		this.mapLayer.WMSLayers = [];
		this.selectedWMSLayers = [];
		this.loadImageListDropdown();
		this.checkCanSave();
		this.changeRef.detectChanges();
	}

	private loadImageListDropdown() {
		let imageList: any[];
		if (this.mapLayer.LayerFormat === LayerFormat.Image) {
			imageList = this.location.MapSettings.AvailableImages;
		}
		else if (this.mapLayer.LayerFormat === LayerFormat.PlatformImage) {
			imageList = this.location.MapSettings.AvailablePlatformImages;
		}
		if (imageList) {
			this.images = [];
			for (let item of imageList) {
				this.images.push({ label: item.Image.Label, value: item });
				if (item.Image.Label === this.mapLayer.ImageName) {
					this.selectedImage = item;
				}
			}
		}
	}

	public layerURLInputChanged(event: any) {
		switch (this.mapLayer.LayerFormat) {
			case LayerFormat.WMS: {
				if (this.mapLayer.URL && this.mapLayer.URL != "") {
					this.getWMSCapabiliites();
				}
				break;
			}
		}

		this.checkCanSave();
	}

	public layerURLDropdownChanged(event: any) {
		switch (this.mapLayer.LayerFormat) {
			case LayerFormat.PlatformImage: {
				this.clearAllLayerMapData(true);
				this.mapLayer.URL = event.value.Image.Uri;
				this.mapLayer.ImageName = event.value.Image.Label;
				this.mapLayer.ImageProperties = event.value.ImageProperties;
				this.mapLayer.ImageSize = event.value.ImageSize ? event.value.ImageSize.slice(0): null;
				this.mapLayer.Anchors = [];
				this.mapLayer.Rotation = 0;
				this.layerRotation = 0;
				this.mapLayer.Opacity = 1;
				//this.mapLayer.Rotation = event.value.Rotation;
				//this.mapLayer.Anchors = event.value.Anchors;
				//this.layerRotation = event.value.Rotation;
				if (event.value.MapOrigin) {
					this.mapLayer.MapOrigin = { Coordinates: [event.value.MapOrigin.Coordinates[0], event.value.MapOrigin.Coordinates[1]], Type: event.value.MapOrigin.Type };
				}

				if (this.mapLayer.Anchors && this.mapLayer.Anchors.length === 4) {
					let mapLayer = this.mapUtilityService.createLayer(this.mapLayer);
					this.mapUtilityService.addLayerToMap(mapLayer);
				}
			}
			case LayerFormat.Image: {
				this.clearAllLayerMapData(true);
				this.mapLayer.URL = event.value.Image.Uri;
				this.mapLayer.ImageName = event.value.Image.Label;
				this.mapLayer.ImageSize = event.value.ImageSize ? event.value.ImageSize.slice(0): null;
				this.mapLayer.Anchors = [];
				this.mapLayer.Rotation = 0;
				this.layerRotation = 0;
				this.mapLayer.Opacity = 1;
				//this.mapLayer.Anchors = event.value.Anchors;
				//this.mapLayer.Rotation = event.value.Rotation;
				//this.layerRotation = event.value.Rotation;
				this.mapLayer.IsConstrainedTo90 = event.value.IsConstainedTo90 ? event.value.IsConstainedTo90: false;
				this.mapLayer.IsMaintainAspect = event.value.IsMaintainAspect ? event.value.IsMaintainAspect: false;
				if (event.value.MapOrigin) {
					this.mapLayer.MapOrigin = { Coordinates: [event.value.MapOrigin.Coordinates[0], event.value.MapOrigin.Coordinates[1]], Type: event.value.MapOrigin.Type };
				}
				if (this.mapLayer.Anchors && this.mapLayer.Anchors.length === 4) {
					let mapLayer = this.mapUtilityService.createLayer(this.mapLayer);
					this.mapUtilityService.addLayerToMap(mapLayer);
				}
				break;
			}
		}
		this.showLower = this.showLowerSection();
		this.checkCanSave();
	}
	public wmsLayerChanged(event: any) {
		this.mapLayer.WMSLayers = [];
		let option: LayerOption;
		if (this.mapLayer.Options) {
			option = this.mapLayer.Options.find((elem) => { return (elem.Name === "layers"); });
			if (!option) {
				option = new LayerOption(null);
				option.Name = 'layers';
				option.Value = "";
				option.Type = 'string';
				this.mapLayer.Options.push(option);
			}
		}
		for (let wmsLayerName of event.value) {
			this.mapLayer.WMSLayers.push(wmsLayerName);
		}
		option.Value = this.mapLayer.getCommaSeparatedWMSLayers();
		if (this.mapUtilityService.isMapLayerValid(this.mapLayer)) {
			if (this.leafletLayer) {
				this.mapUtilityService.removeLayerFromMap(this.mapLayer.Id);
			}

			this.leafletLayer = this.mapUtilityService.createLayer(this.mapLayer);
			this.mapUtilityService.addLayerToMap(this.leafletLayer);
		}
		else if (this.leafletLayer) {
			this.mapUtilityService.removeLayerFromMap(this.mapLayer.Id);
		}
		this.checkCanSave();
	}

	public toggleConstrainedTo90() {
		this.mapLayer.IsConstrainedTo90 = this.mapLayer.IsConstrainedTo90 ? false : true;
		if (this.mapLayer.IsConstrainedTo90) {
			let $elem = $("#layerDef-rotationId");
			if ($elem.length > 0) {
				$elem.val(this.layerRotation);
			}

			this.clearAllLayerMapData(true);
			this.placeImageOnMap();
		}
		else {
			this.mapLayer.Rotation = 0;
			this.layerRotation = 0;
			this.mapLayer.IsMaintainAspect = false;
			if (this.markers) {
				for (let marker of this.markers) {
					marker.dragging.enable();
					this.setMarkerEvents(marker);
				}
			}
			this.removeRotateMarker();
		}

		this.changeRef.detectChanges();
	}

	public toggleMaintainAspect() {
		this.mapLayer.IsMaintainAspect = this.mapLayer.IsMaintainAspect ? false : true;
		if (this.mapLayer.IsMaintainAspect) {
			this.mapLayer.Rotation = 0;
			this.layerRotation = 0;
			let $elem = $("#layerDef-rotationId");
			if ($elem.length > 0) {
				$elem.val(this.layerRotation);
			}

			this.clearAllLayerMapData(true);
			this.placeImageOnMap();
		}
		else {
			if (this.markers) {
				for (let marker of this.markers) {
					marker.dragging.enable();
					this.setMarkerEvents(marker);
				}
			}
		}
		this.changeRef.detectChanges();
	}

	public toggleMinMaxZoomDefined() {
		this.mapLayer.IsMinMaxZoomDefined = this.mapLayer.IsMinMaxZoomDefined ? false : true;
		this.changeRef.detectChanges();
		if (this.mapLayer.IsMinMaxZoomDefined) {
			let $elem = $("#layerDef-minZoomId");
			if ($elem.length > 0) {
				$elem.val(this.mapLayer.MinZoomLevel);
			}
			$elem = $("#layerDef-maxZoomId"); 
			if ($elem.length > 0) {
				$elem.val(this.mapLayer.MaxZoomLevel);
			} 
		}
	}
	public showLowerSection(): boolean {

		let show: boolean = false;
		if (this.mapLayer.LayerFormat === LayerFormat.Image || this.mapLayer.LayerFormat === LayerFormat.PlatformImage) {

			if (this.mapLayer && this.mapLayer.Anchors && this.mapLayer.Anchors.length > 0) {
				show = true;
			}
		}
		else if (this.mapLayer.LayerFormat === LayerFormat.Tile) {
			if (this.mapLayer.URL && this.mapLayer.URL.length > 0) {
				show = true;
			}
		}
		else if (this.mapLayer.LayerFormat === LayerFormat.WMS) {
			if (this.mapLayer.URL && this.mapLayer.URL.length > 0 && 
				this.mapLayer.WMSLayers && this.mapLayer.WMSLayers.length > 0) {
				show = true;
			}
		}
		else {
			show = true;
		}
		return (show);
	}

	public onMaxZoomChanged(event: any) {
		if (this.mapLayer.MaxZoomLevel < this.mapLayer.MinZoomLevel) {
			this.mapLayer.MinZoomLevel = this.mapLayer.MaxZoomLevel;
		}
		this.mapUtilityService.redrawLayers();
	}

	public onMinZoomChanged(event: any) {
		if (this.mapLayer.MinZoomLevel > this.mapLayer.MaxZoomLevel) {
			this.mapLayer.MaxZoomLevel = this.mapLayer.MinZoomLevel;
		}
		this.mapUtilityService.redrawLayers();
	}

	public setMinZoomLevel() {
		let temp = this.getMapZoom();
		if (temp !== this.mapLayer.MinZoomLevel) {
			this.mapLayer.MinZoomLevel = this.getMapZoom();
			$("#layerDef-minZoomId").val(this.mapLayer.MinZoomLevel);
			if (this.mapLayer.MinZoomLevel > this.mapLayer.MaxZoomLevel) {
				this.mapLayer.MaxZoomLevel = this.mapLayer.MinZoomLevel;
				$("#layerDef-maxZoomId").val(this.mapLayer.MaxZoomLevel);
			}
			this.mapUtilityService.redrawLayers();
			this.changeRef.markForCheck();
		}
	}

	public setMaxZoomLevel() {
		let temp = this.getMapZoom();
		if (temp !== this.mapLayer.MaxZoomLevel) {
			this.mapLayer.MaxZoomLevel = this.getMapZoom();
			$("#layerDef-maxZoomId").val(this.mapLayer.MaxZoomLevel);
			if (this.mapLayer.MaxZoomLevel < this.mapLayer.MinZoomLevel) {
				this.mapLayer.MinZoomLevel = this.mapLayer.MaxZoomLevel;
				$("#layerDef-minZoomId").val(this.mapLayer.MinZoomLevel);
			}
			this.changeRef.markForCheck();
			this.mapUtilityService.redrawLayers();
		}
	}

	public getMapZoom(): number {
		let zoom: number;
		if (this.map !== null) {
			zoom = this.map.getZoom();
		}
		return (zoom);
	}

	public onOpacityChange(event: any) {
		this.opacityRange[1] = event.values[1];
		this.mapLayer.Opacity = event.values[1]/100;
		this.opacityStr = this.opacityRange[1].toString() + "%";
		if (this.leafletLayer) {
			this.leafletLayer.setOpacity(this.mapLayer.Opacity);
		}
	}

	public setLayer(mapLayer: MapLayer, newLayer:boolean, map: L.Map) {
		this.isShown = true;
		this.newLeafletLayer = false;
		this.leafletLayer = null;
		this.map = map;
		this.mapLayer = mapLayer;
		this.layerRotation = this.mapLayer.Rotation;
		this.markers = [];
		this.newLayer = newLayer;
		this.saveLayer = new MapLayer(mapLayer);
		
		this.leafletLayer = this.mapUtilityService.getLeafletLayer(mapLayer.Id);
		if (!this.leafletLayer) {
			this.newLeafletLayer = true;
			if (this.validateLayerDef()) {
				this.leafletLayer = this.mapUtilityService.createLayer(mapLayer);
				this.mapUtilityService.addLayerToMap(this.leafletLayer);
			}
		}

		this.map.addLayer(this.polygonGroup);

		this.opacityRange[1] = Math.floor(mapLayer.Opacity * 100);
		this.opacityRange = this.opacityRange.splice(0);
		this.opacityStr = this.opacityRange[1].toString() + "%";

		this.loadImageListDropdown();

		switch (mapLayer.LayerFormat) {
			case LayerFormat.WMS: {
				this.selectedWMSLayers = mapLayer.WMSLayers.slice();
				this.wmsLayers = [];
				if (this.mapLayer.URL && this.mapLayer.URL.length > 0) {
					this.getWMSCapabiliites();
				}

				break;
			}
			case LayerFormat.Image: {
				if (this.mapLayer) {
					if (!this.mapLayer.ImageSize || this.mapLayer.ImageSize.length != 2) {
						for (let imageInfo of this.availImages) {
							if (imageInfo.Image.Label === this.mapLayer.ImageName) {
								this.mapLayer.ImageSize = imageInfo.ImageSize.slice(0);
							}
						}
					}
					if (this.mapLayer.Anchors.length > 0) {
						this.anchorsLL = this.mapUtilityService.convertAnchorsPositionToLatLng(this.mapLayer.Anchors);
						this.placeImagePolygon(this.anchorsLL);
						this.imageCenter = this.mapUtilityService.convertPositionToLatLng(this.mapLayer.MapOrigin);
						this.fitBoundsIfNeeded(this.polygonGroup.getBounds().pad(0.1), true);
					}
				}
				break;
			}
			case LayerFormat.PlatformImage: {
				if (this.mapLayer && this.mapLayer.Anchors.length > 0) {
					this.anchorsLL = this.mapUtilityService.convertAnchorsPositionToLatLng(this.mapLayer.Anchors);
					this.placeRotatedImagePolygon(this.anchorsLL);
					this.imageCenter = this.mapUtilityService.convertPositionToLatLng(this.mapLayer.MapOrigin);
					this.fitBoundsIfNeeded(this.polygonGroup.getBounds().pad(0.1), true);
				}
				break;
			}
		}
		this.showLower = this.showLowerSection();
		this.changeRef.markForCheck();
	}

	public getLeafletLayer(): any {
		return (this.leafletLayer);
	}

	public cancelEdits() {
		this.opacityRange = [0, Math.floor(this.saveLayer.Opacity * 100)]; 
		this.mapLayer = this.tempLayer;
		this.changeRef.markForCheck();
	}
	public closeDialog() {
		this.onDialogClose.emit();
		this.clearAllLayerMapData();
	}
	public clearEditLayers() {
		if (this.polygonGroup) {
			this.polygonGroup.clearLayers();
		}
		if (this.markers) {
			this.markers = [];
		}
		if (this.polygon) {
			this.polygon = null;
		}

		if (this.rotateMarker) {
			this.rotateMarker = null;
		}
		if (this.rotateLine) {
			this.rotateLine = null;
		}
	}
	public clearAllLayerMapData(removeLayer: boolean = false) {
		this.clearEditLayers();
		if (this.newLeafletLayer && this.leafletLayer) {
			this.mapUtilityService.removeLayerFromMap(this.leafletLayer._secInfo.Id);
			this.leafletLayer = null;
			this.newLeafletLayer = false;
		}
		else if (removeLayer) {
			if (this.leafletLayer) {
				this.mapUtilityService.removeLayerFromMap(this.leafletLayer._secInfo.Id);
				this.leafletLayer = null;
			}
		}
	}


	public placeImageOnMap() {
		switch (this.mapLayer.LayerFormat) {
			case LayerFormat.Image: {
				this.imageCenter = this.map.getCenter();
				this.mapLayer.IsConstrainedTo90 = true;
				this.mapLayer.IsMaintainAspect = true;
				this.mapLayer.MapOrigin = this.mapUtilityService.convertLatLngToPosition(this.imageCenter);
				this.mapLayer.Anchors = this.adminService.calculateImageAnchorsFromMap(this.mapLayer);
				if (this.mapLayer.Anchors) {
					this.leafletLayer = this.mapUtilityService.createLayer(this.mapLayer);
					this.mapUtilityService.addLayerToMap(this.leafletLayer);
					this.newLeafletLayer = true;
					this.anchorsLL = this.mapUtilityService.convertAnchorsPositionToLatLng(this.mapLayer.Anchors);
					this.placeImagePolygon(this.anchorsLL);
				}
				break;
			}
			case LayerFormat.PlatformImage: {
				if (!this.mapLayer.MapOrigin) {
					this.imageCenter = this.map.getCenter();
					this.mapLayer.MapOrigin = this.mapUtilityService.convertLatLngToPosition(this.imageCenter);
				}
				this.mapLayer.Anchors = this.adminService.calculatePlatformImageAnchors(this.mapLayer);
				if (this.mapLayer.Anchors) {
					this.leafletLayer = this.mapUtilityService.createLayer(this.mapLayer);
					this.mapUtilityService.addLayerToMap(this.leafletLayer);
					this.newLeafletLayer = true;
					this.anchorsLL = this.mapUtilityService.convertAnchorsPositionToLatLng(this.mapLayer.Anchors);
					this.placeRotatedImagePolygon(this.anchorsLL);
					this.map.fitBounds(this.polygonGroup.getBounds().pad(0.3));
				}
				break;
			}

		}
		this.changeRef.markForCheck();
		this.checkCanSave();
	}

	public placeImagePolygon(points: L.LatLng[]) {
		this.polygon = L.polygon(points, this.polygonOptions);
		this.polygon.on('mousedown', this.onPolygonMouseDown, this);
		this.polygon.on('touchstart', this.onPolygonMouseDown, this);
		this.polygon.on('mouseover', this.onPolygonMouseOver, this);
		this.polygon.on('mouseout', this.onPolygonMouseOut, this);
		this.polygonGroup.addLayer(this.polygon);

		for (let ii = 0; ii < points.length; ii++) {
			this.markers.push(this.createMarker(L.latLng([points[ii].lat, points[ii].lng]), ii));
			this.polygonGroup.addLayer(this.markers[ii]);
		}

		if (this.mapLayer.IsConstrainedTo90) {
			this.placeRotateMarker();
		}

		this.polygonElem = $('.ms-polygonStyles');
		if (this.polygonElem.length > 0) {
			this.polygonElem.on('dragstart', false);

			$(document).mouseup((event: any) => { this.onMouseUp(event); });
		}
	}
	private createMarker(pt: L.LatLng, index: number):L.Marker {

		let style = "position:relative;width:15px;height:15px;border:1px solid black;background-color:white";
		let html: string = '<div style="' + style + '"></div>';
		let iconOptions: L.DivIconOptions = { className: 'editMarker', html: html, iconSize: [15, 15] };
		let icon: L.DivIcon = L.divIcon(iconOptions);
		let draggable: boolean = this.mapLayer.IsMaintainAspect ? false : true;
		let markerOptions: L.MarkerOptions = { icon: icon, interactive: true, draggable: draggable };
		let marker: L.Marker = L.marker(pt, markerOptions);
		(<any>marker)._secInfo = { index: index };

		this.setMarkerEvents(marker);
		return (marker);
	}

	private setMarkerEvents(marker: L.Marker) {
		marker.off('mousedown', this.onMarkerMouseDown, this); 
		marker.off('drag', this.onMarkerDrag, this);
		marker.off('dragstart', this.onMarkerDragStart, this);

		if (this.mapLayer.IsMaintainAspect) {
			marker.on('mousedown', this.onMarkerMouseDown, this);
		}
		else {
			marker.on('drag', this.onMarkerDrag, this);
			marker.on('dragstart', this.onMarkerDragStart, this);
		}
	}

	private onMarkerDragStart(event: any) {
		this.saveAnchorsLL = [];
		for (let anchor of this.anchorsLL) {
			this.saveAnchorsLL.push(L.latLng(anchor.lat, anchor.lng));
		}
	}

	private onMarkerDrag(event: any) {
		let marker: L.Marker = event.target;
		this.currentMarkerIndex = (<any>marker)._secInfo.index;
		let newPt: L.LatLng = L.latLng(marker.getLatLng());
		if (this.mapLayer.IsConstrainedTo90 === false) {
			this.anchorsLL[this.currentMarkerIndex] = L.latLng([newPt.lat, newPt.lng]);
			this.leafletLayer.setAnchors(this.anchorsLL);
			this.polygon.setLatLngs(this.anchorsLL);
			this.mapLayer.Anchors = this.mapUtilityService.convertAnchorsLatLngToPosition(this.anchorsLL);
		}
		else {
			//if (this.mapLayer.Rotation === 0) {

			//	let swLL: L.LatLng;
			//	let neLL: L.LatLng;

			//	switch (this.currentMarkerIndex) {
			//		// Northwest
			//		case 0: {
			//			swLL = L.latLng(this.mapLayer.Anchors[3].Coordinates[1], newPt.lng);
			//			neLL = L.latLng(newPt.lat, this.mapLayer.Anchors[1].Coordinates[0]);
			//			break;
			//		}
			//		// Northeast
			//		case 1: {
			//			swLL = this.anchorsLL[3];
			//			neLL = L.latLng(newPt);
			//			break;
			//		}
			//		// Southeast
			//		case 2: {
			//			swLL = L.latLng(newPt.lat, this.mapLayer.Anchors[3].Coordinates[0]);
			//			neLL = L.latLng(this.mapLayer.Anchors[1].Coordinates[1], newPt.lng);
			//			break;
			//		}
			//		// Southwest
			//		case 3: {
			//			swLL = L.latLng(newPt);
			//			neLL = this.anchorsLL[1];
			//			break;
			//		}
			//	}

			//	this.mapLayer.Anchors = [];
			//	this.mapLayer.Anchors.push({ Coordinates: [swLL.lng, neLL.lat], Type: 'Point' });
			//	this.mapLayer.Anchors.push({ Coordinates: [neLL.lng, neLL.lat], Type: 'Point' });
			//	this.mapLayer.Anchors.push({ Coordinates: [neLL.lng, swLL.lat], Type: 'Point' });
			//	this.mapLayer.Anchors.push({ Coordinates: [swLL.lng, swLL.lat], Type: 'Point' });

			//	this.anchorsLL = this.mapUtilityService.convertAnchorsPositionToLatLng(this.mapLayer.Anchors);
			//	this.leafletLayer.setAnchors(this.anchorsLL);
			//	this.polygon.setLatLngs(this.anchorsLL);

			//	for (let ii = 0; ii < this.markers.length; ii++) {
			//		if (ii !== this.currentMarkerIndex) {
			//			this.markers[ii].setLatLng(L.latLng(this.anchorsLL[ii].lat, this.anchorsLL[ii].lng));
			//		}
			//	}

			//	let pt1 = this.map.latLngToLayerPoint(this.anchorsLL[0]);
			//	let pt2 = this.map.latLngToLayerPoint(this.anchorsLL[2]);

			//	let centerPt: L.Point = L.point((pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2);

			//	this.imageCenter = this.map.layerPointToLatLng(centerPt);
			//	this.mapLayer.MapOrigin = this.mapUtilityService.convertLatLngToPosition(this.imageCenter);

			//	this.updateRotateMarker();
			//}
			//else {
				//this.anchorsLL = this.adminService.calculateNewCornerPts(newPt, this.saveAnchorsLL, this.currentMarkerIndex, this.mapLayer.IsMaintainAspect);
				//this.mapLayer.Anchors = this.mapUtilityService.convertAnchorsLatLngToPosition(this.anchorsLL);
				//this.leafletLayer.setAnchors(this.anchorsLL);
				//this.polygon.setLatLngs(this.anchorsLL);

				//for (let ii = 0; ii < this.markers.length; ii++) {
				//	if (ii !== this.currentMarkerIndex) {
				//		this.markers[ii].setLatLng(L.latLng(this.anchorsLL[ii].lat, this.anchorsLL[ii].lng));
				//	}
				//}

				//let pt1 = this.map.latLngToLayerPoint(this.anchorsLL[0]);
				//let pt2 = this.map.latLngToLayerPoint(this.anchorsLL[2]);

				//let centerPt: L.Point = L.point((pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2);

				//this.imageCenter = this.map.layerPointToLatLng(centerPt);
				//this.mapLayer.MapOrigin = this.mapUtilityService.convertLatLngToPosition(this.imageCenter);

				//this.updateRotateMarker();
			//}
			this.calculateConstrainedAnchors(newPt);
		}
	}
	private calculateConstrainedAnchors(newPt: L.LatLng) {
		this.anchorsLL = this.adminService.calculateNewCornerPts(newPt, this.saveAnchorsLL, this.currentMarkerIndex, this.mapLayer.IsMaintainAspect);
		this.mapLayer.Anchors = this.mapUtilityService.convertAnchorsLatLngToPosition(this.anchorsLL);
		this.leafletLayer.setAnchors(this.anchorsLL);
		this.polygon.setLatLngs(this.anchorsLL);

		for (let ii = 0; ii < this.markers.length; ii++) {
			if (ii !== this.currentMarkerIndex) {
				this.markers[ii].setLatLng(L.latLng(this.anchorsLL[ii].lat, this.anchorsLL[ii].lng));
			}
		}

		let pt1 = this.map.latLngToLayerPoint(this.anchorsLL[0]);
		let pt2 = this.map.latLngToLayerPoint(this.anchorsLL[2]);

		let centerPt: L.Point = L.point((pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2);

		this.imageCenter = this.map.layerPointToLatLng(centerPt);
		this.mapLayer.MapOrigin = this.mapUtilityService.convertLatLngToPosition(this.imageCenter);

		this.updateRotateMarker();

	}
	private onMarkerMouseDown(event: any) {
		let marker: L.Marker = event.target;
		this.currentMarkerIndex = (<any>marker)._secInfo.index;
		this.saveAnchorsLL = [];
		for (let anchor of this.anchorsLL) {
			this.saveAnchorsLL.push(L.latLng(anchor.lat, anchor.lng));
		}
		this.map.dragging.disable();

		this.map.on("mousemove", this.onMaintainAspectMouseMove, this);
		this.map.on("mouseup", this.onMaintainAspectMouseUp, this);
	}

	private onMaintainAspectMouseMove(event: any) {
		let newPt: L.LatLng = event.latlng;
		this.anchorsLL = this.adminService.calculateNewCornerPts(newPt, this.saveAnchorsLL, this.currentMarkerIndex, this.mapLayer.IsMaintainAspect);
		this.mapLayer.Anchors = this.mapUtilityService.convertAnchorsLatLngToPosition(this.anchorsLL);
		this.leafletLayer.setAnchors(this.anchorsLL);
		this.polygon.setLatLngs(this.anchorsLL);

		for (let ii = 0; ii < this.markers.length; ii++) {
			this.markers[ii].setLatLng(L.latLng(this.anchorsLL[ii].lat, this.anchorsLL[ii].lng));
		}

		let pt1 = this.map.latLngToLayerPoint(this.anchorsLL[0]);
		let pt2 = this.map.latLngToLayerPoint(this.anchorsLL[2]);

		let centerPt: L.Point = L.point((pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2);

		this.imageCenter = this.map.layerPointToLatLng(centerPt);
		this.mapLayer.MapOrigin = this.mapUtilityService.convertLatLngToPosition(this.imageCenter);

		this.updateRotateMarker();
	}

	private onMaintainAspectMouseUp(event: any) {
		this.map.off("mousemove", this.onMaintainAspectMouseMove, this);
		this.map.off("mouseup", this.onMaintainAspectMouseUp, this);
		this.map.dragging.enable();
		this.currentMarkerIndex = -1;
	}

	private onPolygonMouseOver(event: any) {
		let elem = $('.ms-polygonStyles');
		if (elem.length > 0) {
			elem.addClass('ms-moveCursor');
		}
	}

	private onPolygonMouseOut(event: any) {
		let elem = $('.ms-polygonStyles');
		if (elem.length > 0) {
			elem.removeClass('ms-moveCursor');
		}
	}

	private onPolygonMouseDown(event: any) {
		this.map.dragging.disable();
		this.isDraggingPolygon = true;
		this.moveStartPt = event.latlng;

		this.map.on('mousemove', this.onMapMouseMove, this);
		//this.map.on('touchmove', this.onMapMouseMove, this);

		L.DomEvent.on(document.documentElement,'mouseup', this.onMouseUp, this);
		L.DomEvent.on(document.documentElement, 'touchend', this.onMouseUp, this);
		L.DomEvent.preventDefault(event.originalEvent);
	}
	private onMapMouseMove(event: any) {
		if (this.isDraggingPolygon) {
			let newPt:L.LatLng = event.latlng;

			let moveLat = newPt.lat - this.moveStartPt.lat;
			let moveLng = newPt.lng - this.moveStartPt.lng;

			for (let latLng of this.anchorsLL) {
				latLng.lat = latLng.lat + moveLat;
				latLng.lng = latLng.lng + moveLng;
			}
			this.polygon.setLatLngs(this.anchorsLL);
			this.mapLayer.Anchors = this.mapUtilityService.convertAnchorsLatLngToPosition(this.anchorsLL);

			this.leafletLayer.setAnchors(this.anchorsLL);

			for (let marker of this.markers) {
				let latLng = marker.getLatLng();
				latLng.lat = latLng.lat + moveLat;
				latLng.lng = latLng.lng + moveLng;
				marker.setLatLng(latLng);
			}
			this.imageCenter.lat = this.imageCenter.lat + moveLat;
			this.imageCenter.lng = this.imageCenter.lng + moveLng;
			this.mapLayer.MapOrigin = this.mapUtilityService.convertLatLngToPosition(this.imageCenter);

			if (this.rotateMarker) {
				let latLng = this.rotateMarker.getLatLng();
				latLng.lat = latLng.lat + moveLat;
				latLng.lng = latLng.lng + moveLng;
				this.rotateMarker.setLatLng(latLng);

				let latLngs: L.LatLng[] = this.rotateLine.getLatLngs();
				latLngs[0].lat = latLngs[0].lat + moveLat;
				latLngs[0].lng = latLngs[0].lng + moveLng;
				//latLngs[1].lat = latLngs[1].lat + moveLat;
				//latLngs[1].lng = latLngs[1].lng + moveLng;

				this.rotateLine.setLatLngs(latLngs);

			}

			this.moveStartPt = L.latLng(newPt);
		}
	}

	private onMouseUp(event: any) {

		this.map.dragging.enable();
		if (this.isDraggingPolygon) {
			this.map.off('mousemove', this.onMapMouseMove, this);
			this.map.off('touchmove', this.onMapMouseMove, this);
		}
		this.isDraggingPolygon = false;
		L.DomEvent.off(document.documentElement, 'mouseup', this.onMouseUp, this);
		L.DomEvent.off(document.documentElement, 'touchend', this.onMouseUp, this);
	}


	public placeRotatedImagePolygon(points: L.LatLng[]) {
		this.polygon = L.polygon(points, this.polygonOptions);
		this.polygon.on('mousedown', this.onPolygonMouseDown, this);
		this.polygon.on('touchstart', this.onPolygonMouseDown, this);
		this.polygon.on('mouseover', this.onPolygonMouseOver, this);
		this.polygon.on('mouseout', this.onPolygonMouseOut, this);
		this.polygonGroup.addLayer(this.polygon);

		setTimeout(() => { this.placeRotateMarker(); }, 400);

		this.polygonElem = $('.ms-polygonStyles');
		if (this.polygonElem.length > 0) {
			this.polygonElem.on('dragstart', false);

			$(document).mouseup((event: any) => { this.onMouseUp(event); });
		}
	}

	private placeRotateMarker() {

		let style = "position:relative;width:15px;height:15px;border:1px solid black;background-color:white;border-radius:50%";
		let markerPts = this.createRotateMarkerPts();
		this.rotateLine = new L.Polyline([markerPts.lineStartPt, markerPts.rotateMarkerPt]);
		this.polygonGroup.addLayer(this.rotateLine);

		let html: string = '<div style="' + style + '"></div>';
		let iconOptions: L.DivIconOptions = { className: 'rotateMarker', html: html, iconSize: [15, 15] };
		let icon: L.DivIcon = L.divIcon(iconOptions);
		let markerOptions: L.MarkerOptions = { icon: icon, interactive: true, draggable: false };
		this.rotateMarker = L.marker(markerPts.rotateMarkerPt, markerOptions);
		this.rotateMarker.on('mousedown', this.onRotateStart, this);
		this.polygonGroup.addLayer(this.rotateMarker);
	}

	private createRotateMarkerPts(): any {
		let rotateMarkerPts: any = {};

		let points = this.anchorsLL;
		let pt1 = this.map.latLngToLayerPoint(points[0]);
		let pt2 = this.map.latLngToLayerPoint(points[2]);

		let centerPt: L.Point = L.point((pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2);

		pt2 = this.map.latLngToLayerPoint(points[1]);
		// hehe, top is a reserved word
		let midPt: L.Point = L.point((pt1.x + pt2.x) / 2,(pt1.y + pt2.y) / 2);

		let rotateMarkerPt = this.map.layerPointToLatLng(this.adminService.pointOnLine(centerPt,midPt,20));

		rotateMarkerPts.lineStartPt = this.map.layerPointToLatLng(midPt);
		rotateMarkerPts.rotateMarkerPt = rotateMarkerPt;
		return (rotateMarkerPts);
	}

	private removeRotateMarker() {
		if (this.rotateLine) {
			this.polygonGroup.removeLayer(this.rotateLine);
			this.rotateLine = null;
		}

		if (this.rotateMarker) {
			this.polygonGroup.removeLayer(this.rotateMarker);
			this.rotateMarker = null;
		}
	}

	public onRotateStart(event: any) {
		this.map.dragging.disable();
		this.isRotatingPolygon = true;
		this.rotateStartPt = event.layerPoint;
		this.rotateOriginPt = this.map.latLngToLayerPoint(new L.LatLng((this.anchorsLL[0].lat + this.anchorsLL[2].lat) / 2, (this.anchorsLL[0].lng + this.anchorsLL[2].lng) / 2));

		this.rotateStartAngle = this.mapLayer.Rotation;
		this.map.on('mousemove', this.onRotateMapMouseMove, this);
		this.map.on('touchmove', this.onRotateMapMouseMove, this);
		L.DomEvent.on(document.documentElement, 'mouseup', this.onRotateMouseUp, this);
		L.DomEvent.on(document.documentElement, 'touchend', this.onRotateMouseUp, this);
	}

	private onRotateMapMouseMove(event: any) {
		if (this.isRotatingPolygon) {
			let pos: L.Point = event.layerPoint;

			let previous = this.rotateStartPt;
			let origin = this.rotateOriginPt;
			let newAngle = -(Math.atan2(pos.y - origin.y, pos.x - origin.x) -
				Math.atan2(previous.y - origin.y, previous.x - origin.x));
			newAngle = this.adminService.convertToDecDegrees(newAngle);

			// Keep it between 180 and -180
			let rotAngle = Math.round(this.rotateStartAngle + newAngle);
			if (rotAngle > 180) {
				rotAngle = rotAngle - 360;
			}
			else if (rotAngle <= -180) {
				rotAngle = rotAngle + 360;
			}

			this.rotateImage(rotAngle);
		}
	}

	private onRotateMouseUp(event: any) {

		this.map.dragging.enable();
		if (this.isRotatingPolygon) {
			//this.fitBoundsIfNeeded(this.polygonGroup.getBounds().pad(0.1));
			setTimeout(() => {
				this.updateRotateMarker();
			}, 400);

			this.map.off('mousemove', this.onRotateMapMouseMove, this);
			this.map.off('touchmove', this.onRotateMapMouseMove, this);
		}
		this.isRotatingPolygon = false;
		L.DomEvent.on(document.documentElement, 'mouseup', this.onMouseUp, this);
		L.DomEvent.on(document.documentElement, 'touchend', this.onMouseUp, this);
	}

	public updateRotateMarker() {
		if (this.rotateMarker) {
			let markerPts = this.createRotateMarkerPts();
			this.rotateMarker.setLatLng(markerPts.rotateMarkerPt);
			this.rotateLine.setLatLngs([markerPts.lineStartPt, markerPts.rotateMarkerPt]);
		}
	}

	private rotateImage(rotAngle: number) {

		if (this.mapLayer.LayerFormat === LayerFormat.PlatformImage) {
			this.mapLayer.Rotation = rotAngle;
			this.layerRotation = rotAngle;
			this.mapLayer.Anchors = this.adminService.calculatePlatformImageAnchors(this.mapLayer);
			this.anchorsLL = this.mapUtilityService.convertAnchorsPositionToLatLng(this.mapLayer.Anchors);
		}
		else {
			let incrementAngle: number = rotAngle - this.mapLayer.Rotation;
			this.mapLayer.Rotation = rotAngle;
			this.layerRotation = rotAngle;
			this.adminService.rotateImageAnchors(this.anchorsLL, this.imageCenter, -incrementAngle);
			this.mapLayer.Anchors = this.mapUtilityService.convertAnchorsLatLngToPosition(this.anchorsLL);
		}
		this.leafletLayer.setAnchors(this.anchorsLL);
		this.polygon.setLatLngs(this.anchorsLL);

		for (let ii = 0; ii < this.markers.length; ii++) {
			let latLng = L.latLng([this.anchorsLL[ii].lat, this.anchorsLL[ii].lng]);
			this.markers[ii].setLatLng(latLng);
		}

		this.updateRotateMarker();
		this.changeRef.detectChanges();
	}

	public onRotateSpinnerChange() {
		this.rotateImage(this.layerRotation);
		//this.fitBoundsIfNeeded(this.polygonGroup.getBounds().pad(0.1));

	}

	private fitBoundsIfNeeded(polyBnds: L.LatLngBounds, force: boolean = false) {
		let doFit: boolean = force;

		if (!doFit) {
			let fitZoom: number = this.map.getBoundsZoom(polyBnds);
			let curZoom:number = this.map.getZoom();
			if ((fitZoom - curZoom) < 0 || (fitZoom - curZoom) > 1) {
				doFit = true;
			}
		}
		if (doFit) {
			this.map.fitBounds(polyBnds, this.fitOptions);
			setTimeout(() => {
				this.updateRotateMarker();
			}, 400);
		}
	}
 	private getWMSCapabiliites() {
		let versionOption = this.mapLayer.Options.find((elem) => { return (elem.Name === 'version'); });
		let version = versionOption ? versionOption.Value : '1.3.0';
		let temp = encodeURIComponent(this.mapLayer.URL + '?service=wms&VERSION=' + version + '&request=getcapabilities');
		let wmsURL = '?url=' + temp;
		//let wmsURL = '?url=http%3A%2F%2Fmesonet.agron.iastate.edu%2Fcgi-bin%2Fwms%2Fnexrad%2Fn0r.cgi%3Fservice%3Dwms%26VERSION%3D1.3.0%26request%3Dgetcapabilities';
		let url = '/maps/capabilities' + wmsURL;
		this.adminService.displayLoadingScreen('Loading WMS information');

		this.httpService.post(url, null, null, null, ((errMsg: string) => { this.getWMSError(errMsg)})).then((data: any) => {
			if (data) {
				setTimeout(() => {
					this.adminService.removeLoadingScreen();
					this.wmsModel = this.adminService.createWMSCapabilitiesModel_1_3_0(data);
					if (this.wmsModel) {
						this.populateDialogWithWMSData();
					}
					this.changeRef.markForCheck();
				}, 800);
			}
			else {
				setTimeout(() => {
					this.adminService.removeLoadingScreen();
					this.changeRef.markForCheck();
				}, 800);
			}
		});

	}

	public getWMSError(error: string) {
		this.errorMessage = 'Error retrieving WMS information.'
		this.changeRef.detectChanges();
		setTimeout(() => {
			this.adminService.removeLoadingScreen();
			this.errorDialog.show();
		}, 800);
	}

	private populateDialogWithWMSData() {
		this.wmsLayers = []
		for (let wmsLayer of this.wmsModel.Layers) {
			this.wmsLayers.push({ label: wmsLayer.Title && wmsLayer.Title != '' ? wmsLayer.Title : wmsLayer.Name, value: wmsLayer.Name });
			if (wmsLayer.Layers) {
				for (let subLayer of wmsLayer.Layers) {
					this.wmsLayers.push({ label: subLayer.Title && subLayer.Title != '' ? subLayer.Title : subLayer.Name, value: subLayer.Name });
				}
			}
		}

	}
	public uploadImage(): void {
		this.uploadDialog.show();
	}

	public handleOnUploadComplete(event: any): void {
		if (!event.ImageProperties) {
			let imageInfo: ImageInfo = new ImageInfo(null);
			imageInfo.Image = new Image(event.Image);
			imageInfo.ImageSize = event.ImageSize.slice(0);
			imageInfo.Anchors = [];
			imageInfo.Rotation = 0;
			let temp = this.availImages.find((elem) => { return (elem.Image.Label === imageInfo.Image.Label); });
			if (!temp) {
				temp = imageInfo;
				this.availImages.push(imageInfo);
				this.images.push({ label: imageInfo.Image.Label, value: imageInfo });

			}
			else {
				temp.Image.Uri = event.Image.Uri;
				temp.ImageSize = event.ImageSize.slice(0);
			}
			this.selectedImage = temp;
			this.layerURLDropdownChanged({ value: temp });
			this.changeRef.detectChanges();
		}
		else {
			let platformImageInfo: PlatformImageInfo = new PlatformImageInfo(null);
			platformImageInfo.Image = new Image(event.Image);
			platformImageInfo.ImageSize = event.ImageSize.slice(0);
			platformImageInfo.ImageProperties = new PlatformImageProperties(event.ImageProperties);
			let temp = this.availPlatformImages.find((elem) => { return (elem.Image.Label === platformImageInfo.Image.Label); });
			if (!temp) {
				temp = platformImageInfo;
				this.images.push({ label: platformImageInfo.Image.Label, value: platformImageInfo });
				this.availPlatformImages.push(platformImageInfo);
			}
			else {
				temp.Image.Uri = event.Image.Uri;
				temp.ImageSize = event.ImageSize.slice(0);
				temp.ImageProperties.Origin = event.ImageProperties.Origin;
				temp.ImageProperties.Resolution = event.ImageProperties.Resolution;
			}

			this.selectedImage = temp;
			this.layerURLDropdownChanged({ value: temp });
			this.changeRef.detectChanges();
		}
	}

	public hideErrorDialog() {
		this.errorDialog.hide();
		this.errorMessage = "";
	}

}