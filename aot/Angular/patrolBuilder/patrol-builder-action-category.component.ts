import {
	Component,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Input,
	Output,
	EventEmitter,
	OnInit
} from '@angular/core';

import { PatrolType } from '../patrols/patrol.class';
import { PointTemplate } from '../patrols/point.class';
import { PatrolService } from "../patrols/patrol.service";
import { PatrolBuilderService } from "./patrol-builder.service";
import { PatrolMapService } from "../map/patrols/patrolMap.service";
import { ActionCategory, ActionDefinition, ActionBase, ActionType, CommandName } from "../patrols/action.class";
import { slideDown } from '../shared/animations';
import { DragulaService } from 'ng2-dragula';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

@Component({
	selector: 'patrol-builder-action-category-group',
	templateUrl: 'patrol-builder-action-category.component.html',
	styleUrls: ['patrol-builder-action-category.component.css'],
	animations: [
		slideDown
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatrolBuilderActionCategory implements OnInit {
	@Input() patrolPoint: PointTemplate;
	@Input() actionCat: ActionCategory;
	@Input() catIndex: number;
	@Input() actions: ActionBase[];
	PatrolType: typeof PatrolType = PatrolType;
	private ngUnsubscribe: Subject<void> = new Subject<void>();

	@Output() onActionDefClicked = new EventEmitter();
	@Output() onActionDefDblClicked:EventEmitter<ActionDefinition> = new EventEmitter<ActionDefinition>();

	expandedState: string;
	prevent: boolean;
	delay: number;
    timer: NodeJS.Timer;

	ActionType: typeof ActionType = ActionType;

	constructor(
		private patrolService: PatrolService,
		private patrolBuilderService: PatrolBuilderService,
		private patrolMapService: PatrolMapService,
		private dragulaService: DragulaService,
		private changeRef: ChangeDetectorRef) { }

	toggleExpandedGroup(): void {
		this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
	}

	ngOnInit(): void {
		this.expandedState = this.expandedState || 'out';
		this.delay = 200;

		// Subscribe to action defition selection events
        this.patrolBuilderService.actionDefSelChanged
			.takeUntil(this.ngUnsubscribe)
			.subscribe({next: (temp) => this.actionDefSelChanged()});

		this.patrolBuilderService.patrolPointModified
			.takeUntil(this.ngUnsubscribe)
			.subscribe({ next: (patrolPoint) => this.patrolPointModified() });
	}
	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	public actionDefSelChanged() {
		this.changeRef.markForCheck();
	}

	public patrolPointModified() {
		this.changeRef.detectChanges();
	}

	public actionDefDblClicked(actionDef: ActionDefinition) {
		this.prevent = true;
		clearTimeout(this.timer);
		this.onActionDefDblClicked.emit(actionDef);
	}

	public actionDefClicked(actionDef: ActionDefinition) {

		this.timer = setTimeout(
			() => {
				if (!this.prevent) {
					this.onActionDefClicked.emit(actionDef);
				}
				this.prevent = false;
			},
			this.delay);
	}

	public doesCheckpointHaveAction(actDef: ActionDefinition): boolean {
		let found = false;
		for (let action of this.actions) {
			for (let ii = 0; ii < actDef.Command.length; ii++) {
				if ((action.Command === actDef.Command[ii]) || 
					(action.Command === CommandName.SayMessage && (actDef.Command[ii] === CommandName.Play))) {
					found = true;
					break;
				}
			}
			if (found) {
				break;
			}
		}
		return found;
	}

	public getDragData(actDef: ActionDefinition) {
		let dragData = { IsDefinition: true, Data: actDef };
		return dragData;
	}
}