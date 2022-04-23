import {
    Component, Input, ChangeDetectorRef,
    OnInit, Output, EventEmitter, ViewChild, ElementRef
} from '@angular/core';
import { PatrolService } from '../patrols/patrol.service';
import { PlatformService } from '../platforms/platform.service';
import { PatrolInstance, PatrolStatusValues } from '../patrols/patrol.class';
import { Platform } from '../platforms/platform.class';
import { PointStatusValues} from '../patrols/point.class';
import { ActionStatusValues} from '../patrols/action.class';
import { PatrolPlan } from './patrol-plan.component';
import { slideDown } from '../shared/animations';
import { Alarm} from '../alarms/alarm.class';
import { TimerService } from '../shared/timer.service';
import { AlarmService } from './../alarms/alarm.service';
import { MediaService } from './../shared/media/media.service';
import { SortType } from './../shared/shared-interfaces';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';
import { Popover } from "../shared/popover.component";

export enum NameOption {
    noDisplay = 0,
    showRobotName = 1,
    showPatrolName = 2
}

@Component({
    selector: 'patrol-overview',
    templateUrl: 'patrol-overview.component.html',
    styleUrls: ['patrol-overview.component.css'],
    animations: [slideDown]
})
export class PatrolOverview implements OnInit {
    @Input() patrolInstance: PatrolInstance;
    @Input() platform: Platform;
    @Input() nameOption: NameOption = NameOption.noDisplay;
    @Input() isSmallFormat: boolean = true;
    @Input() expandedState: boolean = false;
    @Input() showPathPoints: boolean = false;
    @Input() showSortButton: boolean = true;
    @Input() showPointOptionsButton: boolean = false;
    @Input() sortOrder: SortType = SortType.Desc;

    @Output() onPlatformClick: EventEmitter<Platform> = new EventEmitter<Platform>();
    @Output() onExpanded: EventEmitter<string> = new EventEmitter<string>();

    @ViewChild(PatrolPlan) private patrolInstancePlan: PatrolPlan;
    @ViewChild('popover') pointOptions: Popover;
    @ViewChild('btnPointOptions') popoverTarget: ElementRef;

    public patrolAlarms: Alarm[] = [];
    public clearedAlarms: Alarm[] = [];
    public PointStatusValues: typeof PointStatusValues = PointStatusValues;
    public ActionStatusValues: typeof ActionStatusValues = ActionStatusValues;
    public PatrolStatusValues: typeof PatrolStatusValues = PatrolStatusValues;
        
    private currentCheckpointColor: string = '#249C49';
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private alarmIdList: string[] = [];
    private loadedAlarms: Map<string, boolean> = new Map<string, boolean>();
    private isLoadingAlarmHistory: boolean = false;
    public NameOption: typeof NameOption = NameOption; 
    public showAllPatrolPoints: boolean = false;

    constructor(private patrolService: PatrolService,
                private platformService: PlatformService,
                private ref: ChangeDetectorRef,
                private alarmService: AlarmService,
                private timerService: TimerService,
                private mediaService: MediaService) { }

    public toggleSort(): void {
        try {
            event.stopPropagation();
        } catch (e) {
            console.error(e);
        }

        if (this.sortOrder === SortType.Desc)
            this.sortOrder = SortType.Asc;
        else
            this.sortOrder = SortType.Desc;

        this.ref.markForCheck();
    }

    public getFormattedPatrolStartTime(): string {
        return moment.utc(this.patrolInstance.StartedTime).local().format('hh:mm:ssa');
    }

    public getFormattedPatrolEndTime(): string {
        return moment.utc(this.patrolInstance.EndedTime).local().format('hh:mm:ssa');
    }

    public getTimeSince(dateTime: any, extraText: string = ''): string {
        if (!this.patrolInstance) {
            return '';
        }

        let tempDate: Date;
        if (isNaN(dateTime)) {
            tempDate = moment(dateTime).toDate();
        } else {
            tempDate = moment.utc(parseInt(dateTime)).local().toDate();
        }
                 
        let result = moment.duration(moment().diff(tempDate)).humanize();
        if (result.includes('second')) {
            return 'now';
        }

        if (result.includes('month') || result.includes('year')) {
            return moment(tempDate).format('MM/DD/YY hh:mma');
        }

        result = result.replace('hour', 'hr');
        result = result.replace('minute', 'min');
        result = result.replace('an ', '1 ');
        result = result.replace('a ', '1 ');
        return result + ' ' + extraText;
    }

    public platformNameClicked(event: any) {
        if (!this.platform) {
            return;
        }

        event.stopPropagation();
        this.onPlatformClick.next(this.platform);
    }

