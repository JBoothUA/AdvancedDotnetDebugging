import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';

import { AlarmService } from '../alarms/alarm.service';
import { Alarm } from '../alarms/alarm.class';

import { Platform, PlatformMode, ErrorState } from '../platforms/platform.class';
import { PlatformService } from '../platforms/platform.service';

import { FilterTimeframe } from './dashboard';
import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { HttpService } from '../shared/http.service';
import { UserService } from '../shared/user.service';
import { DashboardService } from './dashboard.service';

@Injectable()
export class DashboardPlatformService {
    platforms: Platform[] = []; //current platforms in the system

    updatePlatformlData: Subject<any> = new Subject();
    onPlatformsLoaded: Subject<any> = new Subject();
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    constructor(protected httpService: HttpService,
        private alarmService: AlarmService,
        private dashboardService: DashboardService,
        private platformService: PlatformService,
        private locationFilterPipe: LocationFilterPipe) {

        this.platformService.onPlatformsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.setPlatforms()
            });

        this.dashboardService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.locationChanged()
            });

        //this.setPlatforms(); //TSR*
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    ///////////////////////////////////////////
    //Notification Methods
    ///////////////////////////////////////////
    setPlatforms(): void {
        this.platforms = this.platformService.platforms;
        this.dashboardService.platformDataLoaded = true;
        this.onPlatformsLoaded.next();
    }

    locationChanged(): void {
        this.updatePlatformlData.next();
    }

    ///////////////////////////////////////////
    //Main Methods
    ///////////////////////////////////////////
    getPlatforms(): Platform[] {
        let filteredPlatforms: Platform[] = [];

        if (this.platforms) {
            //apply Location Filter
            let selectedLocations = this.dashboardService.getSelectedLocationIDs();
            filteredPlatforms = this.locationFilterPipe.transform(this.platforms, selectedLocations);
        }
        return filteredPlatforms;
    }

    getPlatform(platformID: string): Platform {
        let platform: Platform = null;
        if (platformID) {
            platform = this.platforms.filter(p => p.id === platformID)[0];
        }
        return platform;
    }

    getPlatformName(platformID: string): string {
        let name: string = "";
        if (platformID) {
            let p = this.platforms.filter(p => p.id === platformID);
            if (p && p[0])
                name = p[0].DisplayName;
        }
        return name;
    }

    getPlatformStatus(platformID: string): string {
        let status: string = "";
        if (platformID) {
            let p = this.platforms.filter(p => p.id === platformID);
            if (p) {
                if ((p[0]) && (p[0].State))
                    status = this.platformService.getPlatformStatusClass(p[0]);
            }
        }
        return status;
    }

    public getPlatformStatusClass(platform: Platform): string {
        return this.platformService.getPlatformStatusClass(platform);
    }

    getPlatformManufacturer(platformID: string): string {
        let manufacturer: string = "";
        if (platformID) {
            let p = this.platforms.filter(p => p.id === platformID);
            if (p && p[0])
                manufacturer = p[0].Manufacturer;
        }
        return manufacturer;
    }

    public getPlatformStatusIcon(platformID: string): string {
        let icon: string = '';

        if (platformID) {
            let platform: Platform = this.getPlatform(platformID);
            if (platform) {
                icon = this.platformService.getPlatformIconSrc(platform);
                //UX doesn't want to show pending icon twice - want to show healthy icon instead
                if (icon.includes('patrol-pending'))
                    icon = '/Content/Images/Platforms/' + platform.Manufacturer + '-healthy.png';
            }
        }
        return icon;
    }

    public getPlatformStatusText(platformID: string): string {
        let statusText: string = '';

        if (platformID) {
            let platform: Platform = this.getPlatform(platformID);
            if (platform) {
                statusText = this.platformService.getStateText(platform);
            }
        }
        //return "testing 123";
        return statusText;
	}

}