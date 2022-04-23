import {
    Component, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef, 
    animate, style, transition, trigger, state, EventEmitter
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { DashboardPatrolService } from './dashboard-patrol.service';
import { Location } from '../shared/location.class';
import { Tenant } from '../shared/tenant.class';
import {
    TenantLocation, SliderType, RobotAndDrone,
    PatrolStatus, PatrolStatusObj, FilterTimeframe
} from './dashboard';
import { Platform } from '../platforms/platform.class';
import { PatrolInstance, PatrolTemplate, isPatrolInstance } from '../patrols/patrol.class';
import { Alarm } from '../alarms/alarm.class';

import { SlickComponent } from 'ngx-slick';

type Orientation = ('prev' | 'next' | 'none');


//function isPatrolInstance(arg: PatrolInstance | PatrolTemplate): arg is PatrolInstance {
//    if (isPatrolInstance(arg[0])) {
//        return true;
//    } else {
//        return false;
//    }
//}

@Component({
    selector: 'dashboard-slider',
    animations: [
        trigger(
            'friendAnimation',
            [
                transition(
                    'void => prev', // ---> Entering --->
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
                        animate(
                            '200ms ease-in-out',
                            style({
                                left: 0,
                                opacity: 1.0,
                                zIndex: 2
                            })
                        )
                    ]
                ),
                transition(
                    'prev => void', // ---> Leaving --->
                    [
                        animate(
                            '200ms ease-in-out',
                            style({
                                left: 100,
                                opacity: 0.0
                            })
                        )
                    ]
                ),
                transition(
                    'void => next', // <--- Entering <---
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
                        animate(
                            '200ms ease-in-out',
                            style({
                                left: 0,
                                opacity: 1.0,
                                zIndex: 2
                            })
                        )
                    ]
                ),
                transition(
                    'next => void', // <--- Leaving <---
                    [
                        animate(
                            '200ms ease-in-out',
                            style({
                                left: -100,
                                opacity: 0.0
                            })
                        )
                    ]
                )
            ]
        ),
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
    templateUrl: 'dashboard-slider.component.html',
    styleUrls: ['dashboard-slider.component.css', 'dashboard.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class DashboardSlider {

    orientation: Orientation;
    sliderTypeEnum: typeof SliderType = SliderType;
    filterTimeframe: typeof FilterTimeframe = FilterTimeframe;

    //location data
    customers: TenantLocation[];
    selectedCustomerLocations: TenantLocation[] = [];

    //robot and drones data
    //key: manufacture, value: RobotAndDrone object
    robotAndDronesMap: Map<string, RobotAndDrone[]> = new Map<string, RobotAndDrone[]>();
    robotDroneExpanded: boolean = false;
    robotDroneFilter: RobotAndDrone = null;
    platforms: Platform[] = null;

    //Inputs
    @Input() sliderType: SliderType;
    @Output() sliderData: EventEmitter<any> = new EventEmitter<any>();
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    slideConfig: any;

    ///////////////////////////////////////////
    //Core Angular Methods
    ///////////////////////////////////////////
    constructor(private dashboardService: DashboardService,
                private dashboaradAlarmService: DashboardAlarmService,
                private dashboardPatrolService: DashboardPatrolService,
                private dashboardPlatformService: DashboardPlatformService,
                private dashboardAlarmService: DashboardAlarmService,
                private changeDetectorRef: ChangeDetectorRef) {

        //this.changeDetectorRef = changeDetectorRef;
        this.orientation = 'none';

        //Alarm updates
        this.dashboardAlarmService.onAlarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleLoadedAlarmsData()
            });

        this.dashboardAlarmService.onNewAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleNewAlarm()
            });

        this.dashboardAlarmService.onRemoveAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleRemovedAlarm()
            });

        //Patrol Instance Updates
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

        //Patrol Templates Updates
        this.dashboardPatrolService.onPatrolTemplatesLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleLoadedPatrolTemplateData()
            });

        this.dashboardPatrolService.onUpdatePatrolTemplate
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (template) => this.handleUpdatePatrolTemplate(template)
            });

        //Platform Updates
        this.dashboardPlatformService.onPlatformsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleLoadedPlatformData()
            });

        //filter or time change
        this.dashboardAlarmService.updateAlarmData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleUpdateAlarmData()
            });

        this.dashboardPatrolService.onUpdatePatrolData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleUpdatedPatrolData()
            });

        this.dashboardAlarmService.filterCriteriaChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleUpdateAlarmData()
            });

        this.dashboardPatrolService.onFilterCriteriaChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleUpdatedPatrolData()
            });
    }

    ngOnInit(): void {
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
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    showNextData(): void {

        if (this.orientation === 'none') {
            // Find the currently selected index.
            let index: number;
            let res: any;

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
            let index: number;
            let res: any;

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

    }

    showPrevData(): void {

        if (this.orientation === 'none') {
            let index: number;
            let res: any;

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

            let index: number;
            let res: any;

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
    }

    robotDroneClicked(manufacturer: string, event: any) {
        if (manufacturer)
        {
            let robotDrones: RobotAndDrone[] = this.robotAndDronesMap.get(manufacturer);
            if (robotDrones)
            {
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
    }

    showSliderData(data: any, event:any): void {
        if(event)
            event.stopPropagation();
        this.orientation === 'none'

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
    }

    isShowable(): boolean {
        let show: boolean = true;
        if (this.sliderType === this.sliderTypeEnum.Locations) {
            if (this.getSelectedLocationCount() <= 1)
                show = false;
        }

        if (this.sliderType === this.sliderTypeEnum.Platforms) {
            if (this.robotAndDronesMap.size <= 1)
                show = false;
        }

        return show;
    }

    private getSelectedLocationCount(): number {
        let customers = this.dashboardService.getAllTenantLocations();
        if (customers) {
            let totalSelCount: number = 0;

            for (let cust of customers) {
                //per UX only show locations with P1 and P2 Alarms
                let selectedLoc = (cust.Locations.filter(c => c.Selected === true && (c.Priority === '1' || c.Priority === '2')).length);
                totalSelCount = totalSelCount + selectedLoc;
            }
            return totalSelCount;
        }
        return 0;
    }

    expandedRobotDroneViewState(): string {
        if (this.robotDroneExpanded) {
            return 'out';
        }
        return 'in';
    }

    toggleExpandedRobotDroneView(): void {
        event.stopPropagation();
        this.robotDroneExpanded = !this.robotDroneExpanded;
    }

    handleLoadedAlarmsData() {
        if (this.sliderType === this.sliderTypeEnum.Locations) {
            this.customers = [];
            this.setLocationOfInterest();
        }
    }

    handleNewAlarm() {
        if (this.sliderType === this.sliderTypeEnum.Locations) {
            this.customers = [];
            this.setLocationOfInterest();
        }

        //if (this.sliderType === this.sliderTypeEnum.Platforms) {
        //    this.platforms = this.dashboardPlatformService.getPlatforms();
        //    this.initRobotsAndDronesOnPatrols();
        //}
    }

    handleRemovedAlarm() {
        if (this.sliderType === this.sliderTypeEnum.Locations) {
            this.customers = [];
            this.setLocationOfInterest();
        }

        //if (this.sliderType === this.sliderTypeEnum.Platforms) {
        //    this.platforms = this.dashboardPlatformService.getPlatforms();
        //    this.initRobotsAndDronesOnPatrols();
        //}
    }

    handleUpdatedPatrolData() {
        if (this.sliderType === this.sliderTypeEnum.Platforms) {
            this.platforms = this.dashboardPlatformService.getPlatforms();
            this.initRobotsAndDronesOnPatrols();
        }
    }

    handleUpdateAlarmData() {
        if (this.sliderType === this.sliderTypeEnum.Locations) {
            this.customers = [];
            this.setLocationOfInterest();
        }
    }

    ////////////////////////////////////////////
    //Location of Interest Methods
    ///////////////////////////////////////////
    setLocationOfInterest() {
        //get filtered and timeframed data
        let alarms: Alarm[] = this.dashboaradAlarmService.getAlarms();
        let cust: Tenant[] = this.dashboardService.getAllTenantLocations();
        if (cust) {
            let cl: TenantLocation[] = [];
            for (let c of cust) {
                let selLoc: Location[];
                //per UX only show locations with P1 and P2 Alarms
                //selLoc = c.Locations.filter(location => location.Selected);
                selLoc = c.Locations.filter(location => location.Selected === true && (location.Priority === '1' || location.Priority === '2'));
                for (let l of selLoc) {
                    let lPriorityCountStr: string = '';
                    let lPriorityCount: number = alarms.filter((a) => ((a.TenantId === c.Id) &&
                                                                    (a.LocationId === l.Id) &&
                                                                    (a.Priority === parseInt(l.Priority)))).length;
                    if (lPriorityCount >= 100)
                        lPriorityCountStr = '99+';
                    else
                        lPriorityCountStr = lPriorityCount.toString();

                    let ps = this.dashboaradAlarmService.getAlarmPriorityDefn(l.Priority);
                    ps = ps + ' Priority';//(P' + l.Priority + ')';

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
            };

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
    }

    updateLocationOfInterest() {
        if (this.customers) {
            let tenants: Tenant[] = this.dashboardService.getAllTenantLocations();

            for (let customer of this.customers) {
                let t: Tenant[] = tenants.filter(t => t.Id === customer.ID);
                if (t)
                {
                    let tenant: Tenant = t[0];
                    let locs: Location[] = tenant.Locations.filter(l => l.Id === customer.LocationID);
                    if (locs)
                    {
                        customer.Priority = locs[0].Priority;
                    }
                }
            }
            this.changeDetectorRef.detectChanges();
        }
    }

    ////////////////////////////////////////////
    //Robot And Drones Methods
    ///////////////////////////////////////////
    initRobotsAndDronesOnPatrols() {
        //clear the map
        this.robotAndDronesMap.clear();
        let platformList: Platform[] = [];
        let histPatrols: PatrolInstance[];
        if (this.dashboardService.getSelectedTimeframe() !== FilterTimeframe.Current) {
            //get all the historical patrols
            histPatrols = this.dashboardPatrolService.getPatrols();

            //get a unique list of patform IDs that ran the historical patrols
            let platformIDs: string[] = [];
            let uniqueHistPlatforms = histPatrols.map(function (p) {
                if (p.PlatformId && (!platformIDs.includes(p.PlatformId)))
                    platformIDs.push(p.PlatformId);
            });

            //get the platforms that ran the patrols
            for (let hp of platformIDs)
            {
                let platform = this.dashboardPlatformService.getPlatform(hp);
                if (platform) {
                    platformList.push(platform);
                }
            }
        }
        else {
            //we are in a current condition
            platformList = this.platforms;
        }

        for (let p of platformList)
        {
            if (p.Manufacturer) {
                let loc: Location = this.dashboardService.getLocation(p.TenantId, p.LocationId);

                let histPatrolCount: number = 0;
                if (histPatrols)
                    histPatrolCount = histPatrols.filter(hp => hp.PlatformId === p.id).length;

                let platformPatrol: PatrolInstance;
                if (p.IsPatrolSubmitted) {
                    platformPatrol = this.dashboardPatrolService.getPatrolInstanceByPlatformId(p.id);
                }

                if (!this.robotAndDronesMap.has(p.Manufacturer))
                {
                    //the manufacture does not exist in the dictionary so add it
                    let robotAndDrones: RobotAndDrone[] = [{
                        ID: p.id,
                        DisplayName: p.DisplayName,
                        Manufacturer: p.Manufacturer,
                        LocationName: (loc) ? loc.Name : '',
                        PatrolTemplateID: (platformPatrol) ? platformPatrol.TemplateId : '',
                        Patrol: platformPatrol,
                        HistoricalPatrolsCount: histPatrolCount,
                        PatrolSubmitted: p.IsPatrolSubmitted
                    }];
                    this.robotAndDronesMap.set(p.Manufacturer, robotAndDrones);

                } else {
                    //the manufacture already exist in the dictionary so just add robot/drone
                    let robotAndDrones: RobotAndDrone[] = this.robotAndDronesMap.get(p.Manufacturer);
                    let robotAndDrone: RobotAndDrone = {
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
    }

    handleLoadedPlatformData() {
        this.platforms = this.dashboardPlatformService.getPlatforms();

        if (this.sliderType === this.sliderTypeEnum.Platforms) {
            if (this.platforms)
                this.initRobotsAndDronesOnPatrols();
        }
    }

    handleLoadedPatrolData() {
        let patrols: PatrolInstance[] = this.dashboardPatrolService.getPatrols();
        if (patrols)
        {
            if (this.platforms) {
                for (let patrol of patrols) {
                    let pls: Platform[] = this.platforms.filter(pl => pl.id === patrol.PlatformId);
                    if (pls) {
                        let platform: Platform = pls[0];
                        this.updateRobotAndDroneData(patrol, platform);
                    }
                }
            }
        }
        //this.changeDetectorRef.detectChanges();
    }

    handleNewPatrolInstance(patrol: PatrolInstance) {
        if (patrol) {
            if (this.platforms) {
                let pls: Platform[] = this.platforms.filter(pl => pl.id === patrol.PlatformId);
                if (pls) {
                    let platform: Platform = pls[0];
                    this.updateRobotAndDroneData(patrol, platform);
                }
            }
        }
        //this.changeDetectorRef.detectChanges();
    }

    handleUpdatedPatrolInstance(patrol: PatrolInstance) {
        //just need to update the patrol status
        //fire change detection to let the html invoke the method to get the status
        this.changeDetectorRef.detectChanges();
    }

    handleCompletededPatrolInstance(patrol: PatrolInstance) {
        if (patrol) {
            if (this.platforms) {
                let pls: Platform[] = this.platforms.filter(pl => pl.id === patrol.PlatformId);
                if (pls) {
                    let platform: Platform = pls[0];
                    this.clearRobotAndDroneData(patrol, platform);
                }
            }
        }
        //this.changeDetectorRef.detectChanges();
    }

    handleLoadedPatrolTemplateData() {
        let patrolTemplates: PatrolTemplate[] = this.dashboardPatrolService.getPatrolTemplates();
        if (patrolTemplates) {
            if (this.platforms) {
                for (let template of patrolTemplates) {
                    let pls: Platform[] = this.platforms.filter(pl => pl.id === template.PlatformSubmittedId);
                    if (pls) {
                        let platform: Platform = pls[0];
                        this.updateRobotAndDroneData(template, platform);
                    }
                }
            }
        }
        //this.changeDetectorRef.detectChanges();
    }

    handleUpdatePatrolTemplate(template: PatrolTemplate) {
        //let patrolTemplates: PatrolTemplate[] = this.dashboardPatrolService.getPatrolTemplates();
        if (template) {
            if (this.platforms) {
                let pls: Platform[] = this.platforms.filter(pl => pl.id === template.PlatformSubmittedId);
                if (pls) {
                    let platform: Platform = pls[0];
                    this.updateRobotAndDroneData(template, platform);
                }
            }
        }
        //this.changeDetectorRef.detectChanges();
    }

    updateRobotAndDroneData(patrol: PatrolInstance | PatrolTemplate, platform: Platform) {
        if ((patrol) && (platform)) {
            let robotDrones: RobotAndDrone[] = this.robotAndDronesMap.get(platform.Manufacturer);
            if (robotDrones) {
                let rds: RobotAndDrone[] = robotDrones.filter(rd => rd.ID === platform.id);
                if (rds) {
                    let robotDrone: RobotAndDrone = rds[0];
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
    }

    clearRobotAndDroneData(patrol: PatrolInstance, platform: Platform) {
        if ((patrol) && (platform)) {
            let robotDrones: RobotAndDrone[] = this.robotAndDronesMap.get(platform.Manufacturer);
            if (robotDrones) {
                let rds: RobotAndDrone[] = robotDrones.filter(rd => rd.ID === platform.id);
                if (rds) {
                    let robotDrone: RobotAndDrone = rds[0];
                    if (robotDrone) {
                        robotDrone.PatrolTemplateID = '';
                        robotDrone.Patrol = null;
                        robotDrone.PatrolSubmitted = false;
                        this.changeDetectorRef.detectChanges();
                    }
                }
            }
        }
    }

    getRobotAndDroneTotalPatrolCount(manufacture: string): number {
        let patrolCount: number = 0;

        if (manufacture)
        {
            if (this.robotAndDronesMap.has(manufacture))
            {
                let robotAndDroneArray: RobotAndDrone[] = this.robotAndDronesMap.get(manufacture);
                if (robotAndDroneArray)
                {
                    if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                        patrolCount = robotAndDroneArray.filter(rd => rd.PatrolSubmitted === true).length;
                    } else {
                        for (let robotDrone of robotAndDroneArray) {
                            patrolCount = patrolCount + robotDrone.HistoricalPatrolsCount;
                        }
                    }
                }
            }
        }
        return patrolCount;
    }

    getRobotAndDronePatrolCount(manufacture: string): number {
        let patrolCount: number = 0;

        if (manufacture) {
            if (this.robotAndDronesMap.has(manufacture)) {
                let robotAndDroneArray: RobotAndDrone[] = this.robotAndDronesMap.get(manufacture);
                if (robotAndDroneArray) {
                    if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                        patrolCount = robotAndDroneArray.filter(rd => rd.PatrolSubmitted === true).length;
                    } else {
                        for (let robotDrone of robotAndDroneArray) {
                            if (robotDrone.HistoricalPatrolsCount > 0)
                                patrolCount = patrolCount + 1;
                        }
                    }
                }
            }
        }
        return patrolCount;
    }

    getRobotAndDronePatrolManufacturerStatus(manufacturer: string): string {
        let patrolStatus: PatrolStatus = PatrolStatus.None;        
        if (manufacturer) {
            if (this.robotAndDronesMap.has(manufacturer)) {
                let robotAndDroneArray: RobotAndDrone[] = this.robotAndDronesMap.get(manufacturer);
                let patrols: PatrolInstance[] = robotAndDroneArray.map(function (x) { return x.Patrol; });
                let submittedTemplates: string[] = robotAndDroneArray.map(function (x) { return x.PatrolTemplateID; });

                let failedCount: number = 0;
                let errorCount: number = 0;
                let warningCount: number = 0;
                let successfulCount: number = 0;

                for (let patrol of patrols) {
                    let patrolStatusObj: PatrolStatusObj = this.dashboardPatrolService.getPatrolStatusObj(patrol);
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
    }

    getRobotAndDronePatrolStatus(patrol: PatrolInstance): string {
        let patrolStatus: PatrolStatus = PatrolStatus.None;
        let failedCount: number = 0;
        let errorCount: number = 0;
        let warningCount: number = 0;
        let successfulCount: number = 0;

        if (patrol) {
            let patrolStatusObj: PatrolStatusObj = this.dashboardPatrolService.getPatrolStatusObj(patrol);
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
        else
        {
            patrolStatus = PatrolStatus.None;
        }
        return PatrolStatus[patrolStatus].toString().toLocaleLowerCase();
    }

    getRobotAndDroneManufactureCount(manufacture: string): number {
        let patrolCount: number = 0;

        if (manufacture) {
            if (this.robotAndDronesMap.has(manufacture)) {
                let robotAndDroneArray: RobotAndDrone[] = this.robotAndDronesMap.get(manufacture);
                if (robotAndDroneArray) {
                    patrolCount = robotAndDroneArray.length;
                }
            }
        }
        return patrolCount;
    }

    getRobotAndDrone(manufacture: string): RobotAndDrone[] {
        let robotAndDroneArray: RobotAndDrone[];

        if (manufacture) {
            if (this.robotAndDronesMap.has(manufacture)) {
                robotAndDroneArray = this.robotAndDronesMap.get(manufacture);
            }
        }
        return robotAndDroneArray;
    }
}