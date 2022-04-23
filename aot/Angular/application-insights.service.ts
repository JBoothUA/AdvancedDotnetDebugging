import { Injectable } from '@angular/core';
import { AppInsights } from 'applicationinsights-js';

@Injectable()
export class ApplicationInsightsService {
	private config: Microsoft.ApplicationInsights.IConfig = { instrumentationKey: 'dd498fb4-0c3c-40a0-a631-0fbb3d45b9a9' }; //TODO configure
	telemetrySource: string = 'SmartCommand.UI';

	constructor() {
		if (!AppInsights.config) {
			AppInsights.downloadAndSetup(this.config);
		}
	}

	startTrackEvent(event: string) {
		AppInsights.startTrackEvent(event);
	}

	stopTrackEvent(event: string, properties?: any) {
		if (!properties) {
			properties = {};
		}
		properties['source'] = this.telemetrySource;

		AppInsights.stopTrackEvent(event, properties);
	}

	trackError(error: Error, stackTrace?: string, properties?: any) {
		if (!properties) {
			properties = {};
		}
		properties['source'] = this.telemetrySource;

		AppInsights.trackException(error, stackTrace, properties);
	}

	trackPageView(url: string, properties?: any) {
		if (!properties) {
			properties = {};
		}
		properties['source'] = this.telemetrySource;

		AppInsights.trackPageView(url, url, properties);
	}
}