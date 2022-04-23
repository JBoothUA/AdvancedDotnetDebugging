var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@angular/core';
import { PatrolService } from '../../patrols/patrol.service';
import { PatrolTemplate, PatrolInstance } from '../../patrols/patrol.class';
var MockPatrolService = /** @class */ (function (_super) {
    __extends(MockPatrolService, _super);
    function MockPatrolService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MockPatrolService.prototype.loadPatrolTemplates = function () {
        this.patrolTemplates = [new PatrolTemplate({
                "Points": [
                    {
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "37be6939-2f91-4517-b8a3-2814b7721df1",
                        "DisplayName": "Point 1",
                        "Ordinal": 1,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07318653166296,
                                39.650303647176194
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "e6910174-6197-435f-976c-e13a876229e0",
                        "DisplayName": "Point 2",
                        "Ordinal": 2,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07311914116146,
                                39.65030338902922
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "a5aa5fdc-3bc0-4548-95f8-1860b5485472",
                        "DisplayName": "Point 3",
                        "Ordinal": 3,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07310640066864,
                                39.65028686762152
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "758f77e8-54b9-4da7-9485-d2c2c3ad09ff",
                        "DisplayName": "Point 4",
                        "Ordinal": 4,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07313255220654,
                                39.65028273726896
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "766aa45e-356b-45c3-ba37-9e508b80e280",
                        "DisplayName": "Point 5",
                        "Ordinal": 5,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07318720221522,
                                39.65028609318042
                            ],
                            "type": "Point"
                        }
                    }
                ],
                "AlarmIds": null,
                "TemplateId": "018f0b9c-5e26-4bcb-a388-28447da91f29",
                "DisplayName": "rpc",
                "Description": null,
                "Type": 0,
                "IsTemplate": true,
                "IsDeleted": false,
                "AreaType": 2,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                "Version": 0,
                "id": "5c3a6aab-3725-4b2a-a577-6ad95c3adb66"
            })];
    };
    MockPatrolService.prototype.loadPatrolInstances = function () {
        this.patrolInstances = [new PatrolInstance({
                "InstanceId": "018f0b9c-5e26-4bcb-a388-28447da91f29",
                "RunNumber": 1,
                "MaxRunNumber": 0,
                "LastUpdateTime": 1496953858774.7686,
                "SubmittedTime": 1496953772269,
                "StartedTime": 1496932181000,
                "EndedTime": 1496932253000,
                "UserName": "live.com#ricky.crow@hexagonsi.com",
                "PlatformId": "Gamma2Platform1",
                "CurrentStatus": 2,
                "StatusHistory": [
                    {
                        "Status": 1,
                        "ReportedTime": 1496932181000
                    },
                    {
                        "Status": 2,
                        "ReportedTime": 1496932253000
                    }
                ],
                "Points": [
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496932181000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932197000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932197000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "37be6939-2f91-4517-b8a3-2814b7721df1",
                        "DisplayName": "Point 1",
                        "Ordinal": 1,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07318653166296,
                                39.650303647176194
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496932197000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932220000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "e6910174-6197-435f-976c-e13a876229e0",
                        "DisplayName": "Point 2",
                        "Ordinal": 2,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07311914116146,
                                39.65030338902922
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496932220000
                            },
                            {
                                "Status": 1,
                                "ReportedTime": 1496932220000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932228000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932228000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "a5aa5fdc-3bc0-4548-95f8-1860b5485472",
                        "DisplayName": "Point 3",
                        "Ordinal": 3,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07310640066864,
                                39.65028686762152
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496932228000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932237000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "758f77e8-54b9-4da7-9485-d2c2c3ad09ff",
                        "DisplayName": "Point 4",
                        "Ordinal": 4,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07313255220654,
                                39.65028273726896
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496932237000
                            },
                            {
                                "Status": 1,
                                "ReportedTime": 1496932237000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932253000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "766aa45e-356b-45c3-ba37-9e508b80e280",
                        "DisplayName": "Point 5",
                        "Ordinal": 5,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07318720221522,
                                39.65028609318042
                            ],
                            "type": "Point"
                        }
                    }
                ],
                "AlarmIds": null,
                "TemplateId": "018f0b9c-5e26-4bcb-a388-28447da91f29",
                "DisplayName": "rpc",
                "Description": null,
                "Type": 0,
                "IsTemplate": false,
                "IsDeleted": false,
                "AreaType": 2,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                "Version": 0,
                "id": "5c3a6aab-3725-4b2a-a577-6ad95c3adb66"
            })];
    };
    MockPatrolService = __decorate([
        Injectable()
    ], MockPatrolService);
    return MockPatrolService;
}(PatrolService));
export { MockPatrolService };
//# sourceMappingURL=mockPatrol.service.js.map