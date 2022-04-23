import {
	Component,
	ChangeDetectionStrategy,
	Input,
	Output,
	EventEmitter,
	OnInit,
	NgZone,
	ChangeDetectorRef,
	ViewChild,
	ViewChildren,
	QueryList
} from '@angular/core';

import { PatrolTemplate, PatrolType } from '../patrols/patrol.class';
import { PointTemplate } from '../patrols/point.class';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolMapService, PatrolMapInteractMode } from '../map/patrols/patrolMap.service';
import { PatrolBuilderService } from './patrol-builder.service';
import { PatrolBuilderActionsDialog } from './patrol-builder-actionsDialog.component';
import { PatrolBuilderPointItem } from './patrol-builder-pointItem.component';
import { slideDown } from '../shared/animations';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { DragulaService } from 'ng2-dragula';
import { LocationFilterService } from "../shared/location-filter.service";
import { Tenant } from "../shared/tenant.class";
import { Modal } from '../shared/modal.component';
import { UserService } from '../shared/user.service';

@Component({
	selector: 'patrol-builder-step2',
	templateUrl: 'patrol-builder-step2.component.html',
	styleUrls: ['patrol-builder-step2.component.css'],
	providers: [DragulaService],
	animations: [
		slideDown
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatrolBuilderStep2 implements OnInit {

	@ViewChild(PatrolBuilderActionsDialog) actionsDialog: PatrolBuilderActionsDialog;
	@ViewChild(Modal) saveErrorDialog: Modal;
	@ViewChildren(PatrolBuilderPointItem) pointItemComps: QueryList<PatrolBuilderPointItem>;
	@Input() patrol: PatrolTemplate;
	@Input() expandedState: string;
	@Input() pointCount: number;
	@Input() redraw: boolean;

	@Output() onPatrolBuilderCancelled = new EventEmitter();
    @Output() onPatrolBuilderSaved = new EventEmitter();
    @Output() onToggleExpandedGroup = new EventEmitter<string>();

	public expandCollapseBtnText: string = 'Expand All';
	public expandCollapseBtnTooltip: string = 'Expand All Actions';

	private ngUnsubscribe: Subject<void> = new Subject<void>();

	public numCheckpoints: number = 0;
	public numCheckpointsExpanded: number = 0;
	private patrolHasActions: boolean = false;

	public warningIcon: string;

	PatrolType: typeof PatrolType = PatrolType;

	constructor(
		private patrolService: PatrolService,
		private patrolBuilderService: PatrolBuilderService,
		private patrolMapService: PatrolMapService,
		private locFilterService: LocationFilterService,
		private userService: UserService,
		private ngzone: NgZone,
		private changeRef: ChangeDetectorRef) {	}

    public setToggleState(state: string): void {
        this.expandedState = state;
        this.changeRef.detectChanges();
    }

	toggleExpandedGroup(): void {
        this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
        this.onToggleExpandedGroup.next(this.expandedState);
	}

	ngOnInit(): void {
		this.expandedState = this.expandedState || 'out';
		if (this.pointCount === 0) {
			this.patrolMapService.setInteractMode(PatrolMapInteractMode.Append);
		}
		else {
			this.patrolMapService.setInteractMode(PatrolMapInteractMode.Edit);
		}

		this.patrolMapService.finishAddPatrol
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (patrol) => this.finishAddPatrol(patrol)
		});

		this.patrolBuilderService.patrolPointAdded
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (temp) => this.patrolPointsModified()
			});

		this.patrolBuilderService.patrolPointModified
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (patrolPoint) => this.patrolPointsModified()
			});

		this.patrolBuilderService.patrolPointRemoved
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (patrolPoint) => this.patrolPointRemoved(patrolPoint)
		});

		this.patrolBuilderService.patrolPointEditSelected
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (patrolPoint) => this.editPatrolPoint(patrolPoint)
			});

		this.setCheckpointCnt();
		this.warningIcon = '../../Content/Images/warning.png';

 	}

	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	private setCheckpointCnt() {
		this.numCheckpoints = 0;
		for (let patrolPoint of this.patrol.Points) {
			if (patrolPoint.Actions && patrolPoint.Actions.length > 0) {
				this.numCheckpoints++;
			}
		}
	}

	private setCheckpointExpandedCnt(patrolPoint: PointTemplate) {
		this.numCheckpointsExpanded = 0;
		this.pointItemComps.forEach((pointItemComp) => {
			if (!patrolPoint || (patrolPoint && pointItemComp.patrolPoint.PointId != patrolPoint.PointId)) {
				if (pointItemComp.expandedState == 'out') {
					this.numCheckpointsExpanded++;
				}
			}
		});
	}

	public updateExpandedActionsCnt(expandedState: string) {
		if (expandedState === 'in') {
			this.numCheckpointsExpanded--;
			this.expandCollapseBtnText = 'Expand All';
			this.expandCollapseBtnTooltip = 'Expand All Actions';
		}
		else {
			this.numCheckpointsExpanded++;
			if (this.numCheckpoints === this.numCheckpointsExpanded) {
				this.expandCollapseBtnText = 'Collapse All';
				this.expandCollapseBtnTooltip = 'Collapse All Actions';
			}
		}
		this.changeRef.detectChanges();
	}
	public expandCollapseAllActions() {
		if (this.numCheckpoints) {
			let expandedState:string;
			if (this.numCheckpoints == this.numCheckpointsExpanded) {
				expandedState = 'in';
			}
			else {
				expandedState = 'out';
			}
			this.pointItemComps.forEach(pointItemComp => {
				if (pointItemComp.patrolPoint.Actions.length > 0) {
					if (pointItemComp.expandedState !== expandedState) {
						pointItemComp.toggleExpandedGroup();
					}
				}
			});

			this.changeRef.detectChanges();
		}
	}

	private patrolPointsModified() {
		this.pointCount = this.patrol.Points.length;
		this.setCheckpointCnt();
		this.setCheckpointExpandedCnt(null);
		if (this.numCheckpoints && this.numCheckpoints === this.numCheckpointsExpanded) {
			this.expandCollapseBtnText = 'Collapse All';
			this.expandCollapseBtnTooltip = 'Collapse All Actions';
		}
		else {
			this.expandCollapseBtnText = 'Expand All';
			this.expandCollapseBtnTooltip = 'Expand All Actions';
		}	

		this.changeRef.detectChanges();
	}

	private patrolPointRemoved(patrolPoint:PointTemplate) {
		this.pointCount = this.patrol.Points.length;
		this.setCheckpointCnt();
		this.setCheckpointExpandedCnt(patrolPoint);
		if (this.numCheckpoints && this.numCheckpoints === this.numCheckpointsExpanded) {
			this.expandCollapseBtnText = 'Collapse All';
			this.expandCollapseBtnTooltip = 'Collapse All Actions';
		}
		else {
			this.expandCollapseBtnText = 'Expand All';
			this.expandCollapseBtnTooltip = 'Expand All Actions';
		}

		this.changeRef.detectChanges();
	}

	public disableSave(): boolean {
		if (this.patrol.Points && this.patrol.Points.length > 1) {
			return (false);
		}
		else
			return (true);
	}

	public cancelBuilder() {
		this.patrolMapService.clearPatrol();
		this.onPatrolBuilderCancelled.emit(true);
	}

	public savePatrol() {

		let temp = this.patrolService.getPatrolTemplate(this.patrol.TemplateId);

        if (!temp || temp.IsPatrolSubmitted === false) {
			//Check to see if the tenant/location for this patrol is being viewed in the map view
			let mvTenants: Tenant[] = this.locFilterService.getAllTenantLocations('mapview');
			let patrolTenantId = this.patrol.TenantId;
			let patrolLocationId = this.patrol.LocationId;
			let modified: boolean = false;
			if (mvTenants && mvTenants.length > 0) {
				for (let mvTenant of mvTenants) {
					if (mvTenant.Id === patrolTenantId) {
						if (mvTenant.Selected !== true) {
							mvTenant.Selected = true;
							modified = true;
						}

						for (let mvLoc of mvTenant.Locations) {
							if (mvLoc.Id === patrolLocationId) {
								if (mvLoc.Selected !== true) {
									mvLoc.Selected = true;
									modified = true;
								}
							}
						}

						if (modified) {
							this.locFilterService.setSelectedTenantLocations('mapview', mvTenants);
						}
						break;
					}
				}
			}

            this.patrol.UserName = this.userService.currentUser.name;

            this.patrolBuilderService.savePatrol(this.patrol);
            if (temp) {
                temp.isPatrolBuilderEdit = true;
            }
			this.patrolMapService.clearPatrol();
			this.onPatrolBuilderSaved.emit(true);
		}
		else {
			this.saveErrorDialog.show();
		}
	}

	public hideErrorDialog() {
		this.saveErrorDialog.hide();
	}

	public editPatrolPoint(patrolPoint: PointTemplate) {
		this.actionsDialog.show(this.patrol, patrolPoint);
		this.patrolMapService.toggleRedraw();
	}

	public finishAddPatrol(patrol: PatrolTemplate) {

		if (patrol.Points.length > 1) {

			this.patrolMapService.clearPatrol();
			setTimeout(
				() => {
				this.patrolMapService.setInteractMode(PatrolMapInteractMode.Edit);
				this.patrolMapService.setActivePatrol(this.patrol);
				},
				100
			);
		}
		else {
			this.patrolMapService.setInteractMode(this.patrolMapService.interactMode);
		}
 	}
}