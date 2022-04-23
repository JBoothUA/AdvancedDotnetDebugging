import {
    Component, ChangeDetectionStrategy, Input,
    OnInit, ChangeDetectorRef, ViewChild,
    OnDestroy, ElementRef
} from '@angular/core';
import * as moment from 'moment';
import {
    PatrolTemplate, PatrolInstance
} from './patrol.class';
import { MapViewOptions } from '../shared/map-view-options.class';
import { ConfirmationDialog } from './../shared/confirmation-dialog.component';
import { PatrolService } from './patrol.service';
import { PlatformService } from './../platforms/platform.service';
import { Platform } from './../platforms/platform.class';
import { slideDown } from './../shared/animations';
import { PointStatusValues } from './point.class';
import { ActionStatusValues } from './action.class';
import { PatrolPlan } from './patrol-plan.component';
import { SortType } from './../shared/shared-interfaces';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { Popover } from './../shared/popover.component';
import { UserService } from './../shared/user.service';

enum Subsections {
    History,
    Points
}

@Component({
    selector: 'patrol-card',
    templateUrl: 'patrol-card.component.html',
    styleUrls: ['patrol-card.component.css'],
    animations: [slideDown],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatrolCard implements OnInit, OnDestroy {
    @Input() patrolTemplate: PatrolTemplate;
    @Input() patrolInstance: PatrolInstance;
    @Input() selected: boolean;
    @Input() expanded: boolean;
    @Input() mapViewOptions: MapViewOptions;

    @ViewChild(ConfirmationDialog) confirmDelete: ConfirmationDialog;
    @ViewChild(PatrolPlan) private patrolPlan: PatrolPlan;
    @ViewChild('popover') pointOptions: Popover;
    @ViewChild('btnPointOptions') popoverTarget: ElementRef;

    public platform: Platform;
    private expandedHistoryItem: number = -1;
    public Subsections: typeof Subsections = Subsections;
	private expandedSubSection: Map<Subsections, string> = new Map<Subsections, string>();
    public isLoadingHistory: boolean = false;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private currentCheckpointColor: string = "#249C49";
    public isCheckpointDone: boolean = false;
    private checkPointTimer: NodeJS.Timer;
    public updateToggle: boolean = false;
    private expandedPatrolOverview: string = null;
    public patrolPlanSortOrder: SortType = SortType.Asc;
    public operator: any[] = [];
    public showAllPatrolPoints: boolean = false;
    public patrolHistorySortOrder: SortType = SortType.Desc;

    constructor(public patrolService: PatrolService,
                public ref: ChangeDetectorRef,
                private platformService: PlatformService,
                private userService: UserService) {
    }

    public editPatrol(patrolId: string): void {
        this.patrolService.startEditPatrol(patrolId);
        this.platformService.showRobotMonitor(null);
    }

    public deletePatrolConfirm(): void {
        this.confirmDelete.show();
    }

    public getActionCompleteness(): number {
        if (this.patrolService.getPatrolStatusClass(this.patrolTemplate, this.patrolInstance) === 'availableStatus' ||
            (this.patrolTemplate.IsPatrolSubmitted && !this.patrolInstance))
            return 0.0;

        this.currentCheckpointColor = "#249C49";
        for (let point of this.patrolInstance.Points) {
            //Check if the next point has not been started
            if (this.patrolInstance.Points[point.Ordinal] &&
                !(this.patrolInstance.Points[point.Ordinal].CurrentStatus === PointStatusValues.Unknown ||
                    this.patrolInstance.Points[point.Ordinal].CurrentStatus === PointStatusValues.InTransit)) {
                continue;
            }

            let currentStatusValue: PointStatusValues = this.patrolService.getPointStatus(point, this.patrolInstance.Points);
            if (currentStatusValue === PointStatusValues.Reached || currentStatusValue === PointStatusValues.ActionsPerformed) {
                //Look at actions
                if (point.Actions.length > 0) {
                    let completedActions: number = 0;
                    for (let action of point.Actions) {
                        if (action.CurrentStatus !== ActionStatusValues.Unknown &&
                            action.CurrentStatus !== ActionStatusValues.Started) {
                            completedActions += 1;
                        }
                        if (action.CurrentStatus === ActionStatusValues.Failed ||
                            action.CurrentStatus === ActionStatusValues.Unsupported) {
                            this.currentCheckpointColor = "#E9AB08";
                        }
                    }

                    let value: number = completedActions / point.Actions.length;
                    value = value === 0.0 ? 0.0000001 : value;

                    //If the current checkpoint is complete clear it
                    if (value === 1) {
                        if (!this.isCheckpointDone) {
                            this.checkPointTimer = setTimeout(() => {
                                this.isCheckpointDone = true;
                                this.ref.markForCheck();
                            }, 1000);
                        }
                    } else {
                        this.isCheckpointDone = false;
                    }

                    return value;
                }
            }
        }
        this.isCheckpointDone = true;
        return 0.0;
    }

    public getPlatform() {
        if (this.platform) {
            return this.platform;
        } else {
            if (this.patrolInstance) {
                return this.platformService.getPlatform(this.patrolInstance.PlatformId);
            } else {
                return this.platformService.getPlatform(this.patrolTemplate.PlatformSubmittedId);
            }
        }
    }

    public getPatrolAlarmsCount(): string {
        if (!this.patrolInstance)
            return '0';

        //Build list of all alarm ids
        let alarmIdList: string[] = [];

        if (this.patrolInstance.AlarmIds) {
            alarmIdList = alarmIdList.concat(this.patrolInstance.AlarmIds);
        }

        //Get point alarm Ids
        for (let point of this.patrolInstance.Points) {
            if (point.AlarmIds) {
                alarmIdList = alarmIdList.concat(point.AlarmIds);
            }

            //Get action alarm Ids
            for (let action of point.Actions) {
                if (action.AlarmIds) {
                    alarmIdList = alarmIdList.concat(action.AlarmIds);
                }
            }
        }

        //Remove dups
        let tempList: string[] = [];
        for (let alarmId of alarmIdList) {
            if (tempList.indexOf(alarmId) === -1) {
                tempList.push(alarmId);
            }
        }

        alarmIdList = tempList;

        if (alarmIdList.length > 9)
            return '9+';

        return alarmIdList.length.toString();
    }

    public expandedPatrolHistoryViewState(historySection: number): string {

        if (historySection === this.expandedHistoryItem)
            return 'out';

        return 'in';
    }

    public toggleExpandedPatrolHistoryView(historySection: number): void {
        event.stopPropagation();

        if (this.expandedHistoryItem === historySection)
            this.expandedHistoryItem = null;
        else
            this.expandedHistoryItem = historySection;
    }

    public expandedSubSectionViewState(subSection: Subsections): string {
        if (!this.expandedSubSection[subSection])
            this.expandedSubSection[subSection] = 'out';

        return this.expandedSubSection[subSection];
    }

    public goToPlatform(platform: any) {
        this.platformService.showRobotMonitor(platform);
    }

    public toggleExpandedSubSectionView(subSection: Subsections): void {
        event.stopPropagation();
        if (this.expandedSubSection[subSection] === 'out') {
            this.expandedSubSection[subSection] = 'in';
        } else {
            this.expandedSubSection[subSection] = 'out';
        }
    }

    public getPatrolcompletenessText(): string {
        return (Math.round(this.getPatrolCompleteness() * 100).toString());
    }

    public getPatrolCompleteness(): number {
        if (this.patrolService.getPatrolStatusClass(this.patrolTemplate, this.patrolInstance) === 'availableStatus')
            return 0.0;
        return this.patrolService.getPatrolCompleteness(this.patrolInstance);
    }

    public handlePatrolOverviewExpansion(instanceId: string) {
        this.expandedPatrolOverview = instanceId;
        this.ref.detectChanges();
    }

    public getPatrolDate(stringDate: string): string {
        return moment.utc(stringDate).local().format('MM/DD/YYYY');
    }

    public expandExpandedView(patrolTemplate: PatrolTemplate) {

        let response: Promise<any> = this.patrolService.getPatrolHistory(this.patrolTemplate.TemplateId);
        this.isLoadingHistory = true;
        response.then((data) => {
            this.patrolService.patrolHistoryMap.set(this.patrolTemplate.id, []);

            for (let item of data) {
                let historyArray = this.patrolService.patrolHistoryMap.get(this.patrolTemplate.id);
                historyArray.push(new PatrolInstance(item));
                this.patrolService.patrolHistoryMap.set(this.patrolTemplate.id, historyArray);
            }

            

            this.isLoadingHistory = false;
            this.ref.markForCheck();
        });

        this.patrolService.toggleExpandedPatrol(this.patrolTemplate.TemplateId, true);
    }

    public getPatrol(): PatrolTemplate | PatrolInstance {
        return (this.patrolInstance) ? this.patrolInstance : this.patrolTemplate;
    }

    public ngOnInit(): void {
        this.expandedSubSection[Subsections.Points] = 'in';

        this.operator = this.getOperatorInitials();
        this.patrolService.onUpsertTemplate
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolTemplate) => {
                    if (patrolTemplate.id === this.patrolTemplate.id) {
                        this.updateToggle = !this.updateToggle;
                        this.ref.markForCheck();
                        this.patrolPlan.refresh();
                    }
                }
            });

        this.patrolService.onNewInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolInstance) => {
                    
                    if (patrolInstance.TemplateId === this.getPatrol().id) {
                        this.updateToggle = !this.updateToggle;
                        //Auto open if current user kicked off patrol
                        if (patrolInstance.UserName === this.userService.currentUser.name) {
                            this.handlePatrolOverviewExpansion(null);
                        }
                    }
                }
            });

        this.patrolService.onPatrolInstanceComplete
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolInstance) => {
                    if (patrolInstance.TemplateId === this.patrolTemplate.id) {
                        let patrolHistory = this.patrolService.patrolHistoryMap.get(this.patrolTemplate.id);
                        if (patrolHistory) {
                            patrolHistory.unshift(patrolInstance);
                            patrolHistory = patrolHistory.slice(0, 5);
                            this.patrolService.patrolHistoryMap.set(this.patrolTemplate.id, patrolHistory);
                        }
                        this.ref.markForCheck();
                    }
                }
            });
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public getFormattedTime(time:number): string {
        return moment.utc(time).local().format('MM/DD/YYYY hh:mm:ssa');
    }

    public getOperatorInitials(): any[] {
       
        if (!this.patrolTemplate.UserName) {
            return ['?'];
        }

        let initials: any[] = this.patrolTemplate.UserName.match(/\b\w/g) || [];
        initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();

        return initials;
    }

    public toggleSort(): void {
        try {
            event.stopPropagation();
        } catch (e) {
            console.error(e);
        }

        if (this.patrolPlanSortOrder === SortType.Desc)
            this.patrolPlanSortOrder = SortType.Asc;
        else
            this.patrolPlanSortOrder = SortType.Desc;

        this.ref.markForCheck();
    }

    public toggleHistorySort(): void {
        try {
            event.stopPropagation();
        } catch (e) {
            console.error(e);
        }

        if (this.patrolHistorySortOrder === SortType.Desc)
            this.patrolHistorySortOrder = SortType.Asc;
        else
            this.patrolHistorySortOrder = SortType.Desc;

        this.ref.markForCheck();
    }

    public handleOnExpandedViewHidden(event: boolean): void {
        this.pointOptions.hide();
    }

    private showRobotMonitor(platform: Platform): void {
        event.stopPropagation();
        this.platformService.showRobotMonitor(platform);
    }

    public stopPropagation(): void {
        event.stopPropagation();
    }
}