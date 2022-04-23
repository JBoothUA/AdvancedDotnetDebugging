import {
    Component, Input, ChangeDetectorRef,
    Output, EventEmitter,
    ChangeDetectionStrategy
} from '@angular/core';

import { Alarm, isAlarm } from './../alarms/alarm.class';
import { PointInstance, PointTemplate, PointStatusValues, isPointInstance, isPointTemplate } from './point.class';
import { ActionStatusValues, ActionInstance } from './action.class';
import { PatrolService } from './patrol.service';
import { PatrolInstance, PatrolStatusValues } from './patrol.class';
import { MediaService } from './../shared/media/media.service';
import { SortType } from './../shared/shared-interfaces';
import * as moment from 'moment';

function isPointInstanceList(arg: PointInstance[] | PointTemplate[]): arg is PointInstance[] { 
    if (arg.length && isPointInstance(arg[0])) {
        return true;
    } else {
        return false;
    }
}

@Component({
    selector: 'patrol-plan',
    templateUrl: 'patrol-plan.component.html',
    styleUrls: ['patrol-plan.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatrolPlan {
    @Input() patrolPoints: PointInstance[] | PointTemplate[] = [];
    @Input() patrolInstance: PatrolInstance;
    @Input() alarms: Alarm[] = [];                                  //Only used for running plans
    @Input() sortType: SortType = SortType.Desc;
    @Input() showPathPoints: boolean = false;

    @Output() onExpandedPoint: EventEmitter<string> = new EventEmitter<string>();
    @Output() onCollapsePoint: EventEmitter<string> = new EventEmitter<string>();

    public pointCount: number = 0;
    private pointIds: string[] = [];
    private PointStatusValues: typeof PointStatusValues = PointStatusValues;
    private ActionStatusValues: typeof ActionStatusValues = ActionStatusValues;
    public PatrolStatusValues: typeof PatrolStatusValues = PatrolStatusValues;
    private expandedActionItem: string[] = [];
    private currentCheckpointColor: string = '#249C49';
    public SortType: typeof SortType = SortType;
    
    constructor(private patrolService: PatrolService,
                private mediaService: MediaService,
                private ref: ChangeDetectorRef) {
    }

    public expandAll(): void {
        this.expandedActionItem = this.pointIds.slice(0);
        this.ref.detectChanges();
    }

    public collapseAll(): void {
        this.expandedActionItem = [];
        this.ref.detectChanges();
    }

    public showExpandAll(): boolean {
        return this.pointIds.length > 0 && this.pointIds.length !== this.expandedActionItem.length;
    }

    public showCollapseAll(): boolean {
        return this.pointIds.length > 0 && !this.showExpandAll();
    }

    public refresh(): void {
        this.ref.detectChanges();
    }

    public getPoints(): Object[] {
        this.pointIds = [];
        let pointList: Object[] = [];

        //Process Patrol Points
        if (isPointInstanceList(this.patrolPoints)) {
            pointList = this.patrolPoints.filter((point) => {
                if (this.showPathPoints) {
                    if (point.CurrentStatus !== PointStatusValues.Unknown) {
                        if (this.patrolService.isCheckPoint(point)) {
                            this.pointIds.push(point.PointId);
                        }
                        return true;
                    }
                    return false;
                } else if ((this.patrolService.isCheckPoint(point) &&
                    point.CurrentStatus !== PointStatusValues.Unknown) ||
                    point.CurrentStatus === PointStatusValues.NotReached) {
                    this.pointIds.push(point.PointId);
                    return true;
                } else {
                    return false;
                }
            });
        } else {
            pointList = this.patrolPoints.filter((point) => {
                if (this.showPathPoints || this.patrolService.isCheckPoint(point)) {
                    if (this.patrolService.isCheckPoint(point)) {
                        this.pointIds.push(point.PointId);
                    }
                    return true;
                }

                return false;
            });

        }

        //Process Alarms
        for (let alarm of this.alarms) {
            pointList.push(alarm);
            this.pointIds.push(alarm.Id);
        }

        //Sort List

        pointList.sort((a: any, b: any) => {
            let aDateTime: string;
            let bDateTime: string;

            let isAPatrol: boolean = false;
            let isBPatrol: boolean = false;
    
            if (isAlarm(a)) {
                aDateTime = a.Created.Timestamp.toString();
            } else if (isPointInstance(a)) {
                aDateTime = this.getActionsCompletedTime(a);
                isAPatrol = true;
            } else if (isPointTemplate(a)) {
                isAPatrol = true;
            }

            if (isAlarm(b)) {
                bDateTime = b.Created.Timestamp.toString();
            } else if (isPointInstance(b)) {
                bDateTime = this.getActionsCompletedTime(b);
                isBPatrol = true;
            } else if (isPointTemplate(b)) {
                isBPatrol = true;
            }

            if (isAPatrol && isBPatrol) {
                return a.Ordinal - b.Ordinal;
            }

            let aTime: number;
            if (!isAPatrol) {
                aTime = new Date(aDateTime).getTime();
            } else {
                aTime = parseInt(aDateTime);
            }

            let bTime: number; 
            if (!isBPatrol) {
                bTime = new Date(bDateTime).getTime();
            } else {
                bTime = parseInt(bDateTime);
            }

            return ((!isNaN(bTime) ? bTime : 0) - (!isNaN(aTime) ? aTime : 0));
        });
   
        this.pointCount = pointList.length;

        return pointList;
    }

    private getActionHeaderStatusClass(point: PointInstance | PointTemplate): string {
        if (isPointInstance(point)) {
            switch (this.patrolService.getPointStatus(point, this.patrolInstance.Points)) {
                case PointStatusValues.Reached:
                    return 'in-progress';
                case PointStatusValues.ActionsPerformed:
                    //Check the status of all the actions
                    let status: ActionStatusValues = ActionStatusValues.Completed;
                    for (let action of point.Actions) {
                        if (action.CurrentStatus === ActionStatusValues.Failed ||
                            action.CurrentStatus === ActionStatusValues.Unknown ||
                            action.CurrentStatus === ActionStatusValues.Unsupported) {
                            status = ActionStatusValues.Failed;
                            break;
                        }
                    }

                    if (status === ActionStatusValues.Completed) {
                        return 'completed';
                    } else if (status === ActionStatusValues.Failed) {
                        return 'failed';
                    }
                case PointStatusValues.NotReached:
                    return 'failed';
                default:
                    return '';
            }
        } else {
            return '';
        }
    }

    private toggleExpandedActionView(pointID: string): void {
        try {
            event.stopPropagation();
        } catch (e) {
            console.warn(e);
        }

        if (this.expandedActionItem.includes(pointID)) {
            this.expandedActionItem.splice(this.expandedActionItem.indexOf(pointID), 1);
        }
        else {
            this.expandedActionItem.push(pointID);
        }
    }

    private getTimeSince(dateTime: any, extraText: string = ''): string {
        if (!this.patrolInstance) {
            return '';
        }

        let tempDate: Date;
        if (isNaN(dateTime)) {
            tempDate = moment(dateTime).toDate();
        } else {
            tempDate = moment.utc(parseInt(dateTime)).local().toDate();
        }

        let result = moment.duration(moment().diff(tempDate)).humanize();
        if (result.includes('second')) {
            return 'now';
        }

        if (result.includes('month') || result.includes('year')) {
            return moment(tempDate).format('MM/DD/YY hh:mma');
        }

        result = result.replace('hour', 'hr');
        result = result.replace('minute', 'min');
        result = result.replace('an ', '1 ');
        result = result.replace('a ', '1 ');
        return result + ' ' + extraText;
    }

    private getActionsCompletedTime(point: PointInstance): string {
        if (point.CurrentStatus === PointStatusValues.Reached) {
            if (point.StatusHistory) {
                for (let status of point.StatusHistory) {
                    if (status.Status === PointStatusValues.Reached) {
                        return status.ReportedTime.toString();
                    }
                }
            }
        }

        if (point.StatusHistory) {
            for (let status of point.StatusHistory) {
                if (status.Status === PointStatusValues.NotReached) {
                    return status.ReportedTime.toString();
                }
            }
        }

        return undefined;
    }

    private getPointBorderClass(point: PointInstance | PointTemplate): string {
        if (isPointInstance(point)) {
            switch (this.patrolService.getPointStatus(point, this.patrolInstance.Points)) {
                case PointStatusValues.NotReached:
                case PointStatusValues.InTransit:
                    return 'dashed-line';
                case PointStatusValues.ActionsPerformed:
                case PointStatusValues.Reached:
                default:
                    return 'solid-line';
            }
        } 

        return 'solid-line';
    }

    private expandedActionViewState(pointID: string): string {
        if (pointID && this.expandedActionItem.includes(pointID)) {
            return 'out';
        }
        return 'in';
    }

    private getActionHeaderStatusText(point: PointInstance | PointTemplate): string {

        if (isPointInstance(point)) {
            switch (this.patrolService.getPointStatus(point, this.patrolInstance.Points)) {
                case PointStatusValues.Reached:
                    let actionPhase: string = '';
                    let ordinalSuffixOf: string = '';
                    for (let action in point.Actions) {
                        if (point.Actions[action].CurrentStatus === ActionStatusValues.Started) {
                            actionPhase = this.getDisplayActionPhase(point.Actions[action]);
                            ordinalSuffixOf = this.getOrdinalSuffixOf(parseInt(action) + 1);
                        }
                    }

                    return ordinalSuffixOf + ' Action - ' + actionPhase;
            }
        }

        return point.Actions.length + ((point.Actions.length) > 1 ? ' Actions' : ' Action');
    }

    private getDisplayActionPhase(action: ActionInstance): string {
        if (!action.Command)
            return '';

        return this.patrolService.getActionPhraseString(action);
    }

    private getActionHeaderDescription(point: PointInstance | PointTemplate): string {
        if (isPointInstance(point)) {
            switch (this.patrolService.getPointStatus(point, this.patrolInstance.Points)) {
                case PointStatusValues.Reached:
                    return '(In Progress)';

                case PointStatusValues.ActionsPerformed:
                    let status: ActionStatusValues = ActionStatusValues.Completed;
                    for (let action of point.Actions) {
                        if (action.CurrentStatus === ActionStatusValues.Failed ||
                            action.CurrentStatus === ActionStatusValues.Unknown ||
                            action.CurrentStatus === ActionStatusValues.Unsupported) {
                            status = ActionStatusValues.Failed;
                            break;
                        }
                    }

                    if (status === ActionStatusValues.Completed) {
                        return '(Complete)';
                    } else if (status === ActionStatusValues.Failed) {
                        return '(Failed)';
                    }
                case PointStatusValues.NotReached:
                    return '(Failed)';
                case PointStatusValues.InTransit:
                    return '(In Transit)';
                default:
                    return '';
            }
        }
        return '';
        
    }

    private getActionStatusText(action: ActionInstance, isNotReached: boolean): string {

        if (!isNotReached) {
            switch (action.CurrentStatus) {
                case ActionStatusValues.Completed:
                    return 'Complete';
                case ActionStatusValues.Failed:
                    return 'Failed';
                case ActionStatusValues.Unknown:
                    return 'Pending';
                case ActionStatusValues.Unsupported:
                    return 'Unsupported';
                case ActionStatusValues.Started:
                    return 'In Progress';
                default:
                    return '';
            }
        } else {
            return 'Failed';
        }
    }

    private getActionStatusIconSrc(action: ActionInstance, pointStatus: PointStatusValues): string {
        if (pointStatus !== PointStatusValues.NotReached) {
            switch (action.CurrentStatus) {
                case ActionStatusValues.Completed:
                    return './../Content/Images/Patrols/patrol-last-successful.png';
                case ActionStatusValues.Failed:
                    return './../Content/Images/Patrols/action-failed.png';
                case ActionStatusValues.Unknown:
                    return './../Content/Images/Patrols/action-pending.png';
                case ActionStatusValues.Unsupported:
                    return './../Content/Images/Patrols/action-failed.png';
                case ActionStatusValues.Started:
                    return './../Content/Images/loading-spinner-grey.gif';
                default:
                    return './../Content/Images/Patrols/action-pending.png';
            }
        } else {
            this.currentCheckpointColor = '#E9AB08';
            return './../Content/Images/Patrols/action-failed.png';
        }
    }

    private getActionOrder(currentIndex: number, maxLength: number, sortOrder: SortType): number {
        if (sortOrder === SortType.Asc) {
            return currentIndex + 1;
        } else {
            return Math.abs(currentIndex - maxLength);
        }
    }

    private isAlarmPoint(arg: Object): boolean {
        if (isAlarm(arg))
            return true;
        else
            return false;
    }

    private getAlarmClass(alarm: Alarm): string {
        switch (alarm.State) {
            case 1:
            case 4:
                return '';
            case 2:
                return 'no-issue';
            case 3:
                return 'completed';
        }
    }

    private getAlarmStatusHeader(alarm: Alarm): string {
        switch (alarm.State) {
            case 1:
                return 'Reported';
            case 2:
                return 'Acknowledged';
            case 3:
                return 'Cleared';
            case 4:
                return 'Dismissed';
        }
    }

    private getAlarmStatusTimeStamp(alarm: Alarm): string {
        switch (alarm.State) {
            case 1:
                return this.getTimeSince(alarm.Created.Timestamp, 'ago');
            case 2:
                return this.getTimeSince(alarm.Acknowledged.Timestamp, 'ago');
            case 3:
                return this.getTimeSince(alarm.Cleared.Timestamp, 'ago');
            case 4:
                return this.getTimeSince(alarm.Dismissed.Timestamp, 'ago');
        }
    }

    private selectImage(uri: string, alarm: Alarm): void {
        for(let index in alarm.Snapshots) {
            alarm.Snapshots[index].Selected = alarm.Snapshots[index].Uri === uri;
        }
        let imageTitle: string = 'Image Viewer - ' + alarm.Description + ' Alarm (P' + alarm.Priority + ')';
        this.mediaService.openImageViewer(alarm.Id, alarm.Snapshots, btoa(imageTitle));
    }

    private selectActionImage(uri: string, action: ActionInstance): void{
        for (let index in action.Images) {
            action.Images[index].Selected = action.Images[index].Uri === uri;
        }

        let imageTitle: string = 'Image Viewer';
        this.mediaService.openImageViewer(action.ActionId, action.Images, btoa(imageTitle));
    }

    private getBracketText(point: PointTemplate | PointInstance): string {

        if (isPointTemplate(point)) {
            if (this.patrolService.isCheckPoint(point) && this.showPathPoints) {
                return ' (Point ' + point.Ordinal + ')';
            }
        }

        if (isPointInstance(point)) {
            if (this.patrolService.isCheckPoint(point) && this.showPathPoints) {
                if (point.CurrentStatus && point.CurrentStatus === PointStatusValues.NotReached) {
                    return ' (Point ' + point.Ordinal + ', Not Reached)';
                } else {
                    return ' (Point ' + point.Ordinal + ')';
                }
                
            } else {
                if (point.CurrentStatus && point.CurrentStatus === PointStatusValues.NotReached) {
                    return ' (Not Reached)';
                }
            }
        }

        return '';
    }

    private showInTransit(point: PointInstance): boolean {
        if (this.patrolInstance && (this.patrolInstance.CurrentStatus.valueOf() !== PatrolStatusValues.Started && this.patrolInstance.CurrentStatus.valueOf() !== PatrolStatusValues.Resumed)) {
            return false;
        }

        if (point.CurrentStatus === PointStatusValues.InTransit) {
            return true;
        }

        return false;
    }

    private getOrdinalSuffixOf(i: number): string {
        let j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    }

    private hasSnapshots(point: PointInstance) {

        for (let action of point.Actions) {
            if (action.HasSnapshots) {
                return true;
            }
        }
       
        return false;
        
    }
}