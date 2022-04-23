var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { AlarmService } from '../alarms/alarm.service';
import { PlatformService } from '../platforms/platform.service';
import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { HttpService } from '../shared/http.service';
import { DashboardService } from './dashboard.service';
var DashboardPlatformService = /** @class */ (function () {
    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    function DashboardPlatformService(httpService, alarmService, dashboardService, platformService, locationFilterPipe) {
        var _this = this;
        this.httpService = httpService;
        this.alarmService = alarmService;
        this.dashboardService = dashboardService;
        this.platformService = platformService;
        this.locationFilterPipe = locationFilterPipe;
        this.platforms = []; //current platforms in the system
        this.updatePlatformlData = new Subject();
        this.onPlatformsLoaded = new Subject();
        this.ngUnsubscribe = new Subject();
        this.platformService.onPlatformsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.setPlatforms(); }
        });
        this.dashboardService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.locationChanged(); }
        });
        //this.setPlatforms(); //TSR*
    }
    DashboardPlatformService.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    ///////////////////////////////////////////
    //Notification Methods
    ///////////////////////////////////////////
    DashboardPlatformService.prototype.setPlatforms = function () {
        this.platforms = this.platformService.platforms;
        this.dashboardService.platformDataLoaded = true;
        this.onPlatformsLoaded.next();
    };
    DashboardPlatformService.prototype.locationChanged = function () {
        this.updatePlatformlData.next();
    };
    ///////////////////////////////////////////
    //Main Methods
    ///////////////////////////////////////////
    DashboardPlatformService.prototype.getPlatforms = function () {
        var filteredPlatforms = [];
        if (this.platforms) {
            //apply Location Filter
            var selectedLocations = this.dashboardService.getSelectedLocationIDs();
            filteredPlatforms = this.locationFilterPipe.transform(this.platforms, selectedLocations);
        }
        return filteredPlatforms;
    };
    DashboardPlatformService.prototype.getPlatform = function (platformID) {
        var platform = null;
        if (platformID) {
            platform = this.platforms.filter(function (p) { return p.id === platformID; })[0];
        }
        return platform;
    };
    DashboardPlatformService.prototype.getPlatformName = function (platformID) {
        var name = "";
        if (platformID) {
            var p = this.platforms.filter(function (p) { return p.id === platformID; });
            if (p && p[0])
                name = p[0].DisplayName;
        }
        return name;
    };
    DashboardPlatformService.prototype.getPlatformStatus = function (platformID) {
        var status = "";
        if (platformID) {
            var p = this.platforms.filter(function (p) { return p.id === platformID; });
            if (p) {
                if ((p[0]) && (p[0].State))
                    status = this.platformService.getPlatformStatusClass(p[0]);
            }
        }
        return status;
    };
    DashboardPlatformService.prototype.getPlatformStatusClass = function (platform) {
        return this.platformService.getPlatformStatusClass(platform);
    };
    DashboardPlatformService.prototype.getPlatformManufacturer = function (platformID) {
        var manufacturer = "";
        if (platformID) {
            var p = this.platforms.filter(function (p) { return p.id === platformID; });
            if (p && p[0])
                manufacturer = p[0].Manufacturer;
        }
        return manufacturer;
    };
    DashboardPlatformService.prototype.getPlatformStatusIcon = function (platformID) {
        var icon = '';
        if (platformID) {
            var platform = this.getPlatform(platformID);
            if (platform) {
                icon = this.platformService.getPlatformIconSrc(platform);
                //UX doesn't want to show pending icon twice - want to show healthy icon instead
                if (icon.includes('patrol-pending'))
                    icon = '/Content/Images/Platforms/' + platform.Manufacturer + '-healthy.png';
            }
        }
        return icon;
    };
    DashboardPlatformService.prototype.getPlatformStatusText = function (platformID) {
        var statusText = '';
        if (platformID) {
            var platform = this.getPlatform(platformID);
            if (platform) {
                statusText = this.platformService.getStateText(platform);
            }
        }
        //return "testing 123";
        return statusText;
    };
    DashboardPlatformService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [HttpService,
            AlarmService,
            DashboardService,
            PlatformService,
            LocationFilterPipe])
    ], DashboardPlatformService);
    return DashboardPlatformService;
}());
export { DashboardPlatformService };
//# sourceMappingURL=dashboard-platform.service.js.map