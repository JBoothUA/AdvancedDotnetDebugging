import {
	Component,
	ChangeDetectionStrategy,
	Input,
	Output,
	EventEmitter,
    OnInit,
    ViewChild
} from '@angular/core';

import { PatrolTemplate, PatrolType } from '../patrols/patrol.class';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolMapService, PatrolMapInteractMode } from './../map/patrols/patrolMap.service';
import { PatrolBuilderService } from "./patrol-builder.service";
import { LocationFilterService } from "../shared/location-filter.service";
import { Tenant } from "../shared/tenant.class";
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { PatrolBuilderStep1 } from './patrol-builder-step1.component';
import { PatrolBuilderStep2 } from './patrol-builder-step2.component';

@Component({
	selector: 'patrol-builder',
	templateUrl: 'patrol-builder.component.html',
	styleUrls: ['patrol-builder.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class PatrolBuilder implements OnInit {
	step1ExpandedState: string;
	PatrolType: typeof PatrolType = PatrolType;
	@Output() onHidePatrolBuilder = new EventEmitter();
	@Input() patrol: PatrolTemplate;
    @Input() pointCount: number;

    @ViewChild('patrolBuilderStep1') patrolBuilderStep1: PatrolBuilderStep1;
    @ViewChild('patrolBuilderStep2') patrolBuilderStep2: PatrolBuilderStep2;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

	public patrolInEdit: PatrolTemplate;
	public step1Completed: boolean = false;
	public dialogTitle: string;

	constructor(
		private patrolService: PatrolService,
		private patrolBuilderService: PatrolBuilderService,
		private patrolMapService: PatrolMapService,
		private locFilterService: LocationFilterService) { }

	ngOnInit(): void {
		if (!this.patrol) {
			this.patrolInEdit = this.patrolBuilderService.createNewPatrol();
			this.step1Completed = false;
			this.step1ExpandedState = "out";

			this.patrolMapService.clearPatrol();
			this.dialogTitle = "Create New Patrol";
			setTimeout(() => { this.patrolMapService.setActivePatrol(this.patrolInEdit); }, 100);

			let mapviewTenants: Tenant[] = this.locFilterService.getSelectedTenantLocations('mapview');
			if (mapviewTenants && mapviewTenants.length === 1 && mapviewTenants[0].Locations.length === 1) {
				this.patrolInEdit.TenantId = mapviewTenants[0].Id;
				this.patrolInEdit.LocationId = mapviewTenants[0].Locations[0].Id;
			}

		}
		else {

			this.dialogTitle = "Edit Patrol";
			this.patrolInEdit = new PatrolTemplate(this.patrol);

			if (!this.patrolInEdit.Points)
				this.patrolInEdit.Points = [];

			this.patrolMapService.clearPatrol();

			setTimeout(
				() => {
					this.patrolMapService.setInteractMode(PatrolMapInteractMode.Edit);
					this.patrolMapService.setActivePatrol(this.patrolInEdit);
				},
				100);

			if (this.patrolBuilderService.isStep1Completed(this.patrolInEdit) === true) {
				this.step1ExpandedState = "in";
				this.step1Completed = true;

				setTimeout(
					() => {
						this.patrolMapService.map.on('moveend', this.createTooltip, this);
						this.patrolMapService.zoomToPatrolBounds( );
					},
					100);
			}
		}
	}

	ngAfterViewInit() {

		//this.saveTenants = this.locFilterService.getSelectedTenantLocations('mapview');
		//if (

	}

	ngOnDestroy(): void {
		this.locFilterService.unregisterComponent('pbview');
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	public hidePatrolBuilder(): void {
		this.patrolMapService.clearPatrol();
		this.onHidePatrolBuilder.emit();
	}

	public handleStep1Completed() {
		this.step1Completed = true;
	}

	public createTooltip() {
		this.patrolMapService.map.off('moveend', this.createTooltip, this);
		let content: L.Content;
		content = '<div class="map-tooltip-content">' +
			'<div>To add points to an existing patrol, click</div>' +
			'<div>a line between points. To add a new section</div>' +
			'<div>to your patrol, click the first or last</div>' +
			'<div>point to start drawing.  </div>' +
			'</div>';
		this.patrolMapService.createTooltip(content);
		this.patrolMapService.openTooltip();
    }

    public setStepExpandedState(stepIndex: number, state: any) {
        if (stepIndex === 1 && state === 'out') {
            this.patrolBuilderStep2.setToggleState('in');
        } else if (stepIndex === 2 && state === 'out') {
            this.patrolBuilderStep1.setToggleState('in');
        }
    }
}