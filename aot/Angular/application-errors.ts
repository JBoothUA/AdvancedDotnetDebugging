import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { ApplicationInsightsService } from './application-insights.service';

@Injectable() 
export class ApplicationErrorHandler implements ErrorHandler {
	constructor(private injector: Injector) { }

	handleError(error: any) {
		console.error('SmartCommand Error!', error);

		const appInsights = this.injector.get(ApplicationInsightsService);
		if (!appInsights) {
			console.error('Could not log error to Application Insights');
		} else {
			appInsights.trackError(error, 'SmartCommand Error!');
		}
	}
}