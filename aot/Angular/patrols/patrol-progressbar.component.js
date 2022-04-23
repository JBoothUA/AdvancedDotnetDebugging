var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { PatrolInstance, AreaType, isPatrolTemplate, PatrolStatusValues } from './patrol.class';
import { PatrolService } from './patrol.service';
import { PlatformService } from './../platforms/platform.service';
import { CommandName, PlatformCommand, Parameter, ParameterName, ParameterType } from './action.class';
import { UserService } from './../shared/user.service';
var PatrolProgressbar = /** @class */ (function () {
    function PatrolProgressbar(patrolService, ref, platformService, userService) {
        this.patrolService = patrolService;
        this.ref = ref;
        this.platformService = platformService;
        this.userService = userService;
        this.size = 50;
        this.strokeWidth = 5;
        this.hidePauseResumeBtn = true;
        this.PatrolStatusValues = PatrolStatusValues;
    }
    PatrolProgressbar.prototype.getPatrolIconSrc = function () {
        var isPending = false;
        if (isPatrolTemplate(this.patrol)) {
            isPending = this.patrol.IsPatrolSubmitted;
        }
        if (!isPending) {
            switch (this.patrol.AreaType) {
                case AreaType.Large:
                    return '/Content/Images/Patrols/large-area-patrol.png';
                case AreaType.Small:
                    return '/Content/Images/Patrols/small-area-patrol.png';
                case AreaType.Perimeter:
                    return '/Content/Images/Patrols/perimeter-patrol.png';
                default:
                    return '';
            }
        }
        else {
            //If in wait between run
            if (this.patrol.RunSetData.NextRun) {
                switch (this.patrol.AreaType) {
                    case AreaType.Large:
                        return '/Content/Images/Patrols/large-area-in-between-runs.png';
                    case AreaType.Small:
                        return '/Content/Images/Patrols/small-area-in-between-runs.png';
                    case AreaType.Perimeter:
                        return '/Content/Images/Patrols/perimeter-icon-in-between-runs.png';
                    default:
                        return '';
                }
            }
            return '/Content/Images/Patrols/patrol-pending-large.gif';
        }
    };
    PatrolProgressbar.prototype.getPatrolCompleteness = function () {
        if (isPatrolTemplate(this.patrol)) {
            return 0.0;
        }
        else {
            return this.patrolService.getPatrolCompleteness(this.patrol);
        }
    };
    PatrolProgressbar.prototype.isPaused = function () {
        if (!isPatrolTemplate(this.patrol)) {
            if (this.patrol.CurrentStatus === PatrolStatusValues.Paused)
                return true;
        }
        return false;
    };
    PatrolProgressbar.prototype.pauseOnClick = function (event) {
        if (!isPatrolTemplate(this.patrol)) {
            event.stopPropagation();
            var parameterList = [];
            parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
            parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrol.InstanceId, Type: ParameterType.String }));
            this.platformService.executePlatformCommand(new PlatformCommand(this.patrol.PlatformId, CommandName.PausePatrol, parameterList));
        }
    };
    PatrolProgressbar.prototype.resumeOnClick = function (event) {
        if (!isPatrolTemplate(this.patrol)) {
            event.stopPropagation();
            var parameterList = [];
            parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
            parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrol.InstanceId, Type: ParameterType.String }));
            this.platformService.executePlatformCommand(new PlatformCommand(this.patrol.PlatformId, CommandName.ResumePatrol, parameterList));
        }
    };
    PatrolProgressbar.prototype.showPauseNotfication = function () {
        var _this = this;
        if (!isPatrolTemplate(this.patrol)) {
            //If patrol is paused and notfication not seen
            if (this.patrol &&
                this.patrol.CurrentStatus === PatrolStatusValues.Paused &&
                !this.patrol.notficationIsPaused) {
                //Hide pause button
                if (this.pauseNoficationTimeout) {
                    clearTimeout(this.pauseNoficationTimeout);
                }
                this.pauseNoficationTimeout = setTimeout(function () {
                    _this.patrol.notficationIsPaused = true;
                    _this.ref.markForCheck();
                }, 3000);
                return true;
            }
        }
        return false;
    };
    PatrolProgressbar.prototype.showPauseResumeButton = function () {
        return !this.hidePauseResumeBtn && !isPatrolTemplate(this.patrol);
    };
    PatrolProgressbar.prototype.ngOnDestroy = function () {
        if (this.pauseNoficationTimeout) {
            clearTimeout(this.pauseNoficationTimeout);
        }
    };
    __decorate([
        Input(),
        __metadata("design:type", PatrolInstance)
    ], PatrolProgressbar.prototype, "patrol", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolProgressbar.prototype, "size", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolProgressbar.prototype, "strokeWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolProgressbar.prototype, "hidePauseResumeBtn", void 0);
    PatrolProgressbar = __decorate([
        Component({
            selector: 'patrol-progressbar',
            templateUrl: 'patrol-progressbar.component.html',
            styleUrls: ['patrol-progressbar.component.css']
        }),
        __metadata("design:paramtypes", [PatrolService,
            ChangeDetectorRef,
            PlatformService,
            UserService])
    ], PatrolProgressbar);
    return PatrolProgressbar;
}());
export { PatrolProgressbar };
//# sourceMappingURL=patrol-progressbar.component.js.map