var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
var CircleProgressbar = /** @class */ (function () {
    function CircleProgressbar(ref) {
        this.ref = ref;
        this.fillColor = '#249C49';
        this.image = null;
        this.size = 50;
        this.strokeWidth = 5;
        this.hideProgressBar = true;
        this.isDisabled = false;
        this.animation = null;
        this.completeness = 0.0;
    }
    Object.defineProperty(CircleProgressbar.prototype, "completenessPercentage", {
        set: function (data) {
            this.setcompleteness(data);
        },
        enumerable: true,
        configurable: true
    });
    CircleProgressbar.prototype.getDashOffset = function () {
        return this.dasharray - (this.completeness * this.dasharray);
    };
    CircleProgressbar.prototype.ngAfterViewInit = function () {
        //if (this.elementSVG)
        this.dasharray = this.getCircleLength((this.size - this.strokeWidth) / 2);
        //this.dasharray = this.elementSVG.nativeElement.getTotalLength();
    };
    CircleProgressbar.prototype.setcompleteness = function (newValue) {
        var _this = this;
        //Stop any animation that is running
        if (this.animation !== null) {
            clearInterval(this.animation);
            this.animation = null;
        }
        var range = Math.abs(this.completeness - newValue);
        var tempValue = this.completeness;
        this.animation = setInterval(function () {
            tempValue += (range / 60);
            _this.completeness = tempValue;
            if (tempValue >= newValue) {
                _this.completeness = newValue;
                clearInterval(_this.animation);
                _this.animation = null;
            }
            _this.ref.detectChanges();
        }, 16.665);
    };
    CircleProgressbar.prototype.getCircleLength = function (r) {
        return 2 * Math.PI * r;
    };
    CircleProgressbar.prototype.ngOnDestroy = function () {
        if (this.animation !== null) {
            clearInterval(this.animation);
            this.animation = null;
        }
    };
    __decorate([
        ViewChild('svgCircle'),
        __metadata("design:type", Object)
    ], CircleProgressbar.prototype, "elementSVG", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [Number])
    ], CircleProgressbar.prototype, "completenessPercentage", null);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], CircleProgressbar.prototype, "fillColor", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], CircleProgressbar.prototype, "image", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], CircleProgressbar.prototype, "size", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], CircleProgressbar.prototype, "strokeWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], CircleProgressbar.prototype, "hideProgressBar", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], CircleProgressbar.prototype, "isDisabled", void 0);
    CircleProgressbar = __decorate([
        Component({
            selector: 'circle-progressbar',
            templateUrl: 'circle-progressbar.component.html',
            styleUrls: ['circle-progressbar.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [ChangeDetectorRef])
    ], CircleProgressbar);
    return CircleProgressbar;
}());
export { CircleProgressbar };
//# sourceMappingURL=circle-progressbar.component.js.map