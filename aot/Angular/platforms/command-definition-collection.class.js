import { ActionType } from './../patrols/action.class';
var CommandCollection = /** @class */ (function () {
    function CommandCollection(definitions) {
        this.commands = [];
        for (var index in definitions) {
            // try to find an existing command with the same name
            var existing = this.commands.find(function (element) {
                var name;
                // If the command is tied to a platform state value, use that as the name so that
                // we can properly group the toggle commands together
                if (definitions[index].PlatformStateValueName) {
                    name = definitions[index].PlatformStateValueName;
                }
                else {
                    name = (definitions[index].CommandName ? definitions[index].CommandName.toString() : definitions[index].DisplayName);
                }
                return element.name === name;
            });
            // Found a command with the same name, so group this definition with that command
            if (existing) {
                existing.addDefinition(definitions[index]);
            }
            else {
                this.commands.push(new CommandCollectionItem(definitions[index]));
            }
        }
    }
    CommandCollection.prototype.commandsByCategory = function (category) {
        var commandList;
        for (var index in this.commands) {
            if (this.commands[index].category === category) {
                commandList.push(this.commands[index]);
            }
        }
        return commandList;
    };
    return CommandCollection;
}());
export { CommandCollection };
var CommandCollectionItem = /** @class */ (function () {
    function CommandCollectionItem(definition) {
        this.toggleCommand = false;
        // Null PlatformStateValueName is a standalone command, so it is the onCommand
        // Otherwise, set the on/off command based upon the toggle state value
        if (!definition.PlatformStateValueName) {
            this.onCommand = definition;
        }
        else if (definition.ToggleState) {
            this.onCommand = definition;
        }
        else {
            this.offCommand = definition;
        }
        if (definition.ActionType === ActionType.Toggle) {
            this.toggleCommand = true;
        }
        // If the command is tied to a platform state value, use that as the name so that
        // we can properly group the toggle commands together
        if (definition.PlatformStateValueName) {
            this.name = definition.PlatformStateValueName;
        }
        else {
            // Command may not have a name (ie, robot monitor) so use the display name in that case
            this.name = (definition.CommandName ? definition.CommandName.toString() : definition.DisplayName);
        }
        this.displayName = definition.DisplayName;
        this.category = definition.Category;
        this.isQuickAction = definition.IsQuickAction;
        this.platformStateNameValue = definition.PlatformStateValueName;
    }
    CommandCollectionItem.prototype.addDefinition = function (definition) {
        // set the defintion as the on/off command based upon togglestate
        if (definition.ToggleState) {
            this.onCommand = definition;
        }
        else {
            this.offCommand = definition;
        }
    };
    return CommandCollectionItem;
}());
export { CommandCollectionItem };
//# sourceMappingURL=command-definition-collection.class.js.map