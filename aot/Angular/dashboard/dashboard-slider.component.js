var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef, animate, style, transition, trigger, state, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { DashboardPatrolService } from './dashboard-patrol.service';
import { SliderType, PatrolStatus, FilterTimeframe } from './dashboard';
import { isPatrolInstance } from '../patrols/patrol.class';
//function isPatrolInstance(arg: PatrolInstance | PatrolTemplate): arg is PatrolInstance {
//    if (isPatrolInstance(arg[0])) {
//        return true;
//    } else {
//        return false;
//    }
//}
var DashboardSlider = /** @class */ (function () {
    ///////////////////////////////////////////
    //Core Angular Methods
    ///////////////////////////////////////////
    function DashboardSlider(dashboardService, dashboaradAlarmService, dashboardPatrolService, dashboardPlatformService, dashboardAlarmService, changeDetectorRef) {
        var _this = this;
        this.dashboardService = dashboardService;
        this.dashboaradAlarmService = dashboaradAlarmService;
        this.dashboardPatrolService = dashboardPatrolService;
        this.dashboardPlatformService = dashboardPlatformService;
        this.dashboardAlarmService = dashboardAlarmService;
        this.changeDetectorRef = changeDetectorRef;
        this.sliderTypeEnum = SliderType;
        this.filterTimeframe = FilterTimeframe;
        this.selectedCustomerLocations = [];
        //robot and drones data
        //key: manufacture, value: RobotAndDrone object
        this.robotAndDronesMap = new Map();
        this.robotDroneExpanded = false;
        this.robotDroneFilter = null;
        this.platforms = null;
        this.sliderData = new EventEmitter();
        this.ngUnsubscribe = new Subject();
        //this.changeDetectorRef = changeDetectorRef;
        this.orientation = 'none';
        //Alarm updates
        this.dashboardAlarmService.onAlarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleLoadedAlarmsData(); }
        });
        this.dashboardAlarmService.onNewAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleNewAlarm(); }
        });
        this.dashboardAlarmService.onRemoveAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleRemovedAlarm(); }
        });
        //Patrol Instance Updates
        this.dashboardPatrolService.onPatrolsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleLoadedPatrolData(); }
        });
        this.dashboardPatrolService.onNewPatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrol) { return _this.handleNewPatrolInstance(patrol); }
        });
        this.dashboardPatrolService.onUpdatePatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrol) { return _this.handleUpdatedPatrolInstance(patrol); }
        });
        this.dashboardPatrolService.onCompletededPatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrol) { return _this.handleCompletededPatrolInstance(patrol); }
        });
        //Patrol Templates Updates
        this.dashboardPatrolService.onPatrolTemplatesLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleLoadedPatrolTemplateData(); }
        });
        this.dashboardPatrolService.onUpdatePatrolTemplate
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (template) { return _this.handleUpdatePatrolTemplate(template); }
        });
        //Platform Updates
        this.dashboardPlatformService.onPlatformsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleLoadedPlatformData(); }
        });
        //filter or time change
        this.dashboardAlarmService.updateAlarmData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleUpdateAlarmData(); }
        });
        this.dashboardPatrolService.onUpdatePatrolData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleUpdatedPatrolData(); }
        });
        this.dashboardAlarmService.filterCriteriaChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleUpdateAlarmData(); }
        });
        this.dashboardPatrolService.onFilterCriteriaChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleUpdatedPatrolData(); }
        });
    }
    DashboardSlider.prototype.ngOnInit = function () {
        if (this.sliderType === this.sliderTypeEnum.Locations) {
            this.setLocationOfInterest();
        }
        if (this.sliderType === this.sliderTypeEnum.Platforms) {
            this.slideConfig = {
                "slidesToShow": 2,
                "slidesToScroll": 1,
                "prevArrow": '.sliderLeftArrow',
                "nextArrow": '.sliderRightArrow',
                "variableWidth": true,
                "infinite": false
            };
            //TSR* 
            if (this.dashboardService.platformDataLoaded) {
                this.platforms = this.dashboardPlatformService.getPlatforms();
                if (this.platforms)
                    this.initRobotsAndDronesOnPatrols();
            }
            else
                this.platforms = [];
        }
    };
    DashboardSlider.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    DashboardSlider.prototype.showNextData = function () {
        if (this.orientation === 'none') {
            // Find the currently selected index.
            var index = void 0;
            var res = void 0;
            if (this.sliderType === this.sliderTypeEnum.Locations) {
                index = this.customers.indexOf(this.selectedCustomerLocations[0]);
                // Move the rendered element to the next index - this will cause the current item
                // to enter the ( "next" => "void" ) transition and this new item to enter the
                // ( "void" => "next" ) transition.
                res = this.customers[index + 1] ? this.customers[index + 1] : this.customers[0];
                this.selectedCustomerLocations = [];
                this.selectedCustomerLocations.push(res);
            }
            if (this.sliderType === this.sliderTypeEnum.Platforms) {
                if (this.expandedRobotDroneViewState() === 'out')
                    this.toggleExpandedRobotDroneView();
            }
            this.changeDetectorRef.detectChanges();
        }
        else {
            // Change the 'state' for our animation trigger.
            this.orientation = 'next';
            // Force the Template to apply the new animation state before we actually
            // change the rendered element view-model. If we don't force a change-detection,
            // the new [@orientation] state won't be applied prior to the 'leave' transition;
            // which means that we won't be leaving from the 'expected' state.
            this.changeDetectorRef.detectChanges();
            // Find the currently selected index.
            var index = void 0;
            var res = void 0;
            if (this.sliderType === this.sliderTypeEnum.Locations) {
                index = this.customers.indexOf(this.selectedCustomerLocations[0]);
                // Move the rendered element to the next index - this will cause the current item
                // to enter the ( "next" => "void" ) transition and this new item to enter the
                // ( "void" => "next" ) transition.
                res = this.customers[index + 1] ? this.customers[index + 1] : this.customers[0];
                this.selectedCustomerLocations = [];
                this.selectedCustomerLocations.push(res);
            }
            if (this.sliderType === this.sliderTypeEnum.Platforms) {
                if (this.expandedRobotDroneViewState() === 'out')
                    this.toggleExpandedRobotDroneView();
            }
        }
    };
    DashboardSlider.prototype.showPrevData = function () {
        if (this.orientation === 'none') {
            var index = void 0;
            var res = void 0;
            if (this.sliderType === this.sliderTypeEnum.Locations) {
                // Find the currently selected index.
                index = this.customers.indexOf(this.selectedCustomerLocations[0]);
                // Move the rendered element to the previous index - this will cause the current
                // item to enter the ( "prev" => "void" ) transition and this new item to enter
                // the ( "void" => "prev" ) transition.
                res = this.customers[index - 1] ? this.customers[index - 1] : this.customers[this.customers.length - 1];
                //this.selectedCustomer = this.customers[index - 1] ? this.customers[index - 1] : this.customers[this.customers.length - 1];
                this.selectedCustomerLocations = [];
                this.selectedCustomerLocations.push(res);
            }
            if (this.sliderType === this.sliderTypeEnum.Platforms) {
                if (this.expandedRobotDroneViewState() === 'out')
                    this.toggleExpandedRobotDroneView();
            }
            this.changeDetectorRef.detectChanges();
        }
        else {
            // Change the "state" for our animation trigger.
            this.orientation = 'prev';
            // Force the Template to apply the new animation state before we actually
            // change the rendered element view-model. If we don't force a change-detection,
            // the new [@orientation] state won't be applied prior to the 'leave' transition;
            // which means that we won't be leaving from the 'expected' state.
            this.changeDetectorRef.detectChanges();
            var index = void 0;
            var res = void 0;
            if (this.sliderType === this.sliderTypeEnum.Locations) {
                // Find the currently selected index.
                index = this.customers.indexOf(this.selectedCustomerLocations[0]);
                // Move the rendered element to the previous index - this will cause the current
                // item to enter the ( "prev" => "void" ) transition and this new item to enter
                // the ( "void" => "prev" ) transition.
                res = this.customers[index - 1] ? this.customers[index - 1] : this.customers[this.customers.length - 1];
                //this.selectedCustomer = this.customers[index - 1] ? this.customers[index - 1] : this.customers[this.customers.length - 1];
                this.selectedCustomerLocations = [];
                this.selectedCustomerLocations.push(res);
            }
            if (this.sliderType === this.sliderTypeEnum.Platforms) {
                if (this.expandedRobotDroneViewState() === 'out')
                    this.toggleExpandedRobotDroneView();
            }
        }
    };
    DashboardSlider.prototype.robotDroneClicked = function (manufacturer, event) {
        if (manufacturer) {
            var robotDrones = this.robotAndDronesMap.get(manufacturer);
            if (robotDrones) {
                if (robotDrones.length === 1) {
                    //if (robotDrones[0].PatrolSubmitted) {
                    this.showSliderData(robotDrones[0], event);
                    //}
                }
                else if (robotDrones.length > 1) {
                    this.toggleExpandedRobotDroneView();
                }
            }
        }
    };
    DashboardSlider.prototype.showSliderData = function (data, event) {
        if (event)
            event.stopPropagation();
        this.orientation === 'none';
        if (this.sliderType === this.sliderTypeEnum.Locations) {
            //this.dashboaradAlarmService.setLOIFilter(data);
            this.sliderData.emit(data);
        }
        if (this.sliderType === this.sliderTypeEnum.Platforms) {
            if (this.expandedRobotDroneViewState() === 'out')
                this.toggleExpandedRobotDroneView();
            //if (data.PatrolSubmitted) {
            //this.robotDroneFilter = data;
            //this.dashboardPatrolService.setRobotDroneFilter(data);
            this.sliderData.emit(data);
            //}
        }
    };
    DashboardSlider.prototype.isShowable = function () {
        var show = true;
        if (this.sliderType === this.sliderTypeEnum.Locations) {
            if (this.getSelectedLocationCount() <= 1)
                show = false;
        }
        if (this.sliderType === this.sliderTypeEnum.Platforms) {
            if (this.robotAndDronesMap.size <= 1)
                show = false;
        }
        return show;
    };
    DashboardSlider.prototype.getSelectedLocationCount = function () {
        var customers = this.dashboardService.getAllTenantLocations();
        if (customers) {
            var totalSelCount = 0;
            for (var _i = 0, customers_1 = customers; _i < customers_1.length; _i++) {
                var cust = customers_1[_i];
                //per UX only show locations with P1 and P2 Alarms
                var selectedLoc = (cust.Locations.filter(function (c) { return c.Selected === true && (c.Priority === '1' || c.Priority === '2'); }).length);
                totalSelCount = totalSelCount + selectedLoc;
            }
            return totalSelCount;
        }
        return 0;
    };
    DashboardSlider.prototype.expandedRobotDroneViewState = function () {
        if (this.robotDroneExpanded) {
            return 'out';
        }
        return 'in';
    };
    DashboardSlider.prototype.toggleExpandedRobotDroneView = function () {
        event.stopPropagation();
        this.robotDroneExpanded = !this.robotDroneExpanded;
    };
    DashboardSlider.prototype.handleLoadedAlarmsData = function () {
        if (this.sliderType === this.sliderTypeEnum.Locations) {
            this.customers = [];
            this.setLocationOfInterest();
        }
    };
    DashboardSlider.prototype.handleNewAlarm = function () {
        if (this.sliderType === this.sliderTypeEnum.Locations) {
            this.customers = [];
            this.setLocationOfInterest();
        }
        //if (this.sliderType === this.sliderTypeEnum.Platforms) {
        //    this.platforms = this.dashboardPlatformService.getPlatforms();
        //    this.initRobotsAndDronesOnPatrols();
        //}
    };
    DashboardSlider.prototype.handleRemovedAlarm = function () {
        if (this.sliderType === this.sliderTypeEnum.Locations) {
            this.customers = [];
            this.setLocationOfInterest();
        }
        //if (this.sliderType === this.sliderTypeEnum.Platforms) {
        //    this.platforms = this.dashboardPlatformService.getPlatforms();
        //    this.initRobotsAndDronesOnPatrols();
        //}
    };
    DashboardSlider.prototype.handleUpdatedPatrolData = function () {
        if (this.sliderType === this.sliderTypeEnum.Platforms) {
            this.platforms = this.dashboardPlatformService.getPlatforms();
            this.initRobotsAndDronesOnPatrols();
        }
    };
    DashboardSlider.prototype.handleUpdateAlarmData = function () {
        if (this.sliderType === this.sliderTypeEnum.Locations) {
            this.customers = [];
            this.setLocationOfInterest();
        }
    };
    ////////////////////////////////////////////
    //Location of Interest Methods
    ///////////////////////////////////////////
    DashboardSlider.prototype.setLocationOfInterest = function () {
        //get filtered and timeframed data
        var alarms = this.dashboaradAlarmService.getAlarms();
        var cust = this.dashboardService.getAllTenantLocations();
        if (cust) {
            var cl = [];
            var _loop_1 = function (c) {
                var selLoc = void 0;
                //per UX only show locations with P1 and P2 Alarms
                //selLoc = c.Locations.filter(location => location.Selected);
                selLoc = c.Locations.filter(function (location) { return location.Selected === true && (location.Priority === '1' || location.Priority === '2'); });
                var _loop_2 = function (l) {
                    var lPriorityCountStr = '';
                    var lPriorityCount = alarms.filter(function (a) { return ((a.TenantId === c.Id) &&
                        (a.LocationId === l.Id) &&
                        (a.Priority === parseInt(l.Priority))); }).length;
                    if (lPriorityCount >= 100)
                        lPriorityCountStr = '99+';
                    else
                        lPriorityCountStr = lPriorityCount.toString();
                    var ps = this_1.dashboaradAlarmService.getAlarmPriorityDefn(l.Priority);
                    ps = ps + ' Priority'; //(P' + l.Priority + ')';
                    cl.push({
                        ID: c.Id,
                        Name: c.CustomerName,
                        LocationID: l.Id,
                        LocationName: l.Name,
                        LocationCity: l.City,
                        LocationState: l.State,
                        Priority: l.Priority,
                        PriorityString: ps,
                        PriorityCount: lPriorityCountStr
                    });
                };
                for (var _i = 0, selLoc_1 = selLoc; _i < selLoc_1.length; _i++) {
                    var l = selLoc_1[_i];
                    _loop_2(l);
                }
                ;
            };
            var this_1 = this;
            for (var _i = 0, cust_1 = cust; _i < cust_1.length; _i++) {
                var c = cust_1[_i];
                _loop_1(c);
            }
            ;
            this.customers = cl;
            this.selectedCustomerLocations = [];
            if (this.customers.length > 0)
                this.selectedCustomerLocations.push(this.customers[0]);
        }
        else {
            //there are no selected locations
            this.selectedCustomerLocations = [];
            this.customers = [];
        }
        this.changeDetectorRef.detectChanges();
    };
    DashboardSlider.prototype.updateLocationOfInterest = function () {
        if (this.customers) {
            var tenants = this.dashboardService.getAllTenantLocations();
            var _loop_3 = function (customer) {
                var t = tenants.filter(function (t) { return t.Id === customer.ID; });
                if (t) {
                    var tenant = t[0];
                    var locs = tenant.Locations.filter(function (l) { return l.Id === customer.LocationID; });
                    if (locs) {
                        customer.Priority = locs[0].Priority;
                    }
                }
            };
            for (var _i = 0, _a = this.customers; _i < _a.length; _i++) {
                var customer = _a[_i];
                _loop_3(customer);
            }
            this.changeDetectorRef.detectChanges();
        }
    };
    ////////////////////////////////////////////
    //Robot And Drones Methods
    ///////////////////////////////////////////
    DashboardSlider.prototype.initRobotsAndDronesOnPatrols = function () {
        //clear the map
        this.robotAndDronesMap.clear();
        var platformList = [];
        var histPatrols;
        if (this.dashboardService.getSelectedTimeframe() !== FilterTimeframe.Current) {
            //get all the historical patrols
            histPatrols = this.dashboardPatrolService.getPatrols();
            //get a unique list of patform IDs that ran the historical patrols
            var platformIDs_1 = [];
            var uniqueHistPlatforms = histPatrols.map(function (p) {
                if (p.PlatformId && (!platformIDs_1.includes(p.PlatformId)))
                    platformIDs_1.push(p.PlatformId);
            });
            //get the platforms that ran the patrols
            for (var _i = 0, platformIDs_2 = platformIDs_1; _i < platformIDs_2.length; _i++) {
                var hp = platformIDs_2[_i];
                var platform = this.dashboardPlatformService.getPlatform(hp);
                if (platform) {
                    platformList.push(platform);
                }
            }
        }
        else {
            //we are in a current condition
            platformList = this.platforms;
        }
        var _loop_4 = function (p) {
            if (p.Manufacturer) {
                var loc = this_2.dashboardService.getLocation(p.TenantId, p.LocationId);
                var histPatrolCount = 0;
                if (histPatrols)
                    histPatrolCount = histPatrols.filter(function (hp) { return hp.PlatformId === p.id; }).length;
                var platformPatrol = void 0;
                if (p.IsPatrolSubmitted) {
                    platformPatrol = this_2.dashboardPatrolService.getPatrolInstanceByPlatformId(p.id);
                }
                if (!this_2.robotAndDronesMap.has(p.Manufacturer)) {
                    //the manufacture does not exist in the dictionary so add it
                    var robotAndDrones = [{
                            ID: p.id,
                            DisplayName: p.DisplayName,
                            Manufacturer: p.Manufacturer,
                            LocationName: (loc) ? loc.Name : '',
                            PatrolTemplateID: (platformPatrol) ? platformPatrol.TemplateId : '',
                            Patrol: platformPatrol,
                            HistoricalPatrolsCount: histPatrolCount,
                            PatrolSubmitted: p.IsPatrolSubmitted
                        }];
                    this_2.robotAndDronesMap.set(p.Manufacturer, robotAndDrones);
                }
                else {
                    //the manufacture already exist in the dictionary so just add robot/drone
                    var robotAndDrones = this_2.robotAndDronesMap.get(p.Manufacturer);
                    var robotAndDrone = {
                        ID: p.id,
                        DisplayName: p.DisplayName,
                        Manufacturer: p.Manufacturer,
                        LocationName: (loc) ? loc.Name : '',
                        PatrolTemplateID: (platformPatrol) ? platformPatrol.TemplateId : '',
                        Patrol: platformPatrol,
                        HistoricalPatrolsCount: histPatrolCount,
                        PatrolSubmitted: p.IsPatrolSubmitted
                    };
                    robotAndDrones.push(robotAndDrone);
                }
            }
        };
        var this_2 = this;
        for (var _a = 0, platformList_1 = platformList; _a < platformList_1.length; _a++) {
            var p = platformList_1[_a];
            _loop_4(p);
        }
        /////////////////////////////////////////////////
        ////TEST DATA - REMOVE LATER
        /////////////////////////////////////////////////
        //let robotAndDrones: RobotAndDrone[] = [{
        //    ID: "c6f59624-018f-4a9c-89b2-96213966e4ea",
        //    DisplayName: "Adept 1",
        //    Manufacturer: "adept",
        //    //PatrolStatus: PatrolStatus.Successful,
        //    LocationName: 'Headquarters',
        //    PatrolTemplateID: '118f0b9c-5e26-4bcb-a388-28447da91f27',
        //    Patrol: JSON.parse(`{
        //        "InstanceId": "018f0b9c-5e26-4bcb-a388-28447da91f29",
        //        "RunNumber": 1,
        //        "MaxRunNumber": 0,
        //        "LastUpdateTime": 1496953858774.7686,
        //        "SubmittedTime": 1496953772269,
        //        "StartedTime": 1496932181000,
        //        "EndedTime": 1496932253000,
        //        "UserName": "live.com#ricky.crow@hexagonsi.com",
        //        "PlatformId": "Gamma2Platform8",
        //        "CurrentStatus": 2,
        //        "StatusHistory": [
        //            {
        //                "Status": 1,
        //                "ReportedTime": 1496932181000
        //            },
        //            {
        //                "Status": 2,
        //                "ReportedTime": 1496932253000
        //            }
        //        ],
        //        "Points": [
        //            {
        //                "CurrentStatus": 2,
        //                "StatusHistory": [
        //                    {
        //                        "Status": 1,
        //                        "ReportedTime": 1496932181000
        //                    },
        //                    {
        //                        "Status": 2,
        //                        "ReportedTime": 1496932197000
        //                    },
        //                    {
        //                        "Status": 2,
        //                        "ReportedTime": 1496932197000
        //                    }
        //                ],
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "37be6939-2f91-4517-b8a3-2814b7721df1",
        //                "DisplayName": "Point 1",
        //                "Ordinal": 1,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07318653166296,
        //                        39.650303647176194
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 2,
        //                "StatusHistory": [
        //                    {
        //                        "Status": 1,
        //                        "ReportedTime": 1496932197000
        //                    },
        //                    {
        //                        "Status": 2,
        //                        "ReportedTime": 1496932220000
        //                    }
        //                ],
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "e6910174-6197-435f-976c-e13a876229e0",
        //                "DisplayName": "Point 2",
        //                "Ordinal": 2,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07311914116146,
        //                        39.65030338902922
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 2,
        //                "StatusHistory": [
        //                    {
        //                        "Status": 1,
        //                        "ReportedTime": 1496932220000
        //                    },
        //                    {
        //                        "Status": 1,
        //                        "ReportedTime": 1496932220000
        //                    },
        //                    {
        //                        "Status": 2,
        //                        "ReportedTime": 1496932228000
        //                    },
        //                    {
        //                        "Status": 2,
        //                        "ReportedTime": 1496932228000
        //                    }
        //                ],
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "a5aa5fdc-3bc0-4548-95f8-1860b5485472",
        //                "DisplayName": "Point 3",
        //                "Ordinal": 3,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07310640066864,
        //                        39.65028686762152
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 2,
        //                "StatusHistory": [
        //                    {
        //                        "Status": 1,
        //                        "ReportedTime": 1496932228000
        //                    },
        //                    {
        //                        "Status": 2,
        //                        "ReportedTime": 1496932237000
        //                    }
        //                ],
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "758f77e8-54b9-4da7-9485-d2c2c3ad09ff",
        //                "DisplayName": "Point 4",
        //                "Ordinal": 4,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07313255220654,
        //                        39.65028273726896
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 2,
        //                "StatusHistory": [
        //                    {
        //                        "Status": 1,
        //                        "ReportedTime": 1496932237000
        //                    },
        //                    {
        //                        "Status": 1,
        //                        "ReportedTime": 1496932237000
        //                    },
        //                    {
        //                        "Status": 2,
        //                        "ReportedTime": 1496932253000
        //                    }
        //                ],
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "766aa45e-356b-45c3-ba37-9e508b80e280",
        //                "DisplayName": "Point 5",
        //                "Ordinal": 5,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07318720221522,
        //                        39.65028609318042
        //                    ],
        //                    "type": "Point"
        //                }
        //            }
        //        ],
        //        "AlarmIds": ["5f962590-798f-410a-aaeb-4c428508a59a", "365f4d54-42d0-4ec0-9302-b4e7d0149f42"],
        //        "TemplateId": "118f0b9c-5e26-4bcb-a388-28447da91f27",
        //        "DisplayName": "Night Patrol",
        //        "Description": null,
        //        "Type": 0,
        //        "IsTemplate": false,
        //        "IsDeleted": false,
        //        "AreaType": 2,
        //        "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
        //        "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
        //        "Version": 0,
        //        "id": "5c3a6aab-3725-4b2a-a577-6ad95c3adb66"
        //    }`),
        //    //PatrolName: 'Night Patrol',
        //    PatrolSubmitted: true
        //}];
        //this.robotAndDronesMap.set("adept", robotAndDrones);
        //let robotAndDrone: RobotAndDrone = {
        //    ID: "a7f59624-018f-4a9c-89b2-96213966e4ea",
        //    DisplayName: "Adept 2",
        //    Manufacturer: "adept",
        //    //PatrolStatus: PatrolStatus.Successful,
        //    LocationName: 'Headquarters',
        //    PatrolTemplateID: '218f0b9c-5e26-4bcb-a388-28447da91f25',
        //    Patrol: JSON.parse(`{ 
        //        "InstanceId": "9d3dc9cf-ce31-48ac-b75c-c122b805efc3",
        //        "RunNumber": 1,
        //        "MaxRunNumber": 0,
        //        "LastUpdateTime": 1497119477127.409,
        //        "SubmittedTime": 1497119457874,
        //        "StartedTime": 1497119469000,
        //        "EndedTime": 0,
        //        "UserName": "live.com#jeremy.leshko@hexagonsi.com",
        //        "PlatformId": "Gamma2Platform0",
        //        "CurrentStatus": 6,
        //        "StatusHistory": [
        //            {
        //                "Status": 1,
        //                "ReportedTime": 1497119469000
        //            },
        //            {
        //                "Status": 6,
        //                "ReportedTime": 1497119477127.409
        //            }
        //        ],
        //        "Points": [
        //            {
        //                "CurrentStatus": 1,
        //                "StatusHistory": [
        //                    {
        //                        "Status": 1,
        //                        "ReportedTime": 1497119469000
        //                    }
        //                ],
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "37be6939-2f91-4517-b8a3-2814b7721df1",
        //                "DisplayName": "Point 1",
        //                "Ordinal": 1,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07325693964958,
        //                        39.65030054941254
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 0,
        //                "StatusHistory": null,
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "e6910174-6197-435f-976c-e13a876229e0",
        //                "DisplayName": "Point 2",
        //                "Ordinal": 2,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.0732106715441,
        //                        39.65031448934783
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 0,
        //                "StatusHistory": null,
        //                "Actions": [
        //                    {
        //                        "CurrentStatus": 0,
        //                        "StatusHistory": null,
        //                        "AlarmIds": null,
        //                        "Image": null,
        //                        "ActionId": "3a64998f-7be0-45ce-a26b-3a39cdb9dea4",
        //                        "Command": 26,
        //                        "Parameters": [
        //                            {
        //                                "Name": 5,
        //                                "Value": "3",
        //                                "Type": 0
        //                            }
        //                        ]
        //                    },
        //                    {
        //                        "CurrentStatus": 0,
        //                        "StatusHistory": null,
        //                        "AlarmIds": null,
        //                        "Image": null,
        //                        "ActionId": "46945abd-0099-4117-a285-eb1f3119b271",
        //                        "Command": 3,
        //                        "Parameters": []
        //                    },
        //                    {
        //                        "CurrentStatus": 0,
        //                        "StatusHistory": null,
        //                        "AlarmIds": null,
        //                        "Image": null,
        //                        "ActionId": "cb53bc68-0d03-426d-989c-9aea0c690000",
        //                        "Command": 2,
        //                        "Parameters": []
        //                    }
        //                ],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "a5aa5fdc-3bc0-4548-95f8-1860b5485472",
        //                "DisplayName": "Checkpoint 1",
        //                "Ordinal": 3,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.0732022896409,
        //                        39.65029435388487
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 0,
        //                "StatusHistory": null,
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "758f77e8-54b9-4da7-9485-d2c2c3ad09ff",
        //                "DisplayName": "Point 4",
        //                "Ordinal": 4,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07321368902923,
        //                        39.65028196282784
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 0,
        //                "StatusHistory": null,
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "766aa45e-356b-45c3-ba37-9e508b80e280",
        //                "DisplayName": "Point 5",
        //                "Ordinal": 5,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07325258105996,
        //                        39.65028222097489
        //                    ],
        //                    "type": "Point"
        //                }
        //            }
        //        ],
        //        "AlarmIds": null,
        //        "TemplateId": "218f0b9c-5e26-4bcb-a388-28447da91f25",
        //        "DisplayName": "Main Hallway",
        //        "Description": null,
        //        "Type": 0,
        //        "IsTemplate": false,
        //        "IsDeleted": false,
        //        "AreaType": 2,
        //        "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
        //        "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
        //        "Version": 0,
        //        "id": "9d3dc9cf-ce31-48ac-b75c-c122b805efc3"
        //    }`),
        //    //PatrolName: 'Main Hallway',
        //    PatrolSubmitted: true
        //};
        //this.robotAndDronesMap.get("adept").push(robotAndDrone);
        //robotAndDrones = [{
        //    ID: "aea35a45-573a-498b-a391-7df02dadfff4",
        //    DisplayName: "Generic 1",
        //    Manufacturer: "generic",
        //    //PatrolStatus: PatrolStatus.Successful,
        //    LocationName: 'Headquarters',
        //    PatrolTemplateID: 'f8020889-03bf-46c6-a4cc-8e9751f9bf98',
        //    Patrol: JSON.parse(`{ "InstanceId": "f8020889-03bf-46c6-a4cc-8e9751f9bf98",
        //        "RunNumber": 1,
        //        "MaxRunNumber": 0,
        //        "LastUpdateTime": 1496954948019.3616,
        //        "SubmittedTime": 1496954879270,
        //        "StartedTime": 1496933286000,
        //        "EndedTime": 1496933343000,
        //        "UserName": "live.com#ricky.crow@hexagonsi.com",
        //        "PlatformId": "Gamma2Platform8",
        //        "CurrentStatus": 2,
        //        "StatusHistory": [
        //            {
        //                "Status": 1,
        //                "ReportedTime": 1496933286000
        //            },
        //            {
        //                "Status": 2,
        //                "ReportedTime": 1496933343000
        //            }
        //        ],
        //        "Points": [
        //            {
        //                "CurrentStatus": 2,
        //                "StatusHistory": [
        //                    {
        //                        "Status": 1,
        //                        "ReportedTime": 1496933286000
        //                    },
        //                    {
        //                        "Status": 2,
        //                        "ReportedTime": 1496933298000
        //                    }
        //                ],
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "87f4c9c4-26b8-4953-b9ad-511c6f140868",
        //                "DisplayName": "Point 1",
        //                "Ordinal": 1,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07316112925764,
        //                        39.65031139158466
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 2,
        //                "StatusHistory": [
        //                    {
        //                        "Status": 1,
        //                        "ReportedTime": 1496933298000
        //                    },
        //                    {
        //                        "Status": 2,
        //                        "ReportedTime": 1496933313000
        //                    }
        //                ],
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "a9f79ea8-39f2-44d8-8542-39d11e324317",
        //                "DisplayName": "Point 2",
        //                "Ordinal": 2,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07311184366702,
        //                        39.650309584556105
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 2,
        //                "StatusHistory": [
        //                    {
        //                        "Status": 1,
        //                        "ReportedTime": 1496933313000
        //                    },
        //                    {
        //                        "Status": 2,
        //                        "ReportedTime": 1496933320000
        //                    }
        //                ],
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "df0e4bda-c408-48c6-a5f3-c5014a560fbe",
        //                "DisplayName": "Point 3",
        //                "Ordinal": 3,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07309507986066,
        //                        39.650298484236735
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 2,
        //                "StatusHistory": [
        //                    {
        //                        "Status": 1,
        //                        "ReportedTime": 1496933320000
        //                    },
        //                    {
        //                        "Status": 2,
        //                        "ReportedTime": 1496933329000
        //                    }
        //                ],
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "5627b4e6-750b-47f7-b68e-7668a8d2e7cb",
        //                "DisplayName": "Point 4",
        //                "Ordinal": 4,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07308938016652,
        //                        39.650280413945545
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 2,
        //                "StatusHistory": [
        //                    {
        //                        "Status": 1,
        //                        "ReportedTime": 1496933329000
        //                    },
        //                    {
        //                        "Status": 2,
        //                        "ReportedTime": 1496933343000
        //                    }
        //                ],
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "bd332d76-c70c-457d-8013-93bb798076c8",
        //                "DisplayName": "Point 5",
        //                "Ordinal": 5,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07312525471208,
        //                        39.650304937911
        //                    ],
        //                    "type": "Point"
        //                }
        //            }
        //        ],
        //        "AlarmIds": null,
        //        "TemplateId": "f8020889-03bf-46c6-a4cc-8e9751f9bf98",
        //        "DisplayName": "Side Loading Dock",
        //        "Description": "This is a ricky note.",
        //        "Type": 0,
        //        "IsTemplate": false,
        //        "IsDeleted": false,
        //        "AreaType": 1,
        //        "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
        //        "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
        //        "Version": 0,
        //        "id": "8aa7197a-0655-443f-8463-1b11aff35b6f"
        //    }`),
        //    //PatrolName: 'Side Loading Dock',
        //    PatrolSubmitted: true
        //}];
        //this.robotAndDronesMap.set("generic", robotAndDrones);
        //robotAndDrones = [{
        //    ID: "37e4434a-0d2c-47d0-8bef-033ea5bd28a2",
        //    DisplayName: "Turtlebot 1",
        //    Manufacturer: "turtlebot",
        //    //PatrolStatus: PatrolStatus.Successful,
        //    LocationName: 'Headquarters',
        //    PatrolTemplateID: '318f0b9c-5e26-4bcb-a388-28447da91f24',
        //    Patrol: JSON.parse(`{ 
        //        "InstanceId": "6d3dc9cf-ce31-48ac-b75c-c122b805efd2",
        //        "RunNumber": 1,
        //        "MaxRunNumber": 0,
        //        "LastUpdateTime": 1497119477127.409,
        //        "SubmittedTime": 1497119457874,
        //        "StartedTime": 1497119469000,
        //        "EndedTime": 0,
        //        "UserName": "live.com#jeremy.leshko@hexagonsi.com",
        //        "PlatformId": "Gamma2Platform0",
        //        "CurrentStatus": 1,
        //        "StatusHistory": [
        //            {
        //                "Status": 1,
        //                "ReportedTime": 1497119469000
        //            }
        //        ],
        //        "Points": [
        //            {
        //                "CurrentStatus": 2,
        //                "StatusHistory": [
        //                    {
        //                        "Status": 1,
        //                        "ReportedTime": 1497119469000
        //                    },
        //                    {
        //                        "Status": 2,
        //                        "ReportedTime": 1497119477127.409
        //                    }
        //                ],
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "37be6939-2f91-4517-b8a3-2814b7721df1",
        //                "DisplayName": "Point 1",
        //                "Ordinal": 1,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07325693964958,
        //                        39.65030054941254
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 1,
        //                "StatusHistory": [
        //                    {
        //                        "Status": 1,
        //                        "ReportedTime": 1497119477128
        //                    }
        //                ],
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "e6910174-6197-435f-976c-e13a876229e0",
        //                "DisplayName": "Point 2",
        //                "Ordinal": 2,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.0732106715441,
        //                        39.65031448934783
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 0,
        //                "StatusHistory": null,
        //                "Actions": [
        //                    {
        //                        "CurrentStatus": 0,
        //                        "StatusHistory": null,
        //                        "AlarmIds": null,
        //                        "Image": null,
        //                        "ActionId": "3a64998f-7be0-45ce-a26b-3a39cdb9dea4",
        //                        "Command": 26,
        //                        "Parameters": [
        //                            {
        //                                "Name": 5,
        //                                "Value": "3",
        //                                "Type": 0
        //                            }
        //                        ]
        //                    },
        //                    {
        //                        "CurrentStatus": 0,
        //                        "StatusHistory": null,
        //                        "AlarmIds": null,
        //                        "Image": null,
        //                        "ActionId": "46945abd-0099-4117-a285-eb1f3119b271",
        //                        "Command": 3,
        //                        "Parameters": []
        //                    },
        //                    {
        //                        "CurrentStatus": 0,
        //                        "StatusHistory": null,
        //                        "AlarmIds": null,
        //                        "Image": null,
        //                        "ActionId": "cb53bc68-0d03-426d-989c-9aea0c690000",
        //                        "Command": 2,
        //                        "Parameters": []
        //                    }
        //                ],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "a5aa5fdc-3bc0-4548-95f8-1860b5485472",
        //                "DisplayName": "Checkpoint 1",
        //                "Ordinal": 3,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.0732022896409,
        //                        39.65029435388487
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 0,
        //                "StatusHistory": null,
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "758f77e8-54b9-4da7-9485-d2c2c3ad09ff",
        //                "DisplayName": "Point 4",
        //                "Ordinal": 4,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07321368902923,
        //                        39.65028196282784
        //                    ],
        //                    "type": "Point"
        //                }
        //            },
        //            {
        //                "CurrentStatus": 0,
        //                "StatusHistory": null,
        //                "Actions": [],
        //                "AlarmIds": null,
        //                "Telemetry": null,
        //                "PointId": "766aa45e-356b-45c3-ba37-9e508b80e280",
        //                "DisplayName": "Point 5",
        //                "Ordinal": 5,
        //                "Description": null,
        //                "Position": {
        //                    "coordinates": [
        //                        -105.07325258105996,
        //                        39.65028222097489
        //                    ],
        //                    "type": "Point"
        //                }
        //            }
        //        ],
        //        "AlarmIds": null,
        //        "TemplateId": "318f0b9c-5e26-4bcb-a388-28447da91f24",
        //        "DisplayName": "Standard Loading Dock",
        //        "Description": null,
        //        "Type": 0,
        //        "IsTemplate": false,
        //        "IsDeleted": false,
        //        "AreaType": 2,
        //        "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
        //        "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
        //        "Version": 0,
        //        "id": "6d3dc9cf-ce31-48ac-b75c-c122b805efd2"
        //     }`),
        //    //PatrolName: 'Standard Loading Dock',
        //    PatrolSubmitted: true
        //}];
        //this.robotAndDronesMap.set("turtlebot", robotAndDrones);
        /////////////////////////////////////////////////
        /////////////////////////////////////////////////
        this.changeDetectorRef.detectChanges();
    };
    DashboardSlider.prototype.handleLoadedPlatformData = function () {
        this.platforms = this.dashboardPlatformService.getPlatforms();
        if (this.sliderType === this.sliderTypeEnum.Platforms) {
            if (this.platforms)
                this.initRobotsAndDronesOnPatrols();
        }
    };
    DashboardSlider.prototype.handleLoadedPatrolData = function () {
        var patrols = this.dashboardPatrolService.getPatrols();
        if (patrols) {
            if (this.platforms) {
                var _loop_5 = function (patrol) {
                    var pls = this_3.platforms.filter(function (pl) { return pl.id === patrol.PlatformId; });
                    if (pls) {
                        var platform = pls[0];
                        this_3.updateRobotAndDroneData(patrol, platform);
                    }
                };
                var this_3 = this;
                for (var _i = 0, patrols_1 = patrols; _i < patrols_1.length; _i++) {
                    var patrol = patrols_1[_i];
                    _loop_5(patrol);
                }
            }
        }
        //this.changeDetectorRef.detectChanges();
    };
    DashboardSlider.prototype.handleNewPatrolInstance = function (patrol) {
        if (patrol) {
            if (this.platforms) {
                var pls = this.platforms.filter(function (pl) { return pl.id === patrol.PlatformId; });
                if (pls) {
                    var platform = pls[0];
                    this.updateRobotAndDroneData(patrol, platform);
                }
            }
        }
        //this.changeDetectorRef.detectChanges();
    };
    DashboardSlider.prototype.handleUpdatedPatrolInstance = function (patrol) {
        //just need to update the patrol status
        //fire change detection to let the html invoke the method to get the status
        this.changeDetectorRef.detectChanges();
    };
    DashboardSlider.prototype.handleCompletededPatrolInstance = function (patrol) {
        if (patrol) {
            if (this.platforms) {
                var pls = this.platforms.filter(function (pl) { return pl.id === patrol.PlatformId; });
                if (pls) {
                    var platform = pls[0];
                    this.clearRobotAndDroneData(patrol, platform);
                }
            }
        }
        //this.changeDetectorRef.detectChanges();
    };
    DashboardSlider.prototype.handleLoadedPatrolTemplateData = function () {
        var patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();
        if (patrolTemplates) {
            if (this.platforms) {
                var _loop_6 = function (template) {
                    var pls = this_4.platforms.filter(function (pl) { return pl.id === template.PlatformSubmittedId; });
                    if (pls) {
                        var platform = pls[0];
                        this_4.updateRobotAndDroneData(template, platform);
                    }
                };
                var this_4 = this;
                for (var _i = 0, patrolTemplates_1 = patrolTemplates; _i < patrolTemplates_1.length; _i++) {
                    var template = patrolTemplates_1[_i];
                    _loop_6(template);
                }
            }
        }
        //this.changeDetectorRef.detectChanges();
    };
    DashboardSlider.prototype.handleUpdatePatrolTemplate = function (template) {
        //let patrolTemplates: PatrolTemplate[] = this.dashboardPatrolService.getPatrolTemplates();
        if (template) {
            if (this.platforms) {
                var pls = this.platforms.filter(function (pl) { return pl.id === template.PlatformSubmittedId; });
                if (pls) {
                    var platform = pls[0];
                    this.updateRobotAndDroneData(template, platform);
                }
            }
        }
        //this.changeDetectorRef.detectChanges();
    };
    DashboardSlider.prototype.updateRobotAndDroneData = function (patrol, platform) {
        if ((patrol) && (platform)) {
            var robotDrones = this.robotAndDronesMap.get(platform.Manufacturer);
            if (robotDrones) {
                var rds = robotDrones.filter(function (rd) { return rd.ID === platform.id; });
                if (rds) {
                    var robotDrone = rds[0];
                    if (robotDrone) {
                        robotDrone.PatrolTemplateID = patrol.TemplateId;
                        if (isPatrolInstance(patrol))
                            robotDrone.Patrol = patrol;
                        robotDrone.PatrolSubmitted = isPatrolInstance(patrol) ? true : patrol.IsPatrolSubmitted;
                        this.changeDetectorRef.detectChanges();
                    }
                }
            }
        }
    };
    DashboardSlider.prototype.clearRobotAndDroneData = function (patrol, platform) {
        if ((patrol) && (platform)) {
            var robotDrones = this.robotAndDronesMap.get(platform.Manufacturer);
            if (robotDrones) {
                var rds = robotDrones.filter(function (rd) { return rd.ID === platform.id; });
                if (rds) {
                    var robotDrone = rds[0];
                    if (robotDrone) {
                        robotDrone.PatrolTemplateID = '';
                        robotDrone.Patrol = null;
                        robotDrone.PatrolSubmitted = false;
                        this.changeDetectorRef.detectChanges();
                    }
                }
            }
        }
    };
    DashboardSlider.prototype.getRobotAndDroneTotalPatrolCount = function (manufacture) {
        var patrolCount = 0;
        if (manufacture) {
            if (this.robotAndDronesMap.has(manufacture)) {
                var robotAndDroneArray = this.robotAndDronesMap.get(manufacture);
                if (robotAndDroneArray) {
                    if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                        patrolCount = robotAndDroneArray.filter(function (rd) { return rd.PatrolSubmitted === true; }).length;
                    }
                    else {
                        for (var _i = 0, robotAndDroneArray_1 = robotAndDroneArray; _i < robotAndDroneArray_1.length; _i++) {
                            var robotDrone = robotAndDroneArray_1[_i];
                            patrolCount = patrolCount + robotDrone.HistoricalPatrolsCount;
                        }
                    }
                }
            }
        }
        return patrolCount;
    };
    DashboardSlider.prototype.getRobotAndDronePatrolCount = function (manufacture) {
        var patrolCount = 0;
        if (manufacture) {
            if (this.robotAndDronesMap.has(manufacture)) {
                var robotAndDroneArray = this.robotAndDronesMap.get(manufacture);
                if (robotAndDroneArray) {
                    if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                        patrolCount = robotAndDroneArray.filter(function (rd) { return rd.PatrolSubmitted === true; }).length;
                    }
                    else {
                        for (var _i = 0, robotAndDroneArray_2 = robotAndDroneArray; _i < robotAndDroneArray_2.length; _i++) {
                            var robotDrone = robotAndDroneArray_2[_i];
                            if (robotDrone.HistoricalPatrolsCount > 0)
                                patrolCount = patrolCount + 1;
                        }
                    }
                }
            }
        }
        return patrolCount;
    };
    DashboardSlider.prototype.getRobotAndDronePatrolManufacturerStatus = function (manufacturer) {
        var patrolStatus = PatrolStatus.None;
        if (manufacturer) {
            if (this.robotAndDronesMap.has(manufacturer)) {
                var robotAndDroneArray = this.robotAndDronesMap.get(manufacturer);
                var patrols = robotAndDroneArray.map(function (x) { return x.Patrol; });
                var submittedTemplates = robotAndDroneArray.map(function (x) { return x.PatrolTemplateID; });
                var failedCount = 0;
                var errorCount = 0;
                var warningCount = 0;
                var successfulCount = 0;
                for (var _i = 0, patrols_2 = patrols; _i < patrols_2.length; _i++) {
                    var patrol = patrols_2[_i];
                    var patrolStatusObj = this.dashboardPatrolService.getPatrolStatusObj(patrol);
                    if (patrolStatusObj) {
                        switch (patrolStatusObj.Status) {
                            case PatrolStatus.Critical:
                                failedCount++;
                                break;
                            case PatrolStatus.Incomplete:
                                errorCount++;
                                break;
                            case PatrolStatus.Warning:
                                warningCount++;
                                break;
                            case PatrolStatus.Healthy:
                            case PatrolStatus.Successful:
                                successfulCount++;
                                break;
                            default:
                                break;
                        }
                    }
                }
                if (failedCount > 0)
                    patrolStatus = PatrolStatus.Critical;
                else if (errorCount > 0)
                    patrolStatus = PatrolStatus.Incomplete;
                else if (warningCount > 0)
                    patrolStatus = PatrolStatus.Warning;
                else if (successfulCount > 0)
                    patrolStatus = PatrolStatus.Successful;
                else
                    patrolStatus = PatrolStatus.Successful;
            }
        }
        return PatrolStatus[patrolStatus].toString().toLocaleLowerCase();
    };
    DashboardSlider.prototype.getRobotAndDronePatrolStatus = function (patrol) {
        var patrolStatus = PatrolStatus.None;
        var failedCount = 0;
        var errorCount = 0;
        var warningCount = 0;
        var successfulCount = 0;
        if (patrol) {
            var patrolStatusObj = this.dashboardPatrolService.getPatrolStatusObj(patrol);
            if (patrolStatusObj) {
                switch (patrolStatusObj.Status) {
                    case PatrolStatus.Critical:
                        failedCount++;
                        break;
                    case PatrolStatus.Incomplete:
                        errorCount++;
                        break;
                    case PatrolStatus.Warning:
                        warningCount++;
                        break;
                    case PatrolStatus.Healthy:
                    case PatrolStatus.Successful:
                        successfulCount++;
                        break;
                    default:
                        break;
                }
            }
            if (failedCount > 0)
                patrolStatus = PatrolStatus.Critical;
            else if (errorCount > 0)
                patrolStatus = PatrolStatus.Incomplete;
            else if (warningCount > 0)
                patrolStatus = PatrolStatus.Warning;
            else if (successfulCount > 0)
                patrolStatus = PatrolStatus.Successful;
        }
        else {
            patrolStatus = PatrolStatus.None;
        }
        return PatrolStatus[patrolStatus].toString().toLocaleLowerCase();
    };
    DashboardSlider.prototype.getRobotAndDroneManufactureCount = function (manufacture) {
        var patrolCount = 0;
        if (manufacture) {
            if (this.robotAndDronesMap.has(manufacture)) {
                var robotAndDroneArray = this.robotAndDronesMap.get(manufacture);
                if (robotAndDroneArray) {
                    patrolCount = robotAndDroneArray.length;
                }
            }
        }
        return patrolCount;
    };
    DashboardSlider.prototype.getRobotAndDrone = function (manufacture) {
        var robotAndDroneArray;
        if (manufacture) {
            if (this.robotAndDronesMap.has(manufacture)) {
                robotAndDroneArray = this.robotAndDronesMap.get(manufacture);
            }
        }
        return robotAndDroneArray;
    };
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], DashboardSlider.prototype, "sliderType", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], DashboardSlider.prototype, "sliderData", void 0);
    DashboardSlider = __decorate([
        Component({
            selector: 'dashboard-slider',
            animations: [
                trigger('friendAnimation', [
                    transition('void => prev', // ---> Entering --->
                    [
                        // In order to maintain a zIndex of 2 throughout the ENTIRE
                        // animation (but not after the animation), we have to define it
                        // in both the initial and target styles. Unfortunately, this
                        // means that we ALSO have to define target values for the rest
                        // of the styles, which we wouldn't normally have to.
                        style({
                            left: -100,
                            opacity: 0.0,
                            zIndex: 2
                        }),
                        animate('200ms ease-in-out', style({
                            left: 0,
                            opacity: 1.0,
                            zIndex: 2
                        }))
                    ]),
                    transition('prev => void', // ---> Leaving --->
                    [
                        animate('200ms ease-in-out', style({
                            left: 100,
                            opacity: 0.0
                        }))
                    ]),
                    transition('void => next', // <--- Entering <---
                    [
                        // In order to maintain a zIndex of 2 throughout the ENTIRE
                        // animation (but not after the animation), we have to define it
                        // in both the initial and target styles. Unfortunately, this
                        // means that we ALSO have to define target values for the rest
                        // of the styles, which we wouldn't normally have to.
                        style({
                            left: 100,
                            opacity: 0.0,
                            zIndex: 2
                        }),
                        animate('200ms ease-in-out', style({
                            left: 0,
                            opacity: 1.0,
                            zIndex: 2
                        }))
                    ]),
                    transition('next => void', // <--- Leaving <---
                    [
                        animate('200ms ease-in-out', style({
                            left: -100,
                            opacity: 0.0
                        }))
                    ])
                ]),
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
                ])
            ],
            templateUrl: 'dashboard-slider.component.html',
            styleUrls: ['dashboard-slider.component.css', 'dashboard.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [DashboardService,
            DashboardAlarmService,
            DashboardPatrolService,
            DashboardPlatformService,
            DashboardAlarmService,
            ChangeDetectorRef])
    ], DashboardSlider);
    return DashboardSlider;
}());
export { DashboardSlider };
//# sourceMappingURL=dashboard-slider.component.js.map