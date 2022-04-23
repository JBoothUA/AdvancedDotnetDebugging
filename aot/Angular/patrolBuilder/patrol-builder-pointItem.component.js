var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, Output, NgZone, ElementRef, ViewChild, EventEmitter } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { PatrolTemplate } from '../patrols/patrol.class';
import { PointTemplate } from '../patrols/point.class';
import { ActionType, CommandName } from '../patrols/action.class';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolMapService, PatrolMapInteractMode } from './../map/patrols/patrolMap.service';
import { PatrolBuilderService } from './patrol-builder.service';
import { slideDown } from '../shared/animations';
import { ConfirmationDialog } from './../shared/confirmation-dialog.component';
var PatrolBuilderPointItem = /** @class */ (function () {
    function PatrolBuilderPointItem(patrolService, patrolBuilderService, patrolMapService, changeRef, ngZone) {
        this.patrolService = patrolService;
        this.patrolBuilderService = patrolBuilderService;
        this.patrolMapService = patrolMapService;
        this.changeRef = changeRef;
        this.ngZone = ngZone;
        this.onToggleActionGroup = new EventEmitter();
        this.ngUnsubscribe = new Subject();
    }
    PatrolBuilderPointItem.prototype.ngOnInit = function () {
        var _this = this;
        this.expandedState = this.expandedState || 'in';
        this.delay = 250;
        this.prevent = false;
        this.timer = null;
        this.editDescription = false;
        // Subscribe to checkpoint add,update, and deleted events
        this.patrolBuilderService.patrolPointSelChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (temp) { return _this.patrolPointsModified(); }
        });
        this.patrolBuilderService.patrolPointAdded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (temp) { return _this.patrolPointsModified(); }
        });
        this.patrolBuilderService.patrolPointModified
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolPoint) { return _this.patrolPointsModified(); }
        });
        this.patrolBuilderService.patrolPointRemoved
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (temp) { return _this.patrolPointsModified(); }
        });
    };
    PatrolBuilderPointItem.prototype.ngOnChanges = function (changes) {
        //console.log('patrolBuilderPointItem changed');
    };
    PatrolBuilderPointItem.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PatrolBuilderPointItem.prototype.patrolPointsModified = function () {
        this.changeRef.detectChanges();
    };
    PatrolBuilderPointItem.prototype.editPointDescriptionInline = function (event) {
        var _this = this;
        event.stopPropagation();
        this.editDescription = true;
        this.patrolPoint.Selected = true;
        this.changeRef.detectChanges();
        this.ngZone.runOutsideAngular(function () { setTimeout(function () { _this.locDescInput.nativeElement.focus(); }, 100); });
    };
    PatrolBuilderPointItem.prototype.finishEditPointDescriptionInline = function () {
        this.editDescription = false;
        this.changeRef.detectChanges();
    };
    PatrolBuilderPointItem.prototype.getBackgroundStyle = function (patrolPoint) {
        if (patrolPoint.Ordinal === 1 && this.patrolService.isCheckPoint(patrolPoint) === false) {
            return ('../../Content/Images/Patrols/first-point.png');
        }
        else if (patrolPoint.Actions && this.patrolService.isCheckPoint(patrolPoint)) {
            return ('../../Content/Images/Patrols/checkpoint-icon.png');
        }
        else if (patrolPoint.Ordinal === this.patrol.Points.length && !this.patrolService.isCheckPoint(patrolPoint)) {
            return ('../../Content/Images/Patrols/last-point.png');
        }
        else {
            return ('../../Content/Images/Patrols/patrol-point.png');
        }
    };
    PatrolBuilderPointItem.prototype.getActionCommandDisplayName = function (action) {
        var actDef = this.patrolService.getActionDefinition(action);
        var displayName = actDef ? actDef.DisplayName : 'Unknown Action';
        return (displayName);
    };
    PatrolBuilderPointItem.prototype.getActionPhraseString = function (action) {
        var actDef = this.patrolService.getActionDefinition(action);
        var retStr = '';
        if (actDef) {
            switch (actDef.ActionType) {
                case ActionType.Toggle: {
                    if (action.Command === actDef.Command[0])
                        retStr = 'Off';
                    else
                        retStr = 'On';
                    break;
                }
                case ActionType.Dwell: {
                    if (action.Parameters && action.Parameters.length > 0) {
                        var res = parseInt(action.Parameters[0].Value);
                        var mins = res / 60;
                        var secs = res % 60;
                        retStr = (secs === 0 ? mins.toString() + ' minutes' : res.toString() + ' seconds');
                    }
                    break;
                }
                case ActionType.Play: {
                    if (action.Parameters && action.Parameters.length > 0) {
                        retStr = action.Parameters[0].Value;
                    }
                    break;
                }
                case ActionType.Say: {
                    if (action.Parameters && action.Parameters.length > 0) {
                        retStr = action.Parameters[0].Value;
                    }
                    break;
                }
                case ActionType.Command:
                case ActionType.Orient: {
                    if (action.Command === CommandName.OrientPlatform) {
                        retStr = action.Parameters[0].Value.toString() + ' degrees';
                    }
                    else if (action.Parameters && action.Parameters.length > 0) {
                        retStr = action.Parameters[0].Value.toString();
                    }
                    break;
                }
                case ActionType.Volume: {
                    retStr = action.Parameters[0].Value.toString() + ' percent';
                    break;
                }
                default: {
                    retStr = '';
                }
            }
        }
        if (retStr !== '') {
            retStr = ':  ' + retStr;
        }
        return (retStr);
    };
    PatrolBuilderPointItem.prototype.toggleExpandedGroup = function () {
        this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
        this.changeRef.markForCheck();
        this.onToggleActionGroup.emit(this.expandedState);
    };
    PatrolBuilderPointItem.prototype.onClick = function (event) {
        var _this = this;
        // Delay click action to allow dblclick to occur
        this.timer = setTimeout(function () {
            if (!_this.prevent) {
                _this.selectPoint(event);
            }
            _this.prevent = false;
        }, this.delay);
    };
    PatrolBuilderPointItem.prototype.selectPoint = function (event) {
        if (this.patrolPoint.Selected) {
            if (event.ctrlKey) {
                this.patrolBuilderService.deselectPatrolPoint(this.patrol, this.patrolPoint.PointId);
            }
            else {
                // if more than one alarm is selected, only select this one
                if (this.patrolBuilderService.getSelectedPatrolPointCount(this.patrol) > 1) {
                    this.patrolBuilderService.selectOnlyPatrolPoint(this.patrol, this.patrolPoint.PointId);
                }
                else {
                    // This is the only alarm selected, so deselect it
                    this.patrolBuilderService.deselectPatrolPoint(this.patrol, this.patrolPoint.PointId);
                }
            }
        }
        else {
            if (!event.ctrlKey) {
                this.patrolBuilderService.selectOnlyPatrolPoint(this.patrol, this.patrolPoint.PointId);
            }
            else {
                this.patrolBuilderService.selectPatrolPoint(this.patrol, this.patrolPoint.PointId);
            }
        }
    };
    PatrolBuilderPointItem.prototype.onDblClick = function (event) {
        this.prevent = true;
        clearTimeout(this.timer);
        if (!event.ctrlKey) {
            this.patrolBuilderService.selectOnlyPatrolPoint(this.patrol, this.patrolPoint.PointId);
        }
        else {
            this.patrolBuilderService.selectPatrolPoint(this.patrol, this.patrolPoint.PointId);
        }
        this.addEditActions(this.patrolPoint);
    };
    PatrolBuilderPointItem.prototype.addEditActions = function (patrolPoint) {
        var _this = this;
        event.stopPropagation();
        if (patrolPoint.Selected === false) {
            this.patrolBuilderService.selectOnlyPatrolPoint(this.patrol, this.patrolPoint.PointId);
            this.patrolBuilderService.notifyPatrolPointEditSelected(patrolPoint);
        }
        else {
            var selectedCnt = 0;
            var hasActionsCnt = 0;
            for (var ii = 0; ii < this.patrol.Points.length; ii++) {
                if (this.patrol.Points[ii].Selected) {
                    selectedCnt++;
                    if (this.patrol.Points[ii].Actions && this.patrol.Points[ii].Actions.length > 0) {
                        hasActionsCnt++;
                    }
                }
            }
            if (selectedCnt > 1 && hasActionsCnt > 0) {
                var verb = 'have';
                if (hasActionsCnt === 1) {
                    verb = 'has';
                }
                this.overideMessage = hasActionsCnt.toString() + ' of the points selected already ' + verb + ' actions. ';
                this.overideMessage += ' Do you want to overide these actions?';
                setTimeout(function () { _this.confirmOveride.show(); _this.changeRef.detectChanges(); }, 100);
            }
            else {
                this.patrolBuilderService.notifyPatrolPointEditSelected(patrolPoint);
            }
        }
    };
    PatrolBuilderPointItem.prototype.removePoint = function (patrolPoint) {
        var _this = this;
        this.patrolBuilderService.removePatrolPoint(this.patrol, patrolPoint);
        if (this.patrol.Points.length === 0) {
            setTimeout(function () { _this.patrolMapService.setInteractMode(PatrolMapInteractMode.Append); }, 100);
        }
        this.patrol.dirtyToggle = !this.patrol.dirtyToggle;
    };
    __decorate([
        Input(),
        __metadata("design:type", PointTemplate)
    ], PatrolBuilderPointItem.prototype, "patrolPoint", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PatrolTemplate)
    ], PatrolBuilderPointItem.prototype, "patrol", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolBuilderPointItem.prototype, "pointCount", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolBuilderPointItem.prototype, "selected", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PatrolBuilderPointItem.prototype, "pointName", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PatrolBuilderPointItem.prototype, "pointDescription", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], PatrolBuilderPointItem.prototype, "onToggleActionGroup", void 0);
    __decorate([
        ViewChild('locDescInput'),
        __metadata("design:type", ElementRef)
    ], PatrolBuilderPointItem.prototype, "locDescInput", void 0);
    __decorate([
        ViewChild(ConfirmationDialog),
        __metadata("design:type", ConfirmationDialog)
    ], PatrolBuilderPointItem.prototype, "confirmOveride", void 0);
    PatrolBuilderPointItem = __decorate([
        Component({
            selector: 'patrol-builder-pointItem',
            templateUrl: 'patrol-builder-pointItem.component.html',
            styleUrls: ['patrol-builder-pointItem.component.css'],
            animations: [
                slideDown
            ],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService,
            PatrolBuilderService,
            PatrolMapService,
            ChangeDetectorRef,
            NgZone])
    ], PatrolBuilderPointItem);
    return PatrolBuilderPointItem;
}());
export { PatrolBuilderPointItem };
//# sourceMappingURL=patrol-builder-pointItem.component.js.map