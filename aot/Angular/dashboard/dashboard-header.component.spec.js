/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import { async, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { SharedModule } from '../shared/_shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Alarm } from '../alarms/alarm.class';
import * as moment from 'moment';
import { AlarmService } from '../alarms/alarm.service';
import { PlatformService } from '../platforms/platform.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { PatrolService } from '../patrols/patrol.service';
import { UserService } from '../shared/user.service';
import { HttpService } from '../shared/http.service';
import { MockHttpService } from '../test/mockHttp.service';
import { MockUserService } from '../test/mockUser.service';
import { MockPlatformService } from '../test/platforms/mockPlatform.service';
import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { WindowService } from './../shared/window.service';
import { LocationFilterService } from '../shared/location-filter.service';
import { NavigationService } from '../shared/navigation.service';
import { Router } from '@angular/router';
import { DashboardHeader } from './dashboard-header.component';
import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPatrolService } from './dashboard-patrol.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { AlarmPriorityPipe } from './alarm-priority.pipe';
import { AlarmOperatorPipe } from './alarm-operator.pipe';
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
var mockRouter = {
    navigate: jasmine.createSpy('navigate')
};
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
describe('Dashboard Header Component', function () {
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            imports: [HttpModule, BrowserAnimationsModule, SharedModule],
            providers: [
                { provide: HubService, useClass: MockHubService },
                AlarmService, { provide: PlatformService, useClass: MockPlatformService }, PlatformMapService, PatrolService,
                DashboardService, DashboardAlarmService, DashboardPatrolService, DashboardPlatformService, LocationFilterService,
                { provide: UserService, useClass: MockUserService },
                { provide: HttpService, useClass: MockHttpService }, LocationFilterPipe, WindowService,
                NavigationService, { provide: Router, useValue: mockRouter },
                AlarmPriorityPipe, AlarmOperatorPipe, AlarmDescriptionPipe, AlarmStatePipe, AlarmPlatformPipe, AlarmLOIPipe,
                PatrolAlarmPriorityPipe, PatrolStatusPipe, PatrolRobotDronePipe, PatrolDisplayNamePipe, PatrolOperatorPipe,
                AppSettings
            ],
            declarations: [DashboardHeader]
        });
        TestBed.compileComponents();
    }));
    it('should have location header text', function () {
        // Arrange
        var locationService = TestBed.get(LocationFilterService);
        locationService.registerComponent("dashboard", true);
        var alarmService = TestBed.get(AlarmService);
        alarmService.alarms = activeAlarms;
        // Act
        fixture = TestBed.createComponent(DashboardHeader);
        fixture.detectChanges();
        // Assert
        expect(fixture.nativeElement.innerText).toContain('All Locations');
    });
    it('should have alarm data', function () {
        // Arrange
        var locationService = TestBed.get(LocationFilterService);
        locationService.registerComponent("dashboard", true);
        var alarmService = TestBed.get(AlarmService);
        alarmService.alarms = activeAlarms;
        // Act
        fixture = TestBed.createComponent(DashboardHeader);
        alarmService.alarmsLoaded.next(true);
        fixture.detectChanges();
        // Assert
        var tab = $('#headerTabAlarmContent');
        expect(tab[0].innerText).toContain('Active Alarms');
        var count = $('#headerTabAlarmCount');
        expect(count[0].innerText).toContain('2');
        var p1 = $('#headerTabAlarmPriority-P1');
        expect(p1[0].innerText).toContain('1');
        var p2 = $('#headerTabAlarmPriority-P2');
        expect(p2[0].innerText).toContain('0');
        var p3 = $('#headerTabAlarmPriority-P3');
        expect(p3[0].innerText).toContain('0');
        var p4 = $('#headerTabAlarmPriority-P4');
        expect(p4[0].innerText).toContain('1');
    });
    //it('should have patrol data', () => {
    //    // Arrange
    //    let locationService: LocationFilterService = TestBed.get(LocationFilterService);
    //    locationService.registerComponent("dashboard", true);
    //    let alarmService: AlarmService = TestBed.get(AlarmService);
    //    alarmService.alarms = activeAlarms;
    //    // Act
    //    fixture = TestBed.createComponent(DashboardHeader);
    //    fixture.detectChanges();
    //    // Assert
    //    let tab = $('#headerTabPatrolContent');
    //    expect(tab[0].innerText).toContain('Active Patrols');
    //    let count = $('#headerTabPatrolCount');
    //    expect(count[0].innerText).toContain('0');
    //    let p1 = $('#headerTabPatrolPriority-P1');
    //    expect(p1[0].innerText).toContain('0');
    //    let p2 = $('#headerTabPatrolPriority-P2');
    //    expect(p2[0].innerText).toContain('0');
    //    let p3 = $('#headerTabPatrolPriority-P3');
    //    expect(p3[0].innerText).toContain('0');
    //    let p4 = $('#headerTabPatrolPriority-P4');
    //    expect(p4[0].innerText).toContain('0');
    //});
    //it('should have platform data', () => {
    //    // Arrange
    //    let locationService: LocationFilterService = TestBed.get(LocationFilterService);
    //    locationService.registerComponent("dashboard", true);
    //    let alarmService: AlarmService = TestBed.get(AlarmService);
    //    alarmService.alarms = activeAlarms;
    //    // Act
    //    fixture = TestBed.createComponent(DashboardHeader);
    //    fixture.detectChanges();
    //    // Assert
    //    let tab = $('#headerTabRobotContent');
    //    expect(tab[0].innerText).toContain('Robots and Drones');
    //    let count = $('#headerTabRobotCount');
    //    expect(count[0].innerText).toContain('1');
    //    let p1 = $('#headerTabRobotPriority-P1');
    //    expect(p1[0].innerText).toContain('0');
    //    let p2 = $('#headerTabRobotPriority-P2');
    //    expect(p2[0].innerText).toContain('0');
    //    let p3 = $('#headerTabRobotPriority-P3');
    //    expect(p3[0].innerText).toContain('1');
    //    let p4 = $('#headerTabRobotPriority-P4');
    //    expect(p4[0].innerText).toContain('0');
    //});
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
//# sourceMappingURL=dashboard-header.component.spec.js.map