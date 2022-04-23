var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlarmModule } from '../alarms/_alarm.module';
import { SharedModule } from '../shared/_shared.module';
import { LeafletMap } from './leaflet-map.component';
import { AlarmMarkerCollection } from './alarms/alarm-marker-collection.component';
import { AlarmMarkerGroup } from './alarms/alarm-marker-group.component';
import { AlarmMarker } from './alarms/alarm-marker.component';
import { OverlappingAlarms } from './alarms/overlapping-alarms.component';
import { OverlappingAlarmsGroup } from './alarms/overlapping-alarms-group.component';
import { PatrolPath } from './patrols/patrol-path.component';
import { PatrolMarker } from './patrols/patrol-marker.component';
import { PlatformMarkerCollection } from './platforms/platform-marker-collection.component';
import { PlatformMarker } from './platforms/platform-marker.component';
import { RobotMonitorMap } from './platforms/robot-monitor-map.component';
import { LocationMarkerCollection } from './locations/location-marker-collection.component';
import { LocationMarker } from './locations/location-marker.component';
import { AlarmRadialMenu } from './alarms/alarm-radial-menu.component';
import { PlatformRadialMenu } from './platforms/platform-radial-menu.component';
import { GoToLocationDialog } from './platforms/go-to-location-dialog.component';
var MapModule = /** @class */ (function () {
    function MapModule() {
    }
    MapModule = __decorate([
        NgModule({
            imports: [CommonModule, FormsModule, AlarmModule, SharedModule],
            declarations: [
                LeafletMap, AlarmMarkerGroup, AlarmMarker, OverlappingAlarms, OverlappingAlarmsGroup, PatrolPath, PatrolMarker, PlatformMarker,
                AlarmMarkerCollection, PlatformMarkerCollection, RobotMonitorMap, LocationMarkerCollection, LocationMarker, AlarmRadialMenu,
                PlatformRadialMenu, GoToLocationDialog
            ],
            exports: [
                LeafletMap, RobotMonitorMap, PlatformMarker, GoToLocationDialog, AlarmMarkerCollection, PatrolPath
            ]
        })
    ], MapModule);
    return MapModule;
}());
export { MapModule };
//# sourceMappingURL=_map.module.js.map