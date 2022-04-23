var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { WindowSize } from './robot-monitor.component';
import { slideDown } from './../shared/animations';
import { Platform } from './platform.class';
import { CommandName } from './../patrols/action.class';
import { PlatformService } from './platform.service';
var RobotMonitorController = /** @class */ (function () {
    function RobotMonitorController(platformService, ref) {
        this.platformService = platformService;
        this.ref = ref;
        this.onHideController = new EventEmitter();
        this.commandGroups = [];
        this.expandedCommandGroups = [];
        this.CommandName = CommandName;
        this.WindowSize = WindowSize;
        this.excludeCommandList = [
            CommandName.PausePatrol,
            CommandName.ResumePatrol,
            CommandName.Abort,
            CommandName.EStop,
            CommandName.VolumeMute,
            CommandName.VolumeUnmute,
            CommandName.SayMessage
        ];
    }
    RobotMonitorController.prototype.toggleCommandSection = function (cmd) {
        if (this.expandedCommandGroups.includes(cmd)) {
            this.expandedCommandGroups.splice(this.expandedCommandGroups.indexOf(cmd), 1);
        }
        else {
            this.expandedCommandGroups.push(cmd);
        }
    };
    RobotMonitorController.prototype.ngOnChanges = function (changes) {
        if (this.platform && changes.platform)
            this.buildCommandListGroups();
    };
    RobotMonitorController.prototype.buildCommandListGroups = function () {
        this.commandGroups = [];
        for (var _i = 0, _a = this.platform.Commands; _i < _a.length; _i++) {
            var command = _a[_i];
            switch (command.CommandName) {
                case CommandName.Abort:
                case CommandName.CancelGoal:
                case CommandName.EStop:
                case CommandName.EStopReset:
                case CommandName.ResetCameras:
                case CommandName.PausePatrol:
                case CommandName.ResumePatrol:
                case CommandName.TiltCameraAbsolute:
                    continue;
            }
            if (!this.commandGroups.includes(command.Category)) {
                this.commandGroups.push(command.Category);
            }
        }
        this.commandGroups.sort();
        this.expandedCommandGroups = this.commandGroups.slice();
        this.groupCmdList = new Map();
        for (var _b = 0, _c = this.commandGroups; _b < _c.length; _b++) {
            var group = _c[_b];
            this.groupCmdList.set(group, this.getCmdForGroup(group));
        }
    };
    RobotMonitorController.prototype.getCmdForGroup = function (groupName) {
        var cmdList = [];
        var commandCollection = this.platformService.getCommandDefinitions(this.platform);
        for (var _i = 0, _a = commandCollection.commands; _i < _a.length; _i++) {
            var cmd = _a[_i];
            if (cmd.category === groupName && !this.excludeCommandList.includes(cmd.onCommand.CommandName)) {
                if (cmd.onCommand.CommandName === CommandName.VolumeUnmute) {
                    cmd.displayName = 'Volume';
                }
                cmdList.push(cmd);
            }
        }
        cmdList.sort(function (a, b) {
            if (a.displayName.toLowerCase() < b.displayName.toLowerCase())
                return -1;
            if (a.displayName.toLowerCase() > b.displayName.toLowerCase())
                return 1;
            return 0;
        });
        return cmdList;
    };
    __decorate([
        Input(),
        __metadata("design:type", Platform)
    ], RobotMonitorController.prototype, "platform", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], RobotMonitorController.prototype, "size", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], RobotMonitorController.prototype, "onHideController", void 0);
    RobotMonitorController = __decorate([
        Component({
            selector: 'robot-monitor-controller',
            templateUrl: 'robot-monitor-controller.component.html',
            styleUrls: ['robot-monitor-controller.component.css'],
            animations: [slideDown],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PlatformService, ChangeDetectorRef])
    ], RobotMonitorController);
    return RobotMonitorController;
}());
export { RobotMonitorController };
//# sourceMappingURL=robot-monitor-controller.component.js.map