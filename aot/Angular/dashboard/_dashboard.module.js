var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { CalendarModule } from 'primeng/components/calendar/calendar';
import { SlickModule } from 'ngx-slick';
import { SharedModule } from './../shared/_shared.module';
import { AlarmModule } from './../alarms/_alarm.module';
import { MapModule } from '../map/_map.module';
import { PatrolModule } from '../patrols/_patrol.module';
import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPatrolService } from './dashboard-patrol.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { DashboardPDFService } from './dashboard-pdf.service';
import { DashboardPatrolMapService } from '../map/dashboard/dashboard-patrol-map.service';
import { DashboardPDFPatrolService } from './dashboard-pdf-patrol.service';
import { Dashboard } from './dashboard.component';
import { DashboardFilter } from './dashboard-filter.component';
import { DashboardHeader } from './dashboard-header.component';
import { DashboardAlarm } from './dashboard-alarm.component';
import { DashboardPatrol } from './dashboard-patrol.component';
import { DashboardSlider } from './dashboard-slider.component';
import { DashboardSearchBox } from './dashboard-searchbox.component';
import { DashboardAlarmDetails } from './dashboard-alarm-details.component';
import { DashboardAlarmPDF } from './dashboard-alarm-pdf.component';
import { DashboardPatrolDetails } from './dashboard-patrol-details.component';
import { DashboardPatrolMap } from '../map/dashboard/dashboard-patrol-map.component';
import { DashboardPatrolPDF } from './dashboard-patrol-pdf.component';
import { AlarmSearchPipe } from './alarm-search.pipe';
import { AlarmOperatorPipe } from './alarm-operator.pipe';
import { AlarmPriorityPipe } from './alarm-priority.pipe';
import { AlarmDescriptionPipe } from './alarm-description.pipe';
import { AlarmStatePipe } from './alarm-state.pipe';
import { AlarmPlatformPipe } from './alarm-platform.pipe';
import { AlarmLOIPipe } from './alarm-loi.pipe';
import { PatrolSearchPipe } from './patrol-search.pipe';
import { PatrolStatusPipe } from './patrol-status.pipe';
import { PatrolRobotDronePipe } from './patrol-robotdrone.pipe';
import { PatrolAlarmPriorityPipe } from './patrol-alarmpriority.pipe';
import { PatrolDisplayNamePipe } from './patrol-displayname.pipe';
import { PatrolOperatorPipe } from './patrol-operator.pipe';
import { RouterModule } from '@angular/router';
import { StateResolveService } from '../shared/state-resolve.service';
// forChild routes for Lazy Loading the module.
var dashboardRoutes = [
    {
        path: '',
        component: Dashboard,
        data: { title: 'Dashboard', displayHeader: true },
        resolve: { state: StateResolveService }
    },
    {
        path: 'PDFAlarmReport',
        component: DashboardAlarmPDF,
        data: { title: 'Dashboard Alarm Report', displayHeader: false },
        resolve: { state: StateResolveService }
    },
    {
        path: 'PDFPatrolReport',
        component: DashboardPatrolPDF,
        data: { title: 'Dashboard Patrol Report', displayHeader: false },
        resolve: { state: StateResolveService }
    }
];
var DashboardModule = /** @class */ (function () {
    function DashboardModule() {
    }
    DashboardModule = __decorate([
        NgModule({
            imports: [RouterModule.forChild(dashboardRoutes), CommonModule, FormsModule, SharedModule, ChartsModule, MapModule, CalendarModule, AlarmModule, PatrolModule, SlickModule.forRoot()],
            providers: [DashboardService, DashboardPDFService, DashboardPDFPatrolService, DashboardAlarmService, DashboardPatrolService, DashboardPlatformService,
                AlarmOperatorPipe, AlarmPriorityPipe, AlarmDescriptionPipe, DashboardPatrolMapService,
                AlarmStatePipe, AlarmPlatformPipe, AlarmLOIPipe,
                PatrolStatusPipe, PatrolRobotDronePipe, PatrolAlarmPriorityPipe, PatrolDisplayNamePipe, PatrolOperatorPipe
            ],
            declarations: [Dashboard, AlarmSearchPipe, AlarmOperatorPipe, AlarmPriorityPipe, AlarmDescriptionPipe,
                AlarmStatePipe, AlarmPlatformPipe, AlarmLOIPipe,
                DashboardFilter, DashboardHeader, DashboardAlarm, DashboardPatrol, DashboardSlider, DashboardSearchBox,
                DashboardAlarmDetails, DashboardAlarmPDF, DashboardPatrolDetails, DashboardPatrolPDF,
                PatrolSearchPipe, DashboardPatrolMap, PatrolAlarmPriorityPipe, PatrolStatusPipe, PatrolRobotDronePipe, PatrolDisplayNamePipe,
                PatrolOperatorPipe
            ],
            exports: [Dashboard, DashboardAlarmPDF, DashboardPatrolPDF, DashboardPatrolMap]
        })
    ], DashboardModule);
    return DashboardModule;
}());
export { DashboardModule };
//# sourceMappingURL=_dashboard.module.js.map