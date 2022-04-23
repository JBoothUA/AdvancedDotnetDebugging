import { Component, NgZone, HostListener } from '@angular/core';
import { Router, Event as RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

import { PatrolService } from './patrols/patrol.service';
import { AlarmService } from './alarms/alarm.service';
import { PlatformService } from './platforms/platform.service';
import { UserService } from './shared/user.service';
import { NavigationService } from './shared/navigation.service';
import { WindowService } from './shared/window.service';
import { DragulaService } from 'ng2-dragula';
import { AppSettings } from './shared/app-settings';
import { HubService } from './shared/hub.service';
import { ApplicationInsightsService } from './application-insights.service';

@Component({
	selector: 'smart-command',
	templateUrl: 'app.component.html'
})
export class SmartCommand {
	loading: boolean = true;

	constructor(private router: Router, private patrolService: PatrolService, private ngZone: NgZone, private navigationService: NavigationService,
                private hubService: HubService, private alarmService: AlarmService, private userService: UserService, private platformService: PlatformService,
                private windowService: WindowService, public appSettings: AppSettings, private appInsights: ApplicationInsightsService) {
        this.appSettings.showNotificationPanel = false;
        this.appSettings.showNotificationPopup = false;

		router.events.subscribe((event: RouterEvent) => {
			this._navigationInterceptor(event);
		});

		window['Application'] = {
			zone: ngZone,
            appSettings: this.appSettings
		};
	}

	// Shows and hides the loading spinner during RouterEvent changes
	private _navigationInterceptor(event: RouterEvent): void {
		if (event instanceof NavigationStart) {
			this.loading = true;
			this.navigationService.RouteChanging = true;

			this.appInsights.trackPageView(event.url);
		}

		if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
			this.hideLoading();
		}
	}

	private hideLoading(): void {
		this.loading = false;
		this.navigationService.RouteChanging = false;
	}

	//Close any open windows
	@HostListener('window:beforeunload', ['$event'])
	killAllWindows($event: any) {
		this.windowService.killAllWindows();
	}
}