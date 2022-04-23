import { Component, ChangeDetectionStrategy, Input, SimpleChange, ViewChild, ChangeDetectorRef } from '@angular/core';
import {
    CommandDefinition, CommandName, PlatformCommand,
    ActionStateValue, Parameter, ParameterName, ParameterType
} from '../../patrols/action.class';
import { Platform, PlatformMode } from '../../platforms/platform.class';
import { PlatformService } from '../../platforms/platform.service';
import { PlatformMapService } from '../../map/platforms/platformMap.service';
import { PatrolInstance } from '../../patrols/patrol.class';
import { PatrolService } from '../../patrols/patrol.service';
import { UserService } from '../../shared/user.service';
import { CommandCollectionItem } from '../../platforms/command-definition-collection.class';
import { ToggleButton } from '../../shared/toggle-button.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

@Component({
	selector: 'platform-command-item',
    templateUrl: 'platform-command-item.component.html',
    styleUrls: ['platform-command-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformCommandItemComponent {
    @Input() command: CommandCollectionItem;
	@Input() platform: Platform;
    @Input('callback') callbackFunc: () => void;
    @Input() hoverItem: boolean = true;
    @Input() size: string = 'small';
    @ViewChild(ToggleButton) toggleButton: ToggleButton;
    commandState: ActionStateValue = ActionStateValue.Off;
    loading: boolean = false;
    toggleTimeout: NodeJS.Timer; 
    toggleFailed: boolean = false;
    toggleFailedTimeout: NodeJS.Timer;

    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private nonToggleError: boolean = false;
    private estopOn: boolean = false;

    constructor(public platformService: PlatformService,
        public platformMapService: PlatformMapService,
        private patrolService: PatrolService,
        private userService: UserService,
        private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                    if (platform.id === this.platform.id) {
                        let state = this.getCommandState();

                        if (state !== this.commandState) {
                            if (this.loading) {
                                // Clear timeout
                                if (this.toggleTimeout) {
                                    clearTimeout(this.toggleTimeout);
                                    this.toggleTimeout = undefined;
                                }

                                this.loading = false;
                            }

                            if (this.toggleFailedTimeout) {
                                clearTimeout(this.toggleFailedTimeout);
                                this.toggleFailedTimeout = undefined;
                            } else if (this.toggleFailed) {
                                this.toggleFailed = false;
                            }

                            // Update the state, turn off loading, and unsubscribe from edit platform notifications
                            this.commandState = state;
                            this.changeDetectorRef.detectChanges();
                        }

                        if (this.estopOn) {
                            if (platform.State.PlatformMode !== PlatformMode.Estop) {
                                this.estopOn = false;
                                if (this.toggleTimeout) {
                                    clearTimeout(this.toggleTimeout);
                                    this.toggleTimeout = null;
                                    this.loading = false;
                                }

                                if (this.toggleFailedTimeout) {
                                    clearTimeout(this.toggleFailedTimeout);
                                    this.toggleFailedTimeout = null;
                                }
                                this.changeDetectorRef.detectChanges();
                            }
                        }
                    }
                }
            });
    }

    executePlatformCommand(event: MouseEvent): void {
        // if loading, do not execute the command
        if (this.loading) {
            return;
        }

        if (this.callbackFunc) {
			this.callbackFunc();
        }

        // If command state is disabled, do not execute the command
        if (this.commandState === ActionStateValue.Disable) {
            return;
        }

        let command: CommandDefinition = this.command.onCommand;

        // If this is a toggle command and the current state is true, use the off command
        if (this.command.toggleCommand && this.commandState === ActionStateValue.On) {
            command = this.command.offCommand;
        } else if (!this.command.toggleCommand) {
            if (this.commandState === ActionStateValue.Off) {
                if (!this.command.offCommand) {
                    return;
                }
                command = this.command.offCommand;
            } 
        }

        if (command.CommandName === CommandName.PausePatrol) {
            let parameterList: Parameter[] = [];
     
            parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
            parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolService.getPatrolInstanceByPlatformId(this.platform.id).InstanceId, Type: ParameterType.String }));
            this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.PausePatrol, parameterList));

            return;
        }

        if (command.CommandName === CommandName.ResumePatrol) {
            let parameterList: Parameter[] = [];
            parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
            parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolService.getPatrolInstanceByPlatformId(this.platform.id).InstanceId, Type: ParameterType.String }));
            this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.ResumePatrol, parameterList));
        }

        if (command.CommandName === CommandName.Abort) {
            if (this.patrolService.getPatrolInstanceByPlatformId(this.platform.id) || this.platform.IsPatrolSubmitted) {
                this.platformService.showConfirmAbortPatrol(this.platform);
                this.platformService.closePlatformActionMenuSub.next();
            }
            return;
        }

        if (command.CommandName === CommandName.EStopReset) {
            if (this.toggleTimeout) {
                return;
            }

            this.estopOn = true;
            this.loading = true;
            this.toggleTimeout = setTimeout(() => {
                clearTimeout(this.toggleTimeout);
                this.toggleTimeout = null;

                //Show non-toggle error
                this.nonToggleError = true;
                this.loading = false;

                this.toggleFailedTimeout = setTimeout(() => {
                    // Turn off error state after 7 seconds
                    clearTimeout(this.toggleFailedTimeout);
                    this.toggleFailedTimeout = null;
                    this.nonToggleError = false;
                    this.changeDetectorRef.detectChanges();
                }, 7000);

                this.changeDetectorRef.detectChanges();

            }, 10000);
        }

        this.platformService.executeCommand(this.platform, command, this.platformMapService);

        if (this.command.toggleCommand) {
            this.loading = true;
            
            // If state change does not occur within timeout window, go in to error state
            this.toggleTimeout = setTimeout(() => {
                // Turn off loading
                this.toggleTimeout = undefined;
                this.loading = false;

                // Go in to error state
                this.toggleFailed = true;
                this.toggleFailedTimeout = setTimeout(() => {
                    // Turn off error state after 7 seconds
                    this.toggleFailedTimeout = undefined;
                    this.toggleFailed = false;
                    this.changeDetectorRef.detectChanges();
                }, 7000);

                this.changeDetectorRef.detectChanges();
            }, 10000);
        }
    }

    getDisplayName(): string {
        if (this.command.toggleCommand) {
            // toggle comand, so just use the display name
            return this.command.displayName;
        } else {
            // Not toggle command so use the display corresponding with the current state
            if (this.commandState === ActionStateValue.On || this.commandState === ActionStateValue.Disable) {
                return this.command.onCommand.DisplayName;
            } else {
                if (this.command.offCommand) {
                    return this.command.offCommand.DisplayName;
                } else {
                    return this.command.onCommand.DisplayName;
                }
            }
        }
    }

    checkDisable(): boolean {
        if (this.commandState === ActionStateValue.Disable) {
            return true;
        } else {
            if (!this.command.toggleCommand && this.commandState === ActionStateValue.Off && !this.command.offCommand) {
                return true;
            }
        }

        return false;
	}

	checkCloseOnClick(): boolean {
		let command: CommandDefinition = this.command.onCommand;
		if (command.CommandName === CommandName.GoCharge
			|| command.CommandName === CommandName.SayMessage
			|| command.CommandName === CommandName.Play
			|| command.CommandName === CommandName.OrientPlatform
			|| command.CommandName === CommandName.GoToLocation
			|| command.DisplayName === 'Robot Monitor') {
			return true;
		} 

		return false;
	}

	handleClick(event: MouseEvent): void {
		if (this.command.toggleCommand && this.toggleButton) {
            this.toggleButton.onToggle(event);
        } else {
            this.executePlatformCommand(event);
        }
    }

    determineState(): void {
        if (this.command) {
            this.commandState = this.getCommandState();
        }
    }

    getCommandState(): ActionStateValue {
        if (this.command.toggleCommand) {
            // Toggle command, the command state comes from the platform state values
            return this.platformService.getPlatformState(this.platform, this.command.platformStateNameValue);
        } else {
            // Non toggle command, so the command state is specific to the command
            return this.platformService.getPlatformCommandState(this.platform, this.command.onCommand.CommandName);
        }
    }

    getState(): boolean {
        return this.commandState === ActionStateValue.On ? true : false;
    }

    getCommandName(): number {
        let command: CommandDefinition = this.command.onCommand;

        if (this.commandState === ActionStateValue.Off) {
            if (this.command.offCommand) {
                // Off command exists, so use it
                command = this.command.offCommand;
            }
        } 

        return command.CommandName;
    }

    getCommandIconSrc(): string {
        let command: CommandDefinition = this.command.onCommand;

        if (this.commandState === ActionStateValue.Off) {
            if (this.command.offCommand) {
                // Off command exists, so use it
                command = this.command.offCommand;
            }
        } 

        if (command.CommandName === CommandName.EStop) {
            return '/Content/images//Patrols/e-stop.png';
        } else if (command.CommandName === CommandName.EStopReset) {
            return '/Content/Images/Patrols/reset-stop.png';
        } else if (command.CommandName === CommandName.FlashersOn || command.CommandName === CommandName.FlashersOff) {
            return '/Content/Images/Patrols/flashers.png';
        } else if (command.CommandName === CommandName.GoCharge) {
            return '/Content/Images/Patrols/go-charge.png';
        } else if (command.CommandName === CommandName.GoHome) {
            return '/Content/Images/Patrols/go-home.png';
        } else if (command.CommandName === CommandName.HeadlightsOn || command.CommandName === CommandName.HeadlightsOff) {
            return '/Content/Images/Patrols/headlights.png';
        } else if (command.CommandName === CommandName.IrIlluminatorsOn || command.CommandName === CommandName.IrIlluminatorsOff) {
            return '/Content/Images/Patrols/ir-illuminator.png';
        } else if (command.CommandName === CommandName.LocalizeOnCharger || command.CommandName === CommandName.SetChargerLocation) {
            return '/Content/Images/Patrols/charger-settings.png';
        } else if (command.CommandName === CommandName.SayMessage || command.CommandName === CommandName.Play) {
            return '/Content/Images/Patrols/play-audio.png';
        } else if (command.CommandName === CommandName.SirenOn || command.CommandName === CommandName.SirenOff) {
            return '/Content/Images/Patrols/siren.png';
        } else if (command.CommandName === CommandName.VolumeMute || command.CommandName === CommandName.VolumeUnmute || command.CommandName === CommandName.Volume) {
            return '/Content/Images/Patrols/volume.png';
        } else if (command.CommandName === CommandName.OrientPlatform) {
            return '/Content/Images/Patrols/orient-robot.png';
        } else if (command.CommandName === CommandName.Snapshot) {
            return '/Content/Images/Patrols/take-snapshot.png';
        } else if (command.CommandName === CommandName.GoToLocation) {
            return '/Content/Images/Platforms/go-to-location-small.png';
        } else if (command.CommandName === CommandName.CancelGoal) {
            return '/Content/Images/Platforms/go-to-location-cancel.png';
        } else if (command.CommandName === CommandName.PausePatrol) {
            return '/Content/Images/Patrols/pause.png';
        } else if (command.CommandName === CommandName.Abort) {
            return '/Content/Images/Patrols/abort.png';
        } else if (command.CommandName === CommandName.ResumePatrol) {
            return '/Content/Images/Patrols/resume.png';
        } else if (command.DisplayName === 'Robot Monitor') {
            return '/Content/Images/Patrols/robot-monitor.png';
        } else if (command.CommandName === CommandName.ShutDown) {
            return '/Content/Images/Platforms/shutdown-icon-monitor.png';
        }else {
            return '/Content/Images/Patrols/blank-icon.png';
        }
    }

    public abortPatrol(): void {
        let patrolInstance: PatrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.platform.id);
        this.patrolService.abortPatrol(patrolInstance, (patrolInstance) ? patrolInstance.TemplateId : this.platform.PatrolTemplateSubmittedId, this.platform.id);
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (changes.command && changes.command.firstChange) {
            if (this.command && !this.command.onCommand) {
                this.command.onCommand = this.command.offCommand;
            }
        }
        this.determineState();
    }

    ngOnDestroy(): void {
        if (this.toggleTimeout) {
            clearTimeout(this.toggleTimeout);
        }

        if (this.toggleFailedTimeout) {
            clearTimeout(this.toggleFailedTimeout);
        }
        
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}