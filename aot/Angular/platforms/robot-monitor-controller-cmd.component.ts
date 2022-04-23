import {
    Component, Input, ChangeDetectionStrategy,
    OnInit, ChangeDetectorRef, ViewChild
} from '@angular/core';
import { slideDown } from './../shared/animations';
import { CommandCollectionItem } from './command-definition-collection.class';
import { Platform, PlatformMode } from './platform.class';
import {
    PlatformCommand, CommandName, Parameter, ParameterName,
    ParameterType, CommandDefinition, ActionStateValue, ParameterDefinition
} from './../patrols/action.class';
import { WindowSize } from './robot-monitor.component';
import { PlatformService } from './platform.service';
import { SayPlayChooser } from '../shared/say-play-chooser.component';
import { OrientRobot } from '../shared/orient-robot.component';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'robot-monitor-controller-cmd',
    templateUrl: 'robot-monitor-controller-cmd.component.html',
    styleUrls: ['robot-monitor-controller-cmd.component.css'],
    animations: [slideDown],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RobotMonitorControllerCmd {
    @Input() cmd: CommandCollectionItem;
    @Input() platform: Platform;
    @Input() size: WindowSize;

    public CommandName: typeof CommandName = CommandName;
    private WindowSize: typeof WindowSize = WindowSize;
    private sayPlayMode: CommandName = CommandName.SayMessage;
    public isSelected: boolean = false;
    private sayPlayValue: string;
    private orientValue: string;
    private isLoading: boolean = false;
    private currentState: boolean = false;
    private toggleTimeout: NodeJS.Timer;
    private toggleFailedTimeout: NodeJS.Timer;
    private toggleFailed: boolean = false;
    private nonToggleError: boolean = false;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private estopOn: boolean = false;
    private nonToggleLoading: boolean = false;

    @ViewChild('platformSayPlay') platformSayPlay: SayPlayChooser;
    @ViewChild('orientRobot') orientRobot: OrientRobot;

    constructor(private platformService: PlatformService,
        private ref: ChangeDetectorRef,
        private platformMapService: PlatformMapService) {
    }

    public ngOnInit(): void {
        this.currentState = this.getState(this.cmd);
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                    if (platform.id === this.platform.id) {
                        if (this.toggleTimeout) {
                            clearTimeout(this.toggleTimeout);
                            this.toggleTimeout = undefined;
                        }
                         
                        let state: boolean = this.getState(this.cmd);
                        if (this.currentState !== state) {
                            this.currentState = state;
                            this.isLoading = false;
                            this.toggleFailed = false;
                        }

                        if (this.estopOn) {
                            if (platform.State.PlatformMode !== PlatformMode.Estop) {
                                this.estopOn = false;
                                if (this.toggleTimeout) {
                                    clearTimeout(this.toggleTimeout);
                                    this.toggleTimeout = null;
                                    this.nonToggleLoading = false;
                                }

                                if (this.toggleFailedTimeout) {
                                    clearTimeout(this.toggleFailedTimeout);
                                    this.toggleFailedTimeout = null;
                                }
                                this.ref.detectChanges();
                            }
                        }

                        this.ref.detectChanges();
                    }
                }
            });
    }

    public ngOnDestroy(): void {
        if (this.toggleTimeout) {
            clearTimeout(this.toggleTimeout);
        }

        if (this.toggleFailedTimeout) {
            clearTimeout(this.toggleFailedTimeout);
        }

        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private sayPlayValueChanged(value: string) {
        this.sayPlayValue = value;
    }

    private orientValueChanged(value: string) {
        this.orientValue = value;
    }

    private onSelection(event: MouseEvent): void {
        if (this.hasCmdDialog(this.cmd.onCommand.CommandName)) {
            this.isSelected = !this.isSelected;
        } else {
            this.isSelected = false;
            if (this.cmd.toggleCommand) {
                this.executePlatformCommand(event);
            } else {
                this.executePlatformCommand(event);
            }

            if (this.cmd.onCommand.CommandName === CommandName.EStopReset) {
                if (this.toggleTimeout) {
                    return;
                }
                this.nonToggleLoading = true;
                this.estopOn = true;
                this.toggleTimeout = setTimeout(() => {
                    this.toggleTimeout = undefined;
                    this.nonToggleLoading = false;
                    this.nonToggleError = true;
                    this.toggleFailedTimeout = setTimeout(() => {
                        this.toggleFailedTimeout = undefined;
                        this.nonToggleError = false;
                        this.ref.detectChanges();
                    }, 7000);

                    this.ref.detectChanges();
                }, 10000);

               
                this.ref.detectChanges();
            }
        }
    }

    private executePlatformCommand(event: MouseEvent): void {
        if (this.isLoading) {
            return;
        }

        let command: CommandDefinition = this.cmd.onCommand;

        // If this is a toggle command and the current state is true, use the off command
        if (this.cmd.toggleCommand && this.getState(this.cmd)) {
            command = this.cmd.offCommand;
        } else if (!this.cmd.toggleCommand) {
            if (!this.getState(this.cmd)) {
                if (!this.cmd.offCommand) {
                    return;
                }
                command = this.cmd.offCommand;
            }
        }

        this.platformService.executeCommand(this.platform, command, this.platformMapService);

        if (this.cmd.toggleCommand) {
            this.isLoading = true;

            this.toggleTimeout = setTimeout(() => {
                this.toggleTimeout = undefined;
                this.isLoading = false;
                this.toggleFailed = true;
                this.toggleFailedTimeout = setTimeout(() => {
                    this.toggleFailedTimeout = undefined;
                    this.toggleFailed = false;
                    this.ref.detectChanges();
                }, 7000);

                this.ref.detectChanges();
            }, 10000);

        }
    }

    public hasCmdDialog(cmd: CommandName): boolean {
        switch (cmd) {
            case CommandName.SayMessage:
            case CommandName.Play:
            case CommandName.OrientPlatform:
            case CommandName.LocalizeOnCharger:
            case CommandName.SetChargerLocation:
                return true;
            default:
                return false;
        }
    }

    private getSayParameterList(): ParameterDefinition {
        for (let cmd of this.platform.Commands) {
            if (cmd.CommandName === CommandName.SayMessage) {
                return cmd.Parameters[0];
            }
        }
    }

    private sayPlayCommandChanged(commandName: CommandName) {
        this.sayPlayMode = commandName;
        this.ref.detectChanges();
    }

    private getCmdIcon(command: CommandCollectionItem, isSelected: boolean = false): string {
        let sufix: string = '-not-selected';
        if (isSelected) {
            sufix = '-selected';
        }

        let currentCommand: CommandDefinition = command.onCommand;
        if (currentCommand.CommandName === CommandName.GoToLocation && this.platformService.getPlatformCommandState(this.platform, this.cmd.onCommand.CommandName) === ActionStateValue.Off) {
            currentCommand = command.offCommand;
        }

        switch (currentCommand.CommandName) {
            case CommandName.EStopReset:
                return '/Content/images/Platforms/CommandIcons/release-e-Stop' + sufix + '.png';
            case CommandName.FlashersOn:
            case CommandName.FlashersOff:
                return '/Content/images/Platforms/CommandIcons/flashers' + sufix + '.png';
            case CommandName.GoCharge:
                return '/Content/images/Platforms/CommandIcons/go-charge' + sufix + '.png';
            case CommandName.HeadlightsOn:
            case CommandName.HeadlightsOff:
                return '/Content/images/Platforms/CommandIcons/headlights' + sufix + '.png';
            case CommandName.IrIlluminatorsOn:
            case CommandName.IrIlluminatorsOff:
                return '/Content/images/Platforms/CommandIcons/i-r-Illuminator' + sufix + '.png';
            case CommandName.LocalizeOnCharger:
                return '/Content/images/Platforms/CommandIcons/reset-robot-location' + sufix + '.png';
            case CommandName.SetChargerLocation:
                return '/Content/images/Platforms/CommandIcons/charger-settings' + sufix + '.png';
            case CommandName.SayMessage:
            case CommandName.Play:
                return '/Content/images/Platforms/CommandIcons/play-audio' + sufix + '.png';
            case CommandName.VolumeMute:
            case CommandName.VolumeUnmute:
            case CommandName.Volume:
                return '/Content/images/Platforms/CommandIcons/volume-settings' + sufix + '.png';
            case CommandName.OrientPlatform:
                return '/Content/images/Platforms/CommandIcons/orient-robot' + sufix + '.png';
            case CommandName.Snapshot:
                return '/Content/images/Platforms/CommandIcons/snapshot' + sufix + '.png';
            case CommandName.GoToLocation:
                return '/Content/images/Platforms/CommandIcons/go-to-location' + sufix + '.png';
            case CommandName.CancelGoal:
                return '/Content/images/Platforms/CommandIcons/go-to-location-released' + sufix + '.png';
            case CommandName.SirenOn:
            case CommandName.SirenOff:
                return '/Content/images/Platforms/CommandIcons/siren' + sufix + '.png';
            case CommandName.ShutDown:
                return '/Content/Images/Platforms/shutdown-icon-monitor.png';
            default:
                return '';
        }
    }

    private showSelectedIcon(): boolean {
        if (this.cmd.toggleCommand) {
            return this.getState(this.cmd);
        }

        return false;
    }

    private getState(cmd: CommandCollectionItem): boolean {
        return this.getCommandState(cmd) === ActionStateValue.On ? true : false;
    }

    private getCommandState(cmd: CommandCollectionItem): ActionStateValue {
        if (cmd.toggleCommand) {
            // Toggle command, the command state comes from the platform state values
            return this.platformService.getPlatformState(this.platform, cmd.platformStateNameValue);
        } else {
            // Non toggle command, so the command state is specific to the command
            return this.platformService.getPlatformCommandState(this.platform, cmd.onCommand.CommandName);
        }
    }

    private executeSayPlay(): void {
        let paramName: ParameterName = ParameterName.Phrase;

        if (this.sayPlayMode !== CommandName.SayMessage) {
            paramName = ParameterName.File;
        }

        let param: Parameter[] = [new Parameter({ Name: paramName, Value: this.sayPlayValue, Type: ParameterType.String })];
        let platformCommand = new PlatformCommand(this.platform.id, this.sayPlayMode, param);
        this.platformService.executePlatformCommand(platformCommand, this.platform.TenantId);

        this.platformSayPlay.setCustomValue(null);
    }

    private executeOrientPlatform(): void {
        let param: Parameter[] = [new Parameter({ Name: ParameterName.Angle, Value: this.orientValue, Type: ParameterType.Int })];
        let platformCommand = new PlatformCommand(this.platform.id, CommandName.OrientPlatform, param);
        this.platformService.executePlatformCommand(platformCommand, this.platform.TenantId);
    }

    private onCmdDialogToggle(event: MouseEvent): void {
        if (this.orientRobot) {
            this.orientRobot.refreshMap();
        }
    }

    public checkDisable(): boolean {
        let commandState: any = this.getCommandState(this.cmd);

        if (commandState === ActionStateValue.Disable) {
            return true;
        } else {
            if (!this.cmd.toggleCommand && commandState === ActionStateValue.Off && !this.cmd.offCommand) {
                return true;
            }
        }

        return false;
    }

    public ngOnChanges() {
        if (this.orientRobot) {
            this.orientRobot.refreshMap();
        }
    }

    private getCmdName(): string {
        if (this.cmd.onCommand.CommandName === CommandName.GoToLocation) {
            if (this.platformService.getPlatformCommandState(this.platform, this.cmd.onCommand.CommandName) === ActionStateValue.Off) {
                return this.cmd.offCommand.DisplayName;
            }
        }

        return this.cmd.displayName;
    }

}