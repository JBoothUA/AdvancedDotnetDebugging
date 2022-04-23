import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolTemplate, PatrolType, AreaType } from '../patrols/patrol.class';
import { PointTemplate } from '../patrols/point.class';
import { ActionDefinition} from '../patrols/action.class';

import { Tenant } from '../shared/tenant.class';
import { LocationFilterService } from '../shared/location-filter.service';
import { HttpService } from '../shared/http.service';
import { UserService } from '../shared/user.service';

@Injectable()
export class PatrolBuilderService {
	private selectedActionDef: ActionDefinition;
	private patrolApiBaseUrl: string = '/patrols/';

	public actionDefSelChanged: Subject<any> = new Subject();
	public patrolPointSelChanged: Subject<any> = new Subject();
	public patrolPointAdded: Subject<any> = new Subject();
	public patrolPointRemoved: Subject<any> = new Subject();
	public patrolPointModified: Subject<any> = new Subject();
	public patrolPointEditSelected: Subject<any> = new Subject();

	constructor(
		private httpService: HttpService,
		private userService: UserService,
		private patrolService: PatrolService,
		private locFilterService: LocationFilterService) {

	}

	public getActiveTenantID(): string {
		let tenantId: string;
		let mapviewTenants: Tenant[] = this.locFilterService.getSelectedTenantLocations('mapview');
		if (mapviewTenants && mapviewTenants.length > 0) {
			tenantId = mapviewTenants[0].Id;
		}
		else {
			mapviewTenants = this.locFilterService.getAllTenantLocations('mapview');
			if (mapviewTenants && mapviewTenants.length > 0) {
				tenantId = mapviewTenants[0].Id;
			}
		}

		return (tenantId);
	}

	public getActiveLocationID(): string {
		let locationId: string;
		let mapviewTenants: Tenant[] = this.locFilterService.getSelectedTenantLocations('mapview');
		if (mapviewTenants && mapviewTenants.length > 0) {
			if (mapviewTenants[0].Locations && mapviewTenants[0].Locations.length > 0) {
				locationId = mapviewTenants[0].Locations[0].Id;
			}
		}
		else {
			mapviewTenants = this.locFilterService.getAllTenantLocations('mapview');
			if (mapviewTenants && mapviewTenants.length > 0) {
				if (mapviewTenants[0].Locations && mapviewTenants[0].Locations.length > 0) {
					locationId = mapviewTenants[0].Locations[0].Id;
				}
			}
		}
		return (locationId);
	}
	// Patrol Builder methods

	public selectOnlyPatrolPoint(patrol: PatrolTemplate, pointId: string) {
		this.deselectAllPatrolPoints(patrol);
		this.selectPatrolPoint(patrol, pointId);
	}
	public selectPatrolPoint(patrol: PatrolTemplate, pointId: string) {
		let index = this.indexOf(patrol, pointId);
		if (index === -1)
			return;
		patrol.Points[index].Selected = true;
		this.patrolPointSelChanged.next(patrol.Points[index]);
	}

	public deselectPatrolPoint(patrol: PatrolTemplate, pointId: string) {
		let index = this.indexOf(patrol, pointId);
		if (index === -1)
			return;
		patrol.Points[index].Selected = false;
		this.patrolPointSelChanged.next(patrol.Points[index]);
	}

	public deselectAllPatrolPoints(patrol: PatrolTemplate) {
		for (let ii = 0; ii < patrol.Points.length; ii++) {
			patrol.Points[ii].Selected = false;
		}
	}

	public getSelectedPatrolPointCount(patrol: PatrolTemplate) {
		let count: number = 0;
		for (let ii = 0; ii < patrol.Points.length; ii++) {
			if (patrol.Points[ii].Selected === true)
				count++;
		}
		return (count);
	}

 	private indexOf(patrol: PatrolTemplate, pointId: string): number {

		for (let ii = 0; ii < patrol.Points.length; ii++) {
			if (patrol.Points[ii].PointId === pointId)
				return (ii);
		}
		return (-1);
	}
	public selectActionDef(actionDef: ActionDefinition) {

		actionDef.Selected = true;
		this.selectedActionDef = actionDef;

		this.actionDefSelChanged.next(actionDef.Selected);
	}

	public deselectActionDef(actionDef: ActionDefinition) {

		actionDef.Selected = false;
		this.selectedActionDef = null;

		this.actionDefSelChanged.next(actionDef.Selected);
	}

	public createNewPatrol(): PatrolTemplate {
		let patrol = new PatrolTemplate(null);
		patrol.TemplateId = this.createGUID();
		patrol.id = patrol.TemplateId;
		patrol.Type = -1;
		patrol.AreaType = -1;
		patrol.Points = [];
		patrol.TenantId = null;
		patrol.LocationId = null;
		patrol.Version = 0;
		patrol.IsDeleted = false;
		patrol.IsPatrolSubmitted = false;
		patrol.PlatformSubmittedId = null;
		patrol.DisplayName = null;
		return (patrol);
	}

	public savePatrol(patrol: PatrolTemplate) {
		let url = this.patrolApiBaseUrl + 'templates';
		this.httpService.put(url,patrol);
	}

