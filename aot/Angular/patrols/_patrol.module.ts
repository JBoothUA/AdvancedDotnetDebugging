import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './../shared/_shared.module';

import { PatrolSortService } from './patrol-sort.service';
import { PatrolService } from './patrol.service';
import { PatrolCard } from './patrol-card.component';
import { PatrolProgressbar } from './patrol-progressbar.component';
import { PatrolOverview } from './patrol-overview.component';
import { PatrolPlan } from './patrol-plan.component';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [PatrolCard, PatrolProgressbar, PatrolOverview, PatrolPlan],
    exports: [PatrolProgressbar, PatrolOverview, PatrolCard]
})
export class PatrolModule { }