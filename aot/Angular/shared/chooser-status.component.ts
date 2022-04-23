import {
    Component, Input, ChangeDetectionStrategy,
    OnInit, ChangeDetectorRef, ViewChild, OnDestroy,
    Output, EventEmitter, ElementRef
} from '@angular/core';

import { PatrolService } from './../patrols/patrol.service';
import { PatrolInstance, PatrolTemplate, PatrolStatusValues } from '../patrols/patrol.class';
import { PlatformService } from './../platforms/platform.service';
import { Platform } from './../platforms/platform.class';
import { slideDown } from './animations';
import { ConfirmationDialog } from './confirmation-dialog.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { PlatformCommand, CommandName, Parameter, ParameterName, ParameterType } from './../patrols/action.class';
import { UserService } from './../shared/user.service';
import { Popover } from './popover.component';

import * as moment from 'moment';

@Component({
    selector: 'chooser-status',
    templateUrl: 'chooser-status.component.html',
    styleUrls: ['chooser-status.component.css'],
    animations: [slideDown],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChooserStatus implements OnInit, OnDestroy{
    //@Input() mode: string = 'platform';
    @Input() platformID: string;
    @Input() patrolTemplateID: string;
    @Input() patrolInstance: PatrolInstance;
    @Input() showPatrolName: boolean = false;
    @Input() runCount: number;
    @Input() delay: number;
    @Input() infiniteRuns: boolean;
    @Input() aboutPatrolBtnText: string = 'Abort';
    @Input() disabled: boolean = false;
    @Input() showPatrolRunCount: boolean = false;
    @Input() disableDefaultAbout: boolean = false;

    @Output() onAbortClick = new EventEmitter();
    @Output() onPatrolSelected: EventEmitter<PatrolTemplate> = new EventEmitter<PatrolTemplate>();
    @Output() onShow: EventEmitter<void> = new EventEmitter<void>();
    @Output() onHide: EventEmitter<void> = new EventEmitter<void>();  

    @ViewChild(ConfirmationDialog) confirmAbort: ConfirmationDialog;
    @ViewChild('popoverBox') popover: Popover;
    @ViewChild('popoverTarget') popoverTarget: ElementRef;

    public isDropdownShown: boolean;
    public id: string;
    private selectedItemID: string;
    private choosenItemID: string;
    private readyToRun: boolean;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private PatrolStatusValues: typeof PatrolStatusValues = PatrolStatusValues;
    private nextRunTimer: NodeJS.Timer = null;

    constructor(public patrolService: PatrolService,
        private platformService: PlatformService,
        private ref: ChangeDetectorRef,
        private userService: UserService) {
        this.readyToRun = false;
    }

    public reset(): void {
        this.selectedItemID = null;
        this.choosenItemID = null;
        this.runCount = 1;
        this.delay = 0;
        this.infiniteRuns = false;
        this.ref.markForCheck();
    }

    public getPatrolTemplateIdForAbort(): any {
        if (this.patrolTemplateID) {
            return this.patrolTemplateID;
        } else {
            return this.platformService.getPlatform(this.platformID).PatrolTemplateSubmittedId;
        }
    }

    public getPlatformIdForAbort(): any {
        if (this.platformID) {
            return this.platformID;
        } else {
            return this.patrolService.getPatrolTemplate(this.patrolTemplateID).PlatformSubmittedId;
        }
    }

    public getChooserTypeIconSrc(): string {
        if (!this.platformID) {
            if ((this.patrolInstance || this.isBusy()) && (this.patrolInstance && this.patrolInstance.CurrentStatus !== PatrolStatusValues.Paused))
                return '/Content/Images/Platforms/robot-active.png';
            else
                return '/Content/Images/Platforms/robot-not-active.png';
        } else {
            if ((this.patrolInstance || this.isBusy()) && (this.patrolInstance && this.patrolInstance.CurrentStatus !== PatrolStatusValues.Paused))
                return '/Content/Images/Platforms/patrol-active.png';
            else
                return '/Content/Images/Platforms/patrol-not-active.png';
        }
    }

    public getModeChooseText(): string {
        if (this.patrolInstance || this.isBusy()) {
            if (this.showPatrolName && this.patrolInstance) {
                return this.patrolInstance.DisplayName;
            } else {
                if (this.patrolInstance && this.patrolInstance.CurrentStatus === PatrolStatusValues.Paused) {
					return 'Patrol Paused';
                } else if (!this.patrolInstance ||
                    (this.patrolInstance && this.patrolInstance.CurrentStatus !== PatrolStatusValues.Started)) {
					return 'Patrol Pending';
                } else {
                    return 'On Patrol';
                }
            }
        }

        if (!this.platformID) {
            if (!this.choosenItemID) {
                return 'Choose Robot';
            }
            else {
                return this.platformService.getPlatform(this.choosenItemID).DisplayName;
            }
        }
        else {
            if (this.platfomIsUnavailable()) {
                return 'Choose Patrol';
            }
            else {
                let patrolTemplate: PatrolTemplate = this.patrolService.getPatrolTemplate(this.choosenItemID);
                if (patrolTemplate) {
                    return this.patrolService.getPatrolTemplate(this.choosenItemID).DisplayName;
                } else {
                    return 'Choose Patrol';
                }
            }
        }
    }

    public isPlatformPending(): boolean {
        if (this.platformID) {
            return this.platformService.getPlatform(this.platformID).IsPatrolSubmitted;
        }

        return false;
    }

    public platfomIsUnavailable():boolean {
        if (!this.platformID) {
            return false;
        }

        return !this.platformService.isPlatformAvailable(this.platformService.getPlatform(this.platformID));
    }

    public chooserOnClick(): void {
        
        //this.readyToRun = false;
        if (this.isDropdownShown) {
            this.isDropdownShown = false;
        } else {
            event.stopPropagation();
        }
    }

    public cancelOnClick(): void {
        //If patrols unselect from map
        if (this.platformID) {
            this.patrolService.toggleSelectedPatrol(this.selectedItemID, false);
        }

        this.selectedItemID = undefined;
        this.choosenItemID = undefined;
        this.isDropdownShown = true;
        this.readyToRun = false;
        this.popover.hide();
    }

    public pauseOnClick(): void {
        this.isDropdownShown = true;

        let parameterList: Parameter[] = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolInstance.InstanceId, Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.getPlatformIdForAbort(), CommandName.PausePatrol, parameterList));
        this.popover.hide();
    }

    public resumeOnClick(): void {
        this.isDropdownShown = true;

        let parameterList: Parameter[] = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolInstance.InstanceId, Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.getPlatformIdForAbort(), CommandName.ResumePatrol, parameterList));
        this.popover.hide();
    }

    public abortOnClick(): void {
        this.isDropdownShown = true;
        if (!this.disableDefaultAbout) {
            this.abortPatrolConfirm();
        }
        this.popover.hide();
        this.onAbortClick.emit();
    }

    public chooseItemOnClick(): void {
        this.choosenItemID = this.selectedItemID;
        this.selectedItemID = undefined;
        this.isDropdownShown = true;
        this.readyToRun = true;

        if (this.patrolTemplateID) {
            this.patrolService.toggleSelectedPatrol(this.patrolTemplateID, true);
        }

        this.executePatrol();
        this.popover.hide();
    }

    public onDropDownClick(): void {
        this.selectedItemID = this.choosenItemID;
        this.ref.markForCheck();
    }

    public toggleInfinite(toggleState:boolean) {
        this.infiniteRuns = toggleState;
    }

    public showMoreOptions() {
        if (this.runCount > 1 || this.infiniteRuns) {
            return 'out';
        } else {
            return 'in';
        }
    }

    public ngOnInit(): void {
        this.id = this.createGUID();
        this.delay = 0;
        this.runCount = 1;
        this.isDropdownShown = false;
        this.infiniteRuns = false;

        if (this.platformID) {
            this.patrolService.onUpsertInstance
                .takeUntil(this.ngUnsubscribe)
                .subscribe({ next: (patrolInstance) => this.ref.markForCheck() });

            this.patrolService.onUpsertTemplate
                .takeUntil(this.ngUnsubscribe)
                .subscribe({ next: (patrolTemplate) => this.ref.markForCheck() });

		} else {
            this.platformService.onNewPlatform
                .takeUntil(this.ngUnsubscribe)
                .subscribe({ next: (platform) => this.ref.markForCheck() });
        }

        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({ next: (Platform) => this.ref.detectChanges() });
    }

    public executePatrol(): void {
        if (!this.readyToRun) {
            return;
        }

        if (this.platformID) {
            let patrolTemplate: PatrolTemplate = new PatrolTemplate(this.patrolService.getPatrolTemplate(this.choosenItemID));
			patrolTemplate.RunSetData = {
				TotalRunNumber: (this.infiniteRuns) ? -1 : this.runCount,
				Delay: this.delay,
				CurrentRunNumber: null,
				NextRun: null,
				RunSetId: null
			};
            this.patrolService.executePatrol(this.platformID, patrolTemplate);
        } else {
            let patrolTemplate: PatrolTemplate = new PatrolTemplate(this.patrolService.getPatrolTemplate(this.patrolTemplateID));
			patrolTemplate.RunSetData = {
				TotalRunNumber: (this.infiniteRuns) ? -1 : this.runCount,
				Delay: this.delay,
				CurrentRunNumber: null,
				NextRun: null,
				RunSetId: null
			};
            this.patrolService.executePatrol(this.choosenItemID, patrolTemplate);
        }
    }

    public abortPatrolConfirm(): void {
        this.popover.hide();
        this.confirmAbort.show();
    }

    public getButtonTooltip(): string {
        if (this.patrolInstance || this.isBusy())
            return 'Click abort to stop current patrol';
        else
            return '';
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public getPatrolStatusText(): string {

        let patrolTemplate: PatrolTemplate = null;
        if (this.platformID) {
            patrolTemplate = this.patrolService.getPatrolTemplate(this.platformService.getPlatform(this.platformID).PatrolTemplateSubmittedId);
        }

        if (!patrolTemplate) {
            if (this.platformID) {
                return  this.platformService.getStateText(this.platformService.getPlatform(this.platformID));
            }

            return null;
        }

        if (patrolTemplate.RunSetData) {
            //In the delay
            if (patrolTemplate.RunSetData.NextRun !== null) {
                clearTimeout(this.nextRunTimer);
                this.nextRunTimer = setTimeout(() => {
                    this.ref.markForCheck();
                }, 60000);
                return 'Next Run ' + moment.utc(patrolTemplate.RunSetData.NextRun).local().fromNow();
            } else {
                //In pending
				return 'Patrol Run ' + patrolTemplate.RunSetData.CurrentRunNumber + ' of ' + ((patrolTemplate.RunSetData.TotalRunNumber === -1) ? 'infinite' : patrolTemplate.RunSetData.TotalRunNumber.toString());
            }
        } else {
            //This should just be for legacy patrol
            return 'Patrol Run 1 of 1';
        }
    }

    private createGUID(): string {
        let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let cryptoObj = window.crypto;
            let r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return guid;
    }

    private validateInput(event: any) {
        let pattern: RegExp = /[0-9\+]/;
        let currentInputChar = String.fromCharCode(event.charCode);
        let inputChar = String.fromCharCode(event.charCode);

        if (!pattern.test(inputChar))
            event.preventDefault();
    }

    public isBusy(): boolean {
        let isBusy: boolean = false;
        if (this.patrolTemplateID && this.patrolService.getPatrolTemplate(this.patrolTemplateID).IsPatrolSubmitted) {
            isBusy = true;
        }

        let platform: Platform = this.platformService.getPlatform(this.platformID);
        if (this.platformID && platform.IsPatrolSubmitted) {
            isBusy = true;
        }

        return isBusy;
    }

    public stopEvents(event: any): void {
        event.stopPropagation();
    }

    private showRunOptions(): boolean {
        if (this.patrolTemplateID) {
            if (this.platformService.getAvailablePlatforms(this.patrolService.getPatrolTemplate(this.patrolTemplateID).LocationId).length > 0) {
                return true;
            }
        } else {
            if (this.patrolService.getAvailablePatrols(this.platformService.getPlatform(this.platformID)).length > 0){
                return true;
            }
        }

        return false;
    }
}