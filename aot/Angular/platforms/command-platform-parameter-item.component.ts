import {
	Component,
	ChangeDetectionStrategy,
	Input,
	Output,
	EventEmitter,
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

@Component({
	selector: 'command-platform-parameter-item',
	templateUrl: 'command-platform-parameter-item.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommandPlatformParameterItem implements OnInit {
	@Input() parameter: Parameter;
	@Output() onValueChange = new EventEmitter();

	private item: string;

	constructor(public platformService: PlatformService) { }

	ngOnInit(): void { }

	public customValueChange(data: string) {
		this.onValueChange.emit(this.item);
	}
}