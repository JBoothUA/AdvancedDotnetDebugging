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
import { AlarmService } from './alarm.service';
import { PlatformService } from '../platforms/platform.service';
import { Alarm } from './alarm.class';
import { slideDown } from '../shared/animations';
import { MediaService } from '../shared/media/media.service';
var AlarmDetails = /** @class */ (function () {
    function AlarmDetails(alarmService, platformService, mediaService, changeDetectorRef) {
        this.alarmService = alarmService;
        this.platformService = platformService;
        this.mediaService = mediaService;
        this.changeDetectorRef = changeDetectorRef;
        this.showComments = true;
        this.showHistory = true;
        this.showImages = true;
        this.alarmHistory = [];
        this.sortProperty = 'Timestamp';
        this.sortDesc = false;
        this.alarmSensors = [];
        this.ngUnsubscribe = new Subject();
    }
    AlarmDetails.prototype.ngOnInit = function () {
        var _this = this;
        this.alarmService.editedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) {
                if (alarm.Id === _this.alarm.Id) {
                    _this.alarmHistory = _this.getAlarmHistory();
                    _this.changeDetectorRef.detectChanges();
                }
            }
        });
        this.mediaService.selectedImageChangedSub
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (correlationId) {
                if (correlationId === _this.alarm.Id) {
                    _this.changeDetectorRef.detectChanges();
                }
            }
        });
        // Build the sensor list, starting with the triggering sensor
        if (this.alarm.Sensor) {
            this.alarmSensors.push(this.alarm.Sensor);
        }
        if (this.alarm.Sensors) {
            this.alarmSensors = this.alarmSensors.concat(this.alarm.Sensors);
        }
        this.alarmHistory = this.getAlarmHistory();
    };
    AlarmDetails.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    AlarmDetails.prototype.getPriorityDisplayName = function () {
        return this.alarmService.convertPriorityName(this.alarm.Priority);
    };
    AlarmDetails.prototype.getSnapshotsCount = function () {
        if (!this.alarm.Snapshots) {
            return 0;
        }
        return this.alarm.Snapshots.length;
    };
    AlarmDetails.prototype.getCommentCount = function () {
        if (!this.alarm.Comments) {
            return 0;
        }
        return this.alarm.Comments.length;
    };
    AlarmDetails.prototype.sortAlarmHistory = function (sortProperty) {
        var _this = this;
        if (this.sortProperty === sortProperty) {
            this.sortDesc = !this.sortDesc;
        }
        else {
            this.sortProperty = sortProperty;
            this.sortDesc = false;
        }
        if (this.sortProperty === 'Timestamp') {
            this.alarmHistory.sort(function (a, b) {
                return _this.sortDesc
                    ? new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
                    : new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime();
            });
            return;
        }
        this.alarmHistory.sort(function (a, b) {
            var order = 0;
            if (a[_this.sortProperty] < b[_this.sortProperty]) {
                order = -1;
            }
            else if (a[_this.sortProperty] > b[_this.sortProperty]) {
                order = 1;
            }
            if (_this.sortDesc) {
                order = order * -1;
            }
            return order;
        });
    };
    AlarmDetails.prototype.getAlarmHistory = function () {
        var alarmHistory = (this.alarm.Comments || []).map(function (comment) {
            return { Action: 'Comment Added', UserId: comment.UserId, Timestamp: comment.Timestamp };
        });
        if (this.alarm.Created) {
            var state = this.alarm.Created;
            var platform = this.platformService.getPlatform(this.alarm.PlatformId);
            var history_1 = { Action: 'Created', UserId: platform ? platform.DisplayName : this.alarm.PlatformId, Timestamp: state.Timestamp };
            alarmHistory.push(history_1);
        }
        if (this.alarm.Acknowledged) {
            var state = this.alarm.Acknowledged;
            var history_2 = { Action: 'Acknowledged', UserId: state.UserId, Timestamp: state.Timestamp };
            alarmHistory.push(history_2);
        }
        if (this.alarm.Cleared) {
            var state = this.alarm.Cleared;
            var history_3 = { Action: 'Cleared', UserId: state.UserId, Timestamp: state.Timestamp };
            alarmHistory.push(history_3);
        }
        if (this.alarm.Dismissed) {
            var state = this.alarm.Dismissed;
            var history_4 = { Action: 'Dismissed', UserId: state.UserId, Timestamp: state.Timestamp };
            alarmHistory.push(history_4);
        }
        alarmHistory.sort(function (a, b) {
            return new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime();
        });
        return alarmHistory;
    };
    AlarmDetails.prototype.addComment = function (comment) {
        if (!comment) {
            return;
        }
        this.alarmService.addComment(this.alarm.Id, comment);
        this.alarm.NewComment = null;
    };
    AlarmDetails.prototype.toggleExpandedImages = function () {
        this.alarm.ExpandedImages = this.alarm.ExpandedImages === 'out' ? 'in' : 'out';
    };
    AlarmDetails.prototype.toggleExpandedComments = function () {
        this.alarm.ExpandedComments = this.alarm.ExpandedComments === 'out' ? 'in' : 'out';
    };
    AlarmDetails.prototype.toggleExpandedHistory = function () {
        this.alarm.ExpandedHistory = this.alarm.ExpandedHistory === 'out' ? 'in' : 'out';
    };
    AlarmDetails.prototype.selectImage = function (uri) {
        for (var index in this.alarm.Snapshots) {
            this.alarm.Snapshots[index].Selected = this.alarm.Snapshots[index].Uri === uri;
        }
        var imageTitle = 'Image Viewer - ' + this.alarm.Description + ' Alarm (P' + this.alarm.Priority + ')';
        this.mediaService.openImageViewer(this.alarm.Id, this.alarm.Snapshots, btoa(imageTitle));
    };
    __decorate([
        Input(),
        __metadata("design:type", Alarm)
    ], AlarmDetails.prototype, "alarm", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AlarmDetails.prototype, "showComments", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AlarmDetails.prototype, "showHistory", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AlarmDetails.prototype, "showImages", void 0);
    AlarmDetails = __decorate([
        Component({
            selector: 'alarm-details',
            templateUrl: 'alarm-details.component.html',
            animations: [
                slideDown
            ],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [AlarmService, PlatformService, MediaService, ChangeDetectorRef])
    ], AlarmDetails);
    return AlarmDetails;
}());
export { AlarmDetails };
//# sourceMappingURL=alarm-details.component.js.map