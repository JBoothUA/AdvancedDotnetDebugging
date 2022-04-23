import {
    Component, Input, ChangeDetectionStrategy,
    ChangeDetectorRef, Output, EventEmitter, SimpleChanges
} from '@angular/core';

import { WindowSize } from './robot-monitor.component';
import { slideDown } from './../shared/animations';
import { Platform } from './platform.class';
import {
    PlatformCommand, CommandName, Parameter, ParameterName,
    ParameterType, CommandDefinition, ActionStateValue, ParameterDefinition
} from './../patrols/action.class';
import { CommandCollectionItem } from './command-definition-collection.class';
import { PlatformService } from './platform.service';

@Component({
    selector: 'robot-monitor-controller',
    templateUrl: 'robot-monitor-controller.component.html',
    styleUrls: ['robot-monitor-controller.component.css'],
    animations: [slideDown],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RobotMonitorController {
    @Input() platform: Platform;
    @Input() size: WindowSize;
    @Output() onHideController: EventEmitter<void> = new EventEmitter<void>();

    public commandGroups: string[] = [];
    private expandedCommandGroups: string[] = [];
    private CommandName: typeof CommandName = CommandName;
    private WindowSize: typeof WindowSize = WindowSize;
    private groupCmdList: Map<string, CommandCollectionItem[]>;
    
    private selectedChargerCommand: CommandName;

    private excludeCommandList: CommandName[] = [
        CommandName.PausePatrol,
        CommandName.ResumePatrol,
        CommandName.Abort,
        CommandName.EStop,
        CommandName.VolumeMute,
        CommandName.VolumeUnmute,
        CommandName.SayMessage
    ];

    constructor(private platformService: PlatformService, private ref: ChangeDetectorRef) {

    }

    public toggleCommandSection(cmd: string): void {
        if (this.expandedCommandGroups.includes(cmd)) {
            this.expandedCommandGroups.splice(this.expandedCommandGroups.indexOf(cmd), 1);
        } else {
            this.expandedCommandGroups.push(cmd);
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {

        if (this.platform && changes.platform)
            this.buildCommandListGroups();
    }

    private buildCommandListGroups(): void {
        this.commandGroups = [];
        for (let command of this.platform.Commands) {
            switch (command.CommandName) {
                case CommandName.Abort:
                case CommandName.CancelGoal:
                case CommandName.EStop:
                case CommandName.EStopReset:
                case CommandName.ResetCameras:
                case CommandName.PausePatrol:
                case CommandName.ResumePatrol:
                case CommandName.TiltCameraAbsolute:
                    continue;
            }

            if (!this.commandGroups.includes(command.Category)) {
                this.commandGroups.push(command.Category);
            }
        }

        this.commandGroups.sort();
        this.expandedCommandGroups = this.commandGroups.slice();

        this.groupCmdList = new Map<string, CommandCollectionItem[]>();
        for (let group of this.commandGroups) {
            this.groupCmdList.set(group, this.getCmdForGroup(group));
        }
    }

    private getCmdForGroup(groupName: string): CommandCollectionItem[] {
        
        let cmdList: CommandCollectionItem[] = [];

        let commandCollection = this.platformService.getCommandDefinitions(this.platform);

        for (let cmd of commandCollection.commands) {
            if (cmd.category === groupName && !this.excludeCommandList.includes(cmd.onCommand.CommandName)) {


                if (cmd.onCommand.CommandName === CommandName.VolumeUnmute) {
                    cmd.displayName = 'Volume';
                }

                cmdList.push(cmd);
            }
        }

        cmdList.sort((a, b) => {
            if (a.displayName.toLowerCase() < b.displayName.toLowerCase())
                return -1;
            if (a.displayName.toLowerCase() > b.displayName.toLowerCase())
                return 1;
            return 0;
        });

        return cmdList;
    }
}