var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectorRef, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { isAlarm } from './../alarms/alarm.class';
import { PointStatusValues, isPointInstance, isPointTemplate } from './point.class';
import { ActionStatusValues } from './action.class';
import { PatrolService } from './patrol.service';
import { PatrolInstance, PatrolStatusValues } from './patrol.class';
import { MediaService } from './../shared/media/media.service';
import { SortType } from './../shared/shared-interfaces';
import * as moment from 'moment';
function isPointInstanceList(arg) {
    if (arg.length && isPointInstance(arg[0])) {
        return true;
    }
    else {
        return false;
    }
}
var PatrolPlan = /** @class */ (function () {
    function PatrolPlan(patrolService, mediaService, ref) {
        this.patrolService = patrolService;
        this.mediaService = mediaService;
        this.ref = ref;
        this.patrolPoints = [];
        this.alarms = []; //Only used for running plans
        this.sortType = SortType.Desc;
        this.showPathPoints = false;
        this.onExpandedPoint = new EventEmitter();
        this.onCollapsePoint = new EventEmitter();
        this.pointCount = 0;
        this.pointIds = [];
        this.PointStatusValues = PointStatusValues;
        this.ActionStatusValues = ActionStatusValues;
        this.PatrolStatusValues = PatrolStatusValues;
        this.expandedActionItem = [];
        this.currentCheckpointColor = '#249C49';
        this.SortType = SortType;
    }
    PatrolPlan.prototype.expandAll = function () {
        this.expandedActionItem = this.pointIds.slice(0);
        this.ref.detectChanges();
    };
    PatrolPlan.prototype.collapseAll = function () {
        this.expandedActionItem = [];
        this.ref.detectChanges();
    };
    PatrolPlan.prototype.showExpandAll = function () {
        return this.pointIds.length > 0 && this.pointIds.length !== this.expandedActionItem.length;
    };
    PatrolPlan.prototype.showCollapseAll = function () {
        return this.pointIds.length > 0 && !this.showExpandAll();
    };
    PatrolPlan.prototype.refresh = function () {
        this.ref.detectChanges();
    };
    PatrolPlan.prototype.getPoints = function () {
        var _this = this;
        this.pointIds = [];
        var pointList = [];
        //Process Patrol Points
        if (isPointInstanceList(this.patrolPoints)) {
            pointList = this.patrolPoints.filter(function (point) {
                if (_this.showPathPoints) {
                    if (point.CurrentStatus !== PointStatusValues.Unknown) {
                        if (_this.patrolService.isCheckPoint(point)) {
                            _this.pointIds.push(point.PointId);
                        }
                        return true;
                    }
                    return false;
                }
                else if ((_this.patrolService.isCheckPoint(point) &&
                    point.CurrentStatus !== PointStatusValues.Unknown) ||
                    point.CurrentStatus === PointStatusValues.NotReached) {
                    _this.pointIds.push(point.PointId);
                    return true;
                }
                else {
                    return false;
                }
            });
        }
        else {
            pointList = this.patrolPoints.filter(function (point) {
                if (_this.showPathPoints || _this.patrolService.isCheckPoint(point)) {
                    if (_this.patrolService.isCheckPoint(point)) {
                        _this.pointIds.push(point.PointId);
                    }
                    return true;
                }
                return false;
            });
        }
        //Process Alarms
        for (var _i = 0, _a = this.alarms; _i < _a.length; _i++) {
            var alarm = _a[_i];
            pointList.push(alarm);
            this.pointIds.push(alarm.Id);
        }
        //Sort List
        pointList.sort(function (a, b) {
            var aDateTime;
            var bDateTime;
            var isAPatrol = false;
            var isBPatrol = false;
            if (isAlarm(a)) {
                aDateTime = a.Created.Timestamp.toString();
            }
            else if (isPointInstance(a)) {
                aDateTime = _this.getActionsCompletedTime(a);
                isAPatrol = true;
            }
            else if (isPointTemplate(a)) {
                isAPatrol = true;
            }
            if (isAlarm(b)) {
                bDateTime = b.Created.Timestamp.toString();
            }
            else if (isPointInstance(b)) {
                bDateTime = _this.getActionsCompletedTime(b);
                isBPatrol = true;
            }
            else if (isPointTemplate(b)) {
                isBPatrol = true;
            }
            if (isAPatrol && isBPatrol) {
                return a.Ordinal - b.Ordinal;
            }
            var aTime;
            if (!isAPatrol) {
                aTime = new Date(aDateTime).getTime();
            }
            else {
                aTime = parseInt(aDateTime);
            }
            var bTime;
            if (!isBPatrol) {
                bTime = new Date(bDateTime).getTime();
            }
            else {
                bTime = parseInt(bDateTime);
            }
            return ((!isNaN(bTime) ? bTime : 0) - (!isNaN(aTime) ? aTime : 0));
        });
        this.pointCount = pointList.length;
        return pointList;
    };
    PatrolPlan.prototype.getActionHeaderStatusClass = function (point) {
        if (isPointInstance(point)) {
            switch (this.patrolService.getPointStatus(point, this.patrolInstance.Points)) {
                case PointStatusValues.Reached:
                    return 'in-progress';
                case PointStatusValues.ActionsPerformed:
                    //Check the status of all the actions
                    var status_1 = ActionStatusValues.Completed;
                    for (var _i = 0, _a = point.Actions; _i < _a.length; _i++) {
                        var action = _a[_i];
                        if (action.CurrentStatus === ActionStatusValues.Failed ||
                            action.CurrentStatus === ActionStatusValues.Unknown ||
                            action.CurrentStatus === ActionStatusValues.Unsupported) {
                            status_1 = ActionStatusValues.Failed;
                            break;
                        }
                    }
                    if (status_1 === ActionStatusValues.Completed) {
                        return 'completed';
                    }
                    else if (status_1 === ActionStatusValues.Failed) {
                        return 'failed';
                    }
                case PointStatusValues.NotReached:
                    return 'failed';
                default:
                    return '';
            }
        }
        else {
            return '';
        }
    };
    PatrolPlan.prototype.toggleExpandedActionView = function (pointID) {
        try {
            event.stopPropagation();
        }
        catch (e) {
            console.warn(e);
        }
        if (this.expandedActionItem.includes(pointID)) {
            this.expandedActionItem.splice(this.expandedActionItem.indexOf(pointID), 1);
        }
        else {
            this.expandedActionItem.push(pointID);
        }
    };
    PatrolPlan.prototype.getTimeSince = function (dateTime, extraText) {
        if (extraText === void 0) { extraText = ''; }
        if (!this.patrolInstance) {
            return '';
        }
        var tempDate;
        if (isNaN(dateTime)) {
            tempDate = moment(dateTime).toDate();
        }
        else {
            tempDate = moment.utc(parseInt(dateTime)).local().toDate();
        }
        var result = moment.duration(moment().diff(tempDate)).humanize();
        if (result.includes('second')) {
            return 'now';
        }
        if (result.includes('month') || result.includes('year')) {
            return moment(tempDate).format('MM/DD/YY hh:mma');
        }
        result = result.replace('hour', 'hr');
        result = result.replace('minute', 'min');
        result = result.replace('an ', '1 ');
        result = result.replace('a ', '1 ');
        return result + ' ' + extraText;
    };
    PatrolPlan.prototype.getActionsCompletedTime = function (point) {
        if (point.CurrentStatus === PointStatusValues.Reached) {
            if (point.StatusHistory) {
                for (var _i = 0, _a = point.StatusHistory; _i < _a.length; _i++) {
                    var status_2 = _a[_i];
                    if (status_2.Status === PointStatusValues.Reached) {
                        return status_2.ReportedTime.toString();
                    }
                }
            }
        }
        if (point.StatusHistory) {
            for (var _b = 0, _c = point.StatusHistory; _b < _c.length; _b++) {
                var status_3 = _c[_b];
                if (status_3.Status === PointStatusValues.NotReached) {
                    return status_3.ReportedTime.toString();
                }
            }
        }
        return undefined;
    };
    PatrolPlan.prototype.getPointBorderClass = function (point) {
        if (isPointInstance(point)) {
            switch (this.patrolService.getPointStatus(point, this.patrolInstance.Points)) {
                case PointStatusValues.NotReached:
                case PointStatusValues.InTransit:
                    return 'dashed-line';
                case PointStatusValues.ActionsPerformed:
                case PointStatusValues.Reached:
                default:
                    return 'solid-line';
            }
        }
        return 'solid-line';
    };
    PatrolPlan.prototype.expandedActionViewState = function (pointID) {
        if (pointID && this.expandedActionItem.includes(pointID)) {
            return 'out';
        }
        return 'in';
    };
    PatrolPlan.prototype.getActionHeaderStatusText = function (point) {
        if (isPointInstance(point)) {
            switch (this.patrolService.getPointStatus(point, this.patrolInstance.Points)) {
                case PointStatusValues.Reached:
                    var actionPhase = '';
                    var ordinalSuffixOf = '';
                    for (var action in point.Actions) {
                        if (point.Actions[action].CurrentStatus === ActionStatusValues.Started) {
                            actionPhase = this.getDisplayActionPhase(point.Actions[action]);
                            ordinalSuffixOf = this.getOrdinalSuffixOf(parseInt(action) + 1);
                        }
                    }
                    return ordinalSuffixOf + ' Action - ' + actionPhase;
            }
        }
        return point.Actions.length + ((point.Actions.length) > 1 ? ' Actions' : ' Action');
    };
    PatrolPlan.prototype.getDisplayActionPhase = function (action) {
        if (!action.Command)
            return '';
        return this.patrolService.getActionPhraseString(action);
    };
    PatrolPlan.prototype.getActionHeaderDescription = function (point) {
        if (isPointInstance(point)) {
            switch (this.patrolService.getPointStatus(point, this.patrolInstance.Points)) {
                case PointStatusValues.Reached:
                    return '(In Progress)';
                case PointStatusValues.ActionsPerformed:
                    var status_4 = ActionStatusValues.Completed;
                    for (var _i = 0, _a = point.Actions; _i < _a.length; _i++) {
                        var action = _a[_i];
                        if (action.CurrentStatus === ActionStatusValues.Failed ||
                            action.CurrentStatus === ActionStatusValues.Unknown ||
                            action.CurrentStatus === ActionStatusValues.Unsupported) {
                            status_4 = ActionStatusValues.Failed;
                            break;
                        }
                    }
                    if (status_4 === ActionStatusValues.Completed) {
                        return '(Complete)';
                    }
                    else if (status_4 === ActionStatusValues.Failed) {
                        return '(Failed)';
                    }
                case PointStatusValues.NotReached:
                    return '(Failed)';
                case PointStatusValues.InTransit:
                    return '(In Transit)';
                default:
                    return '';
            }
        }
        return '';
    };
    PatrolPlan.prototype.getActionStatusText = function (action, isNotReached) {
        if (!isNotReached) {
            switch (action.CurrentStatus) {
                case ActionStatusValues.Completed:
                    return 'Complete';
                case ActionStatusValues.Failed:
                    return 'Failed';
                case ActionStatusValues.Unknown:
                    return 'Pending';
                case ActionStatusValues.Unsupported:
                    return 'Unsupported';
                case ActionStatusValues.Started:
                    return 'In Progress';
                default:
                    return '';
            }
        }
        else {
            return 'Failed';
        }
    };
    PatrolPlan.prototype.getActionStatusIconSrc = function (action, pointStatus) {
        if (pointStatus !== PointStatusValues.NotReached) {
            switch (action.CurrentStatus) {
                case ActionStatusValues.Completed:
                    return './../Content/Images/Patrols/patrol-last-successful.png';
                case ActionStatusValues.Failed:
                    return './../Content/Images/Patrols/action-failed.png';
                case ActionStatusValues.Unknown:
                    return './../Content/Images/Patrols/action-pending.png';
                case ActionStatusValues.Unsupported:
                    return './../Content/Images/Patrols/action-failed.png';
                case ActionStatusValues.Started:
                    return './../Content/Images/loading-spinner-grey.gif';
                default:
                    return './../Content/Images/Patrols/action-pending.png';
            }
        }
        else {
            this.currentCheckpointColor = '#E9AB08';
            return './../Content/Images/Patrols/action-failed.png';
        }
    };
    PatrolPlan.prototype.getActionOrder = function (currentIndex, maxLength, sortOrder) {
        if (sortOrder === SortType.Asc) {
            return currentIndex + 1;
        }
        else {
            return Math.abs(currentIndex - maxLength);
        }
    };
    PatrolPlan.prototype.isAlarmPoint = function (arg) {
        if (isAlarm(arg))
            return true;
        else
            return false;
    };
    PatrolPlan.prototype.getAlarmClass = function (alarm) {
        switch (alarm.State) {
            case 1:
            case 4:
                return '';
            case 2:
                return 'no-issue';
            case 3:
                return 'completed';
        }
    };
    PatrolPlan.prototype.getAlarmStatusHeader = function (alarm) {
        switch (alarm.State) {
            case 1:
                return 'Reported';
            case 2:
                return 'Acknowledged';
            case 3:
                return 'Cleared';
            case 4:
                return 'Dismissed';
        }
    };
    PatrolPlan.prototype.getAlarmStatusTimeStamp = function (alarm) {
        switch (alarm.State) {
            case 1:
                return this.getTimeSince(alarm.Created.Timestamp, 'ago');
            case 2:
                return this.getTimeSince(alarm.Acknowledged.Timestamp, 'ago');
            case 3:
                return this.getTimeSince(alarm.Cleared.Timestamp, 'ago');
            case 4:
                return this.getTimeSince(alarm.Dismissed.Timestamp, 'ago');
        }
    };
    PatrolPlan.prototype.selectImage = function (uri, alarm) {
        for (var index in alarm.Snapshots) {
            alarm.Snapshots[index].Selected = alarm.Snapshots[index].Uri === uri;
        }
        var imageTitle = 'Image Viewer - ' + alarm.Description + ' Alarm (P' + alarm.Priority + ')';
        this.mediaService.openImageViewer(alarm.Id, alarm.Snapshots, btoa(imageTitle));
    };
    PatrolPlan.prototype.selectActionImage = function (uri, action) {
        for (var index in action.Images) {
            action.Images[index].Selected = action.Images[index].Uri === uri;
        }
        var imageTitle = 'Image Viewer';
        this.mediaService.openImageViewer(action.ActionId, action.Images, btoa(imageTitle));
    };
    PatrolPlan.prototype.getBracketText = function (point) {
        if (isPointTemplate(point)) {
            if (this.patrolService.isCheckPoint(point) && this.showPathPoints) {
                return ' (Point ' + point.Ordinal + ')';
            }
        }
        if (isPointInstance(point)) {
            if (this.patrolService.isCheckPoint(point) && this.showPathPoints) {
                if (point.CurrentStatus && point.CurrentStatus === PointStatusValues.NotReached) {
                    return ' (Point ' + point.Ordinal + ', Not Reached)';
                }
                else {
                    return ' (Point ' + point.Ordinal + ')';
                }
            }
            else {
                if (point.CurrentStatus && point.CurrentStatus === PointStatusValues.NotReached) {
                    return ' (Not Reached)';
                }
            }
        }
        return '';
    };
    PatrolPlan.prototype.showInTransit = function (point) {
        if (this.patrolInstance && (this.patrolInstance.CurrentStatus.valueOf() !== PatrolStatusValues.Started && this.patrolInstance.CurrentStatus.valueOf() !== PatrolStatusValues.Resumed)) {
            return false;
        }
        if (point.CurrentStatus === PointStatusValues.InTransit) {
            return true;
        }
        return false;
    };
    PatrolPlan.prototype.getOrdinalSuffixOf = function (i) {
        var j = i % 10, k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    };
    PatrolPlan.prototype.hasSnapshots = function (point) {
        for (var _i = 0, _a = point.Actions; _i < _a.length; _i++) {
            var action = _a[_i];
            if (action.HasSnapshots) {
                return true;
            }
        }
        return false;
    };
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], PatrolPlan.prototype, "patrolPoints", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PatrolInstance)
    ], PatrolPlan.prototype, "patrolInstance", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], PatrolPlan.prototype, "alarms", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolPlan.prototype, "sortType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolPlan.prototype, "showPathPoints", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], PatrolPlan.prototype, "onExpandedPoint", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], PatrolPlan.prototype, "onCollapsePoint", void 0);
    PatrolPlan = __decorate([
        Component({
            selector: 'patrol-plan',
            templateUrl: 'patrol-plan.component.html',
            styleUrls: ['patrol-plan.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService,
            MediaService,
            ChangeDetectorRef])
    ], PatrolPlan);
    return PatrolPlan;
}());
export { PatrolPlan };
//# sourceMappingURL=patrol-plan.component.js.map