	public isStep1Completed(patrol: PatrolTemplate) {
		if (patrol.DisplayName &&
			(patrol.AreaType === AreaType.Large || patrol.AreaType === AreaType.Perimeter || patrol.AreaType === AreaType.Small) &&
			(patrol.Type === PatrolType.Air || patrol.Type === PatrolType.Ground) && 
			(patrol.TemplateId && patrol.TemplateId !== '' && patrol.LocationId && patrol.LocationId !== '')) {
			return (true);
		}
		else
			return (false);
	}

	public notifyPatrolPointEditSelected(patrolPoint: PointTemplate) {
		this.patrolPointEditSelected.next(patrolPoint);
	}

	public notifyPatrolPointModified(patrolPoint: PointTemplate) {
		this.patrolPointModified.next(patrolPoint);
	}
	public appendPatrolPoint(patrol: PatrolTemplate, lat: number, lng: number): any {
		let patrolPoint = new PointTemplate(null);
		patrolPoint.PointId = this.createGUID();
		patrolPoint.DisplayName = 'Point ' + (patrol.Points.length + 1).toString();
		patrolPoint.Actions = [];
		patrolPoint.Ordinal = patrol.Points.length + 1;
		patrolPoint.Position = { Coordinates: [lng, lat], Type: 'Point' };
		patrol.Points.push(patrolPoint);

		this.patrolPointAdded.next(patrolPoint);

		return (patrolPoint);

	}

	public prependPatrolPoint(patrol: PatrolTemplate, lat: number, lng: number): any {
		let patrolPoint = new PointTemplate(null);
		patrolPoint.PointId = this.createGUID();
		patrolPoint.Ordinal = 1;
		patrolPoint.Actions = [];
		patrolPoint.Position = { Coordinates: [lng, lat], Type: 'Point' };
		patrol.Points.unshift(patrolPoint);

		this.setPointDisplayName(patrol, patrolPoint);

		this.updatePointOrdinalAndDisplayNames(patrol, patrolPoint, patrolPoint.Ordinal);
		//for (let ii = 1; ii < patrol.Points.length; ii++) {
		//	patrol.Points[ii].Ordinal = ii + 1;
		//	this.setPointDisplayName(patrol, patrol.Points[ii]);
		//}

		this.patrolPointAdded.next(patrolPoint);

		return (patrolPoint);

	}

	public insertPatrolPointAfter(patrol: PatrolTemplate, beforePoint: PointTemplate, lat: number, lng: number): any {
		let patrolPoint = new PointTemplate(null);
		patrolPoint.PointId = this.createGUID();
		patrolPoint.Ordinal = beforePoint.Ordinal + 1;
		patrolPoint.Actions = [];
		patrolPoint.Position = { Coordinates: [lng, lat], Type: 'Point' };
		patrolPoint.IsInserted = true;
		this.setPointDisplayName(patrol, patrolPoint);

		patrol.Points.splice((patrolPoint.Ordinal - 1), 0, patrolPoint);

		this.updatePointOrdinalAndDisplayNames(patrol, patrolPoint, patrolPoint.Ordinal);

		this.patrolPointAdded.next(patrolPoint);

		return (patrolPoint);

	}

	public removePatrolPoint(patrol: PatrolTemplate, patrolPoint: PointTemplate) {
		if (patrol && patrolPoint) {
			for (let ii = 0; ii < patrol.Points.length; ii++) {
				if (patrolPoint.PointId === patrol.Points[ii].PointId) {
					patrol.Points.splice(ii, 1);

					this.updatePointOrdinalAndDisplayNames(patrol, patrolPoint, ii);
					this.patrolPointRemoved.next(patrolPoint);
					break;
				}
			}

		}
	}

	public updatePointOrdinalAndDisplayNames(patrol: PatrolTemplate, patrolPoint: PointTemplate, startIndex: number) {
		let checkPtCnt = 1;
		for (let ii = 0; ii < patrolPoint.Ordinal - 1; ii++) {
			if (this.patrolService.isCheckPoint(patrol.Points[ii]) === true) {
				checkPtCnt++;
			}
		}

		for (let ii = startIndex; ii < patrol.Points.length; ii++) {
			let point = patrol.Points[ii];
			point.Ordinal = ii + 1;
			if (this.patrolService.isCheckPoint(point) === true) {
				point.DisplayName = "Checkpoint " + checkPtCnt.toString();
				checkPtCnt++;
			}
			else {
				point.DisplayName = 'Point ' + (point.Ordinal).toString();
			}
		}
	}

	public setPointDisplayName(patrol: PatrolTemplate, patrolPoint: PointTemplate) {
		if (this.patrolService.isCheckPoint(patrolPoint) === true) {
			let checkPtCnt = 1;
			for (let ii = 0; ii < patrolPoint.Ordinal - 1; ii++) {
				if (this.patrolService.isCheckPoint(patrol.Points[ii]) === true) {
					checkPtCnt++;
				}
			}
			patrolPoint.DisplayName = "Checkpoint " + checkPtCnt.toString();
		}
		else {
			patrolPoint.DisplayName = 'Point ' + (patrolPoint.Ordinal).toString();
		}
	}
	public createGUID() {
		let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			let cryptoObj = window.crypto;
			let r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});

		return (guid);
	}
}