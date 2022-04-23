var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input } from '@angular/core';
import { SensorType } from './../shared/shared-interfaces';
var Slider = /** @class */ (function () {
    function Slider() {
        this.propertySliderOffset = 0;
    }
    Slider.prototype.ngOnInit = function () {
        for (var index = 0; index < this.sensors.length; index++) {
            var sensor = this.sensors[index];
            if (!this.getSensorValue(sensor.Values[0])) {
                // Remove all sensors with null values
                this.sensors.splice(index, 1);
                index--;
            }
            else if (sensor.Type === SensorType.FLIR) {
                // Add all FLIR sensor values (assuming only 2 values for now)
                if (sensor.Values.length === 2) {
                    var secondValue = $.extend(true, {}, sensor);
                    secondValue.Values.splice(0, 1);
                    index++;
                    this.sensors.splice(index, 0, secondValue);
                }
            }
        }
    };
    Slider.prototype.getDisplayName = function (sensor) {
        switch (sensor.Type) {
            case SensorType.FLIR:
                return sensor.DisplayName + ' ' + sensor.Values[0].DisplayName;
            default:
                return sensor.DisplayName;
        }
    };
    Slider.prototype.getPropertyTypeImage = function (sensor) {
        var prefix = '../../Content/Images/Alarms/alarm-properties-';
        var suffix = 'unknown';
        switch (sensor.Type) {
            case SensorType.Gas:
                suffix = 'gas';
            case SensorType.Humidity:
                suffix = 'humidity';
            case SensorType.Temperature:
                suffix = 'temperature';
            case SensorType.FLIR:
                if (sensor.Values[0].DisplayName === 'High') {
                    suffix = 'flir-high';
                }
                else if (sensor.Values[0].DisplayName === 'Low') {
                    suffix = 'flir-low';
                }
                suffix = 'flir';
            default:
                suffix = 'unknown';
        }
        return (prefix + suffix);
    };
    Slider.prototype.getPropertyTypeUnitOfMeasure = function (type) {
        switch (type) {
            case SensorType.Humidity:
                return '%';
            case SensorType.FLIR:
            case SensorType.Temperature:
                return '<span class="property-uom-small">&#176;F</span>'; // degree symbol
            default:
                return '';
        }
    };
    Slider.prototype.getSensorValue = function (dataValue) {
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
    };
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], Slider.prototype, "sensors", void 0);
    Slider = __decorate([
        Component({
            selector: 'slider',
            templateUrl: 'slider.component.html',
            styleUrls: ['slider.component.css'],
        })
    ], Slider);
    return Slider;
}());
export { Slider };
//# sourceMappingURL=slider.component.js.map