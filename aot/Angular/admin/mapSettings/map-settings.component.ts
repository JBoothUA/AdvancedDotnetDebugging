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

import { Tenant } from '../../shared/tenant.class';
import { Location } from '../../shared/location.class';
import { Modal } from '../../shared/modal.component';
import { UserService } from '../../shared/user.service';
import { LocationFilterService } from '../../shared/location-filter.service';
import { MapLayer, LayerFormat, LayerType } from '../../shared/map-layer.class';
import { PlatformImageInfo, ImageInfo, LocationMapSettings, MapCreateOptions, MapControlPositions } from '../../shared/map-settings.class';
import { slideDown } from '../../shared/animations';
import { MapService } from '../../map/map.service';
import { Position, Image } from '../../shared/shared-interfaces';
import { LayerDefinition } from './layer-definition.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { SpinnerModule } from 'primeng/components/spinner/spinner';
import { AdminService } from '../admin.service';
import { DragulaService } from 'ng2-dragula';
import { MapUtilityService } from '../../map/map-utility.service';
import { LinkMapToRobot } from '../link-map-to-robot.component';

@Component({
	selector: 'map-settings',
	templateUrl: 'map-settings.component.html',
	styleUrls: ['map-settings.component.css'],
	providers: [MapService, DragulaService, MapUtilityService],
	animations: [
		slideDown,
		trigger('slideOut', [
			state('in', style({
				//display: 'none',
				left: '1000px'
			})),
			state('out', style({
				//display:'inline',
				left: '0'
			})),
			transition('in <=> out', animate('400ms ease-in-out'))
			//state('in', style({
			//	display: 'none',
			//})),
			//state('out', style({
			//	display: 'inline',
			//})),
			//transition('in <=> out', animate('100ms ease-in-out'))
		]),
		trigger('resizeMap', [
			state('in', style({
				width: 'calc(100% - 409px)'
			})),
			state('out', style({
				display: '',
				width: 'calc(100% - 817px)'
			})),
			transition('in <=> out', animate('250ms ease-in-out'))
		])
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class MapSettings implements OnInit {
	@Input() mapSettings: LocationMapSettings = null;

	@Input() step1Expanded: string;
	@Input() step2Expanded: string;
	@ViewChild('layerDefinition') layerDef: LayerDefinition;
	@ViewChild(Modal) saveErrorDialog: Modal;
	@ViewChild(LinkMapToRobot) linkRobot: LinkMapToRobot;

	private map: L.Map;
	private ngUnsubscribe: Subject<void> = new Subject<void>();

	private saveLayer: MapLayer;
	private layerInEditIdx: number;
	private layerInEdit: MapLayer;
	private activeLayer: boolean;
	private leafletLayers: any;
	private allLayersShown: boolean;
	private userTenantInEdit: Tenant;
	private childTenantsInEdit: Tenant[];
	public tenantInEdit: Tenant;
	public locationInEdit: Location;
	public visible: boolean = false;
	public formattedMapCenter: string;
	public formattedZoom: string;
	public zoomCenterSet: boolean = false;
	public step1Complete: boolean = false;
	public step2Complete: boolean = false;
	public isLayerDefShown: boolean = false;
	public errorMessage: string;
	public warningIcon: string;
	public disableSave: boolean = true;
	public dragOverInclude: boolean = false;
	public dragOverRemove: boolean = false;
	public saveBtnText: string;

	private prevent: boolean;
	private delay: number;
    private timer: NodeJS.Timer;

	LayerFormat: typeof LayerFormat = LayerFormat;

	constructor(
		private changeRef: ChangeDetectorRef,
		private ngZone: NgZone,
		private mapService: MapService,
		private adminService: AdminService,
		private mapUtilityService: MapUtilityService,
		private locFilterService: LocationFilterService,
		private userService: UserService,
		private dragulaService: DragulaService) {


		dragulaService.setOptions('layersList', {
			moves: function (el: any, container: any, handle: any) {
				return handle.classList.contains('ms-dragIconImg');
			},
			revertOnSpill: true
		});

		this.dragulaService.drop
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (value) => this.layerDropped(value)
			});

		this.dragulaService.over
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (value) => this.layerDraggedOver(value)
			});

		this.dragulaService.out
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (value) => this.layerDraggedOut(value)
			});

		this.warningIcon = '../../Content/Images/warning.png';

	}

	ngOnInit() {

		this.step1Expanded = 'out';
		this.step2Expanded = 'in';
		this.formattedMapCenter = '';
		this.formattedZoom = '';
		this.saveBtnText = 'Save Settings';

		for (let ii = 0; ii < this.userService.currentUser.tenant.Locations.length; ii++) {
			let location = this.userService.currentUser.tenant.Locations[ii];
			if (!location.City) {
				this.userService.currentUser.tenant.Locations.splice(ii, 1);
			}
		}

		this.cloneUserTenant();

		if (!this.childTenantsInEdit) {
			if (this.userTenantInEdit.Locations && this.userTenantInEdit.Locations.length === 1) {
				this.disableSave = false;
				this.tenantInEdit = this.userTenantInEdit;
				this.locationInEdit = this.userTenantInEdit.Locations[0];
				if (this.locationInEdit.MapSettings) {
					this.formattedZoom = this.locationInEdit.MapSettings.ZoomLevel.toString();
					if (this.locationInEdit.MapSettings.MapCenter) {
						this.formattedMapCenter = this.adminService.formatPosition(this.locationInEdit.MapSettings.MapCenter);
						this.zoomCenterSet = true;
						this.step1Complete = true;
						this.step1Expanded = 'in';
						this.step2Expanded = 'out';
					}

					if (this.locationInEdit.MapSettings.Layers && this.locationInEdit.MapSettings.Layers.length > 0) {
						this.step2Complete = true;
					}
				}
			}
		}
	}

	ngAfterViewInit() {

		if (this.locationInEdit) {
			this.locFilterService.setTenantLocation('mapSettings', this.tenantInEdit.Id, this.locationInEdit.Id);
		}

		this.mapUtilityService.setUserTenantInfo(this.userTenantInEdit, this.childTenantsInEdit);
		let mapOptions: MapCreateOptions = new MapCreateOptions();
		mapOptions.AttributionControl = false;
		mapOptions.AttributionControlPosition = MapControlPositions.BottomRight;
		mapOptions.ZoomControl = true;
		mapOptions.ZoomControlPosition = MapControlPositions.BottomRight;
		this.map = this.mapUtilityService.createMap('adminMap', mapOptions);
		this.map.on('zoomend', this.onZoomEnd, this);
		this.adminService.setMapInfo(this.map, this.mapUtilityService);

		// Subscribe to action definition selection events
		this.locFilterService.locationsChanged
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (view) => {
					this.locationChanged(view);
				}
			});
	}

	ngOnDestroy(): void {
		this.locFilterService.unregisterComponent('mapSettings');
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	private cloneUserTenant() {
		this.userTenantInEdit = new Tenant(this.userService.currentUser.tenant);
		if (this.userService.currentUser.childTenants) {
			this.childTenantsInEdit = [];
			for (let tenant of this.userService.currentUser.childTenants) {
				this.childTenantsInEdit.push(new Tenant(tenant));
			}
		}

	}
	public locationChanged(view: any) {
		if (view === 'mapSettings') {
			let tenant: Tenant[] = this.locFilterService.getSelectedTenantLocations(view);
			if (tenant && tenant.length > 0) {
				this.step1Complete = false;
				this.step1Expanded = 'out';
				this.step2Expanded = 'in';
				this.zoomCenterSet = false;
				this.formattedMapCenter = '';
				this.formattedZoom = '';
				this.tenantInEdit = this.findTenant(tenant[0]);
				this.locationInEdit = this.findLocation(this.tenantInEdit, tenant[0].Locations[0].Id);
				if (!this.locationInEdit.MapSettings) {
					this.locationInEdit.MapSettings = new LocationMapSettings(null);
				}

				if (this.map && this.locationInEdit.MapSettings.MapCenter && this.locationInEdit.MapSettings.ZoomLevel) {
					let center: L.LatLng = this.mapUtilityService.convertPositionToLatLng(this.locationInEdit.MapSettings.MapCenter);
					this.map.setView(center, this.locationInEdit.MapSettings.ZoomLevel);
					this.formattedMapCenter = this.adminService.formatPosition(this.locationInEdit.MapSettings.MapCenter);
					this.formattedZoom = this.locationInEdit.MapSettings.ZoomLevel.toString();
					this.step1Complete = true;
					this.step1Expanded = 'in';
					this.step2Expanded = 'out';
					this.zoomCenterSet = true;

				}

				this.layerDef.setTenantLocation(this.tenantInEdit, this.locationInEdit);
				if (this.step1Complete) {
					this.disableSave = false;
				}
			}
		}
	}

	public findTenant(tenant:Tenant):Tenant {
		if (tenant.Id === this.userTenantInEdit.Id) {
			return (this.userTenantInEdit);
		}
		else {
			if (this.childTenantsInEdit) {
				for (let childTenant of this.childTenantsInEdit) {
					if (tenant.Id === childTenant.Id) {
						return (childTenant);
					}
				}
			}
		}
	}

	private findLocation(tenant: Tenant, locID: string): Location {
		let location: Location;
		if (tenant.Locations) {
			for (let loc of tenant.Locations) {
				if (loc.Id === locID) {
					location = loc;
					break;
				}
			}
		}
		return (location);
	}

	public layerDropped(value: any) {

		if (value[2] && (value[2].id === 'availLayersListDropZoneEmpty' || value[2].id === 'availLayersListDropZone')) {
			if (value[2] && value[3] && value[2] === value[3]) {
				// Just sorting layers in removed list.
				let idx: number = parseInt(value[1].dataset.layeridx);
				if (idx || idx === 0) {
					let layer: MapLayer = this.locationInEdit.MapSettings.AvailableLayers[idx];
					let beforeIdx = value[4] && value[4].dataset.layeridx ? parseInt(value[4].dataset.layeridx) : -1;
					if (beforeIdx === -1) {
						// Moving layer to the end
						this.locationInEdit.MapSettings.AvailableLayers.splice(idx, 1);
						this.locationInEdit.MapSettings.AvailableLayers.push(layer);
					}
					else {
						if (idx > beforeIdx) {
							this.locationInEdit.MapSettings.AvailableLayers.splice(idx, 1);
							this.locationInEdit.MapSettings.AvailableLayers.splice(beforeIdx, 0, layer);
						}
						else {
							this.locationInEdit.MapSettings.AvailableLayers.splice(idx, 1);
							this.locationInEdit.MapSettings.AvailableLayers.splice(beforeIdx - 1, 0, layer);
						}
					}
					this.mapUtilityService.redrawLayers();
					this.changeRef.markForCheck();
				}
			}
			// Moving layer from include to removed
			else {
				let idx: number = parseInt(value[1].dataset.layeridx);
				let beforeIdx = value[4] && value[4].dataset.layeridx ? parseInt(value[4].dataset.layeridx) : -1;
				let layer: MapLayer = this.locationInEdit.MapSettings.Layers[idx];
				if (beforeIdx === -1) {
					// Moving layer to the end
					this.locationInEdit.MapSettings.AvailableLayers.push(layer);
				}
				else {
					this.locationInEdit.MapSettings.AvailableLayers.splice(beforeIdx, 0, layer);
				}

				this.locationInEdit.MapSettings.Layers.splice(idx, 1);
				this.mapUtilityService.removeLayerFromMap(layer.Id);
				value[2].removeChild(value[1]);
				this.changeRef.markForCheck();
			}
		}
		else if (value[2] && (value[2].id === 'layersListDropZoneEmpty' || value[2].id === 'layersListDropZone')) {
			if (value[2] && value[3] && value[2] === value[3]) {
				let idx: number = parseInt(value[1].dataset.layeridx);
				if (idx || idx === 0) {
					let layer: MapLayer = this.locationInEdit.MapSettings.Layers[idx];
					let beforeIdx = value[4] && value[4].dataset.layeridx ? parseInt(value[4].dataset.layeridx) : -1;
					if (beforeIdx === -1) {
						// Moving layer to the end
						this.locationInEdit.MapSettings.Layers.splice(idx, 1);
						this.locationInEdit.MapSettings.Layers.push(layer);
					}
					else {
						if (idx > beforeIdx) {
							this.locationInEdit.MapSettings.Layers.splice(idx, 1);
							this.locationInEdit.MapSettings.Layers.splice(beforeIdx, 0, layer);
						}
						else {
							this.locationInEdit.MapSettings.Layers.splice(idx, 1);
							this.locationInEdit.MapSettings.Layers.splice(beforeIdx - 1, 0, layer);
						}
					}
					this.mapUtilityService.redrawLayers();
					this.changeRef.markForCheck();
				}
			}
			// Moving layer from removed to include.
			else {
				let idx: number = parseInt(value[1].dataset.layeridx);
				let layer: MapLayer = this.locationInEdit.MapSettings.AvailableLayers[idx];
				let beforeIdx = value[4] && value[4].dataset.layeridx ? parseInt(value[4].dataset.layeridx) : -1;
				if (beforeIdx === -1) {
					// Moving layer to the end
					this.locationInEdit.MapSettings.Layers.push(layer);
				}
				else {
					this.locationInEdit.MapSettings.Layers.splice(beforeIdx, 0, layer);
				}
				this.locationInEdit.MapSettings.AvailableLayers.splice(idx, 1);
				this.mapUtilityService.redrawLayers();
				value[2].removeChild(value[1]);
				this.changeRef.markForCheck();
			}
		}
	}

	public layerDraggedOver(event: any) {
		if (event[2].id === 'layersListDropZone' || event[2].id === 'layersListDropZoneEmpty') {
			this.dragOverInclude = true;
		}
		else if (event[2].id === 'availLayersListDropZone' || event[2].id === 'availLayersListDropZoneEmpty') {
			this.dragOverRemove = true;
		}

		this.changeRef.detectChanges();
	}

	public layerDraggedOut(event: any) {
		if (event[2].id === 'layersListDropZone' || event[2].id === 'layersListDropZoneEmpty') {
			this.dragOverInclude = false;
		}
		else if (event[2].id === 'availLayersListDropZone' || event[2].id === 'availLayersListDropZoneEmpty') {
			this.dragOverRemove = false;
		}

		this.changeRef.detectChanges();
	}

	public addNewLayer() {
		this.isLayerDefShown = true;
		this.changeRef.detectChanges();
		let layer: MapLayer = new MapLayer(null);
		layer.LayerFormat = LayerFormat.Tile;
		layer.LayerType = LayerType.Custom;
		this.layerInEditIdx = -1;
		this.saveLayer = null;
		this.disableSave = true;
		this.layerInEdit = layer;
		this.layerDef.setMapUtilService(this.mapUtilityService);
		this.layerDef.setLayer(layer, true, this.map);
		this.locationInEdit.MapSettings.Layers.push(layer);
		this.saveBtnText = 'Create Layer';
	}

	private onZoomEnd(map: any) {
		this.layerDef.updateRotateMarker();
	}

	public toggleStep1Group(): void {
		this.step1Expanded = this.step1Expanded === 'in' ? 'out' : 'in';
	}

	public toggleStep2Group(): void {
		this.step2Expanded = this.step2Expanded === 'in' ? 'out' : 'in';
	}

	public setZoomCenter() {
		if (this.map) {
			let center: L.LatLng = this.map.getCenter();
			let zoom: number = this.map.getZoom();
			this.formattedMapCenter = this.adminService.formatLatLng(center);
			this.locationInEdit.MapSettings.MapCenter = this.mapUtilityService.convertLatLngToPosition(center);
			this.locationInEdit.MapSettings.ZoomLevel = zoom;
			this.formattedZoom = zoom.toString();
			this.zoomCenterSet = true;
			this.disableSave = false;
			this.changeRef.detectChanges();
		}
	}

	public getFormattedMapCenter(): string {
		let centStr: string = "";
		if (this.locationInEdit.MapSettings && this.locationInEdit.MapSettings.MapCenter && this.locationInEdit.MapSettings.MapCenter.Coordinates) {
			centStr = this.adminService.formatPosition(this.locationInEdit.MapSettings.MapCenter);
		}
		else {
			if (this.map !== null) {
				let center: L.LatLng = this.map.getCenter();
				if (center) {
					centStr = this.adminService.formatLatLng(center);
				}
			}
		}
		return centStr;
	}

	public getMapCenter(): L.LatLng {
		let center: L.LatLng;
		if (this.map !== null) {
			center = this.map.getCenter();
		}
		return (center);
	}

	public completeStep1() {
		this.step1Complete = true;
		this.toggleStep1Group();
		this.toggleStep2Group();
	}

	public onLayerDefClosed() {
		this.isLayerDefShown = false;
		this.changeRef.detectChanges();
		setTimeout(() => { this.map.invalidateSize(); }, 500);
	}

	public areAllLayersShown(): boolean {
		this.allLayersShown = true;
		if (this.locationInEdit.MapSettings && this.locationInEdit.MapSettings.Layers && this.locationInEdit.MapSettings.Layers.length > 0) {
			for (let layer of this.locationInEdit.MapSettings.Layers) {
				if (layer.IsShownOnStartup === false) {
					this.allLayersShown = false;
					break;
				}
			}
		}
		return (this.allLayersShown);
	}
	public toggleCardSelected(layer: MapLayer) {
		for (let tempLayer of this.locationInEdit.MapSettings.Layers) {
			if (tempLayer !== layer) {
				tempLayer.IsSelected = false;
			}
		}
		layer.IsSelected = layer.IsSelected ? false : true;
	}

	public onClickCard(layer: MapLayer) {
		// Delay click action to allow dblclick to occur
		this.timer = setTimeout(
			() => {
				if (!this.prevent) {
					this.toggleCardSelected(layer);
					this.changeRef.detectChanges();
				}
				this.prevent = false;
			},
			this.delay);
	}

	public onDblClickCard(idx: number, activeLayer: boolean) {
		this.prevent = true;
		clearTimeout(this.timer);
		this.editLayer(idx, activeLayer);
	}

	public toggleShowAllOnStartup() {

		if (this.allLayersShown) {
			this.allLayersShown = false;
			for (let layer of this.locationInEdit.MapSettings.Layers) {
				layer.IsShownOnStartup = false;
			}
		}
		else {
			this.allLayersShown = true;
			for (let layer of this.locationInEdit.MapSettings.Layers) {
				layer.IsShownOnStartup = true;
			}
		}

		this.mapUtilityService.redrawLayers();
	}

	public toggleShowOnStartup(layer: MapLayer) {
		layer.IsShownOnStartup = layer.IsShownOnStartup === true ? false : true;
		if (layer.IsShownOnStartup) {
			this.mapUtilityService.redrawLayers();
		}
		else {
			this.mapUtilityService.removeLayerFromMap(layer.Id);
		}
	}


	public deleteLayer(event: any, idx: number, activeLayer: boolean) {
		if (event) {
			event.stopPropagation();
		}
		if (activeLayer) {
			this.mapUtilityService.removeLayerFromMap(this.locationInEdit.MapSettings.Layers[idx].Id);
			this.locationInEdit.MapSettings.Layers.splice(idx, 1);
		}
		else {
			this.locationInEdit.MapSettings.AvailableLayers.splice(idx, 1);
		}
	}

	public editLayer(idx: number, activeLayer: boolean) {
		this.isLayerDefShown = true;
		this.saveBtnText = 'Update Layer';
		this.layerInEditIdx = idx;
		this.activeLayer = activeLayer;
		let layer: MapLayer;
		if (activeLayer) {
			layer = this.locationInEdit.MapSettings.Layers[idx];
			this.saveLayer = new MapLayer(layer);
		}
		else {
			layer = this.locationInEdit.MapSettings.AvailableLayers[idx];
			this.saveLayer = new MapLayer(layer);
		}
		this.layerInEdit = layer;

		this.layerDef.setMapUtilService(this.mapUtilityService);
		this.layerDef.setLayer(layer, false, this.map);
		this.disableSave = false;
		this.changeRef.detectChanges();
	}

	public canEnableSave(enable:boolean) {
		this.disableSave = !enable;
		this.changeRef.detectChanges();
	}

	public saveEdits() {
		if (this.isLayerDefShown) {
			if (this.validateLayerDef()) {
				this.saveBtnText = 'Save Settings';
				this.layerDef.clearAllLayerMapData();
				if (this.layerInEditIdx === -1) {
					this.mapUtilityService.redrawLayers();
				}
				else {
					if (this.activeLayer) {
						this.mapUtilityService.redrawLayers();
					}
				}

				if (this.layerInEdit.LayerFormat === LayerFormat.Image) {
					let imageName = this.layerInEdit.ImageName
					let imageInfo: ImageInfo = this.locationInEdit.MapSettings.AvailableImages.find((elem) => { return (elem.Image.Label === imageName); });
					if (imageInfo) {
						imageInfo.Anchors = this.layerInEdit.Anchors.slice();
						imageInfo.Rotation = this.layerInEdit.Rotation;
						if (this.layerInEdit.MapOrigin) {
							imageInfo.MapOrigin = { Coordinates: [this.layerInEdit.MapOrigin.Coordinates[0], this.layerInEdit.MapOrigin.Coordinates[1]], Type: this.layerInEdit.MapOrigin.Type };
						}
						imageInfo.IsMaintainAspect = this.layerInEdit.IsMaintainAspect;
						imageInfo.IsConstrainedTo90 = this.layerInEdit.IsConstrainedTo90;
					}
				}
				else if (this.layerInEdit.LayerFormat === LayerFormat.PlatformImage) {
					let imageName = this.layerInEdit.ImageName
					let imageInfo: PlatformImageInfo = this.locationInEdit.MapSettings.AvailablePlatformImages.find((elem) => { return (elem.Image.Label === imageName); });
					if (imageInfo) {
						imageInfo.Anchors = this.layerInEdit.Anchors.slice();
						imageInfo.Rotation = this.layerInEdit.Rotation;
						if (this.layerInEdit.MapOrigin) {
							imageInfo.MapOrigin = { Coordinates: [this.layerInEdit.MapOrigin.Coordinates[0], this.layerInEdit.MapOrigin.Coordinates[1]], Type: this.layerInEdit.MapOrigin.Type };
						}
					}
				}

				this.saveLayer = null;
				this.layerInEdit = null;
				this.layerInEditIdx = -1;

				this.isLayerDefShown = false;
				this.changeRef.detectChanges();
			}
			else {
				this.saveErrorDialog.show();
			}
		}
		else {
			this.userService.currentUser.tenant = this.userTenantInEdit;
			let temp = JSON.stringify(this.userTenantInEdit);
			this.userService.currentUser.childTenants = this.childTenantsInEdit;
			this.adminService.saveTenant(this.userService.currentUser.tenant);
			if (this.childTenantsInEdit && this.childTenantsInEdit.length > 0) {
				for (let tenant of this.childTenantsInEdit) {
					this.adminService.saveTenant(tenant);
				}
			}
			this.cloneUserTenant();
			this.mapUtilityService.setUserTenantInfo(this.userTenantInEdit, this.childTenantsInEdit);
		}
	}

	public cancelEdits() {
		if (this.isLayerDefShown) {
			this.saveBtnText = 'Save Settings';
			this.layerDef.cancelEdits();
			if (this.layerInEditIdx !== -1) {
				if (this.activeLayer) {
					this.locationInEdit.MapSettings.Layers[this.layerInEditIdx] = this.saveLayer;
				}
				else {
					this.locationInEdit.MapSettings.Layers[this.layerInEditIdx] = this.saveLayer;
				}
			}
			else {
				this.locationInEdit.MapSettings.Layers.splice(this.locationInEdit.MapSettings.Layers.length - 1, 1);
			}

			this.saveLayer = null;
			this.layerInEdit = null;
			this.layerInEditIdx = -1;
			this.layerDef.clearAllLayerMapData();
			this.mapUtilityService.redrawLayers();
			this.isLayerDefShown = false;
			this.changeRef.markForCheck();
		}
		else {
			this.cloneUserTenant();
			this.mapUtilityService.setUserTenantInfo(this.userTenantInEdit, this.childTenantsInEdit);
			this.mapUtilityService.redrawLayers();
			this.locationChanged("mapSettings");
		}
	}

	public validateLayerDef(): boolean {
		let isValid: boolean = true;
		if (!this.layerInEdit.Name || this.layerInEdit.Name === "") {
			this.errorMessage = 'The layer must have a name.';
			isValid = false;
		}
		else if (!this.layerInEdit.URL || this.layerInEdit.URL === "") {
			this.errorMessage = 'A URL must be defined for the layer.';
			isValid = false;
		}

		return (isValid);
	}

	public hideErrorDialog() {
		this.saveErrorDialog.hide();
		this.errorMessage = "";
	}

	public assignImageToRobot(idx: number, activeLayer: boolean) {
		let platformImageInfo: PlatformImageInfo = new PlatformImageInfo(null);
		let layerName: string;
		if (activeLayer) {
			platformImageInfo.Image = new Image(null);
			platformImageInfo.Image.Label = this.locationInEdit.MapSettings.Layers[idx].ImageName
			platformImageInfo.MapOrigin = this.locationInEdit.MapSettings.Layers[idx].MapOrigin;
			platformImageInfo.Rotation = this.locationInEdit.MapSettings.Layers[idx].Rotation;
			layerName = this.locationInEdit.MapSettings.Layers[idx].Name;
		}
		else {
			platformImageInfo.Image = new Image(null);
			platformImageInfo.Image.Label = this.locationInEdit.MapSettings.AvailableLayers[idx].ImageName
			platformImageInfo.MapOrigin = this.locationInEdit.MapSettings.AvailableLayers[idx].MapOrigin;
			platformImageInfo.Rotation = this.locationInEdit.MapSettings.AvailableLayers[idx].Rotation;
			layerName = this.locationInEdit.MapSettings.AvailableLayers[idx].Name;
		}

		this.linkRobot.setPlatformInfo(this.locationInEdit.Id, platformImageInfo, layerName);
		this.linkRobot.show();
	}
}