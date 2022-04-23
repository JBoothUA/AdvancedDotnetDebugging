var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
var BatteryLife = /** @class */ (function () {
    function BatteryLife() {
        this.showPercentage = true;
    }
    BatteryLife.prototype.getPlatformBatteryIconSrc = function () {
        if (this.batteryPercentage) {
            if (this.batteryPercentage > 90) {
                return '/Content/Images/Platforms/battery-icons-100.png';
            }
            else if (this.batteryPercentage > 80) {
                return '/Content/Images/Platforms/battery-icons-90.png';
            }
            else if (this.batteryPercentage > 70) {
                return '/Content/Images/Platforms/battery-icons-80.png';
            }
            else if (this.batteryPercentage > 60) {
                return '/Content/Images/Platforms/battery-icons-70.png';
            }
            else if (this.batteryPercentage > 50) {
                return '/Content/Images/Platforms/battery-icons-60.png';
            }
            else if (this.batteryPercentage > 40) {
                return '/Content/Images/Platforms/battery-icons-50.png';
            }
            else if (this.batteryPercentage > 30) {
                return '/Content/Images/Platforms/battery-icons-40.png';
            }
            else if (this.batteryPercentage > 20) {
                return '/Content/Images/Platforms/battery-icons-30.png';
            }
            else if (this.batteryPercentage > 10) {
                return '/Content/Images/Platforms/battery-icons-20.png';
            }
            else if (this.batteryPercentage > 5) {
                return '/Content/Images/Platforms/battery-icons-10.png';
            }
            else {
                return '/Content/Images/Platforms/battery-icons-5.png';
            }
        }
        return '/Content/Images/Platforms/battery-icons-5.png';
    };
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], BatteryLife.prototype, "batteryPercentage", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], BatteryLife.prototype, "showPercentage", void 0);
    BatteryLife = __decorate([
        Component({
            selector: 'battery-life',
            template: "<img style=\"float:left\" class=\"lpPlatformAddInfo_BatteryIcon\" src=\"{{getPlatformBatteryIconSrc()}}\" /> \n                 <span *ngIf=\"showPercentage\" style=\"float:left;margin-top:-5px;\">{{batteryPercentage}}%</span>\n                ",
            styles: [':host{float:left;width:66px;}'],
            changeDetection: ChangeDetectionStrategy.OnPush
        })
    ], BatteryLife);
    return BatteryLife;
}());
export { BatteryLife };
//# sourceMappingURL=battery-life.component.js.map