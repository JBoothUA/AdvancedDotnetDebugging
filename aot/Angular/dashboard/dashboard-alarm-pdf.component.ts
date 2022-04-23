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
import { BaseChartDirective } from 'ng2-charts';
import * as moment from 'moment';

import { DashboardPDFService } from './dashboard-pdf.service';

import { Tenant } from '../shared/tenant.class';
import { Location } from '../shared/location.class';
import { FilterTimeframe, TenantLocation, AlarmOperator } from './dashboard';
//import { DashboardSlider } from './dashboard-slider.component';

import { Alarm } from '../alarms/alarm.class';
import { AlarmOperatorPipe } from './alarm-operator.pipe';
import { AlarmPriorityPipe } from './alarm-priority.pipe';
import { AlarmLOIPipe } from './alarm-loi.pipe';

import { Platform } from '../platforms/platform.class';

enum ResultsSize {
    Small = 706,
    Medium = 871,
    Large = 976,
    None = 0
}

@Component({
    selector: 'dashboard-alarm-pdf',
    templateUrl: 'dashboard-alarm-pdf.component.html',
    styleUrls: ['dashboard-alarm-pdf.component.css', 'dashboard.component.css'],
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
            transition('in <=> out', animate('400ms ease-in-out')),
            transition('out <=> in', animate('600ms ease-out'))
        ]
        )
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class DashboardAlarmPDF {

    //Class Variables
    private operatorDivSize: number = 250;
    private resultsContainerDivSize: number = 706;
    private expandedResult: Map<number, string> = new Map<number, string>();

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
        animation: false,
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

    ////location props
    selectedLocationsCount: number = 0;
    selectedLocationIDs: string[] = [];

    //operator props
    alarmOperators: AlarmOperator[]; //{}[] = [];
    alarmOperatorCount: number = 0;

    //header props
    headerFilteredCountField: string = '';
    headerFilterTotalCount: string = '';
    headerAllPriorityLocationCountField: string = '';
    headerActiveField: string = '';
    headerOperatorField: string = '';
    headerTimeframeField: string = '';
    headerLocationField: string = '';

    ////alarm results props
    moreOperatorExpanded: boolean = false;
    filterTimeframe: typeof FilterTimeframe = FilterTimeframe;
    showOperatorResultsColumn: boolean = true;
    showDurationsResultsColumn: boolean = true;

    ////filters
    alarmOperatorFilter: string = '';
    alarmLocationFilter: TenantLocation = null;
    alarmPriorityFilter: number = 0;
    alarmResultCount: number = 0;

    ////ViewChilds
    @ViewChild('alarmReportOperatorCountDiv') operatorCount: ElementRef;
    @ViewChild('pdfAlarmReportResultsContentDiv') resultsContentDiv: ElementRef;
    @ViewChild(BaseChartDirective) chartComponent: BaseChartDirective;
    @ViewChild('pdfAlarmReportResultsContainer') alarmResultsContainer: ElementRef;

    ////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    constructor(public dashboardPDFService: DashboardPDFService,
        private alarmOperatorPipe: AlarmOperatorPipe,
        private alarmPriorityPipe: AlarmPriorityPipe,
        private alarmLOIPipe: AlarmLOIPipe,
        private sanitizer: DomSanitizer,
        private changeDetectorRef: ChangeDetectorRef) {

        console.log("inside constructor");

        //setup the service
        //dashboardPDFService.alarms = reportAlarms;
        //dashboardPDFService.platforms = reportPlatforms;
        //dashboardPDFService.selectedTenants = reportTenenatLocations;
    }

    public ngOnInit(): void {
        this.setChartData();

        //get the newly queried alarm data
        this.masterAlarms = this.dashboardPDFService.getAlarms();

        //reset filters
        this.alarmOperatorFilter = '';
        this.alarmLocationFilter = null;
        this.alarmPriorityFilter = 0;

        //get filtered data
        this.updateFilteredAlarms();
    }

    public ngAfterViewInit(): void {
        console.log("inside after veiw init");

        //this.resultsContentDivSize = this.resultsContentDiv.nativeElement.clientWidth;
        //this.alarmResultsContainer.nativeElement.scrollTop = 0;
        this.updateData();
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
        if (this.expandedResult[alarmID] === 'out')
            this.expandedResult[alarmID] = 'in';
        else
            this.expandedResult[alarmID] = 'out';
    }

    /////////////////////////////////////////////
    ////Notification Methods
    /////////////////////////////////////////////
    updateData(): void {
        console.log("inside updateData");

        ////get the selected location ids
        //this.selectedLocationIDs = this.dashboardPDFService.selectedLocations;

        //get the newly queried alarm data
        //this.masterAlarms = this.dashboardPDFService.getAlarms();

        //reset filters
        this.alarmOperatorFilter = '';
        this.alarmLocationFilter = null;
        this.alarmPriorityFilter = 0;

        ////get filtered data
        //this.updateFilteredAlarms();

        //get the operators for the new alarms
        this.alarmOperators = this.getOperatorInitials();

        //update the chart data with the new alarms
        this.updateChartData();

        //set the quick filter data
        //select the alarm priority
        if (reportSelectedPriorities != null && reportSelectedPriorities[0] != null && reportSelectedPriorities[0] > 0) {
            let count: number = this.alarms.filter(a => a.Priority === reportSelectedPriorities[0]).length;
            this.legendClicked('', count, (reportSelectedPriorities[0] - 1).toString());
        }

        //select the operator
        this.alarmOperatorFilter = reportSelectedOperator;

        //select the location of interest
        this.alarmLocationFilter = reportSelectedLOI;

        //get filtered data
        this.updateFilteredAlarms();

        //update the Alarm Results Header section
        this.updateResultsHeader();

        console.log("headerAllPriorityLocationCountField = " + this.headerAllPriorityLocationCountField);

        console.log("before mark for check");
        this.changeDetectorRef.detectChanges();

        console.log("before evoPdfConverter");
        if (typeof evoPdfConverter != "undefined") {
            console.log("evoPdfConverter is defined");
            evoPdfConverter.startConversion();
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
            chartLabel[i] = this.dashboardPDFService.getAlarmPriorityDefn(index.toString()) +
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
            labels[i] = this.dashboardPDFService.getAlarmPriorityDefn(index.toString()) +
                " (P" + index.toString() + ") - " + ap.toString();
            this.showLegendData[i] = 'show';
            chart.data.datasets[0].backgroundColor[i] = this.doughnutChartColorsDefault[0].backgroundColor[i];
        }

        chart.update();
        this.doughnutChartTotal = this.alarms.length;
        this.doghnutChartLegendData = this.chartComponent.chart.generateLegend();
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

            if (chart.data.datasets[0].data[index] != 0) {
                let selectedPriorityFilter: number = (this.alarmPriorityFilter == 0) ? index : (this.alarmPriorityFilter - 1);

                if (index != selectedPriorityFilter) {
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
                        if (i != index) {
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
                if (typeof (unique[this.alarms[i].UserId]) == "undefined") {
                    alarmOperatorsData.push(this.alarms[i].UserId);
                }
                unique[this.alarms[i].UserId] = 0;
            }

            if (this.alarms[i].Created) {
                if (this.alarms[i].Created.UserId != null) {
                    if (typeof (unique[this.alarms[i].Created.UserId]) == "undefined") {
                        alarmOperatorsData.push(this.alarms[i].Created.UserId);
                    }
                    unique[this.alarms[i].Created.UserId] = 0;
                }
            }

            if (this.alarms[i].Acknowledged) {
                if (this.alarms[i].Acknowledged.UserId != null) {
                    if (typeof (unique[this.alarms[i].Acknowledged.UserId]) == "undefined") {
                        alarmOperatorsData.push(this.alarms[i].Acknowledged.UserId);
                    }
                    unique[this.alarms[i].Acknowledged.UserId] = 0;
                }
            }

            if (this.alarms[i].Cleared) {
                if (this.alarms[i].Cleared.UserId != null) {
                    if (typeof (unique[this.alarms[i].Cleared.UserId]) == "undefined") {
                        alarmOperatorsData.push(this.alarms[i].Cleared.UserId);
                    }
                    unique[this.alarms[i].Cleared.UserId] = 0;
                }
            }

            if (this.alarms[i].Dismissed) {
                if (this.alarms[i].Dismissed.UserId != null) {
                    if (typeof (unique[this.alarms[i].Dismissed.UserId]) == "undefined") {
                        alarmOperatorsData.push(this.alarms[i].Dismissed.UserId);
                    }
                    unique[this.alarms[i].Dismissed.UserId] = 0;
                }
            }

            if (this.alarms[i].Comments) {
                for (let x in this.alarms[i].Comments) {
                    if (this.alarms[i].Comments[x].UserId != null) {
                        if (typeof (unique[this.alarms[i].Comments[x].UserId]) == "undefined") {
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
        let operators: {}[] = [];
        let additionalOpObj: {} = {};
        let additionalOps: {}[] = [];

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
            let initials: any[] = operator.match(/\b\w/g) || [];
            initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();

            if (!operatorsObj.hasOwnProperty(operator)) {
                operatorsObj[operator] = { "Name": operator, "Initials": initials, "More": false, MoreOperators: [] };
                operators.push({ "Name": operator, "Initials": initials, "More": false, MoreOperators: [] });
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
            operators.push({ "Name": "See more Operators", "Initials": "+" + additionalOpsSize.toString(), "More": true, MoreOperators: additionalOps });

        this.alarmOperatorCount = alarmOperatorsData.length;
        return operators;
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
        if (((this.dashboardPDFService.alarmFilterPrioritySelection) && (this.dashboardPDFService.alarmFilterPrioritySelection !== 0)) ||
            ((this.dashboardPDFService.alarmFilterOperatorSelection) && (this.dashboardPDFService.alarmFilterOperatorSelection !== 'All')) ||
            ((this.dashboardPDFService.alarmFilterDescriptionSelection) && (this.dashboardPDFService.alarmFilterDescriptionSelection !== 'All')) ||
            ((this.dashboardPDFService.alarmFilterStateSelection) && (this.dashboardPDFService.alarmFilterStateSelection !== 0)) ||
            ((this.dashboardPDFService.alarmFilterRobotSelection) && (this.dashboardPDFService.alarmFilterRobotSelection !== 'All'))) {
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
                (((this.dashboardPDFService.alarmFilterPrioritySelection) && (this.dashboardPDFService.alarmFilterPrioritySelection !== 0)) ||
                ((this.dashboardPDFService.alarmFilterOperatorSelection) && (this.dashboardPDFService.alarmFilterOperatorSelection !== 'All')) ||
                ((this.dashboardPDFService.alarmFilterDescriptionSelection) && (this.dashboardPDFService.alarmFilterDescriptionSelection !== 'All')) ||
                ((this.dashboardPDFService.alarmFilterStateSelection) && (this.dashboardPDFService.alarmFilterStateSelection !== 0)) ||
                ((this.dashboardPDFService.alarmFilterRobotSelection) && (this.dashboardPDFService.alarmFilterRobotSelection !== 'All'))))
            this.headerAllPriorityLocationCountField = "";
        else
            this.headerAllPriorityLocationCountField = " All ";
    }

    setResultsHeaderActiveOrTimeframeField(): void {
        let timeframe: FilterTimeframe = this.dashboardPDFService.getSelectedTimeframe();
        if (timeframe === FilterTimeframe.Current) {
            this.headerActiveField = "Active";
            this.headerTimeframeField = "";
        }
        else {
            this.headerActiveField = '';
            if (timeframe === FilterTimeframe.Custom) {
                if ((this.dashboardPDFService.customStartDateTime) && (this.dashboardPDFService.customEndDateTime)) {
                    this.headerTimeframeField = "between " + this.formatDate(this.dashboardPDFService.customStartDateTime) + " and " + this.formatDate(this.dashboardPDFService.customEndDateTime);
                }
                else if (this.dashboardPDFService.customStartDateTime) {
                    this.headerTimeframeField = "after " + this.formatDate(this.dashboardPDFService.customStartDateTime)
                }
                else if (this.dashboardPDFService.customEndDateTime) {
                    this.headerTimeframeField = "before " + this.formatDate(this.dashboardPDFService.customEndDateTime)
                }
            }
            else
                this.headerTimeframeField = "over the " + this.dashboardPDFService.getSelectedTimeframeString(timeframe);
        }
    }

    setResultsHeaderOperatorField(): void {
        if (this.alarmOperatorFilter)
        {
            this.headerOperatorField = " for " + this.alarmOperatorFilter;
            if (this.headerAllPriorityLocationCountField === " All ")
                this.headerAllPriorityLocationCountField = "";
        }
        else
            this.headerOperatorField = "";
    }

    setResultsHeaderLocationField(): void {
        if (this.alarmLocationFilter)
        {
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

   getTimeframeRangeString(): string {
        let rangeStr: string = '';
        let timeframe: FilterTimeframe = this.dashboardPDFService.getSelectedTimeframe();
        let startTime: string = (this.dashboardPDFService.customStartDateTime) ? this.dashboardPDFService.customStartDateTime.toLocaleTimeString() : null;
        let endTime: string = (this.dashboardPDFService.customEndDateTime) ? this.dashboardPDFService.customEndDateTime.toLocaleTimeString() : null;

        switch (timeframe) {
            case FilterTimeframe.Current:
                rangeStr = startTime + ", " + this.formatDate(this.dashboardPDFService.customStartDateTime);
                break;
            case FilterTimeframe.EightHours:
            case FilterTimeframe.TwelveHours:
            case FilterTimeframe.TwentyFourHours:
            case FilterTimeframe.LastWeek:
                rangeStr = startTime + " - " + endTime + ", " + this.formatDate(this.dashboardPDFService.customStartDateTime);
                break;
            case FilterTimeframe.Custom:
                if ((this.dashboardPDFService.customStartDateTime) && (this.dashboardPDFService.customEndDateTime)){
                    rangeStr = this.formatDate(this.dashboardPDFService.customStartDateTime) + " " + startTime + " - " + this.formatDate(this.dashboardPDFService.customEndDateTime) + " " + endTime;
                }
                else if (this.dashboardPDFService.customStartDateTime) {
                    //rangeStr = "After " + startTime + ", " + this.formatDate(this.dashboardPDFService.customStartDateTime);

                    //end time is not set to it is a range of startime to current time
                    //set end time to current time
                    let custDate = new Date();
                    endTime = custDate.toLocaleTimeString();
                    rangeStr = this.formatDate(this.dashboardPDFService.customStartDateTime) + " " + startTime + " - " + this.formatDate(custDate) + " " + endTime;
                }
                else if (this.dashboardPDFService.customEndDateTime) {
                    rangeStr = "Before " + endTime + ", " + this.formatDate(this.dashboardPDFService.customEndDateTime);
                }
                break;
            default:
                rangeStr = "";
                break;
        }

        return rangeStr;
    }

    formatDate(date: Date): string {
        let dateStr: string = '';
        if (date)
        {
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
    }

    //private determineDisplayItems(): void {
    //    //determine if the Operator and/or Duration columns should be shwown
    //    if (this.resultsContainerDivSize >= ResultsSize.Large) {
    //        this.showOperatorResultsColumn = true;
    //        this.showDurationsResultsColumn = true;
    //    }
    //    else if ((this.resultsContainerDivSize >= ResultsSize.Medium) && (this.resultsContainerDivSize < ResultsSize.Large)) {
    //        this.showOperatorResultsColumn = true;
    //        this.showDurationsResultsColumn = false;
    //    }
    //    else if ((this.resultsContainerDivSize > ResultsSize.Small) && (this.resultsContainerDivSize < ResultsSize.Medium)) {
    //        this.showOperatorResultsColumn = false;
    //        this.showDurationsResultsColumn = false;
    //    }
    //    else if (this.resultsContainerDivSize <= ResultsSize.Small) {
    //        this.showOperatorResultsColumn = false;
    //        this.showDurationsResultsColumn = false;
    //    }

    //    this.changeDetectorRef.markForCheck(); //detectChanges();
    //}

    getPlatformStatus(platformID: string): string {
        let status: string = "";
        if (platformID) {
            if (this.dashboardPDFService.platforms) {
                let p = this.dashboardPDFService.platforms.filter(p => p.id === platformID);
                if (p) {
                    if ((p[0]) && (p[0].State))
                        status = this.dashboardPDFService.getPlatformStatusClass(p[0]);
                }
            }
        }
        return status;
    }

    getPlatformName(platformID: string): string {
        return this.dashboardPDFService.getPlatformName(platformID);
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

    getTenantName(tenantID: string): string {
        let name: string = "";
        let tenant = this.dashboardPDFService.getTenant(tenantID);
        if (tenant)
            name = tenant.CustomerName;
        return name;
    }

    getTenantLocation(tenantID: string, locID: string): Location {
        return this.dashboardPDFService.getLocation(tenantID, locID);
    }

    getTenantLocationName(tenantID: string, locID: string): string {
        let name: string = "";
        let loc = this.dashboardPDFService.getLocation(tenantID, locID);
        if (loc)
            name = loc.Name;
        return name;
    }

    getTenantLocationAddr(tenantID: string, locID: string): string {
        let addr: string = "";
        let loc = this.dashboardPDFService.getLocation(tenantID, locID);
        if (loc)
            addr = loc.City + ", " + loc.State;
        return addr;
    }

    getTenantLocationObj(tenantID: string, locID: string): TenantLocation[] {
        let tlArray: TenantLocation[] = [];
        if (tenantID && locID) {
            let tenant = this.dashboardPDFService.getTenant(tenantID);
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

            alarmTime = this.dashboardPDFService.getDateDisplay(aTime, false);
        }
        return alarmTime;
    }

    getAlarmTime(alarm: Alarm): any {
        let result: string = this.dashboardPDFService.getAlarmTime(alarm);
        if (result) {
            let s: string[] = result.split(" ");
            let r: string = "<span style='font-size: 18px;'>" + s[0] + "</span>";
            r = r + "<span style='font-size: 13px; margin-left= 5px;'>" + s[1] + "</span>";
            return this.sanitizer.bypassSecurityTrustHtml(r);
        }
        else
            return '';
    }

    getAlarmReportedTime(reportedTime: string): any {
        let result: string = this.dashboardPDFService.getDateDisplay(reportedTime);
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
        return this.dashboardPDFService.convertUsernameToInitials(username);
    }

    //////////////////////////////////////////////
    //Helper Methods
    //////////////////////////////////////////////

}
