var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectorRef } from '@angular/core';
import { PlatformService } from '../platforms/platform.service';
import { AdminService } from './admin.service';
var LinkMapToRobot = /** @class */ (function () {
    function LinkMapToRobot(platformService, changeRef, adminService) {
        this.platformService = platformService;
        this.changeRef = changeRef;
        this.adminService = adminService;
        this.layerName = null;
        this.dialogVisible = false;
        this.animatedOpaque = false;
        this.linkIcon = '../../Content/Images/Admin/link-icon-for-dialog.png';
        this.linkRobotsMessage = 'Choose Robot(s) to link with the Robot Map';
    }
    LinkMapToRobot.prototype.setPlatformInfo = function (locationId, platformImageInfo, layerName) {
        this.layerName = layerName;
        var allPlats = this.platformService.platforms;
        var platforms = [];
        this.selectedRobots = [];
        for (var _i = 0, allPlats_1 = allPlats; _i < allPlats_1.length; _i++) {
            var temp = allPlats_1[_i];
            if (temp.LocationId === locationId && temp.IsPatrolSubmitted === false) {
                platforms.push(temp);
            }
        }
        this.robots = [];
        for (var _a = 0, platforms_1 = platforms; _a < platforms_1.length; _a++) {
            var platform = platforms_1[_a];
            this.robots.push({ label: platform.DisplayName, value: platform });
        }
        this.platformImageInfo = platformImageInfo;
        this.changeRef.detectChanges();
    };
    LinkMapToRobot.prototype.linkMapToRobot = function () {
        var modifiedPlats = [];
        if (this.selectedRobots.length > 0) {
            for (var _i = 0, _a = this.selectedRobots; _i < _a.length; _i++) {
                var platform = _a[_i];
                if (platform.IsPatrolSubmitted === false) {
                    var name_1 = this.platformImageInfo.Image.Label;
                    var noExt = name_1.substr(0, name_1.lastIndexOf('.')) || name_1;
                    platform.Map.ExternalMapId = noExt;
                    platform.Map.Name = noExt;
                    platform.Map.MapRotation = this.platformImageInfo.Rotation;
                    platform.Map.MapOrigin = { coordinates: this.platformImageInfo.MapOrigin.Coordinates.slice(), type: this.platformImageInfo.MapOrigin.Type };
                    modifiedPlats.push(platform);
                }
            }
            if (modifiedPlats.length > 0) {
                this.adminService.savePlatforms(modifiedPlats);
            }
            this.hide();
        }
    };
    LinkMapToRobot.prototype.selectedRobotsChanged = function (event) {
    };
    LinkMapToRobot.prototype.show = function () {
        var _this = this;
        this.dialogVisible = true;
        setTimeout(function () {
            _this.animatedOpaque = true;
            _this.changeRef.detectChanges();
        });
    };
    LinkMapToRobot.prototype.hide = function () {
        var _this = this;
        this.animatedOpaque = false;
        setTimeout(function () { _this.dialogVisible = false; _this.changeRef.detectChanges(); }, 400);
    };
    LinkMapToRobot.prototype.ngOnDestroy = function () {
    };
    LinkMapToRobot = __decorate([
        Component({
            selector: 'link-map-to-robot',
            templateUrl: 'link-map-to-robot.component.html',
            styleUrls: ['link-map-to-robot.component.css'],
        }),
        __metadata("design:paramtypes", [PlatformService,
            ChangeDetectorRef,
            AdminService])
    ], LinkMapToRobot);
    return LinkMapToRobot;
}());
export { LinkMapToRobot };
//# sourceMappingURL=link-map-to-robot.component.js.map