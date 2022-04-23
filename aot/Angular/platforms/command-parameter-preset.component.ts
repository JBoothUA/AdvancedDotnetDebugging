import {
	Component,
	ChangeDetectionStrategy,
	Input,
	trigger,
	state,
	style,
	animate,
	transition,
	OnInit
} from '@angular/core';

import { Platform } from './../platforms/platform.class';
import { CommandDefinition, CommandName, Parameter, PlatformCommand } from './../patrols/action.class';
import { PlatformService } from './platform.service';
import { DataValue } from './../shared/shared-interfaces';

@Component({
	selector: 'command-parameter-preset',
	templateUrl: 'command-parameter-preset.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommandParameterPreset implements OnInit {
	@Input() parametername: string;
	@Input() preset: DataValue;

	constructor(public platformService: PlatformService) { }

	ngOnInit(): void { }

	getPresetValue(): string {
		return "";
	}
}