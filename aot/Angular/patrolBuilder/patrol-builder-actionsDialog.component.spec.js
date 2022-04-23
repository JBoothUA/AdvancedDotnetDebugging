/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
//import {
//	async, ComponentFixture,
//	TestBed
//} from '@angular/core/testing';
//import { FormsModule } from '@angular/forms';
//import { LocationFilterService } from '../shared/location-filter.service';
//import { UserService } from '../shared/user.service';
//import { MockUserService } from '../test/mockUser.service';
//import { SharedModule } from '../shared/_shared.module';
//import { HttpModule } from '@angular/http';
//import { HttpService } from '../shared/http.service';
//import { NavigationService } from '../shared/navigation.service';
//import { MockHttpService } from '../test/mockHttp.service';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { RouterTestingModule } from '@angular/router/testing';
//import { LocationFilterPipe } from '../shared/location-filter.pipe';
//import { WindowService } from './../shared/window.service';
//import { AlarmService } from '../alarms/alarm.service';
//import { PlatformService } from '../platforms/platform.service';
//import { AlarmModule } from '../alarms/_alarm.module';
//import { AlarmMapService } from '../map/alarms/alarmMap.service';
//import { PlatformMapService } from '../map/platforms/platformMap.service';
//import { PatrolModule } from '../patrols/_patrol.module';
//import { PatrolService } from '../patrols/patrol.service';
//import { MockPBPatrolService } from './mockPBPatrol.service';
//import { PatrolBuilderModule } from './_patrol-builder.module';
//import { PatrolBuilderService } from "./patrol-builder.service";
//import { PatrolBuilderActionsDialog } from './patrol-builder-actionsDialog.component';
//import { PatrolTemplate } from '../patrols/patrol.class';
//import { PatrolMapService } from './../map/patrols/patrolMap.service';
//import { DragulaModule } from 'ng2-dragula';
//import { DragulaService } from 'ng2-dragula';
////import 'rxjs/add/operator/takeUntil';
////import { Subject } from 'rxjs/Subject';
//jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
//fdescribe('Patrol Builder Actions Dialog component', () => {
//	let fixture: ComponentFixture<PatrolBuilderActionsDialog>;
//	beforeEach(async(() => {
//		TestBed.configureTestingModule({
//			imports: [FormsModule, HttpModule, PatrolModule, SharedModule, PatrolBuilderModule,
//				BrowserAnimationsModule,RouterTestingModule, AlarmModule,DragulaModule],
//			providers: [
//				{ provide: PatrolService, useClass: MockPBPatrolService },
//				PatrolBuilderService, PatrolMapService, PlatformService, LocationFilterService,
//				{ provide: UserService, useClass: MockUserService },
//				AlarmService, PlatformMapService, AlarmMapService, NavigationService,
//				{ provide: HttpService, useClass: MockHttpService },
//				LocationFilterPipe, WindowService, DragulaService]
//		});
//		TestBed.compileComponents();
//	}));
//	it('Should create my PatrolBuilderActionsDialog component', () => {
//		// Arrange
//		fixture = TestBed.createComponent(PatrolBuilderActionsDialog);
//		expect(fixture.componentInstance).toBeDefined();
//	});
//	it('Should set custom values correctly', () => {
//		// Arrange
//		fixture = TestBed.createComponent(PatrolBuilderActionsDialog);
//		// Act
//		fixture.componentInstance.show(testPatrol, testPatrol.Points[0]);
//		// Assert
//		fixture.whenStable().then(() => {
//			expect(true);
//		});
//	});
//it('Should set preset values correctly', () => {
//	// Arrange
//	fixture = TestBed.createComponent(PatrolBuilderActionItem);
//	let action = testPatrol.Points[2].Actions[0];
//	let patrolService: PatrolService = TestBed.get(PatrolService);
//	let actionDef = patrolService.getActionDefinition(action);
//	action.Parameters[0].Value = actionDef.Parameters[0].Presets[0].StringValue;
//	fixture.componentInstance.action = action;
//	fixture.componentInstance.actionDef = actionDef;
//	// Act
//	fixture.componentInstance.ngOnInit();
//	// Assert
//	fixture.whenStable().then(() => {
//		expect(fixture.componentInstance.isCustomValue).toBe(false);
//		expect(fixture.componentInstance.isPresetValue).toBe(true);
//		expect(fixture.componentInstance.presetValue).toBe(action.Parameters[0].Value);
//	});
//});
//it('Should contain all info for first action', () => {
//	// Arrange
//	fixture = TestBed.createComponent(PatrolBuilderActionItem);
//	let action = testPatrol.Points[2].Actions[0];
//	let patrolService: PatrolService = TestBed.get(PatrolService);
//	let actionDef = patrolService.getActionDefinition(action);
//	fixture.componentInstance.action = action;
//	fixture.componentInstance.actionDef = actionDef;
//	fixture.componentInstance.index = 0;
//	// Act
//	fixture.detectChanges();
//	// Assert
//	fixture.whenStable().then(() => {
//		expect(fixture.nativeElement.innerText).toContain(actionDef.DisplayName);
//		expect(fixture.nativeElement.innerText).toContain('1st Action');
//	});
//});
//it('Should contain all info for second action', () => {
//	// Arrange
//	fixture = TestBed.createComponent(PatrolBuilderActionItem);
//	let action = testPatrol.Points[2].Actions[1];
//	let patrolService: PatrolService = TestBed.get(PatrolService);
//	let actionDef = patrolService.getActionDefinition(action);
//	fixture.componentInstance.action = action;
//	fixture.componentInstance.actionDef = actionDef;
//	fixture.componentInstance.index = 1;
//	// Act
//	fixture.detectChanges();
//	// Assert
//	fixture.whenStable().then(() => {
//		expect(fixture.nativeElement.innerText).toContain(actionDef.DisplayName);
//		expect(fixture.nativeElement.innerText).toContain('2nd Action');
//	});
//});
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
//				},
//				{
//					ActionId: '978F98F2-4DF6-41F7-A1E7-3B9D5E4D746A',
//					Command: 19,
//					Parameters: [
//						{
//							Name: 1,
//							Value: '50',
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
//# sourceMappingURL=patrol-builder-actionsDialog.component.spec.js.map