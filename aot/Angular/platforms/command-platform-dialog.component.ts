import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PlatformService } from './platform.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { Alarm } from '../alarms/alarm.class';
import { Platform } from '../platforms/platform.class';
import { CommandDefinition, PlatformCommand, CommandName, Parameter, ParameterName, ParameterType, ParameterDefinition } from '../patrols/action.class';
import { Modal } from '../shared/modal.component';
import { SayPlayChooser } from '../shared/say-play-chooser.component';
import { Subject } from 'rxjs/Subject';

@Component({
	selector: 'command-platform-dialog',
	templateUrl: 'command-platform-dialog.component.html',
	styleUrls: ['command-platform-dialog.component.css']
})
export class CommandPlatformDialog {
	commandDef: CommandDefinition;
	platform: Platform;
	commandName: CommandName;
	value: string;

	@ViewChild(Modal) commandPlatformModal: Modal;
	@ViewChild('platformSayPlay') platformSayPlay: SayPlayChooser;

	private ngUnsubscribe: Subject<void> = new Subject<void>();

	private CommandName: typeof CommandName = CommandName;
	private selectedCommand: CommandName;
	private customItem: string;
	private sliderValue: string;
	private parameterList: Parameter[] = null;
	private alarm: Alarm = null;

	public constructor(private ref: ChangeDetectorRef, private platformService: PlatformService, public platformMapService: PlatformMapService) {
		this.platformService.showPlatformCommandDialog
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (obj) => this.show(obj.commandDef, obj.platform, obj.parameterList, obj.alarm)
			});
	}

	show(commandDef: CommandDefinition, platform: Platform, parameterList?: Parameter[], alarm?: Alarm) {
		this.commandDef = commandDef;
		this.platform = platform;
		this.parameterList = parameterList;
		this.alarm = alarm;
		this.commandName = commandDef.CommandName;
		this.selectedCommand = commandDef.CommandName;
		this.value = null;

        this.commandPlatformModal.show();
	}

	onSliderChanged(event: any) {
		this.customItem = event.value;
		this.customValueChange(this.customItem);
	}

	cancel() {
		this.platformMapService.removeGoToLocationIcon();
		this.hide();
	}

    hide() {
        if (this.selectedCommand === CommandName.SayMessage ||
            this.selectedCommand === CommandName.Play) {
            this.platformSayPlay.setCustomValue(null);
        }

		this.customItem = '';
		this.commandPlatformModal.hide();
	}

	public selectItem(name: string): void {
		this.commandName = CommandName[name];
		this.selectedCommand = CommandName[name];
		this.value = null;
	}

	public commandChange(commandName: CommandName): void {
		this.selectedCommand = commandName;
	}

	public customValueChange(data: string) {
		this.value = data;
	}

	getParameters(): Parameter[] {
		let commandParams = this.commandDef.Parameters && this.commandDef.Parameters.length ? this.commandDef.Parameters[0] : null;
		if (this.selectedCommand === CommandName.Volume) {
			commandParams = new ParameterDefinition();
			commandParams.Name = ParameterName.Percent;
			commandParams.Type = ParameterType.Int;
		}

		if (!commandParams)
			return null;

		let param = new Parameter({ Name: commandParams.Name, Value: this.value, Type: commandParams.Type });
		return new Array<Parameter>(param);
	}

	commandChanged(commandName: CommandName) {
		this.selectedCommand = commandName;
	}

	valueChanged(value: string) {
		this.value = value;
	}

	executeCommand(closeModal: boolean) {
		let platformCommand = new PlatformCommand(this.platform.id, this.selectedCommand, this.parameterList || this.getParameters());
		this.platformService.executePlatformCommand(platformCommand, this.platform.TenantId);
		if (this.selectedCommand === CommandName.SayMessage) {
			this.platformSayPlay.setCustomValue(null);
		}

		if (closeModal) {
			this.hide();
		}
	}

	getParameterList(commandName: CommandName): ParameterDefinition | any {
		let platform = this.platformService.getPlatform(this.platform.id);

		for (let command of platform.Commands) {
			if (command.CommandName === commandName) {
				if (command.Parameters) {
					return command.Parameters[0];
				}
			}
		}

		return [];
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}