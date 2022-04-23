/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import { Component, Input, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef, SimpleChange } from '@angular/core';
import { RadialMenu } from '../../shared/radial/radial-menu.component';
import { RadialMenuButton } from '../../shared/radial/radial-menu-button.class';
import { RadialMenuButtonImage } from '../../shared/radial/radial-menu-button-image.class';
import { Platform } from '../../platforms/platform.class';
import { PlatformService } from '../../platforms/platform.service';
import { PlatformMapService } from '../../map/platforms/platformMap.service';
import { CommandName, ActionStateValue, CommandDefinition } from '../../patrols/action.class';
import { CommandCollection, CommandCollectionItem } from '../../platforms/command-definition-collection.class';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

class PlatformRadialCommand {
    name: string;
    state: ActionStateValue;
    command: CommandCollectionItem;
    button: RadialMenuButton;

    loading: boolean = false;
    toggleTimeout: NodeJS.Timer;
    toggleFailed: boolean = false;
    toggleFailedTimeout: NodeJS.Timer;

    constructor(name: string, state: ActionStateValue, command: CommandCollectionItem, button?: RadialMenuButton) {
        this.name = name;
        this.state = state;
        this.command = command;
        this.button = button;
    }
}

@Component({
    selector: 'platform-radial-menu',
    templateUrl: 'platform-radial-menu.component.html',
    styleUrls: ['../../shared/radial/radial-menu.component.css', 'platform-radial-menu.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformRadialMenu extends RadialMenu {
    @Input() platform: Platform;

    radialCommands: PlatformRadialCommand[] = [];

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(protected changeDetectorRef: ChangeDetectorRef, protected elementRef: ElementRef, protected platformService: PlatformService,
                protected platformMapService: PlatformMapService) {
        super(changeDetectorRef, elementRef);

        L.DomEvent.disableClickPropagation(this.elementRef.nativeElement);

        this.closeOnClick = false;
        // The higher the factor, the larger the diameter of the menu
        this.sizeFactor = 38;
        this.eventName = 'platformRadial';
    }

    ngOnInit(): void {
        let commandCollection = this.platformService.getCommandDefinitions(this.platform);

        // Find orient command
        let orient = commandCollection.commands.find((element) => {
            return element.onCommand && element.onCommand.CommandName === CommandName.OrientPlatform;
        });

        if (orient) {
            this.addButton(orient, 'Orient', new RadialMenuButtonImage('/Content/Images/Platforms/orient-radial.png', -2));
        }

        // Find flashers command
        let flashers = commandCollection.commands.find((element) => {
            return element.onCommand && element.onCommand.CommandName === CommandName.FlashersOn;
        });

        if (flashers) {
            this.addButton(flashers, 'Flashers', new RadialMenuButtonImage('/Content/Images/Platforms/flashers-radial.png', -1));
        }

        // Find headlights command
        let headlights = commandCollection.commands.find((element) => {
            return element.onCommand && element.onCommand.CommandName === CommandName.HeadlightsOn;
        });

        if (headlights) {
            this.addButton(headlights, 'Headlights', new RadialMenuButtonImage('/Content/Images/Platforms/headlights-radial.png', -2));
        }

        // Find play audio command
        let playAudio = commandCollection.commands.find((element) => {
            return element.onCommand && element.onCommand.CommandName === CommandName.Play;
        });

        if (playAudio) {
            this.addButton(playAudio, 'Play Audio', new RadialMenuButtonImage('/Content/Images/Platforms/play-audio-radial.png', -1));
        }

        // Find siren command
        let siren = commandCollection.commands.find((element) => {
            return element.onCommand && element.onCommand.CommandName === CommandName.SirenOn;
        });

        if (siren) {
            this.addButton(siren, 'Siren', new RadialMenuButtonImage('/Content/Images/Platforms/siren-radial.png', -1));
        }

        // Find snapshot command
        let snapshot = commandCollection.commands.find((element) => {
            return element.onCommand && element.onCommand.CommandName === CommandName.Snapshot;
        });

        if (snapshot) {
            this.addButton(snapshot, 'Snapshot', new RadialMenuButtonImage('/Content/Images/Platforms/take-snapshot.png', -2));
        }

        // Create empty/invisible buttons to control placement of buttons
        for (let i = 0; i < 3; i++) {
            this.radialCommands.push(new PlatformRadialCommand('empty', undefined, undefined, new RadialMenuButton('', '', new RadialMenuButtonImage(''), null, false, false, false)));
        }

        // Find estop command
        let estop = commandCollection.commands.find((element) => {
            return element.onCommand && element.onCommand.CommandName === CommandName.EStop;
        });

        if (estop) {
            this.addButton(estop, 'E-Stop', new RadialMenuButtonImage('/Content/Images/Platforms/E-stop-radial.png', -2, -2));
        }
    }

    addButton(command: CommandCollectionItem, name: string, icon: RadialMenuButtonImage): void {
        let state = this.getCommandState(command);

        let selected = false;
        let active = true;

        if (state === ActionStateValue.Disable) {
            active = false;
        } else if (state === ActionStateValue.On && command.toggleCommand) {
            selected = true;
        }

        let radialCommand = new PlatformRadialCommand(name, state, command);

        let button = new RadialMenuButton(this.platform.id, name, icon, () => { this.executeCommand(radialCommand); }, selected, active, true);

        radialCommand.button = button;

        // Add button to radial menu buttons and to PlatformRadialCommand list so that they can be updated later
        this.buttons.push(button);
        this.radialCommands.push(radialCommand);
    }

    executeCommand(radialCommand: PlatformRadialCommand) {
        // If loading, do not execute the command
        if (radialCommand.loading) {
            return;
        }

        // If command state is disabled, do not execute the command
        if (radialCommand.state === ActionStateValue.Disable) {
            return;
        }

        this.platformService.executeCommand(this.platform, this.getCommandDefinition(radialCommand), this.platformMapService);

        if (radialCommand.command.toggleCommand) {
            radialCommand.loading = true;

            // If state change does not occur within timeout window, go in to error state
            radialCommand.toggleTimeout = setTimeout(() => {
                // Turn off loading
                radialCommand.toggleTimeout = undefined;
                radialCommand.loading = false;
                radialCommand.button.Error = true;

                // Go in to error state
                radialCommand.toggleFailed = true;
                radialCommand.toggleFailedTimeout = setTimeout(() => {
                    // Turn off error state after 7 seconds
                    radialCommand.toggleFailedTimeout = undefined;
                    radialCommand.toggleFailed = false;
                    radialCommand.button.Error = false;
                    this.changeDetectorRef.detectChanges();
                }, 7000);

                this.changeDetectorRef.detectChanges();
            }, 10000);

            this.changeDetectorRef.detectChanges();
        }
    }

    onOpen(): void {
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                    if (this.platform.id === platform.id) {
                        this.updateStates();
                    }
                }
            });
    }

    onClose(): void {
        this.ngUnsubscribe.next();
    }

    updateStates(): void {
        let updated: boolean = false;

        for (let index in this.radialCommands) {
            if (!this.radialCommands[index].command) {
                continue;
            }

            let state = this.getCommandState(this.radialCommands[index].command);

            if (state !== this.radialCommands[index].state) {
                updated = true;
                let selected = false;
                let active = true;

                if (state === ActionStateValue.Disable) {
                    active = false;
                } else if (state === ActionStateValue.On && this.radialCommands[index].command.toggleCommand) {
                    selected = true;
                }

                this.radialCommands[index].state = state;
                this.radialCommands[index].button.Active = active;
                this.radialCommands[index].button.Selected = selected;

                if (this.radialCommands[index].loading) {
                    if (this.radialCommands[index].toggleTimeout) {
                        clearTimeout(this.radialCommands[index].toggleTimeout);
                        this.radialCommands[index].toggleTimeout = undefined;
                    }
                    
                    this.radialCommands[index].loading = false;
                }

                if (this.radialCommands[index].toggleFailedTimeout) {
                    clearTimeout(this.radialCommands[index].toggleFailedTimeout);
                    this.radialCommands[index].toggleFailedTimeout = undefined;
                } else if (this.radialCommands[index].toggleFailed) {
                    this.radialCommands[index].toggleFailed = false;
                    this.radialCommands[index].button.Error = false;
                }
            }
        }

        if (updated) {
            this.changeDetectorRef.detectChanges();
        }
    }

    getCommandState(command: CommandCollectionItem): ActionStateValue {
        if (command.toggleCommand) {
            // Toggle command, the command state comes from the platform state values
            return this.platformService.getPlatformState(this.platform, command.platformStateNameValue);
        } else {
            // Non toggle command, so the command state is specific to the command
            return this.platformService.getPlatformCommandState(this.platform, command.onCommand.CommandName);
        }
    }

    getCommandDefinition(radialCommand: PlatformRadialCommand): CommandDefinition {
        let command: CommandDefinition = radialCommand.command.onCommand;

        // If this is a toggle command and the current state is true, use the off command
        if (radialCommand.command.toggleCommand && radialCommand.state === ActionStateValue.On) {
            command = radialCommand.command.offCommand;
        } else if (!radialCommand.command.toggleCommand) {
            if (radialCommand.state === ActionStateValue.Off) {
                if (!radialCommand.command.offCommand) {
                    return;
                }
                command = radialCommand.command.offCommand;
            }
        }

        return command;
    }

    ngOnDestroy(): void {
        for (let index in this.radialCommands) {
            if (!this.radialCommands[index].command) {
                continue;
            }

            if (this.radialCommands[index].toggleFailedTimeout) {
                clearTimeout(this.radialCommands[index].toggleFailedTimeout);
            }
            if (this.radialCommands[index].toggleTimeout) {
                clearTimeout(this.radialCommands[index].toggleTimeout);
            }
        }

        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}