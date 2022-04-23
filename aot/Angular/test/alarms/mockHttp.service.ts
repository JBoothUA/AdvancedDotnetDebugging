import { Alarm } from '../../alarms/alarm.class';
import { MockHttpService } from '../mockHttp.service';
import { Injectable } from '@angular/core';
import { Response, Http } from '@angular/http';
import * as moment from 'moment';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class MockHttpServiceAlarms extends MockHttpService {
	apiHeaders: any = {};

	constructor(protected http: Http) {
		super(http);
	}

	get(url: string, headers?: any): Promise<any> {
		return Promise.resolve({ Result: activeAlarms });
	}

	put(url: string, data: any, headers?: any): Promise<any> {
		return Promise.resolve({ Result: [] });
	}

	post(url: string, data: any, headers?: any): Promise<any> {
		return Promise.resolve({ Result: [] });
	}

	delete(url: string, headers?: any): Promise<any> {
		return Promise.resolve({ Result: [] });
	}

	extractData(res: Response): any {
		return { Result: [] };
	}

	handleError(error: Response | any): any {
		return {};
	}
}

let testAlarm = new Alarm({
	LastUpdateTime: '2017-02-23T01:14:20.5784896',
	State: 1,
	Type: { 'Category': 'Battery', 'Condition': 'Dead' },
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
	TenantId: '777bdc88-dc28-4908-a4d2-d766131c5777',
	Id: '007'
});
let activeAlarms = [testAlarm];
(<any>window).currentUser = { Bearer: 'jibberish', tenant: '{ "TenantId": "8bfef93b-0d2c-47d0-8bef-033ea5bd57e2", "CustomerName": "Securitas", "Locations": [], "ParentId": "" }' };
(<any>window).activeAlarms = activeAlarms;