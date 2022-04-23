var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, Output, EventEmitter } from '@angular/core';
var DashboardSearchBox = /** @class */ (function () {
    function DashboardSearchBox() {
        this.update = new EventEmitter();
        this.searchFocus = false;
    }
    DashboardSearchBox.prototype.ngOnInit = function () {
        this.update.emit("");
    };
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], DashboardSearchBox.prototype, "update", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], DashboardSearchBox.prototype, "placeholder", void 0);
    DashboardSearchBox = __decorate([
        Component({
            selector: 'dashboard-searchbox',
            template: "<div class=\"inputBox\" [class.searchFocus]=\"searchFocus\">\n        <input #input id=\"inputSearchBox\" type=\"text\" (focus)=\"(searchFocus = true)\" (blur)=\"(searchFocus = false)\" (input)=\"update.emit(input.value)\" placeholder=\"{{placeholder}}\"/>\n        <div (click)=\"input.value = null;update.emit(input.value)\" *ngIf=\"input.value\" class=\"input-clear\"></div>\n    <div>",
            styleUrls: ['dashboard-searchbox.component.css', 'dashboard.component.css']
        })
    ], DashboardSearchBox);
    return DashboardSearchBox;
}());
export { DashboardSearchBox };
//# sourceMappingURL=dashboard-searchbox.component.js.map