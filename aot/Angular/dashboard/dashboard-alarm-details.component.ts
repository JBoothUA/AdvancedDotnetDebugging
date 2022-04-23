import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
//import { DashboardService } from './dashboard.service';
//import { DashboardAlarmService } from './dashboard-alarm.service';
//import { DashboardPlatformService } from './dashboard-platform.service';
import { Alarm } from '../alarms/alarm.class';
//import { AlarmDetails } from '../alarms/alarm-details.component';
import { MediaService } from '../shared/media/media.service';
import { CorrelationType } from '../shared/shared-interfaces';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'dashboard-alarm-details',
    templateUrl: 'dashboard-alarm-details.component.html',
    styleUrls: ['dashboard-alarm-details.component.css', 'dashboard.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class DashboardAlarmDetails {
    loading: boolean = false;
    override: boolean = true;
    //mockAlarmImages: string[] = ["http://robocop1/commandportal/snapshots/Processed/p_adeptImage131377937316992170.jpg",
    //                            "http://robocop1/commandportal/snapshots/Processed/p_adeptImage131377939558145501.jpg",
    //                            "http://robocop1/commandportal/snapshots/Processed/p_adeptImage131377941326198547.jpg",
    //                            "http://robocop1/commandportal/snapshots/Processed/p_adeptImage131377942845035660.jpg",
    //                            "http://robocop1/commandportal/snapshots/Processed/p_adeptImage131377945999197349.jpg"
    //];

    @Input() dashAlarm: Alarm;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    ///////////////////////////////////////////
    //Core Angular Methods
    ///////////////////////////////////////////
    constructor(private changeDetectorRef: ChangeDetectorRef,
                private mediaService: MediaService) {

        this.mediaService.selectedImageChangedSub
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (correlationId) => {
                    if (correlationId === this.dashAlarm.Id) {
                        this.changeDetectorRef.detectChanges();
                    }
                }
            });
    }

    ngAfterViewInit(): void {
        this.hideLoading();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    ///////////////////////////////////////////
    //Component Methods
    ///////////////////////////////////////////
    private showLoading(): void {
        this.loading = true;
    }

    private hideLoading(): void {
        this.loading = false;
    }

    getImageCount(): string {
        let count: string = '';

        if (this.dashAlarm.Snapshots) {
            count = this.dashAlarm.Snapshots.length.toString();
        }

        return count;
    }

    selectImage(uri: string): void {
        for (let index in this.dashAlarm.Snapshots) {
            this.dashAlarm.Snapshots[index].Selected = this.dashAlarm.Snapshots[index].Uri === uri;
        }
        let imageTitle: string = 'Image Viewer - ' + this.dashAlarm.Description + ' Alarm (P' + this.dashAlarm.Priority + ')';
        this.mediaService.openImageViewer(this.dashAlarm.Id, this.dashAlarm.Snapshots, btoa(imageTitle));
    }
}