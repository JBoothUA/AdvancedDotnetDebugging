var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ViewChild, ElementRef, NgZone, trigger, state, transition, style, animate, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';
import { BaseChartDirective } from 'ng2-charts';
import { FilterTimeframe, SliderType } from './dashboard';
import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { NavigationService } from '../shared/navigation.service';
import { HttpService } from '../shared/http.service';
import { DashboardSlider } from './dashboard-slider.component';
import { AlarmOperatorPipe } from './alarm-operator.pipe';
import { AlarmPriorityPipe } from './alarm-priority.pipe';
import { AlarmLOIPipe } from './alarm-loi.pipe';
import { LocationFilterService } from '../shared/location-filter.service';
import { LeafletMap } from '../map/leaflet-map.component';
import { AlarmMapService } from '../map/alarms/alarmMap.service';
var ResultsSize;
(function (ResultsSize) {
    ResultsSize[ResultsSize["Small"] = 706] = "Small";
    ResultsSize[ResultsSize["Medium"] = 871] = "Medium";
    ResultsSize[ResultsSize["Large"] = 976] = "Large";
    ResultsSize[ResultsSize["None"] = 0] = "None";
})(ResultsSize || (ResultsSize = {}));
var DashboardAlarm = /** @class */ (function () {
    ////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    function DashboardAlarm(dashboardService, dashboardAlarmService, dashboardPlatformService, navigationService, httpService, sanitizer, alarmOperatorPipe, alarmPriorityPipe, alarmLOIPipe, locationFilterService, changeDetectorRef, ngZone, alarmMapService) {
        //this.dashboardAlarmService.timeframeUpdate
        //    .takeUntil(this.ngUnsubscribe)
        //    .subscribe({
        //        next: () => this.timeframeChanged()
        //    });
        var _this = this;
        this.dashboardService = dashboardService;
        this.dashboardAlarmService = dashboardAlarmService;
        this.dashboardPlatformService = dashboardPlatformService;
        this.navigationService = navigationService;
        this.httpService = httpService;
        this.sanitizer = sanitizer;
        this.alarmOperatorPipe = alarmOperatorPipe;
        this.alarmPriorityPipe = alarmPriorityPipe;
        this.alarmLOIPipe = alarmLOIPipe;
        this.locationFilterService = locationFilterService;
        this.changeDetectorRef = changeDetectorRef;
        this.ngZone = ngZone;
        this.alarmMapService = alarmMapService;
        //Class Variables
        this.operatorDivSize = 250;
        this.resultsContainerDivSize = 706;
        this.expandedResult = new Map();
        this.expandedAlarmID = null;
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
        //location props
        this.sliderTypeEnum = SliderType;
        this.selectedLocationsCount = 0;
        this.selectedLocationIDs = [];
        this.alarmOperatorCount = 0;
        //export props
        this.exporting = false;
        //results header props
        this.headerFilteredCountField = '';
        this.headerFilterTotalCount = '';
        this.headerAllPriorityLocationCountField = '';
        this.headerActiveField = '';
        this.headerOperatorField = '';
        this.headerTimeframeField = '';
        this.headerLocationField = '';
        //search props
        this.alarmPlaceHolderSearch = "Search Alarms";
        //alarm results props
        this.alarmOperatorSelected = false;
        this.moreOperatorExpanded = false;
        this.currentScroll = 0;
        this.filterTimeframe = FilterTimeframe;
        this.showOperatorResultsColumn = true;
        this.showDurationsResultsColumn = true;
        //filters
        this.alarmOperatorFilter = '';
        this.alarmLocationFilter = null;
        this.alarmPriorityFilter = 0;
        this.alarmResultCount = 0;
        this.ngUnsubscribe = new Subject();
        //filter panel or main menu was toggled
        this.dashboardService.onLeftPanelToggled
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (event) { return _this.onResize(event); }
        });
        //filter selections
        this.dashboardAlarmService.onLOISelected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (loiData) { return _this.loiSelected(loiData); }
        });
        this.dashboardAlarmService.filterCriteriaChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleFilterCriteriaChanged(); }
        });
        //on timeframe change - attached to process different behavior than updateAlarmData()
        this.dashboardService.onTimeframeChange
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleTimeframeChanged(); }
        });
        //alarm data
        this.dashboardAlarmService.onAlarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleLoadedAlarmsData(); }
        });
        this.dashboardAlarmService.onNewAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.handleNewAlarm(alarm); }
        });
        this.dashboardAlarmService.onEditAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.handleEditAlarm(alarm); }
        });
        this.dashboardAlarmService.onRemoveAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.handleRemoveAlarm(alarm); }
        });
        //filter or time change
        this.dashboardAlarmService.updateAlarmData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleUpdateAlarmData(); }
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
            next: function (id) { return _this.alarmSelected(id); }
        });
        this.dashboardAlarmService.selectionChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (id) { return _this.changeDetectorRef.markForCheck(); }
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
            next: function () { return _this.handleLoadedPlatformsData(); }
        });
        //zoom the map
        this.locationFilterService.onZoomToLocation
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (location) { return _this.handleZoomToMapLocation(location); }
        });
    }
    DashboardAlarm.prototype.ngOnInit = function () {
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
        if (this.dashboardService.alarmDataLoaded)
            this.masterAlarms = this.dashboardAlarmService.getAlarms();
        else
            this.masterAlarms = [];
        //reset local filters
        this.alarmOperatorFilter = '';
        this.alarmLocationFilter = null;
        this.alarmPriorityFilter = 0;
        //get filtered data
        this.updateFilteredAlarms();
    };
    DashboardAlarm.prototype.ngAfterViewInit = function () {
        var _this = this;
        if (this.alarmResultsContainer) {
            this.resultsContainerDivSize = this.alarmResultsContainer.nativeElement.clientWidth - 8; //this.resultsContentDiv.nativeElement.clientWidth;
            this.alarmResultsContainer.nativeElement.scrollTop = 0;
        }
        this.updateData();
        // Bind scroll event outside of angular so that change detection is not fired on every scroll event
        // We only need to persist the current scroll value, so change detection is not required
        this.ngZone.runOutsideAngular(function () {
            _this.alarmResultsContainer.nativeElement.addEventListener('scroll', function (e) {
                _this.onContainerScroll(e);
            }, { passive: true });
        });
    };
    DashboardAlarm.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    DashboardAlarm.prototype.onResize = function (event) {
        if (this.operatorDiv)
            this.operatorDivSize = this.operatorDiv.nativeElement.clientWidth;
        if (this.alarmResultsContainer)
            this.resultsContainerDivSize = this.alarmResultsContainer.nativeElement.clientWidth - 8;
        this.alarmOperators = this.getOperatorInitials();
        this.determineDisplayItems();
    };
    DashboardAlarm.prototype.expandedMoreOperatorViewState = function () {
        if (this.moreOperatorExpanded) {
            return 'out';
        }
        return 'in';
    };
    DashboardAlarm.prototype.toggleExpandedMoreOperatorView = function () {
        event.stopPropagation();
        this.moreOperatorExpanded = !this.moreOperatorExpanded;
    };
    DashboardAlarm.prototype.expandedResultsViewState = function (alarmID) {
        if (!this.expandedResult[alarmID])
            this.expandedResult[alarmID] = 'in';
        return this.expandedResult[alarmID];
    };
    DashboardAlarm.prototype.toggleExpandedResultsView = function (alarmID) {
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
    };
    DashboardAlarm.prototype.onContainerScroll = function (event) {
        this.currentScroll = this.alarmResultsContainer.nativeElement.scrollTop;
    };
    DashboardAlarm.prototype.maintainScroll = function () {
        this.alarmResultsContainer.nativeElement.scrollTop = this.currentScroll;
    };
    DashboardAlarm.prototype.updateScroll = function (alarm, newAlarm) {
        // Get the dom element of the alarm being added/removed
        var item = document.getElementById('alarm_result_item_' + alarm.Id);
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
    };
    ///////////////////////////////////////////
    //Notification Methods
    ///////////////////////////////////////////
    DashboardAlarm.prototype.handleTimeframeChanged = function () {
        //clear selected alarm
        this.deselectAlarm();
        this.alarmMapService.showAlarmMarkers();
        this.alarmMapService.manualZoomMode = true;
        this.alarmMapService.fitMarkers(this.alarms);
    };
    DashboardAlarm.prototype.handleZoomToMapLocation = function (location) {
        this.alarmMap.zoomToMapLocation(location);
    };
    DashboardAlarm.prototype.handleUpdateAlarmData = function () {
        //a filter was changed or a new timeframe was triggered
        this.masterAlarms = this.dashboardAlarmService.getAlarms();
        this.updateData();
    };
    DashboardAlarm.prototype.handleLoadedAlarmsData = function () {
        this.masterAlarms = this.dashboardAlarmService.getAlarms();
        this.updateData();
        this.alarmMapService.showAlarmMarkers();
        this.alarmMapService.manualZoomMode = true;
        this.alarmMapService.fitMarkers(this.alarms);
    };
    DashboardAlarm.prototype.handleNewAlarm = function (alarm) {
        this.masterAlarms = this.dashboardAlarmService.getAlarms();
        this.updateData();
    };
    DashboardAlarm.prototype.handleEditAlarm = function (alarm) {
        this.masterAlarms = this.dashboardAlarmService.getAlarms();
        this.updateData();
    };
    DashboardAlarm.prototype.handleRemoveAlarm = function (alarm) {
        this.masterAlarms = this.dashboardAlarmService.getAlarms();
        this.updateScroll(alarm, false);
        this.updateData();
    };
    DashboardAlarm.prototype.handleLoadedPlatformsData = function () {
        if (this.masterAlarms && this.masterAlarms.length > 0)
            this.updateData();
    };
    DashboardAlarm.prototype.handleFilterCriteriaChanged = function () {
        this.masterAlarms = this.dashboardAlarmService.getAlarms();
        this.updateData();
    };
    DashboardAlarm.prototype.updateData = function () {
        //get the selected location ids
        //this.selectedLocationIDs = this.getSelectedLocationIDs();
        var _this = this;
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
            setTimeout(function () {
                _this.alarmMapService.showAlarmMarkers();
                _this.alarmMapService.manualZoomMode = true;
                _this.alarmMapService.fitMarkers(_this.alarms);
                _this.dashboardService.onTimeframeChangeComplete.next();
            }, 1000);
        else
            this.dashboardService.onTimeframeChangeComplete.next();
        this.alarmMapService.showAlarmMarkers();
        this.alarmMapService.manualZoomMode = true;
        this.alarmMapService.fitMarkers(this.alarms);
        this.changeDetectorRef.markForCheck(); //detectChanges();//markForCheck();
    };
    DashboardAlarm.prototype.alarmSelected = function (alarmID) {
        var item = document.getElementById('alarm_result_item_' + alarmID);
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
    };
    //alarmRemoved(alarm: Alarm): void {
    //    this.updateScroll(alarm, false);
    //}
    DashboardAlarm.prototype.loiSelected = function (loiData) {
        if (this.alarmLocationFilter === null) {
            this.alarmLocationFilter = loiData;
            this.setResultsHeaderLocationField();
            this.updateFilteredAlarms();
            this.changeDetectorRef.markForCheck();
        }
        else {
            this.removeSelectedAlarmFilter('Location');
        }
    };
    ///////////////////////////////////////////
    //Chart Methods
    ///////////////////////////////////////////
    DashboardAlarm.prototype.setChartData = function () {
        var ap = 0;
        var index = 0;
        var chartData = [];
        var chartLabel = [];
        for (var i = 0; i < 4; ++i) {
            index = i + 1;
            ap = this.alarms.filter(function (a) { return a.Priority === index; }).length;
            chartData[i] = ap;
            chartLabel[i] = this.dashboardAlarmService.getAlarmPriorityDefn(index.toString()) +
                " (P" + index.toString() + ") - " + ap.toString();
        }
        this.doughnutChartData = chartData;
        this.doughnutChartLabels = chartLabel;
        this.doughnutChartTotal = this.alarms.length;
    };
    DashboardAlarm.prototype.updateChartData = function () {
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
            labels[i] = this.dashboardAlarmService.getAlarmPriorityDefn(index.toString()) + " (P" + index.toString() + ") - " + ap.toString();
            this.showLegendData[i] = 'show';
            chart.data.datasets[0].backgroundColor[i] = this.doughnutChartColorsDefault[0].backgroundColor[i];
        }
        chart.update();
        this.doughnutChartTotal = this.alarms.length;
        this.doghnutChartLegendData = this.chartComponent.chart.generateLegend();
        //this.changeDetectorRef.markForCheck();//detectChanges();
    };
    DashboardAlarm.prototype.getLegendCallback = function (chart) {
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
    DashboardAlarm.prototype.chartClicked = function (e) {
        console.log(e);
    };
    DashboardAlarm.prototype.legendClicked = function (e, dataValue, legendItemID) {
        if (dataValue >= 0) {
            var chart = this.chartComponent.chart;
            var index = this.chartComponent.chart.legend.legendItems[legendItemID].index;
            //if ((chart.data.datasets[0].data[index] != 0) && (this.showLegendData[index] === 'show')) {
            if (chart.data.datasets[0].data[index] !== 0) {
                var selectedPriorityFilter = (this.alarmPriorityFilter === 0) ? index : (this.alarmPriorityFilter - 1);
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
                    for (var i = 0; i < chart.data.datasets[0].data.length; i++) {
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
    };
    DashboardAlarm.prototype.getDoughnutLegendViewState = function (legendItemID) {
        if (!this.showLegendData[legendItemID])
            this.showLegendData[legendItemID] = 'show';
        return this.showLegendData[legendItemID];
    };
    //////////////////////////////////////////////
    //Operator Methods
    //////////////////////////////////////////////
    DashboardAlarm.prototype.getOperators = function () {
        var alarmOperatorsData = [];
        var unique = {};
        //walk high level 
        for (var i in this.alarms) {
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
                for (var x in this.alarms[i].Comments) {
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
    };
    DashboardAlarm.prototype.getOperatorInitials = function () {
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
            if (operator) {
                var initials = operator.match(/\b\w/g) || [];
                initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
                if (!operatorsObj.hasOwnProperty(operator)) {
                    operatorsObj[operator] = { "Name": operator, "Initials": initials, "More": false, MoreOperators: [] };
                    operators.push({ "Name": operator, "Initials": initials, "More": false, MoreOperators: [] });
                }
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
            operators.push({ "Name": "See more Operators", "Initials": moreText, "More": true, MoreOperators: additionalOps });
        this.alarmOperatorCount = alarmOperatorsData.length;
        return operators;
    };
    DashboardAlarm.prototype.operatorSelected = function (operatorName, moreSelected) {
        if (operatorName === 'See more Operators') {
            this.toggleExpandedMoreOperatorView();
        }
        else {
            if (this.dashboardAlarmService.getSelectedOperator() === true) {
                if (operatorName) {
                    var existingName = this.dashboardAlarmService.getOperatorFilter();
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
    };
    DashboardAlarm.prototype.reorderOperatorInitials = function (operatorName) {
        //get the alarm operators
        var operators = this.alarmOperators;
        //remove the next to last operator in the this.alarmOperators object array 
        //Note: the last operatore is the More Operators object array
        var lastOperator = operators.splice(operators.length - 2, 1)[0];
        //get the More Operators object
        var moreOperators = operators.filter(function (o) { return o.More === true; })[0];
        //get the selected more operator
        var selectedMoreOperator = moreOperators.MoreOperators.filter(function (o) { return o.Name === operatorName; })[0];
        //put the selected more operator in at the start of the this.alarmOperator object array
        this.alarmOperators.unshift(selectedMoreOperator);
        //remove the selected more operator from the More Operators array
        moreOperators.MoreOperators.splice(moreOperators.MoreOperators.indexOf(selectedMoreOperator), 1);
        //add the last operator from the this.alarmOperators object to the end of the More Operators array
        moreOperators.MoreOperators.push(lastOperator);
    };
    //////////////////////////////////////////////
    //Locaiton of Interest Methods
    //////////////////////////////////////////////
    DashboardAlarm.prototype.setLocationOfInterest = function () {
        this.getSelectedLocationCount();
        //this.dashboardLOIContent.setLocationOfInterest();
    };
    DashboardAlarm.prototype.getSelectedLocationCount = function () {
        var customers = this.dashboardService.getAllTenantLocations();
        if (customers) {
            var totalSelCount = 0;
            for (var _i = 0, customers_1 = customers; _i < customers_1.length; _i++) {
                var cust = customers_1[_i];
                //per UX only show locations with P1 and P2 Alarms
                var selectedLoc = (cust.Locations.filter(function (c) { return c.Selected === true && (c.Priority === '1' || c.Priority === '2'); }).length);
                totalSelCount = totalSelCount + selectedLoc;
            }
            this.selectedLocationsCount = totalSelCount;
        }
    };
    //////////////////////////////////////////////
    //Export Methods
    //////////////////////////////////////////////
    DashboardAlarm.prototype.exportPDF = function () {
        var _this = this;
        this.exporting = true;
        this.changeDetectorRef.markForCheck();
        var criteria = {};
        criteria["Priority"] = this.dashboardAlarmService.alarmFilterPrioritySelection;
        criteria["Operator"] = this.dashboardAlarmService.alarmFilterOperatorSelection;
        criteria["Description"] = this.dashboardAlarmService.alarmFilterDescriptionSelection;
        criteria["Status"] = this.dashboardAlarmService.alarmFilterStateSelection;
        criteria["Robot"] = this.dashboardAlarmService.alarmFilterRobotSelection;
        var startTime;
        var endTime;
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            startTime = moment().valueOf();
            endTime = 0;
        }
        else {
            startTime = this.dashboardAlarmService.exportStartDateTime;
            endTime = this.dashboardAlarmService.exportEndDateTime;
        }
        var reportData = {
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
        this.httpService.postPdf('/Report/URLToPDF/', reportData, null, true).then(function (pdfBytes) {
            if (pdfBytes) {
                console.log('PDF File has been downloaded');
                //var pdfFile = new Blob([pdfBytes], { type: 'application/pdf' });
                var pdfFileUrl = URL.createObjectURL(pdfBytes, { oneTimeOnly: true });
                _this.exporting = false;
                _this.changeDetectorRef.markForCheck();
                //display in browser - cannot specify the file name
                //window.open(pdfFileUrl, "", "width=973,height=578,resizable=no,fullscreen=false");
                //download it
                var a = document.createElement('a');
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
    };
    //////////////////////////////////////////////
    //Results Header Methods
    //////////////////////////////////////////////
    DashboardAlarm.prototype.updateResultsHeader = function () {
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
    DashboardAlarm.prototype.setResultsHeaderFilteredCountField = function () {
        if (((this.dashboardAlarmService.alarmFilterPrioritySelection) && (this.dashboardAlarmService.alarmFilterPrioritySelection !== 0)) ||
            ((this.dashboardAlarmService.alarmFilterOperatorSelection) && (this.dashboardAlarmService.alarmFilterOperatorSelection !== 'All')) ||
            ((this.dashboardAlarmService.alarmFilterDescriptionSelection) && (this.dashboardAlarmService.alarmFilterDescriptionSelection !== 'All')) ||
            ((this.dashboardAlarmService.alarmFilterStateSelection) && (this.dashboardAlarmService.alarmFilterStateSelection !== 0)) ||
            ((this.dashboardAlarmService.alarmFilterRobotSelection) && (this.dashboardAlarmService.alarmFilterRobotSelection !== 'All'))) {
            var count = this.alarms.length;
            //this.headerFilteredCountField = " Filtered";
            this.headerFilteredCountField = " " + count.toString();
        }
        else
            this.headerFilteredCountField = "";
    };
    DashboardAlarm.prototype.setResultsHeaderAllPriorityLocationCountField = function () {
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
            (((this.dashboardAlarmService.alarmFilterPrioritySelection) && (this.dashboardAlarmService.alarmFilterPrioritySelection !== 0)) ||
                ((this.dashboardAlarmService.alarmFilterOperatorSelection) && (this.dashboardAlarmService.alarmFilterOperatorSelection !== 'All')) ||
                ((this.dashboardAlarmService.alarmFilterDescriptionSelection) && (this.dashboardAlarmService.alarmFilterDescriptionSelection !== 'All')) ||
                ((this.dashboardAlarmService.alarmFilterStateSelection) && (this.dashboardAlarmService.alarmFilterStateSelection !== 0)) ||
                ((this.dashboardAlarmService.alarmFilterRobotSelection) && (this.dashboardAlarmService.alarmFilterRobotSelection !== 'All'))))
            this.headerAllPriorityLocationCountField = "";
        else {
            this.headerAllPriorityLocationCountField = " All ";
        }
    };
    DashboardAlarm.prototype.setResultsHeaderActiveOrTimeframeField = function () {
        var timeframe = this.dashboardService.getSelectedTimeframe();
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
    };
    DashboardAlarm.prototype.setResultsHeaderOperatorField = function () {
        if (this.alarmOperatorFilter) {
            this.headerOperatorField = " for " + this.alarmOperatorFilter;
            if (this.headerAllPriorityLocationCountField === " All ")
                this.headerAllPriorityLocationCountField = "";
        }
        else
            this.headerOperatorField = "";
    };
    DashboardAlarm.prototype.setResultsHeaderLocationField = function () {
        if (this.alarmLocationFilter) {
            this.headerLocationField = " in " + this.alarmLocationFilter.LocationName;
            if (this.headerAllPriorityLocationCountField === " All ")
                this.headerAllPriorityLocationCountField = "";
        }
        else
            this.headerLocationField = "";
    };
    DashboardAlarm.prototype.getResultTotalCount = function () {
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
    DashboardAlarm.prototype.removeSelectedAlarmFilter = function (filter) {
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
    };
    DashboardAlarm.prototype.showAlarmFilterCriteria = function () {
        this.dashboardService.showAlarmFilterCriteriaComponent();
    };
    DashboardAlarm.prototype.formatDate = function (date) {
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
    DashboardAlarm.prototype.updateFilteredAlarms = function () {
        this.alarms = this.alarmOperatorPipe.transform(this.masterAlarms, this.alarmOperatorFilter);
        this.alarms = this.alarmPriorityPipe.transform(this.alarms, this.alarmPriorityFilter);
        this.alarms = this.alarmLOIPipe.transform(this.alarms, this.alarmLocationFilter);
        this.alarmResultCount = this.alarms.length;
        this.alarmMapService.manualZoomMode = true;
        this.alarmMapService.fitMarkers(this.alarms);
        this.changeDetectorRef.markForCheck();
        //return filteredAlarms;
    };
    DashboardAlarm.prototype.determineDisplayItems = function () {
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
    };
    DashboardAlarm.prototype.getPlatformStatus = function (platformID) {
        return this.dashboardPlatformService.getPlatformStatus(platformID);
    };
    DashboardAlarm.prototype.getPlatformName = function (platformID) {
        return this.dashboardPlatformService.getPlatformName(platformID);
    };
    DashboardAlarm.prototype.getAttachmentCount = function (alarm) {
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
    DashboardAlarm.prototype.getTenant = function (tenantID) {
        return this.dashboardService.getTentant(tenantID);
    };
    DashboardAlarm.prototype.getTenantName = function (tenantID) {
        var name = "";
        var tenant = this.dashboardService.getTentant(tenantID);
        if (tenant)
            name = tenant.CustomerName;
        return name;
    };
    DashboardAlarm.prototype.getTenantLocation = function (tenantID, locID) {
        return this.dashboardService.getLocation(tenantID, locID);
    };
    DashboardAlarm.prototype.getTenantLocationName = function (tenantID, locID) {
        var name = "";
        var loc = this.dashboardService.getLocation(tenantID, locID);
        if (loc)
            name = loc.Name;
        return name;
    };
    DashboardAlarm.prototype.getTenantLocationAddr = function (tenantID, locID) {
        var addr = "";
        var loc = this.dashboardService.getLocation(tenantID, locID);
        if (loc)
            addr = loc.City + ", " + loc.State;
        return addr;
    };
    DashboardAlarm.prototype.getTenantLocationObj = function (tenantID, locID) {
        var tlArray = [];
        if (tenantID && locID) {
            var tenant = this.dashboardService.getTentant(tenantID);
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
    DashboardAlarm.prototype.getSelectedLocationIDs = function () {
        return this.dashboardService.getSelectedLocationIDs();
    };
    DashboardAlarm.prototype.getDateDisplay = function (alarm) {
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
            alarmTime = this.dashboardAlarmService.getDateDisplay(aTime, false);
        }
        return alarmTime;
    };
    DashboardAlarm.prototype.getAlarmTime = function (alarm) {
        var result = this.dashboardAlarmService.getAlarmTime(alarm);
        if (result) {
            var s = result.split(" ");
            var r = "<span style='font-size: 18px;'>" + s[0] + "</span>";
            r = r + "<span style='font-size: 13px; margin-left: 5px;'>" + s[1] + "</span>";
            return this.sanitizer.bypassSecurityTrustHtml(r);
        }
        else
            return '';
    };
    DashboardAlarm.prototype.getAlarmReportedTime = function (reportedTime) {
        var result = this.dashboardAlarmService.getDateDisplay(reportedTime);
        if (result) {
            var s = result.split("-");
            var r = "<span style='font-size: 16px; position: relative;float: left;'>" + s[0] + "</span>";
            r = r + "<span style='font-size: 13px; position: relative;float: left;'>" + s[1] + "</span>";
            return this.sanitizer.bypassSecurityTrustHtml(r);
        }
        else
            return '';
    };
    DashboardAlarm.prototype.getUserInitials = function (username) {
        return this.dashboardAlarmService.convertUsernameToInitials(username);
    };
    DashboardAlarm.prototype.selectAlarm = function (alarm) {
        if (alarm.Selected) {
            this.dashboardAlarmService.deSelectAlarm(alarm.Id, false, true);
        }
        else {
            if (this.dashboardAlarmService.selectedAlarm !== null)
                this.dashboardAlarmService.deSelectAlarm(this.dashboardAlarmService.selectedAlarm.Id, false, true);
            this.dashboardAlarmService.selectAlarm(alarm.Id, false, false, alarm);
        }
    };
    DashboardAlarm.prototype.deselectAlarm = function () {
        if (this.dashboardAlarmService.selectedAlarm !== null)
            this.dashboardAlarmService.deSelectAlarm(this.dashboardAlarmService.selectedAlarm.Id, false, true);
    };
    DashboardAlarm.prototype.getSelectedAlarmID = function () {
        if (this.dashboardAlarmService.selectedAlarm !== null) {
            if (this.alarms.length > 0)
                return this.dashboardAlarmService.selectedAlarm.Id;
        }
        return '';
    };
    DashboardAlarm.prototype.navigateToAlarm = function (alarm) {
        if (this.dashboardService.getSelectedTimeframe() === this.filterTimeframe.Current) {
            this.navigationService.navigate('/MapView/Alarms', alarm.Id);
        }
    };
    DashboardAlarm.prototype.zoomTo = function (alarm) {
        this.alarmMapService.zoomToAlarmMarker(this.alarmMapService.getAlarmMarkerId(alarm));
        this.selectAlarm(alarm);
    };
    __decorate([
        ViewChild('alarmReportOperatorCountDiv'),
        __metadata("design:type", ElementRef)
    ], DashboardAlarm.prototype, "operatorCount", void 0);
    __decorate([
        ViewChild('alarmReportOperatorsDiv'),
        __metadata("design:type", ElementRef)
    ], DashboardAlarm.prototype, "operatorDiv", void 0);
    __decorate([
        ViewChild('dbLOISlider'),
        __metadata("design:type", DashboardSlider)
    ], DashboardAlarm.prototype, "dashboardLOIContent", void 0);
    __decorate([
        ViewChild('alarmReportResultsDiv'),
        __metadata("design:type", ElementRef)
    ], DashboardAlarm.prototype, "resultsDiv", void 0);
    __decorate([
        ViewChild('alarmReportResultsContentDiv'),
        __metadata("design:type", ElementRef)
    ], DashboardAlarm.prototype, "resultsContentDiv", void 0);
    __decorate([
        ViewChild(BaseChartDirective),
        __metadata("design:type", BaseChartDirective)
    ], DashboardAlarm.prototype, "chartComponent", void 0);
    __decorate([
        ViewChild('alarmReportResults'),
        __metadata("design:type", ElementRef)
    ], DashboardAlarm.prototype, "alarmReportResults", void 0);
    __decorate([
        ViewChild('alarmReportResultsContainer'),
        __metadata("design:type", ElementRef)
    ], DashboardAlarm.prototype, "alarmResultsContainer", void 0);
    __decorate([
        ViewChild('map'),
        __metadata("design:type", LeafletMap)
    ], DashboardAlarm.prototype, "alarmMap", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], DashboardAlarm.prototype, "searchterm", void 0);
    DashboardAlarm = __decorate([
        Component({
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
                ])
            ],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [DashboardService,
            DashboardAlarmService,
            DashboardPlatformService,
            NavigationService,
            HttpService,
            DomSanitizer,
            AlarmOperatorPipe,
            AlarmPriorityPipe,
            AlarmLOIPipe,
            LocationFilterService,
            ChangeDetectorRef,
            NgZone,
            AlarmMapService])
    ], DashboardAlarm);
    return DashboardAlarm;
}());
export { DashboardAlarm };
//# sourceMappingURL=dashboard-alarm.component.js.map