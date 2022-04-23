var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PatrolService } from '../patrols/patrol.service';
import { AreaType } from '../patrols/patrol.class';
import { ActionDefinition, ActionBase, ActionType, CommandName, Parameter } from '../patrols/action.class';
import { SayPlayChooser } from '../shared/say-play-chooser.component';
var PatrolBuilderActionItem = /** @class */ (function () {
    function PatrolBuilderActionItem(patrolService, changeRef) {
        this.patrolService = patrolService;
        this.changeRef = changeRef;
        this.onActionDeleted = new EventEmitter();
        this.onActionCopied = new EventEmitter();
        this.ActionType = ActionType;
    }
    PatrolBuilderActionItem.prototype.ngOnInit = function () {
        this.isCustomValue = false;
        this.isPresetValue = false;
        this.customValue = "";
        this.presetValue = "";
        if (this.actionDef && this.actionDef.Parameters.length > 0) {
            for (var _i = 0, _a = this.actionDef.Parameters[0].Presets; _i < _a.length; _i++) {
                var preset = _a[_i];
                if (this.action.Parameters[0].Value === preset.StringValue) {
                    this.isPresetValue = true;
                    this.presetValue = this.action.Parameters[0].Value;
                    break;
                }
            }
            if (!this.presetValue) {
                this.isCustomValue = true;
                this.customValue = this.action.Parameters[0].Value;
            }
            this.commandDisplayName = this.actionDef.DisplayName;
        }
    };
    PatrolBuilderActionItem.prototype.ngAfterViewInit = function () {
        if (this.sayPlayComp && this.action.Parameters[0].Value) {
            this.sayPlayComp.setValue(this.action.Command, this.action.Parameters[0].Value);
        }
    };
    PatrolBuilderActionItem.prototype.getOrientMapZoom = function () {
        var zoom = 18;
        if (this.patrolAreaType === AreaType.Small) {
            zoom = 20;
        }
        else if (this.patrolAreaType === AreaType.Large) {
            zoom = 18;
        }
        else {
            zoom = 16;
        }
        return (zoom);
    };
    PatrolBuilderActionItem.prototype.getActionDisplayName = function (actionDef, action, index) {
        var str = actionDef ? actionDef.DisplayName : 'Unknown Command: ' + CommandName[action.Command];
        if (index === 0) {
            str += ' (1st Action)';
        }
        else if (index === 1) {
            str += ' (2nd Action)';
        }
        else if (index === 2) {
            str += ' (3rd Action)';
        }
        else {
            str += (' (' + (index + 1).toString() + 'th Action)');
        }
        this.commandDisplayName = str;
        return (str);
    };
    PatrolBuilderActionItem.prototype.setPresetValue = function (value) {
        this.isPresetValue = true;
        this.presetValue = value;
        this.isCustomValue = false;
        this.customValue = null;
        this.action.Parameters[0].Value = value;
    };
    PatrolBuilderActionItem.prototype.setCustomValue = function (event) {
        this.isCustomValue = true;
        this.isPresetValue = false;
        if (event) {
            this.customValue = event.currentTarget.value;
        }
        this.action.Parameters[0].Value = this.customValue;
    };
    PatrolBuilderActionItem.prototype.isDwellPreset = function (presetValue) {
        if (this.isPresetValue && presetValue === this.action.Parameters[0].Value) {
            return (true);
        }
        else {
            return (false);
        }
    };
    PatrolBuilderActionItem.prototype.isDwellCustomValue = function () {
        return (this.isCustomValue);
    };
    PatrolBuilderActionItem.prototype.toggleChanged = function (state) {
        if (this.actionDef) {
            if (state === true) {
                // Set to the toggle on command
                this.action.Command = this.actionDef.Command[1];
                this.command = this.action.Command;
                this.action.DirtyToggle = !this.action.DirtyToggle;
                this.changeRef.detectChanges();
            }
            else {
                // Set to the toggle off command
                this.action.Command = this.actionDef.Command[0];
                this.action.DirtyToggle = !this.action.DirtyToggle;
                this.changeRef.detectChanges();
            }
        }
    };
    PatrolBuilderActionItem.prototype.deleteAction = function () {
        this.onActionDeleted.emit(this.index);
    };
    PatrolBuilderActionItem.prototype.copyAction = function () {
        this.onActionCopied.emit(this.index);
    };
    PatrolBuilderActionItem.prototype.getSayCommandParameters = function () {
        var actDefCmd = this.getActionDefinitionByActionType(ActionType.Say);
        return (actDefCmd.Parameters[0]);
    };
    PatrolBuilderActionItem.prototype.getPlayCommandParameters = function () {
        var actDefCmd = this.getActionDefinitionByActionType(ActionType.Play);
        return (actDefCmd.Parameters[0]);
    };
    PatrolBuilderActionItem.prototype.getActionDefinitionByActionType = function (actionType) {
        var found = false;
        var actionDef;
        var actDefs = this.patrolService.getActionDefinitions()[0];
        for (var _i = 0, _a = actDefs.Categories; _i < _a.length; _i++) {
            var actionCat = _a[_i];
            for (var _b = 0, _c = actionCat.ActionDefinitions; _b < _c.length; _b++) {
                actionDef = _c[_b];
                if (actionDef.ActionType === actionType) {
                    found = true;
                    return (actionDef);
                }
            }
        }
        return null;
    };
    PatrolBuilderActionItem.prototype.getActionDefinitionByCommand = function (command) {
        var found = false;
        var actionDef;
        var actDefs = this.patrolService.getActionDefinitions()[0];
        for (var _i = 0, _a = actDefs.Categories; _i < _a.length; _i++) {
            var actionCat = _a[_i];
            for (var _b = 0, _c = actionCat.ActionDefinitions; _b < _c.length; _b++) {
                actionDef = _c[_b];
                for (var _d = 0, _e = actionDef.Command; _d < _e.length; _d++) {
                    var actDefCmd = _e[_d];
                    if (actDefCmd === command) {
                        found = true;
                        return (actionDef);
                    }
                }
            }
        }
        return null;
    };
    PatrolBuilderActionItem.prototype.onSayPlayCommandChange = function (event) {
        if (this.action.Command) {
            this.action.Command = event;
            this.command = event;
            this.actionDef = this.getActionDefinitionByCommand(this.action.Command);
            this.action.Parameters = [];
            for (var ii = 0; ii < this.actionDef.Parameters.length; ii++) {
                var param = new Parameter(null);
                param.Name = this.actionDef.Parameters[ii].Name;
                param.Type = this.actionDef.Parameters[ii].Type;
                param.Value = "";
                this.action.Parameters.push(param);
            }
            this.action.DirtyToggle = !this.action.DirtyToggle;
        }
        this.changeRef.detectChanges();
    };
    PatrolBuilderActionItem.prototype.onSayPlayValueChange = function (event) {
        this.action.Parameters[0].Value = event;
        this.action.DirtyToggle = !this.action.DirtyToggle;
        this.changeRef.detectChanges();
    };
    PatrolBuilderActionItem.prototype.onOrientationValueChange = function (event) {
        this.action.Parameters[0].Value = event;
        this.action.DirtyToggle = !this.action.DirtyToggle;
        this.changeRef.detectChanges();
    };
    __decorate([
        Input(),
        __metadata("design:type", ActionBase)
    ], PatrolBuilderActionItem.prototype, "action", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], PatrolBuilderActionItem.prototype, "patrolPoints", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolBuilderActionItem.prototype, "patrolAreaType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolBuilderActionItem.prototype, "command", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolBuilderActionItem.prototype, "dirtyToggle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", ActionDefinition)
    ], PatrolBuilderActionItem.prototype, "actionDef", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolBuilderActionItem.prototype, "index", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PatrolBuilderActionItem.prototype, "commandDisplayName", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], PatrolBuilderActionItem.prototype, "onActionDeleted", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], PatrolBuilderActionItem.prototype, "onActionCopied", void 0);
    __decorate([
        ViewChild('sayPlayChooser'),
        __metadata("design:type", SayPlayChooser)
    ], PatrolBuilderActionItem.prototype, "sayPlayComp", void 0);
    PatrolBuilderActionItem = __decorate([
        Component({
            selector: 'patrol-builder-action-item',
            templateUrl: 'patrol-builder-actionItem.component.html',
            styleUrls: ['patrol-builder-actionItem.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService, ChangeDetectorRef])
    ], PatrolBuilderActionItem);
    return PatrolBuilderActionItem;
}());
export { PatrolBuilderActionItem };
//# sourceMappingURL=patrol-builder-actionItem.component.js.map