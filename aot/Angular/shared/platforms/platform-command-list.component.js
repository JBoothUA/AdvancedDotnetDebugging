var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Platform } from '../../platforms/platform.class';
import { PlatformService } from '../../platforms/platform.service';
import { CommandName } from '../../patrols/action.class';
var PlatformCommandList = /** @class */ (function () {
    function PlatformCommandList(platformService, ref, elementRef) {
        this.platformService = platformService;
        this.ref = ref;
        this.elementRef = elementRef;
        this.disableClickPropagation = false;
        this.hideVideoControlSection = false;
        this.actions = [];
        this.navigation = [];
        this.controls = [];
    }
    PlatformCommandList.prototype.ngOnInit = function () {
        if (this.disableClickPropagation) {
            L.DomEvent.disableClickPropagation(this.elementRef.nativeElement);
        }
        var commandCollection = this.platformService.getCommandDefinitions(this.platform);
        for (var index in commandCollection.commands) {
            if (commandCollection.commands[index].isQuickAction) {
                // TODO: Category should probably not be a string
                if (commandCollection.commands[index].category === 'Robot Navigation') {
                    this.navigation.push(commandCollection.commands[index]);
                }
                else if (commandCollection.commands[index].category === 'Video & Controls') {
                    this.controls.push(commandCollection.commands[index]);
                }
                else {
                    this.actions.push(commandCollection.commands[index]);
                }
            }
        }
        this.sortCommands();
        // Find abort patrol command
        var abort = commandCollection.commands.find(function (element) {
            return element.onCommand && element.onCommand.CommandName === CommandName.Abort;
        });
        if (abort) {
            this.abortPatrol = abort;
        }
        // Find pause patrol command
        var pause = commandCollection.commands.find(function (element) {
            return element.onCommand && element.onCommand.CommandName === CommandName.PausePatrol;
        });
        if (pause) {
            this.pausePatrol = pause;
        }
        // Find resume patrol command
        var resume = commandCollection.commands.find(function (element) {
            return element.onCommand && element.onCommand.CommandName === CommandName.ResumePatrol;
        });
        if (resume) {
            this.resumePatrol = resume;
        }
        // Find estop command
        var eStop = commandCollection.commands.find(function (element) {
            return element.onCommand && element.onCommand.CommandName === CommandName.EStop;
        });
        if (eStop) {
            this.eStop = eStop;
        }
    };
    PlatformCommandList.prototype.sortCommands = function () {
        this.navigation.sort(this.alphaSort);
        this.actions.sort(this.alphaSort);
        this.controls.sort(this.alphaSort);
    };
    PlatformCommandList.prototype.alphaSort = function (a, b) {
        if (a.displayName < b.displayName) {
            return -1;
        }
        if (a.displayName > b.displayName) {
            return 1;
        }
        return 0;
    };
    __decorate([
        Input(),
        __metadata("design:type", Platform)
    ], PlatformCommandList.prototype, "platform", void 0);
    __decorate([
        Input('callback'),
        __metadata("design:type", Function)
    ], PlatformCommandList.prototype, "callbackFunc", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PlatformCommandList.prototype, "disableClickPropagation", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PlatformCommandList.prototype, "hideVideoControlSection", void 0);
    PlatformCommandList = __decorate([
        Component({
            selector: 'platform-command-list',
            templateUrl: 'platform-command-list.component.html',
            styleUrls: ['platform-command-list.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PlatformService, ChangeDetectorRef, ElementRef])
    ], PlatformCommandList);
    return PlatformCommandList;
}());
export { PlatformCommandList };
//# sourceMappingURL=platform-command-list.component.js.map