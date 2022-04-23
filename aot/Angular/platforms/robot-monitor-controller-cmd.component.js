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
import { slideDown } from './../shared/animations';
import { CommandCollectionItem } from './command-definition-collection.class';
import { Platform, PlatformMode } from './platform.class';
import { PlatformCommand, CommandName, Parameter, ParameterName, ParameterType, ActionStateValue } from './../patrols/action.class';
import { WindowSize } from './robot-monitor.component';
import { PlatformService } from './platform.service';
import { SayPlayChooser } from '../shared/say-play-chooser.component';
import { OrientRobot } from '../shared/orient-robot.component';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var RobotMonitorControllerCmd = /** @class */ (function () {
    function RobotMonitorControllerCmd(platformService, ref, platformMapService) {
        this.platformService = platformService;
        this.ref = ref;
        this.platformMapService = platformMapService;
        this.CommandName = CommandName;
        this.WindowSize = WindowSize;
        this.sayPlayMode = CommandName.SayMessage;
        this.isSelected = false;
        this.isLoading = false;
        this.currentState = false;
        this.toggleFailed = false;
        this.nonToggleError = false;
        this.ngUnsubscribe = new Subject();
        this.estopOn = false;
        this.nonToggleLoading = false;
    }
    RobotMonitorControllerCmd.prototype.ngOnInit = function () {
        var _this = this;
        this.currentState = this.getState(this.cmd);
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                if (platform.id === _this.platform.id) {
                    if (_this.toggleTimeout) {
                        clearTimeout(_this.toggleTimeout);
                        _this.toggleTimeout = undefined;
                    }
                    var state = _this.getState(_this.cmd);
                    if (_this.currentState !== state) {
                        _this.currentState = state;
                        _this.isLoading = false;
                        _this.toggleFailed = false;
                    }
                    if (_this.estopOn) {
                        if (platform.State.PlatformMode !== PlatformMode.Estop) {
                            _this.estopOn = false;
                            if (_this.toggleTimeout) {
                                clearTimeout(_this.toggleTimeout);
                                _this.toggleTimeout = null;
                                _this.nonToggleLoading = false;
                            }
                            if (_this.toggleFailedTimeout) {
                                clearTimeout(_this.toggleFailedTimeout);
                                _this.toggleFailedTimeout = null;
                            }
                            _this.ref.detectChanges();
                        }
                    }
                    _this.ref.detectChanges();
                }
            }
        });
    };
    RobotMonitorControllerCmd.prototype.ngOnDestroy = function () {
        if (this.toggleTimeout) {
            clearTimeout(this.toggleTimeout);
        }
        if (this.toggleFailedTimeout) {
            clearTimeout(this.toggleFailedTimeout);
        }
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    RobotMonitorControllerCmd.prototype.sayPlayValueChanged = function (value) {
        this.sayPlayValue = value;
    };
    RobotMonitorControllerCmd.prototype.orientValueChanged = function (value) {
        this.orientValue = value;
    };
    RobotMonitorControllerCmd.prototype.onSelection = function (event) {
        var _this = this;
        if (this.hasCmdDialog(this.cmd.onCommand.CommandName)) {
            this.isSelected = !this.isSelected;
        }
        else {
            this.isSelected = false;
            if (this.cmd.toggleCommand) {
                this.executePlatformCommand(event);
            }
            else {
                this.executePlatformCommand(event);
            }
            if (this.cmd.onCommand.CommandName === CommandName.EStopReset) {
                if (this.toggleTimeout) {
                    return;
                }
                this.nonToggleLoading = true;
                this.estopOn = true;
                this.toggleTimeout = setTimeout(function () {
                    _this.toggleTimeout = undefined;
                    _this.nonToggleLoading = false;
                    _this.nonToggleError = true;
                    _this.toggleFailedTimeout = setTimeout(function () {
                        _this.toggleFailedTimeout = undefined;
                        _this.nonToggleError = false;
                        _this.ref.detectChanges();
                    }, 7000);
                    _this.ref.detectChanges();
                }, 10000);
                this.ref.detectChanges();
            }
        }
    };
    RobotMonitorControllerCmd.prototype.executePlatformCommand = function (event) {
        var _this = this;
        if (this.isLoading) {
            return;
        }
        var command = this.cmd.onCommand;
        // If this is a toggle command and the current state is true, use the off command
        if (this.cmd.toggleCommand && this.getState(this.cmd)) {
            command = this.cmd.offCommand;
        }
        else if (!this.cmd.toggleCommand) {
            if (!this.getState(this.cmd)) {
                if (!this.cmd.offCommand) {
                    return;
                }
                command = this.cmd.offCommand;
            }
        }
        this.platformService.executeCommand(this.platform, command, this.platformMapService);
        if (this.cmd.toggleCommand) {
            this.isLoading = true;
            this.toggleTimeout = setTimeout(function () {
                _this.toggleTimeout = undefined;
                _this.isLoading = false;
                _this.toggleFailed = true;
                _this.toggleFailedTimeout = setTimeout(function () {
                    _this.toggleFailedTimeout = undefined;
                    _this.toggleFailed = false;
                    _this.ref.detectChanges();
                }, 7000);
                _this.ref.detectChanges();
            }, 10000);
        }
    };
    RobotMonitorControllerCmd.prototype.hasCmdDialog = function (cmd) {
        switch (cmd) {
            case CommandName.SayMessage:
            case CommandName.Play:
            case CommandName.OrientPlatform:
            case CommandName.LocalizeOnCharger:
            case CommandName.SetChargerLocation:
                return true;
            default:
                return false;
        }
    };
    RobotMonitorControllerCmd.prototype.getSayParameterList = function () {
        for (var _i = 0, _a = this.platform.Commands; _i < _a.length; _i++) {
            var cmd = _a[_i];
            if (cmd.CommandName === CommandName.SayMessage) {
                return cmd.Parameters[0];
            }
        }
    };
    RobotMonitorControllerCmd.prototype.sayPlayCommandChanged = function (commandName) {
        this.sayPlayMode = commandName;
        this.ref.detectChanges();
    };
    RobotMonitorControllerCmd.prototype.getCmdIcon = function (command, isSelected) {
        if (isSelected === void 0) { isSelected = false; }
        var sufix = '-not-selected';
        if (isSelected) {
            sufix = '-selected';
        }
        var currentCommand = command.onCommand;
        if (currentCommand.CommandName === CommandName.GoToLocation && this.platformService.getPlatformCommandState(this.platform, this.cmd.onCommand.CommandName) === ActionStateValue.Off) {
            currentCommand = command.offCommand;
        }
        switch (currentCommand.CommandName) {
            case CommandName.EStopReset:
                return '/Content/images/Platforms/CommandIcons/release-e-Stop' + sufix + '.png';
            case CommandName.FlashersOn:
            case CommandName.FlashersOff:
                return '/Content/images/Platforms/CommandIcons/flashers' + sufix + '.png';
            case CommandName.GoCharge:
                return '/Content/images/Platforms/CommandIcons/go-charge' + sufix + '.png';
            case CommandName.HeadlightsOn:
            case CommandName.HeadlightsOff:
                return '/Content/images/Platforms/CommandIcons/headlights' + sufix + '.png';
            case CommandName.IrIlluminatorsOn:
            case CommandName.IrIlluminatorsOff:
                return '/Content/images/Platforms/CommandIcons/i-r-Illuminator' + sufix + '.png';
            case CommandName.LocalizeOnCharger:
                return '/Content/images/Platforms/CommandIcons/reset-robot-location' + sufix + '.png';
            case CommandName.SetChargerLocation:
                return '/Content/images/Platforms/CommandIcons/charger-settings' + sufix + '.png';
            case CommandName.SayMessage:
            case CommandName.Play:
                return '/Content/images/Platforms/CommandIcons/play-audio' + sufix + '.png';
            case CommandName.VolumeMute:
            case CommandName.VolumeUnmute:
            case CommandName.Volume:
                return '/Content/images/Platforms/CommandIcons/volume-settings' + sufix + '.png';
            case CommandName.OrientPlatform:
                return '/Content/images/Platforms/CommandIcons/orient-robot' + sufix + '.png';
            case CommandName.Snapshot:
                return '/Content/images/Platforms/CommandIcons/snapshot' + sufix + '.png';
            case CommandName.GoToLocation:
                return '/Content/images/Platforms/CommandIcons/go-to-location' + sufix + '.png';
            case CommandName.CancelGoal:
                return '/Content/images/Platforms/CommandIcons/go-to-location-released' + sufix + '.png';
            case CommandName.SirenOn:
            case CommandName.SirenOff:
                return '/Content/images/Platforms/CommandIcons/siren' + sufix + '.png';
            case CommandName.ShutDown:
                return '/Content/Images/Platforms/shutdown-icon-monitor.png';
            default:
                return '';
        }
    };
    RobotMonitorControllerCmd.prototype.showSelectedIcon = function () {
        if (this.cmd.toggleCommand) {
            return this.getState(this.cmd);
        }
        return false;
    };
    RobotMonitorControllerCmd.prototype.getState = function (cmd) {
        return this.getCommandState(cmd) === ActionStateValue.On ? true : false;
    };
    RobotMonitorControllerCmd.prototype.getCommandState = function (cmd) {
        if (cmd.toggleCommand) {
            // Toggle command, the command state comes from the platform state values
            return this.platformService.getPlatformState(this.platform, cmd.platformStateNameValue);
        }
        else {
            // Non toggle command, so the command state is specific to the command
            return this.platformService.getPlatformCommandState(this.platform, cmd.onCommand.CommandName);
        }
    };
    RobotMonitorControllerCmd.prototype.executeSayPlay = function () {
        var paramName = ParameterName.Phrase;
        if (this.sayPlayMode !== CommandName.SayMessage) {
            paramName = ParameterName.File;
        }
        var param = [new Parameter({ Name: paramName, Value: this.sayPlayValue, Type: ParameterType.String })];
        var platformCommand = new PlatformCommand(this.platform.id, this.sayPlayMode, param);
        this.platformService.executePlatformCommand(platformCommand, this.platform.TenantId);
        this.platformSayPlay.setCustomValue(null);
    };
    RobotMonitorControllerCmd.prototype.executeOrientPlatform = function () {
        var param = [new Parameter({ Name: ParameterName.Angle, Value: this.orientValue, Type: ParameterType.Int })];
        var platformCommand = new PlatformCommand(this.platform.id, CommandName.OrientPlatform, param);
        this.platformService.executePlatformCommand(platformCommand, this.platform.TenantId);
    };
    RobotMonitorControllerCmd.prototype.onCmdDialogToggle = function (event) {
        if (this.orientRobot) {
            this.orientRobot.refreshMap();
        }
    };
    RobotMonitorControllerCmd.prototype.checkDisable = function () {
        var commandState = this.getCommandState(this.cmd);
        if (commandState === ActionStateValue.Disable) {
            return true;
        }
        else {
            if (!this.cmd.toggleCommand && commandState === ActionStateValue.Off && !this.cmd.offCommand) {
                return true;
            }
        }
        return false;
    };
    RobotMonitorControllerCmd.prototype.ngOnChanges = function () {
        if (this.orientRobot) {
            this.orientRobot.refreshMap();
        }
    };
    RobotMonitorControllerCmd.prototype.getCmdName = function () {
        if (this.cmd.onCommand.CommandName === CommandName.GoToLocation) {
            if (this.platformService.getPlatformCommandState(this.platform, this.cmd.onCommand.CommandName) === ActionStateValue.Off) {
                return this.cmd.offCommand.DisplayName;
            }
        }
        return this.cmd.displayName;
    };
    __decorate([
        Input(),
        __metadata("design:type", CommandCollectionItem)
    ], RobotMonitorControllerCmd.prototype, "cmd", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Platform)
    ], RobotMonitorControllerCmd.prototype, "platform", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], RobotMonitorControllerCmd.prototype, "size", void 0);
    __decorate([
        ViewChild('platformSayPlay'),
        __metadata("design:type", SayPlayChooser)
    ], RobotMonitorControllerCmd.prototype, "platformSayPlay", void 0);
    __decorate([
        ViewChild('orientRobot'),
        __metadata("design:type", OrientRobot)
    ], RobotMonitorControllerCmd.prototype, "orientRobot", void 0);
    RobotMonitorControllerCmd = __decorate([
        Component({
            selector: 'robot-monitor-controller-cmd',
            templateUrl: 'robot-monitor-controller-cmd.component.html',
            styleUrls: ['robot-monitor-controller-cmd.component.css'],
            animations: [slideDown],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PlatformService,
            ChangeDetectorRef,
            PlatformMapService])
    ], RobotMonitorControllerCmd);
    return RobotMonitorControllerCmd;
}());
export { RobotMonitorControllerCmd };
//# sourceMappingURL=robot-monitor-controller-cmd.component.js.map