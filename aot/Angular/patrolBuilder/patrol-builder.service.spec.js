//import {
//	async,
//	TestBed
//} from '@angular/core/testing';
//import { PatrolService } from '../patrols/patrol.service';
//import { PatrolBuilderService } from './patrol-builder.service';
//import { HttpService } from '../shared/http.service';
//import { MockHttpService } from '../test/mockHttp.service';
//import { MockPBPatrolService } from './mockPBPatrol.service';
//import { HttpModule } from '@angular/http';
//import { UserService } from '../shared/user.service';
//import { MockUserService } from '../test/mockUser.service';
//import { Tenant } from '../shared/tenant.class';
//import { LocationFilterService } from '../shared/location-filter.service';
//import { AlarmService } from '../alarms/alarm.service';
//import { LocationFilterPipe } from '../shared/location-filter.pipe';
//import { PatrolTemplate } from '../patrols/patrol.class';
//import { AppSettings } from '../shared/app-settings';
//jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
//describe('Patrol Builder service', () => {
//	beforeEach(async(() => {
//		TestBed.configureTestingModule({
//			imports: [HttpModule],
//			declarations: [],
//			providers: [PatrolBuilderService, { provide: PatrolService, useClass: MockPBPatrolService }, { provide: HttpService, useClass: MockHttpService },
//				{ provide: UserService, useClass: MockUserService },
//				LocationFilterService, AlarmService, LocationFilterPipe, AppSettings]
//		});
//		TestBed.compileComponents();
//	}));
//	//it('should get active tenant & location id', () => {
//	//	// Arrange
//	//	let pbService: PatrolBuilderService = TestBed.get(PatrolBuilderService);
//	//	let locFilterService: LocationFilterService = TestBed.get(LocationFilterService);
//	//	// Act
//	//	locFilterService.registerComponent('mapview', true);
//	//	let tenants: Tenant[] = locFilterService.getAllTenantLocations('mapview');
//	//	locFilterService.setSelectedTenantLocations("mapview", tenants);
//	//	let tenantId: string = pbService.getActiveTenantID();
//	//	let locationId: string = pbService.getActiveLocationID();
//	//	// Assert
//	//	expect(tenantId).toBe(tenants[0].Id);
//	//	expect(locationId).toBe(tenants[0].Locations[0].Id);
//	//});
//	it('should select patrol points', () => {
//		// Arrange
//		//let pbService: PatrolBuilderService = TestBed.get(PatrolBuilderService);
//		//// Act
//		//let pointId = testPatrol.Points[0].PointId;
//		//pbService.selectPatrolPoint(testPatrol, pointId);
//		//// Assert
//		//expect(testPatrol.Points[0].Selected).toBe(true);
//		//// Act
//		//let pointId2 = testPatrol.Points[1].PointId;
//		//pbService.selectPatrolPoint(testPatrol, pointId2);
//		//// Assert
//		//expect(testPatrol.Points[0].Selected).toBe(true);
//		//expect(testPatrol.Points[1].Selected).toBe(true);
//		//testPatrol.Points[0].Selected = false;
//		//testPatrol.Points[1].Selected = false;
//	});
//	//it('should only have one patrol point selected', () => {
//	//	// Arrange
//	//	let pbService: PatrolBuilderService = TestBed.get(PatrolBuilderService);
//	//	// Act
//	//	let pointId = testPatrol.Points[0].PointId;
//	//	pbService.selectPatrolPoint(testPatrol, pointId);
//	//	let pointId2 = testPatrol.Points[1].PointId;
//	//	pbService.selectOnlyPatrolPoint(testPatrol, pointId2);
//	//	// Assert
//	//	expect(testPatrol.Points[0].Selected).toBe(false);
//	//	expect(testPatrol.Points[1].Selected).toBe(true);
//	//	testPatrol.Points[0].Selected = false;
//	//	testPatrol.Points[1].Selected = false;
//	//});
//	//it('should deselect patrol points', () => {
//	//	// Arrange
//	//	let pbService: PatrolBuilderService = TestBed.get(PatrolBuilderService);
//	//	// Act
//	//	let pointId = testPatrol.Points[0].PointId;
//	//	pbService.selectPatrolPoint(testPatrol, pointId);
//	//	let pointId2 = testPatrol.Points[1].PointId;
//	//	pbService.selectPatrolPoint(testPatrol, pointId2);
//	//	pbService.deselectPatrolPoint(testPatrol, pointId);
//	//	// Assert
//	//	expect(testPatrol.Points[0].Selected).toBe(false);
//	//	expect(testPatrol.Points[1].Selected).toBe(true);
//	//	testPatrol.Points[0].Selected = false;
//	//	testPatrol.Points[1].Selected = false;
//	//});
//	//it('should deselect all patrol points', () => {
//	//	// Arrange
//	//	let pbService: PatrolBuilderService = TestBed.get(PatrolBuilderService);
//	//	// Act
//	//	let pointId = testPatrol.Points[0].PointId;
//	//	pbService.selectPatrolPoint(testPatrol, pointId);
//	//	let pointId2 = testPatrol.Points[1].PointId;
//	//	pbService.selectPatrolPoint(testPatrol, pointId2);
//	//	// Assert
//	//	expect(testPatrol.Points[0].Selected).toBe(true);
//	//	expect(testPatrol.Points[1].Selected).toBe(true);
//	//	// Act
//	//	pbService.deselectAllPatrolPoints(testPatrol);
//	//	// Assert
//	//	expect(testPatrol.Points[0].Selected).toBe(false);
//	//	expect(testPatrol.Points[1].Selected).toBe(false);
//	//	testPatrol.Points[0].Selected = false;
//	//	testPatrol.Points[1].Selected = false;
//	//});
//	//it('should get correct count of selected patrol points', () => {
//	//	// Arrange
//	//	let pbService: PatrolBuilderService = TestBed.get(PatrolBuilderService);
//	//	// Act
//	//	let pointId = testPatrol.Points[0].PointId;
//	//	pbService.selectPatrolPoint(testPatrol, pointId);
//	//	let pointId2 = testPatrol.Points[1].PointId;
//	//	pbService.selectPatrolPoint(testPatrol, pointId2);
//	//	let count:number = pbService.getSelectedPatrolPointCount(testPatrol);
//	//	// Assert
//	//	expect(count).toBe(2);
//	//	// Act
//	//	pbService.deselectAllPatrolPoints(testPatrol);
//	//	count = pbService.getSelectedPatrolPointCount(testPatrol);
//	//	// Assert
//	//	expect(count).toBe(0);
//	//	// Act
//	//	pbService.selectPatrolPoint(testPatrol, pointId);
//	//	count = pbService.getSelectedPatrolPointCount(testPatrol);
//	//	// Assert
//	//	expect(count).toBe(1);
//	//	testPatrol.Points[0].Selected = false;
//	//	testPatrol.Points[1].Selected = false;
//	//});
//	//it('should select action def', () => {
//	//	// Arrange
//	//	let pbService: PatrolBuilderService = TestBed.get(PatrolBuilderService);
//	//	let patrolService: PatrolService = TestBed.get(PatrolService);
//	//	let actDefs = patrolService.getActionDefinitions();
//	//	// Act
//	//	let actDef = actDefs[0].Categories[0].ActionDefinitions[0];
//	//	pbService.selectActionDef(actDef);
//	//	// Assert
//	//	expect(actDef.Selected).toBe(true);
//	//	actDef.Selected = false;
//	//});
//	//it('should deselect action def', () => {
//	//	// Arrange
//	//	let pbService: PatrolBuilderService = TestBed.get(PatrolBuilderService);
//	//	let patrolService: PatrolService = TestBed.get(PatrolService);
//	//	let actDefs = patrolService.getActionDefinitions();
//	//	// Act
//	//	let actDef = actDefs[0].Categories[0].ActionDefinitions[0];
//	//	pbService.selectActionDef(actDef);
//	//	// Assert
//	//	expect(actDef.Selected).toBe(true);
//	//	// Act
//	//	pbService.deselectActionDef(actDef);
//	//	// Assert
//	//	expect(actDef.Selected).toBe(false);
//	//	actDef.Selected = false;
//	//});
//	//it('should test step 1 completed', () => {
//	//	// Arrange
//	//	let pbService: PatrolBuilderService = TestBed.get(PatrolBuilderService);
//	//	// Act
//	//	let completed = pbService.isStep1Completed(testPatrol);
//	//	// Assert
//	//	expect(completed).toBe(true);
//	//	testPatrol.DisplayName = null;
//	//	completed = pbService.isStep1Completed(testPatrol);
//	//	// Assert
//	//	expect(completed).toBe(false);
//	//});
//	//it('should append patrol point and update ordinals and display names', () => {
//	//	// Arrange
//	//	let pbService: PatrolBuilderService = TestBed.get(PatrolBuilderService);
//	//	// Act
//	//	let length = testPatrol.Points.length;
//	//	let lat = 5.0;
//	//	let lng = 5.0;
//	//	pbService.appendPatrolPoint(testPatrol,lat,lng );
//	//	// Assert
//	//	expect(testPatrol.Points.length).toBe(length + 1);
//	//	expect(testPatrol.Points[length].Position.Coordinates[0]).toBe(lng);
//	//	expect(testPatrol.Points[length].Position.Coordinates[1]).toBe(lat);
//	//	expect(testPatrol.Points[length].DisplayName).toBe('Point ' + (length+1).toString());
//	//	testPatrol = new PatrolTemplate(inputPatrol);
//	//});
//	//it('should prepend patrol point and update ordinals and display names', () => {
//	//	// Arrange
//	//	let pbService: PatrolBuilderService = TestBed.get(PatrolBuilderService);
//	//	// Act
//	//	let length = testPatrol.Points.length;
//	//	let lat = 5.0;
//	//	let lng = 5.0;
//	//	pbService.prependPatrolPoint(testPatrol, lat, lng);
//	//	// Assert
//	//	expect(testPatrol.Points.length).toBe(length + 1);
//	//	expect(testPatrol.Points[0].Position.Coordinates[0]).toBe(lng);
//	//	expect(testPatrol.Points[0].Position.Coordinates[1]).toBe(lat);
//	//	expect(testPatrol.Points[0].DisplayName).toBe('Point 1');
//	//	expect(testPatrol.Points[1].DisplayName).toBe('Point 2');
//	//	testPatrol = new PatrolTemplate(inputPatrol);
//	//});
//	//it('should insert patrol point after and update ordinals and display names', () => {
//	//	// Arrange
//	//	let pbService: PatrolBuilderService = TestBed.get(PatrolBuilderService);
//	//	// Act
//	//	let length = testPatrol.Points.length;
//	//	let lat = 5.0;
//	//	let lng = 5.0;
//	//	pbService.insertPatrolPointAfter(testPatrol,testPatrol.Points[1],lat,lng);
//	//	// Assert
//	//	expect(testPatrol.Points.length).toBe(length + 1);
//	//	expect(testPatrol.Points[2].Position.Coordinates[0]).toBe(lng);
//	//	expect(testPatrol.Points[2].Position.Coordinates[1]).toBe(lat);
//	//	expect(testPatrol.Points[2].DisplayName).toBe('Point 3');
//	//	expect(testPatrol.Points[5].DisplayName).toBe('Point 6');
//	//	testPatrol = new PatrolTemplate(inputPatrol);
//	//});
//	//it('should remove patrol point and update ordinals and display names', () => {
//	//	// Arrange
//	//	let pbService: PatrolBuilderService = TestBed.get(PatrolBuilderService);
//	//	// Act
//	//	let length = testPatrol.Points.length;
//	//	pbService.removePatrolPoint(testPatrol, testPatrol.Points[2]);
//	//	// Assert
//	//	expect(testPatrol.Points.length).toBe(length - 1);
//	//	expect(testPatrol.Points[2].DisplayName).toBe('Checkpoint 1');
//	//	expect(testPatrol.Points[2].Ordinal).toBe(3);
//	//	expect(testPatrol.Points[3].DisplayName).toBe('Point 4');
//	//	testPatrol = new PatrolTemplate(inputPatrol);
//	//});
//});
//let inputPatrol = {
//	Points: [
//		{
//			Actions: [],
//			PointId: '37be6939-2f91-4517-b8a3-2814b7721df1',
//			DisplayName: 'Point 1',
//			Ordinal: 1,
//			Description: null,
//			Position: {
//				coordinates: [
//					-105.07325693964958,
//					39.65030054941254
//				],
//				type: 'Point'
//			}
//		},
//		{
//			Actions: [],
//			PointId: 'e6910174-6197-435f-976c-e13a876229e0',
//			DisplayName: 'Point 2',
//			Ordinal: 2,
//			Description: null,
//			Position: {
//				coordinates: [
//					-105.0732106715441,
//					39.65031448934783
//				],
//				type: 'Point'
//			}
//		},
//		{
//			PointId: 'a5aa5fdc-3bc0-4548-95f8-1860b5485472',
//			DisplayName: 'Checkpoint 1',
//			Ordinal: 3,
//			Description: "",
//			Actions: [
//				{
//					ActionId: 'a7abe08f-97fa-4f63-b9e4-2b78dd230d29',
//					Command: 26,
//					Parameters: [
//						{
//							Name: 5,
//							Value: '3',
//							Type: 0
//						}
//					]
//				},
//				{
//					ActionId: '7c9f51fc-251e-4e34-9e98-9d059b0861be',
//					Command: 3,
//					Parameters: []
//				},
//				{
//					ActionId: '0db43174-a8db-4d32-8729-4f110109a68d',
//					Command: 2,
//					Parameters: []
//				},
//				{
//					ActionId: '78a97970-1def-4017-8046-fd4e6da3cc94',
//					Command: 20,
//					Parameters: [
//						{
//							Name: 2,
//							Value: '90',
//							Type: 1
//						}
//					]
//				}
//			],
//			Position: {
//				coordinates: [
//					-105.0732022896409,
//					39.65029435388487
//				],
//				type: 'Point'
//			}
//		},
//		{
//			PointId: '758f77e8-54b9-4da7-9485-d2c2c3ad09ff',
//			DisplayName: 'Checkpoint 2',
//			Ordinal: 4,
//			Description: '',
//			Actions: [
//				{
//					ActionId: '243B3F68-2E1D-4873-A39F-E99DAFFE8ADA',
//					Command: 26,
//					Parameters: [
//						{
//							Name: 5,
//							Value: '3',
//							Type: 0
//						}
//					]
//				},
//				{
//					ActionId: 'A4ED1E25-EE85-4FD3-81EA-E47B0942CA92',
//					Command: 3,
//					Parameters: []
//				},
//				{
//					ActionId: '47952DA4-1DF2-4F17-A065-A6F975B43069',
//					Command: 2,
//					Parameters: []
//				},
//				{
//					ActionId: '885D0D41-58E3-43F4-9C98-DE02DBC6B265',
//					Command: 20,
//					Parameters: [
//						{
//							Name: 2,
//							Value: '90',
//							Type: 1
//						}
//					]
//				}
//			],
//			Position: {
//				coordinates: [
//					-105.07321368902923,
//					39.65028196282784
//				],
//				type: 'Point'
//			}
//		},
//		{
//			Actions: [],
//			PointId: '766aa45e-356b-45c3-ba37-9e508b80e280',
//			DisplayName: 'Point 5',
//			Ordinal: 5,
//			Description: '',
//			Position: {
//				coordinates: [
//					-105.07325258105996,
//					39.65028222097489
//				],
//				type: 'Point'
//			}
//		}
//	],
//	LastPatrolStatus: 7,
//	IsPatrolSubmitted: false,
//	PlatformSubmittedId: '',
//	TemplateId: '018f0b9c-5e26-4bcb-a388-28447da91f29',
//	DisplayName: 'Test Patrol',
//	Description: 'This is a test patrol',
//	Type: 0,
//	IsTemplate: true,
//	IsDeleted: false,
//	AreaType: 2,
//	TenantId: 'f6f59624-018f-4a9c-89b2-96213966e4ec',
//	LocationId: '37e4434b-0d2c-47d0-8bef-033ea5bd28a2',
//	Version: 0,
//	id: '018f0b9c-5e26-4bcb-a388-28447da91f29'
//};
//let testPatrol = new PatrolTemplate(inputPatrol);
//# sourceMappingURL=patrol-builder.service.spec.js.map