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
import { PlatformService } from './platform.service';
import { DataValue } from './../shared/shared-interfaces';
var CommandParameterPreset = /** @class */ (function () {
    function CommandParameterPreset(platformService) {
        this.platformService = platformService;
    }
    CommandParameterPreset.prototype.ngOnInit = function () { };
    CommandParameterPreset.prototype.getPresetValue = function () {
        return "";
    };
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], CommandParameterPreset.prototype, "parametername", void 0);
    __decorate([
        Input(),
        __metadata("design:type", DataValue)
    ], CommandParameterPreset.prototype, "preset", void 0);
    CommandParameterPreset = __decorate([
        Component({
            selector: 'command-parameter-preset',
            templateUrl: 'command-parameter-preset.component.html',
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PlatformService])
    ], CommandParameterPreset);
    return CommandParameterPreset;
}());
export { CommandParameterPreset };
//# sourceMappingURL=command-parameter-preset.component.js.map