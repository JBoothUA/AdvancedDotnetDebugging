import {
    Component, OnInit, Input, Output, EventEmitter, trigger, state,
    transition, style, animate, ViewChild, ElementRef
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { CalendarModule } from 'primeng/components/calendar/calendar';
import { Location } from '../shared/location.class';
import { Tenant } from '../shared/tenant.class';
import { DropDown } from '../shared/dropdown.component';
import { Alarm } from '../alarms/alarm.class';
import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPatrolService } from './dashboard-patrol.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { FilterTimeframe } from './dashboard';
import { PatrolInstance, PatrolTemplate } from '../patrols/patrol.class';

export class FilterOptions {
    showAlarmsTab: boolean;
    showPlatformsTab: boolean;
    showPatrolsTab: boolean;
}

enum Section {
    Location = 0,
    Alarm,
    Patrol,
    Robot,
    CustomDate,
    More
}

@Component({
    selector: 'dashboard-filter',
    templateUrl: 'dashboard-filter.component.html',
    styleUrls: ['dashboard-filter.component.css', 'dashboard.component.css'],
    animations: [
        trigger('toggle', [
            state('in', style({
                display: 'none',
                height: '0px',
                overflow: 'hidden'
            })),
            state('out', style({
                height: '*'
            })),
            transition('in <=> out', animate('400ms ease-in-out'))
            ]
        )
    ]
})

export class DashboardFilter {
    //Class Variables
    show: boolean = false;
    showPanel: boolean = true;
    filterTimeframe: typeof FilterTimeframe = FilterTimeframe;
    tenantLocationHeader: string = '';
    tenantLocationFilters: any[] = [];
    errorMessage: string;
    options: FilterOptions;
    tenants: Tenant[];
    Section: typeof Section = Section;
    expandedSection: Map<Section, string> = new Map<Section, string>();
    
    //custom date variables
    customStartDate: Date;
    customEndDate: Date;
    customStartMaxDate: Date;
    customEndMinDate: Date;
    customDateReadonlyInput: boolean = true;

    //alarm filter criteria
    alarmFilterPriorityList: {} = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
    alarmFilterOperatorList: {} = {};
    alarmFilterDescriptionList: {} = {};
    alarmFilterStatusList: {} = {};
    alarmFilterRobotList: {} = {};

    alarmFilterCriteriaText: string = null;
    alarmFilterCriteriaTotalCount: number = 0;
    alarmFilterCriteriaPriorityCount: number = 0;
    alarmFilterCriteriaOperatorCount: number = 0;
    alarmFilterCriteriaDescCount: number = 0;
    alarmFilterCriteriaStateCount: number = 0;
    alarmFilterCriteriaRobotCount: number = 0;

    //patrol filter criteria
    patrolFilterAlarmPriorityList: {} = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
    patrolFilterOperatorList: {} = { All: 'All' };
    patrolFilterPatrolDisplayNameList: {} = { All: 'All' };
    patrolFilterStatusList: {} = { All: 4, Successful: 0, Warning: 1, Incomplete: 2, Critical: 3 };
    patrolFilterRobotList: {} = { All: 'All' };

    patrolFilterCriteriaText: string = null;
    patrolFilterCriteriaTotalCount: number = 0;
    patrolFilterCriteriaAlarmPriorityCount: number = 0;
    patrolFilterCriteriaOperatorCount: number = 0;
    patrolFilterCriteriaPatrolDisplayNameCount: number = 0;
    patrolFilterCriteriaStatusCount: number = 0;
    patrolFilterCriteriaRobotCount: number = 0;

