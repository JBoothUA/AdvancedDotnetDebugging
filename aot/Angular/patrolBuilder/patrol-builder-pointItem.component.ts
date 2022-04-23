import {
	Component,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Input,
	Output,
	NgZone,
	ElementRef,
	OnInit,
	SimpleChange,
	ViewChild,
	EventEmitter
} from '@angular/core';

import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { PatrolTemplate } from '../patrols/patrol.class';
import { PointTemplate } from '../patrols/point.class';
import { ActionBase, ActionType, CommandName } from '../patrols/action.class';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolMapService, PatrolMapInteractMode } from './../map/patrols/patrolMap.service';
import { PatrolBuilderService } from './patrol-builder.service';
import { slideDown } from '../shared/animations';
import { ConfirmationDialog } from './../shared/confirmation-dialog.component';

@Component({
	selector: 'patrol-builder-pointItem',
	templateUrl: 'patrol-builder-pointItem.component.html',
	styleUrls: ['patrol-builder-pointItem.component.css'],
	animations: [
		slideDown
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class PatrolBuilderPointItem implements OnInit {
	@Input() patrolPoint: PointTemplate;
	@Input() patrol: PatrolTemplate;
	@Input() pointCount: number;
	@Input() selected: boolean;
	@Input() pointName: string;
	@Input() pointDescription: string;
	@Output() onToggleActionGroup: EventEmitter<string> = new EventEmitter<string>();
	@ViewChild('locDescInput') locDescInput: ElementRef;
	@ViewChild(ConfirmationDialog) confirmOveride: ConfirmationDialog;

	private ngUnsubscribe: Subject<void> = new Subject<void>();

	public editDescription: boolean;
	public focusInput: boolean;
	public overideMessage: string;
	public expandedState: string;

	private prevent: boolean;
	private delay: number;
    private timer: NodeJS.Timer;

	constructor(
		public patrolService: PatrolService,
		public patrolBuilderService: PatrolBuilderService,
		private patrolMapService: PatrolMapService,
		private changeRef: ChangeDetectorRef,
		private ngZone: NgZone) {
	}

	ngOnInit(): void {
		this.expandedState = this.expandedState || 'in';
		this.delay = 250;
		this.prevent = false;
		this.timer = null;
		this.editDescription = false;

		// Subscribe to checkpoint add,update, and deleted events
		this.patrolBuilderService.patrolPointSelChanged
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (temp) => this.patrolPointsModified()
		});

		this.patrolBuilderService.patrolPointAdded
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (temp) => this.patrolPointsModified()
			});

		this.patrolBuilderService.patrolPointModified
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (patrolPoint) => this.patrolPointsModified()
			});

		this.patrolBuilderService.patrolPointRemoved
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
			next: (temp) => this.patrolPointsModified()
		});
	}

	ngOnChanges(changes: { [propName: string]: SimpleChange }) {
		//console.log('patrolBuilderPointItem changed');
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
	private patrolPointsModified() {
		this.changeRef.detectChanges();
	}

	private editPointDescriptionInline(event:any) {
		event.stopPropagation();
		this.editDescription = true;
		this.patrolPoint.Selected = true;
		this.changeRef.detectChanges();
		this.ngZone.runOutsideAngular(() => { setTimeout(() => { this.locDescInput.nativeElement.focus(); }, 100); });
	}

	private finishEditPointDescriptionInline() {
		this.editDescription = false;
		this.changeRef.detectChanges();
	}
	public getBackgroundStyle(patrolPoint: PointTemplate) {
		if (patrolPoint.Ordinal === 1 && this.patrolService.isCheckPoint(patrolPoint) === false) {
			return ('../../Content/Images/Patrols/first-point.png');
		}
		else if (patrolPoint.Actions && this.patrolService.isCheckPoint(patrolPoint)) {
			return ('../../Content/Images/Patrols/checkpoint-icon.png');
		}
		else if (patrolPoint.Ordinal === this.patrol.Points.length && !this.patrolService.isCheckPoint(patrolPoint)) {
			return ('../../Content/Images/Patrols/last-point.png');
		}
		else {
			return ('../../Content/Images/Patrols/patrol-point.png');
		}
	}

	public getActionCommandDisplayName(action: ActionBase): string {
		let actDef = this.patrolService.getActionDefinition(action);
		let displayName = actDef ? actDef.DisplayName : 'Unknown Action';
		return (displayName);
	}

	public getActionPhraseString(action: ActionBase): string {
		let actDef = this.patrolService.getActionDefinition(action);
		let retStr = '';
		if (actDef) {
			switch (actDef.ActionType) {
				case ActionType.Toggle: {
					if (action.Command === actDef.Command[0])
						retStr = 'Off';
					else
						retStr = 'On';
					break;
				}
				case ActionType.Dwell: {
					if (action.Parameters && action.Parameters.length > 0) {
						let res = parseInt(action.Parameters[0].Value);
						let mins = res / 60;
						let secs = res % 60;
						retStr = (secs === 0 ? mins.toString() + ' minutes' : res.toString() + ' seconds');
					}
					break;
				}
				case ActionType.Play: {
					if (action.Parameters && action.Parameters.length > 0) {
						retStr = action.Parameters[0].Value;
					}
					break;
				}
				case ActionType.Say: {
					if (action.Parameters && action.Parameters.length > 0) {
						retStr = action.Parameters[0].Value;
					}
					break;
				}

				case ActionType.Command:
				case ActionType.Orient: {
					if (action.Command === CommandName.OrientPlatform) {
						retStr = action.Parameters[0].Value.toString() + ' degrees';
					}
					else
						if (action.Parameters && action.Parameters.length > 0) {
							retStr = action.Parameters[0].Value.toString();
						}
					break;
				}
				case ActionType.Volume: {
					retStr = action.Parameters[0].Value.toString() + ' percent';
					break;
				}
				default: {
					retStr = '';
				}
			}
		}

		if (retStr !== '') {
			retStr = ':  ' + retStr;
		}

		return (retStr);
	}

	toggleExpandedGroup(): void {
		this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
		this.changeRef.markForCheck();
		this.onToggleActionGroup.emit(this.expandedState);
	}

	onClick(event: any): void {
		// Delay click action to allow dblclick to occur
		this.timer = setTimeout(
			() => {
				if (!this.prevent) {
					this.selectPoint(event);
				}
				this.prevent = false;
			},
			this.delay);
	}

	private selectPoint(event: any) {
		if (this.patrolPoint.Selected) {
			if (event.ctrlKey) {
				this.patrolBuilderService.deselectPatrolPoint(this.patrol, this.patrolPoint.PointId);
			}
			else {
				// if more than one alarm is selected, only select this one
				if (this.patrolBuilderService.getSelectedPatrolPointCount(this.patrol) > 1) {
					this.patrolBuilderService.selectOnlyPatrolPoint(this.patrol, this.patrolPoint.PointId);
				}
				else {
					// This is the only alarm selected, so deselect it
					this.patrolBuilderService.deselectPatrolPoint(this.patrol, this.patrolPoint.PointId);
				}
			}
		}
		else {
			if (!event.ctrlKey) {
				this.patrolBuilderService.selectOnlyPatrolPoint(this.patrol, this.patrolPoint.PointId);
			}
			else {
				this.patrolBuilderService.selectPatrolPoint(this.patrol, this.patrolPoint.PointId);
			}
		}
	}

	public onDblClick(event: any): void {
		this.prevent = true;
		clearTimeout(this.timer);

		if (!event.ctrlKey) {
			this.patrolBuilderService.selectOnlyPatrolPoint(this.patrol, this.patrolPoint.PointId);
		}
		else {
			this.patrolBuilderService.selectPatrolPoint(this.patrol, this.patrolPoint.PointId);
		}
		this.addEditActions(this.patrolPoint);
	}

	public addEditActions(patrolPoint: PointTemplate) {
		event.stopPropagation();
		if (patrolPoint.Selected === false) {
			this.patrolBuilderService.selectOnlyPatrolPoint(this.patrol, this.patrolPoint.PointId);
			this.patrolBuilderService.notifyPatrolPointEditSelected(patrolPoint);
		}
		else {
			let selectedCnt = 0;
			let hasActionsCnt = 0;
			for (let ii = 0; ii < this.patrol.Points.length; ii++) {
				if (this.patrol.Points[ii].Selected) {
					selectedCnt++;
					if (this.patrol.Points[ii].Actions && this.patrol.Points[ii].Actions.length > 0) {
						hasActionsCnt++;
					}
				}
			}

			if (selectedCnt > 1 && hasActionsCnt > 0) {
				let verb = 'have';
				if (hasActionsCnt === 1) {
					verb = 'has';
				}
				this.overideMessage = hasActionsCnt.toString() + ' of the points selected already ' + verb + ' actions. ';
				this.overideMessage += ' Do you want to overide these actions?';

				setTimeout(() => { this.confirmOveride.show(); this.changeRef.detectChanges(); }, 100);
			}
			else {
				this.patrolBuilderService.notifyPatrolPointEditSelected(patrolPoint);
			}
		}
 	}

	public removePoint(patrolPoint: PointTemplate) {
		this.patrolBuilderService.removePatrolPoint(this.patrol, patrolPoint);
		if (this.patrol.Points.length === 0) {
			setTimeout(() => { this.patrolMapService.setInteractMode(PatrolMapInteractMode.Append); },100);
		}
		this.patrol.dirtyToggle = !this.patrol.dirtyToggle;
	}

}