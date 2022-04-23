/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import { async, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Alarm } from '../../alarms/alarm.class';
import { AlarmTable } from './alarm-table.component';
import { AlarmActionMenu } from '../../alarms/alarm-action-menu.component';
import { AlarmService } from '../../alarms/alarm.service';
import { PlatformService } from '../../platforms/platform.service';
import { LocationFilterService } from '../../shared/location-filter.service';
import { UserService } from '../../shared/user.service';
import { MockUserService } from '../../test/mockUser.service';
import { AlarmMapService } from '../../map/alarms/alarmMap.service';
import { HttpModule } from '@angular/http';
import { HttpService } from '../../shared/http.service';
import { NavigationService } from '../../shared/navigation.service';
import { MockHttpServiceAlarms } from '../../test/alarms/mockHttp.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { PatrolService } from '../../patrols/patrol.service';
import { LocationFilterPipe } from '../../shared/location-filter.pipe';
import { WindowService } from '../../shared/window.service';
import { AppSettings } from '../../shared/app-settings';
import { HubService } from '../../shared/hub.service';
import { MockHubService } from '../../test/mockHub.service';
import * as moment from 'moment';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 95000;
describe('Alarm Table component', function () {
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            imports: [FormsModule, HttpModule, BrowserAnimationsModule, RouterTestingModule],
            declarations: [AlarmTable, AlarmActionMenu],
            providers: [{ provide: HubService, useClass: MockHubService }, AlarmService, PlatformService, PatrolService, LocationFilterService, { provide: UserService, useClass: MockUserService },
                AlarmMapService, NavigationService, { provide: HttpService, useClass: MockHttpServiceAlarms },
                LocationFilterPipe, WindowService, AppSettings]
        });
        TestBed.compileComponents();
    }));
    it('should have a clickable linked description', function () {
        // Arrange
        fixture = TestBed.createComponent(AlarmTable);
        fixture.componentInstance.alarms = activeAlarms;
        // Act
        fixture.detectChanges();
        var alarmLink = fixture.nativeElement.querySelector('.clickable');
        // Assert
        expect(alarmLink.innerHTML).toEqual('Look at that Dog.');
    });
    it('should show the reported image for new alarms', function () {
        // Arrange
        fixture = TestBed.createComponent(AlarmTable);
        fixture.componentInstance.alarms = activeAlarms;
        // Act
        fixture.detectChanges();
        var reportedImage = fixture.nativeElement.querySelector('img[alt="Reported"]');
        var ackdImage = fixture.nativeElement.querySelector('img[alt="Acknowledged"]');
        // Assert
        expect(reportedImage.hidden).toEqual(false);
        expect(ackdImage.hidden).toEqual(true);
    });
    it('should show the acknowledged image for ackd alarms', function () {
        // Arrange
        fixture = TestBed.createComponent(AlarmTable);
        activeAlarms[0].State = 2; // Ackd
        fixture.componentInstance.alarms = activeAlarms;
        // Act
        fixture.detectChanges();
        var reportedImage = fixture.nativeElement.querySelector('img[alt="Reported"]');
        var ackdImage = fixture.nativeElement.querySelector('img[alt="Acknowledged"]');
        // Assert
        expect(reportedImage.hidden).toEqual(true);
        expect(ackdImage.hidden).toEqual(false);
    });
    it('should show the color of the highest priority alarm', function () {
        // Arrange
        fixture = TestBed.createComponent(AlarmTable);
        activeAlarms[0].Priority = 2;
        fixture.componentInstance.alarms = activeAlarms;
        // Act
        fixture.detectChanges();
        var headerItemCount = fixture.nativeElement.querySelector('.group-header_ItemCount.p2');
        // Assert
        expect(headerItemCount).not.toEqual(null);
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
    PropertyItems: null,
    TenantId: '777bdc88-dc28-4908-a4d2-d766131c5777',
    id: '007'
});
var activeAlarms = [testAlarm];
window.currentUser = { Bearer: 'jibberish', tenant: '{ "TenantId": "8bfef93b-0d2c-47d0-8bef-033ea5bd57e2","CustomerName": "Securitas", "Locations": [], "ParentId": "" }' };
window.activeAlarms = activeAlarms;
//# sourceMappingURL=alarm-table.component.spec.js.map