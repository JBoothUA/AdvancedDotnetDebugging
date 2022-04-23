var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActionBase, Parameter, CommandName, ParameterName, ParameterType } from '../patrols/action.class';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolBuilderService } from './patrol-builder.service';
import { DragulaService } from 'ng2-dragula';
import { Modal } from '../shared/modal.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var PatrolBuilderActionsDialog = /** @class */ (function () {
    //private dragging: boolean;
    function PatrolBuilderActionsDialog(patrolService, patrolBuilderService, dragulaService, changeRef) {
        this.patrolService = patrolService;
        this.patrolBuilderService = patrolBuilderService;
        this.dragulaService = dragulaService;
        this.changeRef = changeRef;
        this.visible = false;
        this.animatedOpaque = false;
        this.ngUnsubscribe = new Subject();
        dragulaService.setOptions('actionItemList', {
            copy: function (el, source) {
                return source.id !== 'actionItemListDropZone' && source.id !== 'actionItemEmptyListDropZone';
            },
            moves: function (el, container, handle) {
                if (el.dataset.catindex) {
                    return (true);
                }
                else {
                    return handle.classList.contains('pbActions-dragIconImg');
                }
            },
            accepts: function (el, target, source, sibling) {
                return target.id === 'actionItemListDropZone' || target.id === 'actionItemEmptyListDropZone';
            },
            revertOnSpill: true
        });
    }
    PatrolBuilderActionsDialog.prototype.ngOnInit = function () {
        var _this = this;
        this.actDefs = this.patrolService.getActionDefinitions();
        this.warningIcon = '../../Content/Images/warning.png';
        this.patrolBuilderService.patrolPointModified
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolPoint) { return _this.patrolPointsModified(); }
        });
        //this.dragulaService.shadow
        //	.takeUntil(this.ngUnsubscribe)
        //	.subscribe({
        //		next: (value) => this.actionDefDragged(value)
        //	});
        //this.dragulaService.drag
        //	.takeUntil(this.ngUnsubscribe)
        //	.subscribe({
        //		next: (value) => this.actionDefDragged(value)
        //	});
        this.dragulaService.drop
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (value) { return _this.actionDefDropped(value); }
        });
    };
    PatrolBuilderActionsDialog.prototype.ngOnChanges = function (changes) {
        //console.log('actions dialog change');
    };
    PatrolBuilderActionsDialog.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PatrolBuilderActionsDialog.prototype.patrolPointsModified = function () {
        this.changeRef.detectChanges();
    };
    //public actionDefDragged(value: any) {
    //}
    //public actionDefCloned(value: any) {
    //	let myValue = value;
    //	let temp = 0;
    //}
    PatrolBuilderActionsDialog.prototype.actionDefDropped = function (value) {
        // Check to see if we are dragging from the action definition list.
        if (value[1].dataset.catindex && value[1].dataset.actdefindex) {
            var catIndex = parseInt(value[1].dataset.catindex);
            var actDefIndex = parseInt(value[1].dataset.actdefindex);
            var actDef = this.actDefs[0].Categories[catIndex].ActionDefinitions[actDefIndex];
            if (value[2]) {
                value[2].removeChild(value[1]);
            }
            var beforeIdx = value[4] && value[4].dataset.actionindex ? parseInt(value[4].dataset.actionindex) : -1;
            this.addAction(actDef, beforeIdx);
        }
        else {
            // We are just doing a reorder of the actions list.  Need to reorder the actions
            // array.
            if (value[2] && value[3] && value[2] === value[3]) {
                var actIndex = parseInt(value[1].dataset.actionindex);
                if (actIndex || actIndex === 0) {
                    var action = this.actions[actIndex];
                    var beforeIdx = value[4] && value[4].dataset.actionindex ? parseInt(value[4].dataset.actionindex) : -1;
                    if (beforeIdx === -1) {
                        // Moving action to the end
                        this.actions.splice(actIndex, 1);
                        this.actions.push(action);
                    }
                    else {
                        if (actIndex > beforeIdx) {
                            this.actions.splice(actIndex, 1);
                            this.actions.splice(beforeIdx, 0, action);
                        }
                        else {
                            this.actions.splice(actIndex, 1);
                            this.actions.splice(beforeIdx - 1, 0, action);
                        }
                    }
                    this.changeRef.markForCheck();
                    this.patrolBuilderService.notifyPatrolPointModified(this.patrolPoint);
                }
            }
        }
    };
    PatrolBuilderActionsDialog.prototype.show = function (patrol, patrolPoint) {
        var _this = this;
        this.patrolPoint = patrolPoint;
        this.patrolPoints = [];
        this.patrol = patrol;
        var selectedCnt = 0;
        for (var ii = 0; ii < this.patrol.Points.length; ii++) {
            if (this.patrol.Points[ii].Selected) {
                selectedCnt++;
                this.patrolPoints.push(this.patrol.Points[ii]);
            }
        }
        this.actions = [];
        if (selectedCnt === 1) {
            for (var ii = 0; ii < this.patrolPoint.Actions.length; ii++) {
                var action = new ActionBase(this.patrolPoint.Actions[ii]);
                this.actions.push(action);
            }
            this.description = this.patrolPoint.Description;
            this.descriptionDisabled = false;
        }
        else {
            this.description = '';
            this.descriptionDisabled = true;
        }
        this.visible = true;
        setTimeout(function () {
            _this.animatedOpaque = true;
            _this.changeRef.detectChanges();
        });
    };
    PatrolBuilderActionsDialog.prototype.validateActions = function () {
        var isValid = true;
        for (var ii = 0; this.actions && ii < this.actions.length; ii++) {
            var action = this.actions[ii];
            for (var jj = 0; action.Parameters && jj < action.Parameters.length; jj++) {
                var param = action.Parameters[jj];
                if (typeof (param.Value) === 'undefined' || param.Value === '' || param.Value === null) {
                    isValid = false;
                    this.errorDialog.show();
                }
            }
        }
        return isValid;
    };
    PatrolBuilderActionsDialog.prototype.hideErrorDialog = function () {
        this.errorDialog.hide();
    };
    PatrolBuilderActionsDialog.prototype.cancel = function () {
        var _this = this;
        this.animatedOpaque = false;
        setTimeout(function () { _this.visible = false; _this.changeRef.detectChanges(); }, 400);
    };
    PatrolBuilderActionsDialog.prototype.save = function () {
        var _this = this;
        // Validate that all actions have required values
        if (this.validateActions() === true) {
            for (var ii = 0; ii < this.patrol.Points.length; ii++) {
                var patrolPoint = this.patrol.Points[ii];
                if (patrolPoint.Selected === true) {
                    patrolPoint.Actions = this.copyActionList(this.actions);
                    patrolPoint.Description = this.description;
                }
            }
            this.patrolBuilderService.updatePointOrdinalAndDisplayNames(this.patrol, this.patrol.Points[0], 0);
            this.animatedOpaque = false;
            this.patrolBuilderService.notifyPatrolPointModified(this.patrolPoint);
            setTimeout(function () { _this.visible = false; _this.changeRef.detectChanges(); }, 400);
        }
    };
    PatrolBuilderActionsDialog.prototype.copyActionList = function (actions) {
        var newActions = [];
        for (var ii = 0; ii < actions.length; ii++) {
            var action = new ActionBase(actions[ii]);
            newActions.push(action);
        }
        return newActions;
    };
    PatrolBuilderActionsDialog.prototype.copyAction = function (index) {
        var newAction = new ActionBase(null);
        var sourceAction = this.actions[index];
        newAction.ActionId = this.patrolBuilderService.createGUID();
        newAction.Command = sourceAction.Command;
        if (sourceAction.Parameters && sourceAction.Parameters.length > 0) {
            newAction.Parameters = [];
            for (var ii = 0; ii < sourceAction.Parameters.length; ii++) {
                var param = new Parameter(null);
                param.Name = sourceAction.Parameters[ii].Name;
                param.Type = sourceAction.Parameters[ii].Type;
                param.Value = sourceAction.Parameters[ii].Value;
                newAction.Parameters.push(param);
            }
        }
        this.actions.push(newAction);
        this.patrolBuilderService.notifyPatrolPointModified(this.patrolPoint);
    };
    PatrolBuilderActionsDialog.prototype.deleteAction = function (index) {
        this.actions.splice(index, 1);
        this.changeRef.detectChanges();
        this.patrolBuilderService.notifyPatrolPointModified(this.patrolPoint);
    };
    PatrolBuilderActionsDialog.prototype.addAction = function (actionDef, beforeIdx) {
        var newAction = new ActionBase(null);
        newAction.ActionId = this.patrolBuilderService.createGUID();
        newAction.Command = actionDef.Command[0];
        if (actionDef.Parameters && actionDef.Parameters.length > 0) {
            newAction.Parameters = [];
            for (var ii = 0; ii < actionDef.Parameters.length; ii++) {
                var param = new Parameter(null);
                param.Name = actionDef.Parameters[ii].Name;
                param.Type = actionDef.Parameters[ii].Type;
                param.Value = '';
                newAction.Parameters.push(param);
            }
        }
        //JJL work around for hard coded snapshot
        if (newAction.Command === CommandName.Snapshot) {
            newAction.Parameters = [{
                    Name: ParameterName.Camera,
                    Value: 'All',
                    Type: ParameterType.String,
                }];
        }
        if (beforeIdx !== -1) {
            this.actions.splice(beforeIdx, 0, newAction);
        }
        else {
            this.actions.push(newAction);
        }
        this.patrolBuilderService.notifyPatrolPointModified(this.patrolPoint);
    };
    PatrolBuilderActionsDialog.prototype.toggleSelectedActionDef = function (actionDef) {
        if (actionDef.Selected) {
            this.patrolBuilderService.deselectActionDef(actionDef);
        }
        else {
            this.patrolBuilderService.selectActionDef(actionDef);
        }
    };
    __decorate([
        ViewChild(Modal),
        __metadata("design:type", Modal)
    ], PatrolBuilderActionsDialog.prototype, "errorDialog", void 0);
    PatrolBuilderActionsDialog = __decorate([
        Component({
            selector: 'patrol-builder-actionsDialog',
            templateUrl: 'patrol-builder-actionsDialog.component.html',
            styleUrls: ['patrol-builder-actionsDialog.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService,
            PatrolBuilderService,
            DragulaService,
            ChangeDetectorRef])
    ], PatrolBuilderActionsDialog);
    return PatrolBuilderActionsDialog;
}());
export { PatrolBuilderActionsDialog };
//# sourceMappingURL=patrol-builder-actionsDialog.component.js.map