///* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
//import { async, ComponentFixture, TestBed } from '@angular/core/testing';
//import { FormsModule } from '@angular/forms';
//import { Router } from '@angular/router';
//import { SharedModule } from '../shared/_shared.module';
//import { NavigationService } from '../shared/navigation.service';
//import { PatrolTemplate } from '../patrols/patrol.class';
//import { OrientRobot } from '../shared/orient-robot.component';
////import 'rxjs/add/operator/takeUntil';
////import { Subject } from 'rxjs/Subject';
//let mockRouter = {
//	navigate: jasmine.createSpy('navigate')
//};
//jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
//describe('Orient Robot component', () => {
//	let fixture: ComponentFixture<OrientRobot>;
//	beforeEach(async(() => {
//		TestBed.configureTestingModule({
//			imports: [FormsModule, SharedModule],
//			providers: [{ provide: Router, useValue: mockRouter }, NavigationService],
//		});
//		TestBed.compileComponents();
//	}));
//	it('Should create my OrientRobot component', () => {
//		// Arrange
//		fixture = TestBed.createComponent(OrientRobot);
//		expect(fixture.componentInstance).toBeDefined();
//	});
//	it('Should initialize ui correctly', () => {
//		// Arrange
//		fixture = TestBed.createComponent(OrientRobot);
//		fixture.componentInstance.dataItems = testPatrol.Points[2];
//		fixture.componentInstance.orientationValue = '45';
//		fixture.componentInstance.initialMapZoom = 18;
//		fixture.componentInstance.valuePrompt = 'In degrees';
//		// Act
//		fixture.detectChanges();
//		// Assert
//		fixture.whenStable().then(() => {
//			expect(fixture.nativeElement.innerText).toContain('45');
//			expect(fixture.nativeElement.innerText).toContain('rotate(45deg)');
//		});
//	});
//	it('Should get style string for 45 deg', () => {
//		// Arrange
//		fixture = TestBed.createComponent(OrientRobot);
//		fixture.componentInstance.dataItems = testPatrol.Points[2];
//		fixture.componentInstance.orientationValue = '45';
//		fixture.componentInstance.initialMapZoom = 18;
//		fixture.componentInstance.valuePrompt = 'In degrees';
//		// Act
//		fixture.detectChanges();
//		// Assert
//		fixture.whenStable().then(() => {
//			expect(fixture.componentInstance.getOrientationStyleValue().transform).toBe("rotate(45deg)");
//		});
//	});
//	it('Should get style string for 122 deg', () => {
//		// Arrange
//		fixture = TestBed.createComponent(OrientRobot);
//		fixture.componentInstance.dataItems = testPatrol.Points[2];
//		fixture.componentInstance.orientationValue = '122';
//		fixture.componentInstance.initialMapZoom = 18;
//		fixture.componentInstance.valuePrompt = 'In degrees';
//		// Act
//		fixture.detectChanges();
//		// Assert
//		fixture.whenStable().then(() => {
//			expect(fixture.componentInstance.getOrientationStyleValue().transform).toBe("rotate(122deg)");
//		});
//	});
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
//# sourceMappingURL=orient-robot.component.spec.js.map