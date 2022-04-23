/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import { async, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Alarm } from '../../alarms/alarm.class';
import { AlarmTab } from './alarm-tab.component';
import { AlarmListGroup } from './alarm-list-group.component';
import { AlarmContextMenu } from './alarm-context-menu.component';
import { AlarmService } from '../../alarms/alarm.service';
import { PlatformService } from '../../platforms/platform.service';
import { LocationFilterService } from '../../shared/location-filter.service';
import { HttpService } from '../../shared/http.service';
import { MockHttpServiceAlarms } from '../../test/alarms/mockHttp.service';
import { UserService } from '../../shared/user.service';
import { MockUserService } from '../../test/mockUser.service';
import { NavigationService } from '../../shared/navigation.service';
import { AlarmMapService } from '../../map/alarms/alarmMap.service';
import { AlarmModule } from '../../alarms/_alarm.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PatrolService } from '../../patrols/patrol.service';
import { LocationFilterPipe } from '../../shared/location-filter.pipe';
import { WindowService } from '../../shared/window.service';
import { MediaService } from '../../shared/media/media.service';
import { AppSettings } from '../../shared/app-settings';
import { HubService } from '../../shared/hub.service';
import { MockHubService } from '../../test/mockHub.service';
import { AlarmListItem } from './alarm-list-item.component';
import * as moment from 'moment';
var mockRouter = {
    navigate: jasmine.createSpy('navigate')
};
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
describe('Alarm Tab component', function () {
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            imports: [HttpModule, AlarmModule, BrowserAnimationsModule, FormsModule],
            providers: [{ provide: HubService, useClass: MockHubService }, AlarmService, PlatformService, PatrolService, LocationFilterService, NavigationService, AlarmMapService, { provide: UserService, useClass: MockUserService },
                { provide: Router, useValue: mockRouter }, { provide: HttpService, useClass: MockHttpServiceAlarms }, LocationFilterPipe,
                WindowService, MediaService, AppSettings],
            declarations: [AlarmTab, AlarmListGroup, AlarmContextMenu, AlarmListItem]
        });
        TestBed.compileComponents();
    }));
    it('should refresh the alarm list items every minute', function () {
        fixture = TestBed.createComponent(AlarmTab);
        fixture.componentInstance.alarms = activeAlarms;
        //fixture.componentInstance.alarms[0].Created.Timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        fixture.componentInstance.alarms[0].ReportedTime = moment().toDate(); //.format('YYYY-MM-DD HH:mm:ss');
        fixture.detectChanges();
        var reportTime = fixture.componentInstance.alarmsContainer.nativeElement.querySelector('.lpAlarm_ReportedTimeCounter');
        expect(reportTime.innerText).toContain('now');
        // There is a timer that runs every minute, which calls refreshAlarmListItems() in order to keep the reported time counter up to date
        // Rather than wait a minute here, we subtract 1 minute from the created time and call refreshAlarmsListItems
        fixture.componentInstance.alarms[0].ReportedTime = moment(fixture.componentInstance.alarms[0].ReportedTime)
            .subtract(1, 'minutes').toDate(); //.format('YYYY-MM-DD HH:mm:ss');
        fixture.componentInstance.refreshAlarmListItems();
        // Detect changes only works on the component and its parent, so it will not redraw child elements (the alarm list items). 
        // The alarm list item update will only occur if refreshAlarmListItems works properly
        fixture.detectChanges();
        expect(reportTime.innerText).toContain('min');
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
    Created: { UserId: 'SmartCommand User', Timestamp: moment().format('YYYY-MM-DD HH:mm:ss') },
    Acknowledged: null,
    Cleared: null,
    Dismissed: null,
    PropertyItems: null,
    TenantId: '777bdc88-dc28-4908-a4d2-d766131c5777',
    id: '007'
});
var activeAlarms = [testAlarm];
window.currentUser = { Bearer: 'jibberish', tenant: '{ "TenantId": "8bfef93b-0d2c-47d0-8bef-033ea5bd57e2", "CustomerName": "Securitas", "Locations": [], "ParentId": "" }' };
window.activeAlarms = activeAlarms;
//# sourceMappingURL=alarm-tab.component.spec.js.map