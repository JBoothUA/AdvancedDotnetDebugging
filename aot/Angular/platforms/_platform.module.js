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
import { AlarmModule } from './../alarms/_alarm.module';
import { PatrolModule } from './../patrols/_patrol.module';
import { DragulaModule } from 'ng2-dragula';
import { MapModule } from '../map/_map.module';
import { CommandPlatformDialog } from './command-platform-dialog.component';
import { CommandPlatformParameterItem } from './command-platform-parameter-item.component';
import { CommandParameterPreset } from './command-parameter-preset.component';
import { RobotMonitorDynamic } from './robot-monitor.component';
import { ConciseRobotMonitor } from './concise-robot-monitor.component';
import { PlatformContextMenu } from './platform-context-menu.component';
import { RobotMonitorController } from './robot-monitor-controller.component';
import { RobotMonitorControllerCmd } from './robot-monitor-controller-cmd.component';
import { PlatformVolume } from './platform-volume.component';
import { SliderModule } from 'primeng/components/slider/slider';
var PlatformModule = /** @class */ (function () {
    function PlatformModule() {
    }
    PlatformModule = __decorate([
        NgModule({
            imports: [
                CommonModule, FormsModule, SharedModule, AlarmModule, SliderModule, MapModule, PatrolModule, DragulaModule
            ],
            declarations: [
                CommandPlatformDialog, CommandPlatformParameterItem, CommandParameterPreset,
                RobotMonitorDynamic, PlatformContextMenu, ConciseRobotMonitor, RobotMonitorController,
                RobotMonitorControllerCmd, PlatformVolume
            ],
            exports: [
                RobotMonitorDynamic, ConciseRobotMonitor, CommandPlatformDialog,
                PlatformContextMenu
            ]
        })
    ], PlatformModule);
    return PlatformModule;
}());
export { PlatformModule };
//# sourceMappingURL=_platform.module.js.map