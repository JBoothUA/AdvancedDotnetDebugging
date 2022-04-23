import {
    async,
    ComponentFixture,
    TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ChooserStatus } from './chooser-status.component';
import { SharedModule } from '../shared/_shared.module';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PatrolService } from '../patrols/patrol.service';
import { HttpService } from '../shared/http.service';
import { MockHttpServiceAlarms } from '../test/alarms/mockHttp.service';
import { UserService } from '../shared/user.service';
import { LocationFilterService } from '../shared/location-filter.service';
import { LocationFilterPipe } from './location-filter.pipe';
import { AlarmService } from '../alarms/alarm.service';
import { PlatformService } from '../platforms/platform.service';
import { WindowService } from './window.service';
import { MockPlatformService } from '../test/platforms/mockPlatform.service';
import { PatrolInstance, PatrolTemplate } from '../patrols/patrol.class';
import { MockUserService } from '../test/mockUser.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { AppSettings } from '../shared/app-settings';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

describe('Chooser status component', () => {
    let fixture: ComponentFixture<ChooserStatus>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, SharedModule, HttpModule, BrowserAnimationsModule],
            declarations: [],
            providers: [PatrolService, { provide: HttpService, useClass: MockHttpServiceAlarms },
				{ provide: UserService, useClass: MockUserService }, LocationFilterService, LocationFilterPipe, AlarmService,
				{ provide: PlatformService, useClass: MockPlatformService }, PlatformMapService, WindowService, AppSettings]
        });
        TestBed.compileComponents();
    }));

    //it('should display correct choose text for platform mode when not on patrol', () => {
    //    // Arrange
    //    fixture = TestBed.createComponent(ChooserStatus);
    //    fixture.componentInstance.platformID = 'Gamma2Platform1';

    //    // Act
    //    fixture.detectChanges();

    //    // Assert
    //    expect(fixture.nativeElement.innerText).toContain("Choose Patrol");
    //});

    //it('should display correct choose text for patrol mode when not on patrol', () => {
    //    // Arrange
    //    fixture = TestBed.createComponent(ChooserStatus);
    //    let ps: PatrolService = TestBed.get(PatrolService);
    //    ps.upsert(mockPatrolTemplate);
    //    fixture.componentInstance.patrolTemplateID = 'd7334b55-5232-473d-9526-4ba2e403d1ee';

    //    // Act
    //    fixture.detectChanges();

    //    // Assert
    //    expect(fixture.nativeElement.innerText).toContain("Choose Robot");
    //});
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

