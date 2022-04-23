/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import { TestBed, inject } from '@angular/core/testing';
import { AlarmService } from './alarm.service';
import { HttpModule } from '@angular/http';
import { HttpService } from '../shared/http.service';
import { MockHttpServiceAlarms } from '../test/alarms/mockHttp.service';
import { UserService } from '../shared/user.service';
import { MockUserService } from '../test/mockUser.service';
import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { AppSettings } from '../shared/app-settings';
import { ApplicationInsightsService } from '../application-insights.service';
import { HubService } from '../shared/hub.service';
import { MockHubService } from '../test/mockHub.service';
import * as moment from 'moment';

describe('Alarm Service', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpModule],
			providers: [
                { provide: HubService, useClass: MockHubService }, AlarmService, LocationFilterPipe, HttpService, { provide: UserService, useClass: MockUserService },
				AppSettings, ApplicationInsightsService
			]
		});
	});
	
	it('should return a list of alarms', () => {
		let alarmService: AlarmService = TestBed.get(AlarmService);
		alarmService.loadAlarms().then(function () {
			expect(alarmService.alarms[0].Description).toEqual('Look at that Dog.');
		});
	});

	it('should correctly convert the date time display', () => {
		let alarmService: AlarmService = TestBed.get(AlarmService);
		let convertedDate = alarmService.convertDateDisplay('Tue Jan 07 1983 08:55:34');
		expect(convertedDate).toEqual('1/7/83 - 8:55:34am');
	});

	it('should correctly convert the date display', () => {
		let alarmService: AlarmService = TestBed.get(AlarmService);
		let convertedDate = alarmService.convertDateDisplay('Tue Jan 07 1983 08:55:34', true);
		expect(convertedDate).toEqual('1/7/83');
	});

	it('should correctly convert the date display for today', () => {
		let alarmService: AlarmService = TestBed.get(AlarmService);
		let testDate = new Date().toString();
		let convertedDate = alarmService.convertDateDisplay(testDate);
		expect(convertedDate).toEqual('Today - ' + moment(testDate).format('h:mm:ssa'));
	});

	it('should correctly convert the date display for yesterday', () => {
		let alarmService: AlarmService = TestBed.get(AlarmService);
		var yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		let convertedDate = alarmService.convertDateDisplay(yesterday.toString());
		expect(convertedDate).toEqual('Yesterday - ' + moment(yesterday).format('h:mm:ssa'));
	});

	it('should correctly convert the users name to initials', () => {
		let alarmService: AlarmService = TestBed.get(AlarmService);
		let userId = 'Jesse Booth';
		let initials = alarmService.convertUsernameToInitials(userId);
		expect(initials).toEqual('JB');
	});
});