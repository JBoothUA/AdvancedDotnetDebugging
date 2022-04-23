/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import { async, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { SharedModule } from '../shared/_shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SlickModule } from 'ngx-slick';
import { AlarmService } from '../alarms/alarm.service';
import { PlatformService } from '../platforms/platform.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { PatrolService } from '../patrols/patrol.service';
import { LocationFilterService } from '../shared/location-filter.service';
import { UserService } from '../shared/user.service';
import { HttpService } from '../shared/http.service';
import { MockHttpService } from '../test/mockHttp.service';
import { MockUserService } from '../test/mockUser.service';
import { LocationFilterPipe } from '../shared/location-filter.pipe';
import * as moment from 'moment';
import { WindowService } from './../shared/window.service';
import { Alarm } from '../alarms/alarm.class';
import { NavigationService } from '../shared/navigation.service';
import { Router } from '@angular/router';
import { DashboardSlider } from './dashboard-slider.component';
import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPatrolService } from './dashboard-patrol.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { SliderType } from './dashboard';
import { AlarmOperatorPipe } from './alarm-operator.pipe';
import { AlarmPriorityPipe } from './alarm-priority.pipe';
import { AlarmDescriptionPipe } from './alarm-description.pipe';
import { AlarmStatePipe } from './alarm-state.pipe';
import { AlarmPlatformPipe } from './alarm-platform.pipe';
import { AlarmLOIPipe } from './alarm-loi.pipe';
import { AppSettings } from '../shared/app-settings';
import { PatrolAlarmPriorityPipe } from './patrol-alarmpriority.pipe';
import { PatrolStatusPipe } from './patrol-status.pipe';
import { PatrolRobotDronePipe } from './patrol-robotdrone.pipe';
import { PatrolDisplayNamePipe } from './patrol-displayname.pipe';
import { PatrolOperatorPipe } from './patrol-operator.pipe';
import { HubService } from '../shared/hub.service';
import { MockHubService } from '../test/mockHub.service';
//import { TestModule } from '../test/_test.module';
var mockRouter = {
    navigate: jasmine.createSpy('navigate')
};
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
describe('Dashboard Slider Component', function () {
    var fixture;
    //let ngUnsubscribe: Subject < void> = new Subject<void>();
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            //imports: [ TestModule ]
            imports: [HttpModule, BrowserAnimationsModule, SharedModule, SlickModule.forRoot()],
            providers: [LocationFilterService, { provide: HubService, useClass: MockHubService }, AlarmService,
                PlatformService, PlatformMapService, PatrolService,
                DashboardService, DashboardAlarmService, DashboardPatrolService, DashboardPlatformService,
                { provide: UserService, useClass: MockUserService },
                { provide: HttpService, useClass: MockHttpService }, LocationFilterPipe, WindowService,
                NavigationService, { provide: Router, useValue: mockRouter },
                AlarmPriorityPipe, AlarmOperatorPipe, AlarmDescriptionPipe, AlarmStatePipe, AlarmPlatformPipe, AlarmLOIPipe,
                PatrolAlarmPriorityPipe, PatrolStatusPipe, PatrolRobotDronePipe, PatrolDisplayNamePipe, PatrolOperatorPipe,
                AppSettings],
            declarations: [DashboardSlider]
        });
        TestBed.compileComponents();
    }));
    it('should have tenant location data', function () {
        var locationService = TestBed.get(LocationFilterService);
        var alarmService = TestBed.get(AlarmService);
        alarmService.alarms = activeAlarms;
        //let dashboardAlarmService: DashboardAlarmService = TestBed.get(DashboardAlarmService);
        //dashboardAlarmService.updateAlarmData
        //    .takeUntil(ngUnsubscribe)
        //    .subscribe({
        //        next: () => {
        //            locationService.registerComponent("dashboard", true);
        //            fixture = TestBed.createComponent(DashboardSlider);
        //            fixture.componentInstance.setLocationOfInterest();
        //            fixture.detectChanges();
        //            let custLocations = fixture.componentInstance.selectedCustomerLocations;
        //            expect(custLocations).length > 0;
        //        }
        //    });
        locationService.registerComponent("dashboard", true);
        fixture = TestBed.createComponent(DashboardSlider);
        fixture.componentInstance.setLocationOfInterest();
        fixture.detectChanges();
        var custLocations = fixture.componentInstance.selectedCustomerLocations;
        expect(custLocations).length > 0;
    });
    it('should display first tenant location data', function () {
        // Arrange
        var locationService = TestBed.get(LocationFilterService);
        var alarmService = TestBed.get(AlarmService);
        alarmService.alarms = activeAlarms;
        locationService.registerComponent("dashboard", true);
        fixture = TestBed.createComponent(DashboardSlider);
        fixture.componentInstance.sliderType = SliderType.Locations;
        fixture.componentInstance.setLocationOfInterest();
        // Act
        fixture.detectChanges();
        var custLocations = fixture.componentInstance.selectedCustomerLocations;
        expect(custLocations.length > 0);
        // Assert
        expect(fixture.nativeElement.innerText).toContain(custLocations[0].LocationName);
    });
    it('should display all tenant location data', function () {
        // Arrange
        var locationService = TestBed.get(LocationFilterService);
        var alarmService = TestBed.get(AlarmService);
        alarmService.alarms = activeAlarms;
        locationService.registerComponent("dashboard", true);
        fixture = TestBed.createComponent(DashboardSlider);
        fixture.componentInstance.sliderType = SliderType.Locations;
        fixture.componentInstance.setLocationOfInterest();
        // Act
        fixture.detectChanges();
        var custLocations = fixture.componentInstance.selectedCustomerLocations;
        expect(custLocations.length > 0);
        // Assert
        var dashboardService = TestBed.get(DashboardService);
        var allTenants = dashboardService.getAllTenantLocations();
        var locationCount = 0;
        for (var _i = 0, allTenants_1 = allTenants; _i < allTenants_1.length; _i++) {
            var t = allTenants_1[_i];
            locationCount += t.Locations.length;
        }
        for (var x = 0; x < locationCount; x++) {
            expect(fixture.nativeElement.innerText).toContain(custLocations[0].LocationName);
            fixture.componentInstance.showNextData();
            fixture.detectChanges();
            custLocations = fixture.componentInstance.selectedCustomerLocations;
        }
    });
});
var testAlarm = new Alarm({
    ReportedTime: '2017-02-23T01:14:20.5784896',
    LastUpdateTime: '2017-02-23T01:14:20.5784896',
    State: 1,
    Type: { 'Category': 'Battery', 'Condition': 'Dead1' },
    Position: {
        'coordinates': [-86.5864, 34.7605],
        'type': 'Point'
    },
    Description: 'Look at that Dog.',
    Priority: 4,
    Comments: [{ CommentText: 'this is a test', UserId: 'SmartCommand User', Timestamp: moment.utc().format('YYYY-MM-DD HH:mm:ss') }],
    Created: { UserId: 'SmartCommand User', Timestamp: moment().format('YYYY-MM-DD HH:mm:ss') },
    Acknowledged: null,
    Cleared: null,
    Dismissed: null,
    Sensor: null,
    Sensors: [],
    TenantId: '0f2f363b-a2fb-4ced-a9a4-54510a1a67ce',
    LocationId: 'c093abb5-58be-410b-80bf-ca7a52e52ac3',
    id: 'DB1BFBE7CED841C2AAD3888BA2E5612C'
});
var testAlarm2 = new Alarm({
    ReportedTime: '2017-02-23T01:14:20.5784896',
    LastUpdateTime: '2017-02-23T01:14:20.5784896',
    State: 2,
    Type: { 'Category': 'Tamper', 'Condition': 'Detected' },
    Position: {
        'coordinates': [-86.5864, 34.7605],
        'type': 'Point'
    },
    Description: 'Tamper Alarm Activated',
    Priority: 1,
    Comments: [{ CommentText: 'this is a test', UserId: 'SmartCommand User', Timestamp: moment.utc().format('YYYY-MM-DD HH:mm:ss') }],
    Created: { UserId: 'SmartCommand User', Timestamp: moment().format('YYYY-MM-DD HH:mm:ss') },
    Acknowledged: null,
    Cleared: null,
    Dismissed: null,
    Sensor: null,
    Sensors: [],
    TenantId: 'f6f59624-018f-4a9c-89b2-96213966e4ec',
    LocationId: '37e4434b-0d2c-47d0-8bef-033ea5bd28a2',
    id: '182675588CB5424285FBD90A9DECFD36'
});
var activeAlarms = [testAlarm, testAlarm2];
window.activeAlarms = activeAlarms;
//# sourceMappingURL=dashboard-slider.component.spec.js.map