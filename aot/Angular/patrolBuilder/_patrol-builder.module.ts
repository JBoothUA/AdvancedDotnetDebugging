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

@NgModule({
	imports: [CommonModule, FormsModule, SharedModule, DragulaModule, MapModule],
	declarations: [PatrolBuilder,PatrolBuilderStep1, PatrolBuilderStep2,
		PatrolBuilderPointItem, PatrolBuilderActionItem, PatrolBuilderActionsDialog,
		PatrolBuilderActionCategory],
	exports: [PatrolBuilder]
})
export class PatrolBuilderModule { }