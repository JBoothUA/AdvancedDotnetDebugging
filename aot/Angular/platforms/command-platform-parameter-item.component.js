var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Parameter } from './../patrols/action.class';
import { PlatformService } from './platform.service';
var CommandPlatformParameterItem = /** @class */ (function () {
    function CommandPlatformParameterItem(platformService) {
        this.platformService = platformService;
        this.onValueChange = new EventEmitter();
    }
    CommandPlatformParameterItem.prototype.ngOnInit = function () { };
    CommandPlatformParameterItem.prototype.customValueChange = function (data) {
        this.onValueChange.emit(this.item);
    };
    __decorate([
        Input(),
        __metadata("design:type", Parameter)
    ], CommandPlatformParameterItem.prototype, "parameter", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], CommandPlatformParameterItem.prototype, "onValueChange", void 0);
    CommandPlatformParameterItem = __decorate([
        Component({
            selector: 'command-platform-parameter-item',
            templateUrl: 'command-platform-parameter-item.component.html',
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PlatformService])
    ], CommandPlatformParameterItem);
    return CommandPlatformParameterItem;
}());
export { CommandPlatformParameterItem };
//# sourceMappingURL=command-platform-parameter-item.component.js.map