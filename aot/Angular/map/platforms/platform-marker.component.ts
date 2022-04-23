import {
    Component, Input, Output,
    EventEmitter, ChangeDetectionStrategy,
    ChangeDetectorRef, SimpleChange, ViewChild,
    ElementRef, OnInit
} from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

import { PlatformMapService } from '../platforms/platformMap.service';
import { Platform, PlatformState, PlatformMode } from '../../platforms/platform.class';
import { PatrolService } from '../../patrols/patrol.service';
import { PatrolInstance } from '../../patrols/patrol.class';
import { PlatformService } from '../../platforms/platform.service';
import { PointInstance, PointStatusValues } from '../../patrols/point.class';
import { PlatformRadialMenu } from './platform-radial-menu.component';
import { MapViewOptions } from '../../shared/map-view-options.class';

@Component({
    selector: 'platform-marker',
    templateUrl: 'platform-marker.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PlatformMarker {
	@Input() Platform: Platform;
	@Input() SentToPosition: PointInstance;
    @Input() Selected: boolean;
    @Input() Orientation: number;
    @Input() State: PlatformState;
    @Input() Longitude: number;
    @Input() Latitude: number;
    @Input() MarkerId: string;
    @Input() ShowSelection: boolean = false;
    @Input() HideLabel: boolean = false;
    @Input() SmallMarker: boolean = false;
    @Input() ClickEvents: boolean = true;
	@Input() NotifyMovement: boolean = false;
	@Input() mapViewOptions: MapViewOptions;
    @Input() iPatrolService: PatrolService;
    @Input() iPlatformMapService: PlatformMapService;

	@Output() OnMove = new EventEmitter;

	@ViewChild('GoToLocationIcon') GoToLocationIcon: ElementRef;

    @ViewChild('Cone') Cone: ElementRef;
    @ViewChild('Heading') Heading: ElementRef;
    @ViewChild('HeadingIcon') HeadingIcon: ElementRef;
    @ViewChild(PlatformRadialMenu) radial: PlatformRadialMenu;
    @ViewChild('platformActions') platformActions: ElementRef;

    public Prevent: boolean;
    public Delay: number;
    public Timer: NodeJS.Timer;
	public Hover: boolean = false;
	public Dragging: boolean = false;
    public ActionMenuOpen: boolean;
    public ActionMenuTimeout: any;
	public MapZoom: number;
    public MapZoomThreshold: number = 21;
    public patrolService: PatrolService;
    public MapService: PlatformMapService;
    public PlatformMode: typeof PlatformMode = PlatformMode;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

	constructor(private mpService: PlatformMapService, private PlatformService: PlatformService,
        private ChangeDetectorRef: ChangeDetectorRef, private ptrlService: PatrolService) {
        // Click -> Dbl Click facilitation
        this.Prevent = false;
        this.Delay = 200;
		this.Timer = null;

		$(document).mouseup(() => {
			this.Dragging = false;
        });
	}
    ngOnInit(): void {
        if (!this.patrolService) {
            if (this.iPatrolService)
                this.patrolService = this.iPatrolService;
            else
                this.patrolService = this.ptrlService;
        }

        if (!this.MapService) {
            if (this.iPlatformMapService)
                this.MapService = this.iPlatformMapService;
            else
                this.MapService = this.mpService;

            this.MapZoom = this.MapService.getMapZoom();
        }
    }

    ngAfterViewInit(): void {      
        if (this.Platform.Position && this.Platform.Position.coordinates) {
            if (!this.MarkerId) {
                this.MarkerId = this.Platform.id;
            }

            this.MapService.createPlatformMarker(this.MarkerId, this.Platform);

            if (this.NotifyMovement) {
                this.OnMove.emit();
            }
        }

        this.MapService.zoomChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (zoomLevel) => {
                    this.MapZoom = zoomLevel;
                    this.ChangeDetectorRef.detectChanges();
                }
            });

        this.patrolService.onUpsertInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolInstance) => {
                    if (patrolInstance.PlatformId === this.Platform.id) {
                        this.ChangeDetectorRef.detectChanges();
                    }
                }
            });

        this.patrolService.onPatrolInstanceComplete
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolInstance) => {
                    if (patrolInstance.PlatformId === this.Platform.id) {
                        this.ChangeDetectorRef.detectChanges();
                    }
                }
            });

        this.PlatformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                    if (this.Platform.id === platform.id) {
                        this.ChangeDetectorRef.detectChanges();
                    }
                }
            });

        this.MapZoom = this.MapService.getMapZoom();
	}

	setupDraggableElement() {
		this.ChangeDetectorRef.detectChanges();
		if (!this.GoToLocationIcon)
			return;

		let draggable = new L.Draggable(this.GoToLocationIcon.nativeElement);
		draggable.enable();
		draggable.off('dragstart');
        draggable.on('dragstart', () => {
			this.Dragging = true;
			this.MapService.setGoToLocationMode(this.Platform);
		});
		draggable.off('dragend');
		draggable.on('dragend', () => {
			this.Dragging = false;
			// Restore the draggable element's position
			this.GoToLocationIcon.nativeElement.style.transform = null;
		});
    }

    openRadial(event: MouseEvent): void {
        event.preventDefault();
        this.PlatformService.selectOnlyPlatform(this.Platform.id, true);
        this.radial.toggleMenu(event);
    }

    openActionMenu(event: MouseEvent): void {
        this.PlatformService.openPlatformActionMenu(this.Platform, event, this.platformActions, 10, 0, false);
    }

    select(event: MouseEvent): void {
        // Delay click action to allow dblclick to occur
        this.Timer = setTimeout(() => {
            if (!this.Prevent) {
                if (this.ClickEvents) {
					if (this.MapZoom < this.MapZoomThreshold) {
                        this.PlatformService.selectOnlyPlatform(this.Platform.id);
                        this.MapService.zoomToPlatformMarker(this.MarkerId);
                    } else {
                        this.PlatformService.handleClick(this.Platform);
                    }
                    this.ChangeDetectorRef.detectChanges();
                }
            }
            this.Prevent = false;
        }, this.Delay);
    }

    zoomTo(): void {
        clearTimeout(this.Timer);
        this.Prevent = true;

        if (this.ClickEvents) {
            this.MapService.zoomToPlatformMarker(this.MarkerId);
        }
    }

    getHeadingImage(): string {
        if (this.ShowSelection || this.Platform.Selected) {
            return '/Content/images/Platforms/robot-heading-selected.png';
        } else {
            return '/Content/images/Platforms/robot-heading-not-selected.png';
        }
    }

    public isProgressBarHidden(): boolean {
        let isHidden: boolean = true;
        if (this.patrolService.getPatrolInstanceByPlatformId(this.Platform.id)) {
            isHidden = false;
        } else if (this.Platform.PatrolTemplateSubmittedId) {
            isHidden = false;
        }

        return isHidden;
    }

    public getPlatformPatrolCompleteness(): number {
        let patrolInstance: PatrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.Platform.id);

        if (patrolInstance) {
            return this.patrolService.getPatrolCompleteness(patrolInstance);
        }
        return null;
    }

    mouseEnter(): void {
		this.Hover = true;
    }

    mouseLeave(): void {
		this.Hover = false;
    }

    ngOnDestroy(): void {
        clearTimeout(this.Timer);
        if (this.MapService.map) {
            this.MapService.removePlatformMarker(this.MarkerId);
        }
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
        if (!this.patrolService) {
            if (this.iPatrolService)
                this.patrolService = this.iPatrolService;
            else
                this.patrolService = this.ptrlService;
        }

        if (!this.MapService) {
            if (this.iPlatformMapService)
                this.MapService = this.iPlatformMapService;
            else
                this.MapService = this.mpService;

            this.MapZoom = this.MapService.getMapZoom();
        }

		if (changes.SentToPosition && changes.SentToPosition.currentValue !== changes.SentToPosition.previousValue) {
			$('.go-to-location-icon-' + this.Platform.id).remove();
			if (this.Platform.SentToPosition && this.Platform.SentToPosition.Position && this.Platform.SentToPosition.CurrentStatus === PointStatusValues.InTransit) {
				// Do not show an additional Location Icon if the destination is an Alarm
				if (!this.Platform.SentToPosition.AlarmIds || !this.Platform.SentToPosition.AlarmIds.length) {
					this.MapService.addGoToLocationIcon(new L.LatLng(+this.Platform.SentToPosition.Position.Coordinates[1],
						+this.Platform.SentToPosition.Position.Coordinates[0]), this.Platform.id, this.Platform.DisplayName);
				}
			}

			if (changes.SentToPosition.previousValue
				&& (changes.SentToPosition.currentValue.Position.Coordinates[0] !== changes.SentToPosition.previousValue.Position.Coordinates[0]
				|| changes.SentToPosition.currentValue.Position.Coordinates[1] !== changes.SentToPosition.previousValue.Position.Coordinates[1]
				|| changes.SentToPosition.currentValue.CurrentStatus !== changes.SentToPosition.previousValue.CurrentStatus)) {
				if (this.Platform.SentToPosition && this.Platform.SentToPosition.CurrentStatus === PointStatusValues.InTransit) {
					if (this.Platform.SentToPosition.AlarmIds && this.Platform.SentToPosition.AlarmIds.length) {
						this.MapService.createPlatformMarkerNotification(this.MarkerId, '<img src="/Content/Images/Platforms/sent-to-alarm.png" /> Sent to Alarm', 'popup-goal-started');
					} else {
						this.MapService.createPlatformMarkerNotification(this.MarkerId, '<img src="/Content/Images/Platforms/sent-to-location.png" /> Sent to Location', 'popup-goal-started');
					}
				} else if (this.Platform.SentToPosition && this.Platform.SentToPosition.CurrentStatus === PointStatusValues.Reached) {
					this.MapService.createPlatformMarkerNotification(this.MarkerId, '<img src="/Content/Images/goal-success-icon.png" /> Arrived at Location', 'popup-goal-success');
				} else if (this.Platform.SentToPosition && this.Platform.SentToPosition.CurrentStatus === PointStatusValues.NotReached) {
					this.MapService.createPlatformMarkerNotification(this.MarkerId, '<img src="/Content/Images/goal-warning-icon.png" /> Failed to Reach Location', 'popup-goal-warning');
				}
			}
		}

        if (changes.Selected && changes.Selected.currentValue !== changes.Selected.previousValue) {
            this.MapService.updatePlatformMarker(this.MarkerId, this.Platform);
		}

        if (changes.Orientation && changes.Orientation.currentValue !== changes.Orientation.previousValue) {
            // Set the rotate css. Use jQuery so that the transition animation fires (setting style in the template does not use transition)
            $(this.Heading.nativeElement).css('Transform', 'rotate(' + this.Platform.Orientation + 'deg)');
            $(this.Cone.nativeElement).css('Transform', 'rotate(' + this.Platform.Orientation + 'deg)');
            $(this.HeadingIcon.nativeElement).css('Transform', 'rotate(' + this.Platform.Orientation + 'deg)');
		}

        if ((changes.Latitude && !changes.Latitude.firstChange && changes.Latitude.currentValue !== changes.Latitude.previousValue) ||
            (changes.Longitude && !changes.Longitude.firstChange && changes.Longitude.currentValue !== changes.Longitude.previousValue)) {
            this.MapService.movePlatformMarker(this.MarkerId, this.Platform);

            if (this.NotifyMovement) {
                this.OnMove.emit();
            }
		}

		if (!this.Platform.IsPatrolSubmitted) {
			this.setupDraggableElement();
		}
	}

	showPlatformPopup(content: string, className?: string) {
		let popup = L.popup({ className: className, closeButton: false, closeOnClick: false, autoPan: false });
		popup.setContent(content);
		let marker = this.MapService.getMarker(this.MarkerId);
		if (marker) {
			marker.bindPopup(popup).openPopup();
			setTimeout(() => {
				marker.closePopup();
				marker.unbindPopup();
			}, 6000);
		}
	}

	goToPatrol(platform: Platform) {
		if (!platform.PatrolTemplateSubmittedId) {
			return;
		}
        
		if (this.mapViewOptions) {
			this.mapViewOptions.showAlarmsTab = false;
			this.mapViewOptions.showPlatformsTab = false;
			this.mapViewOptions.showPatrolsTab = true;
			this.mapViewOptions.lastShownTab = 'Patrol';
		}

        this.patrolService.toggleSelectedPatrol(platform.PatrolTemplateSubmittedId, true);
        this.patrolService.scollToPatrol(platform.PatrolTemplateSubmittedId);
	}

    public isDisabled(): boolean {
        if (this.Platform && this.Platform.State) {
            if (this.Platform.State.PlatformMode === PlatformMode.Estop || this.Platform.State.PlatformMode === PlatformMode.EstopPhysical) {
                return true;
            }
        } 
 
        return this.Platform.IsPatrolSubmitted;
    }
}