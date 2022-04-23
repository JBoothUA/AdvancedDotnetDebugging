
import { Injectable } from '@angular/core';
import { Response, Http } from '@angular/http';
import * as moment from 'moment';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class MockHttpService {
	apiHeaders: any = {};

	constructor(protected http: Http) {
	}

	get(url: string, headers?: any): Promise<any> {
		return Promise.resolve({ Result: [] });
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