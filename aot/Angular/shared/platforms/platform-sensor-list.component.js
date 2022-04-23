var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Platform } from '../../platforms/platform.class';
import { PlatformService } from '../../platforms/platform.service';
import { SensorType } from '../shared-interfaces';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var PlatformSensorList = /** @class */ (function () {
    function PlatformSensorList(platformService, ref) {
        this.platformService = platformService;
        this.ref = ref;
        this.display = 8;
        this.SensorType = SensorType;
        this.ngUnsubscribe = new Subject();
    }
    PlatformSensorList.prototype.ngOnInit = function () {
        var _this = this;
        this.platformService.onNewPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({ next: function (platform) {
                if (platform.id === _this.platform.id) {
                    _this.platform = platform;
                    _this.ref.markForCheck();
                }
            }
        });
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                if (platform.id === _this.platform.id) {
                    _this.platform = platform;
                    _this.ref.detectChanges();
                }
            }
        });
    };
    PlatformSensorList.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PlatformSensorList.prototype.getSensorImg = function (sensor) {
        if (sensor.Values[0].ImageValue) {
            return "data:image/png;base64," + sensor.Values[0].ImageValue;
        }
        return null;
    };
    PlatformSensorList.prototype.getSensors = function (sensors) {
        return this.platform.Sensors.slice(0, this.display);
    };
    PlatformSensorList.prototype.getSensorValue = function (dataValue) {
        if (dataValue) {
            if (dataValue.BooleanValue)
                return dataValue.BooleanValue;
            else if (dataValue.DoubleValue)
                return Math.round(dataValue.DoubleValue);
            else if (dataValue.IntValue)
                return dataValue.IntValue;
            else if (dataValue.StringValue)
                return dataValue.StringValue;
            else
                return undefined;
        }
        else {
            return undefined;
        }
    };
    PlatformSensorList.prototype.getSensorIcon = function (sensorType) {
        switch (sensorType) {
            case SensorType.Gas:
                return '../../Content/Images/Platforms/gas-icon.png';
            case SensorType.Humidity:
                return '../../Content/Images/Platforms/humidity-icon.png';
            case SensorType.Temperature:
                return '../../Content/Images/Platforms/temperature-icon.png';
            case SensorType.PIR:
            case SensorType.Sound:
            case SensorType.Smoke:
            case SensorType.Unknown:
            default:
                return '../../Content/Images/Platforms/temperature-icon.png';
        }
    };
    PlatformSensorList.prototype.getSensorUom = function (sensorType) {
        switch (sensorType) {
            case SensorType.Gas:
                return '';
            case SensorType.Humidity:
                return '<span class="property-uom">%</span>';
            case SensorType.Temperature:
                return '<span class="property-uom">&#176;F</span>';
            case SensorType.PIR:
            case SensorType.Sound:
            case SensorType.Smoke:
            case SensorType.Unknown:
            default:
                return '';
        }
    };
    PlatformSensorList.prototype.isSimpleSensor = function (sensorType) {
        switch (sensorType) {
            case SensorType.Gas:
            case SensorType.Temperature:
            case SensorType.Humidity:
                return true;
            case SensorType.FLIR:
            default:
                return false;
        }
    };
    PlatformSensorList.prototype.isAllSensorsWaiting = function () {
        for (var _i = 0, _a = this.platform.Sensors; _i < _a.length; _i++) {
            var sensor = _a[_i];
            if (this.platform.hasSensorData(sensor))
                return false;
        }
        return true;
    };
    __decorate([
        Input(),
        __metadata("design:type", Platform)
    ], PlatformSensorList.prototype, "platform", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PlatformSensorList.prototype, "display", void 0);
    PlatformSensorList = __decorate([
        Component({
            selector: 'platform-sensor-list',
            templateUrl: 'platform-sensor-list.component.html',
            styleUrls: ['platform-sensor-list.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PlatformService, ChangeDetectorRef])
    ], PlatformSensorList);
    return PlatformSensorList;
}());
export { PlatformSensorList };
//# sourceMappingURL=platform-sensor-list.component.js.map