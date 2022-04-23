import { Component, ChangeDetectorRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { slideRight } from '../shared/animations';
import { AboutDialog } from '../shared/about/about-dialog.component';
import { MapService } from '../map/map.service';
import { NavigationService } from '../shared/navigation.service';
import { HttpService } from '../shared/http.service';
import { UserService } from '../shared/user.service';
import { PlatformService } from '../platforms/platform.service';

import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

export class MainMenuItemDef {
    public Id: string;
    public Text: string;
    public ImageSrc: string;
    public RouterLink: string;
   
    constructor(id: string, text: string, imageSrc: string, routerLink: string) {
        this.Id = id;
        this.Text = text;
        this.ImageSrc = imageSrc;
        this.RouterLink = routerLink;
    }
}

@Component({
    selector: 'main-menu',
    templateUrl: 'main-menu.component.html',
    styleUrls: ['main-menu.component.css'],
    animations: [
        slideRight
    ]
})

export class MainMenu implements OnInit, OnDestroy {
    private ScAdmin: boolean;
    public ThumbnailSrc: string = '../../Content/Images/avatar-icon.png';
    public MenuItems: MainMenuItemDef[] = [];
    private helpWindow: Window;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private menuItem_robotMonitor: MainMenuItemDef 

    constructor(public NavigationService: NavigationService, private MapService: MapService,
        private HttpService: HttpService, public UserService: UserService, private platformService: PlatformService, private ref: ChangeDetectorRef) {
		if (UserService.currentUser.roles && UserService.currentUser.roles.indexOf('SCAdmin') > -1) {
            this.ScAdmin = true;
		}

        this.HttpService.post('/account/GetUserThumbnail', null, null, true).then(res => {
            if (res.image) {
                this.ThumbnailSrc = res.image;
            }
		});

		this.MenuItems.push(new MainMenuItemDef('Dashboard', 'Dashboard', '/Content/Images/Menu/dashboard-icon.png', '/Dashboard'));
        this.MenuItems.push(new MainMenuItemDef('Map View', 'Map View', '/Content/Images/Menu/map-view-icon.png', '/MapView'));
    }

    animationDone($event: any): void {
        if (!this.NavigationService.RouteChanging) {
            this.MapService.refreshMap();
            this.NavigationService.onMainMenuToggled.next();
        }
    }

    public ngOnInit(): void {
        this.platformService.onPlatformsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => {
                    //Nav to the first platform in the list
                    if (this.platformService.platforms.length > 0) {
                        this.menuItem_robotMonitor = new MainMenuItemDef('Robot Monitor', 'Robot Monitor', '/Content/Images/Menu/robot-monitor-icon.png', '/RobotMonitor/' + this.platformService.platforms.sort(this.platformService.sortbyDisplayNameAscFunc)[0].id);
                        let existingItem = this.MenuItems.find((item) => {
                            return item.Id === 'Robot Monitor';
                        });

                        if (existingItem) {
                            existingItem = this.menuItem_robotMonitor;
                        } else {
                            this.MenuItems.push(this.menuItem_robotMonitor);
                        }
                    }
                }
            });

        this.platformService.platformSelected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platformId) => {
                    if (platformId) {
                        this.menuItem_robotMonitor.RouterLink = '/RobotMonitor/' + platformId;
                    } else {
                        this.menuItem_robotMonitor.RouterLink = '/RobotMonitor/' + this.platformService.platforms.sort(this.platformService.sortbyDisplayNameAscFunc)[0].id;
                    }
                }
            });
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public openAboutDialog(): void {
        this.NavigationService.openAboutDialog();
    }

    public openHelpWindow(): void {
        this.helpWindow = window.open('/Help','_blank');
    }
}