var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { Platform } from './platform.class';
import { PlatformCommand, CommandName, Parameter, ParameterName, ParameterType } from './../patrols/action.class';
import { PlatformService } from './platform.service';
var PlatformVolume = /** @class */ (function () {
    function PlatformVolume(platformService, ref) {
        this.platformService = platformService;
        this.ref = ref;
        this.changeFlag = false;
        this.ngUnsubscribe = new Subject();
        this.volumeState = [0, 0];
        this.isDisabled = false;
        this.tempVolumeValue = 0;
        this.isLoadingVolumeLevel = false;
        this.volumeLevelError = false;
        this.errorTimer = null;
        this.volumeChanging = false;
        this.tempMuteValue = null;
        this.muteError = false;
        this.isMuteLoading = false;
    }
    PlatformVolume.prototype.ngOnInit = function () {
        var _this = this;
        this.volumeCmd = this.platform.Commands.find(function (item) {
            return item.CommandName === CommandName.Volume;
        });
        this.muteCmd = this.platform.Commands.find(function (item) {
            return item.CommandName === CommandName.VolumeMute;
        });
        this.unMuteCmd = this.platform.Commands.find(function (item) {
            return item.CommandName === CommandName.VolumeUnmute;
        });
        this.volumeState[1] = this.platform.State.Values.find(function (item) {
            return item.Name === 'volumeLevel';
        }).IntValue;
        this.tempVolumeValue = this.volumeState[1];
        this.isMuted = !this.platform.State.Values.find(function (item) {
            return item.Name === 'volume';
        }).BooleanValue;
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                if (platform.id === _this.platform.id) {
                    var volumeLevel = _this.platform.State.Values.find(function (item) {
                        return item.Name === 'volumeLevel';
                    }).IntValue;
                    if (_this.isLoadingVolumeLevel) {
                        if (volumeLevel === _this.tempVolumeValue) {
                            _this.volumeState = [0, (volumeLevel === -1) ? 0 : volumeLevel];
                            _this.isDisabled = false;
                            _this.isLoadingVolumeLevel = false;
                            clearTimeout(_this.volumeChangeTimer);
                            _this.volumeChangeTimer = null;
                        }
                    }
                    else if (!_this.volumeChanging) {
                        _this.volumeState = [0, (volumeLevel === -1) ? 0 : volumeLevel];
                    }
                    var isMuted = !_this.platform.State.Values.find(function (item) {
                        return item.Name === 'volume';
                    }).BooleanValue;
                    if (_this.isMuteLoading) {
                        if (isMuted === _this.tempMuteValue) {
                            clearTimeout(_this.volumeChangeTimer);
                            _this.volumeChangeTimer = null;
                            _this.tempMuteValue = null;
                            _this.isMuteLoading = false;
                            _this.isDisabled = false;
                            _this.ref.detectChanges();
                        }
                    }
                    else {
                        _this.isMuted = isMuted;
                    }
                    _this.changeFlag = !_this.changeFlag;
                    _this.ref.markForCheck();
                }
            }
        });
    };
    PlatformVolume.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PlatformVolume.prototype.getIcon = function () {
        var sufix = '-not-selected';
        if (!this.isMuted) {
            sufix = '-selected';
        }
        return '/Content/images/Platforms/CommandIcons/volume-settings' + sufix + '.png';
    };
    PlatformVolume.prototype.handleVolumeChange = function (event) {
        var _this = this;
        this.volumeState[1] = event.values[1];
        var param = new Parameter({
            Name: ParameterName.Percent,
            Value: event.values[1].toString(),
            Type: ParameterType.Int
        });
        this.volumeChanging = false;
        this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.Volume, [param]));
        this.isDisabled = true;
        this.tempVolumeValue = this.volumeState[1];
        this.isLoadingVolumeLevel = true;
        this.volumeLevelError = false;
        this.muteError = false;
        clearTimeout(this.errorTimer);
        this.errorTimer = null;
        this.volumeChangeTimer = setTimeout(function () {
            //Show error
            _this.volumeLevelError = true;
            //Set to current value
            var volumeLevel = _this.platform.State.Values.find(function (item) {
                return item.Name === 'volumeLevel';
            }).IntValue;
            _this.volumeState = [0, (volumeLevel === -1) ? 0 : volumeLevel];
            _this.isLoadingVolumeLevel = false;
            clearTimeout(_this.volumeChangeTimer);
            _this.volumeChangeTimer = null;
            _this.isLoadingVolumeLevel = _this.isDisabled = false;
            _this.volumeLevelError = true;
            _this.errorTimer = setTimeout(function () {
                _this.volumeLevelError = false;
                _this.errorTimer = null;
                _this.ref.markForCheck();
            }, 7000);
            _this.ref.markForCheck();
        }, 10000);
        this.ref.detectChanges();
    };
    PlatformVolume.prototype.handleMuteChange = function (event) {
        var _this = this;
        if (this.isMuteLoading) {
            return;
        }
        this.isMuteLoading = true;
        this.isDisabled = true;
        this.muteError = false;
        this.volumeLevelError = false;
        if (this.isMuted) {
            //UnMute
            this.tempMuteValue = false;
            this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.VolumeUnmute));
        }
        else {
            //Mute
            this.tempMuteValue = true;
            this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.VolumeMute));
        }
        if (this.volumeChangeTimer) {
            clearTimeout(this.volumeChangeTimer);
            this.volumeChangeTimer = null;
        }
        this.volumeLevelError = false;
        clearTimeout(this.errorTimer);
        this.errorTimer = null;
        this.volumeChangeTimer = setTimeout(function () {
            _this.isMuted = !_this.platform.State.Values.find(function (item) {
                return item.Name === 'volume';
            }).BooleanValue;
            _this.isMuteLoading = false;
            _this.isDisabled = false;
            _this.muteError = true;
            _this.errorTimer = setTimeout(function () {
                _this.muteError = false;
                _this.ref.markForCheck();
                _this.errorTimer = null;
            }, 7000);
            _this.ref.markForCheck();
        }, 10000);
        this.ref.detectChanges();
    };
    __decorate([
        Input(),
        __metadata("design:type", Platform)
    ], PlatformVolume.prototype, "platform", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PlatformVolume.prototype, "changeFlag", void 0);
    PlatformVolume = __decorate([
        Component({
            selector: 'platform-volume',
            templateUrl: 'platform-volume.component.html',
            styleUrls: ['platform-volume.component.css', 'robot-monitor-controller-cmd.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PlatformService,
            ChangeDetectorRef])
    ], PlatformVolume);
    return PlatformVolume;
}());
export { PlatformVolume };
//# sourceMappingURL=platform-volume.component.js.map