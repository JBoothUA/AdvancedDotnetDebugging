import {
	Component,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	OnInit,
	ViewChild,
	Output,
	EventEmitter,
	SimpleChange
} from '@angular/core';

import { PatrolTemplate } from '../patrols/patrol.class';
import { PointTemplate } from '../patrols/point.class';
import { ActionDefinition, ActionDefinitions, ActionBase, Parameter, CommandName, ParameterName, ParameterType } from '../patrols/action.class';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolBuilderService } from './patrol-builder.service';
import { DragulaService } from 'ng2-dragula';
import { Modal } from '../shared/modal.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

@Component({
	selector: 'patrol-builder-actionsDialog',
	templateUrl: 'patrol-builder-actionsDialog.component.html',
	styleUrls: ['patrol-builder-actionsDialog.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatrolBuilderActionsDialog implements OnInit {
	@ViewChild(Modal) errorDialog: Modal;
	visible: boolean = false;
	animatedOpaque: boolean = false;

	public patrolPoints: PointTemplate[];
	public patrolPoint: PointTemplate;
	public patrol: PatrolTemplate;
	private actions: ActionBase[];
	public description: string;
	public descriptionDisabled: boolean;
	public warningIcon: string;
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	private actDefs: ActionDefinitions[];

	//private dragging: boolean;

	constructor(
		private patrolService: PatrolService,
		private patrolBuilderService: PatrolBuilderService,
		private dragulaService: DragulaService,
		private changeRef: ChangeDetectorRef) {
		dragulaService.setOptions('actionItemList', {
            copy: function (el: any, source: any) {
				return source.id !== 'actionItemListDropZone' && source.id !== 'actionItemEmptyListDropZone';
			},
			moves: function (el: any, container: any, handle: any) {
				if (el.dataset.catindex) {
					return (true);
				}
				else {
					return handle.classList.contains('pbActions-dragIconImg');
				}
			},
			accepts: function (el: any, target: any, source: any, sibling: any) {
				return target.id === 'actionItemListDropZone' || target.id === 'actionItemEmptyListDropZone';
			},
			revertOnSpill: true
		});
	}
	ngOnInit(): void {

		this.actDefs = this.patrolService.getActionDefinitions();
		this.warningIcon = '../../Content/Images/warning.png';
		this.patrolBuilderService.patrolPointModified
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (patrolPoint) => this.patrolPointsModified()
			});

		//this.dragulaService.shadow
		//	.takeUntil(this.ngUnsubscribe)
		//	.subscribe({
		//		next: (value) => this.actionDefDragged(value)
		//	});

		//this.dragulaService.drag
		//	.takeUntil(this.ngUnsubscribe)
		//	.subscribe({
		//		next: (value) => this.actionDefDragged(value)
		//	});

		this.dragulaService.drop
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (value) => this.actionDefDropped(value)
			});
	}

	ngOnChanges(changes: { [propName: string]: SimpleChange }) {
		//console.log('actions dialog change');
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	public patrolPointsModified() {
		this.changeRef.detectChanges();
	}

	//public actionDefDragged(value: any) {
	//}

	//public actionDefCloned(value: any) {
	//	let myValue = value;
	//	let temp = 0;
	//}

  	public actionDefDropped(value: any) {

		// Check to see if we are dragging from the action definition list.
		if (value[1].dataset.catindex && value[1].dataset.actdefindex) {
			let catIndex = parseInt(value[1].dataset.catindex);
			let actDefIndex = parseInt(value[1].dataset.actdefindex);
			let actDef = this.actDefs[0].Categories[catIndex].ActionDefinitions[actDefIndex];
			if (value[2]) {
				value[2].removeChild(value[1]);
			}

			let beforeIdx = value[4] && value[4].dataset.actionindex? parseInt(value[4].dataset.actionindex): -1;
			this.addAction(actDef, beforeIdx);
		}
		else {
			// We are just doing a reorder of the actions list.  Need to reorder the actions
			// array.
			if (value[2] && value[3] && value[2] === value[3]) {
				let actIndex = parseInt(value[1].dataset.actionindex);
				if (actIndex || actIndex === 0) {
					let action = this.actions[actIndex];
					let beforeIdx = value[4] && value[4].dataset.actionindex ? parseInt(value[4].dataset.actionindex) : -1;
					if (beforeIdx === -1) {
						// Moving action to the end
						this.actions.splice(actIndex, 1);
						this.actions.push(action);
					}
					else {
						if (actIndex > beforeIdx) {
							this.actions.splice(actIndex, 1);
							this.actions.splice(beforeIdx, 0, action);
						}
						else {
							this.actions.splice(actIndex, 1);
							this.actions.splice(beforeIdx - 1, 0, action);
						}
					}
					this.changeRef.markForCheck();
					this.patrolBuilderService.notifyPatrolPointModified(this.patrolPoint);
				}
			}
		}
	}

	public show(patrol: PatrolTemplate, patrolPoint: PointTemplate) {
		this.patrolPoint = patrolPoint;
		this.patrolPoints = [];
		this.patrol = patrol;

		let selectedCnt = 0;
		for (let ii = 0; ii < this.patrol.Points.length; ii++) {
			if (this.patrol.Points[ii].Selected) {
				selectedCnt++;
				this.patrolPoints.push(this.patrol.Points[ii]);
			}
		}

		this.actions = [];

		if (selectedCnt === 1) {
			for (let ii = 0; ii < this.patrolPoint.Actions.length; ii++) {
				let action = new ActionBase(this.patrolPoint.Actions[ii]);
				this.actions.push(action);
			}
			this.description = this.patrolPoint.Description;
			this.descriptionDisabled = false;
		}
		else {
			this.description = '';
			this.descriptionDisabled = true;

		}

		this.visible = true;
		setTimeout(() => {
			this.animatedOpaque = true;
			this.changeRef.detectChanges();
		});

	}
	public validateActions(): boolean {
		let isValid = true;

		for (let ii = 0; this.actions && ii < this.actions.length; ii++) {
			let action = this.actions[ii];
			for (let jj = 0; action.Parameters && jj < action.Parameters.length; jj++) {
				let param = action.Parameters[jj];
				if (typeof(param.Value) === 'undefined' || param.Value === '' || param.Value === null) {
					isValid = false;
					this.errorDialog.show();
				}
			}
		}
		return isValid;
	}
	public hideErrorDialog() {
		this.errorDialog.hide();
	}
	public cancel() {
		this.animatedOpaque = false;
		setTimeout(() => { this.visible = false; this.changeRef.detectChanges(); } , 400);
	}

	public save() {
		// Validate that all actions have required values
		if (this.validateActions() === true) {
			for (let ii = 0; ii < this.patrol.Points.length; ii++) {
				let patrolPoint = this.patrol.Points[ii];
				if (patrolPoint.Selected === true) {
					patrolPoint.Actions = this.copyActionList(this.actions);
					patrolPoint.Description = this.description;
				}
			}
			this.patrolBuilderService.updatePointOrdinalAndDisplayNames(this.patrol, this.patrol.Points[0], 0);
			this.animatedOpaque = false;

			this.patrolBuilderService.notifyPatrolPointModified(this.patrolPoint);
			setTimeout(() => { this.visible = false; this.changeRef.detectChanges(); }, 400);
		}
	}

	private copyActionList(actions: ActionBase[]) : ActionBase[] {
		let newActions: ActionBase[] = [];

		for (let ii = 0; ii < actions.length; ii++) {
			let action = new ActionBase(actions[ii]);
			newActions.push(action);
		}

		return newActions;
	}

	public copyAction(index: number) {
		let newAction: ActionBase = new ActionBase(null);
		let sourceAction: ActionBase = this.actions[index];

		newAction.ActionId = this.patrolBuilderService.createGUID();
		newAction.Command = sourceAction.Command;

		if (sourceAction.Parameters && sourceAction.Parameters.length > 0) {
			newAction.Parameters = [];
			for (let ii = 0; ii < sourceAction.Parameters.length; ii++) {
				let param: Parameter = new Parameter(null);
				param.Name = sourceAction.Parameters[ii].Name;
				param.Type = sourceAction.Parameters[ii].Type;
				param.Value = sourceAction.Parameters[ii].Value;
				newAction.Parameters.push(param);
			}
		}
		this.actions.push(newAction);
		this.patrolBuilderService.notifyPatrolPointModified(this.patrolPoint);
	}

	public deleteAction(index: number) {
		this.actions.splice(index, 1);
		this.changeRef.detectChanges();
		this.patrolBuilderService.notifyPatrolPointModified(this.patrolPoint);
	}

	addAction(actionDef: ActionDefinition, beforeIdx: number) {

		let newAction: ActionBase = new ActionBase(null);
		newAction.ActionId = this.patrolBuilderService.createGUID();
		newAction.Command = actionDef.Command[0];
		if (actionDef.Parameters && actionDef.Parameters.length > 0) {
			newAction.Parameters = [];
			for (let ii = 0; ii < actionDef.Parameters.length; ii++) {
				let param: Parameter = new Parameter(null);
				param.Name = actionDef.Parameters[ii].Name;
				param.Type = actionDef.Parameters[ii].Type;
				param.Value = '';
				newAction.Parameters.push(param);
			}
        }

        //JJL work around for hard coded snapshot
        if (newAction.Command === CommandName.Snapshot) {
            newAction.Parameters = [{
                Name: ParameterName.Camera,
                Value: 'All',
                Type: ParameterType.String,
            } as Parameter];
        }

		if (beforeIdx !== -1) {
			this.actions.splice(beforeIdx, 0, newAction);
		}
		else {
			this.actions.push(newAction);
		}
		this.patrolBuilderService.notifyPatrolPointModified(this.patrolPoint);
	}

	public toggleSelectedActionDef(actionDef: ActionDefinition) {

		if (actionDef.Selected) {
			this.patrolBuilderService.deselectActionDef(actionDef);
		}
		else {
			this.patrolBuilderService.selectActionDef(actionDef);
		}
	}
}