import {
    Component, Input, ChangeDetectionStrategy,
    OnInit, ChangeDetectorRef, ElementRef
} from '@angular/core';
import { Platform } from '../../platforms/platform.class';
import { PlatformService } from '../../platforms/platform.service';
import { CommandName } from '../../patrols/action.class';
import { CommandCollection, CommandCollectionItem } from '../../platforms/command-definition-collection.class';

@Component({
    selector: 'platform-command-list',
    templateUrl: 'platform-command-list.component.html',
    styleUrls: ['platform-command-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformCommandList {
	@Input() platform: Platform;
	@Input('callback') callbackFunc: () => void;
    @Input() disableClickPropagation: boolean = false;
    @Input() hideVideoControlSection: boolean = false;

    actions: CommandCollectionItem[] = [];
    navigation: CommandCollectionItem[] = [];
    controls: CommandCollectionItem[] = [];
    abortPatrol: CommandCollectionItem;
    pausePatrol: CommandCollectionItem;
    resumePatrol: CommandCollectionItem;
    eStop: CommandCollectionItem;

    constructor(private platformService: PlatformService, private ref: ChangeDetectorRef, private elementRef: ElementRef) { }

    ngOnInit(): void {
        if (this.disableClickPropagation) {
            L.DomEvent.disableClickPropagation(this.elementRef.nativeElement);
        }

        let commandCollection = this.platformService.getCommandDefinitions(this.platform);

        for (let index in commandCollection.commands) {
            if (commandCollection.commands[index].isQuickAction) {
                // TODO: Category should probably not be a string
                if (commandCollection.commands[index].category === 'Robot Navigation') {
                    this.navigation.push(commandCollection.commands[index]);
                } else if (commandCollection.commands[index].category === 'Video & Controls') {
                    this.controls.push(commandCollection.commands[index]);
                } else {
                    this.actions.push(commandCollection.commands[index]);
                }
            }
        }

        this.sortCommands();

        // Find abort patrol command
        let abort = commandCollection.commands.find((element) => {
            return element.onCommand && element.onCommand.CommandName === CommandName.Abort;
        });

        if (abort) {
            this.abortPatrol = abort;
        }

        // Find pause patrol command
        let pause = commandCollection.commands.find((element) => {
            return element.onCommand && element.onCommand.CommandName === CommandName.PausePatrol;
        });

        if (pause) {
            this.pausePatrol = pause;
        }

        // Find resume patrol command
        let resume = commandCollection.commands.find((element) => {
            return element.onCommand && element.onCommand.CommandName === CommandName.ResumePatrol;
        });

        if (resume) {
            this.resumePatrol = resume;
        }

        // Find estop command
        let eStop = commandCollection.commands.find((element) => {
            return element.onCommand && element.onCommand.CommandName === CommandName.EStop;
        });

        if (eStop) {
            this.eStop = eStop;
        }
    }

    private sortCommands(): void {
        this.navigation.sort(this.alphaSort);
        this.actions.sort(this.alphaSort);
        this.controls.sort(this.alphaSort);
    }

    private alphaSort(a: CommandCollectionItem, b: CommandCollectionItem): number {
        if (a.displayName < b.displayName) {
            return -1;
        }
        if (a.displayName > b.displayName) {
            return 1;
        }
        return 0;
    }

}