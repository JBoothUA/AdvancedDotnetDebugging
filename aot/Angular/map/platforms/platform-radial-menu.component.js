var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import { Component, Input, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { RadialMenu } from '../../shared/radial/radial-menu.component';
import { RadialMenuButton } from '../../shared/radial/radial-menu-button.class';
import { RadialMenuButtonImage } from '../../shared/radial/radial-menu-button-image.class';
import { Platform } from '../../platforms/platform.class';
import { PlatformService } from '../../platforms/platform.service';
import { PlatformMapService } from '../../map/platforms/platformMap.service';
import { CommandName, ActionStateValue } from '../../patrols/action.class';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var PlatformRadialCommand = /** @class */ (function () {
    function PlatformRadialCommand(name, state, command, button) {
        this.loading = false;
        this.toggleFailed = false;
        this.name = name;
        this.state = state;
        this.command = command;
        this.button = button;
    }
    return PlatformRadialCommand;
}());
var PlatformRadialMenu = /** @class */ (function (_super) {
    __extends(PlatformRadialMenu, _super);
    function PlatformRadialMenu(changeDetectorRef, elementRef, platformService, platformMapService) {
        var _this = _super.call(this, changeDetectorRef, elementRef) || this;
        _this.changeDetectorRef = changeDetectorRef;
        _this.elementRef = elementRef;
        _this.platformService = platformService;
        _this.platformMapService = platformMapService;
        _this.radialCommands = [];
        _this.ngUnsubscribe = new Subject();
        L.DomEvent.disableClickPropagation(_this.elementRef.nativeElement);
        _this.closeOnClick = false;
        // The higher the factor, the larger the diameter of the menu
        _this.sizeFactor = 38;
        _this.eventName = 'platformRadial';
        return _this;
    }
    PlatformRadialMenu.prototype.ngOnInit = function () {
        var commandCollection = this.platformService.getCommandDefinitions(this.platform);
        // Find orient command
        var orient = commandCollection.commands.find(function (element) {
            return element.onCommand && element.onCommand.CommandName === CommandName.OrientPlatform;
        });
        if (orient) {
            this.addButton(orient, 'Orient', new RadialMenuButtonImage('/Content/Images/Platforms/orient-radial.png', -2));
        }
        // Find flashers command
        var flashers = commandCollection.commands.find(function (element) {
            return element.onCommand && element.onCommand.CommandName === CommandName.FlashersOn;
        });
        if (flashers) {
            this.addButton(flashers, 'Flashers', new RadialMenuButtonImage('/Content/Images/Platforms/flashers-radial.png', -1));
        }
        // Find headlights command
        var headlights = commandCollection.commands.find(function (element) {
            return element.onCommand && element.onCommand.CommandName === CommandName.HeadlightsOn;
        });
        if (headlights) {
            this.addButton(headlights, 'Headlights', new RadialMenuButtonImage('/Content/Images/Platforms/headlights-radial.png', -2));
        }
        // Find play audio command
        var playAudio = commandCollection.commands.find(function (element) {
            return element.onCommand && element.onCommand.CommandName === CommandName.Play;
        });
        if (playAudio) {
            this.addButton(playAudio, 'Play Audio', new RadialMenuButtonImage('/Content/Images/Platforms/play-audio-radial.png', -1));
        }
        // Find siren command
        var siren = commandCollection.commands.find(function (element) {
            return element.onCommand && element.onCommand.CommandName === CommandName.SirenOn;
        });
        if (siren) {
            this.addButton(siren, 'Siren', new RadialMenuButtonImage('/Content/Images/Platforms/siren-radial.png', -1));
        }
        // Find snapshot command
        var snapshot = commandCollection.commands.find(function (element) {
            return element.onCommand && element.onCommand.CommandName === CommandName.Snapshot;
        });
        if (snapshot) {
            this.addButton(snapshot, 'Snapshot', new RadialMenuButtonImage('/Content/Images/Platforms/take-snapshot.png', -2));
        }
        // Create empty/invisible buttons to control placement of buttons
        for (var i = 0; i < 3; i++) {
            this.radialCommands.push(new PlatformRadialCommand('empty', undefined, undefined, new RadialMenuButton('', '', new RadialMenuButtonImage(''), null, false, false, false)));
        }
        // Find estop command
        var estop = commandCollection.commands.find(function (element) {
            return element.onCommand && element.onCommand.CommandName === CommandName.EStop;
        });
        if (estop) {
            this.addButton(estop, 'E-Stop', new RadialMenuButtonImage('/Content/Images/Platforms/E-stop-radial.png', -2, -2));
        }
    };
    PlatformRadialMenu.prototype.addButton = function (command, name, icon) {
        var _this = this;
        var state = this.getCommandState(command);
        var selected = false;
        var active = true;
        if (state === ActionStateValue.Disable) {
            active = false;
        }
        else if (state === ActionStateValue.On && command.toggleCommand) {
            selected = true;
        }
        var radialCommand = new PlatformRadialCommand(name, state, command);
        var button = new RadialMenuButton(this.platform.id, name, icon, function () { _this.executeCommand(radialCommand); }, selected, active, true);
        radialCommand.button = button;
        // Add button to radial menu buttons and to PlatformRadialCommand list so that they can be updated later
        this.buttons.push(button);
        this.radialCommands.push(radialCommand);
    };
    PlatformRadialMenu.prototype.executeCommand = function (radialCommand) {
        var _this = this;
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
            radialCommand.toggleTimeout = setTimeout(function () {
                // Turn off loading
                radialCommand.toggleTimeout = undefined;
                radialCommand.loading = false;
                radialCommand.button.Error = true;
                // Go in to error state
                radialCommand.toggleFailed = true;
                radialCommand.toggleFailedTimeout = setTimeout(function () {
                    // Turn off error state after 7 seconds
                    radialCommand.toggleFailedTimeout = undefined;
                    radialCommand.toggleFailed = false;
                    radialCommand.button.Error = false;
                    _this.changeDetectorRef.detectChanges();
                }, 7000);
                _this.changeDetectorRef.detectChanges();
            }, 10000);
            this.changeDetectorRef.detectChanges();
        }
    };
    PlatformRadialMenu.prototype.onOpen = function () {
        var _this = this;
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                if (_this.platform.id === platform.id) {
                    _this.updateStates();
                }
            }
        });
    };
    PlatformRadialMenu.prototype.onClose = function () {
        this.ngUnsubscribe.next();
    };
    PlatformRadialMenu.prototype.updateStates = function () {
        var updated = false;
        for (var index in this.radialCommands) {
            if (!this.radialCommands[index].command) {
                continue;
            }
            var state = this.getCommandState(this.radialCommands[index].command);
            if (state !== this.radialCommands[index].state) {
                updated = true;
                var selected = false;
                var active = true;
                if (state === ActionStateValue.Disable) {
                    active = false;
                }
                else if (state === ActionStateValue.On && this.radialCommands[index].command.toggleCommand) {
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
                }
                else if (this.radialCommands[index].toggleFailed) {
                    this.radialCommands[index].toggleFailed = false;
                    this.radialCommands[index].button.Error = false;
                }
            }
        }
        if (updated) {
            this.changeDetectorRef.detectChanges();
        }
    };
    PlatformRadialMenu.prototype.getCommandState = function (command) {
        if (command.toggleCommand) {
            // Toggle command, the command state comes from the platform state values
            return this.platformService.getPlatformState(this.platform, command.platformStateNameValue);
        }
        else {
            // Non toggle command, so the command state is specific to the command
            return this.platformService.getPlatformCommandState(this.platform, command.onCommand.CommandName);
        }
    };
    PlatformRadialMenu.prototype.getCommandDefinition = function (radialCommand) {
        var command = radialCommand.command.onCommand;
        // If this is a toggle command and the current state is true, use the off command
        if (radialCommand.command.toggleCommand && radialCommand.state === ActionStateValue.On) {
            command = radialCommand.command.offCommand;
        }
        else if (!radialCommand.command.toggleCommand) {
            if (radialCommand.state === ActionStateValue.Off) {
                if (!radialCommand.command.offCommand) {
                    return;
                }
                command = radialCommand.command.offCommand;
            }
        }
        return command;
    };
    PlatformRadialMenu.prototype.ngOnDestroy = function () {
        for (var index in this.radialCommands) {
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
    };
    __decorate([
        Input(),
        __metadata("design:type", Platform)
    ], PlatformRadialMenu.prototype, "platform", void 0);
    PlatformRadialMenu = __decorate([
        Component({
            selector: 'platform-radial-menu',
            templateUrl: 'platform-radial-menu.component.html',
            styleUrls: ['../../shared/radial/radial-menu.component.css', 'platform-radial-menu.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [ChangeDetectorRef, ElementRef, PlatformService,
            PlatformMapService])
    ], PlatformRadialMenu);
    return PlatformRadialMenu;
}(RadialMenu));
export { PlatformRadialMenu };
//# sourceMappingURL=platform-radial-menu.component.js.map