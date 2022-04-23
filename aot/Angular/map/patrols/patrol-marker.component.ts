import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChange,OnInit } from '@angular/core';
import { PointTemplate, PointStatusValues, PointInstance } from '../../patrols/point.class';
import { PatrolTemplate, PatrolInstance } from '../../patrols/patrol.class';
import { ActionStatusValues } from '../../patrols/action.class';
import { PatrolService } from '../../patrols/patrol.service';
import { PatrolBuilderService } from '../../patrolBuilder/patrol-builder.service';
import { MapService } from '../map.service';
import { PatrolMapService, PatrolMapInteractMode } from './patrolMap.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

@Component({
	selector: 'patrol-marker',
	templateUrl: 'patrol-marker.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class PatrolMarker {
	@Input() point: any;
	@Input() patrol: any;
	@Input() pointStatus: PointStatusValues;
	@Input() ordinal: number;
	@Input() selected: boolean;
    @Input() dirtyToggle: boolean;

    @Input() iPatrolService: PatrolService;
    @Input() iPatrolMapService: PatrolMapService;

	private ngUnsubscribe: Subject<void> = new Subject<void>();
		
	PointStatusValues: typeof PointStatusValues = PointStatusValues;
	PatrolMapInteractMode: typeof PatrolMapInteractMode = PatrolMapInteractMode;
	prevent: boolean;
	delay: number;
    timer: NodeJS.Timer;

    patrolService: PatrolService;
    patrolMapService: PatrolMapService;

	private dragged: boolean = false;

    constructor(protected ptrlService: PatrolService,
                protected patrolBuilderService: PatrolBuilderService,
                public ptrlMapService: PatrolMapService,
                protected changeDetectorRef: ChangeDetectorRef) {

		// Click -> Dbl Click facilitation
		this.prevent = false;
		this.delay = 300;
        this.timer = null;   
	}

    ngOnInit(): void {
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

		// Subscribe to checkpoint upserted events
		this.patrolBuilderService.patrolPointAdded
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (patrolPoint) => this.patrolModified()
		});

		this.patrolBuilderService.patrolPointModified
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (patrolPoint) => this.patrolModified()
		});

		this.patrolBuilderService.patrolPointRemoved
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (temp) => this.patrolModified()
		});

		this.patrolBuilderService.patrolPointSelChanged
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (temp) => this.patrolModified()
		});

		this.patrolMapService.activePatrolSet
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (temp) => this.patrolModified()
		});

		this.patrolMapService.activePatrolCleared
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (temp) => this.patrolModified()
			});

		if (this.patrol.IsTemplate === false) {
			this.patrolService.onUpsertInstance
				.takeUntil(this.ngUnsubscribe)
				.subscribe({
					next: (temp) => this.patrolModified()
				});
		}

		this.patrolMapService.markerDragged
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (marker) => this.markerDragged(marker)
			});

	}

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
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

		let endMarker: L.SmartCommandMarker = this.patrolMapService.getPatrolMarker(this.point.PointId);
		if (!endMarker) {
			return;
		}
		if (changes.ordinal && changes.ordinal.currentValue !== changes.ordinal.previousValue) {
			if (endMarker) {
				endMarker.Number = changes.ordinal.currentValue;
			}
		}

		if (changes.pointStatus && changes.pointStatus.currentValue !== changes.pointStatus.previousValue &&
			(changes.pointStatus.currentValue === PointStatusValues.Reached ||
			changes.pointStatus.currentValue === PointStatusValues.NotReached)) {
			if (endMarker.Number > 1) {
				let prevPoint = this.patrol.Points[this.point.Ordinal - 2];
				if (prevPoint) {
					let startMarker = this.patrolMapService.getPatrolMarker(prevPoint.PointId);
					if (startMarker) {
						let polyline = startMarker.PatrolPolyline;
						let polyOptions = this.patrolMapService.getPathOptions(endMarker);
						if (changes.pointStatus.currentValue === PointStatusValues.Reached) {
							polyline.setStyle(polyOptions);
						}
						else if (changes.pointStatus.currentValue === PointStatusValues.NotReached) {
							polyline.setStyle(polyOptions);
						}
					}
				} 
			}
		}
	}

	ngAfterViewInit() {
		this.patrolMapService.addPatrolPointToMap(this.point);
	}

	ngOnDestroy(): void {
		this.patrolMapService.removePatrolPointFromMap(this.point);
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	private patrolModified() {
		this.dirtyToggle = !this.dirtyToggle;
        this.changeDetectorRef.detectChanges();
        this.changeDetectorRef.markForCheck();
	}

	private markerDragged(marker: L.SmartCommandMarker) {
		this.dragged = true;
	}

	public onClick(event:any): void {

		if (this.dragged === true) {
			this.dragged = false;
			return;
		}
		// Delay click action to allow dblclick to occur
		this.timer = setTimeout(() => {
			if (!this.prevent) {
				if (!event.ctrlKey) {
					this.patrolBuilderService.selectOnlyPatrolPoint(this.patrol, this.point.PointId);
				} else {
					this.patrolBuilderService.selectPatrolPoint(this.patrol, this.point.PointId);
				}

				this.patrolMapService.onMarkerClick(this.point);
			}
			this.prevent = false;
		}, 300);
	}

	public onDblClick(event:any) {
		this.prevent = true;
		clearTimeout(this.timer);
		if (!event.ctrlKey) {
			this.patrolBuilderService.selectOnlyPatrolPoint(this.patrol, this.point.PointId);
		} else {
			this.patrolBuilderService.selectPatrolPoint(this.patrol, this.point.PointId);
		}

		this.patrolBuilderService.notifyPatrolPointEditSelected(this.point);
	}

	//zoomTo(): void {
	//	clearTimeout(this.timer);
	//	this.prevent = true;

	//	this.mapService.zoomToAlarmMarker(this.groupName);
	//	this.alarmService.selectAlarm(this.alarm.Id);
	//}

	//getDescription(): string {
	//	return this.patrol.getDescription();
	//}

	public getPointCompletenessColor(): string {
		let color: string = '#249C49';
		for (let action of this.point.Actions) {
			if (action.CurrentStatus === ActionStatusValues.Failed ||
				action.CurrentStatus === ActionStatusValues.Unsupported) {
				return color = '#E9AB08';
			}
		}

		return color;
	}

	public getPointIconSrc(): string {
		if (this.patrol.IsTemplate === true && this.patrolService.isCheckPoint(this.point)) {
			return '/Content/Images/Patrols/checkpoint-patrol-in-progress.png';
		} else {
			let pointCurrentStatus = this.patrolService.getPointStatus(this.point, this.patrol.Points);
			let tempStatus = this.patrolService.getPointStatus(this.point, this.patrol.Points);
			if (this.patrolService.isCheckPoint(this.point)) {
				if (pointCurrentStatus === PointStatusValues.Unknown ||
					pointCurrentStatus === PointStatusValues.InTransit ||
					(pointCurrentStatus === PointStatusValues.Reached &&
						tempStatus !== PointStatusValues.ActionsPerformed)) {

					return '/Content/Images/Patrols/checkpoint-patrol-in-progress.png';
				}
				else if (pointCurrentStatus === PointStatusValues.ActionsPerformed) {
					let actionStatus: ActionStatusValues = ActionStatusValues.Completed;
					for (let actionIndex in this.point.Actions) {
                        if (
                            this.point.Actions[actionIndex].CurrentStatus === ActionStatusValues.Unknown ||
                            this.point.Actions[actionIndex].CurrentStatus === ActionStatusValues.Unsupported ||
                            this.point.Actions[actionIndex].CurrentStatus === ActionStatusValues.Failed
                        ) {
                            return '/Content/Images/Patrols/checkpoint-failed.png';
                        }  
					}

					return '/Content/Images/Patrols/checkpoint-patrol-successful.png';
					
				}
				else if (pointCurrentStatus === PointStatusValues.NotReached) {
					return '/Content/Images/Patrols/checkpoint-patrol-failed.png';
				} 
			}
			else {
				if (pointCurrentStatus === PointStatusValues.NotReached) {
                    return '/Content/Images/Patrols/path-point-failed-to-reach.png';
				}
				else {
					if (this.point.Ordinal === 1) {
						return '/Content/Images/Patrols/first-point.png';
					}
					else if (this.point.Ordinal !== 1 && this.point.Ordinal === this.patrol.Points.length) {
						return '/Content/Images/Patrols/last-point.png';
					}
					else {
						return '/Content/Images/Patrols/patrol-point.png';
					}
				}

			}
		}
	}

	public showPointProgressBar(): boolean {
		let show: boolean = false;
		if (this.patrol.IsTemplate === false && this.patrolService.isCheckPoint(this.point) &&
			this.point.CurrentStatus === PointStatusValues.Reached &&
			this.patrolService.getPointStatus(this.point, this.patrol.Points) !== PointStatusValues.ActionsPerformed) {
			show = true;
		}

		return (show);
	}

	public showFirstPointOverlay() {
		let show: boolean = false;
		if (this.point.Ordinal === 1 &&
			(this.patrolMapService.interactMode !== PatrolMapInteractMode.None || this.patrolService.isCheckPoint(this.point))) {
			show = true;
		}
		return show;
	}

	public showLastPointOverlay() {
		let show: boolean = false;
		let lastPoint: boolean = this.point.Ordinal !== 1 && this.point.Ordinal === this.patrol.Points.length;
		if (lastPoint &&
			(this.patrolMapService.interactMode !== PatrolMapInteractMode.None || this.patrolService.isCheckPoint(this.point))) {
			show = true;
		}
		return show;
	}

	public shouldBlink(): boolean {
		let blink: boolean = false;
		blink = this.patrol.IsTemplate === false && this.point.CurrentStatus === PointStatusValues.InTransit;
		return (blink);
	}

}