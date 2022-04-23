import {
    Component, OnInit, Input, ViewChild, ElementRef, NgZone, trigger, state, transition,
    style, animate, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';
import { BaseChartDirective } from 'ng2-charts';

import {
    FilterTimeframe, PatrolStatusData, PatrolStatus, SliderType,
    RobotAndDrone, PatrolStatusObj, PatrolAlarmPriorityCount
} from './dashboard';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpService } from '../shared/http.service';

import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { DashboardPatrolService } from './dashboard-patrol.service';
import { DashboardSlider } from './dashboard-slider.component';

import { Alarm } from '../alarms/alarm.class';
import {
    PatrolInstance, PatrolStatusValues, PatrolTemplate,
    isPatrolTemplate, isPatrolInstance
} from '../patrols/patrol.class';
import { PointInstance } from '../patrols/point.class';
import { ActionInstance } from '../patrols/action.class';
//import { PatrolProgressbar } from '../patrols/patrol-progressbar.component';
import { PatrolStatusPipe } from './patrol-status.pipe';
import { PatrolRobotDronePipe } from './patrol-robotdrone.pipe';
import { PatrolAlarmPriorityPipe } from './patrol-alarmpriority.pipe';

enum ResultsSize {
    //Small = 774, //add 10 for scroll and 5 buffer
    //Large = 934, //add 10 for scroll and 5 buffer
    //None = 0
    Small = 750,
    Medium = 910,
    Large = 1010,
    None = 0
}

