var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild, ElementRef, trigger, state, transition, style, animate, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardPDFService } from './dashboard-pdf.service';
import { FilterTimeframe } from './dashboard';
import { AlarmOperatorPipe } from './alarm-operator.pipe';
import { AlarmPriorityPipe } from './alarm-priority.pipe';
import { AlarmLOIPipe } from './alarm-loi.pipe';
var ResultsSize;
(function (ResultsSize) {
    ResultsSize[ResultsSize["Small"] = 706] = "Small";
    ResultsSize[ResultsSize["Medium"] = 871] = "Medium";
    ResultsSize[ResultsSize["Large"] = 976] = "Large";
    ResultsSize[ResultsSize["None"] = 0] = "None";
})(ResultsSize || (ResultsSize = {}));
var DashboardAlarmPDF = /** @class */ (function () {
    ////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    function DashboardAlarmPDF(dashboardPDFService, alarmOperatorPipe, alarmPriorityPipe, alarmLOIPipe, sanitizer, changeDetectorRef) {
        this.dashboardPDFService = dashboardPDFService;
        this.alarmOperatorPipe = alarmOperatorPipe;
        this.alarmPriorityPipe = alarmPriorityPipe;
        this.alarmLOIPipe = alarmLOIPipe;
        this.sanitizer = sanitizer;
        this.changeDetectorRef = changeDetectorRef;
        //Class Variables
        this.operatorDivSize = 250;
        this.resultsContainerDivSize = 706;
        this.expandedResult = new Map();
        //alarm props
        this.alarms = [];
        this.masterAlarms = [];
        //chart props
        this.doughnutChartLabels = []; //['Critical (P1) - 0', 'High (P2) - 3', 'Medium (P3) - 12', 'Low (P4) - 19'];
        this.doughnutChartTotal = 0;
        this.doughnutChartColors = [{
                backgroundColor: ["#D62329", "#DB7828", "#F3B518", "#27BBA1"]
            }];
        this.doughnutChartColorsDefault = [{
                backgroundColor: ["#D62329", "#DB7828", "#F3B518", "#27BBA1"]
            }];
        this.doughnutChartColorsOpacity = [{
                backgroundColor: [
                    "rgba(214,35,41,0.3)",
                    "rgba(219,120,40,0.3)",
                    "rgba(243,181,24,0.3)",
                    "rgba(39,187,161,0.3)"
                ]
            }];
        this.doughnutChartType = 'doughnut';
        this.doughnutChartOptions = {
            legendCallback: this.getLegendCallback,
            cutoutPercentage: 70,
            animation: false,
            elements: { arc: { borderWidth: 0 } },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        //get the concerned dataset
                        var dataset = data.datasets[tooltipItem.datasetIndex];
                        var currentValue = dataset.data[tooltipItem.index];
                        return currentValue;
                    }
                },
                displayColors: false,
                position: 'nearest',
                mode: 'point',
                enabled: false
            }
        };
        this.showLegendData = new Map();
        this.doughnutChartSelectedDataValue = -1;
        this.doughnutChartSelectedLegendItemID = '-1';
        ////location props
        this.selectedLocationsCount = 0;
        this.selectedLocationIDs = [];
        this.alarmOperatorCount = 0;
        //header props
        this.headerFilteredCountField = '';
        this.headerFilterTotalCount = '';
        this.headerAllPriorityLocationCountField = '';
        this.headerActiveField = '';
        this.headerOperatorField = '';
        this.headerTimeframeField = '';
        this.headerLocationField = '';
        ////alarm results props
        this.moreOperatorExpanded = false;
        this.filterTimeframe = FilterTimeframe;
        this.showOperatorResultsColumn = true;
        this.showDurationsResultsColumn = true;
        ////filters
        this.alarmOperatorFilter = '';
        this.alarmLocationFilter = null;
        this.alarmPriorityFilter = 0;
        this.alarmResultCount = 0;
        console.log("inside constructor");
        //setup the service
        //dashboardPDFService.alarms = reportAlarms;
        //dashboardPDFService.platforms = reportPlatforms;
        //dashboardPDFService.selectedTenants = reportTenenatLocations;
    }
    DashboardAlarmPDF.prototype.ngOnInit = function () {
        this.setChartData();
        //get the newly queried alarm data
        this.masterAlarms = this.dashboardPDFService.getAlarms();
        //reset filters
        this.alarmOperatorFilter = '';
        this.alarmLocationFilter = null;
        this.alarmPriorityFilter = 0;
        //get filtered data
        this.updateFilteredAlarms();
    };
    DashboardAlarmPDF.prototype.ngAfterViewInit = function () {
        console.log("inside after veiw init");
        //this.resultsContentDivSize = this.resultsContentDiv.nativeElement.clientWidth;
        //this.alarmResultsContainer.nativeElement.scrollTop = 0;
        this.updateData();
    };
    DashboardAlarmPDF.prototype.expandedMoreOperatorViewState = function () {
        if (this.moreOperatorExpanded) {
            return 'out';
        }
        return 'in';
    };
    DashboardAlarmPDF.prototype.toggleExpandedMoreOperatorView = function () {
        event.stopPropagation();
        this.moreOperatorExpanded = !this.moreOperatorExpanded;
    };
    DashboardAlarmPDF.prototype.expandedResultsViewState = function (alarmID) {
        if (!this.expandedResult[alarmID])
            this.expandedResult[alarmID] = 'in';
        return this.expandedResult[alarmID];
    };
    DashboardAlarmPDF.prototype.toggleExpandedResultsView = function (alarmID) {
        event.stopPropagation();
        if (this.expandedResult[alarmID] === 'out')
            this.expandedResult[alarmID] = 'in';
        else
            this.expandedResult[alarmID] = 'out';
    };
    /////////////////////////////////////////////
    ////Notification Methods
    /////////////////////////////////////////////
    DashboardAlarmPDF.prototype.updateData = function () {
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
            var count = this.alarms.filter(function (a) { return a.Priority === reportSelectedPriorities[0]; }).length;
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
    };
    ///////////////////////////////////////////
    //Chart Methods
    ///////////////////////////////////////////
    DashboardAlarmPDF.prototype.setChartData = function () {
        var ap = 0;
        var index = 0;
        var chartData = [];
        var chartLabel = [];
        for (var i = 0; i < 4; ++i) {
            index = i + 1;
            ap = this.alarms.filter(function (a) { return a.Priority === index; }).length;
            chartData[i] = ap;
            chartLabel[i] = this.dashboardPDFService.getAlarmPriorityDefn(index.toString()) +
                " (P" + index.toString() + ") - " + ap.toString();
        }
        this.doughnutChartData = chartData;
        this.doughnutChartLabels = chartLabel;
        this.doughnutChartTotal = this.alarms.length;
    };
    DashboardAlarmPDF.prototype.updateChartData = function () {
        var chart = this.chartComponent.chart;
        var data = chart.data;
        var datasets = data.datasets;
        var labels = data.labels;
        var ap = 0;
        var index = 0;
        for (var i = 0; i < datasets[0].data.length; ++i) {
            index = i + 1;
            ap = this.alarms.filter(function (a) { return a.Priority === index; }).length;
            datasets[0].data[i] = ap;
            labels[i] = this.dashboardPDFService.getAlarmPriorityDefn(index.toString()) +
                " (P" + index.toString() + ") - " + ap.toString();
            this.showLegendData[i] = 'show';
            chart.data.datasets[0].backgroundColor[i] = this.doughnutChartColorsDefault[0].backgroundColor[i];
        }
        chart.update();
        this.doughnutChartTotal = this.alarms.length;
        this.doghnutChartLegendData = this.chartComponent.chart.generateLegend();
    };
    DashboardAlarmPDF.prototype.getLegendCallback = function (chart) {
        var legendData = [];
        if (chart) {
            var data = chart.data;
            var datasets = data.datasets;
            var labels = data.labels;
            if (datasets.length) {
                var priority = "";
                var empty = false;
                for (var i = 0; i < datasets[0].data.length; ++i) {
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
    };
    DashboardAlarmPDF.prototype.chartClicked = function (e) {
        console.log(e);
    };
    DashboardAlarmPDF.prototype.legendClicked = function (e, dataValue, legendItemID) {
        if (dataValue >= 0) {
            var chart = this.chartComponent.chart;
            var index = this.chartComponent.chart.legend.legendItems[legendItemID].index;
            if (chart.data.datasets[0].data[index] != 0) {
                var selectedPriorityFilter = (this.alarmPriorityFilter == 0) ? index : (this.alarmPriorityFilter - 1);
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
                    for (var i = 0; i < chart.data.datasets[0].data.length; i++) {
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
    };
    DashboardAlarmPDF.prototype.getDoughnutLegendViewState = function (legendItemID) {
        if (!this.showLegendData[legendItemID])
            this.showLegendData[legendItemID] = 'show';
        return this.showLegendData[legendItemID];
    };
    //////////////////////////////////////////////
    //Operator Methods
    //////////////////////////////////////////////
    DashboardAlarmPDF.prototype.getOperators = function () {
        var alarmOperatorsData = [];
        var unique = {};
        //walk high level 
        for (var i in this.alarms) {
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
                for (var x in this.alarms[i].Comments) {
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
    };
    DashboardAlarmPDF.prototype.getOperatorInitials = function () {
        var operatorsObj = {};
        var operators = [];
        var additionalOpObj = {};
        var additionalOps = [];
        //determine the number of operators avatars to show
        var opSize = 0;
        if (this.operatorCount)
            opSize = (Math.floor((this.operatorDivSize - (68 + this.operatorCount.nativeElement.clientWidth)) / 40)) - 1;
        else {
            opSize = (Math.floor((this.operatorDivSize - 120) / 40)) - 1;
        }
        var alarmOperatorsData = this.getOperators();
        if (opSize > alarmOperatorsData.length)
            opSize = alarmOperatorsData.length;
        for (var i = 0; i < opSize; i++) {
            var operator = alarmOperatorsData[i];
            var initials = operator.match(/\b\w/g) || [];
            initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
            if (!operatorsObj.hasOwnProperty(operator)) {
                operatorsObj[operator] = { "Name": operator, "Initials": initials, "More": false, MoreOperators: [] };
                operators.push({ "Name": operator, "Initials": initials, "More": false, MoreOperators: [] });
            }
        }
        var additionalOpsSize = alarmOperatorsData.length - opSize;
        for (var x = opSize; x < alarmOperatorsData.length; x++) {
            var operator = alarmOperatorsData[x];
            var initials = operator.match(/\b\w/g) || [];
            initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
            if (!additionalOpObj.hasOwnProperty(operator)) {
                additionalOpObj[operator] = { "Name": operator, "Initials": initials, "More": false, MoreOperators: [] };
                additionalOps.push({ "Name": operator, "Initials": initials, "More": false, MoreOperators: [] });
            }
        }
        var moreText = [];
        moreText.push('+' + additionalOpsSize.toString());
        if (additionalOpsSize > 0)
            operators.push({ "Name": "See more Operators", "Initials": "+" + additionalOpsSize.toString(), "More": true, MoreOperators: additionalOps });
        this.alarmOperatorCount = alarmOperatorsData.length;
        return operators;
    };
    //////////////////////////////////////////////
    //Results Header Methods
    //////////////////////////////////////////////
    DashboardAlarmPDF.prototype.updateResultsHeader = function () {
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
    };
    DashboardAlarmPDF.prototype.setResultsHeaderFilteredCountField = function () {
        if (((this.dashboardPDFService.alarmFilterPrioritySelection) && (this.dashboardPDFService.alarmFilterPrioritySelection !== 0)) ||
            ((this.dashboardPDFService.alarmFilterOperatorSelection) && (this.dashboardPDFService.alarmFilterOperatorSelection !== 'All')) ||
            ((this.dashboardPDFService.alarmFilterDescriptionSelection) && (this.dashboardPDFService.alarmFilterDescriptionSelection !== 'All')) ||
            ((this.dashboardPDFService.alarmFilterStateSelection) && (this.dashboardPDFService.alarmFilterStateSelection !== 0)) ||
            ((this.dashboardPDFService.alarmFilterRobotSelection) && (this.dashboardPDFService.alarmFilterRobotSelection !== 'All'))) {
            var count = this.alarms.length;
            //this.headerFilteredCountField = " Filtered";
            this.headerFilteredCountField = " " + count.toString();
        }
        else
            this.headerFilteredCountField = "";
    };
    DashboardAlarmPDF.prototype.setResultsHeaderAllPriorityLocationCountField = function () {
        var _this = this;
        if (this.alarmPriorityFilter > 0) {
            var count = 0;
            if (this.alarmResultCount < this.alarms.filter(function (a) { return a.Priority === _this.alarmPriorityFilter; }).length)
                count = this.alarmResultCount;
            else
                count = this.alarms.filter(function (a) { return a.Priority === _this.alarmPriorityFilter; }).length;
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
    };
    DashboardAlarmPDF.prototype.setResultsHeaderActiveOrTimeframeField = function () {
        var timeframe = this.dashboardPDFService.getSelectedTimeframe();
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
                    this.headerTimeframeField = "after " + this.formatDate(this.dashboardPDFService.customStartDateTime);
                }
                else if (this.dashboardPDFService.customEndDateTime) {
                    this.headerTimeframeField = "before " + this.formatDate(this.dashboardPDFService.customEndDateTime);
                }
            }
            else
                this.headerTimeframeField = "over the " + this.dashboardPDFService.getSelectedTimeframeString(timeframe);
        }
    };
    DashboardAlarmPDF.prototype.setResultsHeaderOperatorField = function () {
        if (this.alarmOperatorFilter) {
            this.headerOperatorField = " for " + this.alarmOperatorFilter;
            if (this.headerAllPriorityLocationCountField === " All ")
                this.headerAllPriorityLocationCountField = "";
        }
        else
            this.headerOperatorField = "";
    };
    DashboardAlarmPDF.prototype.setResultsHeaderLocationField = function () {
        if (this.alarmLocationFilter) {
            this.headerLocationField = " in " + this.alarmLocationFilter.LocationName;
            if (this.headerAllPriorityLocationCountField === " All ")
                this.headerAllPriorityLocationCountField = "";
        }
        else
            this.headerLocationField = "";
    };
    DashboardAlarmPDF.prototype.getResultTotalCount = function () {
        var countStr = '';
        if ((this.headerAllPriorityLocationCountField !== '' && this.headerAllPriorityLocationCountField !== ' All ') ||
            (this.headerOperatorField !== '') ||
            (this.headerLocationField !== '')) {
            countStr = this.alarms.length.toString();
        }
        else
            countStr = this.headerFilteredCountField;
        return countStr;
    };
    DashboardAlarmPDF.prototype.getTimeframeRangeString = function () {
        var rangeStr = '';
        var timeframe = this.dashboardPDFService.getSelectedTimeframe();
        var startTime = (this.dashboardPDFService.customStartDateTime) ? this.dashboardPDFService.customStartDateTime.toLocaleTimeString() : null;
        var endTime = (this.dashboardPDFService.customEndDateTime) ? this.dashboardPDFService.customEndDateTime.toLocaleTimeString() : null;
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
                if ((this.dashboardPDFService.customStartDateTime) && (this.dashboardPDFService.customEndDateTime)) {
                    rangeStr = this.formatDate(this.dashboardPDFService.customStartDateTime) + " " + startTime + " - " + this.formatDate(this.dashboardPDFService.customEndDateTime) + " " + endTime;
                }
                else if (this.dashboardPDFService.customStartDateTime) {
                    //rangeStr = "After " + startTime + ", " + this.formatDate(this.dashboardPDFService.customStartDateTime);
                    //end time is not set to it is a range of startime to current time
                    //set end time to current time
                    var custDate = new Date();
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
    };
    DashboardAlarmPDF.prototype.formatDate = function (date) {
        var dateStr = '';
        if (date) {
            var m = date.getMonth() + 1;
            var d = date.getDate();
            var y = date.getFullYear();
            dateStr = m + "/" + d + "/" + y;
        }
        return dateStr;
    };
    //////////////////////////////////////////////
    //Results Items Methods
    //////////////////////////////////////////////
    DashboardAlarmPDF.prototype.updateFilteredAlarms = function () {
        this.alarms = this.alarmOperatorPipe.transform(this.masterAlarms, this.alarmOperatorFilter);
        this.alarms = this.alarmPriorityPipe.transform(this.alarms, this.alarmPriorityFilter);
        this.alarms = this.alarmLOIPipe.transform(this.alarms, this.alarmLocationFilter);
        this.alarmResultCount = this.alarms.length;
    };
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
    DashboardAlarmPDF.prototype.getPlatformStatus = function (platformID) {
        var status = "";
        if (platformID) {
            if (this.dashboardPDFService.platforms) {
                var p = this.dashboardPDFService.platforms.filter(function (p) { return p.id === platformID; });
                if (p) {
                    if ((p[0]) && (p[0].State))
                        status = this.dashboardPDFService.getPlatformStatusClass(p[0]);
                }
            }
        }
        return status;
    };
    DashboardAlarmPDF.prototype.getPlatformName = function (platformID) {
        return this.dashboardPDFService.getPlatformName(platformID);
    };
    DashboardAlarmPDF.prototype.getAttachmentCount = function (alarm) {
        var count = 0;
        if (alarm) {
            //comments
            if (alarm.Comments)
                count = alarm.Comments.length;
            //snapshots
            if (alarm.Snapshots)
                count = count + alarm.Snapshots.length;
        }
        return count;
    };
    DashboardAlarmPDF.prototype.getTenantName = function (tenantID) {
        var name = "";
        var tenant = this.dashboardPDFService.getTenant(tenantID);
        if (tenant)
            name = tenant.CustomerName;
        return name;
    };
    DashboardAlarmPDF.prototype.getTenantLocation = function (tenantID, locID) {
        return this.dashboardPDFService.getLocation(tenantID, locID);
    };
    DashboardAlarmPDF.prototype.getTenantLocationName = function (tenantID, locID) {
        var name = "";
        var loc = this.dashboardPDFService.getLocation(tenantID, locID);
        if (loc)
            name = loc.Name;
        return name;
    };
    DashboardAlarmPDF.prototype.getTenantLocationAddr = function (tenantID, locID) {
        var addr = "";
        var loc = this.dashboardPDFService.getLocation(tenantID, locID);
        if (loc)
            addr = loc.City + ", " + loc.State;
        return addr;
    };
    DashboardAlarmPDF.prototype.getTenantLocationObj = function (tenantID, locID) {
        var tlArray = [];
        if (tenantID && locID) {
            var tenant = this.dashboardPDFService.getTenant(tenantID);
            if (tenant) {
                if (tenant.Locations && tenant.Locations.length > 0) {
                    var loc = tenant.Locations.filter(function (location) { return location.Id === locID; });
                    if (loc.length > 0) {
                        //let newLoc: Location = new Location(loc[0]);
                        var tl = {
                            ID: tenant.Id,
                            Name: tenant.CustomerName,
                            LocationID: loc[0].Id,
                            LocationName: loc[0].Name,
                            LocationCity: loc[0].City,
                            LocationState: loc[0].State,
                            Priority: loc[0].Priority,
                            PriorityString: loc[0].Priority,
                            PriorityCount: loc[0].Priority
                        };
                        tlArray.push(tl);
                    }
                }
            }
        }
        return tlArray;
    };
    DashboardAlarmPDF.prototype.getDateDisplay = function (alarm) {
        var alarmTime = '';
        if (alarm) {
            var aTime = void 0;
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
    };
    DashboardAlarmPDF.prototype.getAlarmTime = function (alarm) {
        var result = this.dashboardPDFService.getAlarmTime(alarm);
        if (result) {
            var s = result.split(" ");
            var r = "<span style='font-size: 18px;'>" + s[0] + "</span>";
            r = r + "<span style='font-size: 13px; margin-left= 5px;'>" + s[1] + "</span>";
            return this.sanitizer.bypassSecurityTrustHtml(r);
        }
        else
            return '';
    };
    DashboardAlarmPDF.prototype.getAlarmReportedTime = function (reportedTime) {
        var result = this.dashboardPDFService.getDateDisplay(reportedTime);
        if (result) {
            var s = result.split("-");
            var r = "<span style='font-size: 16px; position: relative;float: left;'>" + s[0] + "</span>";
            r = r + "<span style='font-size: 13px; position: relative;float: left;'>" + s[1] + "</span>";
            return this.sanitizer.bypassSecurityTrustHtml(r);
        }
        else
            return '';
    };
    DashboardAlarmPDF.prototype.getUserInitials = function (username) {
        return this.dashboardPDFService.convertUsernameToInitials(username);
    };
    __decorate([
        ViewChild('alarmReportOperatorCountDiv'),
        __metadata("design:type", ElementRef)
    ], DashboardAlarmPDF.prototype, "operatorCount", void 0);
    __decorate([
        ViewChild('pdfAlarmReportResultsContentDiv'),
        __metadata("design:type", ElementRef)
    ], DashboardAlarmPDF.prototype, "resultsContentDiv", void 0);
    __decorate([
        ViewChild(BaseChartDirective),
        __metadata("design:type", BaseChartDirective)
    ], DashboardAlarmPDF.prototype, "chartComponent", void 0);
    __decorate([
        ViewChild('pdfAlarmReportResultsContainer'),
        __metadata("design:type", ElementRef)
    ], DashboardAlarmPDF.prototype, "alarmResultsContainer", void 0);
    DashboardAlarmPDF = __decorate([
        Component({
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
                ])
            ],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [DashboardPDFService,
            AlarmOperatorPipe,
            AlarmPriorityPipe,
            AlarmLOIPipe,
            DomSanitizer,
            ChangeDetectorRef])
    ], DashboardAlarmPDF);
    return DashboardAlarmPDF;
}());
export { DashboardAlarmPDF };
//# sourceMappingURL=dashboard-alarm-pdf.component.js.map