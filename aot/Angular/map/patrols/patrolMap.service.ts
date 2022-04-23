import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import { PatrolTemplate, PatrolInstance, PatrolStatus, PatrolStatusValues } from '../../patrols/patrol.class';
import { PointTemplate, PointInstance, PointStatus, PointStatusValues } from '../../patrols/point.class';
import { ActionInstance, ActionStatus, ActionStatusValues } from '../../patrols/action.class';
import { MapService } from '../map.service';
import { PatrolService } from '../../patrols/patrol.service';
import { PatrolBuilderService } from '../../patrolBuilder/patrol-builder.service';
import { NavigationService } from '../../shared/navigation.service';

export enum PatrolMapInteractMode {
	None,
	Append,
	Prepend,
	Edit
}

@Injectable()
export class PatrolMapService extends MapService {

	public interactMode: PatrolMapInteractMode = PatrolMapInteractMode.None;

	activePatrol: PatrolTemplate | PatrolInstance;
	activeTemplate: PatrolTemplate;
	activeInstance: PatrolInstance;
	pointCount: number = 0;
	redraw: boolean = false;
	patrolGroup: L.FeatureGroup;
	patrolMarkers: L.SmartCommandMarker[];
	patrolPolylines: L.Polyline[];
	dynamicLine: L.Polyline[];
	lastPoint: PointTemplate;
	polylineColor: string = '#0FADDF';
	polylineHighlightColor: string = '#42f4f4' ;
	pathOptions: L.PolylineOptions;
	reachedPathOptions: L.PolylineOptions;
	notReachedPathOptions: L.PolylineOptions;
	dynamicPathOptions: L.PolylineOptions;
	iconOptions: any;
	markerOptions: L.MarkerOptions = { interactive: false };
	tooltip: L.Tooltip;
    protected keyPressFunc: EventListener;

	public onClick: Subject<any> = new Subject;
	public patrolPointAdded: Subject<any> = new Subject();
	public finishAddPatrol: Subject<PatrolTemplate> = new Subject();
	public markerDragged: Subject<L.SmartCommandMarker> = new Subject();
	public activePatrolSet: Subject<any> = new Subject();
	public activePatrolCleared: Subject<any> = new Subject();
    public scaleFactor: number = 1;

	delay: number = 250;
	prevent: boolean = false;
    timer: NodeJS.Timer = null;

