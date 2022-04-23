import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './../shared/_shared.module';
import { AlarmModule } from './../alarms/_alarm.module';
import { PatrolModule } from './../patrols/_patrol.module';
import { DragulaModule } from 'ng2-dragula';

import { Platform } from './../platforms/platform.class';
import { PlatformService } from './platform.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
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

@NgModule({
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
export class PlatformModule { }