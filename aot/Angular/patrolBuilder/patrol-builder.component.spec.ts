///* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
//import {
//	async,
//	ComponentFixture,
//	TestBed
//} from '@angular/core/testing';
//import { FormsModule } from '@angular/forms';
//import { LocationFilterService } from '../shared/location-filter.service';
//import { UserService } from '../shared/user.service';
//import { AlarmMapService } from '../map/alarms/alarmMap.service';
//import { SharedModule } from '../shared/_shared.module';
//import { HttpModule } from '@angular/http';
//import { HttpService } from '../shared/http.service';
//import { NavigationService } from '../shared/navigation.service';
//import { MockHttpService } from '../test/mockHttp.service';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { RouterTestingModule } from '@angular/router/testing';
//import { PatrolService } from '../patrols/patrol.service';
//import { LocationFilterPipe } from '../shared/location-filter.pipe';
//import { WindowService } from './../shared/window.service';
//import * as moment from 'moment';

//import { PatrolBuilder } from './patrol-builder.component';
//import { PatrolTemplate, PatrolType, AreaType } from './patrol.class';
//import { PointTemplate } from './point.class';
//import { ActionBase } from './action.class';
//import { PatrolMapService, PatrolMapInteractMode } from './../map/patrols/patrolMap.service';
//import { PatrolBuilderService } from "./patrol-builder.service";
//import { Tenant } from "../shared/tenant.class";
//import 'rxjs/add/operator/takeUntil';
//import { Subject } from 'rxjs/Subject';

//jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

//describe('Patrol Builder component', () => {
//	let fixture: ComponentFixture<PatrolBuilder>;

//	beforeEach(async(() => {
//		TestBed.configureTestingModule({
//			imports: [FormsModule, HttpModule, SharedModule, BrowserAnimationsModule, RouterTestingModule],
//			providers: [PatrolService, PatrolBuilderService, PatrolMapService, LocationFilterService, UserService,
//				AlarmMapService, NavigationService, { provide: HttpService, useClass: MockHttpService },
//				LocationFilterPipe, WindowService]
//		});
//		TestBed.compileComponents();
//	}));

//	it('should NOT detect changes and update for OnPush properties', () => {
//		// Arrange
//		fixture = TestBed.createComponent(PatrolBuilder);
//		//fixture.componentInstance.patrol = testPatrol;

//		// Act
//		fixture.detectChanges();
//		expect(fixture.nativeElement.innerText).toContain('Look at that Dog.');

//		// Assert
//		testAlarm.Description = 'Look at that Dog.111';
//		fixture.detectChanges();
//		expect(fixture.nativeElement.innerText).not.toContain('Look at that Dog.111');
//		expect(fixture.nativeElement.innerText).toContain('Look at that Dog.');
//	});

//	it('should format the date and time correctly', () => {
//		// Arrange
//		fixture = TestBed.createComponent(AlarmListItem);
//		fixture.componentInstance.alarm = testAlarm;

//		// Act
//		fixture.detectChanges();

//		// Assert
//		expect(fixture.nativeElement.innerText).toContain('2/23/17 - 1:14:20am');
//	});

//	it('should disable comment submit button until comment', () => {
//		// Arrange
//		fixture = TestBed.createComponent(AlarmListItem);
//		fixture.componentInstance.alarm = testAlarm;

//		// Act
//		fixture.detectChanges();
//		let submitBtn = fixture.nativeElement.querySelector('.lpAlarmCommentsInput_SubmitButton');

//		// Assert
//		expect(submitBtn.disabled).toEqual(true);
//	});

//	it('should show the mocked comment count', () => {
//		// Arrange
//		fixture = TestBed.createComponent(AlarmListItem);
//		fixture.componentInstance.alarm = testAlarm;

//		// Act
//		fixture.detectChanges();

//		// Assert
//		let commentSection = fixture.nativeElement.querySelector('.commentGroup .group-header_ItemCount');
//		expect(commentSection.innerText).toContain('1');
//	});

//	it('should show the mocked comment count after a comment is added', () => {
//		// Arrange
//		fixture = TestBed.createComponent(AlarmListItem);
//		fixture.componentInstance.alarm = testAlarm;
//		testAlarm.Comments.push({ UserId: '1', CommentText: 'test', Timestamp: '2017-02-23T01:14:20.5784896Z' });

//		// Act
//		fixture.detectChanges();

//		// Assert
//		let commentSection = fixture.nativeElement.querySelector('.commentGroup .group-header_ItemCount');
//		expect(commentSection.innerText).not.toContain('1');
//		expect(commentSection.innerText).toContain('2');
//	});

//	it('should render even if PropertyItems is null', () => {
//		// Arrange
//		testAlarm.PropertyItems = null;
//		fixture = TestBed.createComponent(AlarmListItem);
//		fixture.componentInstance.alarm = testAlarm;

//		// Act
//		fixture.detectChanges();
//		let submitBtn = fixture.nativeElement.querySelector('.lpAlarmCommentsInput_SubmitButton');

//		// Assert
//		expect(submitBtn.disabled).toEqual(true);
//	});

//	it('alarm time should not be in utc format', () => {
//		let clearedTime = moment(testAlarm.Created.Timestamp);
//		// New Alarm serializes input data. The created timestamp begins in utc time but should be serialized to local
//		expect(clearedTime.isUtc()).toEqual(false);
//	});
//});

