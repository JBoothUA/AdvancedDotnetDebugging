import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs/Subject';

import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPatrolService } from './dashboard-patrol.service';
import { DashboardPlatformService } from './dashboard-platform.service';

import { FilterTimeframe, DashboardTabs } from './dashboard';
import { Alarm } from '../alarms/alarm.class';
import { Platform } from '../platforms/platform.class';

import { PatrolService } from '../patrols/patrol.service';
import { PatrolStatusValues, PatrolInstance, PatrolTemplate } from '../patrols/patrol.class';
import { PointStatusValues, PointInstance } from '../patrols/point.class';
import { ActionStatusValues, ActionInstance } from '../patrols/action.class';

@Component({
    selector: 'dashboard-header',
    templateUrl: 'dashboard-header.component.html',
    styleUrls: ['dashboard-header.component.css', 'dashboard.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class DashboardHeader {
    filterTimeframe: typeof FilterTimeframe = FilterTimeframe;
    dashboardTab: typeof DashboardTabs = DashboardTabs;
    isLoaded: boolean = true;
    alarms: Alarm[] = [];
    patrolInstances: PatrolInstance[] = [];
    patrolTemplates: PatrolTemplate[] = [];
    platforms: Platform[] = [];

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    //tab data
    tabTimeFrame: string = '';
    tabSortField: string = '';

    //alarm data
    highestAlarmPriority: string = '';
    alarmCount: number = 0;
    alarmCriticalPriorityCount: number = 0;
    alarmHighPriorityCount: number = 0;
    alarmMediumPriorityCount: number = 0;
    alarmLowPriorityCount: number = 0;
    alarmHeaderFilteredCriteria: string = '';

    //patrol data
    highestPatrolStatus: string = '';
    patrolTabHeader: string = '';
    patrolHeaderFilteredCriteria: string = '';

    patrolCount: number = 0;
    patrolCriticalCount: number = 0;
    patrolIncompleteCount: number = 0;
    patrolWarningCount: number = 0;
    patrolSuccessfulCount: number = 0;

    patrolCriticalIDs: string[] = [];
    patrolIncompleteIDs: string[] = [];
    patrolWarningIDs: string[] = [];
    patrolSuccessfulIDs: string[] = [];
    patrolSubmittedTemplateIDs: string[] = [];

    //robot data
    highestPlatformStatus: string = '';
    robotTabHeader: string = '';
    robotCount: number = 0;
    robotFailedCount: number = 0;
    robotErrorCount: number = 0;
    robotHealthyCount: number = 0;
    robotDisabledCount: number = 0;

    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    constructor(private dashboardService: DashboardService,
        private dashboardAlarmService: DashboardAlarmService,
        private dashboardPatrolService: DashboardPatrolService,
        private dashboardPlatformService: DashboardPlatformService,
        private sanitizer: DomSanitizer,
        private changeDetectorRef: ChangeDetectorRef) {

        //location changed
        this.dashboardService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleLocationsChanged()
        });

        //tab change
        this.dashboardService.onDashboardTabChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleTabChanged()
            });

        //filter panel criteria changed
        this.dashboardAlarmService.filterCriteriaChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updateAlarmData()
            });

        this.dashboardPatrolService.onFilterCriteriaChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updatePatrolData()
            });

        //timeframe changed
        this.dashboardService.onTimeframeChange
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleTimeFrameChanged()
            });

        this.dashboardPatrolService.onUpdatePatrolData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updatePatrolData()
            });

        this.dashboardAlarmService.updateAlarmData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updateAlarmData()
            });

        //for alarm Data
        this.dashboardAlarmService.onAlarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updateAlarmData()
            });

        this.dashboardAlarmService.onNewAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updateAlarmData()
            });

        this.dashboardAlarmService.onEditAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updateAlarmData()
            });

        this.dashboardAlarmService.onRemoveAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updateAlarmData()
            });

        //for patrol instance data
        this.dashboardPatrolService.onPatrolsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updatePatrolData()
            });

        this.dashboardPatrolService.onNewPatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updatePatrolData()
            });

        this.dashboardPatrolService.onUpdatePatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updatePatrolData()
        });

        this.dashboardPatrolService.onCompletededPatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updatePatrolData()
            });

        //for patrol template data
        this.dashboardPatrolService.onPatrolTemplatesLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updatePatrolData()
            });

        this.dashboardPatrolService.onUpdatePatrolTemplate
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updatePatrolData()
            });

        this.dashboardPatrolService.onPatrolTemplateDeleted
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updatePatrolData()
            });

        //for robots and drones data
        this.dashboardPlatformService.onPlatformsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updatePlatformData()
            });

        this.dashboardPlatformService.updatePlatformlData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updatePlatformData()
            });

        //TSR* 
        this.handleTabChanged();

        if (this.dashboardService.alarmDataLoaded)
            this.updateAlarmData();
        if (this.dashboardService.patrolDataLoaded)
            this.updatePatrolData();
        if (this.dashboardService.platformDataLoaded)
            this.updatePlatformData();
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    ///////////////////////////////////////////
    //Notification Methods
    ///////////////////////////////////////////
    handleLocationsChanged(): void {
        this.getLocationHeader();
    }

    handleTimeFrameChanged(): void {
        this.getTabHeader();
    }

    handleTabChanged() {
        if (this.dashboardService.getSelectedDashboardTab() === DashboardTabs.Alarms)
            this.tabSortField = 'by Reported Time';

        if (this.dashboardService.getSelectedDashboardTab() === DashboardTabs.Patrols)
            this.tabSortField = 'by Submitted Time';

        if (this.dashboardService.getSelectedDashboardTab() === DashboardTabs.Robots)
            this.tabSortField = '';
    }

    updateAlarmData(): void {
        this.alarms = this.dashboardAlarmService.getAlarms();
        //this.getTabHeader();
        this.setAlarmResultsHeaderFilteredCountField();
        this.getAlarmCritical();
        this.getAlarmHigh();
        this.getAlarmMedium();
        this.getAlarmLow();
        this.getAlarmCount();
        this.getHighestAlarmPriority();
        this.changeDetectorRef.markForCheck();
    }

    updatePatrolData(): void {
        this.patrolInstances = this.dashboardPatrolService.getPatrols();
        this.patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();

        this.setPatrolResultsHeaderFilteredCountField();

        //methods must be called in order (critical, failed, warning, successful)
        this.getPatrolsCriticalCount();
        this.getPatrolsIncompleteCount();
        this.getPatrolsWarningCount();
        this.getPatrolsSuccessfulCount();
        this.getPatrolsCount();
        this.getHighestPatrolStatus();
        this.changeDetectorRef.markForCheck();
    }

    updatePlatformData(): void {
        this.platforms = this.dashboardPlatformService.getPlatforms();
        this.getPlatformFailedCount();
        this.getPlatformErrorCount();
        this.getPlatformHealthyCount();
        this.getPlatformDisabledCount();
        this.getPlatformCount();
        this.highestPlatformStatus = this.getHighestPlatformStatus();
        this.changeDetectorRef.markForCheck();
    }

    //////////////////////////////////////////////
    //Header Methods
    //////////////////////////////////////////////
    getLocationHeader(): string {
        let locationHeader: string = "";

        if (this.dashboardService.getAllTenantLocations()) {
            let parent: boolean = true;

            let totalCustCount: number = 0;
            let totalSelCount: number = 0;
            let customers = this.dashboardService.getAllTenantLocations();

            for (let cust of customers) {
                totalCustCount = totalCustCount + cust.Locations.length;
                let selectedLoc = (cust.Locations.filter(c => c.Selected === true).length);
                totalSelCount = totalSelCount + selectedLoc;
            }

            parent = (customers.filter(p => p.Selected === false)).length > 0 ? false : true;
            if (parent) {
                //all high level customers are selected
                locationHeader = "All Locations (" + totalCustCount + ") ";
            }
            else {
                locationHeader = "Locations (" + totalSelCount + ") ";
            }
        }
        return locationHeader;
    }

    getTabHeader() {
        this.tabTimeFrame = "";
        let timeframe: FilterTimeframe = this.dashboardService.getSelectedTimeframe();

        switch (timeframe) {
            case FilterTimeframe.Current:
                this.tabTimeFrame = "";
                break;
            case FilterTimeframe.EightHours:
                this.tabTimeFrame = "Last 8 Hours";
                break;
            case FilterTimeframe.TwelveHours:
                this.tabTimeFrame = "Last 12 Hours";
                break;
            case FilterTimeframe.TwentyFourHours:
                this.tabTimeFrame = "Last 24 Hours";
                break;
            case FilterTimeframe.LastWeek:
                this.tabTimeFrame = "Last Week";
                break;
            case FilterTimeframe.Custom:
                this.tabTimeFrame = "Custom Timeframe";
                break;
            default:
                this.tabTimeFrame = "";
                break;
        }
    }

    setAlarmResultsHeaderFilteredCountField(): void {
        if (((this.dashboardAlarmService.alarmFilterPrioritySelection) && (this.dashboardAlarmService.alarmFilterPrioritySelection !== 0)) ||
            ((this.dashboardAlarmService.alarmFilterOperatorSelection) && (this.dashboardAlarmService.alarmFilterOperatorSelection !== 'All')) ||
            ((this.dashboardAlarmService.alarmFilterDescriptionSelection) && (this.dashboardAlarmService.alarmFilterDescriptionSelection !== 'All')) ||
            ((this.dashboardAlarmService.alarmFilterStateSelection) && (this.dashboardAlarmService.alarmFilterStateSelection !== 0)) ||
            ((this.dashboardAlarmService.alarmFilterRobotSelection) && (this.dashboardAlarmService.alarmFilterRobotSelection !== 'All'))) {
            let count: number = this.alarms.length;
            this.alarmHeaderFilteredCriteria = count.toString();
        }
        else
            this.alarmHeaderFilteredCriteria = "";
    }

    setPatrolResultsHeaderFilteredCountField(): void {
        if ((this.dashboardPatrolService.patrolFilterAlarmPrioritySelection !== 0) ||
            ((this.dashboardPatrolService.patrolFilterOperatorSelection) && (this.dashboardPatrolService.patrolFilterOperatorSelection !== 'All')) ||
            ((this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection) && (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection !== 'All')) ||
            (this.dashboardPatrolService.patrolFilterStatusSelection !== 4) ||
            ((this.dashboardPatrolService.patrolFilterRobotSelection) && (this.dashboardPatrolService.patrolFilterRobotSelection !== 'All'))) {
            let count: number = this.patrolInstances.length; //templates???
            this.patrolHeaderFilteredCriteria = count.toString();
        }
        else
            this.patrolHeaderFilteredCriteria = "";
    }

    setDashboardTab(tab: DashboardTabs): void {
        if (this.dashboardService.getSelectedDashboardTab() === tab)
            return;
        this.dashboardService.setSelectedDashboardTab(tab);
        this.changeDetectorRef.markForCheck();
    }

    showAlarmFilterCriteria(): void {
        this.dashboardService.showAlarmFilterCriteriaComponent();
    }

    showPatrolFilterCriteria(): void {
        this.dashboardService.showPatrolFilterCriteriaComponent();
    }

    removeSelectedAlarmFilters(): void {
        this.dashboardService.removeSelectedAlarmFilterCriteria();
    }

    removeSelectedPatrolFilters(): void {
        this.dashboardService.removeSelectedPatrolFilterCriteria();
    }

    //////////////////////////////////////////////
    //Alarm Methods
    //////////////////////////////////////////////
    //Critical
    getAlarmCritical() {
        this.alarmCriticalPriorityCount = this.alarms.filter(a => a.Priority === 1).length;
    }

    //High
    getAlarmHigh() {
        this.alarmHighPriorityCount = this.alarms.filter(a => a.Priority === 2).length;
    }

    //Medium
    getAlarmMedium() {
        this.alarmMediumPriorityCount = this.alarms.filter(a => a.Priority === 3).length;
    }

    //Low
    getAlarmLow() {
        this.alarmLowPriorityCount = this.alarms.filter(a => a.Priority === 4).length;
    }

    //Total
    getAlarmCount() {
        this.alarmCount = this.alarms.length;
    }

    //Highest Priority
    getHighestAlarmPriority() {
        let hPriority: number = 0;
        if (this.alarms && this.alarms.length > 0) {
            if (this.alarms.filter(a => a.Priority === 1).length > 0)
                hPriority = 1;
            else if ((this.alarms.filter(a => a.Priority === 2).length > 0) && (hPriority == 0))
                hPriority = 2;
            else if ((this.alarms.filter(a => a.Priority === 3).length > 0) && (hPriority == 0))
                hPriority = 3;
            else if ((this.alarms.filter(a => a.Priority === 4).length > 0) && (hPriority == 0))
                hPriority = 4;
            else if (hPriority == 0)
                hPriority = 5;  
        }
        else {
            hPriority = 5; //5 means that there are no alarms in the system
        }

        this.highestAlarmPriority = hPriority.toString(); 
    }

    //////////////////////////////////////////////
    //Patrol Methods
    //////////////////////////////////////////////

    //Red - Critical
    getPatrolsCriticalCount() {
        this.patrolCriticalIDs = [];
        this.patrolCriticalCount = 0;
        let criticalPIs: PatrolInstance[] = this.patrolInstances.filter(p => (p.CurrentStatus === PatrolStatusValues.Failed) || (p.CurrentStatus === PatrolStatusValues.FailedMostCheckpoints));
        if ((criticalPIs != null) && (criticalPIs.length > 0)) {
            this.patrolCriticalIDs.concat(criticalPIs.map(function (x) { return x.InstanceId; }));
            this.patrolCriticalCount = criticalPIs.length;
        }
    }  

    //Orange - Incomplete (checkpoints failed)
    getPatrolsIncompleteCount() {
        this.patrolIncompleteCount = 0;
        this.patrolIncompleteIDs = [];
        let failedPIs: PatrolInstance[] = this.patrolInstances.filter(p => p.CurrentStatus === PatrolStatusValues.FailedCheckpoints);
        if ((failedPIs != null) && (failedPIs.length > 0)) {
            this.patrolIncompleteIDs.concat(failedPIs.map(function (x) { return x.InstanceId; }));
            this.patrolIncompleteCount = failedPIs.length;
        }
    }

    //Amber - Aborted, Points Not Reached
    getPatrolsWarningCount() {
        this.patrolWarningCount = 0;
        let totalCount: number = 0;
        let pointNotReachedCount: number = 0;
        let pointCount: number = 0;
        let actionCount: number = 0;

        this.patrolWarningIDs = [];

        //check the patrols to see if any were aborted
        let pAborted: PatrolInstance[] = this.patrolInstances.filter(p => p.CurrentStatus === PatrolStatusValues.Aborted);
        if ((pAborted != null) && (pAborted.length > 0)) {
            this.patrolWarningIDs = this.patrolWarningIDs.concat(pAborted.map(function (x) { return x.InstanceId; }));
        }

        //check to see if any high level patrol statues are point not reached
        let pNotReached: PatrolInstance[] = this.patrolInstances.filter(p => p.CurrentStatus === PatrolStatusValues.PointsNotReached);
        if ((pNotReached != null) && (pNotReached.length > 0)) {
            this.patrolWarningIDs = this.patrolWarningIDs.concat(pNotReached.map(function (x) { return x.InstanceId; }));
        }

        //the patrol may be still running:
        for (let pi of this.patrolInstances)
        {
            let ptReached = pi.Points.filter(pt => (pt.CurrentStatus === PointStatusValues.Reached) &&
                                                   (pi.CurrentStatus !== PatrolStatusValues.FailedMostCheckpoints) &&
                                                   (pi.CurrentStatus !== PatrolStatusValues.FailedCheckpoints));

            if (ptReached.length > 0)
            {
                for (let pti of ptReached) {
                    let actionFailed = pti.Actions.filter(a => (a.CurrentStatus === ActionStatusValues.Failed) || (a.CurrentStatus === ActionStatusValues.Unsupported));
                    if (actionFailed.length > 0) {
                        if (this.patrolWarningIDs.indexOf(pi.InstanceId) === -1)
                            this.patrolWarningIDs.push(pi.InstanceId)
                    }

                    //if the patrol is a running patrol:
                    //if a point has actions (i.e. its a checkpoint) and its status is 2 (reached) 
                    //but 1 or more of the points actions statuses is 1 (started) or 0 (unknown), then 
                    //get the checkpoints ordinal number and check to see if the next point after this one has a status or 1 (in transit) or 2(reached)
                    //if it does, then it means that this current point with actions (i.e. checkpoint) has failed
                    //return a status of 3 (failed) (Note!!! - this should role up to a patrol status of 6 once the patrol is completed)
                    let actionIncomplete = pti.Actions.filter(a => (a.CurrentStatus === ActionStatusValues.Started) || (a.CurrentStatus === ActionStatusValues.Unknown));
                    if (actionIncomplete.length > 0) {
                        let nextPointOrdinal: PointInstance[] = ptReached.filter(o => o.Ordinal === (pti.Ordinal + 1));
                        if (nextPointOrdinal.length > 0) {
                            if (nextPointOrdinal[0].CurrentStatus > PointStatusValues.Unknown) {
                                if (this.patrolWarningIDs.indexOf(pi.InstanceId) === -1)
                                    this.patrolWarningIDs.push(pi.InstanceId);
                            }
                        }
                    }
                    ///

                }
            }

            //point not reached
            let ptNotReached = pi.Points.filter(pt => (pt.CurrentStatus === PointStatusValues.NotReached) &&
                                                      (pi.CurrentStatus !== PatrolStatusValues.FailedMostCheckpoints) &&
                                                      (pi.CurrentStatus !== PatrolStatusValues.FailedCheckpoints));

            if (ptNotReached.length > 0)
            {
                if (this.patrolWarningIDs.indexOf(pi.InstanceId) === -1)
                    this.patrolWarningIDs.push(pi.InstanceId);
            }
        }

        this.patrolWarningCount = this.patrolWarningIDs.length;
    }

    //Green - Successful
    getPatrolsSuccessfulCount() {
        this.patrolSuccessfulIDs = [];
        this.patrolSuccessfulCount = 0;
        let patrolInstanceCount: number = 0;
        this.patrolSubmittedTemplateIDs = [];

        let activePatrolTemplateIDs: string[] = this.patrolInstances.map(function (x) { return x.TemplateId; });

        let patrolInstanceSuccessful: PatrolInstance[] = [];
        let patrolInstanceSucc: PatrolInstance[] = this.patrolInstances.filter(p => (
            (p.CurrentStatus === PatrolStatusValues.Completed) ||
            (p.CurrentStatus === PatrolStatusValues.Paused) ||
            (p.CurrentStatus === PatrolStatusValues.Resumed) ||
            (p.CurrentStatus === PatrolStatusValues.Started)));

            //&&
            //(!this.patrolWarningIDs.includes(p.InstanceId)) && 
            //(this.patrolFailIDs.indexOf(p.InstanceId) === -1) ));

        for (let pis of patrolInstanceSucc) {
            if ((!this.patrolWarningIDs.includes(pis.InstanceId)) &&
                (!this.patrolIncompleteIDs.includes(pis.InstanceId)))
            {
                patrolInstanceSuccessful.push(pis);
            }
        }

        if ((patrolInstanceSuccessful != null) && (patrolInstanceSuccessful.length > 0)) {
            this.patrolSuccessfulIDs = this.patrolSuccessfulIDs.concat(patrolInstanceSuccessful.map(function (x) { return x.InstanceId; }));
            this.patrolSubmittedTemplateIDs = this.patrolSubmittedTemplateIDs.concat(patrolInstanceSuccessful.map(function (x) { return x.TemplateId; }));
            patrolInstanceCount = patrolInstanceSuccessful.length;
        }

        let patrolTemplateSubmitted = this.patrolTemplates.filter(pt => pt.IsPatrolSubmitted === true );

        let patrolTemplateCount: number = 0;
        for (let pts of patrolTemplateSubmitted)
        {
            if ((this.patrolSubmittedTemplateIDs.indexOf(pts.TemplateId) === -1) && (activePatrolTemplateIDs.indexOf(pts.TemplateId) === -1))
                patrolTemplateCount++;
        }
        this.patrolSuccessfulCount = patrolInstanceCount + patrolTemplateCount;
    }

    //Total 
    getPatrolsCount() {
        this.patrolCount = 0;
        this.patrolCount = this.patrolCriticalCount + this.patrolIncompleteCount + this.patrolWarningCount + this.patrolSuccessfulCount;
    }

    //Highest Priority
    getHighestPatrolStatus() {
        this.highestPatrolStatus = '';
        if (this.patrolInstances && this.patrolInstances.length > 0) {
            if (this.patrolCriticalCount > 0)
                this.highestPatrolStatus = 'failed';
            else if (this.patrolIncompleteCount > 0)
                this.highestPatrolStatus = 'error';
            else if (this.patrolWarningCount > 0)
                this.highestPatrolStatus = 'warning';
            else if (this.patrolSuccessfulCount > 0)
                this.highestPatrolStatus = 'healthy';
            else
                this.highestPatrolStatus = 'healthy';
        }
        else {
            this.highestPatrolStatus = 'healthy';
        }
    }

    //////////////////////////////////////////////
    //Platform Methods
    //////////////////////////////////////////////

    //Red - Failed
    getPlatformFailedCount() {
        this.robotFailedCount = this.platforms.filter(p => (
            this.dashboardPlatformService.getPlatformStatusClass(p) === 'platform-failed'
        )).length; 
    }

    //Amber - Error
    getPlatformErrorCount() {
        this.robotErrorCount = this.platforms.filter(p => (
            this.dashboardPlatformService.getPlatformStatusClass(p) === 'platform-error'
        )).length; 
    }

    //Green - Healthy
    getPlatformHealthyCount() {
        this.robotHealthyCount = this.platforms.filter(p => (
            this.dashboardPlatformService.getPlatformStatusClass(p) === 'platform-healthy'
        )).length; 
    }

    //Gray - Disabled
    getPlatformDisabledCount() {
        this.robotDisabledCount = this.platforms.filter(p => (
            this.dashboardPlatformService.getPlatformStatusClass(p) === 'platform-disabled'
        )).length; 
    }

    //Total
    getPlatformCount() {
        this.robotCount = this.platforms.length;
    }

    //Highest Priority
    getHighestPlatformStatus(): string {
        let hPriority: string = '';
        if (this.platforms && this.platforms.length > 0) {
            if (this.robotFailedCount > 0)
                hPriority = 'failed';
            else if (this.robotErrorCount > 0)
                hPriority = 'error';
            else if (this.robotHealthyCount > 0)
                hPriority = 'healthy';
            else if (this.robotDisabledCount > 0)
                hPriority = 'disabled';
            else
                hPriority = 'disabled';
        }
        else {
            hPriority = 'disabled';
        }
        return hPriority;
    }

    ///////////////////////////////////////////
    //Timeframe Methods
    ///////////////////////////////////////////
    getSelectedTimeframe(): FilterTimeframe {
        return this.dashboardService.getSelectedTimeframe();
    }
}