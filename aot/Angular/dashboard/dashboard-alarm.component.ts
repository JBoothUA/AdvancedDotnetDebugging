declare let pdfView: boolean;
declare let evoPdfConverter: any;
declare let reportSelectedPriorities: number[];
declare let reportSelectedOperator: string;
declare let reportSelectedLOI: TenantLocation;
declare let reportSelectedTimeframe: FilterTimeframe;
declare let reportReportType: string;

import {
    Component, OnInit, Input, ViewChild, ElementRef,
    NgZone, trigger, state, transition, style, animate,
    ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';
import { BaseChartDirective } from 'ng2-charts';

import { Tenant } from '../shared/tenant.class';
import { Location } from '../shared/location.class';
import { FilterTimeframe, TenantLocation, SliderType, AlarmOperator } from './dashboard';
import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { NavigationService } from '../shared/navigation.service';
import { HttpService } from '../shared/http.service';
import { DashboardSlider } from './dashboard-slider.component';

import { Alarm } from '../alarms/alarm.class';
import { AlarmOperatorPipe } from './alarm-operator.pipe';
import { AlarmPriorityPipe } from './alarm-priority.pipe';
import { AlarmLOIPipe } from './alarm-loi.pipe';

import { LocationFilterService } from '../shared/location-filter.service';
import { LeafletMap } from '../map/leaflet-map.component';
import { AlarmMapService } from '../map/alarms/alarmMap.service';

enum ResultsSize {
    Small = 706,
    Medium = 871,
    Large = 976,
    None = 0
}

@Component({
    selector: 'dashboard-alarm',
    templateUrl: 'dashboard-alarm.component.html',
    styleUrls: ['dashboard-alarm.component.css', 'dashboard.component.css'],
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
            transition('in <=> out', animate('600ms ease-in-out')),
            transition('out <=> in', animate('600ms ease-out'))
        ]
        )
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class DashboardAlarm implements OnInit {
    //Class Variables
    private operatorDivSize: number = 250;
    private resultsContainerDivSize: number = 706;
    private expandedResult: Map<number, string> = new Map<number, string>();
    private expandedAlarmID: string = null;

    //alarm props
    alarms: Alarm[] = [];
    masterAlarms: Alarm[] = [];

    //chart props
    doughnutChartLabels: string[] = []; //['Critical (P1) - 0', 'High (P2) - 3', 'Medium (P3) - 12', 'Low (P4) - 19'];
    doughnutChartData: number[]; //[0, 3, 12, 19];
    doughnutChartTotal: number = 0;
    doughnutChartColors: any[] = [{
        backgroundColor: ["#D62329", "#DB7828", "#F3B518", "#27BBA1"]
    }];
    doughnutChartColorsDefault: any[] = [{
        backgroundColor: ["#D62329", "#DB7828", "#F3B518", "#27BBA1"]
    }];
    doughnutChartColorsOpacity: any[] = [{
        backgroundColor: [
            "rgba(214,35,41,0.3)",
            "rgba(219,120,40,0.3)",
            "rgba(243,181,24,0.3)",
            "rgba(39,187,161,0.3)"]
    }];
    doughnutChartType: string = 'doughnut';
    doughnutChartOptions: any = {
        legendCallback: this.getLegendCallback,
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
    public doghnutChartLegendData: {}[];
    private showLegendData: Map<number, string> = new Map<number, string>();
    doughnutChartSelectedDataValue: number = -1;
    doughnutChartSelectedLegendItemID: string = '-1';

    //location props
    sliderTypeEnum: typeof SliderType = SliderType;
    selectedLocationsCount: number = 0;
    selectedLocationIDs: string[] = [];

    //operator props
    alarmOperators: AlarmOperator[]; //{}[] = [];
    alarmOperatorCount: number = 0;

    //export props
    exporting: boolean = false;

    //results header props
    headerFilteredCountField: string = '';
    headerFilterTotalCount: string = '';
    headerAllPriorityLocationCountField: string = '';
    headerActiveField: string = '';
    headerOperatorField: string = '';
    headerTimeframeField: string = '';
    headerLocationField: string = '';

    //search props
    alarmPlaceHolderSearch: string = "Search Alarms";

    //alarm results props
    alarmOperatorSelected: boolean = false;
    moreOperatorExpanded: boolean = false;
    currentScroll: number = 0;
    filterTimeframe: typeof FilterTimeframe = FilterTimeframe;
    showOperatorResultsColumn: boolean = true;
    showDurationsResultsColumn: boolean = true;

    //filters
    alarmOperatorFilter: string = '';
    alarmLocationFilter: TenantLocation = null;
    alarmPriorityFilter: number = 0;
    alarmResultCount: number = 0;

    //ViewChilds
    @ViewChild('alarmReportOperatorCountDiv') operatorCount: ElementRef;
    @ViewChild('alarmReportOperatorsDiv') operatorDiv: ElementRef;
    @ViewChild('dbLOISlider') dashboardLOIContent: DashboardSlider;
    @ViewChild('alarmReportResultsDiv') resultsDiv: ElementRef;
    @ViewChild('alarmReportResultsContentDiv') resultsContentDiv: ElementRef;
    @ViewChild(BaseChartDirective) chartComponent: BaseChartDirective;

    @ViewChild('alarmReportResults') alarmReportResults: ElementRef;
    @ViewChild('alarmReportResultsContainer') alarmResultsContainer: ElementRef;

    @ViewChild('map') alarmMap: LeafletMap;

    //Inputs
    @Input() searchterm: any; //TODO - rename to alarmSearchFilter & add to dashboardService

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    ////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    constructor(public dashboardService: DashboardService,
        public dashboardAlarmService: DashboardAlarmService,
        private dashboardPlatformService: DashboardPlatformService,
        private navigationService: NavigationService,
        protected httpService: HttpService,
        private sanitizer: DomSanitizer,
        private alarmOperatorPipe: AlarmOperatorPipe,
        private alarmPriorityPipe: AlarmPriorityPipe,
        private alarmLOIPipe: AlarmLOIPipe,
        private locationFilterService: LocationFilterService,
        private changeDetectorRef: ChangeDetectorRef,
        private ngZone: NgZone,
        private alarmMapService: AlarmMapService) {

        //this.dashboardAlarmService.timeframeUpdate
        //    .takeUntil(this.ngUnsubscribe)
        //    .subscribe({
        //        next: () => this.timeframeChanged()
        //    });

        //filter panel or main menu was toggled
        this.dashboardService.onLeftPanelToggled
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (event) => this.onResize(event)
            });

        //filter selections
        this.dashboardAlarmService.onLOISelected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (loiData) => this.loiSelected(loiData)
            });

        this.dashboardAlarmService.filterCriteriaChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleFilterCriteriaChanged()
            });

        //on timeframe change - attached to process different behavior than updateAlarmData()
        this.dashboardService.onTimeframeChange
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleTimeframeChanged()
            });

        //alarm data
        this.dashboardAlarmService.onAlarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleLoadedAlarmsData()
            });

        this.dashboardAlarmService.onNewAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.handleNewAlarm(alarm)
            });

        this.dashboardAlarmService.onEditAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.handleEditAlarm(alarm)
            });

        this.dashboardAlarmService.onRemoveAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.handleRemoveAlarm(alarm)
            });

        //filter or time change
        this.dashboardAlarmService.updateAlarmData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleUpdateAlarmData()
            });

        //filter or time change
        //this.dashboardService.locationsChanged
        //    .takeUntil(this.ngUnsubscribe)
        //    .subscribe({
        //        next: () => this.updateData()
        //    });

        this.dashboardAlarmService.alarmSelected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (id) => this.alarmSelected(id)
            });

        this.dashboardAlarmService.selectionChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (id) => this.changeDetectorRef.markForCheck()
            });

        //this.dashboardAlarmService.alarmRemoved
        //    .takeUntil(this.ngUnsubscribe)
        //    .subscribe({
        //        next: (alarm) => this.alarmRemoved(alarm)
        //    });


        //platforms loaded
        this.dashboardPlatformService.onPlatformsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleLoadedPlatformsData()
            });

        //zoom the map
        this.locationFilterService.onZoomToLocation
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (location) => this.handleZoomToMapLocation(location)
            });
    }

    public ngOnInit(): void {
        this.setChartData();

        //// Bind scroll event outside of angular so that change detection is not fired on every scroll event
        //// We only need to persist the current scroll value, so change detection is not required
        //this.ngZone.runOutsideAngular(() => {
        //    this.alarmResultsContainer.nativeElement.addEventListener('scroll', (e: any) => {
        //        this.onContainerScroll(e);
        //    });
        //});

        //TSR*
        //get alarm data
        if (this.dashboardService.alarmDataLoaded)//test this more for refreshing from mapview
            this.masterAlarms = this.dashboardAlarmService.getAlarms();
        else
            this.masterAlarms = []

        //reset local filters
        this.alarmOperatorFilter = '';
        this.alarmLocationFilter = null;
        this.alarmPriorityFilter = 0;

        //get filtered data
        this.updateFilteredAlarms();
    }

    public ngAfterViewInit(): void {
        if (this.alarmResultsContainer) {
            this.resultsContainerDivSize = this.alarmResultsContainer.nativeElement.clientWidth - 8;//this.resultsContentDiv.nativeElement.clientWidth;
            this.alarmResultsContainer.nativeElement.scrollTop = 0;
        }

        this.updateData();

        // Bind scroll event outside of angular so that change detection is not fired on every scroll event
        // We only need to persist the current scroll value, so change detection is not required
        this.ngZone.runOutsideAngular(() => {
            this.alarmResultsContainer.nativeElement.addEventListener('scroll', (e: any) => {
                this.onContainerScroll(e);
            }, { passive: true });
        });
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public onResize(event: any): void {
        if (this.operatorDiv)
            this.operatorDivSize = this.operatorDiv.nativeElement.clientWidth;

        if (this.alarmResultsContainer)
            this.resultsContainerDivSize = this.alarmResultsContainer.nativeElement.clientWidth - 8;

        this.alarmOperators = this.getOperatorInitials();
        this.determineDisplayItems();
    }

    public expandedMoreOperatorViewState(): string {
        if (this.moreOperatorExpanded) {
            return 'out';
        }
        return 'in';
    }

    public toggleExpandedMoreOperatorView(): void {
        event.stopPropagation();
        this.moreOperatorExpanded = !this.moreOperatorExpanded;
    }

    public expandedResultsViewState(alarmID: string): string {
        if (!this.expandedResult[alarmID])
            this.expandedResult[alarmID] = 'in';
        return this.expandedResult[alarmID];
    }

    public toggleExpandedResultsView(alarmID: string): void {
        event.stopPropagation();

        if (this.expandedAlarmID && this.expandedAlarmID !== alarmID) {
            this.expandedResult[this.expandedAlarmID] = 'in';
        }

        if (this.expandedResult[alarmID] === 'out')
            this.expandedResult[alarmID] = 'in';
        else {
            this.expandedResult[alarmID] = 'out';
            this.expandedAlarmID = alarmID;
        }
    }

    public onContainerScroll(event: any) {
        this.currentScroll = this.alarmResultsContainer.nativeElement.scrollTop;
    }

    public maintainScroll(): void {
        this.alarmResultsContainer.nativeElement.scrollTop = this.currentScroll;
    }

    public updateScroll(alarm: Alarm, newAlarm: boolean): void {
        // Get the dom element of the alarm being added/removed
        let item = document.getElementById('alarm_result_item_' + alarm.Id);

        if (item) {
            // If the alarm item is in or above the viewable section of the alarm container, change the current scroll top to prevent the scroll offset from changed
            if (item.offsetTop < this.alarmResultsContainer.nativeElement.scrollTop + this.alarmResultsContainer.nativeElement.clientHeight) {
                //if (newAlarm) {
                //    this.currentScroll += $(item).find('.lpItem').height() + 2; // +2 to account for border
                //} else {
                this.currentScroll -= item.children[0].clientHeight;
                //}
            }
        }

        this.maintainScroll();
    }

    ///////////////////////////////////////////
    //Notification Methods
    ///////////////////////////////////////////
    handleTimeframeChanged() {
        //clear selected alarm
        this.deselectAlarm();
        this.alarmMapService.showAlarmMarkers();
        this.alarmMapService.manualZoomMode = true;
        this.alarmMapService.fitMarkers(this.alarms);
    }

    handleZoomToMapLocation(location: Location) {
        this.alarmMap.zoomToMapLocation(location);
    }

    handleUpdateAlarmData() {
        //a filter was changed or a new timeframe was triggered
        this.masterAlarms = this.dashboardAlarmService.getAlarms();
        this.updateData();
    }

    handleLoadedAlarmsData() {
        this.masterAlarms = this.dashboardAlarmService.getAlarms();
        this.updateData();
        this.alarmMapService.showAlarmMarkers();
        this.alarmMapService.manualZoomMode = true;
        this.alarmMapService.fitMarkers(this.alarms);
    }

    handleNewAlarm(alarm: Alarm) {
        this.masterAlarms = this.dashboardAlarmService.getAlarms();
        this.updateData();
    }

    handleEditAlarm(alarm: Alarm) {
        this.masterAlarms = this.dashboardAlarmService.getAlarms();
        this.updateData();
    }

    handleRemoveAlarm(alarm: Alarm) {
        this.masterAlarms = this.dashboardAlarmService.getAlarms();
        this.updateScroll(alarm, false);
        this.updateData();
    }

    handleLoadedPlatformsData() {
        if (this.masterAlarms && this.masterAlarms.length > 0)
            this.updateData();
    }

    handleFilterCriteriaChanged() {
        this.masterAlarms = this.dashboardAlarmService.getAlarms();
        this.updateData();
    }

    updateData(): void {
        //get the selected location ids
        //this.selectedLocationIDs = this.getSelectedLocationIDs();

        //set the location of interest in the Filter Criteria section
        this.setLocationOfInterest();

        //get the newly queried alarm data
        //this.masterAlarms = this.dashboardAlarmService.getAlarms();

        //reset local filters - timeframe or location change
        this.alarmOperatorFilter = '';
        this.alarmLocationFilter = null;
        this.alarmPriorityFilter = 0;

        //get filtered data
        this.updateFilteredAlarms();

        //get the operators for the new alarms
        this.alarmOperators = this.getOperatorInitials();

        //update the chart data with the new alarms
        this.updateChartData();

        //update the Alarm Results Header section
        this.updateResultsHeader();

        //determine the results display columns
        this.determineDisplayItems();

        //re-select the previously selected alarm
        if (this.dashboardAlarmService.selectedAlarm !== null)
            this.selectAlarm(this.dashboardAlarmService.selectedAlarm);
        else
            this.alarmResultsContainer.nativeElement.scrollTop = 0;

        //hide the loading image
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current)
            setTimeout(() => {
                this.alarmMapService.showAlarmMarkers();
                this.alarmMapService.manualZoomMode = true;
                this.alarmMapService.fitMarkers(this.alarms);
                this.dashboardService.onTimeframeChangeComplete.next();

            }, 1000);
        else
            this.dashboardService.onTimeframeChangeComplete.next();

        this.alarmMapService.showAlarmMarkers();
        this.alarmMapService.manualZoomMode = true;
        this.alarmMapService.fitMarkers(this.alarms);

        this.changeDetectorRef.markForCheck(); //detectChanges();//markForCheck();
    }

    alarmSelected(alarmID: string): void {
        let item = document.getElementById('alarm_result_item_' + alarmID);
        //item.scrollIntoView(false);

        if (item) {
            // If the alarm item is outside of the current viewport 
            if (item.offsetTop < this.alarmResultsContainer.nativeElement.scrollTop ||
                item.offsetTop > this.alarmResultsContainer.nativeElement.scrollTop + this.alarmResultsContainer.nativeElement.clientHeight) {
                // Move the scroll height to the selected alarms position, minus half the tab height in order to place the alarm in the middle of the tab
                this.alarmResultsContainer.nativeElement.scrollTop = item.offsetTop - this.alarmResultsContainer.nativeElement.clientHeight + 70;
            }

            this.onContainerScroll(null);
        }
    }

    //alarmRemoved(alarm: Alarm): void {
    //    this.updateScroll(alarm, false);
    //}

    loiSelected(loiData: TenantLocation): void {
        if (this.alarmLocationFilter === null) {
            this.alarmLocationFilter = loiData;
            this.setResultsHeaderLocationField();
            this.updateFilteredAlarms();
            this.changeDetectorRef.markForCheck();
        }
        else {
            this.removeSelectedAlarmFilter('Location');
        }
    }

    ///////////////////////////////////////////
    //Chart Methods
    ///////////////////////////////////////////
    setChartData(): void {
        let ap: number = 0;
        let index: number = 0;
        let chartData: number[] = [];
        let chartLabel: string[] = [];

        for (let i = 0; i < 4; ++i) {
            index = i + 1;
            ap = this.alarms.filter(a => a.Priority === index).length;
            chartData[i] = ap;
            chartLabel[i] = this.dashboardAlarmService.getAlarmPriorityDefn(index.toString()) +
                " (P" + index.toString() + ") - " + ap.toString();
        }

        this.doughnutChartData = chartData;
        this.doughnutChartLabels = chartLabel;
        this.doughnutChartTotal = this.alarms.length;
    }

    updateChartData(): void {
        let chart = this.chartComponent.chart;
        let data: any = chart.data;
        let datasets: any = data.datasets;
        let labels: any = data.labels;
        let ap: number = 0;
        let index: number = 0;

        for (let i = 0; i < datasets[0].data.length; ++i) {
            index = i + 1;
            ap = this.alarms.filter(a => a.Priority === index).length;
            datasets[0].data[i] = ap;
            labels[i] = this.dashboardAlarmService.getAlarmPriorityDefn(index.toString()) + " (P" + index.toString() + ") - " + ap.toString();
            this.showLegendData[i] = 'show';
            chart.data.datasets[0].backgroundColor[i] = this.doughnutChartColorsDefault[0].backgroundColor[i];
        }

        chart.update();
        this.doughnutChartTotal = this.alarms.length;
        this.doghnutChartLegendData = this.chartComponent.chart.generateLegend();
        //this.changeDetectorRef.markForCheck();//detectChanges();
    }

    getLegendCallback(chart: BaseChartDirective): {}[] {
        let legendData: {}[] = [];
        if (chart) {
            let data: any = chart.data;
            let datasets: any = data.datasets;
            let labels: any = data.labels;
            if (datasets.length) {

                let priority: string = "";
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

    legendClicked(e: any, dataValue: number, legendItemID: string): void {
        if (dataValue >= 0) {
            let chart = this.chartComponent.chart;
            let index = this.chartComponent.chart.legend.legendItems[legendItemID].index;

            //if ((chart.data.datasets[0].data[index] != 0) && (this.showLegendData[index] === 'show')) {
            if (chart.data.datasets[0].data[index] !== 0) {
                let selectedPriorityFilter: number = (this.alarmPriorityFilter === 0) ? index : (this.alarmPriorityFilter - 1);

                if (index !== selectedPriorityFilter) {
                    //they picked a different item

                    //hide the one already selected
                    this.showLegendData[selectedPriorityFilter] = 'hide';
                    chart.data.datasets[0].backgroundColor[selectedPriorityFilter] = this.doughnutChartColorsOpacity[0].backgroundColor[selectedPriorityFilter];

                    //show the new one that was selected
                    this.showLegendData[index] = 'show';
                    chart.data.datasets[0].backgroundColor[index] = this.doughnutChartColorsDefault[0].backgroundColor[index];
                }
                else {
                    for (let i = 0; i < chart.data.datasets[0].data.length; i++) {
                        if (i !== index) {
                            if (this.showLegendData[i] === 'hide') {
                                this.showLegendData[i] = 'show';
                                chart.data.datasets[0].backgroundColor[i] = this.doughnutChartColorsDefault[0].backgroundColor[i];
                            }
                            else {
                                this.showLegendData[i] = 'hide';
                                chart.data.datasets[0].backgroundColor[i] = this.doughnutChartColorsOpacity[0].backgroundColor[i];
                            }
                        }
                    }
                }

                if ((this.alarmPriorityFilter) && (this.alarmPriorityFilter === (index + 1))) {
                    //the user selected to turn off the priority filter
                    this.alarmPriorityFilter = 0;

                    this.doughnutChartSelectedDataValue = -1;
                    this.doughnutChartSelectedLegendItemID = '-1';
                }
                else {
                    //the user selected  to turn on the priority filter
                    this.alarmPriorityFilter = index + 1;

                    this.doughnutChartSelectedDataValue = dataValue;
                    this.doughnutChartSelectedLegendItemID = legendItemID;
                }

                this.updateFilteredAlarms();
                this.setResultsHeaderAllPriorityLocationCountField();
                chart.update();
            }
        }
    }

    getDoughnutLegendViewState(legendItemID: string): string {
        if (!this.showLegendData[legendItemID])
            this.showLegendData[legendItemID] = 'show';
        return this.showLegendData[legendItemID];
    }

    //////////////////////////////////////////////
    //Operator Methods
    //////////////////////////////////////////////
    private getOperators(): string[] {
        let alarmOperatorsData: string[] = [];
        let unique = {};

        //walk high level 
        for (let i in this.alarms) {
            if (this.alarms[i].UserId) {
                if (typeof (unique[this.alarms[i].UserId]) === "undefined") {
                    alarmOperatorsData.push(this.alarms[i].UserId);
                }
                unique[this.alarms[i].UserId] = 0;
            }

            if (this.alarms[i].Created) {
                if (this.alarms[i].Created.UserId !== null) {
                    if (typeof (unique[this.alarms[i].Created.UserId]) === "undefined") {
                        alarmOperatorsData.push(this.alarms[i].Created.UserId);
                    }
                    unique[this.alarms[i].Created.UserId] = 0;
                }
            }

            if (this.alarms[i].Acknowledged) {
                if (this.alarms[i].Acknowledged.UserId !== null) {
                    if (typeof (unique[this.alarms[i].Acknowledged.UserId]) === "undefined") {
                        alarmOperatorsData.push(this.alarms[i].Acknowledged.UserId);
                    }
                    unique[this.alarms[i].Acknowledged.UserId] = 0;
                }
            }

            if (this.alarms[i].Cleared) {
                if (this.alarms[i].Cleared.UserId !== null) {
                    if (typeof (unique[this.alarms[i].Cleared.UserId]) === "undefined") {
                        alarmOperatorsData.push(this.alarms[i].Cleared.UserId);
                    }
                    unique[this.alarms[i].Cleared.UserId] = 0;
                }
            }

            if (this.alarms[i].Dismissed) {
                if (this.alarms[i].Dismissed.UserId !== null) {
                    if (typeof (unique[this.alarms[i].Dismissed.UserId]) === "undefined") {
                        alarmOperatorsData.push(this.alarms[i].Dismissed.UserId);
                    }
                    unique[this.alarms[i].Dismissed.UserId] = 0;
                }
            }

            if (this.alarms[i].Comments) {
                for (let x in this.alarms[i].Comments) {
                    if (this.alarms[i].Comments[x].UserId !== null) {
                        if (typeof (unique[this.alarms[i].Comments[x].UserId]) === "undefined") {
                            alarmOperatorsData.push(this.alarms[i].Comments[x].UserId);
                        }
                        unique[this.alarms[i].Comments[x].UserId] = 0;
                    }
                }
            }
        }

        return alarmOperatorsData;
    }

    private getOperatorInitials(): any {
        let operatorsObj: {} = {};
        let operators: AlarmOperator[] = [];
        let additionalOpObj: {} = {};
        let additionalOps: AlarmOperator[] = [];

        //determine the number of operators avatars to show
        let opSize: number = 0;
        if (this.operatorCount)
            opSize = (Math.floor((this.operatorDivSize - (68 + this.operatorCount.nativeElement.clientWidth)) / 40)) - 1;
        else {
            opSize = (Math.floor((this.operatorDivSize - 120) / 40)) - 1;
        }

        let alarmOperatorsData: string[] = this.getOperators();

        if (opSize > alarmOperatorsData.length)
            opSize = alarmOperatorsData.length;

        for (let i = 0; i < opSize; i++) {
            let operator: string = alarmOperatorsData[i];
            if (operator) {
                let initials: any[] = operator.match(/\b\w/g) || [];
                initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();

                if (!operatorsObj.hasOwnProperty(operator)) {
                    operatorsObj[operator] = { "Name": operator, "Initials": initials, "More": false, MoreOperators: [] };
                    operators.push({ "Name": operator, "Initials": initials, "More": false, MoreOperators: [] });
                }
            }
        }

        let additionalOpsSize = alarmOperatorsData.length - opSize;

        for (let x = opSize; x < alarmOperatorsData.length; x++) {
            let operator: string = alarmOperatorsData[x];
            let initials: any[] = operator.match(/\b\w/g) || [];
            initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();

            if (!additionalOpObj.hasOwnProperty(operator)) {
                additionalOpObj[operator] = { "Name": operator, "Initials": initials, "More": false, MoreOperators: [] };
                additionalOps.push({ "Name": operator, "Initials": initials, "More": false, MoreOperators: [] });
            }
        }

        let moreText: any[] = [];
        moreText.push('+' + additionalOpsSize.toString());

        if (additionalOpsSize > 0)
            operators.push({ "Name": "See more Operators", "Initials": moreText, "More": true, MoreOperators: additionalOps });

        this.alarmOperatorCount = alarmOperatorsData.length;
        return operators;
    }

    operatorSelected(operatorName: string, moreSelected: boolean): void {
        if (operatorName === 'See more Operators') {
            this.toggleExpandedMoreOperatorView();
        }
        else {
            if (this.dashboardAlarmService.getSelectedOperator() === true) {
                if (operatorName) {
                    let existingName = this.dashboardAlarmService.getOperatorFilter();
                    if (existingName) {
                        if (existingName === operatorName) {
                            //the user selected to turn off the operator filter
                            this.dashboardAlarmService.setOperatorFilter('');
                            this.dashboardAlarmService.setSelectedOperator(false);
                            this.alarmOperatorFilter = '';
                            this.alarmOperatorSelected = false;
                        }
                        else {
                            //the user selected a differ operator to filer on
                            this.dashboardAlarmService.setOperatorFilter(operatorName);
                            this.dashboardAlarmService.setSelectedOperator(true);
                            this.alarmOperatorFilter = operatorName;
                            this.alarmOperatorSelected = true;
                        }
                    }
                    else {
                        //error case - it says a filter is seleced but there is no filter name set
                        //turn the filter off
                        this.dashboardAlarmService.setOperatorFilter('');
                        this.dashboardAlarmService.setSelectedOperator(false);
                        this.alarmOperatorFilter = '';
                        this.alarmOperatorSelected = false;

                    }
                }
                else {
                    //the operator name is empty - turn the filter off
                    this.dashboardAlarmService.setOperatorFilter('');
                    this.dashboardAlarmService.setSelectedOperator(false);
                    this.alarmOperatorFilter = '';
                    this.alarmOperatorSelected = false;
                }
            }
            else {
                //the user chose an operator to filter on
                this.dashboardAlarmService.setOperatorFilter(operatorName);
                this.dashboardAlarmService.setSelectedOperator(true);
                this.alarmOperatorFilter = operatorName;
                this.alarmOperatorSelected = true;
            }

            this.updateFilteredAlarms();
            this.setResultsHeaderAllPriorityLocationCountField();
            this.setResultsHeaderOperatorField();

            if (moreSelected) {
                this.reorderOperatorInitials(operatorName);
                this.toggleExpandedMoreOperatorView();
            }
        }
    }

    reorderOperatorInitials(operatorName: string): any {
        //get the alarm operators
        let operators: AlarmOperator[] = this.alarmOperators;

        //remove the next to last operator in the this.alarmOperators object array 
        //Note: the last operatore is the More Operators object array
        let lastOperator: AlarmOperator = operators.splice(operators.length - 2, 1)[0];

        //get the More Operators object
        let moreOperators: AlarmOperator = operators.filter(o => o.More === true)[0];

        //get the selected more operator
        let selectedMoreOperator: AlarmOperator = moreOperators.MoreOperators.filter(o => o.Name === operatorName)[0];

        //put the selected more operator in at the start of the this.alarmOperator object array
        this.alarmOperators.unshift(selectedMoreOperator);

        //remove the selected more operator from the More Operators array
        moreOperators.MoreOperators.splice(moreOperators.MoreOperators.indexOf(selectedMoreOperator), 1);

        //add the last operator from the this.alarmOperators object to the end of the More Operators array
        moreOperators.MoreOperators.push(lastOperator);
    }

    //////////////////////////////////////////////
    //Locaiton of Interest Methods
    //////////////////////////////////////////////
    public setLocationOfInterest(): void {
        this.getSelectedLocationCount();
        //this.dashboardLOIContent.setLocationOfInterest();
    }

    private getSelectedLocationCount(): void {
        let customers = this.dashboardService.getAllTenantLocations();
        if (customers) {
            let totalSelCount: number = 0;

            for (let cust of customers) {
                //per UX only show locations with P1 and P2 Alarms
                let selectedLoc = (cust.Locations.filter(c => c.Selected === true && (c.Priority === '1' || c.Priority === '2')).length);
                totalSelCount = totalSelCount + selectedLoc;
            }
            this.selectedLocationsCount = totalSelCount;
        }
    }

    //////////////////////////////////////////////
    //Export Methods
    //////////////////////////////////////////////
    exportPDF(): void {
        this.exporting = true;
        this.changeDetectorRef.markForCheck();

        let criteria = {};
        criteria["Priority"] = this.dashboardAlarmService.alarmFilterPrioritySelection;
        criteria["Operator"] = this.dashboardAlarmService.alarmFilterOperatorSelection;
        criteria["Description"] = this.dashboardAlarmService.alarmFilterDescriptionSelection;
        criteria["Status"] = this.dashboardAlarmService.alarmFilterStateSelection;
        criteria["Robot"] = this.dashboardAlarmService.alarmFilterRobotSelection;

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
            Alarms: null,
            Patrols: null,
            Platforms: null,
            //TenantLocations: this.dashboardService.getAllTenantLocations(),
            SelectedLocationIDs: this.dashboardService.getSelectedLocationIDs(),
            SelectedPriorities: [this.alarmPriorityFilter],
            SelectedOperator: this.alarmOperatorFilter,
            SelectedLOI: this.alarmLocationFilter,
            SelectedTimeframe: this.dashboardService.getSelectedTimeframe().toString(),
            ExportStartTime: startTime,
            ExportEndTime: endTime,
            Criteria: criteria,
            CurrentUser: null,
            User: null,
            URL: null,
            ReportType: 'Alarm',
            WebProxyHostname: null,
            WebProxyPortNumber: 0,
            WebProxyUsername: null,
            WebProxyPassword: null,
            WebProxyType: null
        };

        this.httpService.postPdf('/Report/URLToPDF/', reportData, null, true).then((pdfBytes) => {
            if (pdfBytes) {
                console.log('PDF File has been downloaded');
                //var pdfFile = new Blob([pdfBytes], { type: 'application/pdf' });
                let pdfFileUrl = URL.createObjectURL(pdfBytes, { oneTimeOnly: true });

                this.exporting = false;
                this.changeDetectorRef.markForCheck();

                //display in browser - cannot specify the file name
                //window.open(pdfFileUrl, "", "width=973,height=578,resizable=no,fullscreen=false");

                //download it
                let a = document.createElement('a');
                document.body.appendChild(a);
                a.style.display = 'none';
                a.href = pdfFileUrl;
                a.download = 'SmartCommandAlarmReport.pdf';
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

        //set the headerFilteredCountField field
        this.setResultsHeaderFilteredCountField();

        //set the alarmAllPriorityLocationCountField field
        this.setResultsHeaderAllPriorityLocationCountField();

        //set the alarmActiveFilter and alarmTimeframeFilter filters
        this.setResultsHeaderActiveOrTimeframeField();

        //set the alarmOperatorField field
        this.setResultsHeaderOperatorField();

        //set the alarmLocationField field
        this.setResultsHeaderLocationField();
    }

    setResultsHeaderFilteredCountField(): void {
        if (((this.dashboardAlarmService.alarmFilterPrioritySelection) && (this.dashboardAlarmService.alarmFilterPrioritySelection !== 0)) ||
            ((this.dashboardAlarmService.alarmFilterOperatorSelection) && (this.dashboardAlarmService.alarmFilterOperatorSelection !== 'All')) ||
            ((this.dashboardAlarmService.alarmFilterDescriptionSelection) && (this.dashboardAlarmService.alarmFilterDescriptionSelection !== 'All')) ||
            ((this.dashboardAlarmService.alarmFilterStateSelection) && (this.dashboardAlarmService.alarmFilterStateSelection !== 0)) ||
            ((this.dashboardAlarmService.alarmFilterRobotSelection) && (this.dashboardAlarmService.alarmFilterRobotSelection !== 'All'))) {
            let count: number = this.alarms.length;
            //this.headerFilteredCountField = " Filtered";
            this.headerFilteredCountField = " " + count.toString();
        }
        else
            this.headerFilteredCountField = "";
    }

    setResultsHeaderAllPriorityLocationCountField(): void {
        if (this.alarmPriorityFilter > 0) {
            let count: number = 0;
            if (this.alarmResultCount < this.alarms.filter(a => a.Priority === this.alarmPriorityFilter).length)
                count = this.alarmResultCount;
            else
                count = this.alarms.filter(a => a.Priority === this.alarmPriorityFilter).length;

            //this.headerAllPriorityLocationCountField = " (" + count.toString() + ") " +
            //    "P" + this.alarmPriorityFilter.toString();

            //this.headerFilterTotalCount = count.toString();
            this.headerAllPriorityLocationCountField = " P" + this.alarmPriorityFilter.toString();
        }
        else if ((this.alarmLocationFilter) ||
            (((this.dashboardAlarmService.alarmFilterPrioritySelection) && (this.dashboardAlarmService.alarmFilterPrioritySelection !== 0)) ||
                ((this.dashboardAlarmService.alarmFilterOperatorSelection) && (this.dashboardAlarmService.alarmFilterOperatorSelection !== 'All')) ||
                ((this.dashboardAlarmService.alarmFilterDescriptionSelection) && (this.dashboardAlarmService.alarmFilterDescriptionSelection !== 'All')) ||
                ((this.dashboardAlarmService.alarmFilterStateSelection) && (this.dashboardAlarmService.alarmFilterStateSelection !== 0)) ||
                ((this.dashboardAlarmService.alarmFilterRobotSelection) && (this.dashboardAlarmService.alarmFilterRobotSelection !== 'All'))))
            this.headerAllPriorityLocationCountField = "";
        else {
            this.headerAllPriorityLocationCountField = " All ";
        }
    }

    setResultsHeaderActiveOrTimeframeField(): void {
        let timeframe: FilterTimeframe = this.dashboardService.getSelectedTimeframe();
        if (timeframe === FilterTimeframe.Current) {
            this.headerActiveField = "Active";
            this.headerTimeframeField = "";
        }
        else {
            this.headerActiveField = '';
            if (timeframe === FilterTimeframe.Custom) {
                if ((this.dashboardService.customStartDateTime) && (this.dashboardService.customEndDateTime)) {
                    this.headerTimeframeField = "between " + this.formatDate(this.dashboardService.customStartDateTime) + " and " + this.formatDate(this.dashboardService.customEndDateTime);
                }
                else if (this.dashboardService.customStartDateTime) {
                    this.headerTimeframeField = "after " + this.formatDate(this.dashboardService.customStartDateTime);
                }
                else if (this.dashboardService.customEndDateTime) {
                    this.headerTimeframeField = "before " + this.formatDate(this.dashboardService.customEndDateTime);
                }
            }
            else
                this.headerTimeframeField = "over the " + this.dashboardService.getSelectedTimeframeString(timeframe);
        }
    }

    setResultsHeaderOperatorField(): void {
        if (this.alarmOperatorFilter) {
            this.headerOperatorField = " for " + this.alarmOperatorFilter;
            if (this.headerAllPriorityLocationCountField === " All ")
                this.headerAllPriorityLocationCountField = "";
        }
        else
            this.headerOperatorField = "";
    }

    setResultsHeaderLocationField(): void {
        if (this.alarmLocationFilter) {
            this.headerLocationField = " in " + this.alarmLocationFilter.LocationName;
            if (this.headerAllPriorityLocationCountField === " All ")
                this.headerAllPriorityLocationCountField = "";
        }
        else
            this.headerLocationField = "";
    }

    getResultTotalCount(): string {
        let countStr: string = '';

        if ((this.headerAllPriorityLocationCountField !== '' && this.headerAllPriorityLocationCountField !== ' All ') ||
            (this.headerOperatorField !== '') ||
            (this.headerLocationField !== '')) {
            countStr = this.alarms.length.toString();
        }
        else
            countStr = this.headerFilteredCountField;

        return countStr;
    }

    //getSelectedTimeframeString(selTimeFrame: FilterTimeframe): string {
    //    let timeframeStr: string = '';

    //    switch (selTimeFrame) {
    //        case FilterTimeframe.EightHours:
    //            timeframeStr = "Last 8 hours";
    //            break;
    //        case FilterTimeframe.TwelveHours:
    //            timeframeStr = "Last 12 hours";
    //            break;
    //        case FilterTimeframe.TwentyFourHours:
    //            timeframeStr = "Last 24 hours";
    //            break;
    //        case FilterTimeframe.LastWeek:
    //            timeframeStr = "Last Week";
    //            break;
    //        case FilterTimeframe.Custom:
    //            timeframeStr = "";
    //            break;
    //        default:
    //            timeframeStr = "";
    //            break;
    //    }

    //    return timeframeStr;
    //}

    removeSelectedAlarmFilter(filter: string): void {
        switch (filter) {
            case 'AllPriorityLocation':
                //this.alarmPriorityFilter = 0;
                //this.setResultsHeaderAllPriorityLocationCountField();
                this.legendClicked('', this.doughnutChartSelectedDataValue, this.doughnutChartSelectedLegendItemID);
                break;
            case 'Operator':
                this.dashboardAlarmService.setOperatorFilter('');
                this.dashboardAlarmService.setSelectedOperator(false);
                this.alarmOperatorFilter = '';
                this.alarmOperatorSelected = false;
                this.updateFilteredAlarms();
                this.setResultsHeaderAllPriorityLocationCountField();
                this.setResultsHeaderOperatorField();
                break;
            case 'Location':
                this.alarmLocationFilter = null;
                this.updateFilteredAlarms();
                this.setResultsHeaderLocationField();
                break;
            default:
                break;
        }
        this.changeDetectorRef.markForCheck();
    }

    showAlarmFilterCriteria(): void {
        this.dashboardService.showAlarmFilterCriteriaComponent();
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
    updateFilteredAlarms(): void {
        this.alarms = this.alarmOperatorPipe.transform(this.masterAlarms, this.alarmOperatorFilter);
        this.alarms = this.alarmPriorityPipe.transform(this.alarms, this.alarmPriorityFilter);
        this.alarms = this.alarmLOIPipe.transform(this.alarms, this.alarmLocationFilter);
        this.alarmResultCount = this.alarms.length;

        this.alarmMapService.manualZoomMode = true;
        this.alarmMapService.fitMarkers(this.alarms);
        this.changeDetectorRef.markForCheck();

        //return filteredAlarms;
    }

    private determineDisplayItems(): void {
        //determine if the Operator and/or Duration columns should be shwown
        if (this.resultsContainerDivSize >= ResultsSize.Large) {
            this.showOperatorResultsColumn = true;
            this.showDurationsResultsColumn = true;
        }
        else if ((this.resultsContainerDivSize >= ResultsSize.Medium) && (this.resultsContainerDivSize < ResultsSize.Large)) {
            this.showOperatorResultsColumn = true;
            this.showDurationsResultsColumn = false;
        }
        else if ((this.resultsContainerDivSize > ResultsSize.Small) && (this.resultsContainerDivSize < ResultsSize.Medium)) {
            this.showOperatorResultsColumn = false;
            this.showDurationsResultsColumn = false;
        }
        else if (this.resultsContainerDivSize <= ResultsSize.Small) {
            this.showOperatorResultsColumn = false;
            this.showDurationsResultsColumn = false;
        }

        this.changeDetectorRef.markForCheck(); //detectChanges();
    }

    getPlatformStatus(platformID: string): string {
        return this.dashboardPlatformService.getPlatformStatus(platformID);
    }

    getPlatformName(platformID: string): string {
        return this.dashboardPlatformService.getPlatformName(platformID);
    }

    getAttachmentCount(alarm: Alarm): number {
        let count: number = 0;
        if (alarm) {
            //comments
            if (alarm.Comments)
                count = alarm.Comments.length;

            //snapshots
            if (alarm.Snapshots)
                count = count + alarm.Snapshots.length;
        }
        return count;
    }

    getTenant(tenantID: string): Tenant {
        return this.dashboardService.getTentant(tenantID);
    }

    getTenantName(tenantID: string): string {
        let name: string = "";
        let tenant = this.dashboardService.getTentant(tenantID);
        if (tenant)
            name = tenant.CustomerName;
        return name;
    }

    getTenantLocation(tenantID: string, locID: string): Location {
        return this.dashboardService.getLocation(tenantID, locID);
    }

    getTenantLocationName(tenantID: string, locID: string): string {
        let name: string = "";
        let loc = this.dashboardService.getLocation(tenantID, locID);
        if (loc)
            name = loc.Name;
        return name;
    }

    getTenantLocationAddr(tenantID: string, locID: string): string {
        let addr: string = "";
        let loc = this.dashboardService.getLocation(tenantID, locID);
        if (loc)
            addr = loc.City + ", " + loc.State;
        return addr;
    }

    getTenantLocationObj(tenantID: string, locID: string): TenantLocation[] {
        let tlArray: TenantLocation[] = [];
        if (tenantID && locID) {
            let tenant = this.dashboardService.getTentant(tenantID);
            if (tenant) {
                if (tenant.Locations && tenant.Locations.length > 0) {
                    let loc = tenant.Locations.filter(location => location.Id === locID);
                    if (loc.length > 0) {
                        //let newLoc: Location = new Location(loc[0]);
                        let tl: TenantLocation = {
                            ID: tenant.Id,
                            Name: tenant.CustomerName,
                            LocationID: loc[0].Id,
                            LocationName: loc[0].Name,
                            LocationCity: loc[0].City,
                            LocationState: loc[0].State,
                            Priority: loc[0].Priority,
                            PriorityString: loc[0].Priority,
                            PriorityCount: loc[0].Priority
                        }
                        tlArray.push(tl);
                    }
                }
            }
        }
        return tlArray;
    }

    getSelectedLocationIDs(): string[] {
        return this.dashboardService.getSelectedLocationIDs();
    }

    getDateDisplay(alarm: Alarm): string {
        let alarmTime: any = '';
        if (alarm) {
            let aTime: any;
            switch (alarm.State) {
                case 1:
                    aTime = alarm.ReportedTime;
                    break;
                case 2:
                    aTime = alarm.Acknowledged.Timestamp;
                    break;
                case 3:
                    aTime = alarm.Cleared.Timestamp;
                    break;
                case 4:
                    aTime = alarm.Dismissed.Timestamp;
                    break;
                default:
                    break;
            }

            alarmTime = this.dashboardAlarmService.getDateDisplay(aTime, false);
        }
        return alarmTime;
    }

    getAlarmTime(alarm: Alarm): any {
        let result: string = this.dashboardAlarmService.getAlarmTime(alarm);
        if (result) {
            let s: string[] = result.split(" ");
            let r: string = "<span style='font-size: 18px;'>" + s[0] + "</span>";
            r = r + "<span style='font-size: 13px; margin-left: 5px;'>" + s[1] + "</span>";
            return this.sanitizer.bypassSecurityTrustHtml(r);
        }
        else
            return '';
    }

    getAlarmReportedTime(reportedTime: string): any {
        let result: string = this.dashboardAlarmService.getDateDisplay(reportedTime);
        if (result) {
            let s: string[] = result.split("-");
            let r: string = "<span style='font-size: 16px; position: relative;float: left;'>" + s[0] + "</span>";
            r = r + "<span style='font-size: 13px; position: relative;float: left;'>" + s[1] + "</span>";
            return this.sanitizer.bypassSecurityTrustHtml(r);
        }
        else
            return '';
    }

    getUserInitials(username: string): string {
        return this.dashboardAlarmService.convertUsernameToInitials(username);
    }

    selectAlarm(alarm: Alarm): void {
        if (alarm.Selected) {
            this.dashboardAlarmService.deSelectAlarm(alarm.Id, false, true);
        } else {
            if (this.dashboardAlarmService.selectedAlarm !== null)
                this.dashboardAlarmService.deSelectAlarm(this.dashboardAlarmService.selectedAlarm.Id, false, true);
            this.dashboardAlarmService.selectAlarm(alarm.Id, false, false, alarm);
        }
    }

    deselectAlarm(): void {
        if (this.dashboardAlarmService.selectedAlarm !== null)
            this.dashboardAlarmService.deSelectAlarm(this.dashboardAlarmService.selectedAlarm.Id, false, true);
    }

    getSelectedAlarmID(): string {
        if (this.dashboardAlarmService.selectedAlarm !== null) {
            if (this.alarms.length > 0)
                return this.dashboardAlarmService.selectedAlarm.Id;
        }
        return '';
    }

    navigateToAlarm(alarm: Alarm): void {
        if (this.dashboardService.getSelectedTimeframe() === this.filterTimeframe.Current) {
            this.navigationService.navigate('/MapView/Alarms', alarm.Id);
        }
    }

    zoomTo(alarm: Alarm): void {
        this.alarmMapService.zoomToAlarmMarker(this.alarmMapService.getAlarmMarkerId(alarm));
        this.selectAlarm(alarm);
    }
}