import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { SharedModule } from '../shared/_shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LocationFilterService } from './location-filter.service';
import { LocationFilter } from './location-filter.component';
import { Tenant } from './tenant.class';
import { Location } from './location.class';
import { slideDown } from '../shared/animations';
import { LocationFilterPipe } from './location-filter.pipe';

import { UserService } from './user.service';
import { HttpService } from './http.service';
import { MockHttpService } from '../test/mockHttp.service';
import { MockUserService } from '../test/mockUser.service';
import { AlarmService } from '../alarms/alarm.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { Alarm } from '../alarms/alarm.class';
import { AppSettings } from '../shared/app-settings';
import { MockHubService } from '../test/mockHub.service';
import { HubService } from '../shared/hub.service';
import * as moment from 'moment';

let mockRouter = {
    navigate: jasmine.createSpy('navigate')
};

jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

describe('Location Filter Component', () => {
    let fixture: ComponentFixture<LocationFilter>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
			imports: [BrowserAnimationsModule, SharedModule, HttpModule],
            providers: [LocationFilterService,
                { provide: HubService, useClass: MockHubService },
                AlarmService, PlatformMapService,
                { provide: UserService, useClass: MockUserService },
                { provide: HttpService, useClass: MockHttpService }, LocationFilterPipe,
                AppSettings
            ],
            declarations: []
        });
        TestBed.compileComponents();
    }));

    it('should have all tenants and locations selected', () => {
        // Arrange
        let locationService: LocationFilterService = TestBed.get(LocationFilterService);
        let alarmService: AlarmService = TestBed.get(AlarmService);
        alarmService.alarms = activeAlarms;

        // Act
        fixture = TestBed.createComponent(LocationFilter);
        fixture.componentInstance.scView = 'test';
        fixture.componentInstance.multiSelect = true;
        fixture.componentInstance.showFilter = true;
        fixture.componentInstance.filterOverride = false;
        fixture.componentInstance.showButtons = true;
        fixture.componentInstance.readOnly = false;
        fixture.detectChanges();

        // Assert - header is correct
        let header = fixture.nativeElement.querySelector('.filterLocationsContent');
        expect(header.innerText).toContain("All Locations");

        // Assert - high level tenants and locations are selected
        let allTenants = locationService.getAllTenantLocations('test');
        for (let tenant of allTenants) {
            //let tent = fixture.nativeElement.querySelector('#tenant_' + tenant.Id);
            //expect(tent.classList.contains('selected'));
            let tent = $('#tenant_' + tenant.Id);
            expect(($(tent).hasClass('selected'))).toBe(true); 
            for (let location of tenant.Locations)
            {
                let loc = fixture.nativeElement.querySelector('#location_' + location.Id);
                //expect(loc.classList.contains('selected'));
                expect(($(loc).hasClass('selected'))).toBe(true); 
            }
        }
    });

    it('should only have 1 tenant locations selected', () => {
        // Arrange
        let locationService: LocationFilterService = TestBed.get(LocationFilterService);
        let alarmService: AlarmService = TestBed.get(AlarmService);
        alarmService.alarms = activeAlarms;

        // Act
        fixture = TestBed.createComponent(LocationFilter);
        fixture.componentInstance.scView = 'test';
        fixture.componentInstance.multiSelect = false;
        fixture.componentInstance.showFilter = true;
        fixture.componentInstance.filterOverride = false;
        fixture.componentInstance.showButtons = true;
        fixture.componentInstance.readOnly = false;
        fixture.detectChanges();

        // Assert - header is correct
        let header = fixture.nativeElement.querySelector('.filterLocationsContent');
        expect(header.innerText).not.toContain("All Locations");

        // Assert - high level tenant location is selected
        let allTenants = locationService.getAllTenantLocations('test');
        let location = $('#location_' + allTenants[0].Locations[0].Id);
        expect(($(location).hasClass('selected'))).toBe(true);
    });

    it('should display filter area for selected tenants and locations', () => {
        // Arrange
        let locationService: LocationFilterService = TestBed.get(LocationFilterService);
        let alarmService: AlarmService = TestBed.get(AlarmService);
        alarmService.alarms = activeAlarms;

        // Act
        fixture = TestBed.createComponent(LocationFilter);
        fixture.componentInstance.scView = 'test';
        fixture.componentInstance.multiSelect = true;
        fixture.componentInstance.showFilter = true;
        fixture.componentInstance.filterOverride = false;
        fixture.componentInstance.showButtons = true;
        fixture.componentInstance.readOnly = false;
        fixture.detectChanges();

        //unselect the first tenant locaiton
        let allTenants = locationService.getAllTenantLocations('test');
        allTenants[0].Selected = false;
        allTenants[0].Locations[0].Selected = false;
        fixture.componentInstance.applySelectedLocations();
        fixture.detectChanges();

        // Assert - header is correct
        let header = fixture.nativeElement.querySelector('.filterLocationsContent');
        expect(header.innerText).toContain("Showing");

        // Assert - first tenant and location are not selected
        let tent = $('#tenant_' + allTenants[0].Id);
        expect((!$(tent).hasClass('selected'))).toBe(true); 
        let loc = $('#location_' + allTenants[0].Locations[0].Id);
        expect((!$(loc).hasClass('selected'))).toBe(true); 

        // Assert - filter area is being displayed
        let filterArea = $('#filterCustomerLocationHeader');
        expect(filterArea.length).toEqual(1);
    });

    it('should not display filter area for selected tenants and locations', () => {
        // Arrange
        let locationService: LocationFilterService = TestBed.get(LocationFilterService);
        let alarmService: AlarmService = TestBed.get(AlarmService);
        alarmService.alarms = activeAlarms;

        // Act
        fixture = TestBed.createComponent(LocationFilter);
        fixture.componentInstance.scView = 'test';
        fixture.componentInstance.multiSelect = true;
        fixture.componentInstance.showFilter = false;
        fixture.componentInstance.filterOverride = false;
        fixture.componentInstance.showButtons = true;
        fixture.componentInstance.readOnly = false;
        //fixture.componentInstance.defaultSelection = true;
        fixture.detectChanges();

        //unselect the first tenant locaiton
        let allTenants = locationService.getAllTenantLocations('test');
        allTenants[0].Selected = false;
        allTenants[0].Locations[0].Selected = false;
        fixture.componentInstance.applySelectedLocations();
        fixture.detectChanges();

        // Assert - header is correct
        let header = fixture.nativeElement.querySelector('.filterLocationsContent');
        expect(header.innerText).toContain("Showing");

        // Assert - first tenant and location are not selected
        let tent = $('#tenant_' + allTenants[0].Id);
        expect((!$(tent).hasClass('selected')));
        let loc = $('#location_' + allTenants[0].Locations[0].Id);
        expect((!$(loc).hasClass('selected')));

        // Assert - filter area is not being displayed
        let filterArea = $('#filterCustomerLocationHeader');
        expect(filterArea.length).toEqual(0);
    });

    it('should override tenant location styling', () => {
        // Arrange
        let locationService: LocationFilterService = TestBed.get(LocationFilterService);
        let alarmService: AlarmService = TestBed.get(AlarmService);
        alarmService.alarms = activeAlarms;

        // Act
        fixture = TestBed.createComponent(LocationFilter);
        fixture.componentInstance.scView = 'test';
        fixture.componentInstance.multiSelect = true;
        fixture.componentInstance.showFilter = false;
        fixture.componentInstance.filterOverride = true;
        fixture.componentInstance.showButtons = true;
        fixture.componentInstance.readOnly = false;
        fixture.detectChanges();

        // Assert - header has an override
        let header = $('.filterLocationsContent');
        expect(($(header).hasClass('override'))).toBe(true);

    });

    it('should not override tenant location styling', () => {
        // Arrange
        let locationService: LocationFilterService = TestBed.get(LocationFilterService);
        let alarmService: AlarmService = TestBed.get(AlarmService);
        alarmService.alarms = activeAlarms;

        // Act
        fixture = TestBed.createComponent(LocationFilter);
        fixture.componentInstance.scView = 'test';
        fixture.componentInstance.multiSelect = true;
        fixture.componentInstance.showFilter = false;
        fixture.componentInstance.filterOverride = false;
        fixture.componentInstance.showButtons = true;
        fixture.componentInstance.readOnly = false;
        fixture.detectChanges();

        // Assert - header has an override
        let header = $('.filterLocationsContent');
        expect((!$(header).hasClass('override'))).toBe(true);

    });

    it('should show buttons', () => {
        // Arrange
        let locationService: LocationFilterService = TestBed.get(LocationFilterService);
        let alarmService: AlarmService = TestBed.get(AlarmService);
        alarmService.alarms = activeAlarms;

        // Act
        fixture = TestBed.createComponent(LocationFilter);
        fixture.componentInstance.scView = 'test';
        fixture.componentInstance.multiSelect = true;
        fixture.componentInstance.showFilter = false;
        fixture.componentInstance.filterOverride = false;
        fixture.componentInstance.showButtons = true;
        fixture.componentInstance.readOnly = false;
        fixture.detectChanges();

        // Assert - header has an override
        let buttons = $('#filterLocationsButtonRow');
        expect(buttons.length).toEqual(1);

    });

    it('should not show buttons', () => {
        // Arrange
        let locationService: LocationFilterService = TestBed.get(LocationFilterService);
        let alarmService: AlarmService = TestBed.get(AlarmService);
        alarmService.alarms = activeAlarms;

        // Act
        fixture = TestBed.createComponent(LocationFilter);
        fixture.componentInstance.scView = 'test';
        fixture.componentInstance.multiSelect = true;
        fixture.componentInstance.showFilter = false;
        fixture.componentInstance.filterOverride = false;
        fixture.componentInstance.showButtons = false;
        fixture.componentInstance.readOnly = false;
        fixture.detectChanges();

        // Assert - header has an override
        let buttons = $('#filterLocationsButtonRow');
        expect(buttons.length).toEqual(0);

    });

    it('should be readonly', () => {
        // Arrange
        let locationService: LocationFilterService = TestBed.get(LocationFilterService);
        let alarmService: AlarmService = TestBed.get(AlarmService);
        alarmService.alarms = activeAlarms;

        // Act
        fixture = TestBed.createComponent(LocationFilter);
        fixture.componentInstance.scView = 'test';
        fixture.componentInstance.multiSelect = true;
        fixture.componentInstance.showFilter = false;
        fixture.componentInstance.filterOverride = false;
        fixture.componentInstance.showButtons = true;
        fixture.componentInstance.readOnly = true;
        fixture.detectChanges();

        // Assert - toggle button is not displayed
        let toggle = $('#filterLocationsToggle');
        expect(toggle.length).toEqual(0);

    });

    it('should not be readonly', () => {
        // Arrange
        let locationService: LocationFilterService = TestBed.get(LocationFilterService);
        let alarmService: AlarmService = TestBed.get(AlarmService);
        alarmService.alarms = activeAlarms;

        // Act
        fixture = TestBed.createComponent(LocationFilter);
        fixture.componentInstance.scView = 'test';
        fixture.componentInstance.multiSelect = true;
        fixture.componentInstance.showFilter = false;
        fixture.componentInstance.filterOverride = false;
        fixture.componentInstance.showButtons = false;
        fixture.componentInstance.readOnly = false;
        fixture.detectChanges();

        // Assert - toggle button is displayed
        let toggle = $('#filterLocationsToggle');
        expect(toggle.length).toEqual(1);

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