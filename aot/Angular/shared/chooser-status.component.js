var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { PatrolService } from './../patrols/patrol.service';
import { PatrolInstance, PatrolTemplate, PatrolStatusValues } from '../patrols/patrol.class';
import { PlatformService } from './../platforms/platform.service';
import { slideDown } from './animations';
import { ConfirmationDialog } from './confirmation-dialog.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { PlatformCommand, CommandName, Parameter, ParameterName, ParameterType } from './../patrols/action.class';
import { UserService } from './../shared/user.service';
import { Popover } from './popover.component';
import * as moment from 'moment';
var ChooserStatus = /** @class */ (function () {
    function ChooserStatus(patrolService, platformService, ref, userService) {
        this.patrolService = patrolService;
        this.platformService = platformService;
        this.ref = ref;
        this.userService = userService;
        this.showPatrolName = false;
        this.aboutPatrolBtnText = 'Abort';
        this.disabled = false;
        this.showPatrolRunCount = false;
        this.disableDefaultAbout = false;
        this.onAbortClick = new EventEmitter();
        this.onPatrolSelected = new EventEmitter();
        this.onShow = new EventEmitter();
        this.onHide = new EventEmitter();
        this.ngUnsubscribe = new Subject();
        this.PatrolStatusValues = PatrolStatusValues;
        this.nextRunTimer = null;
        this.readyToRun = false;
    }
    ChooserStatus.prototype.reset = function () {
        this.selectedItemID = null;
        this.choosenItemID = null;
        this.runCount = 1;
        this.delay = 0;
        this.infiniteRuns = false;
        this.ref.markForCheck();
    };
    ChooserStatus.prototype.getPatrolTemplateIdForAbort = function () {
        if (this.patrolTemplateID) {
            return this.patrolTemplateID;
        }
        else {
            return this.platformService.getPlatform(this.platformID).PatrolTemplateSubmittedId;
        }
    };
    ChooserStatus.prototype.getPlatformIdForAbort = function () {
        if (this.platformID) {
            return this.platformID;
        }
        else {
            return this.patrolService.getPatrolTemplate(this.patrolTemplateID).PlatformSubmittedId;
        }
    };
    ChooserStatus.prototype.getChooserTypeIconSrc = function () {
        if (!this.platformID) {
            if ((this.patrolInstance || this.isBusy()) && (this.patrolInstance && this.patrolInstance.CurrentStatus !== PatrolStatusValues.Paused))
                return '/Content/Images/Platforms/robot-active.png';
            else
                return '/Content/Images/Platforms/robot-not-active.png';
        }
        else {
            if ((this.patrolInstance || this.isBusy()) && (this.patrolInstance && this.patrolInstance.CurrentStatus !== PatrolStatusValues.Paused))
                return '/Content/Images/Platforms/patrol-active.png';
            else
                return '/Content/Images/Platforms/patrol-not-active.png';
        }
    };
    ChooserStatus.prototype.getModeChooseText = function () {
        if (this.patrolInstance || this.isBusy()) {
            if (this.showPatrolName && this.patrolInstance) {
                return this.patrolInstance.DisplayName;
            }
            else {
                if (this.patrolInstance && this.patrolInstance.CurrentStatus === PatrolStatusValues.Paused) {
                    return 'Patrol Paused';
                }
                else if (!this.patrolInstance ||
                    (this.patrolInstance && this.patrolInstance.CurrentStatus !== PatrolStatusValues.Started)) {
                    return 'Patrol Pending';
                }
                else {
                    return 'On Patrol';
                }
            }
        }
        if (!this.platformID) {
            if (!this.choosenItemID) {
                return 'Choose Robot';
            }
            else {
                return this.platformService.getPlatform(this.choosenItemID).DisplayName;
            }
        }
        else {
            if (this.platfomIsUnavailable()) {
                return 'Choose Patrol';
            }
            else {
                var patrolTemplate = this.patrolService.getPatrolTemplate(this.choosenItemID);
                if (patrolTemplate) {
                    return this.patrolService.getPatrolTemplate(this.choosenItemID).DisplayName;
                }
                else {
                    return 'Choose Patrol';
                }
            }
        }
    };
    ChooserStatus.prototype.isPlatformPending = function () {
        if (this.platformID) {
            return this.platformService.getPlatform(this.platformID).IsPatrolSubmitted;
        }
        return false;
    };
    ChooserStatus.prototype.platfomIsUnavailable = function () {
        if (!this.platformID) {
            return false;
        }
        return !this.platformService.isPlatformAvailable(this.platformService.getPlatform(this.platformID));
    };
    ChooserStatus.prototype.chooserOnClick = function () {
        //this.readyToRun = false;
        if (this.isDropdownShown) {
            this.isDropdownShown = false;
        }
        else {
            event.stopPropagation();
        }
    };
    ChooserStatus.prototype.cancelOnClick = function () {
        //If patrols unselect from map
        if (this.platformID) {
            this.patrolService.toggleSelectedPatrol(this.selectedItemID, false);
        }
        this.selectedItemID = undefined;
        this.choosenItemID = undefined;
        this.isDropdownShown = true;
        this.readyToRun = false;
        this.popover.hide();
    };
    ChooserStatus.prototype.pauseOnClick = function () {
        this.isDropdownShown = true;
        var parameterList = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolInstance.InstanceId, Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.getPlatformIdForAbort(), CommandName.PausePatrol, parameterList));
        this.popover.hide();
    };
    ChooserStatus.prototype.resumeOnClick = function () {
        this.isDropdownShown = true;
        var parameterList = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolInstance.InstanceId, Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.getPlatformIdForAbort(), CommandName.ResumePatrol, parameterList));
        this.popover.hide();
    };
    ChooserStatus.prototype.abortOnClick = function () {
        this.isDropdownShown = true;
        if (!this.disableDefaultAbout) {
            this.abortPatrolConfirm();
        }
        this.popover.hide();
        this.onAbortClick.emit();
    };
    ChooserStatus.prototype.chooseItemOnClick = function () {
        this.choosenItemID = this.selectedItemID;
        this.selectedItemID = undefined;
        this.isDropdownShown = true;
        this.readyToRun = true;
        if (this.patrolTemplateID) {
            this.patrolService.toggleSelectedPatrol(this.patrolTemplateID, true);
        }
        this.executePatrol();
        this.popover.hide();
    };
    ChooserStatus.prototype.onDropDownClick = function () {
        this.selectedItemID = this.choosenItemID;
        this.ref.markForCheck();
    };
    ChooserStatus.prototype.toggleInfinite = function (toggleState) {
        this.infiniteRuns = toggleState;
    };
    ChooserStatus.prototype.showMoreOptions = function () {
        if (this.runCount > 1 || this.infiniteRuns) {
            return 'out';
        }
        else {
            return 'in';
        }
    };
    ChooserStatus.prototype.ngOnInit = function () {
        var _this = this;
        this.id = this.createGUID();
        this.delay = 0;
        this.runCount = 1;
        this.isDropdownShown = false;
        this.infiniteRuns = false;
        if (this.platformID) {
            this.patrolService.onUpsertInstance
                .takeUntil(this.ngUnsubscribe)
                .subscribe({ next: function (patrolInstance) { return _this.ref.markForCheck(); } });
            this.patrolService.onUpsertTemplate
                .takeUntil(this.ngUnsubscribe)
                .subscribe({ next: function (patrolTemplate) { return _this.ref.markForCheck(); } });
        }
        else {
            this.platformService.onNewPlatform
                .takeUntil(this.ngUnsubscribe)
                .subscribe({ next: function (platform) { return _this.ref.markForCheck(); } });
        }
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({ next: function (Platform) { return _this.ref.detectChanges(); } });
    };
    ChooserStatus.prototype.executePatrol = function () {
        if (!this.readyToRun) {
            return;
        }
        if (this.platformID) {
            var patrolTemplate = new PatrolTemplate(this.patrolService.getPatrolTemplate(this.choosenItemID));
            patrolTemplate.RunSetData = {
                TotalRunNumber: (this.infiniteRuns) ? -1 : this.runCount,
                Delay: this.delay,
                CurrentRunNumber: null,
                NextRun: null,
                RunSetId: null
            };
            this.patrolService.executePatrol(this.platformID, patrolTemplate);
        }
        else {
            var patrolTemplate = new PatrolTemplate(this.patrolService.getPatrolTemplate(this.patrolTemplateID));
            patrolTemplate.RunSetData = {
                TotalRunNumber: (this.infiniteRuns) ? -1 : this.runCount,
                Delay: this.delay,
                CurrentRunNumber: null,
                NextRun: null,
                RunSetId: null
            };
            this.patrolService.executePatrol(this.choosenItemID, patrolTemplate);
        }
    };
    ChooserStatus.prototype.abortPatrolConfirm = function () {
        this.popover.hide();
        this.confirmAbort.show();
    };
    ChooserStatus.prototype.getButtonTooltip = function () {
        if (this.patrolInstance || this.isBusy())
            return 'Click abort to stop current patrol';
        else
            return '';
    };
    ChooserStatus.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    ChooserStatus.prototype.getPatrolStatusText = function () {
        var _this = this;
        var patrolTemplate = null;
        if (this.platformID) {
            patrolTemplate = this.patrolService.getPatrolTemplate(this.platformService.getPlatform(this.platformID).PatrolTemplateSubmittedId);
        }
        if (!patrolTemplate) {
            if (this.platformID) {
                return this.platformService.getStateText(this.platformService.getPlatform(this.platformID));
            }
            return null;
        }
        if (patrolTemplate.RunSetData) {
            //In the delay
            if (patrolTemplate.RunSetData.NextRun !== null) {
                clearTimeout(this.nextRunTimer);
                this.nextRunTimer = setTimeout(function () {
                    _this.ref.markForCheck();
                }, 60000);
                return 'Next Run ' + moment.utc(patrolTemplate.RunSetData.NextRun).local().fromNow();
            }
            else {
                //In pending
                return 'Patrol Run ' + patrolTemplate.RunSetData.CurrentRunNumber + ' of ' + ((patrolTemplate.RunSetData.TotalRunNumber === -1) ? 'infinite' : patrolTemplate.RunSetData.TotalRunNumber.toString());
            }
        }
        else {
            //This should just be for legacy patrol
            return 'Patrol Run 1 of 1';
        }
    };
    ChooserStatus.prototype.createGUID = function () {
        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var cryptoObj = window.crypto;
            var r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return guid;
    };
    ChooserStatus.prototype.validateInput = function (event) {
        var pattern = /[0-9\+]/;
        var currentInputChar = String.fromCharCode(event.charCode);
        var inputChar = String.fromCharCode(event.charCode);
        if (!pattern.test(inputChar))
            event.preventDefault();
    };
    ChooserStatus.prototype.isBusy = function () {
        var isBusy = false;
        if (this.patrolTemplateID && this.patrolService.getPatrolTemplate(this.patrolTemplateID).IsPatrolSubmitted) {
            isBusy = true;
        }
        var platform = this.platformService.getPlatform(this.platformID);
        if (this.platformID && platform.IsPatrolSubmitted) {
            isBusy = true;
        }
        return isBusy;
    };
    ChooserStatus.prototype.stopEvents = function (event) {
        event.stopPropagation();
    };
    ChooserStatus.prototype.showRunOptions = function () {
        if (this.patrolTemplateID) {
            if (this.platformService.getAvailablePlatforms(this.patrolService.getPatrolTemplate(this.patrolTemplateID).LocationId).length > 0) {
                return true;
            }
        }
        else {
            if (this.patrolService.getAvailablePatrols(this.platformService.getPlatform(this.platformID)).length > 0) {
                return true;
            }
        }
        return false;
    };
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], ChooserStatus.prototype, "platformID", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], ChooserStatus.prototype, "patrolTemplateID", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PatrolInstance)
    ], ChooserStatus.prototype, "patrolInstance", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], ChooserStatus.prototype, "showPatrolName", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], ChooserStatus.prototype, "runCount", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], ChooserStatus.prototype, "delay", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], ChooserStatus.prototype, "infiniteRuns", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], ChooserStatus.prototype, "aboutPatrolBtnText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], ChooserStatus.prototype, "disabled", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], ChooserStatus.prototype, "showPatrolRunCount", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], ChooserStatus.prototype, "disableDefaultAbout", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], ChooserStatus.prototype, "onAbortClick", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], ChooserStatus.prototype, "onPatrolSelected", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], ChooserStatus.prototype, "onShow", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], ChooserStatus.prototype, "onHide", void 0);
    __decorate([
        ViewChild(ConfirmationDialog),
        __metadata("design:type", ConfirmationDialog)
    ], ChooserStatus.prototype, "confirmAbort", void 0);
    __decorate([
        ViewChild('popoverBox'),
        __metadata("design:type", Popover)
    ], ChooserStatus.prototype, "popover", void 0);
    __decorate([
        ViewChild('popoverTarget'),
        __metadata("design:type", ElementRef)
    ], ChooserStatus.prototype, "popoverTarget", void 0);
    ChooserStatus = __decorate([
        Component({
            selector: 'chooser-status',
            templateUrl: 'chooser-status.component.html',
            styleUrls: ['chooser-status.component.css'],
            animations: [slideDown],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService,
            PlatformService,
            ChangeDetectorRef,
            UserService])
    ], ChooserStatus);
    return ChooserStatus;
}());
export { ChooserStatus };
//# sourceMappingURL=chooser-status.component.js.map