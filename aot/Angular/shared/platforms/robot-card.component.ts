import {
    Component, Input, ChangeDetectionStrategy,
    ChangeDetectorRef, OnInit, OnDestroy, ElementRef,
    ViewChild
} from '@angular/core';
import { slideDown } from '../../shared/animations';
import { Platform, PlatformMode } from '../../platforms/platform.class';
import { MapViewOptions } from '../../shared/map-view-options.class';
import { PatrolService } from '../../patrols/patrol.service';
import { PlatformService } from '../../platforms/platform.service';
import { PatrolInstance, PatrolStatusValues } from '../../patrols/patrol.class';
import { Alarm } from '../../alarms/alarm.class';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { AlarmService } from '../../alarms/alarm.service';
import { PlatformCommand, CommandName, Parameter, ParameterName, ParameterType } from '../../patrols/action.class';
import { UserService } from '../../shared/user.service';

enum Subsections {
    RobotSensors,
    ActiveAlarms
}

@Component({
    selector: 'robot-card',
    templateUrl: 'robot-card.component.html',
	styleUrls: ['robot-card.component.css'],
    animations: [slideDown],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RobotCard implements OnInit, OnDestroy {
    @Input() platform: Platform;
    @Input() selected: boolean;
    @Input() expanded: boolean;
    @Input() mapViewOptions: MapViewOptions;
    @Input() disablePlatformTabScroll: boolean = true;

    @ViewChild('platformActions') platformActions: ElementRef;

    public actionMenuOpen: boolean = false;

    constructor(public patrolService: PatrolService,
                public platformService: PlatformService,
                private ref: ChangeDetectorRef,
                private Sanitizer: DomSanitizer,
                private alarmService: AlarmService,
                private userService: UserService) {
    }

    public patrolInstance: PatrolInstance;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private actionMenuUnsub: Subject<void> = new Subject<void>();
    public alarmCount: number;
    public Subsections: typeof Subsections = Subsections;
    private expandedSubSection: Map<number, string> = new Map<number, string>();
    public PatrolStatusValues: typeof PatrolStatusValues = PatrolStatusValues;
    private pauseNoficationTimeout: NodeJS.Timer;
    public PlatformMode: typeof PlatformMode = PlatformMode;

    public getPlatformPatrolCompleteness(): number {
        if (this.patrolInstance) {
            return this.patrolService.getPatrolCompleteness(this.patrolInstance);
        }
        return null;
    }

    public showPauseNotfication(): boolean {
        //If patrol is paused and notfication not seen
        if (this.patrolInstance &&
            this.patrolInstance.CurrentStatus === PatrolStatusValues.Paused &&
            !this.patrolInstance.notficationIsPaused) {
            //Hide pause button
            if (this.pauseNoficationTimeout) {
                clearTimeout(this.pauseNoficationTimeout);
            }

			this.pauseNoficationTimeout = setTimeout(() => {
				if (this.patrolInstance) {
					this.patrolInstance.notficationIsPaused = true;
					this.ref.markForCheck();
				}
            }, 3000);

            return true;
        }

        return false;
    }

    public expandedSubSectionViewState(subSection: Subsections): string {
        if (!this.expandedSubSection[subSection])
            this.expandedSubSection[subSection] = 'out';

        return this.expandedSubSection[subSection];
    }

    public handlePlatformNameClick(event: any) {
        event.stopPropagation();
        this.platformService.showRobotMonitor(this.platform)
    }

    public getAlarmList(): Alarm[] {
        let alarms: Alarm[] = [];

        alarms = this.alarmService.alarms.filter((alarm: Alarm) => {
            return alarm.PlatformId === this.platform.id;
        });

        this.alarmCount = alarms.length;
        return alarms;
    }

    public toggleExpandedSubSectionView(subSection: Subsections): void {
        event.stopPropagation();
        if (this.expandedSubSection[subSection] === 'out') {
            this.expandedSubSection[subSection] = 'in';
        } else {
            this.expandedSubSection[subSection] = 'out';
        }
    }

    public getPlatformManufacturerIconSrc(): string {
        let manufacturer = this.platformService.getPlatformManufacturerName(this.platform);
        if (manufacturer !== 'generic') {
            return '/Content/Images/Platforms/' + manufacturer + '-logo.png';
        }
        return '';
    }  

    public getPlatformOrientation(): number {
        if (this.platform.Orientation)
            return this.platform.Orientation;
        return 0;
    }

    public getPlatformHeadingRotation(): SafeStyle {
        return this.Sanitizer.bypassSecurityTrustStyle('rotate(' + this.platform.Orientation + 'deg)');
    }

    public getPlatformStatus(): string {
        if (this.patrolInstance) {
            //Return the patrol status
            return this.patrolService.getPatrolStatusClass(this.patrolService.getPatrolTemplate(this.patrolInstance.TemplateId), this.patrolInstance);
        } else if (this.platformService.isPlatformAvailable(this.platform)) {
            return 'availableStatus'; //blue
        } else {
            return 'unavailableStatus';
        }
    }

    public getPlatformHeadingCardinal(): string {
        if (this.platform.Orientation) {
            if (this.platform.Orientation < 33.75) {
                return 'N';
            } else if (this.platform.Orientation < 78.75) {
                return 'NE';
            } else if (this.platform.Orientation < 123.75) {
                return 'E';
            } else if (this.platform.Orientation < 168.75) {
                return 'SE';
            } else if (this.platform.Orientation < 213.75) {
                return 'S';
            } else if (this.platform.Orientation < 258.75) {
                return 'SW';
            } else if (this.platform.Orientation < 303.75) {
                return 'W';
            } else if (this.platform.Orientation < 348.75) {
                return 'NW';
            }
        }
        return 'N';
    }

    public getPlatformBatteryIconSrc(): string {
        if (this.platform.BatteryPercentage) {
            if (this.platform.BatteryPercentage > 90) {
                return '/Content/Images/Platforms/battery-icons-100.png';
            } else if (this.platform.BatteryPercentage > 80) {
                return '/Content/Images/Platforms/battery-icons-90.png';
            } else if (this.platform.BatteryPercentage > 70) {
                return '/Content/Images/Platforms/battery-icons-80.png';
            } else if (this.platform.BatteryPercentage > 60) {
                return '/Content/Images/Platforms/battery-icons-70.png';
            } else if (this.platform.BatteryPercentage > 50) {
                return '/Content/Images/Platforms/battery-icons-60.png';
            } else if (this.platform.BatteryPercentage > 40) {
                return '/Content/Images/Platforms/battery-icons-50.png';
            } else if (this.platform.BatteryPercentage > 30) {
                return '/Content/Images/Platforms/battery-icons-40.png';
            } else if (this.platform.BatteryPercentage > 20) {
                return '/Content/Images/Platforms/battery-icons-30.png';
            } else if (this.platform.BatteryPercentage > 10) {
                return '/Content/Images/Platforms/battery-icons-20.png';
            } else if (this.platform.BatteryPercentage > 5) {
                return '/Content/Images/Platforms/battery-icons-10.png';
            } else {
                return '/Content/Images/Platforms/battery-icons-5.png';
            }
        }
        return '';
    }

    public isProgressBarHidden(): boolean {
        let isHidden: boolean = true;
        if (this.patrolInstance) {
            isHidden = false;
        } else if (this.platform.PatrolTemplateSubmittedId){
            isHidden = false;
        }

        return isHidden;
    }

    public goToPatrol(event: any, patrolTemplateId: string): void {
        event.stopPropagation();

        this.mapViewOptions.showPlatformsTab = false;
        this.mapViewOptions.showAlarmsTab = false;
		this.mapViewOptions.showPatrolsTab = true;
		this.mapViewOptions.lastShownTab = 'Patrol';

        this.patrolService.toggleSelectedPatrol(patrolTemplateId, true);
        this.patrolService.scollToPatrol(patrolTemplateId);
    }

    public isPaused(): boolean {
        if (this.patrolInstance && this.patrolInstance.CurrentStatus === PatrolStatusValues.Paused) {
            return true;
        }

        return false;
    }

    public pauseOnClick(event: any) {
        event.stopPropagation();
        let parameterList: Parameter[] = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolInstance.InstanceId, Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.PausePatrol, parameterList));
    }

    public resumeOnClick(event: any) {
        event.stopPropagation();
        let parameterList: Parameter[] = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolInstance.InstanceId, Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.ResumePatrol, parameterList));
    }

    public openActionMenu(event: MouseEvent, atMouse: boolean = false): void {
        if (atMouse) {
            event.preventDefault();
            this.platformService.openPlatformActionMenu(this.platform, event, null, null, null, this.disablePlatformTabScroll);
        } else {
            this.platformService.openPlatformActionMenu(this.platform, event, this.platformActions, null, null, this.disablePlatformTabScroll);
        }

        this.actionMenuOpen = true;
        this.platformService.platformCommandDialogClosed
            .takeUntil(this.actionMenuUnsub)
            .subscribe({
                next: () => {
                    this.actionMenuOpen = false;
                    this.ref.detectChanges();
                    this.actionMenuUnsub.next();
                }
            });
    }

    public ngOnInit(): void {
        this.patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.platform.id);

        //Need to listen to instance updates
        this.patrolService.onUpsertInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolInstance) => {
                    if (patrolInstance.PlatformId === this.platform.id) {
                        this.patrolInstance = patrolInstance;
                        this.ref.markForCheck();
                    }
                }
            });

        this.patrolService.onPatrolInstanceComplete
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolInstance) => {
                    if (patrolInstance.PlatformId === this.platform.id) {
                        this.patrolInstance = null;
                        this.ref.markForCheck();
                    }
                }
            });
    }

    public ngOnDestroy(): void {
        if (this.pauseNoficationTimeout) {
            clearTimeout(this.pauseNoficationTimeout);
        }
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        this.actionMenuUnsub.next();
        this.actionMenuUnsub.complete();
    }
}

