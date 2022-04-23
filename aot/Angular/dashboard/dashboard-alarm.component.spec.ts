/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { SharedModule } from '../shared/_shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChartsModule } from 'ng2-charts';
import { Router } from '@angular/router';

import { MapModule } from '../map/_map.module';
import { Alarm } from '../alarms/alarm.class';
import * as moment from 'moment';
import { AlarmService } from '../alarms/alarm.service';
import { PlatformService } from '../platforms/platform.service';
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
import { MapService } from '../map/map.service';
import { PatrolMapService } from '../map/patrols/patrolMap.service';
//import { PatrolBuilderService } from '../patrolBuilder/patrol-builder.service';
import { AlarmMapService } from '../map/alarms/alarmMap.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { LocationMapService } from '../map/locations/locationMap.service';

import { DashboardAlarm } from './dashboard-alarm.component';
import { DashboardSlider } from './dashboard-slider.component';
import { DashboardSearchBox } from './dashboard-searchbox.component';
import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPatrolService } from './dashboard-patrol.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { AlarmSearchPipe } from './alarm-search.pipe';
import { AlarmPriorityPipe } from './alarm-priority.pipe';
import { AlarmOperatorPipe } from './alarm-operator.pipe';
import { AlarmDescriptionPipe } from './alarm-description.pipe';
import { AlarmStatePipe } from './alarm-state.pipe';
import { AlarmPlatformPipe } from './alarm-platform.pipe';
import { AlarmLOIPipe } from './alarm-loi.pipe';
import { AppSettings } from '../shared/app-settings';

let mockRouter = {
    navigate: jasmine.createSpy('navigate')
};

jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

describe('Dashboard Alarm Component', () => {
    let fixture: ComponentFixture<DashboardAlarm>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            //imports: [HttpModule, BrowserAnimationsModule, SharedModule, ChartsModule, MapModule],
            //providers: [AlarmService, { provide: PlatformService, useClass: MockPlatformService }, PatrolService,
            //    DashboardService, DashboardAlarmService, DashboardPatrolService, DashboardPlatformService, LocationFilterService,
            //    MapService, PatrolMapService, PatrolBuilderService, AlarmMapService, PlatformMapService, LocationMapService,
            //    { provide: UserService, useClass: MockUserService },
            //    { provide: HttpService, useClass: MockHttpService }, LocationFilterPipe, WindowService,
            //    AlarmPriorityPipe, AlarmOperatorPipe, AlarmDescriptionPipe, AlarmStatePipe, AlarmPlatformPipe, AlarmLOIPipe,
            //    NavigationService, { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } }, AppSettings],
            //declarations: [DashboardAlarm, DashboardSlider, DashboardSearchBox, AlarmSearchPipe]
        });
        TestBed.compileComponents();
    }));

    it('should have chart priorities', () => {
        // Arrange
        //let locationService: LocationFilterService = TestBed.get(LocationFilterService);
        //locationService.registerComponent("dashboard", true);
        //let alarmService: AlarmService = TestBed.get(AlarmService);
        //alarmService.alarms = activeAlarms;

        //// Act
        //fixture = TestBed.createComponent(DashboardAlarm);
        //fixture.detectChanges();

        //// Assert
        //let chart = fixture.componentInstance.chartComponent.chart;
        ////expect(chart.data.datasets.length).toContain('All Locations');
    });
});

let testAlarm = new Alarm({
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
let testAlarm2 = new Alarm({
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
let activeAlarms = [testAlarm, testAlarm2];
(<any>window).activeAlarms = activeAlarms;
