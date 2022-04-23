import {
    async,
    ComponentFixture,
    TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PatrolCard } from './patrol-card.component';
import { PatrolModule } from './_patrol.module';
import { SharedModule } from './../shared/_shared.module';
import { PatrolService } from './patrol.service';
import { HttpModule } from '@angular/http';
import { HttpService } from '../shared/http.service';
import { MockHttpService } from '../test/mockHttp.service';
import { UserService } from '../shared/user.service';
import { LocationFilterService } from '../shared/location-filter.service';
import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { AlarmService } from './../alarms/alarm.service';
import { PlatformModule } from './../platforms/_platform.module';
import { CommandPlatformDialog } from './../platforms/command-platform-dialog.component';
import { MockPlatformService } from './../test/platforms/mockPlatform.service';
import { PlatformService } from './../platforms/platform.service';
import { PlatformMapService } from './../map/platforms/platformMap.service';
import { WindowService } from './../shared/window.service';
import { PatrolTemplate, PatrolInstance } from './patrol.class';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockUserService } from '../test/mockUser.service';
import { PatrolProgressbar } from './patrol-progressbar.component';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

describe('Patrol list item component', () => {
    let fixture: ComponentFixture<PatrolCard>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, PatrolModule, SharedModule, HttpModule, PatrolModule, BrowserAnimationsModule],
            declarations: [PatrolCard, PatrolProgressbar],
            providers: [PatrolService, { provide: HttpService, useClass: MockHttpService },
                { provide: UserService, useClass: MockUserService }, LocationFilterService, LocationFilterPipe, AlarmService,
                { provide: PlatformService, useClass: MockPlatformService }, PlatformMapService, WindowService
            ]
        });
        TestBed.compileComponents();
    }));

    //it('should display patrol card that has no instance', () => {
    //    // Arrange
    //    fixture = TestBed.createComponent(PatrolListItem);
    //    let patrolService: PatrolService = TestBed.get(PatrolService);
    //    patrolService.upsert(mockPatrolTemplate);
    //    fixture.componentInstance.patrolTemplate = mockPatrolTemplate;

    //    // Act
    //    fixture.detectChanges();

    //    // Assert
    //    expect(fixture.nativeElement.innerText).toContain('Small Patrol');
    //});

    //it('should display patrol card with instance data', () => {
    //    // Arrange
    //    let patrolService: PatrolService = TestBed.get(PatrolService);
    //    patrolService.upsert(mockPatrolTemplate);
    //    patrolService.upsertInstance(mockPatrolInstance);

    //    fixture = TestBed.createComponent(PatrolListItem);
    //    fixture.componentInstance.patrolTemplate = mockPatrolTemplate;
    //    fixture.componentInstance.patrolInstance = mockPatrolInstance;
    //    fixture.componentInstance.patrolInstanceDirtyToggle = !fixture.componentInstance.patrolInstanceDirtyToggle;

    //    // Act
    //    fixture.detectChanges();

    //    // Assert
    //    expect(fixture.nativeElement.innerText).toContain('On Patrol');
    //});

});

let mockPatrolInstance: PatrolInstance = new PatrolInstance({
    "InstanceId": "6cb0eacf-16f8-4a03-8c92-fc3e53b23fb9",
    "RunNumber": 0,
    "MaxRunNumber": 0,
    "LastUpdateTime": 1496939594626.7942,
    "SubmittedTime": 1496939594626.7942,
    "StartedTime": 0,
    "EndedTime": 0,
    "UserName": "live.com#ricky.crow@hexagonsi.com",
    "PlatformId": "Gamma2Platform1",
    "CurrentStatus": 0,
    "StatusHistory": null,
    "Points": [
        {
            "CurrentStatus": 0,
            "StatusHistory": null,
            "Actions": [],
            "AlarmIds": null,
            "Telemetry": null,
            "PointId": "befaefff-2cc9-455b-87d2-9645943444a4",
            "DisplayName": "Point 1",
            "Ordinal": 1,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.07331963628532,
                    39.65030313088224
                ],
                "type": "Point"
            }
        },
        {
            "CurrentStatus": 0,
            "StatusHistory": null,
            "Actions": [],
            "AlarmIds": null,
            "Telemetry": null,
            "PointId": "61dcf852-463f-4ea6-9376-2eac9dfea186",
            "DisplayName": "Point 2",
            "Ordinal": 2,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.07321570068599,
                    39.65030235644135
                ],
                "type": "Point"
            }
        },
        {
            "CurrentStatus": 0,
            "StatusHistory": null,
            "Actions": [],
            "AlarmIds": null,
            "Telemetry": null,
            "PointId": "def94e5b-ce0b-4426-ad2d-28933584f456",
            "DisplayName": "Point 3",
            "Ordinal": 3,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.07321570068599,
                    39.6502796395044
                ],
                "type": "Point"
            }
        },
        {
            "CurrentStatus": 0,
            "StatusHistory": null,
            "Actions": [],
            "AlarmIds": null,
            "Telemetry": null,
            "PointId": "ab4569e0-81da-419a-ad97-90ed7af13534",
            "DisplayName": "Point 4",
            "Ordinal": 4,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.07331896573307,
                    39.65028093023964
                ],
                "type": "Point"
            }
        }
    ],
    "AlarmIds": null,
    "TemplateId": "6cb0eacf-16f8-4a03-8c92-fc3e53b23fb9",
    "DisplayName": "Ryan",
    "Description": null,
    "Type": 0,
    "IsTemplate": false,
    "IsDeleted": false,
    "AreaType": 1,
    "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
    "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
    "Version": 0,
    "id": "3dd0dc50-42f2-4853-8948-ce296cf3fe04"
});

let mockPatrolTemplate: PatrolTemplate = new PatrolTemplate({
    "Points": [
        {
            "Actions": null,
            "PointId": "6277f7cd8dce4da7b28219fef574a440",
            "DisplayName": "Point 1",
            "Ordinal": 1,
            "Description": "First point to go to",
            "Position": {
                "coordinates": [
                    -86.5861,
                    34.7304
                ],
                "type": "Point"
            }
        }
    ],
    "LastPatrolStatus": 0,
    "IsPatrolSubmitted": false,
    "TemplateId": "d7334b55-5232-473d-9526-4ba2e403d1ee",
    "DisplayName": "Small Patrol",
    "Description": "Small area patrol around the main room",
    "Type": 0,
    "IsTemplate": true,
    "IsDeleted": false,
    "AreaType": 1,
    "TenantId": "0f2f363b-a2fb-4ced-a9a4-54510a1a67ce",
    "LocationId": null,
    "Version": 0,
    "id": "d7334b55-5232-473d-9526-4ba2e403d1ee"
}); 