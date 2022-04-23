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
import { PointStatusValues } from '../../patrols/point.class';
import { ActionStatusValues } from '../../patrols/action.class';
import { PatrolService } from '../../patrols/patrol.service';
import { PatrolBuilderService } from '../../patrolBuilder/patrol-builder.service';
import { PatrolMapService, PatrolMapInteractMode } from './patrolMap.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var PatrolMarker = /** @class */ (function () {
    function PatrolMarker(ptrlService, patrolBuilderService, ptrlMapService, changeDetectorRef) {
        this.ptrlService = ptrlService;
        this.patrolBuilderService = patrolBuilderService;
        this.ptrlMapService = ptrlMapService;
        this.changeDetectorRef = changeDetectorRef;
        this.ngUnsubscribe = new Subject();
        this.PointStatusValues = PointStatusValues;
        this.PatrolMapInteractMode = PatrolMapInteractMode;
        this.dragged = false;
        // Click -> Dbl Click facilitation
        this.prevent = false;
        this.delay = 300;
        this.timer = null;
    }
    PatrolMarker.prototype.ngOnInit = function () {
        var _this = this;
        if (!this.patrolService) {
            if (this.iPatrolService)
                this.patrolService = this.iPatrolService;
            else
                this.patrolService = this.ptrlService;
        }
        if (!this.patrolMapService) {
            if (this.iPatrolMapService)
                this.patrolMapService = this.iPatrolMapService;
            else
                this.patrolMapService = this.ptrlMapService;
        }
        // Subscribe to checkpoint upserted events
        this.patrolBuilderService.patrolPointAdded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolPoint) { return _this.patrolModified(); }
        });
        this.patrolBuilderService.patrolPointModified
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolPoint) { return _this.patrolModified(); }
        });
        this.patrolBuilderService.patrolPointRemoved
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (temp) { return _this.patrolModified(); }
        });
        this.patrolBuilderService.patrolPointSelChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (temp) { return _this.patrolModified(); }
        });
        this.patrolMapService.activePatrolSet
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (temp) { return _this.patrolModified(); }
        });
        this.patrolMapService.activePatrolCleared
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (temp) { return _this.patrolModified(); }
        });
        if (this.patrol.IsTemplate === false) {
            this.patrolService.onUpsertInstance
                .takeUntil(this.ngUnsubscribe)
                .subscribe({
                next: function (temp) { return _this.patrolModified(); }
            });
        }
        this.patrolMapService.markerDragged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (marker) { return _this.markerDragged(marker); }
        });
    };
    PatrolMarker.prototype.ngOnChanges = function (changes) {
        if (!this.patrolService) {
            if (this.iPatrolService)
                this.patrolService = this.iPatrolService;
            else
                this.patrolService = this.ptrlService;
        }
        if (!this.patrolMapService) {
            if (this.iPatrolMapService)
                this.patrolMapService = this.iPatrolMapService;
            else
                this.patrolMapService = this.ptrlMapService;
        }
        var endMarker = this.patrolMapService.getPatrolMarker(this.point.PointId);
        if (!endMarker) {
            return;
        }
        if (changes.ordinal && changes.ordinal.currentValue !== changes.ordinal.previousValue) {
            if (endMarker) {
                endMarker.Number = changes.ordinal.currentValue;
            }
        }
        if (changes.pointStatus && changes.pointStatus.currentValue !== changes.pointStatus.previousValue &&
            (changes.pointStatus.currentValue === PointStatusValues.Reached ||
                changes.pointStatus.currentValue === PointStatusValues.NotReached)) {
            if (endMarker.Number > 1) {
                var prevPoint = this.patrol.Points[this.point.Ordinal - 2];
                if (prevPoint) {
                    var startMarker = this.patrolMapService.getPatrolMarker(prevPoint.PointId);
                    if (startMarker) {
                        var polyline = startMarker.PatrolPolyline;
                        var polyOptions = this.patrolMapService.getPathOptions(endMarker);
                        if (changes.pointStatus.currentValue === PointStatusValues.Reached) {
                            polyline.setStyle(polyOptions);
                        }
                        else if (changes.pointStatus.currentValue === PointStatusValues.NotReached) {
                            polyline.setStyle(polyOptions);
                        }
                    }
                }
            }
        }
    };
    PatrolMarker.prototype.ngAfterViewInit = function () {
        this.patrolMapService.addPatrolPointToMap(this.point);
    };
    PatrolMarker.prototype.ngOnDestroy = function () {
        this.patrolMapService.removePatrolPointFromMap(this.point);
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PatrolMarker.prototype.patrolModified = function () {
        this.dirtyToggle = !this.dirtyToggle;
        this.changeDetectorRef.detectChanges();
        this.changeDetectorRef.markForCheck();
    };
    PatrolMarker.prototype.markerDragged = function (marker) {
        this.dragged = true;
    };
    PatrolMarker.prototype.onClick = function (event) {
        var _this = this;
        if (this.dragged === true) {
            this.dragged = false;
            return;
        }
        // Delay click action to allow dblclick to occur
        this.timer = setTimeout(function () {
            if (!_this.prevent) {
                if (!event.ctrlKey) {
                    _this.patrolBuilderService.selectOnlyPatrolPoint(_this.patrol, _this.point.PointId);
                }
                else {
                    _this.patrolBuilderService.selectPatrolPoint(_this.patrol, _this.point.PointId);
                }
                _this.patrolMapService.onMarkerClick(_this.point);
            }
            _this.prevent = false;
        }, 300);
    };
    PatrolMarker.prototype.onDblClick = function (event) {
        this.prevent = true;
        clearTimeout(this.timer);
        if (!event.ctrlKey) {
            this.patrolBuilderService.selectOnlyPatrolPoint(this.patrol, this.point.PointId);
        }
        else {
            this.patrolBuilderService.selectPatrolPoint(this.patrol, this.point.PointId);
        }
        this.patrolBuilderService.notifyPatrolPointEditSelected(this.point);
    };
    //zoomTo(): void {
    //	clearTimeout(this.timer);
    //	this.prevent = true;
    //	this.mapService.zoomToAlarmMarker(this.groupName);
    //	this.alarmService.selectAlarm(this.alarm.Id);
    //}
    //getDescription(): string {
    //	return this.patrol.getDescription();
    //}
    PatrolMarker.prototype.getPointCompletenessColor = function () {
        var color = '#249C49';
        for (var _i = 0, _a = this.point.Actions; _i < _a.length; _i++) {
            var action = _a[_i];
            if (action.CurrentStatus === ActionStatusValues.Failed ||
                action.CurrentStatus === ActionStatusValues.Unsupported) {
                return color = '#E9AB08';
            }
        }
        return color;
    };
    PatrolMarker.prototype.getPointIconSrc = function () {
        if (this.patrol.IsTemplate === true && this.patrolService.isCheckPoint(this.point)) {
            return '/Content/Images/Patrols/checkpoint-patrol-in-progress.png';
        }
        else {
            var pointCurrentStatus = this.patrolService.getPointStatus(this.point, this.patrol.Points);
            var tempStatus = this.patrolService.getPointStatus(this.point, this.patrol.Points);
            if (this.patrolService.isCheckPoint(this.point)) {
                if (pointCurrentStatus === PointStatusValues.Unknown ||
                    pointCurrentStatus === PointStatusValues.InTransit ||
                    (pointCurrentStatus === PointStatusValues.Reached &&
                        tempStatus !== PointStatusValues.ActionsPerformed)) {
                    return '/Content/Images/Patrols/checkpoint-patrol-in-progress.png';
                }
                else if (pointCurrentStatus === PointStatusValues.ActionsPerformed) {
                    var actionStatus = ActionStatusValues.Completed;
                    for (var actionIndex in this.point.Actions) {
                        if (this.point.Actions[actionIndex].CurrentStatus === ActionStatusValues.Unknown ||
                            this.point.Actions[actionIndex].CurrentStatus === ActionStatusValues.Unsupported ||
                            this.point.Actions[actionIndex].CurrentStatus === ActionStatusValues.Failed) {
                            return '/Content/Images/Patrols/checkpoint-failed.png';
                        }
                    }
                    return '/Content/Images/Patrols/checkpoint-patrol-successful.png';
                }
                else if (pointCurrentStatus === PointStatusValues.NotReached) {
                    return '/Content/Images/Patrols/checkpoint-patrol-failed.png';
                }
            }
            else {
                if (pointCurrentStatus === PointStatusValues.NotReached) {
                    return '/Content/Images/Patrols/path-point-failed-to-reach.png';
                }
                else {
                    if (this.point.Ordinal === 1) {
                        return '/Content/Images/Patrols/first-point.png';
                    }
                    else if (this.point.Ordinal !== 1 && this.point.Ordinal === this.patrol.Points.length) {
                        return '/Content/Images/Patrols/last-point.png';
                    }
                    else {
                        return '/Content/Images/Patrols/patrol-point.png';
                    }
                }
            }
        }
    };
    PatrolMarker.prototype.showPointProgressBar = function () {
        var show = false;
        if (this.patrol.IsTemplate === false && this.patrolService.isCheckPoint(this.point) &&
            this.point.CurrentStatus === PointStatusValues.Reached &&
            this.patrolService.getPointStatus(this.point, this.patrol.Points) !== PointStatusValues.ActionsPerformed) {
            show = true;
        }
        return (show);
    };
    PatrolMarker.prototype.showFirstPointOverlay = function () {
        var show = false;
        if (this.point.Ordinal === 1 &&
            (this.patrolMapService.interactMode !== PatrolMapInteractMode.None || this.patrolService.isCheckPoint(this.point))) {
            show = true;
        }
        return show;
    };
    PatrolMarker.prototype.showLastPointOverlay = function () {
        var show = false;
        var lastPoint = this.point.Ordinal !== 1 && this.point.Ordinal === this.patrol.Points.length;
        if (lastPoint &&
            (this.patrolMapService.interactMode !== PatrolMapInteractMode.None || this.patrolService.isCheckPoint(this.point))) {
            show = true;
        }
        return show;
    };
    PatrolMarker.prototype.shouldBlink = function () {
        var blink = false;
        blink = this.patrol.IsTemplate === false && this.point.CurrentStatus === PointStatusValues.InTransit;
        return (blink);
    };
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], PatrolMarker.prototype, "point", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], PatrolMarker.prototype, "patrol", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolMarker.prototype, "pointStatus", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolMarker.prototype, "ordinal", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolMarker.prototype, "selected", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolMarker.prototype, "dirtyToggle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PatrolService)
    ], PatrolMarker.prototype, "iPatrolService", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PatrolMapService)
    ], PatrolMarker.prototype, "iPatrolMapService", void 0);
    PatrolMarker = __decorate([
        Component({
            selector: 'patrol-marker',
            templateUrl: 'patrol-marker.component.html',
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService,
            PatrolBuilderService,
            PatrolMapService,
            ChangeDetectorRef])
    ], PatrolMarker);
    return PatrolMarker;
}());
export { PatrolMarker };
//# sourceMappingURL=patrol-marker.component.js.map