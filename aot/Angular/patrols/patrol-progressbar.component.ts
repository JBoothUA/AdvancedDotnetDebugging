import {
    Component, Input, ChangeDetectorRef,
    OnDestroy, ChangeDetectionStrategy
} from '@angular/core';
import {
    PatrolTemplate, PatrolInstance, AreaType,
    isPatrolTemplate, PatrolStatusValues
} from './patrol.class';
import { PatrolService } from './patrol.service';
import { PlatformService } from './../platforms/platform.service';
import { CommandName, PlatformCommand, Parameter, ParameterName, ParameterType } from './action.class';
import { UserService } from './../shared/user.service';

@Component({
    selector: 'patrol-progressbar',
    templateUrl: 'patrol-progressbar.component.html',
    styleUrls: ['patrol-progressbar.component.css']
})

export class PatrolProgressbar implements OnDestroy {
    @Input() patrol: PatrolInstance;
    @Input() size: Number = 50;
    @Input() strokeWidth: Number = 5;
    @Input() hidePauseResumeBtn: boolean = true;

    private PatrolStatusValues: typeof PatrolStatusValues = PatrolStatusValues;
    private pauseNoficationTimeout: NodeJS.Timer;

    constructor(public patrolService: PatrolService,
        private ref: ChangeDetectorRef,
        private platformService: PlatformService,
        private userService: UserService) { }

    public getPatrolIconSrc(): string {
        let isPending = false;

        if (isPatrolTemplate(this.patrol)) {
            isPending = this.patrol.IsPatrolSubmitted;
        }

        if (!isPending) {
            switch (this.patrol.AreaType) {
                case AreaType.Large:
                    return '/Content/Images/Patrols/large-area-patrol.png';
                case AreaType.Small:
                    return '/Content/Images/Patrols/small-area-patrol.png';
                case AreaType.Perimeter:
                    return '/Content/Images/Patrols/perimeter-patrol.png';
                default:
                    return '';
            }
        } else {
            //If in wait between run
            if (this.patrol.RunSetData.NextRun) {
                switch (this.patrol.AreaType) {
                    case AreaType.Large:
                        return '/Content/Images/Patrols/large-area-in-between-runs.png';
                    case AreaType.Small:
                        return '/Content/Images/Patrols/small-area-in-between-runs.png';
                    case AreaType.Perimeter:
                        return '/Content/Images/Patrols/perimeter-icon-in-between-runs.png';
                    default:
                        return '';
                }
            }

            return '/Content/Images/Patrols/patrol-pending-large.gif';
        }
    }

    public getPatrolCompleteness(): number {
        if(isPatrolTemplate(this.patrol)) {
            return 0.0;
        } else {
            return this.patrolService.getPatrolCompleteness(this.patrol);
        }
    }

    public isPaused(): boolean {
        if (!isPatrolTemplate(this.patrol)) {
            if (this.patrol.CurrentStatus === PatrolStatusValues.Paused)
                return true;
        }
        return false;
    }

    public pauseOnClick(event: any) {
        if (!isPatrolTemplate(this.patrol)) {
            event.stopPropagation();
            let parameterList: Parameter[] = [];
            parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
            parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrol.InstanceId, Type: ParameterType.String }));

            this.platformService.executePlatformCommand(new PlatformCommand(this.patrol.PlatformId, CommandName.PausePatrol, parameterList));
        }
    }

    public resumeOnClick(event: any) {
        if (!isPatrolTemplate(this.patrol)) {
            event.stopPropagation();
            let parameterList: Parameter[] = [];
            parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
            parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrol.InstanceId, Type: ParameterType.String }));
            this.platformService.executePlatformCommand(new PlatformCommand(this.patrol.PlatformId, CommandName.ResumePatrol, parameterList));
        }
    }

    public showPauseNotfication() {
        if (!isPatrolTemplate(this.patrol)) {
            //If patrol is paused and notfication not seen
            if (this.patrol &&
                this.patrol.CurrentStatus === PatrolStatusValues.Paused &&
                !this.patrol.notficationIsPaused) {
                //Hide pause button
                if (this.pauseNoficationTimeout) {
                    clearTimeout(this.pauseNoficationTimeout);
                }

                this.pauseNoficationTimeout = setTimeout(() => {
                    (this.patrol as PatrolInstance).notficationIsPaused = true;
                    this.ref.markForCheck();
                }, 3000);

                return true;
            }
        }

        return false;
    }

    public showPauseResumeButton(): boolean {
        return !this.hidePauseResumeBtn && !isPatrolTemplate(this.patrol);
    }

    public ngOnDestroy(): void {
        if (this.pauseNoficationTimeout) {
            clearTimeout(this.pauseNoficationTimeout);
        }
    }
}