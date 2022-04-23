var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapModule } from '../map/_map.module';
import { AlarmModule } from '../alarms/_alarm.module';
import { PlatformModule } from '../platforms/_platform.module';
import { PatrolModule } from '../patrols/_patrol.module';
import { PatrolBuilderModule } from '../patrolBuilder/_patrol-builder.module';
import { SharedModule } from '../shared/_shared.module';
import { MapView } from './mapview.component';
import { AlarmTab } from './alarms/alarm-tab.component';
import { AlarmListGroup } from './alarms/alarm-list-group.component';
import { AlarmContextMenu } from './alarms/alarm-context-menu.component';
import { AlarmListItem } from './alarms/alarm-list-item.component';
import { PlatformTab } from './platforms/platform-tab.component';
import { PlatformListGroup } from './platforms/platform-list-group.component';
import { PatrolTab } from './patrols/patrol-tab.component';
import { PatrolListGroup } from './patrols/patrol-list-group.component';
import { PatrolContextMenu } from './patrols/patrol-context-menu.component';
import { RouterModule } from '@angular/router';
import { StateResolveService } from '../shared/state-resolve.service';
// forChild routes for Lazy Loading the module.
var mapviewRoutes = [
    { path: '', component: MapView, data: { title: 'Map View', displayHeader: true }, resolve: { state: StateResolveService } }
    //jeb add children routes to mapview module
    //   { path: 'MapView/Alarms/:id', component: MapView, data: { tab: 'Alarm', title: 'Map View', displayHeader:true }, resolve: { state: StateResolveService } },
    //   { path: 'MapView/Alarms', component: MapView, data: { tab: 'Alarm', title: 'Map View', displayHeader: true } },
    //   { path: 'MapView/Platforms/:id', component: MapView, data: { tab: 'Platform', title: 'Map View', displayHeader: true } },
    //   { path: 'MapView/Platforms', component: MapView, data: { tab: 'Platform', title: 'Map View', displayHeader: true } },
    //   { path: 'MapView/Patrols/:id', component: MapView, data: { tab: 'Patrol', title: 'Map View', displayHeader: true } },
    //{ path: 'MapView/Patrols', component: MapView, data: { tab: 'Patrol', title: 'Map View', displayHeader: true } }
];
var MapViewModule = /** @class */ (function () {
    function MapViewModule() {
    }
    MapViewModule = __decorate([
        NgModule({
            imports: [RouterModule.forChild(mapviewRoutes), CommonModule, FormsModule, AlarmModule,
                PatrolModule, PatrolBuilderModule, PlatformModule,
                MapModule, SharedModule
            ],
            declarations: [
                MapView, AlarmTab, AlarmListGroup, AlarmContextMenu, AlarmListItem, PlatformTab, PlatformListGroup,
                PatrolTab, PatrolListGroup, PatrolContextMenu
            ],
            exports: [
                AlarmListItem
            ],
            bootstrap: [MapView]
        })
    ], MapViewModule);
    return MapViewModule;
}());
export { MapViewModule };
//# sourceMappingURL=_mapview.module.js.map