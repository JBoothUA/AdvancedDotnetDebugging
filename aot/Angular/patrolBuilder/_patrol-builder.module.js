var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './../shared/_shared.module';
import { MapModule } from './../map/_map.module';
import { DragulaModule } from 'ng2-dragula';
import { PatrolBuilder } from './patrol-builder.component';
import { PatrolBuilderStep1 } from './patrol-builder-step1.component';
import { PatrolBuilderStep2 } from './patrol-builder-step2.component';
import { PatrolBuilderPointItem } from './patrol-builder-pointItem.component';
import { PatrolBuilderActionItem } from './patrol-builder-actionItem.component';
import { PatrolBuilderActionsDialog } from './patrol-builder-actionsDialog.component';
import { PatrolBuilderActionCategory } from './patrol-builder-action-category.component';
var PatrolBuilderModule = /** @class */ (function () {
    function PatrolBuilderModule() {
    }
    PatrolBuilderModule = __decorate([
        NgModule({
            imports: [CommonModule, FormsModule, SharedModule, DragulaModule, MapModule],
            declarations: [PatrolBuilder, PatrolBuilderStep1, PatrolBuilderStep2,
                PatrolBuilderPointItem, PatrolBuilderActionItem, PatrolBuilderActionsDialog,
                PatrolBuilderActionCategory],
            exports: [PatrolBuilder]
        })
    ], PatrolBuilderModule);
    return PatrolBuilderModule;
}());
export { PatrolBuilderModule };
//# sourceMappingURL=_patrol-builder.module.js.map