	constructor(
        protected patrolService: PatrolService,
        protected patrolBuilderService: PatrolBuilderService,
        protected ngzone: NgZone,
		protected navigationService: NavigationService) {
		//Load fake data for now
		super(navigationService);
		this.patrolMarkers = [];
		this.patrolPolylines = [];
		this.activePatrol = null;
        this.pathOptions = { dashArray: (5 * this.scaleFactor) + ',' + (10 * this.scaleFactor), color: this.polylineColor, weight: (5 * this.scaleFactor), interactive: false };
        this.reachedPathOptions = { dashArray: null, weight: (5 * this.scaleFactor), color: '#a7b5b9' };
		this.notReachedPathOptions = { color: '#a7b5b9' };
		this.dynamicPathOptions = { color: '#0FADDF', weight: 5, opacity: .5, interactive: false };
        this.iconOptions = { iconSize: [(40 * this.scaleFactor), (40 * this.scaleFactor)], iconAnchor: [(20 * this.scaleFactor), (20 * this.scaleFactor)] };
		this.dynamicLine = [];
		//this.activePatrol = new PatrolTemplate(null);
		//this.activePatrol.Points = [];
		this.pointCount = 0;

		this.patrolService.onPatrolSelectionChange
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (patrolTemplateId) => this.patrolSelected(patrolTemplateId)
			});

		this.patrolService.onNewInstance
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (patrolInstance) => this.newPatrolInstance(patrolInstance)
			});

		//this.patrolService.onPatrolInstanceComplete
		//	.takeUntil(this.ngUnsubscribe)
		//	.subscribe({
		//		next: (patrolInstance) => this.patrolInstanceComplete(patrolInstance)
		//	});

		this.patrolService.onPatrolTemplateDeleted
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (templateId) => this.patrolTemplateDeleted(templateId)
			});
	}

    protected ngUnsubscribe: Subject<void> = new Subject<void>();

    protected patrolSelected(patrolTemplateId: string) {
		if (!patrolTemplateId) {
			this.clearPatrol();
		}
		else {
			this.setInteractMode(PatrolMapInteractMode.None);
			let patrol: any = this.patrolService.getPatrolInstance(patrolTemplateId);
			if (!patrol) {
				patrol = this.patrolService.getPatrolTemplate(patrolTemplateId);
			}

			if (patrol) {
				this.setActivePatrol(patrol);
				setTimeout(() => { this.zoomToPatrolBounds(); }, 100);
			}
		}
	}

	public newPatrolInstance(patrolInstance: PatrolInstance) {
		if (this.activePatrol && this.activePatrol.TemplateId === patrolInstance.TemplateId &&
			this.interactMode === PatrolMapInteractMode.None) {
			this.clearPatrol();
			setTimeout(() => {
				this.setActivePatrol(patrolInstance);
			});
		}
	}

	//private patrolInstanceComplete(patrolInstance: PatrolInstance) {
		//if (this.activePatrol && this.activePatrol.id == patrolInstance.id) {
		//	this.clearPatrol();
		//	let patrol = this.patrolService.getPatrolTemplate(patrolInstance.TemplateId);
		//	if (patrol) {
		//		this.setActivePatrol(patrol);
		//	}
		//}
	//}

	public patrolTemplateDeleted(templateId: string) {
		if (this.activePatrol && this.activePatrol.id === templateId) {
			this.clearPatrol();
		}
	}

	public isPatrolTemplate(arg: any): arg is PatrolTemplate {
		if (arg && arg.IsTemplate)
			return (arg);
		else
			return (null);
	}

	public getActivePatrolPoints() {
		if (!this.activePatrol || !this.activePatrol.Points)
			return (null);
		else
			//return this.activePatrol.Points.slice(0);
			return this.activePatrol.Points;
	}

	public getActivePatrolPointCount() {
		return (this.pointCount);
	}

	public setMap(map: L.Map) {
		super.setMap(map);
		if (map) {
			this.patrolGroup = L.featureGroup();
			this.map.addLayer(this.patrolGroup);
		}
		else {
			this.patrolGroup = null;
		}
	}

	public setInteractMode(mode: PatrolMapInteractMode) {
		if (!this.map) {
			return;
		}

		let container: any = this.map.getContainer();

		this.interactMode = mode;
		if (mode === PatrolMapInteractMode.Append || mode === PatrolMapInteractMode.Prepend) {
			container.style.cursor = 'url("content/images/patrols/map-tool-cursor-md-add.cur"), auto';
			(<any>this.map)._container.style.cursor = 'url("content/images/patrols/map-tool-cursor-md-add.png") 6 6, crosshair';

			if (this.activePatrol && this.activePatrol.Points.length === 0) {
				let content: L.Content;

				content = '<div class="map-tooltip-content">' +
					'<div>Click on the map to draw patrol points</div>' +
					'<div>for the patrol. Double-click on the</div>' +
					'<div>map or press the escape key to end.</div></div>';
				this.createTooltip(content);
				this.openTooltip();
			}
		} else if (mode === PatrolMapInteractMode.Edit) {
			this.map.off('click', this.onMapClick, this);
			this.map.off('mousemove', this.onMapDynamicPoint, this);
			this.map.off('dblclick', this.onMapDblClick, this);

			this.removeDynamics();

			container.style.cursor = 'url("content/images/patrols/map-tool-cursor-md-add.cur"), auto';
			container.style.cursor = 'url("content/images/patrols/map-tool-cursor-md-add.png") 6 6, crosshair';
		} else {
			container.style.cursor = '';
		}

		this.setEvents();
	}

	public createTooltip(content: L.Content) {
		if (!this.tooltip) {
			let options: L.TooltipOptions = { direction: 'right', offset: L.point(30, 25), sticky: true, className:'map-tooltip' };
			this.tooltip = L.tooltip(options);
			let bounds = this.map.getBounds().pad(0.25); // slightly out of screen 
			let lat = bounds.getNorth();
			let lng = bounds.getCenter().lng;
			this.tooltip.setLatLng(new L.LatLng(lat, lng));
			this.tooltip.setContent(content);
 		}
	}

	public openTooltip() {
		if (this.tooltip) {
			this.map.openTooltip(this.tooltip);
			this.map.on('mousemove', this.updateTooltip, this);
		}
	}

	public updateTooltip(evt: any) {
		if (this.tooltip)
			this.tooltip.setLatLng(evt.latlng);
	}

    protected closeTooltip() {
		if (this.tooltip) {
			this.map.off('mousemove', this.updateTooltip);
			this.map.closeTooltip(this.tooltip);
			this.tooltip = null;
		}
	}

    protected removeDynamics() {
		// Remove the dynamic line if needed
		if (this.dynamicLine[0]) {
			this.patrolGroup.removeLayer(this.dynamicLine[0]);
			this.dynamicLine[0] = null;
		}
	}

	//((e: any) => { this.ngzone.run(() => this.appendPointHandler(e)); this.afterAppendPoint(); })
	public onMapClick(e: any) {
		this.closeTooltip();
		this.timer = setTimeout(() => {
			if (!this.prevent) {
				if (this.interactMode === PatrolMapInteractMode.Append) {
					this.ngzone.run(() => this.appendPointHandler(e));
					this.afterAppendPoint();
				} else if (this.interactMode === PatrolMapInteractMode.Prepend) {
					this.ngzone.run(() => this.prependPointHandler(e));
					this.afterPrependPoint();
				}
			}
			this.prevent = false;
		}, this.delay);
	}

	public onMapDblClick(e: any) {
		this.prevent = true;
		clearTimeout(this.timer);
		this.finishAdd();
	}

    protected onMapDynamicPoint(e: any) {
		// In case someone has not set the active patrol
		if (!this.activePatrol)
			return;

		// Sets a dynamic polyline from the last point of the patrol to the cursor
		if (this.activePatrol.Points.length > 0) {
			let pts: any[] = [];

			if (this.interactMode === PatrolMapInteractMode.Append) {
				let lat = this.activePatrol.Points[this.activePatrol.Points.length - 1].Position.Coordinates[1];
				let lng = this.activePatrol.Points[this.activePatrol.Points.length - 1].Position.Coordinates[0];
				pts[0] = L.latLng([lat, lng]);
			} else if (this.interactMode === PatrolMapInteractMode.Prepend) {
				let lat = this.activePatrol.Points[0].Position.Coordinates[1];
				let lng = this.activePatrol.Points[0].Position.Coordinates[0];
				pts[0] = L.latLng([lat, lng]);
			}

			pts[1] = e.latlng;

			if (!this.dynamicLine[0]) {
				this.dynamicLine[0] = L.polyline(pts, this.dynamicPathOptions);
				this.patrolGroup.addLayer(this.dynamicLine[0]);
			} else {
				this.dynamicLine[0].setLatLngs(pts);
			}
		}
	}

	public onMapMouseOut(e: any) {
		if (this.interactMode === PatrolMapInteractMode.Append || this.interactMode === PatrolMapInteractMode.Prepend) {
			let polyline = this.dynamicLine[0];
			if (polyline) {
				polyline.setStyle({ opacity: 0 });
			}
		}

		this.map.on('mouseover', this.onMapMouseOver, this);
	}

    protected onMapMouseOver(e: any) {
		if (this.interactMode === PatrolMapInteractMode.Append || this.interactMode === PatrolMapInteractMode.Prepend) {
			let polyline = this.dynamicLine[0];
			if (polyline) {
				polyline.setStyle({ opacity: 1 });
			}
		}

		this.map.off('mouseover', this.onMapMouseOver, this);
	}

    protected onMapKeypress(e:any) {
		if (e.code === 'Escape') {
			this.finishAdd();
		}
	}

	public onMarkerClick(patrolPoint: PointTemplate) {
		let patrol = this.activePatrol;
		this.closeTooltip();

		if (patrolPoint.Ordinal === 1 || patrolPoint.Ordinal === patrol.Points.length) {
			let mode: PatrolMapInteractMode;

			if (patrolPoint.Ordinal === patrol.Points.length) {
				mode = PatrolMapInteractMode.Append;
			}
			else if (patrolPoint.Ordinal === 1) {
				mode = PatrolMapInteractMode.Prepend;
			}

			this.timer = setTimeout(() => {
				if (!this.prevent) {
					let patrol = this.activePatrol;
					this.clearPatrol();

					setTimeout(() => {
						this.setInteractMode(mode);
						this.setActivePatrol(patrol);
					}, 100);
				}
				this.prevent = false;
			}, this.delay);
		}
	}

	public onMarkerMouseOver(event: any) {
	}

	public onMarkerMouseOut(event: any) {
	}

	public onMarkerMoveEnd(event: any) {
	}

	public onMarkerDrag(event: any) {
		this.closeTooltip();
		this.dynamicMoveMarker(event);
		this.markerDragged.next(event.target);
	}

    protected onPolylineMouseOut(e: any) {
		let polyline = e.target;
		polyline.setStyle({ color: this.polylineColor });
		this.map.closeTooltip();
	}

    protected onPolylineMouseOver(e: any) {
		let polyline: L.SmartCommandPolyline = e.target;
		polyline.setStyle({ color: this.polylineHighlightColor });
	}

    protected onPolylineClick(e: any) {
		this.closeTooltip();
		let patrolPoint = e.target.StartMarker.Data;
		this.patrolBuilderService.insertPatrolPointAfter(this.getActivePatrolTemplate(), patrolPoint, e.latlng.lat, e.latlng.lng);
	}

	public appendPointToActivePatrol(lat: number, lng: number): any {
		this.patrolBuilderService.appendPatrolPoint(this.activeTemplate, lat, lng);
		this.pointCount = this.activePatrol.Points.length;
		return true;
	}

	public prependPointToActivePatrol(lat: number, lng: number): any {
		this.patrolBuilderService.prependPatrolPoint(this.activeTemplate, lat, lng);
		this.pointCount = this.activePatrol.Points.length;
		return true;
	}

    protected setMapEvents() {
		if (!this.map) {
			return;
		}
		if (this.interactMode === PatrolMapInteractMode.Append || this.interactMode === PatrolMapInteractMode.Prepend) {
			this.map.on('click', this.onMapClick, this);
			this.map.on('mousemove', this.onMapDynamicPoint, this);
			this.map.on('dblclick', this.onMapDblClick, this);
			this.map.on('mouseout', this.onMapMouseOut, this);
			this.keyPressFunc = this.onMapKeypress.bind(this);
			document.addEventListener('keydown', this.keyPressFunc, true);
		} else {
			this.map.off('click', this.onMapClick, this);
			this.map.off('mousemove', this.onMapDynamicPoint, this);
			this.map.off('dblclick', this.onMapDblClick, this);
			this.map.off('mouseout', this.onMapMouseOut, this);

			if (this.keyPressFunc) {
				document.removeEventListener('keydown', this.keyPressFunc, true);
				this.keyPressFunc = null;
			}
		}
	}

    protected setEvents() {
		this.setMapEvents();
		if (Object.keys(this.patrolMarkers).length > 0) {
			for (let marker of this.patrolMarkers) {
				this.setMarkerEvents(marker);
			}
		}

		if (Object.keys(this.patrolPolylines).length > 0) {
			for (let polyline of this.patrolPolylines) {
				this.setPolylineEvents(polyline);
			}
		}
	}

    protected setMarkerEvents(marker: L.SmartCommandMarker) {
		if (this.interactMode === PatrolMapInteractMode.Edit) {
			marker.off();
//			marker.on('click', this.onMarkerClick, this);
//			marker.on('dblClick', this.onMarkerDblClick, this);
			marker.on('mouseover', this.onMarkerMouseOver, this);
			marker.on('mouseout', this.onMarkerMouseOut, this);
			marker.on('drag', this.onMarkerDrag, this);
			marker.on('moveend', this.onMarkerMoveEnd, this);
		} else if (this.interactMode === PatrolMapInteractMode.Append || this.interactMode === PatrolMapInteractMode.Prepend) {
			marker.off();
		} else if (this.interactMode === PatrolMapInteractMode.None) {
			marker.off();
		}
	}

    protected setPolylineEvents(polyline: L.Polyline) {
		if (this.interactMode === PatrolMapInteractMode.Edit) {
			polyline.on('click', this.onPolylineClick, this);
			polyline.on('mouseover', this.onPolylineMouseOver, this);
			polyline.on('mouseout', this.onPolylineMouseOut, this);
		} else if (this.interactMode === PatrolMapInteractMode.Append || this.interactMode === PatrolMapInteractMode.Prepend) {
			polyline.off('click', this.onPolylineClick, this);
			polyline.off('mouseover', this.onPolylineMouseOver, this);
			polyline.off('mouseout', this.onPolylineMouseOut, this);
		} else if (this.interactMode === PatrolMapInteractMode.None) {
			polyline.off('click', this.onPolylineClick, this);
			polyline.off('mouseover', this.onPolylineMouseOver, this);
			polyline.off('mouseout', this.onPolylineMouseOut, this);
		}
	}

	public mapClicked(e: any) {
		this.onClick.next(e);
	}

    protected appendPointHandler(e: any) {
		this.appendPointToActivePatrol(e.latlng.lat, e.latlng.lng);
	}

    protected afterAppendPoint() {
	}

    protected prependPointHandler(e: any) {
		this.prependPointToActivePatrol(e.latlng.lat, e.latlng.lng);
	}
    protected afterPrependPoint() {
	}

    protected dynamicMoveMarker(e: any) {
		// In case someone has not set the active patrol
		if (!this.activePatrol || Object.keys(this.patrolPolylines).length === 0)
			return;

		let marker = e.target;
		let index = marker.Number;
		let patrolPoint:PointTemplate = marker.Data;
		// Sets a dynamic polyline from the last point of the patrol to the cursor
		let pts: L.LatLng[] = [];

		if (Object.keys(this.patrolPolylines).length >= index) {
			let polylineAfter = this.patrolPolylines[patrolPoint.PointId];
			pts = polylineAfter.getLatLngs();

			pts[0] = e.latlng;
			polylineAfter.setLatLngs(pts);
		}

		if (index > 1) {
			patrolPoint = this.activePatrol.Points[index - 2];
			let polylineBefore = this.patrolPolylines[patrolPoint.PointId];
			pts = polylineBefore.getLatLngs();

			pts[1] = e.latlng;
			polylineBefore.setLatLngs(pts);
		}

		this.activePatrol.Points[index - 1].Position.Coordinates = [e.latlng.lng,e.latlng.lat];
	}

    protected finishAdd() {
		this.finishAddPatrol.next(this.activeTemplate);

	}
		
	public addPatrolPointToMap(patrolPoint: PointTemplate) {
		// Use SmartCommandMarker that pulls angular component from dom to use as marker
		let id = patrolPoint.PointId;
		this.iconOptions.targetId = id;
		let icon = new L.SmartCommandIcon(this.iconOptions);
		this.markerOptions.icon = icon;
		this.markerOptions.interactive = (this.interactMode == PatrolMapInteractMode.Edit);
		this.markerOptions.draggable = (this.interactMode == PatrolMapInteractMode.Edit);
		let marker: L.SmartCommandMarker =
			new L.SmartCommandMarker(new L.LatLng(patrolPoint.Position.Coordinates[1], patrolPoint.Position.Coordinates[0]), this.markerOptions)
		marker.Number = patrolPoint.Ordinal;
		marker.Data = patrolPoint;
		marker.Type = L.ScMarkerTypes.Patrol;
		marker.Selected = false;

		this.patrolGroup.addLayer(marker);
		this.patrolMarkers[patrolPoint.PointId] = marker;
		this.setMarkerEvents(marker);

		if (!patrolPoint.IsInserted) {
			this.addPatrolPolylineToMap(marker, patrolPoint);
		} else {
			this.insertPatrolPolylineOnMap(marker, patrolPoint);
		}
		this.patrolPointAdded.next(patrolPoint);
	}
	public addPatrolPolylineToMap(marker: L.SmartCommandMarker, patrolPoint: PointTemplate) {
		let prepend = false;
		let prevPoint;
		let startMarker;
		let endMarker;

		// Check if we are prepending the point/marker to the beginning of the patrol.
		if (Object.keys(this.patrolMarkers).length > 1) {
			if (marker.Number === 1) {
				prepend = true;
				prevPoint = this.activePatrol.Points[1];
				startMarker = marker;
				endMarker = this.patrolMarkers[prevPoint.PointId];
			} else {
				prevPoint = this.activePatrol.Points[patrolPoint.Ordinal - 2];
				startMarker = this.patrolMarkers[prevPoint.PointId];
				endMarker = marker;
			}

			if (prevPoint) {
				let pts: L.LatLngExpression[] = [];
				if (prepend) {
					pts[0] = L.latLng(patrolPoint.Position.Coordinates[1], patrolPoint.Position.Coordinates[0]);
					pts[1] = L.latLng(prevPoint.Position.Coordinates[1], prevPoint.Position.Coordinates[0]);
				} else {
					pts[0] = L.latLng(prevPoint.Position.Coordinates[1], prevPoint.Position.Coordinates[0]);
					pts[1] = L.latLng(patrolPoint.Position.Coordinates[1], patrolPoint.Position.Coordinates[0]);
				}

				let pathOp: L.PolylineOptions = this.getPathOptions(endMarker);
				pathOp.interactive = (this.interactMode === PatrolMapInteractMode.Edit);
				let tmpline: L.SmartCommandPolyline = new L.SmartCommandPolyline(pts, pathOp);
				tmpline.StartMarker = startMarker;
				tmpline.EndMarker = endMarker;
				this.patrolPolylines[startMarker.Data.PointId] = tmpline;

				startMarker.PatrolPolyline = tmpline;
				this.patrolGroup.addLayer(tmpline);
				this.setPolylineEvents(tmpline);
			}
		}
	}

	public insertPatrolPolylineOnMap(marker: L.SmartCommandMarker, patrolPoint: PointTemplate) {
		patrolPoint.IsInserted = false;

		let prevPoint: PointTemplate = this.activePatrol.Points[patrolPoint.Ordinal - 2];
		let prevPolyline: L.SmartCommandPolyline = this.patrolPolylines[prevPoint.PointId];
		let prevEndMarker = prevPolyline.EndMarker;
		let pts: L.LatLng[] = prevPolyline.getLatLngs();
		let endPt: L.LatLng = pts[1];

		pts[1] = L.latLng(patrolPoint.Position.Coordinates[1], patrolPoint.Position.Coordinates[0]);
		prevPolyline.setLatLngs(pts);
		prevPolyline.EndMarker = marker;

		pts[0] = L.latLng(patrolPoint.Position.Coordinates[1], patrolPoint.Position.Coordinates[0]);
		pts[1] = L.latLng(endPt.lat, endPt.lng);

		this.pathOptions.interactive = (this.interactMode === PatrolMapInteractMode.Edit);
		let tmpline: L.SmartCommandPolyline = new L.SmartCommandPolyline(pts, this.pathOptions);
		tmpline.StartMarker = marker;
		tmpline.EndMarker = prevEndMarker;
		this.patrolPolylines[marker.Data.PointId] = tmpline;

		marker.PatrolPolyline = tmpline;
		this.patrolGroup.addLayer(tmpline);
		this.setPolylineEvents(tmpline);
	}

	public getPathOptions(endMarker: L.SmartCommandMarker): L.PolylineOptions {
		if (this.interactMode === PatrolMapInteractMode.Edit ||
			this.interactMode === PatrolMapInteractMode.Append ||
			this.interactMode === PatrolMapInteractMode.Prepend) {
			return (this.pathOptions);
		} else if (this.interactMode === PatrolMapInteractMode.None) {
			if (endMarker.Data.CurrentStatus === PointStatusValues.NotReached) {
				return (this.notReachedPathOptions);
			} else if (endMarker.Data.CurrentStatus === PointStatusValues.Reached) {
				return (this.reachedPathOptions);
			} else {
				return (this.pathOptions);
			}
		}
	}

	public removePatrolPointFromMap(patrolPoint: PointTemplate) {

		let marker = this.patrolMarkers[patrolPoint.PointId];
		let polyline = marker.PatrolPolyline;

		// If we are not just clearing the patrol, deal with the polylines.
		if (this.activePatrol) {
			let endMarker: L.SmartCommandMarker;
			let endPt: L.LatLng;
			let prevPoint: PointTemplate;
			let prevPolyline: L.SmartCommandPolyline;
			let prevMarker: L.SmartCommandMarker;

			if (patrolPoint.Ordinal > 1) {
				prevPoint = this.activePatrol.Points[patrolPoint.Ordinal - 2];
				prevPolyline = this.patrolPolylines[prevPoint.PointId];
				prevMarker = this.patrolMarkers[prevPoint.PointId];
			}

			if (polyline) {
				let pts = polyline.getLatLngs();
				endPt = L.latLng(pts[1].lat, pts[1].lng);
				endMarker = polyline.EndMarker;
			}

			if (prevPolyline) {
				if (polyline) {
					let pts = prevPolyline.getLatLngs();
					pts[1] = endPt;
					prevPolyline.setLatLngs(pts);
					prevPolyline.EndMarker = endMarker;
				} else {
					this.patrolGroup.removeLayer(prevPolyline);
					delete this.patrolPolylines[marker.Data.PointId];
					prevMarker.PatrolPolyline = null;
				}
			}
		}

		if (polyline) {
			this.patrolGroup.removeLayer(polyline);
			delete this.patrolPolylines[marker.Data.PointId];
		}

		this.patrolGroup.removeLayer(marker);
		delete this.patrolMarkers[patrolPoint.PointId];

		this.pointCount--;
	}
	public getPatrolMarker(pointId: string) {
		if (this.patrolMarkers) {
			return this.patrolMarkers[pointId];
		}
	}
	public clearPatrol() {
		if (this.map) {
			this.setInteractMode(PatrolMapInteractMode.None);
			this.closeTooltip();
			this.removeDynamics();
		// Reset the cursor
			this.map.getContainer().style.cursor = '';
		}

		this.activePatrol = null;
		this.activePatrolCleared.next();
	}

	public setActivePatrol(patrol: any) {
		if (!patrol) {
			return;
		}
		if (patrol.IsTemplate)
			this.activeTemplate = patrol;
		else
			this.activeInstance = patrol;

		this.activePatrol = patrol;
		if (!this.activePatrol.Points)
			this.activePatrol.Points = [];
		this.pointCount = this.activePatrol.Points.length;

		this.activePatrolSet.next(this.activePatrol);
	}

	public getActivePatrol(): PatrolTemplate | PatrolInstance {
		return (this.activePatrol);
	}

	public getActivePatrolTemplate(): PatrolTemplate {
		return (this.activeTemplate) ;
	}

	public getPatrolMarkerSrc(patrolPoint: PointTemplate, patrol: PatrolTemplate) {
		if (patrolPoint.Ordinal === 1)
			return ('../../Content/Images/Patrols/first-point.png');
		else if (patrolPoint.Ordinal > 1 && (patrolPoint.Actions && patrolPoint.Actions.length > 0))
			return ('../../Content/Images/Patrols/checkpoint-icon.png');
		else if (patrolPoint.Ordinal > 1 && patrolPoint.Ordinal === patrol.Points.length)
			return ('../../Content/Images/Patrols/last-point.png');
		else
			return ('../../Content/Images/Patrols/patrol-point.png');
	}

	public toggleRedraw() {
		this.redraw = !this.redraw;
		return (this.redraw);
	}

	public zoomToPatrolBounds()
	{
		if (this.map) {
			let fitBoundsOptions: L.FitBoundsOptions = { padding: [5, 5] };
			let pts = [];
			for (let point of this.activePatrol.Points) {
				pts.push(L.latLng(point.Position.Coordinates[1], point.Position.Coordinates[0]));
			}
			if (pts.length > 1) {
				this.map.fitBounds(L.latLngBounds(pts).pad(0.3));
			}
		}
    }

    public refreshOptions(): void {
        this.pathOptions = { dashArray: (5 * this.scaleFactor) + ',' + (10 * this.scaleFactor), color: this.polylineColor, weight: (5 * this.scaleFactor), interactive: false };
        this.iconOptions = { iconSize: [(40 * this.scaleFactor), (40 * this.scaleFactor)], iconAnchor: [(20 * this.scaleFactor), (20 * this.scaleFactor)] };
        this.reachedPathOptions = { dashArray: null, weight: (5 * this.scaleFactor), color: '#a7b5b9' };
    }
}