let mockPatrolInstance: PatrolInstance = new PatrolInstance({
    "InstanceId": "4c865d49-3257-41a4-8378-76f5e5a63aab",
    "RunNumber": 0,
    "MaxRunNumber": 0,
    "LastUpdateTime": 1496799653893.166,
    "SubmittedTime": 1496799653893.166,
    "StartedTime": 0,
    "EndedTime": 0,
    "UserName": "live.com#jesse.booth@hexagonsi.com",
    "PlatformId": "Gamma2Platform1",
    "CurrentStatus": 0,
    "StatusHistory": null,
    "Points": [
        {
            "CurrentStatus": 0,
            "StatusHistory": null,
            "Actions": [
                {
                    "CurrentStatus": 0,
                    "StatusHistory": null,
                    "AlarmIds": null,
                    "Image": null,
                    "ActionId": "b05efcfb-8c9f-4982-af1b-115a11721dbd",
                    "Command": 3,
                    "Parameters": []
                },
                {
                    "CurrentStatus": 0,
                    "StatusHistory": null,
                    "AlarmIds": null,
                    "Image": null,
                    "ActionId": "f0461000-44c9-44f1-871e-52b767d9eda8",
                    "Command": 7,
                    "Parameters": []
                }
            ],
            "AlarmIds": null,
            "Telemetry": null,
            "PointId": "615496b3-bd9f-43d7-aa9e-eeec1249ba35",
            "DisplayName": "Point 1",
            "Ordinal": 1,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.0731850229204,
                    39.65030739030708
                ],
                "type": "Point"
            }
        },
        {
            "CurrentStatus": 0,
            "StatusHistory": null,
            "Actions": [
                {
                    "CurrentStatus": 0,
                    "StatusHistory": null,
                    "AlarmIds": null,
                    "Image": null,
                    "ActionId": "8f2b8783-f0ec-4614-8e25-fa34da9c19fe",
                    "Command": 23,
                    "Parameters": [
                        {
                            "Name": 4,
                            "Value": "cat",
                            "Type": 0
                        }
                    ]
                }
            ],
            "AlarmIds": null,
            "Telemetry": null,
            "PointId": "5e57e89d-4f68-4365-8f9b-e74b2a45706e",
            "DisplayName": "Point 2",
            "Ordinal": 2,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.07310908287765,
                    39.650274992857284
                ],
                "type": "Point"
            }
        },
        {
            "CurrentStatus": 0,
            "StatusHistory": null,
            "Actions": [
                {
                    "CurrentStatus": 0,
                    "StatusHistory": null,
                    "AlarmIds": null,
                    "Image": null,
                    "ActionId": "e85ea61b-d739-40e2-903c-65e4ddb53561",
                    "Command": 23,
                    "Parameters": [
                        {
                            "Name": 4,
                            "Value": "dog",
                            "Type": 0
                        }
                    ]
                }
            ],
            "AlarmIds": null,
            "Telemetry": null,
            "PointId": "b3391fd2-26e8-419a-9045-0c66ab53f5b7",
            "DisplayName": "Point 3",
            "Ordinal": 3,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.07309567183258,
                    39.65030984270305
                ],
                "type": "Point"
            }
        },
        {
            "CurrentStatus": 0,
            "StatusHistory": null,
            "Actions": [
                {
                    "CurrentStatus": 0,
                    "StatusHistory": null,
                    "AlarmIds": null,
                    "Image": null,
                    "ActionId": "188c25cf-b434-4c4f-aaff-76e1563889aa",
                    "Command": 2,
                    "Parameters": []
                },
                {
                    "CurrentStatus": 0,
                    "StatusHistory": null,
                    "AlarmIds": null,
                    "Image": null,
                    "ActionId": "5645c844-35c4-426e-b566-5d372e7ebcdd",
                    "Command": 6,
                    "Parameters": []
                }
            ],
            "AlarmIds": null,
            "Telemetry": null,
            "PointId": "c8f2a153-dd35-46ae-802f-a82d68052284",
            "DisplayName": "Point 4",
            "Ordinal": 4,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.07319658994676,
                    39.650277832475
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
            "PointId": "1f13e37e-85c8-4602-88da-5802eeaaf37c",
            "DisplayName": "Point 5",
            "Ordinal": 5,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.07321368902923,
                    39.65030390532314
                ],
                "type": "Point"
            }
        },
        {
            "CurrentStatus": 0,
            "StatusHistory": null,
            "Actions": [
                {
                    "CurrentStatus": 0,
                    "StatusHistory": null,
                    "AlarmIds": null,
                    "Image": null,
                    "ActionId": "129ac664-3881-4600-a7f4-173f91a572f3",
                    "Command": 12,
                    "Parameters": [
                        {
                            "Name": 0,
                            "Value": "Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.",
                            "Type": 0
                        }
                    ]
                }
            ],
            "AlarmIds": null,
            "Telemetry": null,
            "PointId": "eb7b849f-48b2-4d7c-b8e3-95655bb33d11",
            "DisplayName": "Point 6",
            "Ordinal": 6,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.0731486454606,
                    39.650277832475
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
            "PointId": "108f5c12-19a2-4f6a-9dff-22b1db02ad13",
            "DisplayName": "Point 7",
            "Ordinal": 7,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.07314428687098,
                    39.65031139158466
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
            "PointId": "3e3f56c2-c2e5-4f18-bafc-e98d4c741e5d",
            "DisplayName": "Point 8",
            "Ordinal": 8,
            "Description": null,
            "Position": {
                "coordinates": [
                    -105.0732331350446,
                    39.6502783487691
                ],
                "type": "Point"
            }
        }
    ],
    "AlarmIds": null,
    "TemplateId": "a1bfc357-f8ee-42df-a47b-47372f1abc65",
    "DisplayName": "DEMO-LVL2",
    "Description": "DEMO-LVL2",
    "Type": 0,
    "IsTemplate": false,
    "IsDeleted": false,
    "AreaType": 1,
    "TenantId": "0f2f363b-a2fb-4ced-a9a4-54510a1a67ce",
    "LocationId": "c093abb5-58be-410b-80bf-ca7a52e52ac3",
    "Version": 0,
    "id": "4c865d49-3257-41a4-8378-76f5e5a63aab"
});