    patrolFilterPatrolDisplayNameDefault: string = '';
     
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    ///////////////////////////////////////////
    //Core Angular Methods
    ///////////////////////////////////////////
    constructor(private dashboardService: DashboardService,
        private dashboardAlarmService: DashboardAlarmService,
        private dashboardPatrolService: DashboardPatrolService,
        private dashboardPlatformService: DashboardPlatformService) {

        //alarm data
        this.dashboardAlarmService.onAlarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.alarmDataUpdated()
            });

        this.dashboardAlarmService.onNewAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.alarmDataUpdated()
            });

        this.dashboardAlarmService.onEditAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.alarmDataUpdated()
            });

        this.dashboardAlarmService.onRemoveAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.alarmDataUpdated()
            });

        //patrol instance data
        this.dashboardPatrolService.onPatrolsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.patrolDataUpdated()
            });

        this.dashboardPatrolService.onNewPatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.patrolDataUpdated()
            });

        this.dashboardPatrolService.onCompletededPatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleCompletededPatrolInstance()
            });

        //patrol template data
        this.dashboardPatrolService.onPatrolTemplatesLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.patrolDataUpdated()
            });

        this.dashboardPatrolService.onPatrolTemplateDeleted
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.patrolDataUpdated()
            });

        this.dashboardPatrolService.onUpdatePatrolTemplate
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.patrolDataUpdated()
            });

        //platform data
        this.dashboardPlatformService.onPlatformsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handlePlatformsLoaded()
            });

        //timeframe change
        this.dashboardAlarmService.updateAlarmData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.alarmDataUpdatedForTimeframeChange()
            });

        this.dashboardPatrolService.onUpdatePatrolData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.patrolDataUpdatedForTimeframeChange()
            });

        //filter criteria
        this.dashboardService.onShowAlarmFilterCriteria
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.showAlarmFilterCriteria()
            });

        this.dashboardService.onShowPatrolFilterCriteria
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.showPatrolFilterCriteria()
            });

        this.dashboardService.onRemoveSelectedAlarmFilterCriteria
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (event) => this.removeSelectedAlarmFilters(event)
            });

        this.dashboardService.onRemoveSelectedPatrolFilterCriteria
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (event) => this.removeSelectedPatrolFilters(event)
            });

        this.options = new FilterOptions();
        //this.alarmDataUpdated(); //TSR* 

        //TODO - load patrol data criteria
    }

    ngOnInit() {
        if (this.getSelectedTimeframe() === FilterTimeframe.Custom) {
            this.expandedSection[Section.CustomDate] = 'out';
        }

        //default to last 8 hours
        this.customStartDate = this.dashboardService.getTimeFrameStartTime(8, 'hours');
        this.customEndDate = this.dashboardService.getTimeFrameEndTime();  

        this.startDateChanged();
        this.endDateChanged();

        //TSR*
        if (this.dashboardService.alarmDataLoaded)
            this.alarmDataUpdated();
    }

    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    public expandedSectionViewState(section: Section): string {
        if (!this.expandedSection[section])
            this.expandedSection[section] = 'in';
        return this.expandedSection[section];
    }

    public toggleExpandedSectionView(section: Section): void {
        event.stopPropagation();
        if (this.expandedSection[section] === 'out')
            this.expandedSection[section] = 'in';
        else
            this.expandedSection[section] = 'out';
    }

    toggleFilterPanelDone(event: any) {
        this.dashboardService.onLeftPanelToggled.next(event);
    }

    handlePlatformsLoaded() {
        this.loadAlarmRobotData();
        this.loadPatrolRobotData();
    }

    handleCompletededPatrolInstance() {
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            this.patrolCompleteUpdate();
        }
    }

    ///////////////////////////////////////////
    //Timeframe Methods
    ///////////////////////////////////////////
    getSelectedTimeframe(): FilterTimeframe {
        return this.dashboardService.getSelectedTimeframe();
    }

    setSelectedTimeframe(timeframe: FilterTimeframe): void {
        if (timeframe != FilterTimeframe.Custom)
            this.dashboardService.setSelectedTimeframe(timeframe);

        if ((timeframe != FilterTimeframe.Custom) && (this.expandedSection[Section.CustomDate] === 'out')) {
            this.expandedSection[Section.CustomDate] = 'in';
        }
    }

    ///////////////////////////////////////////
    //Custom Timeframe Methods
    ///////////////////////////////////////////

    startDateChanged(): void {
        let start = this.customStartDate;
        let end = this.customEndDate;
        if (start) {
            start = new Date(start);
            start.setDate(start.getDate());
            this.customEndMinDate = start;
        } else if (end) {
            this.customStartMaxDate = new Date(end);
        } else {
            end = new Date();
            this.customStartMaxDate = end;
            this.customEndMinDate = end;
        }

        this.dashboardService.setCustomStartDateTime(this.customStartDate);
    }

    endDateChanged(): void {
        let end = this.customEndDate;
        let start = this.customStartDate;

        if (end) {
            end = new Date(end);
            end.setDate(end.getDate());
            this.customStartMaxDate = end;
        } else if (start) {
            this.customEndMinDate = new Date(start);
        } else {
            end = new Date();
            this.customStartMaxDate = end;
            this.customEndMinDate = end;
        }

        this.dashboardService.setCustomEndDateTime(this.customEndDate);
    }

    clearDate(field: string): void {
        if (field) {
            if (field === 'start') {
                this.customStartDate = null;
                this.customStartMaxDate = this.customEndDate;
                this.customEndMinDate = new Date(1900, 0, 1);
                this.dashboardService.setCustomStartDateTime(this.customStartDate);
            }

            if (field === 'end') {
                this.customEndDate = null;
                this.customEndMinDate = this.customStartDate;
                this.customStartMaxDate = new Date(3000, 0, 1);
                this.dashboardService.setCustomEndDateTime(this.customEndDate);
            }
        }
    }

    applyCustomDate(): void {
        if ((this.dashboardService.customStartDateTime) || (this.dashboardService.customEndDateTime))
            this.dashboardService.setSelectedTimeframe(FilterTimeframe.Custom);
    }

    cancelCustomDate(): void {
        this.toggleExpandedSectionView(Section.CustomDate);
    }

    ///////////////////////////////////////////
    //More Filter Methods
    ///////////////////////////////////////////
    removeAllFilters(event: any) {
        this.removeSelectedAlarmFilters(event);
        this.removeSelectedPatrolFilters(event);
    }

    ///////////////////////////////////////////
    //Alarm Filter Methods
    ///////////////////////////////////////////
    alarmFilterSelected(alarmFilterType: string, event: any): void {
        let num: number = 0;
        let str: string = '';
        let changed: boolean = false;
        let filter: string = '';
        let value: any = '';

        switch (alarmFilterType.toLowerCase())
        {
            case 'priority':
                num = 0;
                if (event)
                    num = parseInt(event);
                if (this.dashboardAlarmService.alarmFilterPrioritySelection != num) {
                    changed = true;
                }

                //this.dashboardAlarmService.setAlarmFilter('priority', num);
                filter = 'priority';
                value = num;
                if (changed) {
                    //if (this.dashboardAlarmService.alarmFilterPrioritySelection > 0)
                    if (num > 0)
                        this.alarmFilterCriteriaPriorityCount = 1;
                    else
                        this.alarmFilterCriteriaPriorityCount = 0;
                }
                break;
            case 'operator':
                str = '';
                if (event)
                    str = event;
                //this.dashboardAlarmService.setAlarmFilter('operator', str);
                filter = 'operator';
                value = str;
                //if (this.dashboardAlarmService.alarmFilterOperatorSelection != 'All')
                if (str != 'All')
                    this.alarmFilterCriteriaOperatorCount = 1;
                else
                    this.alarmFilterCriteriaOperatorCount = 0;
                break;
            case 'description':
                str = '';
                if (event)
                    str = event;
                //this.dashboardAlarmService.setAlarmFilter('description', str);
                filter = 'description';
                value = str;
                //if (this.dashboardAlarmService.alarmFilterDescriptionSelection != 'All')
                if (str != 'All')
                    this.alarmFilterCriteriaDescCount = 1;
                else
                    this.alarmFilterCriteriaDescCount = 0;
                break;
            case 'state':
                num = 0;
                if (event)
                    num = parseInt(event);
                //this.dashboardAlarmService.setAlarmFilter('state', num);
                filter = 'state';
                value = num;
                //if (this.dashboardAlarmService.alarmFilterStateSelection > 0)
                if (num > 0)
                    this.alarmFilterCriteriaStateCount = 1;
                else
                    this.alarmFilterCriteriaStateCount = 0;
                break;
            case 'robot':
                str = '';
                if (event)
                    str = event;
                //this.dashboardAlarmService.setAlarmFilter('robot', str);
                filter = 'robot';
                value = str;
                //if (this.dashboardAlarmService.alarmFilterRobotSelection != 'All')
                if (str != 'All')
                    this.alarmFilterCriteriaRobotCount = 1;
                else
                    this.alarmFilterCriteriaRobotCount = 0;
                break;
            default:
                break;
        }

        this.alarmFilterCriteriaTotalCount = this.alarmFilterCriteriaPriorityCount + this.alarmFilterCriteriaOperatorCount + this.alarmFilterCriteriaDescCount + this.alarmFilterCriteriaStateCount + this.alarmFilterCriteriaRobotCount;
        if (this.alarmFilterCriteriaTotalCount > 1) {
            this.alarmFilterCriteriaText = "(" + this.alarmFilterCriteriaTotalCount.toString() + ") Filters Enabled";
        }
        else if (this.alarmFilterCriteriaTotalCount === 1) {
            this.alarmFilterCriteriaText = "(" + this.alarmFilterCriteriaTotalCount.toString() + ") Filter Enabled";
        }
        else
            this.alarmFilterCriteriaText = null;
        this.dashboardAlarmService.alarmFilterCriteriaTotalCount = this.alarmFilterCriteriaTotalCount;

        this.dashboardAlarmService.setAlarmFilter(filter, value);
    }

    alarmFilterUpdated(alarmFilterType: string, event: any): void {
        let num: number = 0;
        let str: string = '';
        let changed: boolean = false;
        let filter: string = '';
        let value: any = '';

        switch (alarmFilterType.toLowerCase()) {
            case 'priority':
                num = 0;
                if (event)
                    num = parseInt(event);
                if (this.dashboardAlarmService.alarmFilterPrioritySelection != num) {
                    changed = true;
                }

                //this.dashboardAlarmService.setAlarmFilter('priority', num);
                filter = 'priority';
                value = num;
                if (changed) {
                    //if (this.dashboardAlarmService.alarmFilterPrioritySelection > 0)
                    if (num > 0)
                        this.alarmFilterCriteriaPriorityCount = 1;
                    else
                        this.alarmFilterCriteriaPriorityCount = 0;
                }
                break;
            case 'operator':
                str = '';
                if (event)
                    str = event;
                //this.dashboardAlarmService.setAlarmFilter('operator', str);
                filter = 'operator';
                value = str;
                //if (this.dashboardAlarmService.alarmFilterOperatorSelection != 'All')
                if (str != 'All')
                    this.alarmFilterCriteriaOperatorCount = 1;
                else
                    this.alarmFilterCriteriaOperatorCount = 0;
                break;
            case 'description':
                str = '';
                if (event)
                    str = event;
                //this.dashboardAlarmService.setAlarmFilter('description', str);
                filter = 'description';
                value = str;
                //if (this.dashboardAlarmService.alarmFilterDescriptionSelection != 'All')
                if (str != 'All')
                    this.alarmFilterCriteriaDescCount = 1;
                else
                    this.alarmFilterCriteriaDescCount = 0;
                break;
            case 'state':
                num = 0;
                if (event)
                    num = parseInt(event);
                //this.dashboardAlarmService.setAlarmFilter('state', num);
                filter = 'state';
                value = num;
                //if (this.dashboardAlarmService.alarmFilterStateSelection > 0)
                if (num > 0)
                    this.alarmFilterCriteriaStateCount = 1;
                else
                    this.alarmFilterCriteriaStateCount = 0;
                break;
            case 'robot':
                str = '';
                if (event)
                    str = event;
                //this.dashboardAlarmService.setAlarmFilter('robot', str);
                filter = 'robot';
                value = str;
                //if (this.dashboardAlarmService.alarmFilterRobotSelection != 'All')
                if (str != 'All')
                    this.alarmFilterCriteriaRobotCount = 1;
                else
                    this.alarmFilterCriteriaRobotCount = 0;
                break;
            default:
                break;
        }

        this.alarmFilterCriteriaTotalCount = this.alarmFilterCriteriaPriorityCount + this.alarmFilterCriteriaOperatorCount + this.alarmFilterCriteriaDescCount + this.alarmFilterCriteriaStateCount + this.alarmFilterCriteriaRobotCount;
        if (this.alarmFilterCriteriaTotalCount > 1) {
            this.alarmFilterCriteriaText = "(" + this.alarmFilterCriteriaTotalCount.toString() + ") Filters Enabled";
        }
        else if (this.alarmFilterCriteriaTotalCount === 1) {
            this.alarmFilterCriteriaText = "(" + this.alarmFilterCriteriaTotalCount.toString() + ") Filter Enabled";
        }
        else
            this.alarmFilterCriteriaText = null;
        this.dashboardAlarmService.alarmFilterCriteriaTotalCount = this.alarmFilterCriteriaTotalCount;

        this.dashboardAlarmService.setAlarmFilter(filter, value);
    }

    loadAlarmRobotData(): void {
        let alarms: Alarm[] = this.dashboardAlarmService.getAlarms();
        if (alarms.length > 0) {
            this.alarmFilterRobotList = this.getAlarmRobots(alarms);
        }
    }

    showAlarmFilterCriteria()  {
        if (this.show)
            this.show = !this.show;

        if (this.expandedSection[Section.Alarm.toString()] === 'in')
            this.toggleExpandedSectionView(Section.Alarm);
    }

    showPatrolFilterCriteria() {
        if (this.show)
            this.show = !this.show;

        if (this.expandedSection[Section.Patrol.toString()] === 'in')
            this.toggleExpandedSectionView(Section.Patrol);
    }

    //Current Alarms Only
    alarmDataUpdated()  {
        let alarms: Alarm[] = this.dashboardAlarmService.getAlarms();
        this.alarmFilterOperatorList = this.getAlarmOperators(alarms);
        this.alarmFilterDescriptionList = this.getAlarmDescriptions(alarms);
        this.alarmFilterStatusList = this.getAlarmStatuses(alarms);
        this.alarmFilterRobotList = this.getAlarmRobots(alarms);
    }

    //timeframe patrol only
    alarmDataUpdatedForTimeframeChange()  {
        //this.dashboardAlarmService.clearAlarmFilters(false);
        this.alarmFilterCriteriaTotalCount = 0;
        this.dashboardAlarmService.alarmFilterCriteriaTotalCount = 0;
        this.alarmFilterCriteriaPriorityCount = 0;
        this.alarmFilterCriteriaOperatorCount = 0;
        this.alarmFilterCriteriaDescCount = 0;
        this.alarmFilterCriteriaStateCount = 0;
        this.alarmFilterCriteriaRobotCount = 0;
        this.alarmFilterCriteriaText = null;

        this.alarmFilterPriorityList = {};
        this.alarmFilterPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
        //$("#dropdownSelect-priority").val("4");
        let alarms: Alarm[] = this.dashboardAlarmService.getAlarms();
        this.alarmFilterOperatorList = this.getAlarmOperators(alarms);
        this.alarmFilterDescriptionList = this.getAlarmDescriptions(alarms);
        this.alarmFilterStatusList = this.getAlarmStatuses(alarms);
        this.alarmFilterRobotList = this.getAlarmRobots(alarms);
    }

    removeSelectedAlarmFilters(event: any) {
        if(event)
            event.stopPropagation();

        this.dashboardAlarmService.clearAlarmFilters(true);
        this.alarmFilterCriteriaTotalCount = 0;
        this.dashboardAlarmService.alarmFilterCriteriaTotalCount = 0;
        this.alarmFilterCriteriaPriorityCount = 0;
        this.alarmFilterCriteriaOperatorCount = 0;
        this.alarmFilterCriteriaDescCount = 0;
        this.alarmFilterCriteriaStateCount = 0;
        this.alarmFilterCriteriaRobotCount = 0;
        this.alarmFilterCriteriaText = null;

        this.alarmFilterPriorityList = {};
        this.alarmFilterPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
        //$("#dropdownSelect-priority").val("4");
        let alarms: Alarm[] = this.dashboardAlarmService.getAlarms();
        this.alarmFilterOperatorList = this.getAlarmOperators(alarms);
        this.alarmFilterDescriptionList = this.getAlarmDescriptions(alarms);
        this.alarmFilterStatusList = this.getAlarmStatuses(alarms);
        this.alarmFilterRobotList = this.getAlarmRobots(alarms);

    }

    private getAlarmOperators(alarms: Alarm[]): {} {
        let alarmData: {} = { All: 'All'};

        //walk high level 
        for (let i in alarms) {
            if (alarms[i].UserId) {
                if (typeof (alarmData[alarms[i].UserId]) == "undefined") {
                    alarmData[alarms[i].UserId] = alarms[i].UserId;
                }
            }

            if (alarms[i].Created) {
                if (alarms[i].Created.UserId != null) {
                    if (typeof (alarmData[alarms[i].Created.UserId]) == "undefined") {
                        alarmData[alarms[i].Created.UserId] = alarms[i].Created.UserId;
                    }
                }
            }

            if (alarms[i].Acknowledged) {
                if (alarms[i].Acknowledged.UserId != null) {
                    if (typeof (alarmData[alarms[i].Acknowledged.UserId]) == "undefined") {
                        alarmData[alarms[i].Acknowledged.UserId] = alarms[i].Acknowledged.UserId;
                    }
                }
            }

            if (alarms[i].Cleared) {
                if (alarms[i].Cleared.UserId != null) {
                    if (typeof (alarmData[alarms[i].Cleared.UserId]) == "undefined") {
                        alarmData[alarms[i].Cleared.UserId] = alarms[i].Cleared.UserId;
                    }
                }
            }

            if (alarms[i].Dismissed) {
                if (alarms[i].Dismissed.UserId != null) {
                    if (typeof (alarmData[alarms[i].Dismissed.UserId]) == "undefined") {
                        alarmData[alarms[i].Dismissed.UserId] = alarms[i].Dismissed.UserId;
                    }
                }
            }

            if (alarms[i].Comments) {
                for (let x in alarms[i].Comments) {
                    if (alarms[i].Comments[x].UserId != null) {
                        if (typeof (alarmData[alarms[i].Comments[x].UserId]) == "undefined") {
                            alarmData[alarms[i].Comments[x].UserId] = alarms[i].Comments[x].UserId;
                        }
                    }
                }
            }
        }

        return alarmData;
    }

    private getAlarmDescriptions(alarms: Alarm[]): {} {
        let alarmData: {} = { All: 'All'};

        for (let i in alarms) {
            if (alarms[i].Description) {
                if (typeof (alarmData[alarms[i].Description]) == "undefined") {
                    alarmData[alarms[i].Description] = alarms[i].Description;
                }
            }
        }
        return alarmData;
    }

    private getAlarmStatuses(alarms: Alarm[]): {} {
        let alarmData: {} = {};

        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            alarmData = { All: 0, Reported: 1, Acknowledged: 2 };
        }
        else {
            alarmData = { All: 0, Reported: 1, Acknowledged: 2, Cleared: 3, Dismissed: 4 };
        }
        return alarmData;
    }

    private getAlarmRobots(alarms: Alarm[]): {} {
        let alarmData: {} = {All: 'All'};

        for (let i in alarms) {
            if (alarms[i].PlatformId) {
                let platform = this.dashboardPlatformService.getPlatform(alarms[i].PlatformId);
                if (platform) {
                    if (typeof (alarmData[platform.id]) == "undefined") {
                        alarmData[platform.DisplayName] = platform.id;
                    }
                }
            }
        }
        return alarmData;
    }

    ///////////////////////////////////////////
    //Patrol Filter Methods
    ///////////////////////////////////////////
    patrolFilterSelected(patrolFilterType: string, event: any) {
        let num: number = 0;
        let str: string = '';
        let changed: boolean = false;
        let filter: string = '';
        let value: any = '';

        switch (patrolFilterType.toLowerCase()) {
            case 'alarmpriority':
                num = 0;
                if (event)
                    num = parseInt(event);
                if (this.dashboardPatrolService.patrolFilterAlarmPrioritySelection != num) {
                    changed = true;
                }

                //this.dashboardPatrolService.setPatrolFilter('alarmpriority', num);
                filter = 'alarmpriority';
                value = num;
                if (changed) {
                    //if (this.dashboardPatrolService.patrolFilterAlarmPrioritySelection > 0)
                    if(num > 0)
                        this.patrolFilterCriteriaAlarmPriorityCount = 1;
                    else
                        this.patrolFilterCriteriaAlarmPriorityCount = 0;
                }
                break;
            case 'operator':
                str = '';
                if (event)
                    str = event;
                //this.dashboardPatrolService.setPatrolFilter('operator', str);
                filter = 'operator';
                value = str;
                //if (this.dashboardPatrolService.patrolFilterOperatorSelection != 'All')
                if (str != 'All')
                    this.patrolFilterCriteriaOperatorCount = 1;
                else
                    this.patrolFilterCriteriaOperatorCount = 0;
                break;
            case 'displayname':
                str = '';
                if (event)
                    str = event;
                //this.dashboardPatrolService.setPatrolFilter('displayname', str);
                filter = 'displayname';
                value = str;
                //if (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection != 'All')
                if(str != 'All')
                    this.patrolFilterCriteriaPatrolDisplayNameCount = 1;
                else
                    this.patrolFilterCriteriaPatrolDisplayNameCount = 0;
                break;
            case 'status':
                //All: 4, Successful: 0, Warning: 1, Incomplete: 2, Critical: 3
                //All had to be 4 since the PatrolStatusValues enums is setup 0 - 3
                num = 0;
                if (event)
                    num = parseInt(event);
                //this.dashboardPatrolService.setPatrolFilter('status', num);
                filter = 'status';
                value = num;
                //if (this.dashboardPatrolService.patrolFilterStatusSelection <= 4)
                if(num <= 4)
                    this.patrolFilterCriteriaStatusCount = 1;
                else
                    this.patrolFilterCriteriaStatusCount = 0;
                break;
            case 'robot':
                str = '';
                if (event)
                    str = event;
                //this.dashboardPatrolService.setPatrolFilter('robot', str);
                filter = 'robot';
                value = str;
                //if (this.dashboardPatrolService.patrolFilterRobotSelection != 'All')
                if (str != 'All')
                    this.patrolFilterCriteriaRobotCount = 1;
                else
                    this.patrolFilterCriteriaRobotCount = 0;
                break;
            default:
                break;
        }

        this.patrolFilterCriteriaTotalCount = this.patrolFilterCriteriaAlarmPriorityCount + this.patrolFilterCriteriaOperatorCount + this.patrolFilterCriteriaPatrolDisplayNameCount + this.patrolFilterCriteriaStatusCount + this.patrolFilterCriteriaRobotCount;
        if (this.patrolFilterCriteriaTotalCount > 1) {
            this.patrolFilterCriteriaText = "(" + this.patrolFilterCriteriaTotalCount.toString() + ") Filters Enabled";
        }
        else if (this.patrolFilterCriteriaTotalCount === 1) {
            this.patrolFilterCriteriaText = "(" + this.patrolFilterCriteriaTotalCount.toString() + ") Filter Enabled";
        }
        else
            this.patrolFilterCriteriaText = null;
        this.dashboardPatrolService.patrolFilterCriteriaTotalCount = this.patrolFilterCriteriaTotalCount;

        this.dashboardPatrolService.setPatrolFilter(filter, value);
    }

    //current only call
    patrolCompleteUpdate() {
        let patrols: PatrolInstance[] = this.dashboardPatrolService.getPatrols();
        let patrolTemplates: PatrolTemplate[] = this.dashboardPatrolService.getPatrolTemplates();

        //Alarm Priority
        if (this.dashboardPatrolService.patrolFilterAlarmPrioritySelection > 0) {
            //an alarm priority filter is selected
            //check to see if we need to keep the selection or reset it
            let pAlarms: Alarm[] = this.dashboardPatrolService.getAllPatrolsAlarms(patrols);
            if (pAlarms.length > 0)
            {
                let critical: number = pAlarms.filter(a => a.Priority === 1).length;
                let high: number = pAlarms.filter(a => a.Priority === 2).length;
                let med: number = pAlarms.filter(a => a.Priority === 3).length;
                let low: number = pAlarms.filter(a => a.Priority === 4).length;
                switch (this.dashboardPatrolService.patrolFilterAlarmPrioritySelection) {
                    case 1:
                        if (critical === 0) {
                            this.patrolFilterAlarmPriorityList = {};
                            this.patrolFilterAlarmPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
                            this.dashboardPatrolService.patrolFilterAlarmPrioritySelection = 0;
                            this.patrolFilterCriteriaAlarmPriorityCount = 0;
                        }
                        break;
                    case 2:
                        if (high === 0) {
                            this.patrolFilterAlarmPriorityList = {};
                            this.patrolFilterAlarmPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
                            this.dashboardPatrolService.patrolFilterAlarmPrioritySelection = 0;
                            this.patrolFilterCriteriaAlarmPriorityCount = 0;
                        }
                        break;
                    case 3:
                        if (med === 0) {
                            this.patrolFilterAlarmPriorityList = {};
                            this.patrolFilterAlarmPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
                            this.dashboardPatrolService.patrolFilterAlarmPrioritySelection = 0;
                            this.patrolFilterCriteriaAlarmPriorityCount = 0;
                        }
                        break;
                    case 4:
                        if (low === 0) {
                            this.patrolFilterAlarmPriorityList = {};
                            this.patrolFilterAlarmPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
                            this.dashboardPatrolService.patrolFilterAlarmPrioritySelection = 0;
                            this.patrolFilterCriteriaAlarmPriorityCount = 0;
                        }
                        break;
                    default:
                        break;
                }
            }
        }

        //Operator
        if (this.dashboardPatrolService.patrolFilterOperatorSelection !== 'All') {
            //an operator is selected
            //check to see if we need to keep the selection or reset it
            let opList: {} = this.getPatrolOperators(patrols, patrolTemplates);
            if (typeof (opList[this.dashboardPatrolService.patrolFilterOperatorSelection]) === "undefined")
            {
                this.patrolFilterOperatorList = opList;
                this.dashboardPatrolService.patrolFilterOperatorSelection = 'All';
                this.patrolFilterCriteriaOperatorCount = 0;
            }
        } else {
            this.patrolFilterOperatorList = this.getPatrolOperators(patrols, patrolTemplates);
        }

        //DisplayName
        if (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection !== 'All') {
            let dnList: {} = this.getPatrolDisplayNames(patrols, patrolTemplates);
            if (typeof (dnList[this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection]) === "undefined")
            {
                this.patrolFilterPatrolDisplayNameList = dnList;
                this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection = 'All';
                this.patrolFilterCriteriaPatrolDisplayNameCount = 0;
            }
        } else {
            this.patrolFilterPatrolDisplayNameList = this.getPatrolDisplayNames(patrols, patrolTemplates);
        }

        //Status
        if (this.dashboardPatrolService.patrolFilterStatusSelection < 4) {
            if (patrols.length === 0) {
                //check the patrol templates too
                let submittedPatrols: PatrolTemplate[] = patrolTemplates.filter(pt => pt.IsPatrolSubmitted === true);
                if (submittedPatrols.length === 0) {
                    this.patrolFilterStatusList = {};
                    this.patrolFilterStatusList = { All: 4, Successful: 0, Warning: 1, Incomplete: 2, Critical: 3 };
                    this.dashboardPatrolService.patrolFilterStatusSelection = 4;
                    this.patrolFilterCriteriaStatusCount = 0;
                }
            }
        } else {
            this.patrolFilterStatusList = { All: 4, Successful: 0, Warning: 1, Incomplete: 2, Critical: 3 };
        }

        //Robot
        if (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection !== 'All') {
            let rList: {} = this.getPatrolRobots(patrols, patrolTemplates);
            if (typeof (rList[this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection]) === "undefined") {
                this.patrolFilterRobotList = rList;
                this.dashboardPatrolService.patrolFilterRobotSelection = 'All';
                this.patrolFilterCriteriaRobotCount = 0;
            }
        } else {
            //still make sure to reset the list to the current data
            this.patrolFilterRobotList = this.getPatrolRobots(patrols, patrolTemplates);
        }

        //update Patrol Filter Criteria Text
        if (this.dashboardPatrolService.patrolFilterAlarmPrioritySelection > 0)
            this.patrolFilterCriteriaAlarmPriorityCount = 1;
        else
            this.patrolFilterCriteriaAlarmPriorityCount = 0;

        if (this.dashboardPatrolService.patrolFilterOperatorSelection != 'All')
            this.patrolFilterCriteriaOperatorCount = 1;
        else
            this.patrolFilterCriteriaOperatorCount = 0;

        if (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection != 'All')
            this.patrolFilterCriteriaPatrolDisplayNameCount = 1;
        else
            this.patrolFilterCriteriaPatrolDisplayNameCount = 0;

        if (this.dashboardPatrolService.patrolFilterStatusSelection <= 4)
            this.patrolFilterCriteriaStatusCount = 1;
        else
            this.patrolFilterCriteriaStatusCount = 0;

        if (this.dashboardPatrolService.patrolFilterRobotSelection != 'All')
            this.patrolFilterCriteriaRobotCount = 1;
        else
            this.patrolFilterCriteriaRobotCount = 0;

        this.patrolFilterCriteriaTotalCount = this.patrolFilterCriteriaAlarmPriorityCount + this.patrolFilterCriteriaOperatorCount + this.patrolFilterCriteriaPatrolDisplayNameCount + this.patrolFilterCriteriaStatusCount + this.patrolFilterCriteriaRobotCount;
        if (this.patrolFilterCriteriaTotalCount > 1) {
            this.patrolFilterCriteriaText = "(" + this.patrolFilterCriteriaTotalCount.toString() + ") Filters Enabled";
        }
        else if (this.patrolFilterCriteriaTotalCount === 1) {
            this.patrolFilterCriteriaText = "(" + this.patrolFilterCriteriaTotalCount.toString() + ") Filter Enabled";
        }
        else
            this.patrolFilterCriteriaText = null;
        this.dashboardPatrolService.patrolFilterCriteriaTotalCount = this.patrolFilterCriteriaTotalCount;
    }

    loadPatrolRobotData(): void {
        let patrols: PatrolInstance[] = this.dashboardPatrolService.getPatrols();
        let patrolTemplates: PatrolTemplate[] = this.dashboardPatrolService.getPatrolTemplates();
        if (patrols.length > 0) {
            this.patrolFilterRobotList = this.getPatrolRobots(patrols, patrolTemplates);
        }
    }

    //current Patrols Only
    patrolDataUpdated() {
        //let patrols: PatrolInstance[] = this.dashboardPatrolService.getPatrols();
        //let patrolTemplates: PatrolTemplate[] = this.dashboardPatrolService.getPatrolTemplates();
        //this.patrolFilterOperatorList = this.getPatrolOperators(patrols, patrolTemplates);
        //this.patrolFilterPatrolDisplayNameList = this.getPatrolDisplayNames(patrols, patrolTemplates);
        //this.patrolFilterRobotList = this.getPatrolRobots(patrols, patrolTemplates);

        let patrols: PatrolInstance[] = this.dashboardPatrolService.getPatrols();
        let patrolTemplates: PatrolTemplate[] = this.dashboardPatrolService.getPatrolTemplates();

        //Operator
        if (this.dashboardPatrolService.patrolFilterOperatorSelection !== 'All') {
            //an operator is selected
            //check to see if we need to keep the selection or reset it
            let opList: {} = this.getPatrolOperators(patrols, patrolTemplates);
            if (typeof (opList[this.dashboardPatrolService.patrolFilterOperatorSelection]) === "undefined") {
                this.patrolFilterOperatorList = opList;
                this.dashboardPatrolService.patrolFilterOperatorSelection = 'All';
                this.patrolFilterCriteriaOperatorCount = 0;
            } else {
                //TODO - add single item to dropdown
            }
        } else {
            this.patrolFilterOperatorList = this.getPatrolOperators(patrols, patrolTemplates);
        }

        //DisplayName
        if (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection !== 'All') {
            let dnList: {} = this.getPatrolDisplayNames(patrols, patrolTemplates);
            if (typeof (dnList[this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection]) === "undefined") {
                this.patrolFilterPatrolDisplayNameList = dnList;
                this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection = 'All';
                this.patrolFilterCriteriaPatrolDisplayNameCount = 0;
            }
        } else {
            this.patrolFilterPatrolDisplayNameList = this.getPatrolDisplayNames(patrols, patrolTemplates);
        }

        //Robot
        if (this.dashboardPatrolService.patrolFilterRobotSelection !== 'All') {
            let rList: {} = this.getPatrolRobots(patrols, patrolTemplates);
            if (typeof (rList[this.dashboardPatrolService.patrolFilterRobotSelection]) === "undefined") {
                this.patrolFilterRobotList = rList;
                this.dashboardPatrolService.patrolFilterRobotSelection = 'All';
                this.patrolFilterCriteriaRobotCount = 0;
            }
        } else {
            this.patrolFilterRobotList = this.getPatrolRobots(patrols, patrolTemplates);
        }

        //update Patrol Filter Criteria Text
        if (this.dashboardPatrolService.patrolFilterAlarmPrioritySelection > 0)
            this.patrolFilterCriteriaAlarmPriorityCount = 1;
        else
            this.patrolFilterCriteriaAlarmPriorityCount = 0;

        if (this.dashboardPatrolService.patrolFilterOperatorSelection != 'All')
            this.patrolFilterCriteriaOperatorCount = 1;
        else
            this.patrolFilterCriteriaOperatorCount = 0;

        if (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection != 'All')
            this.patrolFilterCriteriaPatrolDisplayNameCount = 1;
        else
            this.patrolFilterCriteriaPatrolDisplayNameCount = 0;

        if (this.dashboardPatrolService.patrolFilterStatusSelection < 4)
            this.patrolFilterCriteriaStatusCount = 1;
        else
            this.patrolFilterCriteriaStatusCount = 0;

        if (this.dashboardPatrolService.patrolFilterRobotSelection != 'All')
            this.patrolFilterCriteriaRobotCount = 1;
        else
            this.patrolFilterCriteriaRobotCount = 0;

        this.patrolFilterCriteriaTotalCount = this.patrolFilterCriteriaAlarmPriorityCount + this.patrolFilterCriteriaOperatorCount + this.patrolFilterCriteriaPatrolDisplayNameCount + this.patrolFilterCriteriaStatusCount + this.patrolFilterCriteriaRobotCount;
        if (this.patrolFilterCriteriaTotalCount > 1) {
            this.patrolFilterCriteriaText = "(" + this.patrolFilterCriteriaTotalCount.toString() + ") Filters Enabled";
        }
        else if (this.patrolFilterCriteriaTotalCount === 1) {
            this.patrolFilterCriteriaText = "(" + this.patrolFilterCriteriaTotalCount.toString() + ") Filter Enabled";
        }
        else
            this.patrolFilterCriteriaText = null;
        this.dashboardPatrolService.patrolFilterCriteriaTotalCount = this.patrolFilterCriteriaTotalCount;

    }

    //timeframe patrol only
    patrolDataUpdatedForTimeframeChange() {
        this.patrolFilterCriteriaTotalCount = 0;
        this.dashboardPatrolService.patrolFilterCriteriaTotalCount = 0;
        this.patrolFilterCriteriaAlarmPriorityCount = 0;
        this.patrolFilterCriteriaOperatorCount = 0;
        this.patrolFilterCriteriaPatrolDisplayNameCount = 0;
        this.patrolFilterCriteriaStatusCount = 0;
        this.patrolFilterCriteriaRobotCount = 0;
        this.patrolFilterCriteriaText = null;

        this.patrolFilterAlarmPriorityList = {};
        this.patrolFilterAlarmPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };

        this.patrolFilterStatusList = {};
        this.patrolFilterStatusList = { All: 4, Successful: 0, Warning: 1, Incomplete: 2, Critical: 3 };

        let patrols: PatrolInstance[] = this.dashboardPatrolService.getPatrols();
        let patrolTemplates: PatrolTemplate[] = this.dashboardPatrolService.getPatrolTemplates();

        this.patrolFilterOperatorList = { All: 'All' };
        this.patrolFilterOperatorList = this.getPatrolOperators(patrols, patrolTemplates);

        this.patrolFilterPatrolDisplayNameList = { All: 'All' };
        this.patrolFilterPatrolDisplayNameList = this.getPatrolDisplayNames(patrols, patrolTemplates);

        this.patrolFilterRobotList = { All: 'All' };
        this.patrolFilterRobotList = this.getPatrolRobots(patrols, patrolTemplates);
    }

    removeSelectedPatrolFilters(event: any) {
        if (event)
            event.stopPropagation();

        this.dashboardPatrolService.clearPatrolFilters(true);
        this.patrolFilterCriteriaTotalCount = 0;
        this.dashboardPatrolService.patrolFilterCriteriaTotalCount = 0;
        this.patrolFilterCriteriaAlarmPriorityCount = 0;
        this.patrolFilterCriteriaOperatorCount = 0;
        this.patrolFilterCriteriaPatrolDisplayNameCount = 0;
        this.patrolFilterCriteriaStatusCount = 0;
        this.patrolFilterCriteriaRobotCount = 0;
        this.patrolFilterCriteriaText = null;

        this.patrolFilterAlarmPriorityList = {};
        this.patrolFilterAlarmPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
        this.patrolFilterStatusList = { All: 4, Successful: 0, Warning: 1, Incomplete: 2, Critical: 3 };

        let patrols: PatrolInstance[] = this.dashboardPatrolService.getPatrols();
        let patrolTemplates: PatrolTemplate[] = this.dashboardPatrolService.getPatrolTemplates();

        this.patrolFilterOperatorList = { All: 'All' };
        this.patrolFilterOperatorList = this.getPatrolOperators(patrols, patrolTemplates);

        this.patrolFilterPatrolDisplayNameList = { All: 'All' };
        this.patrolFilterPatrolDisplayNameList = this.getPatrolDisplayNames(patrols, patrolTemplates);

        this.patrolFilterRobotList = { All: 'All' };
        this.patrolFilterRobotList = this.getPatrolRobots(patrols, patrolTemplates);

    }

    private getPatrolOperators(patrols: PatrolInstance[], patrolTemplates: PatrolTemplate[]): {} {
        let patrolData: {} = { All: 'All' };

        //if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
        //    //NOTE: WE SHOULD ONLY HAVE 1 TEMPLATE RUNNING AT A TIME

        //    //get any patrol templates that have been submited
        //    let submittedPatrols: PatrolTemplate[] = patrolTemplates.filter(pt => pt.IsPatrolSubmitted === true);
        //    if (submittedPatrols.length > 0) {
        //        //make sure we do not already have the patrol instance for the submitted template
        //        for (let pt of submittedPatrols) {
        //            let match: PatrolInstance[] = patrols.filter(p => p.TemplateId === pt.TemplateId);
        //            if (match.length === 0) {
        //                //none of the current patrols are for the submitted patrol template
        //                if (typeof (patrolData[pt.UserName]) === "undefined")
        //                    patrolData[pt.UserName] = pt.UserName;
        //            }
        //        }
        //    }
        //}

        for (let patrol of patrols) {
            if (patrol.UserName) {
                if (typeof (patrolData[patrol.UserName]) === "undefined") {
                    patrolData[patrol.UserName] = patrol.UserName;
                }
            }
        }

        return patrolData;
    }

    private getPatrolDisplayNames(patrols: PatrolInstance[], patrolTemplates: PatrolTemplate[]): {} {
        let patrolData: {} = { All: 'All' };

        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            //NOTE: WE SHOULD ONLY HAVE 1 TEMPLATE RUNNING AT A TIME

            //get any patrol templates that have been submited
            let submittedPatrols: PatrolTemplate[] = patrolTemplates.filter(pt => pt.IsPatrolSubmitted === true);
            if (submittedPatrols.length > 0)
            {
                //make sure we do not already have the patrol instance for the submitted template
                for (let pt of submittedPatrols) {
                    let match: PatrolInstance[] = patrols.filter(p => p.TemplateId === pt.TemplateId);
                    if (match.length === 0) {
                        //none of the current patrols are for the submitted patrol template
                        //so get the templates display name
                        if (typeof (patrolData[pt.DisplayName]) === "undefined")
                            patrolData[pt.DisplayName] = pt.DisplayName;
                    }
                }
            }
        }

        for (let patrol of patrols) {
            if (patrol.DisplayName) {
                if (typeof (patrolData[patrol.DisplayName]) === "undefined") {
                    patrolData[patrol.DisplayName] = patrol.DisplayName;
                }
            }
        }
        return patrolData;
    }

    private getPatrolRobots(patrols: PatrolInstance[], patrolTemplates: PatrolTemplate[]): {} {
        let patrolData: {} = { All: 'All' };

        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            //NOTE: WE SHOULD ONLY HAVE 1 TEMPLATE RUNNING AT A TIME

            //get any patrol templates that have been submited
            let submittedPatrols: PatrolTemplate[] = patrolTemplates.filter(pt => pt.IsPatrolSubmitted === true);
            if (submittedPatrols.length > 0) {
                //make sure we do not already have the patrol instance for the submitted template
                for (let pt of submittedPatrols) {
                    if(pt.PlatformSubmittedId) {
                        let platform = this.dashboardPlatformService.getPlatform(pt.PlatformSubmittedId);
                        if (platform) {
                            if (typeof (patrolData[platform.id]) === "undefined") {
                                patrolData[platform.DisplayName] = platform.id;
                            }
                        }
                    }
                }
            }
        }

        for (let patrol of patrols) {
            if (patrol.PlatformId) {
                let platform = this.dashboardPlatformService.getPlatform(patrol.PlatformId);
                if (platform) {
                    if (typeof (patrolData[platform.id]) === "undefined") {
                        patrolData[platform.DisplayName] = platform.id;
                    }
                }
            }
        }
        return patrolData;
    }
}