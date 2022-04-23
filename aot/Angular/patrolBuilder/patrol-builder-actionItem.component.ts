import {
	Component, ChangeDetectionStrategy, Input, Output,
	OnInit, EventEmitter, ViewChild, ChangeDetectorRef
} from '@angular/core';

import { PatrolService } from '../patrols/patrol.service';
import { PointTemplate } from '../patrols/point.class';
import { AreaType } from '../patrols/patrol.class';
import { ActionDefinition, ActionBase, ActionType, CommandName, Parameter } from '../patrols/action.class';
import { SayPlayChooser } from '../shared/say-play-chooser.component';

@Component({
	selector: 'patrol-builder-action-item',
	templateUrl: 'patrol-builder-actionItem.component.html',
	styleUrls: ['patrol-builder-actionItem.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatrolBuilderActionItem implements OnInit {
	@Input() action: ActionBase;
	@Input() patrolPoints: PointTemplate[];
	@Input() patrolAreaType: AreaType;
	@Input() command: CommandName;
	@Input() dirtyToggle: boolean;
	@Input() actionDef: ActionDefinition;
	@Input() index: number;
	@Input() commandDisplayName: string;

	@Output() onActionDeleted: EventEmitter<number> = new EventEmitter<number>();
	@Output() onActionCopied: EventEmitter<number> = new EventEmitter<number>();

	@ViewChild('sayPlayChooser') sayPlayComp: SayPlayChooser;

	ActionType: typeof ActionType = ActionType;

	public isPresetValue: boolean;
	public isCustomValue: boolean;
	public presetValue: any;
	public customValue: any;

	constructor(private patrolService: PatrolService, private changeRef: ChangeDetectorRef) {

	}
	ngOnInit(): void {
		this.isCustomValue = false;
		this.isPresetValue = false;
		this.customValue = "";
		this.presetValue = "";

		if (this.actionDef && this.actionDef.Parameters.length > 0) {
			for (let preset of this.actionDef.Parameters[0].Presets) {
				if (this.action.Parameters[0].Value === preset.StringValue) {
					this.isPresetValue = true;
					this.presetValue = this.action.Parameters[0].Value;
					break;
				}
			}

			if (!this.presetValue) {
				this.isCustomValue = true;
				this.customValue = this.action.Parameters[0].Value;
			}
			this.commandDisplayName = this.actionDef.DisplayName;
		}
	}
	ngAfterViewInit() {
        if (this.sayPlayComp && this.action.Parameters[0].Value) {
			this.sayPlayComp.setValue(this.action.Command, this.action.Parameters[0].Value);
		}
	}

	public getOrientMapZoom(): number {
		let zoom: number = 18;
		if (this.patrolAreaType === AreaType.Small) {
			zoom = 20;
		} else if (this.patrolAreaType === AreaType.Large) {
			zoom = 18;
		} else {
			zoom = 16;
		}
		return (zoom);
	}

	public getActionDisplayName(actionDef: ActionDefinition, action: ActionBase, index: number) {
		let str = actionDef ? actionDef.DisplayName : 'Unknown Command: ' + CommandName[action.Command];
		if (index === 0) {
			str += ' (1st Action)';
		}
		else if (index === 1) {
			str += ' (2nd Action)';
		}
		else if (index === 2) {
			str += ' (3rd Action)';
		}
		else {
			str += (' (' + (index + 1).toString() + 'th Action)');
		}

		this.commandDisplayName = str;
		return (str);
	}

	public setPresetValue(value: any) {
		this.isPresetValue = true;
		this.presetValue = value;
		this.isCustomValue = false;
		this.customValue = null;
		this.action.Parameters[0].Value = value;
	}

	public setCustomValue(event: any) {
		this.isCustomValue = true;
		this.isPresetValue = false;
		if (event) {
			this.customValue = event.currentTarget.value;
		}
		this.action.Parameters[0].Value = this.customValue;
	}
	public isDwellPreset(presetValue: string): boolean {

		if (this.isPresetValue && presetValue === this.action.Parameters[0].Value) {
			return (true);
		}
		else {
			return (false);
		}
	}

	public isDwellCustomValue(): boolean {

		return (this.isCustomValue);
	}

	public toggleChanged(state: boolean) {
		if (this.actionDef) {
			if (state === true) {
				// Set to the toggle on command
				this.action.Command = this.actionDef.Command[1];
				this.command = this.action.Command;
				this.action.DirtyToggle = !this.action.DirtyToggle;
				this.changeRef.detectChanges();
			}
			else {
				// Set to the toggle off command
				this.action.Command = this.actionDef.Command[0];
				this.action.DirtyToggle = !this.action.DirtyToggle;
				this.changeRef.detectChanges();
			}
		}
	}

	public deleteAction() {
		this.onActionDeleted.emit(this.index);
	}

	public copyAction() {
		this.onActionCopied.emit(this.index);
	}

	public getSayCommandParameters() {
		let actDefCmd = this.getActionDefinitionByActionType(ActionType.Say);
		return (actDefCmd.Parameters[0]);
	}

	public getPlayCommandParameters() {
		let actDefCmd = this.getActionDefinitionByActionType(ActionType.Play);
		return (actDefCmd.Parameters[0]);
	}

	public getActionDefinitionByActionType(actionType: ActionType): ActionDefinition {
		let found = false;
		let actionDef: ActionDefinition;
		let actDefs = this.patrolService.getActionDefinitions()[0];
		for (let actionCat of actDefs.Categories) {
			for (actionDef of actionCat.ActionDefinitions) {
				if (actionDef.ActionType === actionType) {
					found = true;
					return (actionDef);
				}
			}
		}
		return null;
	}

	public getActionDefinitionByCommand(command: CommandName): ActionDefinition {
		let found = false;
		let actionDef: ActionDefinition;
		let actDefs = this.patrolService.getActionDefinitions()[0];
		for (let actionCat of actDefs.Categories) {
			for (actionDef of actionCat.ActionDefinitions) {
				for (let actDefCmd of actionDef.Command) {
					if (actDefCmd === command) {
						found = true;
						return (actionDef);
					}
				}
			}
		}

		return null;
	}

	public onSayPlayCommandChange(event: any) {
		if (this.action.Command) {
			this.action.Command = event;
			this.command = event;
			this.actionDef = this.getActionDefinitionByCommand(this.action.Command);
			this.action.Parameters = [];
			for (let ii = 0; ii < this.actionDef.Parameters.length; ii++) {
				let param: Parameter = new Parameter(null);
				param.Name = this.actionDef.Parameters[ii].Name;
				param.Type = this.actionDef.Parameters[ii].Type;
				param.Value = "";
				this.action.Parameters.push(param);
			}
			this.action.DirtyToggle = !this.action.DirtyToggle;
		}
		this.changeRef.detectChanges();
	}

	public onSayPlayValueChange(event: any) {
		this.action.Parameters[0].Value = event;
		this.action.DirtyToggle = !this.action.DirtyToggle;
		this.changeRef.detectChanges();
	}

	public onOrientationValueChange(event: any) {
		this.action.Parameters[0].Value = event;
		this.action.DirtyToggle = !this.action.DirtyToggle;
		this.changeRef.detectChanges();
	}
}