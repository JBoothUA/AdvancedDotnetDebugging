var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectorRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
var SquareProgressbar = /** @class */ (function () {
    function SquareProgressbar(ref) {
        this.ref = ref;
        this.fillColor = '#249C49';
        this.image = '';
        this.strokeWidth = 3;
        this.size = 34;
        this.completeness = 0;
        this.animation = null;
        this.imageSize = 0;
    }
    Object.defineProperty(SquareProgressbar.prototype, "completenessPercentage", {
        set: function (data) {
            this.setcompleteness((data === 0) ? 0.000001 : data);
        },
        enumerable: true,
        configurable: true
    });
    SquareProgressbar.prototype.getDashOffset = function () {
        return this.dasharray - (this.completeness * this.dasharray);
    };
    SquareProgressbar.prototype.ngAfterViewInit = function () {
        this.dasharray = this.getRectLength(this.elementSVG.nativeElement.width.baseVal.value, this.elementSVG.nativeElement.height.baseVal.value);
    };
    SquareProgressbar.prototype.ngOnInit = function () {
        this.adjustedSize = Math.sqrt(Math.pow(this.size, 2) / 2);
        this.imageSize = Math.sqrt(2 * Math.pow((this.adjustedSize - (this.strokeWidth * 2)), 2));
    };
    SquareProgressbar.prototype.setcompleteness = function (newValue) {
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
            if (tempValue > newValue) {
                _this.completeness = newValue;
                clearInterval(_this.animation);
                _this.animation = null;
            }
            _this.ref.markForCheck();
        }, 16.665);
    };
    SquareProgressbar.prototype.getRectLength = function (width, height) {
        return (width * 2) + (height * 2);
    };
    SquareProgressbar.prototype.ngOnDestroy = function () {
        if (this.animation !== null) {
            clearInterval(this.animation);
            this.animation = null;
        }
    };
    __decorate([
        ViewChild('svgRect'),
        __metadata("design:type", Object)
    ], SquareProgressbar.prototype, "elementSVG", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [Number])
    ], SquareProgressbar.prototype, "completenessPercentage", null);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], SquareProgressbar.prototype, "fillColor", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], SquareProgressbar.prototype, "image", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], SquareProgressbar.prototype, "strokeWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], SquareProgressbar.prototype, "size", void 0);
    SquareProgressbar = __decorate([
        Component({
            selector: 'square-progressbar',
            templateUrl: 'square-progressbar.component.html',
            styleUrls: ['square-progressbar.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [ChangeDetectorRef])
    ], SquareProgressbar);
    return SquareProgressbar;
}());
export { SquareProgressbar };
//# sourceMappingURL=square-progressbar.component.js.map