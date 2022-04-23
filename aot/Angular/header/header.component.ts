import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NavigationService } from '../shared/navigation.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AboutDialog } from '../shared/about/about-dialog.component';
import { AppSettings } from '../shared/app-settings';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

@Component({
    selector: 'app-header',
    templateUrl: 'header.component.html'
})
export class Header {
    public pageHeader: string;
    public displayHeader: boolean = true;
    private helpWindow: Window;

    constructor(private navigationService: NavigationService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private appSettings: AppSettings) {
    }

    ngOnInit() {
        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .map(() => this.activatedRoute)
            .map(route => {
                while (route.firstChild) route = route.firstChild;
                return route;
            })
            .filter(route => route.outlet === 'primary')
            .mergeMap(route => route.data)
            .subscribe((event) => {
				this.pageHeader = (event['title']);
				this.displayHeader = (event['displayHeader']);
                this.appSettings.fullScreenMode = (event['fullScreen']);
            });
    }

    openMainMenu(): void {
        this.navigationService.openMainMenu();
    }

    closeMainMenu(): void {
        this.navigationService.closeMainMenu();
    }

    openAboutDialog(): void {
        this.navigationService.openAboutDialog();
    }

    public openHelpWindow(): void {
        this.helpWindow = window.open('/Help/index.htm#Overview.htm', '_blank');
    }
}