var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { PatrolType } from '../patrols/patrol.class';
import { PointTemplate } from '../patrols/point.class';
import { PatrolService } from "../patrols/patrol.service";
import { PatrolBuilderService } from "./patrol-builder.service";
import { PatrolMapService } from "../map/patrols/patrolMap.service";
import { ActionCategory, ActionType, CommandName } from "../patrols/action.class";
import { slideDown } from '../shared/animations';
import { DragulaService } from 'ng2-dragula';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var PatrolBuilderActionCategory = /** @class */ (function () {
    function PatrolBuilderActionCategory(patrolService, patrolBuilderService, patrolMapService, dragulaService, changeRef) {
        this.patrolService = patrolService;
        this.patrolBuilderService = patrolBuilderService;
        this.patrolMapService = patrolMapService;
        this.dragulaService = dragulaService;
        this.changeRef = changeRef;
        this.PatrolType = PatrolType;
        this.ngUnsubscribe = new Subject();
        this.onActionDefClicked = new EventEmitter();
        this.onActionDefDblClicked = new EventEmitter();
        this.ActionType = ActionType;
    }
    PatrolBuilderActionCategory.prototype.toggleExpandedGroup = function () {
        this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
    };
    PatrolBuilderActionCategory.prototype.ngOnInit = function () {
        var _this = this;
        this.expandedState = this.expandedState || 'out';
        this.delay = 200;
        // Subscribe to action defition selection events
        this.patrolBuilderService.actionDefSelChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({ next: function (temp) { return _this.actionDefSelChanged(); } });
        this.patrolBuilderService.patrolPointModified
            .takeUntil(this.ngUnsubscribe)
            .subscribe({ next: function (patrolPoint) { return _this.patrolPointModified(); } });
    };
    PatrolBuilderActionCategory.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PatrolBuilderActionCategory.prototype.actionDefSelChanged = function () {
        this.changeRef.markForCheck();
    };
    PatrolBuilderActionCategory.prototype.patrolPointModified = function () {
        this.changeRef.detectChanges();
    };
    PatrolBuilderActionCategory.prototype.actionDefDblClicked = function (actionDef) {
        this.prevent = true;
        clearTimeout(this.timer);
        this.onActionDefDblClicked.emit(actionDef);
    };
    PatrolBuilderActionCategory.prototype.actionDefClicked = function (actionDef) {
        var _this = this;
        this.timer = setTimeout(function () {
            if (!_this.prevent) {
                _this.onActionDefClicked.emit(actionDef);
            }
            _this.prevent = false;
        }, this.delay);
    };
    PatrolBuilderActionCategory.prototype.doesCheckpointHaveAction = function (actDef) {
        var found = false;
        for (var _i = 0, _a = this.actions; _i < _a.length; _i++) {
            var action = _a[_i];
            for (var ii = 0; ii < actDef.Command.length; ii++) {
                if ((action.Command === actDef.Command[ii]) ||
                    (action.Command === CommandName.SayMessage && (actDef.Command[ii] === CommandName.Play))) {
                    found = true;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
        return found;
    };
    PatrolBuilderActionCategory.prototype.getDragData = function (actDef) {
        var dragData = { IsDefinition: true, Data: actDef };
        return dragData;
    };
    __decorate([
        Input(),
        __metadata("design:type", PointTemplate)
    ], PatrolBuilderActionCategory.prototype, "patrolPoint", void 0);
    __decorate([
        Input(),
        __metadata("design:type", ActionCategory)
    ], PatrolBuilderActionCategory.prototype, "actionCat", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolBuilderActionCategory.prototype, "catIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], PatrolBuilderActionCategory.prototype, "actions", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], PatrolBuilderActionCategory.prototype, "onActionDefClicked", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], PatrolBuilderActionCategory.prototype, "onActionDefDblClicked", void 0);
    PatrolBuilderActionCategory = __decorate([
        Component({
            selector: 'patrol-builder-action-category-group',
            templateUrl: 'patrol-builder-action-category.component.html',
            styleUrls: ['patrol-builder-action-category.component.css'],
            animations: [
                slideDown
            ],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService,
            PatrolBuilderService,
            PatrolMapService,
            DragulaService,
            ChangeDetectorRef])
    ], PatrolBuilderActionCategory);
    return PatrolBuilderActionCategory;
}());
export { PatrolBuilderActionCategory };
//# sourceMappingURL=patrol-builder-action-category.component.js.map