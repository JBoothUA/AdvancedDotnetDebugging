import { async } from '@angular/core/testing';
import { PatrolTemplate, PatrolInstance } from './patrol.class';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
describe('Patrol service', function () {
    beforeEach(async(function () {
        //     TestBed.configureTestingModule({
        //         imports: [HttpModule],
        //         declarations: [],
        //providers: [PatrolService, { provide: HttpService, useClass: MockHttpServiceAlarms },
        //             { provide: UserService, useClass: MockUserService }, LocationFilterService, AlarmService, LocationFilterPipe]
        //     });
        //     TestBed.compileComponents();
    }));
    //   it('should insert new patrol template and update map object', () => {
    //       // Arrange
    //       let patrolService: PatrolService = TestBed.get(PatrolService);
    //       // Act
    //       expect(patrolService.patrolTemplates.length).toBe(0);
    //       patrolService.upsert(mockPatrolTemplate);
    //       // Assert
    //       expect(patrolService.patrolTemplates.length).toBe(1);
    //       expect((patrolService as any).patrolTemplateMap.size).toBe(1);
    //   });
    //   it('should insert new patrol instance and update map object', () => {
    //       // Arrange
    //       let patrolService: PatrolService = TestBed.get(PatrolService);
    //       // Act
    //       expect(patrolService.patrolInstances.length).toBe(0);
    //       patrolService.upsertInstance(mockPatrolInstance);
    //       // Assert
    //       expect(patrolService.patrolInstances.length).toBe(1);
    //       expect((patrolService as any).patrolInstanceMap.size).toBe(1);
    //       expect((patrolService as any).patrolTemplateInstanceMap.size).toBe(1);
    //   });
    //   it('should return a patrol instance', () => {
    //       // Arrange
    //       let patrolService: PatrolService = TestBed.get(PatrolService);
    //       patrolService.upsertInstance(mockPatrolInstance);
    //       // Act
    //       let pi = patrolService.getPatrolInstance('6cb0eacf-16f8-4a03-8c92-fc3e53b23fb9');
    //       // Assert
    //       expect(pi).not.toEqual(null);
    //   });
    //   it('should return completed patrol points count', () => {
    //       // Arrange
    //       let patrolService: PatrolService = TestBed.get(PatrolService);
    //       let patrolInstance_mock = new PatrolInstance(mockPatrolInstance);
    //       patrolInstance_mock.Points[0].CurrentStatus = PointStatusValues.Reached;
    //       // Act
    //       let count: number = patrolService.getCompletedPatrolPoints(patrolInstance_mock);
    //       // Assert
    //       expect(count).toEqual(1);
    //   });
    //   it('should return patrol completeness', () => {
    //       // Arrange
    //       let patrolService: PatrolService = TestBed.get(PatrolService);
    //       let patrolInstance_mock = new PatrolInstance(mockPatrolInstance);
    //       patrolInstance_mock.Points[0].CurrentStatus = PointStatusValues.Reached;
    //       // Act
    //       let completeness: number = patrolService.getPatrolCompleteness(patrolInstance_mock);
    //       // Assert
    //       expect(completeness).toEqual(0.25);
    //   });
    //   it('should look at point actions and return if fail status should bubble up', () => {
    //       // Arrange
    //       let patrolService: PatrolService = TestBed.get(PatrolService);
    //       let patrolInstance_mock = new PatrolInstance(mockPatrolInstance);
    //       // Act
    //       let bubbleUp = !patrolService.isPointInstanceGood(patrolInstance_mock.Points);
    //       expect(bubbleUp).toBe(false);
    //       patrolInstance_mock.Points[0].CurrentStatus = PointStatusValues.NotReached;
    //       bubbleUp = !patrolService.isPointInstanceGood(patrolInstance_mock.Points);
    //       // Assert
    //       expect(bubbleUp).toBe(true);
    //       // Act
    //       patrolInstance_mock.Points[0].CurrentStatus = PointStatusValues.Reached;
    //       patrolInstance_mock.Points[0].Actions = [
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           })
    //       ];
    //       bubbleUp = !patrolService.isPointInstanceGood(patrolInstance_mock.Points);
    //       // Assert
    //       expect(bubbleUp).toBe(false);
    //       // Act
    //       patrolInstance_mock.Points[0].CurrentStatus = PointStatusValues.Reached;
    //       patrolInstance_mock.Points[0].Actions = [
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Failed
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           })
    //       ];
    //       bubbleUp = !patrolService.isPointInstanceGood(patrolInstance_mock.Points);
    //       // Assert
    //       expect(bubbleUp).toBe(true);
    //   });
    //   it('should return correct patrol completeness color', () => {
    //       // Arrange
    //       let patrolService: PatrolService = TestBed.get(PatrolService);
    //       let patrolInstance_mock = new PatrolInstance(mockPatrolInstance);
    //       // Act
    //       let color = patrolService.getPatrolCompletnessColor(patrolInstance_mock);
    //       // Assert
    //       expect(color).toEqual('#249C49');
    //       // Act
    //       patrolInstance_mock.Points[0].CurrentStatus = PointStatusValues.Reached;
    //       patrolInstance_mock.Points[0].Actions = [
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Failed
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           })
    //       ];
    //       color = patrolService.getPatrolCompletnessColor(patrolInstance_mock);
    //       // Assert
    //       expect(color).toEqual('#E9AB08');
    //   });
    //   it('should determine if point is checkpoint', () => {
    //       // Arrange
    //       let patrolService: PatrolService = TestBed.get(PatrolService);
    //       let patrolInstance_mock = new PatrolInstance(mockPatrolInstance);
    //       // Act
    //       let isCheckPoint = patrolService.isCheckPoint(patrolInstance_mock.Points[0]);
    //       // Assert
    //       expect(isCheckPoint).toBe(false);
    //       // Act
    //       patrolInstance_mock.Points[0].Actions = [
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           })
    //       ];
    //       isCheckPoint = patrolService.isCheckPoint(patrolInstance_mock.Points[0]);
    //       // Assert
    //       expect(isCheckPoint).toBe(true);
    //   });
    //   it('should return point completeness color', () => {
    //       // Arrange
    //       let patrolService: PatrolService = TestBed.get(PatrolService);
    //       let patrolInstance_mock = new PatrolInstance(mockPatrolInstance);
    //       // Act
    //       patrolInstance_mock.Points[0].Actions = [
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           })
    //       ];
    //       let color = patrolService.getPointCompletenessColor(patrolInstance_mock.Points[0]);
    //       // Assert
    //       expect(color).toEqual('#249C49');
    //       // Act
    //       patrolInstance_mock.Points[0].Actions = [
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Failed
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           })
    //       ];
    //       color = patrolService.getPointCompletenessColor(patrolInstance_mock.Points[0]);
    //       // Assert
    //       expect(color).toEqual('#E9AB08');
    //       // Act
    //       patrolInstance_mock.Points[0].Actions = [
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Unsupported
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           })
    //       ];
    //       color = patrolService.getPointCompletenessColor(patrolInstance_mock.Points[0]);
    //       // Assert
    //       expect(color).toEqual('#E9AB08');
    //   });
    //   it('should retun point completeness', () => {
    //       // Arrange
    //       let patrolService: PatrolService = TestBed.get(PatrolService);
    //       let patrolInstance_mock = new PatrolInstance(mockPatrolInstance);
    //       patrolInstance_mock.Points[0].Actions = [
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Unknown
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Unknown
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Unknown
    //           })
    //       ];
    //       // Act
    //       let pointCompletness: number = patrolService.getPointCompletness(patrolInstance_mock.Points[0]);
    //       // Assert
    //       expect(pointCompletness).toEqual(0.0);
    //       // Act
    //       patrolInstance_mock.Points[0].Actions = [
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Started
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Unknown
    //           }),
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Unknown
    //           })
    //       ];
    //       pointCompletness = patrolService.getPointCompletness(patrolInstance_mock.Points[0]);
    //       // Assert
    //       expect(pointCompletness).toEqual(0.25);
    //   });
    //   it('should return point icon src', () => {
    //       // Arrange
    //       let patrolService: PatrolService = TestBed.get(PatrolService);
    //       let patrolInstance_mock = new PatrolInstance(mockPatrolInstance);
    //       patrolInstance_mock.Points[0].CurrentStatus = PointStatusValues.InTransit;
    //       // Act
    //       let src: string = patrolService.getPointIconSrc(patrolInstance_mock.Points[0], patrolInstance_mock);
    //       // Assert
    //       expect(src).toEqual('/Content/Images/Patrols/checkpoint-not-yet-arrived.png');
    //       // Act
    //       patrolInstance_mock.Points[0].CurrentStatus = PointStatusValues.NotReached;
    //       src = patrolService.getPointIconSrc(patrolInstance_mock.Points[0], patrolInstance_mock);
    //       // Assert
    //       expect(src).toEqual('/Content/Images/Patrols/last-patrol-checkpoint-failed.png');
    //       // Act
    //       patrolInstance_mock.Points[0].CurrentStatus = PointStatusValues.NotReached;
    //       patrolInstance_mock.Points[0].Actions = [
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Unknown
    //           })
    //       ];
    //       src = patrolService.getPointIconSrc(patrolInstance_mock.Points[0], patrolInstance_mock);
    //       // Assert
    //       expect(src).toEqual('/Content/Images/Patrols/checkpoint-failed.png');
    //       // Act
    //       patrolInstance_mock.Points[0].CurrentStatus = PointStatusValues.Reached;
    //       patrolInstance_mock.Points[0].Actions = [
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Unknown
    //           })
    //       ];
    //       src = patrolService.getPointIconSrc(patrolInstance_mock.Points[0], patrolInstance_mock);
    //       // Assert
    //       expect(src).toEqual('/Content/Images/Patrols/checkpoint-not-yet-arrived.png');
    //       // Act
    //       patrolInstance_mock.Points[0].CurrentStatus = PointStatusValues.ActionsPerformed;
    //       patrolInstance_mock.Points[0].Actions = [
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Unknown
    //           })
    //       ];
    //       src = patrolService.getPointIconSrc(patrolInstance_mock.Points[0], patrolInstance_mock);
    //       // Assert
    //       expect(src).toEqual('/Content/Images/Patrols/checkpoint-failed.png');
    //       // Act
    //       patrolInstance_mock.Points[0].CurrentStatus = PointStatusValues.ActionsPerformed;
    //       patrolInstance_mock.Points[0].Actions = [
    //           new ActionInstance({
    //               CurrentStatus: ActionStatusValues.Completed
    //           })
    //       ];
    //	src = patrolService.getPointIconSrc(patrolInstance_mock.Points[0], patrolInstance_mock);
    //	// Assert
    //	expect(src).toEqual('/Content/Images/Patrols/checkpoint-succesful.png');
    //});
    //it('should remove patrol template', () => {
    //	// Arrange
    //	let patrolService: PatrolService = TestBed.get(PatrolService);
    //	let patrolTemplate_mock = new PatrolTemplate(mockPatrolTemplate);
    //	// Act
    //	patrolService.upsert(patrolTemplate_mock);
    //	// Assert
    //	expect(patrolService.patrolTemplates.length).toEqual(1);
    //	// Act
    //	patrolService.removeTemplate('d7334b55-5232-473d-9526-4ba2e403d1ee');
    //	// Assert
    //	expect(patrolService.patrolTemplates.length).toEqual(0);
    //});
    //it('should return point status', () => {
    //	// Arrange
    //	let patrolService: PatrolService = TestBed.get(PatrolService);
    //	let patrolInstance_mock = new PatrolInstance(mockPatrolInstance);
    //	// Act
    //	patrolInstance_mock.Points[0].CurrentStatus = PointStatusValues.InTransit;
    //	let pointStatus: PointStatusValues = patrolService.getPointStatus(patrolInstance_mock.Points[0], patrolInstance_mock.Points);
    //	// Assert
    //	expect(pointStatus).toEqual(PointStatusValues.InTransit);
    //	// Act
    //	patrolInstance_mock.Points[0].CurrentStatus = PointStatusValues.Reached;
    //       // Assert
    //       expect(pointStatus).toEqual(PointStatusValues.InTransit);
    //   });
    //   it('should return patrol template', () => {
    //       // Arrange
    //       let patrolService: PatrolService = TestBed.get(PatrolService);
    //       let patrolTemplate_mock = new PatrolTemplate(mockPatrolTemplate);
    //       patrolService.upsert(patrolTemplate_mock);
    //       // Act
    //       let foundTemplate = patrolService.getPatrolTemplate('d7334b55-5232-473d-9526-4ba2e403d1ee');
    //       // Assert
    //       expect(foundTemplate).not.toBe(null);
    //   });
    //   it('should return if patrol is on patrol', () => {
    //       // Arrange
    //       let patrolService: PatrolService = TestBed.get(PatrolService);
    //       let patrolInstance_mock = new PatrolInstance(mockPatrolInstance);
    //       let patrolTemplate_mock = new PatrolTemplate(mockPatrolTemplate);
    //       patrolTemplate_mock.IsPatrolSubmitted = true;
    //       patrolService.upsert(patrolTemplate_mock);
    //       patrolInstance_mock.TemplateId = patrolTemplate_mock.TemplateId;
    //       // Act
    //       let isOnPatrol = patrolService.isOnPatrol(patrolTemplate_mock);
    //       // Assert
    //       expect(isOnPatrol).toBe(true);
    //       // Act
    //       patrolTemplate_mock.IsPatrolSubmitted = false;
    //       isOnPatrol = patrolService.isOnPatrol(patrolTemplate_mock)
    //       // Assert
    //       expect(isOnPatrol).toBe(false);
    //       // Act
    //       patrolService.upsertInstance(patrolInstance_mock);
    //       isOnPatrol = patrolService.isOnPatrol(patrolTemplate_mock)
    //       // Assert 
    //       expect(isOnPatrol).toBe(true);
    //   });
    //   it('should handle patrol message correctly', () => {
    //       // Arrange
    //       let patrolService: PatrolService = TestBed.get(PatrolService);
    //       let patrolTemplate_mock = new PatrolTemplate(mockPatrolTemplate);
    //       patrolService.upsert(patrolTemplate_mock);
    //       let message: object = {
    //           IsDeleted: true,
    //           id: patrolTemplate_mock.id
    //       }
    //       //Test delete path
    //       // Act
    //       patrolService.handleMessage(message);
    //       // Assert
    //       expect(patrolService.patrolTemplates.length).toEqual(0);
    //       //Test patrol template path
    //       // Act
    //       message = {
    //           IsTemplate: true,
    //           id: '123',
    //           TemplateId: '123'
    //       }
    //       patrolService.handleMessage(message);
    //       // Assert
    //       expect(patrolService.patrolTemplates.length).toEqual(1);
    //       //Test instance path
    //       // Act
    //       message = JSON.parse(JSON.stringify(mockPatrolInstance));
    //       patrolService.handleMessage(message);
    //       // Assert
    //       expect(patrolService.patrolInstances.length).toEqual(1);
    //   });
});
var mockPatrolInstance = new PatrolInstance({
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
var mockPatrolTemplate = new PatrolTemplate({
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
//# sourceMappingURL=patrol.service.spec.js.map