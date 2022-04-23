/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import { async, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Alarm } from '../../alarms/alarm.class';
import { AlarmListItem } from '../../mapview/alarms/alarm-list-item.component';
import { AlarmActionMenu } from '../../alarms/alarm-action-menu.component';
import { AlarmService } from '../../alarms/alarm.service';
import { PlatformService } from '../../platforms/platform.service';
import { LocationFilterService } from '../../shared/location-filter.service';
import { UserService } from '../../shared/user.service';
import { MockUserService } from '../../test/mockUser.service';
import { AlarmMapService } from '../../map/alarms/alarmMap.service';
import { SharedModule } from '../../shared/_shared.module';
import { HttpModule } from '@angular/http';
import { HttpService } from '../../shared/http.service';
import { NavigationService } from '../../shared/navigation.service';
import { MockHttpServiceAlarms } from '../../test/alarms/mockHttp.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { PatrolService } from '../../patrols/patrol.service';
import { LocationFilterPipe } from '../../shared/location-filter.pipe';
import { WindowService } from '../../shared/window.service';
import { MediaService } from '../../shared/media/media.service';
import { AlarmDetails } from '../../alarms/alarm-details.component';
import { AppSettings } from '../../shared/app-settings';
import { HubService } from '../../shared/hub.service';
import { MockHubService } from '../../test/mockHub.service';
import * as moment from 'moment';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
describe('Alarm List Item component', function () {
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            imports: [FormsModule, HttpModule, SharedModule, BrowserAnimationsModule, RouterTestingModule],
            declarations: [AlarmListItem, AlarmActionMenu, AlarmDetails],
            providers: [{ provide: HubService, useClass: MockHubService }, AlarmService, PlatformService, PatrolService, LocationFilterService, { provide: UserService, useClass: MockUserService },
                AlarmMapService, NavigationService, { provide: HttpService, useClass: MockHttpServiceAlarms },
                LocationFilterPipe, WindowService, MediaService, AppSettings]
        });
        TestBed.compileComponents();
    }));
    it('should NOT detect changes and update for OnPush properties', function () {
        // Arrange
        fixture = TestBed.createComponent(AlarmListItem);
        fixture.componentInstance.alarm = testAlarm;
        // Act
        fixture.detectChanges();
        expect(fixture.nativeElement.innerText).toContain('Look at that Dog.');
        // Assert
        testAlarm.Description = 'Look at that Dog.111';
        fixture.detectChanges();
        expect(fixture.nativeElement.innerText).not.toContain('Look at that Dog.111');
        expect(fixture.nativeElement.innerText).toContain('Look at that Dog.');
    });
    it('should format the date and time correctly', function () {
        // Arrange
        fixture = TestBed.createComponent(AlarmListItem);
        fixture.componentInstance.alarm = testAlarm;
        // Act
        fixture.detectChanges();
        // Assert
        expect(fixture.nativeElement.innerText).toContain('2/23/17 - 1:14:20am');
    });
    //TODO - move to an alarm details spec since detail is now only shown if expanded
    //it('should disable comment submit button until comment', () => {
    //	// Arrange
    //	fixture = TestBed.createComponent(AlarmListItem);
    //	fixture.componentInstance.alarm = testAlarm;
    //	// Act
    //	fixture.detectChanges();
    //	let submitBtn = fixture.nativeElement.querySelector('.lpAlarmCommentsInput_SubmitButton');
    //	// Assert
    //	expect(submitBtn.disabled).toEqual(true);
    //});
    //TODO - move to an alarm details spec since detail is now only shown if expanded
    //it('should show the mocked comment count', () => {
    //	// Arrange
    //	fixture = TestBed.createComponent(AlarmListItem);
    //	fixture.componentInstance.alarm = testAlarm;
    //	// Act
    //	fixture.detectChanges();
    //	// Assert
    //	let commentSection = fixture.nativeElement.querySelector('.commentGroup .group-header_ItemCount');
    //	expect(commentSection.innerText).toContain('1');
    //});
    //TODO - move to an alarm details spec since detail is now only shown if expanded
    //it('should show the mocked comment count after a comment is added', () => {
    //	// Arrange
    //	fixture = TestBed.createComponent(AlarmListItem);
    //	fixture.componentInstance.alarm = testAlarm;
    //	testAlarm.Comments.push({ UserId: '1', CommentText: 'test', Timestamp: '2017-02-23T01:14:20.5784896Z' });
    //	// Act
    //	fixture.detectChanges();
    //	// Assert
    //	let commentSection = fixture.nativeElement.querySelector('.commentGroup .group-header_ItemCount');
    //	expect(commentSection.innerText).not.toContain('1');
    //	expect(commentSection.innerText).toContain('2');
    //});
    //TODO - move to an alarm details spec since detail is now only shown if expanded
    //  it('should render even if Sensors are null', () => {
    //// Arrange
    //      testAlarm.Sensor = null;
    //testAlarm.Sensors = null;
    //fixture = TestBed.createComponent(AlarmListItem);
    //fixture.componentInstance.alarm = testAlarm;
    //// Act
    //fixture.detectChanges();
    //let submitBtn = fixture.nativeElement.querySelector('.lpAlarmCommentsInput_SubmitButton');
    //// Assert
    //expect(submitBtn.disabled).toEqual(true);
    //  });
    it('alarm time should not be in utc format', function () {
        var clearedTime = moment(testAlarm.ReportedTime);
        // New Alarm serializes input data. The created timestamp begins in utc time but should be serialized to local
        expect(clearedTime.isUtc()).toEqual(false);
    });
});
var testAlarm = new Alarm({
    ReportedTime: '2017-02-23T01:14:20.5784896',
    LastUpdateTime: '2017-02-23T01:14:20.5784896',
    State: 1,
    Type: { 'Category': 'Battery', 'Condition': 'Dead' },
    Position: {
        'coordinates': [-86.5864, 34.7605],
        'type': 'Point'
    },
    Description: 'Look at that Dog.',
    Priority: 4,
    Comments: [{ CommentText: 'this is a test', UserId: 'SmartCommand User', Timestamp: moment.utc().format('YYYY-MM-DD HH:mm:ss') }],
    Created: { UserId: 'SmartCommand User', Timestamp: moment.utc().format('YYYY-MM-DD HH:mm:ss') },
    Acknowledged: null,
    Cleared: null,
    Dismissed: null,
    Sensor: null,
    Sensors: [],
    TenantId: '777bdc88-dc28-4908-a4d2-d766131c5777',
    id: '007'
});
var activeAlarms = [testAlarm];
window.currentUser = { Bearer: 'jibberish', tenant: '{ "TenantId": "8bfef93b-0d2c-47d0-8bef-033ea5bd57e2","CustomerName": "Securitas", "Locations": [], "ParentId": "" }' };
window.activeAlarms = activeAlarms;
//# sourceMappingURL=alarm-list-item.component.spec.js.map