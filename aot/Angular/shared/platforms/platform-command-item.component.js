var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommandName, PlatformCommand, ActionStateValue, Parameter, ParameterName, ParameterType } from '../../patrols/action.class';
import { Platform, PlatformMode } from '../../platforms/platform.class';
import { PlatformService } from '../../platforms/platform.service';
import { PlatformMapService } from '../../map/platforms/platformMap.service';
import { PatrolService } from '../../patrols/patrol.service';
import { UserService } from '../../shared/user.service';
import { CommandCollectionItem } from '../../platforms/command-definition-collection.class';
import { ToggleButton } from '../../shared/toggle-button.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var PlatformCommandItemComponent = /** @class */ (function () {
    function PlatformCommandItemComponent(platformService, platformMapService, patrolService, userService, changeDetectorRef) {
        this.platformService = platformService;
        this.platformMapService = platformMapService;
        this.patrolService = patrolService;
        this.userService = userService;
        this.changeDetectorRef = changeDetectorRef;
        this.hoverItem = true;
        this.size = 'small';
        this.commandState = ActionStateValue.Off;
        this.loading = false;
        this.toggleFailed = false;
        this.ngUnsubscribe = new Subject();
        this.nonToggleError = false;
        this.estopOn = false;
    }
    PlatformCommandItemComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                if (platform.id === _this.platform.id) {
                    var state = _this.getCommandState();
                    if (state !== _this.commandState) {
                        if (_this.loading) {
                            // Clear timeout
                            if (_this.toggleTimeout) {
                                clearTimeout(_this.toggleTimeout);
                                _this.toggleTimeout = undefined;
                            }
                            _this.loading = false;
                        }
                        if (_this.toggleFailedTimeout) {
                            clearTimeout(_this.toggleFailedTimeout);
                            _this.toggleFailedTimeout = undefined;
                        }
                        else if (_this.toggleFailed) {
                            _this.toggleFailed = false;
                        }
                        // Update the state, turn off loading, and unsubscribe from edit platform notifications
                        _this.commandState = state;
                        _this.changeDetectorRef.detectChanges();
                    }
                    if (_this.estopOn) {
                        if (platform.State.PlatformMode !== PlatformMode.Estop) {
                            _this.estopOn = false;
                            if (_this.toggleTimeout) {
                                clearTimeout(_this.toggleTimeout);
                                _this.toggleTimeout = null;
                                _this.loading = false;
                            }
                            if (_this.toggleFailedTimeout) {
                                clearTimeout(_this.toggleFailedTimeout);
                                _this.toggleFailedTimeout = null;
                            }
                            _this.changeDetectorRef.detectChanges();
                        }
                    }
                }
            }
        });
    };
    PlatformCommandItemComponent.prototype.executePlatformCommand = function (event) {
        var _this = this;
        // if loading, do not execute the command
        if (this.loading) {
            return;
        }
        if (this.callbackFunc) {
            this.callbackFunc();
        }
        // If command state is disabled, do not execute the command
        if (this.commandState === ActionStateValue.Disable) {
            return;
        }
        var command = this.command.onCommand;
        // If this is a toggle command and the current state is true, use the off command
        if (this.command.toggleCommand && this.commandState === ActionStateValue.On) {
            command = this.command.offCommand;
        }
        else if (!this.command.toggleCommand) {
            if (this.commandState === ActionStateValue.Off) {
                if (!this.command.offCommand) {
                    return;
                }
                command = this.command.offCommand;
            }
        }
        if (command.CommandName === CommandName.PausePatrol) {
            var parameterList = [];
            parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
            parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolService.getPatrolInstanceByPlatformId(this.platform.id).InstanceId, Type: ParameterType.String }));
            this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.PausePatrol, parameterList));
            return;
        }
        if (command.CommandName === CommandName.ResumePatrol) {
            var parameterList = [];
            parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
            parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolService.getPatrolInstanceByPlatformId(this.platform.id).InstanceId, Type: ParameterType.String }));
            this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.ResumePatrol, parameterList));
        }
        if (command.CommandName === CommandName.Abort) {
            if (this.patrolService.getPatrolInstanceByPlatformId(this.platform.id) || this.platform.IsPatrolSubmitted) {
                this.platformService.showConfirmAbortPatrol(this.platform);
                this.platformService.closePlatformActionMenuSub.next();
            }
            return;
        }
        if (command.CommandName === CommandName.EStopReset) {
            if (this.toggleTimeout) {
                return;
            }
            this.estopOn = true;
            this.loading = true;
            this.toggleTimeout = setTimeout(function () {
                clearTimeout(_this.toggleTimeout);
                _this.toggleTimeout = null;
                //Show non-toggle error
                _this.nonToggleError = true;
                _this.loading = false;
                _this.toggleFailedTimeout = setTimeout(function () {
                    // Turn off error state after 7 seconds
                    clearTimeout(_this.toggleFailedTimeout);
                    _this.toggleFailedTimeout = null;
                    _this.nonToggleError = false;
                    _this.changeDetectorRef.detectChanges();
                }, 7000);
                _this.changeDetectorRef.detectChanges();
            }, 10000);
        }
        this.platformService.executeCommand(this.platform, command, this.platformMapService);
        if (this.command.toggleCommand) {
            this.loading = true;
            // If state change does not occur within timeout window, go in to error state
            this.toggleTimeout = setTimeout(function () {
                // Turn off loading
                _this.toggleTimeout = undefined;
                _this.loading = false;
                // Go in to error state
                _this.toggleFailed = true;
                _this.toggleFailedTimeout = setTimeout(function () {
                    // Turn off error state after 7 seconds
                    _this.toggleFailedTimeout = undefined;
                    _this.toggleFailed = false;
                    _this.changeDetectorRef.detectChanges();
                }, 7000);
                _this.changeDetectorRef.detectChanges();
            }, 10000);
        }
    };
    PlatformCommandItemComponent.prototype.getDisplayName = function () {
        if (this.command.toggleCommand) {
            // toggle comand, so just use the display name
            return this.command.displayName;
        }
        else {
            // Not toggle command so use the display corresponding with the current state
            if (this.commandState === ActionStateValue.On || this.commandState === ActionStateValue.Disable) {
                return this.command.onCommand.DisplayName;
            }
            else {
                if (this.command.offCommand) {
                    return this.command.offCommand.DisplayName;
                }
                else {
                    return this.command.onCommand.DisplayName;
                }
            }
        }
    };
    PlatformCommandItemComponent.prototype.checkDisable = function () {
        if (this.commandState === ActionStateValue.Disable) {
            return true;
        }
        else {
            if (!this.command.toggleCommand && this.commandState === ActionStateValue.Off && !this.command.offCommand) {
                return true;
            }
        }
        return false;
    };
    PlatformCommandItemComponent.prototype.checkCloseOnClick = function () {
        var command = this.command.onCommand;
        if (command.CommandName === CommandName.GoCharge
            || command.CommandName === CommandName.SayMessage
            || command.CommandName === CommandName.Play
            || command.CommandName === CommandName.OrientPlatform
            || command.CommandName === CommandName.GoToLocation
            || command.DisplayName === 'Robot Monitor') {
            return true;
        }
        return false;
    };
    PlatformCommandItemComponent.prototype.handleClick = function (event) {
        if (this.command.toggleCommand && this.toggleButton) {
            this.toggleButton.onToggle(event);
        }
        else {
            this.executePlatformCommand(event);
        }
    };
    PlatformCommandItemComponent.prototype.determineState = function () {
        if (this.command) {
            this.commandState = this.getCommandState();
        }
    };
    PlatformCommandItemComponent.prototype.getCommandState = function () {
        if (this.command.toggleCommand) {
            // Toggle command, the command state comes from the platform state values
            return this.platformService.getPlatformState(this.platform, this.command.platformStateNameValue);
        }
        else {
            // Non toggle command, so the command state is specific to the command
            return this.platformService.getPlatformCommandState(this.platform, this.command.onCommand.CommandName);
        }
    };
    PlatformCommandItemComponent.prototype.getState = function () {
        return this.commandState === ActionStateValue.On ? true : false;
    };
    PlatformCommandItemComponent.prototype.getCommandName = function () {
        var command = this.command.onCommand;
        if (this.commandState === ActionStateValue.Off) {
            if (this.command.offCommand) {
                // Off command exists, so use it
                command = this.command.offCommand;
            }
        }
        return command.CommandName;
    };
    PlatformCommandItemComponent.prototype.getCommandIconSrc = function () {
        var command = this.command.onCommand;
        if (this.commandState === ActionStateValue.Off) {
            if (this.command.offCommand) {
                // Off command exists, so use it
                command = this.command.offCommand;
            }
        }
        if (command.CommandName === CommandName.EStop) {
            return '/Content/images//Patrols/e-stop.png';
        }
        else if (command.CommandName === CommandName.EStopReset) {
            return '/Content/Images/Patrols/reset-stop.png';
        }
        else if (command.CommandName === CommandName.FlashersOn || command.CommandName === CommandName.FlashersOff) {
            return '/Content/Images/Patrols/flashers.png';
        }
        else if (command.CommandName === CommandName.GoCharge) {
            return '/Content/Images/Patrols/go-charge.png';
        }
        else if (command.CommandName === CommandName.GoHome) {
            return '/Content/Images/Patrols/go-home.png';
        }
        else if (command.CommandName === CommandName.HeadlightsOn || command.CommandName === CommandName.HeadlightsOff) {
            return '/Content/Images/Patrols/headlights.png';
        }
        else if (command.CommandName === CommandName.IrIlluminatorsOn || command.CommandName === CommandName.IrIlluminatorsOff) {
            return '/Content/Images/Patrols/ir-illuminator.png';
        }
        else if (command.CommandName === CommandName.LocalizeOnCharger || command.CommandName === CommandName.SetChargerLocation) {
            return '/Content/Images/Patrols/charger-settings.png';
        }
        else if (command.CommandName === CommandName.SayMessage || command.CommandName === CommandName.Play) {
            return '/Content/Images/Patrols/play-audio.png';
        }
        else if (command.CommandName === CommandName.SirenOn || command.CommandName === CommandName.SirenOff) {
            return '/Content/Images/Patrols/siren.png';
        }
        else if (command.CommandName === CommandName.VolumeMute || command.CommandName === CommandName.VolumeUnmute || command.CommandName === CommandName.Volume) {
            return '/Content/Images/Patrols/volume.png';
        }
        else if (command.CommandName === CommandName.OrientPlatform) {
            return '/Content/Images/Patrols/orient-robot.png';
        }
        else if (command.CommandName === CommandName.Snapshot) {
            return '/Content/Images/Patrols/take-snapshot.png';
        }
        else if (command.CommandName === CommandName.GoToLocation) {
            return '/Content/Images/Platforms/go-to-location-small.png';
        }
        else if (command.CommandName === CommandName.CancelGoal) {
            return '/Content/Images/Platforms/go-to-location-cancel.png';
        }
        else if (command.CommandName === CommandName.PausePatrol) {
            return '/Content/Images/Patrols/pause.png';
        }
        else if (command.CommandName === CommandName.Abort) {
            return '/Content/Images/Patrols/abort.png';
        }
        else if (command.CommandName === CommandName.ResumePatrol) {
            return '/Content/Images/Patrols/resume.png';
        }
        else if (command.DisplayName === 'Robot Monitor') {
            return '/Content/Images/Patrols/robot-monitor.png';
        }
        else if (command.CommandName === CommandName.ShutDown) {
            return '/Content/Images/Platforms/shutdown-icon-monitor.png';
        }
        else {
            return '/Content/Images/Patrols/blank-icon.png';
        }
    };
    PlatformCommandItemComponent.prototype.abortPatrol = function () {
        var patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.platform.id);
        this.patrolService.abortPatrol(patrolInstance, (patrolInstance) ? patrolInstance.TemplateId : this.platform.PatrolTemplateSubmittedId, this.platform.id);
    };
    PlatformCommandItemComponent.prototype.ngOnChanges = function (changes) {
        if (changes.command && changes.command.firstChange) {
            if (this.command && !this.command.onCommand) {
                this.command.onCommand = this.command.offCommand;
            }
        }
        this.determineState();
    };
    PlatformCommandItemComponent.prototype.ngOnDestroy = function () {
        if (this.toggleTimeout) {
            clearTimeout(this.toggleTimeout);
        }
        if (this.toggleFailedTimeout) {
            clearTimeout(this.toggleFailedTimeout);
        }
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    __decorate([
        Input(),
        __metadata("design:type", CommandCollectionItem)
    ], PlatformCommandItemComponent.prototype, "command", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Platform)
    ], PlatformCommandItemComponent.prototype, "platform", void 0);
    __decorate([
        Input('callback'),
        __metadata("design:type", Function)
    ], PlatformCommandItemComponent.prototype, "callbackFunc", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PlatformCommandItemComponent.prototype, "hoverItem", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PlatformCommandItemComponent.prototype, "size", void 0);
    __decorate([
        ViewChild(ToggleButton),
        __metadata("design:type", ToggleButton)
    ], PlatformCommandItemComponent.prototype, "toggleButton", void 0);
    PlatformCommandItemComponent = __decorate([
        Component({
            selector: 'platform-command-item',
            templateUrl: 'platform-command-item.component.html',
            styleUrls: ['platform-command-list.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PlatformService,
            PlatformMapService,
            PatrolService,
            UserService,
            ChangeDetectorRef])
    ], PlatformCommandItemComponent);
    return PlatformCommandItemComponent;
}());
export { PlatformCommandItemComponent };
//# sourceMappingURL=platform-command-item.component.js.map