/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import { async, TestBed } from '@angular/core/testing';
import { Alarm } from '../alarms/alarm.class';
import * as moment from 'moment';
var mockRouter = {
    navigate: jasmine.createSpy('navigate')
};
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
describe('Dashboard Alarm Component', function () {
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({});
        TestBed.compileComponents();
    }));
    it('should have chart priorities', function () {
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
//# sourceMappingURL=dashboard-alarm.component.spec.js.map