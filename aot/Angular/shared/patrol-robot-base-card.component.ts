import {
    Component, ChangeDetectionStrategy, Input,
    EventEmitter, Output, ChangeDetectorRef, ViewChild
} from '@angular/core';

import * as moment from 'moment';
import { PatrolTemplate, PatrolInstance } from '../patrols/patrol.class';
import { PatrolService } from '../patrols/patrol.service';
import { PlatformService } from './../platforms/platform.service';
import { Platform, PlatformMode } from './../platforms/platform.class';
import { slideDown } from './../shared/animations';
import { LocationFilterService } from '../shared/location-filter.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { Location } from '../shared/location.class';
import { PlatformCommand, CommandName } from '../patrols/action.class';
import { PatrolStatusValues } from '../patrols/patrol.class';
import { ChooserStatus } from './../shared/chooser-status.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'patrol-robot-base-card',
    templateUrl: 'patrol-robot-base-card.component.html',
    styleUrls: ['patrol-robot-base-card.component.css'],
    animations: [slideDown],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatrolRobotBaseCard {
    @Input() patrolTemplate: PatrolTemplate;
    @Input() patrolInstance: PatrolInstance;
    @Input() selected: boolean;
    @Input() expanded: boolean;
    @Input() platform: Platform;
    @Input() isOnPatrol: boolean;
    @Input() statusClass: string;
    @Input() updateToggle: boolean;
    @Input() actionMenuOpen: boolean = false;

    @Output() onExpandExpandedView: EventEmitter<PatrolTemplate> = new EventEmitter<PatrolTemplate>();
    @Output() onExpandedViewHidden: EventEmitter<boolean> = new EventEmitter();

    @ViewChild(ChooserStatus) chooserStatus: ChooserStatus;

    public PatrolStatusValues: typeof PatrolStatusValues = PatrolStatusValues; 
    public chooserOpen: boolean = false;
    private timer: NodeJS.Timer = null;
    private blockSingleClick = false;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private nextRunTimer: NodeJS.Timer = null;
    
    constructor(private patrolService: PatrolService,
                public platformService: PlatformService,
                private locationFilterService: LocationFilterService,
                private mapService: PlatformMapService,
                private ref: ChangeDetectorRef) {
	}

    public getPatrolCompleteness(): number {
        if (this.patrolService.getPatrolStatusClass(this.patrolTemplate, this.patrolInstance) === 'availableStatus')
            return 0.0;
        return this.patrolService.getPatrolCompleteness(this.patrolInstance);
    }

    public blockSelection(event: any): void {
       
        event.stopPropagation();
    }

    public getPatrolcompletenessText(): string {
        return (Math.round(this.getPatrolCompleteness() * 100).toString());
    }

    //Need to output event
    //Need to handle platform toggle
    public toggleExpandedView(): void {
        event.stopPropagation();

        if (this.patrolTemplate) {
            if (this.patrolTemplate.expanded) {
                this.patrolService.toggleExpandedPatrol(this.patrolTemplate.TemplateId, false);
            } else {
                this.patrolService.toggleExpandedPatrol(this.patrolTemplate.TemplateId, true);
                this.onExpandExpandedView.emit(this.patrolTemplate);
            }
        } else if (this.platform) {
            if (this.platform.Expanded) {
                this.platformService.setExpandedItem(null);
            }
            else {
                this.platformService.setExpandedItem(this.platform.id);
            }
        }

        if (this.expanded) {
            this.onExpandedViewHidden.emit();
        }
    }

    public handleClick(event: any): void {
        if (this.chooserOpen) {
            this.chooserOpen = false;
            return;
        }

        if (this.actionMenuOpen) {
            this.actionMenuOpen = false;
            return;
        }

        this.timer = setTimeout(() => {
            if (!this.blockSingleClick) {

                if (this.patrolTemplate) {
                    if (this.patrolTemplate.selected) {
                        this.patrolService.toggleSelectedPatrol(this.patrolTemplate.TemplateId, false);
                    } else {
                        this.patrolService.toggleSelectedPatrol(this.patrolTemplate.TemplateId, true);
                    }
                } else {

                    this.platformService.handleClick(this.platform);
                }

                this.ref.markForCheck();
            }

            this.blockSingleClick = false;
        }, 200);
    }

    public ngOnChanges(): void {
        if (!this.expanded) {
            this.onExpandedViewHidden.emit();
        }
    }

    public ngOnInit(): void {
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                    if (this.platform && platform.id === this.platform.id) {
                        try {
                            this.ref.markForCheck();
                        } catch (e) {
                            console.warn(e);
                        }
                    }
                }
            });

        this.patrolService.onPatrolInstanceComplete
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolInstance) => {
                    if ((this.patrolTemplate && patrolInstance.TemplateId === this.patrolTemplate.id) ||
                        (this.patrolInstance && patrolInstance.TemplateId === this.patrolInstance.TemplateId)) {
                        this.chooserStatus.reset();
                        
                        try {
                            this.ref.markForCheck();
                        } catch (e) {
                            console.warn(e);
                        }
                    }
                }
            });
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public handleDblClick(event: any): void {
        if (this.chooserOpen) {
            this.chooserOpen = false;
            return;
        }

        if (this.actionMenuOpen) {
            this.actionMenuOpen = false;
            return;
        }

        clearTimeout(this.timer);
        this.blockSingleClick = true;

        if (!this.patrolTemplate) {
            this.platformService.selectOnlyPlatform(this.platform.id);
            this.mapService.zoomToPlatformMarker(this.platform.id + '-marker');
        } else if(this.patrolTemplate) {
            if (this.patrolTemplate.selected) {
                this.patrolService.toggleSelectedPatrol(this.patrolTemplate.TemplateId, false);
            } else {
                this.patrolService.toggleSelectedPatrol(this.patrolTemplate.TemplateId, true);
            }
        }
    }

    public openActionMenu(event: any): void {
        event.preventDefault();

        if (this.patrolTemplate) {
            this.patrolService.openPatrolActionMenu(this.patrolTemplate, event);
        }
    }

    public getLocationDisplayname(): string {

        if (this.patrolTemplate) {
            let loc: Location = this.locationFilterService.getLocation('mapview', this.patrolTemplate.TenantId, this.patrolTemplate.LocationId);
            if (loc) {
                return loc.Name;
            } else {
                return 'No Location';
            }
        } else if (this.platform) {
            let loc: Location = this.locationFilterService.getLocation('mapview', this.platform.TenantId, this.platform.LocationId);
            if (loc) {
                return loc.Name;
            } else {
                return 'No Location';
            }
        } else {
            return '';
        }
    }

    public getPatrolRunText() {

        //Make this method cleaner
        let patrolTemplateDisplay: any = (patrolTemplate: PatrolTemplate) => {
            if (patrolTemplate.RunSetData) {
                //In the delay
                if (patrolTemplate.RunSetData.NextRun !== null) {
                    clearTimeout(this.nextRunTimer);
                    this.nextRunTimer = setTimeout(() => {
                        this.ref.markForCheck();
                    }, 60000);
                    return 'Next Run ' + moment.utc(patrolTemplate.RunSetData.NextRun).local().fromNow();
                } else {
                    //In pending
                    return 'Patrol Run ' + patrolTemplate.RunSetData.CurrentRunNumber + ' of ' + ((patrolTemplate.RunSetData.TotalRunNumber === -1) ? 'infinite' : patrolTemplate.RunSetData.TotalRunNumber.toString());
                }

            } else {
                //This should just be for legacy patrol
                return 'Patrol Run 1 of 1';
            }
        };

        if (this.patrolInstance) {
            if (this.patrolInstance.RunSetData) {
                clearTimeout(this.nextRunTimer);
                return 'Patrol Run ' + this.patrolInstance.RunSetData.CurrentRunNumber + ' of ' + ((this.patrolInstance.RunSetData.TotalRunNumber === -1) ? 'infinite' : this.patrolInstance.RunSetData.TotalRunNumber.toString());
            } else {
                //This should just be for legacy patrol
                return 'Patrol Run 1 of 1';
            }
        } else if (this.patrolTemplate) {
            return patrolTemplateDisplay(this.patrolTemplate);
        } else {
            //From the platform pov
            let patrolTemplate: PatrolTemplate = this.patrolService.getPatrolTemplate(this.platform.PatrolTemplateSubmittedId);

            if (patrolTemplate.RunSetData) {
                return patrolTemplateDisplay(patrolTemplate);
            } else {
                //This should just be for legacy patrol
                return 'Patrol Run 1 of 1';
            }
        }
    }

    public isEstopEnabled():boolean {
        if (this.platform) {
            if (this.platform.State.PlatformMode === PlatformMode.Estop || this.platform.State.PlatformMode === PlatformMode.EstopPhysical) {
                return true;
            }
        }
        else {
            if (this.patrolInstance) {
                let platform: Platform = this.platformService.getPlatform(this.patrolInstance.PlatformId);
                if (platform) {
                    if (this.platform.State.PlatformMode === PlatformMode.Estop || this.platform.State.PlatformMode === PlatformMode.EstopPhysical) {
                        return true;
                    }
                }
            }
        } 

        return false;
    }
}