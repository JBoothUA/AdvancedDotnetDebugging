var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { OrientRobotMap } from './orient-robot-map.component';
var OrientRobot = /** @class */ (function () {
    function OrientRobot(changeRef) {
        this.changeRef = changeRef;
        this.onOrientationChange = new EventEmitter();
        this.large = false;
        this.valuePrompt = '';
        this.orientationValue = '0';
        this.initialMapZoom = 21;
        this.dragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.ocId = "orientationChooser-" + this.createGUID();
    }
    OrientRobot.prototype.ngOnInit = function () {
        if (!this.dataItems) {
            return;
        }
        if (this.dataItems instanceof Array) {
            this.orientItems = this.dataItems;
        }
        else {
            this.orientItems = [];
            this.orientItems.push(this.dataItems);
        }
    };
    OrientRobot.prototype.setUpEvents = function () {
        var _this = this;
        this.ocElem = $('#' + this.ocId);
        if (this.ocElem.length > 0) {
            this.ocElem.find('img').on('dragstart', false);
            this.ocElem.mousedown(function (event) { _this.onChooserMouseDown(event); });
            $(document).mouseup(function (event) { _this.onBodyMouseUp(event); });
            $(document).mousemove(function (event) { _this.onBodyMouseMove(event); });
        }
    };
    OrientRobot.prototype.ngAfterViewInit = function () {
        this.setUpEvents();
    };
    OrientRobot.prototype.ngOnChanges = function (changes) {
        var _this = this;
        setTimeout(function () {
            _this.setUpEvents();
        });
        if (changes.orientationValue) {
            if (this.robotMap) {
                this.robotMap.setOrientationValue(this.orientationValue);
            }
        }
        if (changes.dataItems) {
            if (this.dataItems instanceof Array) {
                this.orientItems = this.dataItems;
            }
            else {
                this.orientItems = [];
                this.orientItems.push(this.dataItems);
            }
            if (this.robotMap) {
                this.robotMap.updateDataItems(this.orientItems);
            }
        }
    };
    OrientRobot.prototype.getOrientationStyleValue = function () {
        var value = '0';
        if (this.orientationValue && this.orientationValue !== '') {
            value = this.orientationValue;
        }
        var retValue = { 'transform': 'rotate(' + value + 'deg)' };
        return (retValue);
    };
    OrientRobot.prototype.setOrientationValue = function (event) {
        this.orientationValue = event.target.value;
        this.changeRef.detectChanges();
        this.onOrientationChange.emit(this.orientationValue);
        if (this.robotMap) {
            this.robotMap.setOrientationValue(this.orientationValue);
        }
    };
    OrientRobot.prototype.onChooserMouseDown = function (event) {
        event.stopPropagation();
        this.dragging = true;
    };
    OrientRobot.prototype.onBodyMouseMove = function (event) {
        if (this.dragging) {
            var elem = $('#' + this.ocId);
            if (elem.length > 0) {
                this.offsetX = elem.offset().left;
                this.offsetY = elem.offset().top;
                var deg = this.calculateAngle(event.clientX, event.clientY, this.offsetX, this.offsetY);
                this.orientationValue = deg.toString();
                if (this.robotMap) {
                    this.robotMap.setOrientationValue(this.orientationValue);
                }
                this.changeRef.detectChanges();
            }
        }
    };
    OrientRobot.prototype.onBodyMouseUp = function (event) {
        this.dragging = false;
        this.onOrientationChange.emit(this.orientationValue);
    };
    OrientRobot.prototype.refreshMap = function () {
        if (this.robotMap.map) {
            this.robotMap.map.invalidateSize();
        }
        this.setUpEvents();
    };
    OrientRobot.prototype.calculateAngle = function (clientX, clientY, offsetX, offsetY) {
        var x1 = offsetX + 38;
        var y1 = offsetY + 38;
        var xp = x1 - clientX;
        var yp = y1 - clientY;
        var deg = (Math.atan2(yp, xp) * (180 / Math.PI));
        if (deg < 0) {
            deg = 360 + deg;
        }
        // Make it point north
        deg = deg - 90;
        if (deg < 0) {
            deg = 360 + deg;
        }
        deg = Math.round(deg);
        if (deg === 360) {
            deg = 0;
        }
        return (deg);
    };
    OrientRobot.prototype.createGUID = function () {
        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var cryptoObj = window.crypto;
            var r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return (guid);
    };
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], OrientRobot.prototype, "onOrientationChange", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], OrientRobot.prototype, "large", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], OrientRobot.prototype, "valuePrompt", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], OrientRobot.prototype, "orientationValue", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], OrientRobot.prototype, "initialMapZoom", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], OrientRobot.prototype, "dataItems", void 0);
    __decorate([
        ViewChild(OrientRobotMap),
        __metadata("design:type", OrientRobotMap)
    ], OrientRobot.prototype, "robotMap", void 0);
    OrientRobot = __decorate([
        Component({
            selector: 'orient-robot',
            templateUrl: 'orient-robot.component.html',
            styleUrls: ['orient-robot.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [ChangeDetectorRef])
    ], OrientRobot);
    return OrientRobot;
}());
export { OrientRobot };
//# sourceMappingURL=orient-robot.component.js.map