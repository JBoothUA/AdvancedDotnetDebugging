import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef }
    from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import * as moment from 'moment';
import { Subject } from 'rxjs/Subject';

import { AlarmService } from './alarm.service';
import { PlatformService } from '../platforms/platform.service';
import { Alarm } from './alarm.class';
import { slideDown } from '../shared/animations';
import { Sensor, Image, CorrelationType } from '../shared/shared-interfaces';
import { MediaService } from '../shared/media/media.service';

@Component({
    selector: 'alarm-details',
    templateUrl: 'alarm-details.component.html',
    animations: [
        slideDown
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AlarmDetails {
    @Input() alarm: Alarm;
    @Input() showComments: boolean = true;
    @Input() showHistory: boolean = true;
	@Input() showImages: boolean = true;

	alarmHistory: any[] = []
	sortProperty: string = 'Timestamp';
	sortDesc: boolean = false;

    alarmSensors: Sensor[] = [];

    private ngUnsubscribe: Subject<void> = new Subject<void>();

	constructor(private alarmService: AlarmService, private platformService: PlatformService, private mediaService: MediaService, private changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.alarmService.editedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => {
					if (alarm.Id === this.alarm.Id) {
						this.alarmHistory = this.getAlarmHistory();
                        this.changeDetectorRef.detectChanges();
                    }
                }
            });
        this.mediaService.selectedImageChangedSub
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (correlationId) => {
                    if (correlationId === this.alarm.Id) {
                        this.changeDetectorRef.detectChanges()
                    }
                }
            });

        // Build the sensor list, starting with the triggering sensor
        if (this.alarm.Sensor) {
            this.alarmSensors.push(this.alarm.Sensor);
        }
        if (this.alarm.Sensors) {
            this.alarmSensors = this.alarmSensors.concat(this.alarm.Sensors);
		}

		this.alarmHistory = this.getAlarmHistory();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    getPriorityDisplayName(): string {
        return this.alarmService.convertPriorityName(this.alarm.Priority);
    }

    getSnapshotsCount(): number {
        if (!this.alarm.Snapshots) {
            return 0;
        }
        return this.alarm.Snapshots.length;
    }

    getCommentCount(): number {
        if (!this.alarm.Comments) {
            return 0;
        }

        return this.alarm.Comments.length;
	}

	sortAlarmHistory(sortProperty: string) {
		if (this.sortProperty === sortProperty) {
			this.sortDesc = !this.sortDesc;
		} else {
			this.sortProperty = sortProperty;
			this.sortDesc = false;
		}

		if (this.sortProperty === 'Timestamp') {
			this.alarmHistory.sort((a, b) => {
				return this.sortDesc
					? new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
					: new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime();
			});

			return;
		}

		this.alarmHistory.sort((a, b) => {
			let order = 0;
			if (a[this.sortProperty] < b[this.sortProperty]) {
				order = -1;
			} else if (a[this.sortProperty] > b[this.sortProperty]) {
				order = 1;
			}

			if (this.sortDesc) {
				order = order * -1;
			}

			return order;
		});
	}

    getAlarmHistory(): any {
        let alarmHistory = (this.alarm.Comments || []).map(function (comment) {
            return { Action: 'Comment Added', UserId: comment.UserId, Timestamp: comment.Timestamp };
        });

        if (this.alarm.Created) {
			let state = this.alarm.Created;
			let platform = this.platformService.getPlatform(this.alarm.PlatformId);
			let history = { Action: 'Created', UserId: platform ? platform.DisplayName : this.alarm.PlatformId, Timestamp: state.Timestamp };
            alarmHistory.push(history);
        }
        if (this.alarm.Acknowledged) {
            let state = this.alarm.Acknowledged;
            let history = { Action: 'Acknowledged', UserId: state.UserId, Timestamp: state.Timestamp };
            alarmHistory.push(history);
		}
		if (this.alarm.Cleared) {
			let state = this.alarm.Cleared;
			let history = { Action: 'Cleared', UserId: state.UserId, Timestamp: state.Timestamp };
			alarmHistory.push(history);
		}
		if (this.alarm.Dismissed) {
			let state = this.alarm.Dismissed;
			let history = { Action: 'Dismissed', UserId: state.UserId, Timestamp: state.Timestamp };
			alarmHistory.push(history);
		}

        alarmHistory.sort(function (a, b) {
            return new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime();
		});

        return alarmHistory;
    }

    addComment(comment: string) {
        if (!comment) {
            return;
        }

        this.alarmService.addComment(this.alarm.Id, comment);
        this.alarm.NewComment = null;
    }
    toggleExpandedImages(): void {
        this.alarm.ExpandedImages = this.alarm.ExpandedImages === 'out' ? 'in' : 'out';
    }

    toggleExpandedComments(): void {
        this.alarm.ExpandedComments = this.alarm.ExpandedComments === 'out' ? 'in' : 'out';
    }

    toggleExpandedHistory(): void {
        this.alarm.ExpandedHistory = this.alarm.ExpandedHistory === 'out' ? 'in' : 'out';
    }

    selectImage(uri: string): void {
        for (let index in this.alarm.Snapshots) {
            this.alarm.Snapshots[index].Selected = this.alarm.Snapshots[index].Uri === uri;
        }
        let imageTitle: string = 'Image Viewer - ' + this.alarm.Description + ' Alarm (P' + this.alarm.Priority + ')';
        this.mediaService.openImageViewer(this.alarm.Id, this.alarm.Snapshots, btoa(imageTitle));
    }
}