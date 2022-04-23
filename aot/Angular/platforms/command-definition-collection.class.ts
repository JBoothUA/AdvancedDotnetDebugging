import { CommandDefinition, CommandName, ActionScope, ActionType } from './../patrols/action.class';

export class CommandCollection {
    commands: CommandCollectionItem[] = [];

    constructor(definitions: CommandDefinition[]) {
        for (let index in definitions) {
            // try to find an existing command with the same name
            let existing = this.commands.find((element) => {
                let name: string;

                // If the command is tied to a platform state value, use that as the name so that
                // we can properly group the toggle commands together
                if (definitions[index].PlatformStateValueName) {
                    name = definitions[index].PlatformStateValueName;
                } else {
                    name = (definitions[index].CommandName ? definitions[index].CommandName.toString() : definitions[index].DisplayName);
                }
                return element.name === name;
            });

            // Found a command with the same name, so group this definition with that command
            if (existing) {
                existing.addDefinition(definitions[index]);
            } else {
                this.commands.push(new CommandCollectionItem(definitions[index]));
            }
        }
    }

    commandsByCategory(category: string): CommandCollectionItem[] {
        let commandList: CommandCollectionItem[];

        for (let index in this.commands) {
            if (this.commands[index].category === category) {
                commandList.push(this.commands[index]);
            }
        }

        return commandList;
    }
}

export class CommandCollectionItem {
    name: string;
    displayName: string;
    category: string;
    platformStateNameValue: string;
    onCommand: CommandDefinition;
    offCommand: CommandDefinition;
    toggleCommand: boolean = false;
    isQuickAction: boolean;

    constructor(definition: CommandDefinition) {
        // Null PlatformStateValueName is a standalone command, so it is the onCommand
        // Otherwise, set the on/off command based upon the toggle state value
        if (!definition.PlatformStateValueName) {
            this.onCommand = definition;
        } else if (definition.ToggleState) {
            this.onCommand = definition;
        } else {
            this.offCommand = definition;
        }

        if (definition.ActionType === ActionType.Toggle) {
            this.toggleCommand = true;
        }

        // If the command is tied to a platform state value, use that as the name so that
        // we can properly group the toggle commands together
        if (definition.PlatformStateValueName) {
            this.name = definition.PlatformStateValueName;
        } else {
            // Command may not have a name (ie, robot monitor) so use the display name in that case
            this.name = (definition.CommandName ? definition.CommandName.toString() : definition.DisplayName);
        }

        this.displayName = definition.DisplayName;
        this.category = definition.Category;
        this.isQuickAction = definition.IsQuickAction;
        this.platformStateNameValue = definition.PlatformStateValueName;
    }

    addDefinition(definition: CommandDefinition): void {
        // set the defintion as the on/off command based upon togglestate
        if (definition.ToggleState) {
            this.onCommand = definition;
        } else {
            this.offCommand = definition;
        }
    }
}