@Component({
    selector: 'dashboard-patrol',
    templateUrl: 'dashboard-patrol.component.html',
    styleUrls: ['dashboard-patrol.component.css', 'dashboard.component.css'],
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
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class DashboardPatrol implements OnInit {
    //Class Variables
    private resultsContainerDivSize: number = 750;
    private expandedResult: Map<number, string> = new Map<number, string>();
	private expandedPatrolID: string = null;

	headerActiveField: string = '';

    //patrol props
    //patrols: PatrolInstance[] = [];
    masterPatrols: PatrolInstance[] = [];
    patrolTemplates: PatrolTemplate[] = [];
    historicalPatrols: PatrolInstance[] = [];
    patrolToAlarmsMap: Map<string, Alarm[]> = new Map<string, Alarm[]>();

    //patrol by status stacked bar chart props
    patrolStatusChartDataArray: number[] = [];
    patrolStatusChartData: PatrolStatusData = null; //this object is used for Patrol Status Filter as well
    patrolStatusEnum: typeof PatrolStatus = PatrolStatus;
    patrolStatusChartTotal: number = 0;
    patrolStatusChartIndexStart: number = -1;
    patrolStatusChartIndexEnd: number = -1;

    patrolStatusChartLegendData: {}[];
    showPatrolStatusLegendData: Map<number, string> = new Map<number, string>();
    patrolStatusChartSelectedDataValue: number = -1;
    patrolStatusChartSelectedLegendItemID: string = '-1';

    //Robot and Drones on Patrols Slider
    sliderTypeEnum: typeof SliderType = SliderType;

    //Alarms on Patrol chart props
    patrolAlarmsChartData: number[];
    patrolAlarmsChartLabels: string[] = [];
    patrolAlarmsChartTotal: number = 0;
    patrolAlarmsChartColors: any[] = [{ backgroundColor: ["#D62329", "#DB7828", "#F3B518", "#27BBA1"] }];
    patrolAlarmsChartColorsDefault: any[] = [{ backgroundColor: ["#D62329", "#DB7828", "#F3B518", "#27BBA1"] }];
    patrolAlarmsChartColorsOpacity: any[] = [{
        backgroundColor: ["rgba(214,35,41,0.3)", "rgba(219,120,40,0.3)",
                        "rgba(243,181,24,0.3)", "rgba(39,187,161,0.3)"]
    }];
    patrolAlarmsChartType: string = 'doughnut';
    patrolAlarmsChartOptions: any = {
        legendCallback: this.getPatrolAlarmsLegendCallback,
        cutoutPercentage: 70,
        elements: { arc: { borderWidth: 0 } },
        tooltips: {
            callbacks: {
                label: function (tooltipItem: any, data: any) {
                    //get the concerned dataset
                    let dataset = data.datasets[tooltipItem.datasetIndex];
                    let currentValue = dataset.data[tooltipItem.index];
                    return currentValue;
                }
            },
            displayColors: false,
            position: 'nearest',
            mode: 'point',
            enabled: false
        }
    };
    patrolAlarmsChartLegendData: {}[];
    showPatrolAlarmsLegendData: Map<number, string> = new Map<number, string>();
    patrolAlarmsChartSelectedDataValue: number = -1;
    patrolAlarmsChartSelectedLegendItemID: string = '-1';

    //export props
    exporting: boolean = false;

    //results header props
    headerFilteredCriteriaField: string = '';
    headerAllPatrolStatusCriteriaField: string = '';
    headerActiveCriteriaField: string = '';
    headerTimeframeCriteriaField: string = '';
    headerRobotDroneCriteriaField: string = '';
    headerAlarmPriorityCriteriaField: string = '';

    //search props
    patrolPlaceHolderSearch: string = "Search Patrols";

    //patrol results props
    patrolInstanceMap: Map<string, PatrolInstance> = new Map<string, PatrolInstance>();
    filteredPatrolInstanceMap: Map<string, PatrolInstance> = new Map<string, PatrolInstance>();
    moreOperatorExpanded: boolean = false;
    showAlarmResultsColumn: boolean = true;
    showRobotDroneResultsColumn: boolean = true;
    showSubmittedTimeResultsColumn: boolean = true;
    patrolStatusValuesEnum: typeof PatrolStatusValues = PatrolStatusValues;
    filterTimeframe: typeof FilterTimeframe = FilterTimeframe;
    currentScroll: number = 0;

    //quick filter - local page filters
    patrolRobotDroneFilter: RobotAndDrone = null;
    patrolAlarmPriorityFilter: number = 0;
    patrolResultCount: number = 0;

    //ViewChilds
    @ViewChild('dbRobotDronePatrolSlider') dashboardRobotDronePatrolSlider: DashboardSlider;
    @ViewChild(BaseChartDirective) chartComponent: BaseChartDirective;
    @ViewChild('patrolAlarmsChart') patrolAlarmsChartComponents: BaseChartDirective;
    @ViewChild('patrolStatusChart') patrolStatusChartComponents: BaseChartDirective;
    @ViewChild('patrolReportResultsDiv') patrolResultsDiv: ElementRef;
    @ViewChild('patrolReportResultsContentDiv') patrolResultsContentDiv: ElementRef;
    @ViewChild('patrolReportResultsContainer') patrolResultsContainer: ElementRef;
    @ViewChild('patrolReportResults') patrolReportResults: ElementRef;

    //Inputs
    @Input() searchterm: any;

    //Subjects
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    ////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    constructor(private dashboardService: DashboardService,
                private dashboardAlarmService: DashboardAlarmService,
                private dashboardPlatformService: DashboardPlatformService,
                public dashboardPatrolService: DashboardPatrolService,
                protected httpService: HttpService,
                private patrolStatusPipe: PatrolStatusPipe,
                private patrolRobotDronePipe: PatrolRobotDronePipe,
                private patrolAlarmPriorityPipe: PatrolAlarmPriorityPipe,
                private changeDetectorRef: ChangeDetectorRef,
                private sanitizer: DomSanitizer,
                private ngZone: NgZone) {

        //filter panel or main menu was toggled
        this.dashboardService.onLeftPanelToggled
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (event) => this.onResize(event)
            });

        //filter selections
        this.dashboardPatrolService.onRobotDroneSelected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (robotDroneData) => this.robotDroneSelected(robotDroneData)
            });

        this.dashboardPatrolService.onFilterCriteriaChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleFilterCriteriaChanged()
            });

        //TODO add filter criteria changed event here

        //on timeframe change
        this.dashboardService.onTimeframeChange
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.timeframeChanged()
            });

        //alarm data
        this.dashboardAlarmService.updateAlarmData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleUpdatedAlarmData()
            });

        this.dashboardAlarmService.onNewAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleNewAlarmData()
            });

        //on patrol instance updates
        this.dashboardPatrolService.onPatrolsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleLoadedPatrolData()
            });

        this.dashboardPatrolService.onNewPatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrol) => this.handleNewPatrolInstance(patrol)
            });

        this.dashboardPatrolService.onUpdatePatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrol) => this.handleUpdatedPatrolInstance(patrol)
            });

        this.dashboardPatrolService.onCompletededPatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrol) => this.handleCompletededPatrolInstance(patrol)
            });

        //patrol template updates
        this.dashboardPatrolService.onPatrolTemplatesLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleLoadedPatrolData()
            });

        this.dashboardPatrolService.onUpdatePatrolTemplate
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (template) => this.handleUpdatePatrolTemplate(template)
            });

        this.dashboardPatrolService.onPatrolTemplateDeleted
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (templateID) => this.handlePatrolTemplateDeleted(templateID)
            });

        //platform update??

        //filter or time change
        this.dashboardPatrolService.onUpdatePatrolData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleUpdatePatrolData()
            });
    }

    ngOnInit(): void {
        this.setPatrolStatusChartData();
        this.setPatrolAlarmsChartData();

        // Bind scroll event outside of angular so that change detection is not fired on every scroll event
        // We only need to persist the current scroll value, so change detection is not required
        //this.ngZone.runOutsideAngular(() => {
        //    this.alarmResultsContainer.nativeElement.addEventListener('scroll', (e: any) => {
        //        this.onContainerScroll(e);
        //    });
        //});

        //TSR* 
        //get patrol data
        if (this.dashboardService.patrolDataLoaded) {
            this.masterPatrols = this.dashboardPatrolService.getPatrols();
            this.patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();
            this.initPatrolInstanceMap();
        }
        else {
            this.masterPatrols = [];
            this.patrolTemplates = [];
        }

        //reset quick filters
        this.patrolRobotDroneFilter = null;
        this.patrolAlarmPriorityFilter = 0;
        this.patrolResultCount = 0;

        //get filtered data
        this.updateFilteredPatrols();
    }

    ngAfterViewInit(): void {
        this.resultsContainerDivSize = this.patrolResultsContainer.nativeElement.clientWidth - 8;
        this.patrolResultsContainer.nativeElement.scrollTop = 0;
        this.updateData();

        // Bind scroll event outside of angular so that change detection is not fired on every scroll event
        // We only need to persist the current scroll value, so change detection is not required
        this.ngZone.runOutsideAngular(() => {
            this.patrolResultsContainer.nativeElement.addEventListener('scroll', (e: any) => {
                this.onContainerScroll(e);
            });
        });
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    onResize(event: any): void {
        this.resultsContainerDivSize = this.patrolResultsContainer.nativeElement.clientWidth - 8;
        this.determineDisplayItems();
    }

    expandedMoreOperatorViewState(): string {
        if (this.moreOperatorExpanded) {
            return 'out';
        }
        return 'in';
    }

    toggleExpandedMoreOperatorView(): void {
        event.stopPropagation();
        this.moreOperatorExpanded = !this.moreOperatorExpanded;
    }

    expandedResultsViewState(patrolInstanceID: string): string {
        if (!this.expandedResult[patrolInstanceID])
            this.expandedResult[patrolInstanceID] = 'in';
        return this.expandedResult[patrolInstanceID];
    }

    toggleExpandedResultsView(patrolInstanceID: string): void {
        event.stopPropagation();

        if (this.expandedPatrolID && this.expandedPatrolID !== patrolInstanceID) {
            this.expandedResult[this.expandedPatrolID] = 'in';
        }

        if (this.expandedResult[patrolInstanceID] === 'out')
            this.expandedResult[patrolInstanceID] = 'in';
        else {
            this.expandedResult[patrolInstanceID] = 'out';
            this.expandedPatrolID = patrolInstanceID;
        }
    }

    onContainerScroll(event: any) {
        this.currentScroll = this.patrolResultsContainer.nativeElement.scrollTop;
    }

    maintainScroll(): void {
        this.patrolResultsContainer.nativeElement.scrollTop = this.currentScroll;
    }

    updateScroll(patrol: PatrolInstance, newPatrol: boolean): void {
        // Get the dom element of the alarm being added/removed
        let item = document.getElementById('patrol_result_item_' + patrol.InstanceId);

        if (item) {
            // If the patrol item is in or above the viewable section of the patrol container, 
            // change the current scroll top to prevent the scroll offset from changed
            if (item.offsetTop < this.patrolResultsContainer.nativeElement.scrollTop + this.patrolResultsContainer.nativeElement.clientHeight) {
                //if (newPatrol) {
                //    this.currentScroll += $(item).find('.lpItem').height() + 2; // +2 to account for border
                //} else {
                this.currentScroll -= item.children[0].clientHeight;
                //}
            }
        }

        this.maintainScroll();
    }

    getFilteredPatrols(): PatrolInstance[] {
        let patrols: PatrolInstance[] = [];

        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            //processing current data - use the filtered map object
            if (this.filteredPatrolInstanceMap.size > 0) {
                patrols = Array.from(this.filteredPatrolInstanceMap.values());
            }
        } else {
            //processing timeframe data - use array returned from the query
            patrols = this.historicalPatrols;
        }

        return patrols;
    }

    getAllFilteredPatrolsAlarms() {
        let patrolAlarms: Alarm[] = [];
        let patrols: PatrolInstance[] = this.getFilteredPatrols();
        let alarmNotInService: string[] = [];
        this.patrolToAlarmsMap.clear();

        if (patrols && patrols.length > 0) {
            let patrolInst: PatrolInstance[] = patrols.filter(p => p.AlarmIds && p.AlarmIds.length > 0);
            let alarmIDs: string[][] = patrolInst.map(function (p) {
                if (p.AlarmIds && p.AlarmIds.length > 0) {

                    let alarms: Alarm[] = [];
                    for (let aID of p.AlarmIds) {
                        let alarm = this.dashboardAlarmService.getFilteredAlarm(aID);
                        if (alarm)
                            alarms.push(alarm);
                        else {
                            alarmNotInService.push(aID);
                        }
                    }

                    this.patrolToAlarmsMap.set(p.id, alarms);

                    return p.AlarmIds; //may not need this anymore
                }
            }, this);

            let patrolPointInst: PatrolInstance[] = patrols.filter(p => p.Points && p.Points.length > 0);
            if (patrolPointInst) {
                for (let pInst of patrolPointInst) {
                    let ptInstAlarms: PointInstance[] = pInst.Points.filter(pt => pt.AlarmIds && pt.AlarmIds.length > 0);
                    if (ptInstAlarms.length > 0) {
                        let ptAlarmIDs: string[][] = ptInstAlarms.map(function (p) {
                            if (p.AlarmIds && p.AlarmIds.length > 0) {

                                let alarms: Alarm[] = [];
                                for (let aID of p.AlarmIds) {
                                    let alarm = this.dashboardAlarmService.getFilteredAlarm(aID);
                                    if (alarm)
                                        alarms.push(alarm);
                                    else {
                                        alarmNotInService.push(aID);
                                    }
                                }

                                if (this.patrolToAlarmsMap.has(pInst.id)) {
                                    let updAlarms: Alarm[] = this.patrolToAlarmsMap.get(pInst.id);
                                    updAlarms = updAlarms.concat(alarms);
                                    this.patrolToAlarmsMap.set(pInst.id, updAlarms);
                                } else {
                                    this.patrolToAlarmsMap.set(pInst.id, alarms);
                                }

                                return p.AlarmIds; //may not need this anymore
                            }
                        }, this);

                        if (ptAlarmIDs.length > 0) //may not need this anymore
                            alarmIDs = alarmIDs.concat(ptAlarmIDs);
                    }

                    let patrolPointActionInst: PointInstance[] = pInst.Points.filter(pt => pt.Actions && pt.Actions.length > 0);
                    let patrolPointActions: ActionInstance[][] = patrolPointActionInst.map(function (pt) { return pt.Actions; });
                    for (let ptActionInst of patrolPointActions) {
                        let ptActionInstAlarms: ActionInstance[] = ptActionInst.filter(a => a.AlarmIds !== null);
                        if (ptActionInstAlarms.length > 0) {
                            let ptActionAlarmIDs: string[][] = ptActionInstAlarms.map(function (p) {
                                if (p.AlarmIds && p.AlarmIds.length > 0) {

                                    let alarms: Alarm[] = [];
                                    for (let aID of p.AlarmIds) {
                                        let alarm = this.dashboardAlarmService.getFilteredAlarm(aID);
                                        if (alarm)
                                            alarms.push(alarm);
                                        else {
                                            alarmNotInService.push(aID);
                                        }
                                    }

                                    if (this.patrolToAlarmsMap.has(pInst.id)) {
                                        let updAlarms: Alarm[] = this.patrolToAlarmsMap.get(pInst.id);
                                        updAlarms = updAlarms.concat(alarms);
                                        this.patrolToAlarmsMap.set(pInst.id, updAlarms);
                                    } else {
                                        this.patrolToAlarmsMap.set(pInst.id, alarms);
                                    }
                                    return p.AlarmIds;
                                }
                            }, this);
                            if (ptActionAlarmIDs.length > 0) //may not need this anymore
                                alarmIDs = alarmIDs.concat(ptActionAlarmIDs);
                        }
                    }
                }
            }

            if (alarmNotInService.length > 0) {
                //TODO Test this scenario - if in last 8 hours search but patrol ran into 9th hour and alarm happened in to 9th hour
                //get these alarms from the database
                this.dashboardAlarmService.loadAlarmsByIds(alarmNotInService).then((alarms) => {
                    if (alarms && alarms.length > 0) {
                        for (let dbAlarms of alarms) {

                            let alarm: Alarm = new Alarm(dbAlarms);

                            if (alarm.PatrolId) {
                                if (this.patrolToAlarmsMap.has(alarm.PatrolId)) {
                                    let updAlarms: Alarm[] = this.patrolToAlarmsMap.get(alarm.PatrolId);
                                    updAlarms = updAlarms.concat(alarms);
                                } else {
                                    this.patrolToAlarmsMap.set(alarm.PatrolId, alarms);
                                }
                            }
                        }
                        this.changeDetectorRef.detectChanges;
                    }
                });
            }
        }
    }

    getAllPatrolsAlarms(): Alarm[] {
        let patrolAlarms: Alarm[] = [];

        if (this.patrolToAlarmsMap && this.patrolToAlarmsMap.size > 0) {

            this.patrolToAlarmsMap.forEach((alarm, index) => {
                patrolAlarms = patrolAlarms.concat(alarm);
            });
        }

        return patrolAlarms;
    }

    getAllPatrolsAlarmIDs(): string[] {
        let patrolAlarms: Alarm[] = [];
        let patrolAlarmIDs: string[] = [];

        if (this.patrolToAlarmsMap && this.patrolToAlarmsMap.size > 0) {

            this.patrolToAlarmsMap.forEach((alarm, index) => {
                patrolAlarms = patrolAlarms.concat(alarm);
            });
            if (patrolAlarms.length > 0)
            {
                patrolAlarmIDs = patrolAlarms.map(function (a) {
                    return a.Id;
                });
            }
        }

        return patrolAlarmIDs;
    }

    getPatrolAlarms(patrolID: string): Alarm[] {
        let patrolAlarms: Alarm[] = [];

        if (this.patrolToAlarmsMap && this.patrolToAlarmsMap.size > 0) {
            if (this.patrolToAlarmsMap.has(patrolID))
                patrolAlarms = this.patrolToAlarmsMap.get(patrolID);
        }

        return patrolAlarms;
    }

    ///////////////////////////////////////////
    //Notification Methods
    ///////////////////////////////////////////
    timeframeChanged() {
        //clear selected patrol
        if (this.dashboardPatrolService.selectedPatrol !== null)
            this.dashboardPatrolService.deSelectPatrol(this.dashboardPatrolService.selectedPatrol, true);
    }

    handleFilterCriteriaChanged() {
        this.masterPatrols = this.dashboardPatrolService.getPatrols();

        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            this.initPatrolInstanceMap();
        }

        this.updateData();
    }

    ////////
    //Alarm Notification
    ///////
    handleUpdatedAlarmData() {
        this.updateData();
    }

    handleNewAlarmData() {
        //process new alarm
        this.updateData();
    }

    ////////
    //Patrols Notification
    ///////
    handleUpdatePatrolData() {
        //a filter was changed or a new timeframe was triggered
        this.masterPatrols = this.dashboardPatrolService.getPatrols();

        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            this.initPatrolInstanceMap();
        }

        this.updateData();
    }

    handleLoadedPatrolData() {
        this.masterPatrols = this.dashboardPatrolService.getPatrols();
        this.patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();
        this.initPatrolInstanceMap();
    }

    handleUpdatePatrolTemplate(patrolTemplate: PatrolTemplate) {
        //update master list
        this.patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();

        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            //check to see if the patrol has been submitted and if so add it to the map
            //otherwise remove it ***ONLY IF*** the template is still in the map and not the instance 
            //(i.e for some reason execute patrol failed to send back an instance - we need to remove the tempary patrol instance or the template)
            if (patrolTemplate.IsPatrolSubmitted && !this.patrolInstanceMap.has(patrolTemplate.TemplateId)) {
                this.addPatrolTemplateToMap(patrolTemplate);
            } else if (!patrolTemplate.IsPatrolSubmitted && this.patrolInstanceMap.has(patrolTemplate.TemplateId)) {
                //check to see if the object is a template
                let item: any = this.patrolInstanceMap.get(patrolTemplate.TemplateId);
                if (isPatrolTemplate(item))
                    this.removePatrolTemplateFromMap(patrolTemplate);
            }

            //do normal procecessings for updates
            this.updateData();
        }
    }

    handlePatrolTemplateDeleted(templateID: string) {
        this.patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();
    }

    handleNewPatrolInstance(patrol: PatrolInstance) {
        //update master list
        this.masterPatrols = this.dashboardPatrolService.getPatrols();

        //add new patrol to dictionary (replace tempary patrol template)
        this.updatePatrolInstanceInMap(patrol);
    }

    handleUpdatedPatrolInstance(patrolInstance: PatrolInstance) {
        if (patrolInstance) {
            this.updatePatrolInstanceInMap(patrolInstance);
            this.updateData();
        }
    }

    handleCompletededPatrolInstance(patrolInstance: PatrolInstance) {
        if (patrolInstance) {

            if (patrolInstance.RunSetData && patrolInstance.RunSetData.NextRun) {
                //this is a repeat patrol
                //switch the patrol instance back to a patrol template with a waiting icon
                let pTemplate: PatrolTemplate;
                let pts: PatrolTemplate[] = this.patrolTemplates.filter(pt => pt.TemplateId === patrolInstance.TemplateId);
                if (pts && pts.length > 0) {
                    pTemplate = pts[0];
                    if (pTemplate.IsPatrolSubmitted)
                        this.addPatrolTemplateToMap(pTemplate);
                }
            }
            else {

                let item: any = this.patrolInstanceMap.get(patrolInstance.TemplateId);
                if (isPatrolInstance(item)) {
                    //wait 90 seconds then remove the patrol from the dashboard
                    //setTimeout(() => this.removePatrolInstanceFromMap(patrolInstance), 90000);
                    this.removePatrolInstanceFromMap(patrolInstance);
                }
            }
            this.updateData();
        }
    }

    initPatrolInstanceMap() {
        //clear out existing data
        this.clearPatrolInstanceMap();

        //load all patrols and submitted patrol templates into map
        if (this.masterPatrols || this.patrolTemplates) {
            for (let pi of this.masterPatrols) {
                this.updatePatrolInstanceInMap(pi);
            }
            for (let pt of this.patrolTemplates) {
                if (pt.IsPatrolSubmitted && !this.patrolInstanceMap.has(pt.TemplateId)) {
                    this.addPatrolTemplateToMap(pt);
                }
            }
        }
    }

    addPatrolTemplateToMap(patrolTemplate: PatrolTemplate) {
        //create a temporary patrol instance for the template so it will show up in the 
        //results as a pending patrol

        let pTempSubmitted: PatrolInstance = new PatrolInstance();
        pTempSubmitted.TemplateId = patrolTemplate.TemplateId;
        pTempSubmitted.CurrentStatus = PatrolStatusValues.Unknown;
        pTempSubmitted.AreaType = patrolTemplate.AreaType;
        pTempSubmitted.DisplayName = patrolTemplate.DisplayName;
        pTempSubmitted.Points = [];
        pTempSubmitted.TenantId = patrolTemplate.TenantId;
        pTempSubmitted.LocationId = patrolTemplate.LocationId;
        pTempSubmitted.AlarmIds = [];
        pTempSubmitted.PlatformId = patrolTemplate.PlatformSubmittedId;
        pTempSubmitted.IsTemplate = patrolTemplate.IsTemplate;
        pTempSubmitted.InstanceId = null;
        pTempSubmitted.RunSetData = patrolTemplate.RunSetData;
        pTempSubmitted.UserName = patrolTemplate.UserName;

        this.patrolInstanceMap.set(pTempSubmitted.TemplateId, pTempSubmitted);
    }

    removePatrolTemplateFromMap(patrolTemplate: PatrolTemplate) {
        if (this.patrolInstanceMap.has(patrolTemplate.TemplateId))
        {
            //TODO
            //Wait a 90 seconds then remove it from the instance list
            this.patrolInstanceMap.delete(patrolTemplate.TemplateId);
            //setTimeout(() => this.completeInstance(updatedInstance), 1000);
        }
    }

    updatePatrolInstanceInMap(patrolInstance: PatrolInstance) {
        if (patrolInstance) {
            //swap fake patrol template for real patrol instance
            this.patrolInstanceMap.set(patrolInstance.TemplateId, patrolInstance);
        }
    }

    removePatrolInstanceFromMap(patrolInstance: PatrolInstance)
    {
        if (this.patrolInstanceMap.has(patrolInstance.TemplateId)) {
            this.patrolInstanceMap.delete(patrolInstance.TemplateId);
            if (patrolInstance.selected)
                this.dashboardPatrolService.deSelectPatrol(patrolInstance, true);
        }
    }

    clearPatrolInstanceMap() {
        if (this.patrolInstanceMap)
            this.patrolInstanceMap.clear();
        else
            this.patrolInstanceMap = new Map<string, PatrolInstance>();
    }

    updateData() {
        //get the newly queried patrol data
        //this.masterPatrols = this.dashboardPatrolService.getPatrols();

        //reset local filters
        this.patrolResultCount = 0;
        this.patrolAlarmPriorityFilter = 0;
        this.patrolRobotDroneFilter = null;
        this.setPatrolStatusChartData();

        //get filtered data
        this.updateFilteredPatrols();

        this.getAllFilteredPatrolsAlarms();

        //update the chart data
        this.updatePatrolStatusChartData();
        this.updatePatrolAlarmChartData();

        //update the Patrol Results Header section
        this.updateResultsHeader();

        //determine the results display columns
        this.determineDisplayItems();

        //TODO - select the previously selected patrol

        //hide the loading image
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current)
            setTimeout(() => { this.dashboardService.onTimeframeChangeComplete.next(); }, 1000);
        else
            this.dashboardService.onTimeframeChangeComplete.next();

        //detect changes
        this.changeDetectorRef.detectChanges();
    }

    ///////////////////////////////////////////
    //Patrol Status Chart Methods
    ///////////////////////////////////////////
    setPatrolStatusChartData() {
        this.patrolStatusChartData = {
            Critical: 0,
            Incomplete: 0,
            Warning: 0,
            Successful: 0,
            Selected: PatrolStatus.None
        };
        this.patrolStatusChartDataArray = [(this.patrolStatusChartData.Successful * 10),
                                            (this.patrolStatusChartData.Warning * 10),
                                            (this.patrolStatusChartData.Incomplete * 10),
                                            (this.patrolStatusChartData.Critical * 10)];

        this.patrolStatusChartTotal = 0;
    }

    updatePatrolStatusChartData() {
        let patrols: PatrolInstance[] = this.getFilteredPatrols();

        if (patrols && patrols.length > 0) {
            let criticalCount: number = 0;
            let incompleteCount: number = 0;
            let warningCount: number = 0;
            let successfulCount: number = 0;
            let calcSize: number = 0;
            let fStatus: number = 0;
            let eStatus: number = 0;
            let wStatus: number = 0;
            let sStatus: number = 0;

            for (let patrol of patrols) {
                let patrolStatusObj: PatrolStatusObj = this.dashboardPatrolService.getPatrolStatusObj(patrol);
                if (patrolStatusObj) {
                    switch (patrolStatusObj.Status)
                    {
                        case PatrolStatus.Critical:
                            criticalCount++;
                            fStatus = 1;
                            break;
                        case PatrolStatus.Incomplete:
                            incompleteCount++;
                            eStatus = 1;
                            break;
                        case PatrolStatus.Warning:
                            warningCount++;
                            wStatus = 1;
                            break;
                        case PatrolStatus.Healthy:
                        case PatrolStatus.Successful:
                            successfulCount++;
                            sStatus = 1;
                            break;
                        default:
                            break;
                    }
                } else {
                    console.log("Unknow Patrol.  ID = '" + patrol.id + "'");
                }
            }

            this.patrolStatusChartData = {
                Critical: criticalCount,
                Incomplete: incompleteCount,
                Warning: warningCount,
                Successful: successfulCount,
                Selected: PatrolStatus.None
            };

            let totalStatus: number = fStatus + eStatus + wStatus + sStatus;
            if (totalStatus === 4)
                calcSize = 25;
            else if (totalStatus === 3)
                calcSize = 33.34;
            else if (totalStatus === 2)
                calcSize = 50;
            else if (totalStatus === 1)
                calcSize = 100;

            this.patrolStatusChartDataArray = [];
            this.patrolStatusChartIndexStart = -1;
            this.patrolStatusChartIndexEnd = -1;
            if (successfulCount > 0)
            {
                this.patrolStatusChartDataArray.push((this.patrolStatusChartData.Successful * calcSize));
                this.patrolStatusChartIndexStart = 0;

                if (warningCount === 0 && incompleteCount === 0 && criticalCount === 0)
                    this.patrolStatusChartIndexEnd = 0;
            }
            else
                this.patrolStatusChartDataArray.push((0));

            if (warningCount > 0)
            {
                this.patrolStatusChartDataArray.push((this.patrolStatusChartData.Warning * calcSize));

                if (successfulCount === 0)
                    this.patrolStatusChartIndexStart = 1;

                if (incompleteCount === 0 && criticalCount === 0)
                    this.patrolStatusChartIndexEnd = 1;
            }
            else
                this.patrolStatusChartDataArray.push((0));

            if (incompleteCount > 0)
            {
                this.patrolStatusChartDataArray.push((this.patrolStatusChartData.Incomplete * calcSize));
                if (successfulCount === 0 && warningCount === 0)
                    this.patrolStatusChartIndexStart = 2;

                if (criticalCount === 0)
                    this.patrolStatusChartIndexEnd = 2;
            }
            else
                this.patrolStatusChartDataArray.push((0));

            if (criticalCount > 0)
            {
                this.patrolStatusChartDataArray.push((this.patrolStatusChartData.Critical * calcSize));
                if (successfulCount === 0 && warningCount === 0 && incompleteCount === 0)
                    this.patrolStatusChartIndexStart = 3;

                this.patrolStatusChartIndexEnd = 3;
            }
            else
                this.patrolStatusChartDataArray.push((0));

            this.patrolStatusChartTotal = criticalCount + incompleteCount + warningCount + successfulCount;

            ////////////////////////////////
            //// TEST DATA
            ////////////////////////////////
            //this.patrolStatusChartData = {
            //    Failed: 0,
            //    Error: 2,
            //    Warning: 4,
            //    Successful: 5,
            //    Selected: PatrolStatus.None
            //};
            //this.patrolStatusChartDataArray = [(this.patrolStatusChartData.Successful * 10),
            //(this.patrolStatusChartData.Warning * 10),
            //(this.patrolStatusChartData.Error * 10)];//, (this.patrolStatusChartData.Failed * 10)];
            //this.patrolStatusChartTotal = 11;
            ////////////////////////////////
        }
        else {
            this.patrolStatusChartData = {
                Critical: 0,
                Incomplete: 0,
                Warning: 0,
                Successful: 0,
                Selected: PatrolStatus.None
            };
            this.patrolStatusChartDataArray = [];
            this.patrolStatusChartTotal = 0;
        }
    }

    patrolStatusChartClicked(status: PatrolStatus) {
        //0 = successful, 1 = warning, 2 = error, 3 = failed

        switch (status)
        {
            case PatrolStatus.Successful:
                if (this.patrolStatusChartData.Successful === 0)
                    return;
                break;
            case PatrolStatus.Warning:
                if (this.patrolStatusChartData.Warning === 0)
                    return;
                break;
            case PatrolStatus.Incomplete:
                if (this.patrolStatusChartData.Incomplete === 0)
                    return;
                break;
            case PatrolStatus.Critical:
                if (this.patrolStatusChartData.Critical === 0)
                    return;
                break;
            default:
                break;
        }

        if (this.patrolStatusChartData.Selected === status) {
            //the user selected to turn off the status filter
            this.patrolStatusChartData.Selected = PatrolStatus.None;
        }
        else {
            //the user selected to turn on or change the status filter
            this.patrolStatusChartData.Selected = status;
        }

        //apply filter to results
        this.updateFilteredPatrols();
        //this.setResultsHeaderAllPatrolStatusCriteriaField();
        this.updateResultsHeader();
    }

    getPatrolStatusChartSelection(): PatrolStatus {
        return this.patrolStatusChartData.Selected;
    }

    ///////////////////////////////////////////
    //Robot And Drones Chart Methods
    ///////////////////////////////////////////
    robotDroneSelected(robotDroneData: RobotAndDrone): void {
        if (robotDroneData) {
            if (this.patrolRobotDroneFilter) {
                if (this.patrolRobotDroneFilter.ID === robotDroneData.ID) {
                    this.removePatrolFilter('RobotDrone');
                    return;
                }
            }
            this.patrolRobotDroneFilter = robotDroneData;
            //this.setResultsHeaderRobotDroneCriteriaField();
            this.updateFilteredPatrols();
            this.updateResultsHeader();
            this.changeDetectorRef.markForCheck();
        } else {
            this.removePatrolFilter('RobotDrone');
        }
    }

    ///////////////////////////////////////////
    //Alarms By Patrols Chart Methods
    ///////////////////////////////////////////
    setPatrolAlarmsChartData(): void {
        let ap: number = 0;
        let index: number = 0;
        let chartData: number[] = [];
        let chartLabel: string[] = [];

        //get all of the alarmIDs from the patrols
        //let alarms: Alarm[] = this.getAllFilteredPatrolsAlarms();
        let alarms: Alarm[] = this.getAllPatrolsAlarms();

        for (let i = 0; i < 4; ++i) {
            index = i + 1;
            ap = alarms.filter(a => a.Priority === index).length;
            chartData[i] = ap;
            chartLabel[i] = this.dashboardAlarmService.getAlarmPriorityDefn(index.toString()) +
                            " (P" + index.toString() + ") - " + ap.toString();
        }

        this.patrolAlarmsChartData = chartData;
        this.patrolAlarmsChartLabels = chartLabel;
        this.patrolAlarmsChartTotal = alarms.length;
    }

    updatePatrolAlarmChartData(): void {
        let chart = this.chartComponent.chart;
        let data: any = chart.data;
        let datasets: any = data.datasets;
        let labels: any = data.labels;
        let ap: number = 0;
        let index: number = 0;

        let alarms: Alarm[] = this.getAllPatrolsAlarms();

        for (let i = 0; i < datasets[0].data.length; ++i) {
            index = i + 1;
            ap = alarms.filter(a => a.Priority === index).length;
            datasets[0].data[i] = ap;
            labels[i] = this.dashboardAlarmService.getAlarmPriorityDefn(index.toString()) + " (P" + index.toString() + ") - " + ap.toString();
            this.showPatrolAlarmsLegendData[i] = 'show';
            chart.data.datasets[0].backgroundColor[i] = this.patrolAlarmsChartColorsDefault[0].backgroundColor[i];
        }

        chart.update();
        this.patrolAlarmsChartTotal = alarms.length;
        this.patrolAlarmsChartLegendData = this.chartComponent.chart.generateLegend();
        //this.changeDetectorRef.detectChanges();
    }

    getPatrolAlarmsLegendCallback(chart: BaseChartDirective): {}[] {
        let legendData: {}[] = [];
        if (chart) {
            let data: any = chart.data;
            let datasets: any = data.datasets;
            let labels: any = data.labels;
            if (datasets.length) {

                let empty: boolean = false;

                for (let i = 0; i < datasets[0].data.length; ++i) {
                    if (datasets[0].data[i] === 0)
                        empty = true;
                    else
                        empty = false;

                    legendData[i] = {
                        DataValue: datasets[0].data[i],
                        Priority: "P" + (i + 1).toString(),
                        Empty: empty,
                        Label: labels[i],
                        LegendItemIndex: i
                    };
                }
            }
        }
        return legendData;
    }

    chartClicked(e: any): void {
        console.log(e);
    }

    patrolAlarmsLegendClicked(e: any, dataValue: number, legendItemID: string): void {
        if (dataValue >= 0) {
            let chart = this.chartComponent.chart;
            let index = this.chartComponent.chart.legend.legendItems[legendItemID].index;

            if (chart.data.datasets[0].data[index] !== 0) {
                let selectedPriorityFilter: number = (this.patrolAlarmPriorityFilter === 0) ? index : (this.patrolAlarmPriorityFilter - 1);

                if (index !== selectedPriorityFilter) {
                    //they picked a different item

                    //hide the one already selected
                    this.showPatrolAlarmsLegendData[selectedPriorityFilter] = 'hide';
                    chart.data.datasets[0].backgroundColor[selectedPriorityFilter] = this.patrolAlarmsChartColorsOpacity[0].backgroundColor[selectedPriorityFilter];

                    //show the new one that was selected
                    this.showPatrolAlarmsLegendData[index] = 'show';
                    chart.data.datasets[0].backgroundColor[index] = this.patrolAlarmsChartColorsDefault[0].backgroundColor[index];
                }
                else {
                    for (let i = 0; i < chart.data.datasets[0].data.length; i++) {
                        if (i !== index) {
                            if (this.showPatrolAlarmsLegendData[i] === 'hide') {
                                this.showPatrolAlarmsLegendData[i] = 'show';
                                chart.data.datasets[0].backgroundColor[i] = this.patrolAlarmsChartColorsDefault[0].backgroundColor[i];
                            }
                            else {
                                this.showPatrolAlarmsLegendData[i] = 'hide';
                                chart.data.datasets[0].backgroundColor[i] = this.patrolAlarmsChartColorsOpacity[0].backgroundColor[i];
                            }
                        }
                    }
                }

                if ((this.patrolAlarmPriorityFilter) && (this.patrolAlarmPriorityFilter === (index + 1))) {
                    //the user selected to turn off the priority filter
                    this.patrolAlarmPriorityFilter = 0;

                    this.patrolAlarmsChartSelectedDataValue = -1;
                    this.patrolAlarmsChartSelectedLegendItemID = '-1';
                }
                else {
                    //the user selected  to turn on the priority filter
                    this.patrolAlarmPriorityFilter = index + 1;

                    this.patrolAlarmsChartSelectedDataValue = dataValue;
                    this.patrolAlarmsChartSelectedLegendItemID = legendItemID;
                }

                this.updateFilteredPatrols();
                //this.setResultsHeaderAlarmPriorityCriteriaField();
                this.updateResultsHeader();
                chart.update();
            }
        }
    }

    getPatrolAlarmsLegendViewState(legendItemID: string): string {
        if (!this.showPatrolAlarmsLegendData[legendItemID])
            this.showPatrolAlarmsLegendData[legendItemID] = 'show';
        return this.showPatrolAlarmsLegendData[legendItemID];
    }

    //////////////////////////////////////////////
    //Export Methods
    //////////////////////////////////////////////
    exportPDF(): void {
        this.exporting = true;
        this.changeDetectorRef.markForCheck();

        let criteria = {};
        criteria["Priority"] = this.dashboardPatrolService.patrolFilterAlarmPrioritySelection;
        criteria["Operator"] = this.dashboardPatrolService.patrolFilterOperatorSelection;
        criteria["DisplayName"] = this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection;
        criteria["Status"] = this.dashboardPatrolService.patrolFilterStatusSelection;
        criteria["Robot"] = this.dashboardPatrolService.patrolFilterRobotSelection;

        let startTime: number;
        let endTime: number;
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            startTime = moment().valueOf();
            endTime = 0;
        }
        else {
            startTime = this.dashboardAlarmService.exportStartDateTime;
            endTime = this.dashboardAlarmService.exportEndDateTime;
        }

        let reportData: any = {
            //Alarms: null,
            //Patrols: null,
            //Platforms: null,
            PatrolAlarmIDs: this.getAllPatrolsAlarmIDs(),
            SelectedLocationIDs: this.dashboardService.getSelectedLocationIDs(),
            SelectedPriorities: [this.patrolAlarmPriorityFilter],
            SelectedRobot: (this.patrolRobotDroneFilter !== null) ? this.patrolRobotDroneFilter.ID : null,
            //SelectedLOI: null,
            SelectedTimeframe: this.dashboardService.getSelectedTimeframe().toString(),
            ExportStartTime: startTime,
            ExportEndTime: endTime,
            Criteria: criteria,
            CurrentUser: null,
            User: null,
            URL: null,
            ReportType: 'Patrol',
            WebProxyHostname: null,
            WebProxyPortNumber: 0,
            WebProxyUsername: null,
            WebProxyPassword: null,
            WebProxyType: null
        };

        this.httpService.postPdf("/Report/URLToPDF/", reportData, null, true).then((pdfBytes) => {
            if (pdfBytes) {
                console.log('PDF File has been downloaded');
                let pdfFileUrl = URL.createObjectURL(pdfBytes, { oneTimeOnly: true });

                this.exporting = false;
                this.changeDetectorRef.markForCheck();

                //download it
                let a = document.createElement("a");
                document.body.appendChild(a);
                a.style.display = "none";
                a.href = pdfFileUrl;
                a.download = "SmartCommandPatrolReport.pdf";
                a.click();
                document.body.removeChild(a);

                //revoke the url
                window.URL.revokeObjectURL(pdfFileUrl);
            }
        });

    }

    //////////////////////////////////////////////
    //Results Header Methods
    //////////////////////////////////////////////
    public updateResultsHeader(): void {
        //this is invoked on startup

        //set the headerFilteredCountField field - filter criteria from the patrol section in the filter panel
        this.setResultsHeaderFilteredCriteriaField();

        //set the patrolAllPatrolStatusCountField field
        this.setResultsHeaderAllPatrolStatusCriteriaField();

        ////set the patrolActiveFilter and patrolTimeframeFilter filters
        this.setResultsHeaderActiveOrTimeframeField();

        ////set the patrolRobotAndDroneField field
        this.setResultsHeaderRobotDroneCriteriaField();

        ////set the patrolAlarmPriorityField field
        this.setResultsHeaderAlarmPriorityCriteriaField();
    }

    setResultsHeaderFilteredCriteriaField() {
        if ( (this.dashboardPatrolService.patrolFilterAlarmPrioritySelection !== 0) ||
            ((this.dashboardPatrolService.patrolFilterOperatorSelection) && (this.dashboardPatrolService.patrolFilterOperatorSelection !== 'All')) ||
            ((this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection) && (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection !== 'All')) ||
            (this.dashboardPatrolService.patrolFilterStatusSelection !== 4) ||
            ((this.dashboardPatrolService.patrolFilterRobotSelection) && (this.dashboardPatrolService.patrolFilterRobotSelection !== 'All'))) {
            let count: number = this.masterPatrols.length; //templates???
            this.headerFilteredCriteriaField = " " + count.toString();
        }
        else
            this.headerFilteredCriteriaField = "";
    }

    setResultsHeaderAllPatrolStatusCriteriaField() {
        if (this.patrolStatusChartData.Selected !== PatrolStatus.None) {
            let count: number = 0;
            let status: string = '';
            switch (this.patrolStatusChartData.Selected)
            {
                case PatrolStatus.Successful:
                    count = this.patrolStatusChartData.Successful;
                    status = 'Successful';
                    break;
                case PatrolStatus.Warning:
                    count = this.patrolStatusChartData.Warning;
                    status = 'Warning';
                    break;
                case PatrolStatus.Incomplete:
                    count = this.patrolStatusChartData.Incomplete;
                    status = 'Incomplete';
                    break;
                case PatrolStatus.Critical:
                    count = this.patrolStatusChartData.Critical;
                    status = 'Critical';
                    break;
                default:
                    break;
            }

            if (this.patrolResultCount < count)
                count = this.patrolResultCount;

            //this.headerAllPatrolStatusCriteriaField = " (" + count.toString() + ") " + status;
            this.headerAllPatrolStatusCriteriaField = " " + status;
        }
        else if ((this.dashboardPatrolService.patrolFilterAlarmPrioritySelection !== 0) ||
                ((this.dashboardPatrolService.patrolFilterOperatorSelection) && (this.dashboardPatrolService.patrolFilterOperatorSelection !== 'All')) ||
                ((this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection) && (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection !== 'All')) ||
                (this.dashboardPatrolService.patrolFilterStatusSelection !== 4) ||
                ((this.dashboardPatrolService.patrolFilterRobotSelection) && (this.dashboardPatrolService.patrolFilterRobotSelection !== 'All'))) {
            this.headerAllPatrolStatusCriteriaField = "";
        }
        else
            this.headerAllPatrolStatusCriteriaField = " All ";
    }

    setResultsHeaderActiveOrTimeframeField(): void {
        let timeframe: FilterTimeframe = this.dashboardService.getSelectedTimeframe();
        if (timeframe === FilterTimeframe.Current) {
            this.headerActiveCriteriaField = "Active";
            this.headerTimeframeCriteriaField = "";
        }
        else {
            this.headerActiveCriteriaField = '';
            if (timeframe === FilterTimeframe.Custom) {
                if ((this.dashboardService.customStartDateTime) && (this.dashboardService.customEndDateTime)) {
                    this.headerTimeframeCriteriaField = "between " + this.formatDate(this.dashboardService.customStartDateTime) + " and " + this.formatDate(this.dashboardService.customEndDateTime);
                }
                else if (this.dashboardService.customStartDateTime) {
                    this.headerTimeframeCriteriaField = "after " + this.formatDate(this.dashboardService.customStartDateTime);
                }
                else if (this.dashboardService.customEndDateTime) {
                    this.headerTimeframeCriteriaField = "before " + this.formatDate(this.dashboardService.customEndDateTime);
                }
            }
            else
                this.headerTimeframeCriteriaField = "over the " + this.dashboardService.getSelectedTimeframeString(timeframe);
        }
    }

    setResultsHeaderRobotDroneCriteriaField(): void {
        if (this.patrolRobotDroneFilter)
        {
            this.headerRobotDroneCriteriaField = " for " + this.patrolRobotDroneFilter.DisplayName;
            if (this.headerAllPatrolStatusCriteriaField === " All ")
                this.headerAllPatrolStatusCriteriaField = "";
        }
        else
            this.headerRobotDroneCriteriaField = "";
    }

    setResultsHeaderAlarmPriorityCriteriaField(): void {
        if (this.patrolAlarmPriorityFilter > 0) {
            let count: number = 0;

            //get the alarm count for the filter patrols in the result list
            let filteredAlarms: Alarm[] = this.getAllPatrolsAlarms();

            //if (this.headerAllPatrolStatusCriteriaField.includes('All'))
            //    count = filteredAlarms.filter(a => a.Priority === this.patrolAlarmPriorityFilter).length;
            //else if (this.patrolResoultCount < filteredAlarms.filter(a => a.Priority === this.patrolAlarmPriorityFilter).length)
            //    count = this.patrolResoultCount;
            //else
            //count = filteredAlarms.filter(a => a.Priority === this.patrolAlarmPriorityFilter).length;
            //this.headerAlarmPriorityCriteriaField = " with (" + count.toString() + ") " +
            //        "P" + this.patrolAlarmPriorityFilter.toString() + " Alarms";
            this.headerAlarmPriorityCriteriaField = " with " + "P" + this.patrolAlarmPriorityFilter.toString() + " Alarms";

            if (this.headerAllPatrolStatusCriteriaField === " All ")
                this.headerAllPatrolStatusCriteriaField = "";
        }
        else
            this.headerAlarmPriorityCriteriaField = "";
    }

    getResultTotalCount(): string {
        let countStr: string = '';

        if ((this.headerAllPatrolStatusCriteriaField !== '' && this.headerAllPatrolStatusCriteriaField !== ' All ') ||
            (this.headerRobotDroneCriteriaField !== '') ||
            (this.headerAlarmPriorityCriteriaField !== '')) {
            countStr = this.getFilteredPatrols().length.toString();
        }
        else
            countStr = this.headerFilteredCriteriaField;

        return countStr;
    }

    removePatrolFilter(filter: string): void {
        switch (filter) {
            case 'AllPatrolStatus':
                this.patrolStatusChartData.Selected = PatrolStatus.None;
                this.updateFilteredPatrols();
                //this.setResultsHeaderAllPatrolStatusCriteriaField();
                this.updateResultsHeader();
                break;
            case 'RobotDrone':
                this.patrolRobotDroneFilter = null;
                this.updateFilteredPatrols();
                //this.setResultsHeaderAllPatrolStatusCriteriaField();
                //this.setResultsHeaderRobotDroneCriteriaField();
                this.updateResultsHeader();
                break;
            case 'Alarm':
                this.patrolAlarmsLegendClicked('', this.patrolAlarmsChartSelectedDataValue, this.patrolAlarmsChartSelectedLegendItemID);
                break;
            default:
                break;
        }
        this.changeDetectorRef.markForCheck();
    }

    showPatrolFilterCriteria(): void {
        this.dashboardService.showPatrolFilterCriteriaComponent();
    }

    formatDate(date: Date): string {
        let dateStr: string = '';
        if (date) {
            let m = date.getMonth() + 1;
            let d = date.getDate();
            let y = date.getFullYear();
            dateStr = m + "/" + d + "/" + y;
        }
        return dateStr;
    }

    //////////////////////////////////////////////
    //Results Items Methods
    //////////////////////////////////////////////
    updateFilteredPatrols(): void {
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            let patrolInstances: PatrolInstance[] = Array.from(this.patrolInstanceMap.values());
            patrolInstances = this.patrolStatusPipe.transform(patrolInstances, this.patrolStatusChartData.Selected, this.patrolTemplates);
            if (this.patrolRobotDroneFilter) {
                let platformID: string = this.patrolRobotDroneFilter.ID;
                patrolInstances = this.patrolRobotDronePipe.transform(patrolInstances, platformID);
            }
            patrolInstances = this.patrolAlarmPriorityPipe.transform(patrolInstances, this.getAllPatrolsAlarms(), this.patrolAlarmPriorityFilter);

            this.filteredPatrolInstanceMap = new Map<string, PatrolInstance>();
            for (let pi of patrolInstances)
            {
                this.filteredPatrolInstanceMap.set(pi.TemplateId, pi);
            }
            this.patrolResultCount = patrolInstances.length;
        }
        else
        {
            this.historicalPatrols = this.patrolStatusPipe.transform(this.masterPatrols, this.patrolStatusChartData.Selected, this.patrolTemplates);
            if (this.patrolRobotDroneFilter) {
                let platformID: string = this.patrolRobotDroneFilter.ID;
                this.historicalPatrols = this.patrolRobotDronePipe.transform(this.historicalPatrols, platformID);
            }
            this.historicalPatrols = this.patrolAlarmPriorityPipe.transform(this.historicalPatrols, this.getAllPatrolsAlarms(), this.patrolAlarmPriorityFilter);
            this.patrolResultCount = this.historicalPatrols.length;
        }
    }

    getPatrolStatusObj(patrol: PatrolInstance): PatrolStatusObj[] {
        let patrolStatusObjs: PatrolStatusObj[] = [];

        if (patrol)
        {
            let patrolStatusObj: PatrolStatusObj = this.dashboardPatrolService.getPatrolStatusObj(patrol);
            if (patrolStatusObj)
                patrolStatusObjs.push(patrolStatusObj);
        }
        return patrolStatusObjs;
    }

    getPatrolAlarmsPriority(patrolInstance: PatrolInstance): number {
        let hPriority: number = 0;
        if (patrolInstance) {
            //let patrolAlarms: Alarm[] = this.getPatrolAlarms(patrolInstance);
            let patrolAlarms: Alarm[] = this.getPatrolAlarms(patrolInstance.id);
            if ((patrolAlarms) && (patrolAlarms.length > 0)){
                if (patrolAlarms.filter(a => a.Priority === 1).length > 0)
                    hPriority = 1;
                else if ((patrolAlarms.filter(a => a.Priority === 2).length > 0) && (hPriority === 0))
                    hPriority = 2;
                else if ((patrolAlarms.filter(a => a.Priority === 3).length > 0) && (hPriority === 0))
                    hPriority = 3;
                else if ((patrolAlarms.filter(a => a.Priority === 4).length > 0) && (hPriority === 0))
                    hPriority = 4;
                else
                    hPriority = 0;
            }
        }
        return hPriority;
    }

    getPatrolAlarmsPriorityArray(patrolInstance: PatrolInstance): number[] {
        let hPriority: number[] = [];
        if (patrolInstance) {
            let hp: number = this.getPatrolAlarmsPriority(patrolInstance);
            hPriority.push(hp);
        }
        return hPriority;
    }

    getPatrolAlarmsPriorityObjectArray(patrolInstance: PatrolInstance): PatrolAlarmPriorityCount[] {
        let alarmPriority: PatrolAlarmPriorityCount[] = [];
        if (patrolInstance) {
            let ap: PatrolAlarmPriorityCount = this.getPatrolAlarmsPriorityCount(patrolInstance);
            if(ap)
                alarmPriority.push(ap);
        }
        return alarmPriority;
    }

    getPatrolAlarmsPriorityCount(patrolInstance: PatrolInstance): PatrolAlarmPriorityCount {
        let alarmCount: PatrolAlarmPriorityCount;
        if (patrolInstance) {
            //let patrolAlarms: Alarm[] = this.getPatrolAlarms(patrolInstance);
            let patrolAlarms: Alarm[] = this.getPatrolAlarms(patrolInstance.id);
            if ((patrolAlarms) && (patrolAlarms.length > 0)) {

                alarmCount = {
                    P1: patrolAlarms.filter(a => a.Priority === 1).length,
                    P2: patrolAlarms.filter(a => a.Priority === 2).length,
                    P3: patrolAlarms.filter(a => a.Priority === 3).length,
                    P4: patrolAlarms.filter(a => a.Priority === 4).length,
                    Total: patrolAlarms.length
                };
            }
        }
        return alarmCount;
    }

    //getPatrolAlarms(patrolInstance: PatrolInstance): Alarm[] {
    //    return this.dashboardPatrolService.getPatrolAlarms(patrolInstance);
    //}

    getPatrolAlarmsCount(patrolInstance: PatrolInstance): number {
        let count: number = 0;

        if ((patrolInstance) && (patrolInstance.AlarmIds)) {
            count = patrolInstance.AlarmIds.length;
        }
        return count;
    }

    getPatrolSubmittedTime(submittedTime: string): any {
        let result: string = this.dashboardPatrolService.convertPatrolTime(submittedTime);
        if (result) {
            let s: string[] = result.split("-");
            let r: string = "<span style='font-size: 16px; position: relative;float: left;'>" + s[0] + "</span>";
            r = r + "<span style='font-size: 13px; position: relative;float: left;'>" + s[1] + "</span>";
            return this.sanitizer.bypassSecurityTrustHtml(r);
        }
        else
            return '';
    }

    determineDisplayItems(): void {
        ////determine if the Robot and Drones columns should be shwown
        //if (this.resultsContentDivSize >= ResultsSize.Large) {
        //    this.showRobotDroneResultsColumn = true;
        //}
        //else if (this.resultsContentDivSize < ResultsSize.Large) {
        //    this.showRobotDroneResultsColumn = false;
        //}

       if (this.resultsContainerDivSize >= ResultsSize.Large) {
            this.showRobotDroneResultsColumn = true;
            this.showSubmittedTimeResultsColumn = true;
       }
       else if ((this.resultsContainerDivSize >= ResultsSize.Medium) && (this.resultsContainerDivSize < ResultsSize.Large)){
            this.showRobotDroneResultsColumn = true;
            this.showSubmittedTimeResultsColumn = false;
       }
       else if ((this.resultsContainerDivSize > ResultsSize.Small) && (this.resultsContainerDivSize < ResultsSize.Medium)) {
           this.showRobotDroneResultsColumn = false;
           this.showSubmittedTimeResultsColumn = false;
       }
       else if (this.resultsContainerDivSize <= ResultsSize.Small) {
            this.showRobotDroneResultsColumn = false;
            this.showSubmittedTimeResultsColumn = false;
       }

       this.changeDetectorRef.markForCheck(); //detectChanges()
    }

    selectPatrol(patrol: PatrolInstance): void {
        if (patrol.selected) {
            this.dashboardPatrolService.deSelectPatrol(patrol, true);
        } else {
            if (this.dashboardPatrolService.selectedPatrol !== null)
                this.dashboardPatrolService.deSelectPatrol(this.dashboardPatrolService.selectedPatrol, true);
            let patrolAlarms: Alarm[] = null;
            if (patrol.InstanceId) {
                patrolAlarms = this.getPatrolAlarms(patrol.InstanceId);
            }
            this.dashboardPatrolService.selectPatrol(patrol, patrolAlarms, true);
		}

		//this.changeDetectorRef.detectChanges();
    }
}