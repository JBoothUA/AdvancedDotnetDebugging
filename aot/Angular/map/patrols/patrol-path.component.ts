import { Component, Input, OnInit, OnChanges, SimpleChange,NgZone, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { PatrolTemplate, PatrolInstance } from '../../patrols/patrol.class';
import { PointTemplate, PointInstance } from '../../patrols/point.class';
import { PatrolMapService } from './patrolMap.service';
import { PatrolService } from '../../patrols/patrol.service';
import { PatrolBuilderService } from '../../patrolBuilder/patrol-builder.service';
import { MapService } from '../map.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

@Component({
	selector: 'patrol-path',
	templateUrl: 'patrol-path.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class PatrolPath {
	@Input() patrol: PatrolTemplate = null;
	@Input() patrolPoints: PointTemplate[];
	@Input() pointCount: number;
    @Input() dirtyToggle: boolean;
    @Input() iPatrolService: PatrolService;
    @Input() iPatrolMapService: PatrolMapService;
	private ngUnsubscribe: Subject<void> = new Subject<void>();

	selected: boolean;
	childSelected: boolean;
	prevent: boolean;
	delay: number;
	timer: number;

    patrolService: PatrolService;
    patrolMapService: PatrolMapService;

    constructor(private ptrlMapService: PatrolMapService,
		private patrolBuilderService: PatrolBuilderService,
        private ptrlService: PatrolService,
		private changeRef: ChangeDetectorRef,
		private ngzone: NgZone) {

		this.selected = false;
		this.childSelected = false;

		// Click -> Dbl Click facilitation
		this.prevent = false;
		this.delay = 200;
		this.timer = 0;
	}

    ngOnInit() {
        if (!this.patrolService) {
            if (this.iPatrolService)
                this.patrolService = this.iPatrolService;
            else
                this.patrolService = this.ptrlService;
        }

        if (!this.patrolMapService) {
            if (this.iPatrolMapService)
                this.patrolMapService = this.iPatrolMapService;
            else
                this.patrolMapService = this.ptrlMapService;
        }

		this.patrolBuilderService.patrolPointSelChanged
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (patrolPoint) => this.patrolModified(patrolPoint)
		});

		this.patrolBuilderService.patrolPointAdded
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (patrolPoint) => this.patrolModified(patrolPoint)
		});

		this.patrolBuilderService.patrolPointRemoved
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (patrolPoint) => this.patrolModified(patrolPoint)
			});

		this.patrolBuilderService.patrolPointModified
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (patrolPoint) => this.patrolModified(patrolPoint)
			});

		this.patrolMapService.activePatrolSet
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (patrol) => this.activePatrolSet(patrol)
		});
		this.patrolMapService.activePatrolCleared
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (patrol) => this.activePatrolCleared(patrol)
		});

	}
	ngOnChanges(changes: { [propName: string]: SimpleChange }) {
		//console.log("patrol-path changed");
	}
	
	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	patrolModified(temp: any) {
		this.dirtyToggle = !this.dirtyToggle;
		//this.changeRef.markForCheck();
		this.changeRef.detectChanges();
	}

	activePatrolSet(patrol: any) {
		this.patrol = patrol;
		this.changeRef.detectChanges();
	}

	activePatrolCleared(patrol: any) {
		this.patrol = null;
		this.changeRef.detectChanges();
	}

	//select(): void {
	//	// Delay click action to allow dblclick to occur
	//	this.timer = setTimeout(() => {
	//		if (!this.prevent) {
	//			if (this.selected) {
	//				this.alarmService.deSelectAllAlarms();
	//			} else {
	//				this.alarmService.selectOnlyAlarm(this.mapService.getHighestPriorityAlarm(this.alarms).Id);
	//			}
	//		}
	//		this.prevent = false;
	//	}, this.delay);
	//}

	//zoomTo(): void {
	//	clearTimeout(this.timer);
	//	this.prevent = true;

	//	this.mapService.zoomToAlarmMarker(this.groupName);
	//	this.alarmService.selectOnlyAlarm(this.mapService.getHighestPriorityAlarm(this.alarms).Id);
	//}

	//changeSelectionState(state: boolean): void {
	//	if (state !== this.selected) {
	//		this.selected = state;

	//		if (this.selected) {
	//			// Open the overlapping alarms dialog for this group
	//			if (this.alarms.length > 1) {
	//				this.mapService.openOverlappingAlarms(this.groupName, this.alarms);
	//			}
	//		} else {
	//			this.mapService.closeOverlappingAlarms(this.groupName);
	//		}
	//	}
	//}

	//checkChildSelection(): void {
	//	for (var alarm in this.alarms) {
	//		if (this.alarms[alarm].Selected) {
	//			this.childSelected = true;
	//			return;
	//		}
	//	}
	//	this.childSelected = false;
	//}

	//checkGroupSelection(): void {
	//	// Alarm selection has changed. If no alarms in the group are selected, deselect the group
	//	var found = false;
	//	var child = false;
	//	var selectedAlarms = this.alarmService.getSelectedAlarms();

	//	// determine if an alarm is selected that is not in this group
	//	for (var alarm in selectedAlarms) {
	//		var groupName = this.mapService.getGroupName(selectedAlarms[alarm]);
	//		if (groupName !== this.groupName) {
	//			found = true;
	//			break;
	//		}
	//	}

	//	if (selectedAlarms.length > 0 && !found) {
	//		this.changeSelectionState(true);
	//	} else {
	//		this.changeSelectionState(false);
	//	}

	//	this.checkChildSelection();
	//}

	//ngOnChanges(changes: any): void {
	//	if (changes.alarms) {
	//		if (this.selected) {
	//			if (this.alarms.length > 1) {
	//				// Update overlapping alarms list if number of alarms changes (edit works without this)
	//				if (changes.alarms.currentValue.length !== changes.alarms.previousValue.length) {
	//					this.mapService.openOverlappingAlarms(this.groupName, this.alarms);
	//				} else {
	//					this.mapService.refreshOverlappingAlarms(this.groupName);
	//				}
	//			} else {
	//				this.mapService.closeOverlappingAlarms(this.groupName);
	//			}
	//		}
	//	}
	//}

	//deselectGroup(groupName: string): void {
	//	if (this.groupName === groupName) {
	//		this.selected = false;
	//	}
	//}
}