var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { slideDown } from '../../shared/animations';
import { Platform, PlatformMode } from '../../platforms/platform.class';
import { MapViewOptions } from '../../shared/map-view-options.class';
import { PatrolService } from '../../patrols/patrol.service';
import { PlatformService } from '../../platforms/platform.service';
import { PatrolStatusValues } from '../../patrols/patrol.class';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { DomSanitizer } from '@angular/platform-browser';
import { AlarmService } from '../../alarms/alarm.service';
import { PlatformCommand, CommandName, Parameter, ParameterName, ParameterType } from '../../patrols/action.class';
import { UserService } from '../../shared/user.service';
var Subsections;
(function (Subsections) {
    Subsections[Subsections["RobotSensors"] = 0] = "RobotSensors";
    Subsections[Subsections["ActiveAlarms"] = 1] = "ActiveAlarms";
})(Subsections || (Subsections = {}));
var RobotCard = /** @class */ (function () {
    function RobotCard(patrolService, platformService, ref, Sanitizer, alarmService, userService) {
        this.patrolService = patrolService;
        this.platformService = platformService;
        this.ref = ref;
        this.Sanitizer = Sanitizer;
        this.alarmService = alarmService;
        this.userService = userService;
        this.disablePlatformTabScroll = true;
        this.actionMenuOpen = false;
        this.ngUnsubscribe = new Subject();
        this.actionMenuUnsub = new Subject();
        this.Subsections = Subsections;
        this.expandedSubSection = new Map();
        this.PatrolStatusValues = PatrolStatusValues;
        this.PlatformMode = PlatformMode;
    }
    RobotCard.prototype.getPlatformPatrolCompleteness = function () {
        if (this.patrolInstance) {
            return this.patrolService.getPatrolCompleteness(this.patrolInstance);
        }
        return null;
    };
    RobotCard.prototype.showPauseNotfication = function () {
        var _this = this;
        //If patrol is paused and notfication not seen
        if (this.patrolInstance &&
            this.patrolInstance.CurrentStatus === PatrolStatusValues.Paused &&
            !this.patrolInstance.notficationIsPaused) {
            //Hide pause button
            if (this.pauseNoficationTimeout) {
                clearTimeout(this.pauseNoficationTimeout);
            }
            this.pauseNoficationTimeout = setTimeout(function () {
                if (_this.patrolInstance) {
                    _this.patrolInstance.notficationIsPaused = true;
                    _this.ref.markForCheck();
                }
            }, 3000);
            return true;
        }
        return false;
    };
    RobotCard.prototype.expandedSubSectionViewState = function (subSection) {
        if (!this.expandedSubSection[subSection])
            this.expandedSubSection[subSection] = 'out';
        return this.expandedSubSection[subSection];
    };
    RobotCard.prototype.handlePlatformNameClick = function (event) {
        event.stopPropagation();
        this.platformService.showRobotMonitor(this.platform);
    };
    RobotCard.prototype.getAlarmList = function () {
        var _this = this;
        var alarms = [];
        alarms = this.alarmService.alarms.filter(function (alarm) {
            return alarm.PlatformId === _this.platform.id;
        });
        this.alarmCount = alarms.length;
        return alarms;
    };
    RobotCard.prototype.toggleExpandedSubSectionView = function (subSection) {
        event.stopPropagation();
        if (this.expandedSubSection[subSection] === 'out') {
            this.expandedSubSection[subSection] = 'in';
        }
        else {
            this.expandedSubSection[subSection] = 'out';
        }
    };
    RobotCard.prototype.getPlatformManufacturerIconSrc = function () {
        var manufacturer = this.platformService.getPlatformManufacturerName(this.platform);
        if (manufacturer !== 'generic') {
            return '/Content/Images/Platforms/' + manufacturer + '-logo.png';
        }
        return '';
    };
    RobotCard.prototype.getPlatformOrientation = function () {
        if (this.platform.Orientation)
            return this.platform.Orientation;
        return 0;
    };
    RobotCard.prototype.getPlatformHeadingRotation = function () {
        return this.Sanitizer.bypassSecurityTrustStyle('rotate(' + this.platform.Orientation + 'deg)');
    };
    RobotCard.prototype.getPlatformStatus = function () {
        if (this.patrolInstance) {
            //Return the patrol status
            return this.patrolService.getPatrolStatusClass(this.patrolService.getPatrolTemplate(this.patrolInstance.TemplateId), this.patrolInstance);
        }
        else if (this.platformService.isPlatformAvailable(this.platform)) {
            return 'availableStatus'; //blue
        }
        else {
            return 'unavailableStatus';
        }
    };
    RobotCard.prototype.getPlatformHeadingCardinal = function () {
        if (this.platform.Orientation) {
            if (this.platform.Orientation < 33.75) {
                return 'N';
            }
            else if (this.platform.Orientation < 78.75) {
                return 'NE';
            }
            else if (this.platform.Orientation < 123.75) {
                return 'E';
            }
            else if (this.platform.Orientation < 168.75) {
                return 'SE';
            }
            else if (this.platform.Orientation < 213.75) {
                return 'S';
            }
            else if (this.platform.Orientation < 258.75) {
                return 'SW';
            }
            else if (this.platform.Orientation < 303.75) {
                return 'W';
            }
            else if (this.platform.Orientation < 348.75) {
                return 'NW';
            }
        }
        return 'N';
    };
    RobotCard.prototype.getPlatformBatteryIconSrc = function () {
        if (this.platform.BatteryPercentage) {
            if (this.platform.BatteryPercentage > 90) {
                return '/Content/Images/Platforms/battery-icons-100.png';
            }
            else if (this.platform.BatteryPercentage > 80) {
                return '/Content/Images/Platforms/battery-icons-90.png';
            }
            else if (this.platform.BatteryPercentage > 70) {
                return '/Content/Images/Platforms/battery-icons-80.png';
            }
            else if (this.platform.BatteryPercentage > 60) {
                return '/Content/Images/Platforms/battery-icons-70.png';
            }
            else if (this.platform.BatteryPercentage > 50) {
                return '/Content/Images/Platforms/battery-icons-60.png';
            }
            else if (this.platform.BatteryPercentage > 40) {
                return '/Content/Images/Platforms/battery-icons-50.png';
            }
            else if (this.platform.BatteryPercentage > 30) {
                return '/Content/Images/Platforms/battery-icons-40.png';
            }
            else if (this.platform.BatteryPercentage > 20) {
                return '/Content/Images/Platforms/battery-icons-30.png';
            }
            else if (this.platform.BatteryPercentage > 10) {
                return '/Content/Images/Platforms/battery-icons-20.png';
            }
            else if (this.platform.BatteryPercentage > 5) {
                return '/Content/Images/Platforms/battery-icons-10.png';
            }
            else {
                return '/Content/Images/Platforms/battery-icons-5.png';
            }
        }
        return '';
    };
    RobotCard.prototype.isProgressBarHidden = function () {
        var isHidden = true;
        if (this.patrolInstance) {
            isHidden = false;
        }
        else if (this.platform.PatrolTemplateSubmittedId) {
            isHidden = false;
        }
        return isHidden;
    };
    RobotCard.prototype.goToPatrol = function (event, patrolTemplateId) {
        event.stopPropagation();
        this.mapViewOptions.showPlatformsTab = false;
        this.mapViewOptions.showAlarmsTab = false;
        this.mapViewOptions.showPatrolsTab = true;
        this.mapViewOptions.lastShownTab = 'Patrol';
        this.patrolService.toggleSelectedPatrol(patrolTemplateId, true);
        this.patrolService.scollToPatrol(patrolTemplateId);
    };
    RobotCard.prototype.isPaused = function () {
        if (this.patrolInstance && this.patrolInstance.CurrentStatus === PatrolStatusValues.Paused) {
            return true;
        }
        return false;
    };
    RobotCard.prototype.pauseOnClick = function (event) {
        event.stopPropagation();
        var parameterList = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolInstance.InstanceId, Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.PausePatrol, parameterList));
    };
    RobotCard.prototype.resumeOnClick = function (event) {
        event.stopPropagation();
        var parameterList = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolInstance.InstanceId, Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.ResumePatrol, parameterList));
    };
    RobotCard.prototype.openActionMenu = function (event, atMouse) {
        var _this = this;
        if (atMouse === void 0) { atMouse = false; }
        if (atMouse) {
            event.preventDefault();
            this.platformService.openPlatformActionMenu(this.platform, event, null, null, null, this.disablePlatformTabScroll);
        }
        else {
            this.platformService.openPlatformActionMenu(this.platform, event, this.platformActions, null, null, this.disablePlatformTabScroll);
        }
        this.actionMenuOpen = true;
        this.platformService.platformCommandDialogClosed
            .takeUntil(this.actionMenuUnsub)
            .subscribe({
            next: function () {
                _this.actionMenuOpen = false;
                _this.ref.detectChanges();
                _this.actionMenuUnsub.next();
            }
        });
    };
    RobotCard.prototype.ngOnInit = function () {
        var _this = this;
        this.patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.platform.id);
        //Need to listen to instance updates
        this.patrolService.onUpsertInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolInstance) {
                if (patrolInstance.PlatformId === _this.platform.id) {
                    _this.patrolInstance = patrolInstance;
                    _this.ref.markForCheck();
                }
            }
        });
        this.patrolService.onPatrolInstanceComplete
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolInstance) {
                if (patrolInstance.PlatformId === _this.platform.id) {
                    _this.patrolInstance = null;
                    _this.ref.markForCheck();
                }
            }
        });
    };
    RobotCard.prototype.ngOnDestroy = function () {
        if (this.pauseNoficationTimeout) {
            clearTimeout(this.pauseNoficationTimeout);
        }
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        this.actionMenuUnsub.next();
        this.actionMenuUnsub.complete();
    };
    __decorate([
        Input(),
        __metadata("design:type", Platform)
    ], RobotCard.prototype, "platform", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], RobotCard.prototype, "selected", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], RobotCard.prototype, "expanded", void 0);
    __decorate([
        Input(),
        __metadata("design:type", MapViewOptions)
    ], RobotCard.prototype, "mapViewOptions", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], RobotCard.prototype, "disablePlatformTabScroll", void 0);
    __decorate([
        ViewChild('platformActions'),
        __metadata("design:type", ElementRef)
    ], RobotCard.prototype, "platformActions", void 0);
    RobotCard = __decorate([
        Component({
            selector: 'robot-card',
            templateUrl: 'robot-card.component.html',
            styleUrls: ['robot-card.component.css'],
            animations: [slideDown],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService,
            PlatformService,
            ChangeDetectorRef,
            DomSanitizer,
            AlarmService,
            UserService])
    ], RobotCard);
    return RobotCard;
}());
export { RobotCard };
//# sourceMappingURL=robot-card.component.js.map