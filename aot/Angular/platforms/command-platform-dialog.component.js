var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PlatformService } from './platform.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { PlatformCommand, CommandName, Parameter, ParameterName, ParameterType, ParameterDefinition } from '../patrols/action.class';
import { Modal } from '../shared/modal.component';
import { SayPlayChooser } from '../shared/say-play-chooser.component';
import { Subject } from 'rxjs/Subject';
var CommandPlatformDialog = /** @class */ (function () {
    function CommandPlatformDialog(ref, platformService, platformMapService) {
        var _this = this;
        this.ref = ref;
        this.platformService = platformService;
        this.platformMapService = platformMapService;
        this.ngUnsubscribe = new Subject();
        this.CommandName = CommandName;
        this.parameterList = null;
        this.alarm = null;
        this.platformService.showPlatformCommandDialog
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (obj) { return _this.show(obj.commandDef, obj.platform, obj.parameterList, obj.alarm); }
        });
    }
    CommandPlatformDialog.prototype.show = function (commandDef, platform, parameterList, alarm) {
        this.commandDef = commandDef;
        this.platform = platform;
        this.parameterList = parameterList;
        this.alarm = alarm;
        this.commandName = commandDef.CommandName;
        this.selectedCommand = commandDef.CommandName;
        this.value = null;
        this.commandPlatformModal.show();
    };
    CommandPlatformDialog.prototype.onSliderChanged = function (event) {
        this.customItem = event.value;
        this.customValueChange(this.customItem);
    };
    CommandPlatformDialog.prototype.cancel = function () {
        this.platformMapService.removeGoToLocationIcon();
        this.hide();
    };
    CommandPlatformDialog.prototype.hide = function () {
        if (this.selectedCommand === CommandName.SayMessage ||
            this.selectedCommand === CommandName.Play) {
            this.platformSayPlay.setCustomValue(null);
        }
        this.customItem = '';
        this.commandPlatformModal.hide();
    };
    CommandPlatformDialog.prototype.selectItem = function (name) {
        this.commandName = CommandName[name];
        this.selectedCommand = CommandName[name];
        this.value = null;
    };
    CommandPlatformDialog.prototype.commandChange = function (commandName) {
        this.selectedCommand = commandName;
    };
    CommandPlatformDialog.prototype.customValueChange = function (data) {
        this.value = data;
    };
    CommandPlatformDialog.prototype.getParameters = function () {
        var commandParams = this.commandDef.Parameters && this.commandDef.Parameters.length ? this.commandDef.Parameters[0] : null;
        if (this.selectedCommand === CommandName.Volume) {
            commandParams = new ParameterDefinition();
            commandParams.Name = ParameterName.Percent;
            commandParams.Type = ParameterType.Int;
        }
        if (!commandParams)
            return null;
        var param = new Parameter({ Name: commandParams.Name, Value: this.value, Type: commandParams.Type });
        return new Array(param);
    };
    CommandPlatformDialog.prototype.commandChanged = function (commandName) {
        this.selectedCommand = commandName;
    };
    CommandPlatformDialog.prototype.valueChanged = function (value) {
        this.value = value;
    };
    CommandPlatformDialog.prototype.executeCommand = function (closeModal) {
        var platformCommand = new PlatformCommand(this.platform.id, this.selectedCommand, this.parameterList || this.getParameters());
        this.platformService.executePlatformCommand(platformCommand, this.platform.TenantId);
        if (this.selectedCommand === CommandName.SayMessage) {
            this.platformSayPlay.setCustomValue(null);
        }
        if (closeModal) {
            this.hide();
        }
    };
    CommandPlatformDialog.prototype.getParameterList = function (commandName) {
        var platform = this.platformService.getPlatform(this.platform.id);
        for (var _i = 0, _a = platform.Commands; _i < _a.length; _i++) {
            var command = _a[_i];
            if (command.CommandName === commandName) {
                if (command.Parameters) {
                    return command.Parameters[0];
                }
            }
        }
        return [];
    };
    CommandPlatformDialog.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    __decorate([
        ViewChild(Modal),
        __metadata("design:type", Modal)
    ], CommandPlatformDialog.prototype, "commandPlatformModal", void 0);
    __decorate([
        ViewChild('platformSayPlay'),
        __metadata("design:type", SayPlayChooser)
    ], CommandPlatformDialog.prototype, "platformSayPlay", void 0);
    CommandPlatformDialog = __decorate([
        Component({
            selector: 'command-platform-dialog',
            templateUrl: 'command-platform-dialog.component.html',
            styleUrls: ['command-platform-dialog.component.css']
        }),
        __metadata("design:paramtypes", [ChangeDetectorRef, PlatformService, PlatformMapService])
    ], CommandPlatformDialog);
    return CommandPlatformDialog;
}());
export { CommandPlatformDialog };
//# sourceMappingURL=command-platform-dialog.component.js.map