    public ngOnInit(): void {
        this.patrolService.onUpdateHistoryItem
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolInstance) => {
                    if (patrolInstance.id === this.patrolInstance.id) {
                        this.patrolInstance = patrolInstance;
                        this.ref.markForCheck();
                    }
                }
            });

        this.timerService.onMinuteTick
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => {
                    if (this.expandedState) {
                        this.ref.markForCheck();
                    }
                }
            });

        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                    if (this.platform && platform) {
                        if (this.platform.id === platform.id) {
                            this.ref.detectChanges();
                        }
                    }
                }
            });

        this.alarmService.editedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => {
                    if (this.loadedAlarms.has(alarm.Id)) {
                        this.ref.markForCheck();
                    }
                }
            });

        this.alarmService.removedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => {
                    if (this.loadedAlarms.has(alarm.Id)) {
                        setTimeout(() => {
                            this.alarmIdList = [];
                            this.loadedAlarms = new Map<string, boolean>();
                            this.clearedAlarms = [];
                            this.ref.markForCheck();
                        }, 1000);                       
                    }
                }
            });

        this.alarmService.newAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => {
                    this.ref.detectChanges();
                }
            });
    }

    public getPatrolDate(stringDate: string): string {
        return moment.utc(stringDate).local().format('MM/DD/YYYY');
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public isRunningPatrol() {
        return !(this.patrolInstance.CurrentStatus === PatrolStatusValues.Completed ||
            this.patrolInstance.CurrentStatus === PatrolStatusValues.Failed ||
            this.patrolInstance.CurrentStatus === PatrolStatusValues.Aborted ||
            this.patrolInstance.CurrentStatus === PatrolStatusValues.FailedMostCheckpoints ||
            this.patrolInstance.CurrentStatus === PatrolStatusValues.FailedCheckpoints ||
            this.patrolInstance.CurrentStatus === PatrolStatusValues.PointsNotReached);
    }


    public ngAfterViewInit() {
        //Force child component to trigger to get point count
        this.ref.detectChanges();
    }

    public handleExpandClick(): void {
        this.expandedState = !this.expandedState;
        if (this.expandedState) {
            this.onExpanded.next(this.patrolInstance.InstanceId);
        } else {
            this.onExpanded.next('none');
        }
    }

    public getOperatorInitials(): any[] {
        let initials: any[] = this.patrolInstance.UserName.match(/\b\w/g) || [];
        initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();

        return initials;
    }

    public getPatrolAlarmList(): Alarm[] {
        this.alarmIdList = [];

        if (this.patrolInstance.AlarmIds) {
            this.alarmIdList = this.alarmIdList.concat(this.patrolInstance.AlarmIds);
        }

        //Get point alarm Ids
        for (let point of this.patrolInstance.Points) {
            if (point.AlarmIds) {
                this.alarmIdList = this.alarmIdList.concat(point.AlarmIds);
            }

            //Get action alarm Ids
            for (let action of point.Actions) {
                if (action.AlarmIds) {
                    this.alarmIdList = this.alarmIdList.concat(action.AlarmIds);
                }
            }
        }

        this.patrolAlarms = [];

        //Remove dups
        let tempList: string[] = [];
        for (let alarmId of this.alarmIdList) {
            if (tempList.indexOf(alarmId) === -1) {
                tempList.push(alarmId);
            }
        }

        this.alarmIdList = tempList;        

        //Get alarm object for active alarms
        for (let alarmId of this.alarmIdList) {
            let alarm = this.alarmService.getAlarmById(alarmId);

            if (alarm) {
                this.patrolAlarms.push(alarm);
                this.alarmIdList.splice(this.alarmIdList.indexOf(alarmId), 1);
            }
        }

        //If there are still alarmIDs go look to see if I have gotten them from history before
        for (let alarm of this.clearedAlarms) {
            this.alarmIdList.splice(this.alarmIdList.indexOf(alarm.Id), 1);
        }
        this.patrolAlarms = this.patrolAlarms.concat(this.clearedAlarms);
    
        //Nothing left to do but to get them from the db
        if (this.alarmIdList.length > 0 && !this.isLoadingAlarmHistory) {  
            this.isLoadingAlarmHistory = true;
            this.alarmService.loadAlarmsByIds(this.alarmIdList).then((alarms) => {
                if (alarms && alarms.length > 0) {
                    for (let clearedAlarm of alarms) {

                        let alarm: Alarm = new Alarm(clearedAlarm);
                        this.clearedAlarms.push(alarm);
                        this.patrolAlarms.push(alarm);

                    }
                    this.ref.markForCheck();
                    this.isLoadingAlarmHistory = false;
                }
            });
        }

        //Clean up data
        let pushAlarmList: Alarm[] = [];
        this.loadedAlarms = new Map<string, boolean>();
        for (let alarm of this.patrolAlarms) {
            if (!this.loadedAlarms.has(alarm.Id)) {
                this.loadedAlarms.set(alarm.Id, true);
                pushAlarmList.push(alarm);
            }
        }

        this.patrolAlarms = pushAlarmList;

        return this.patrolAlarms;
    }

    private changePointOptions(event: any): void {
        event.stopPropagation();
        this.pointOptions.show(this.popoverTarget, 1, -1);
    }

    public onPointOptionsChange(): void {
        this.pointOptions.hide();
        this.ref.detectChanges();
    }
}