import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { DashboardPatrolService } from './dashboard-patrol.service';
import { PatrolCheckpointStatus } from './dashboard';
import { PatrolInstance } from '../patrols/patrol.class';
import { Alarm } from '../alarms/alarm.class';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'dashboard-patrol-details',
    templateUrl: 'dashboard-patrol-details.component.html',
    styleUrls: ['dashboard-patrol-details.component.css', 'dashboard.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class DashboardPatrolDetails {
    loading: boolean = false;
    override: boolean = true;

    @Input() patrol: PatrolInstance;
    @Input() patrolAlarms: Alarm[];

    ///////////////////////////////////////////
    //Core Angular Methods
    ///////////////////////////////////////////
    constructor(private dashboardAlarmService: DashboardAlarmService,
                public dashboardPlatformService: DashboardPlatformService,
                private dashboardPatrolService: DashboardPatrolService,
                private sanitizer: DomSanitizer) {
    }

    public ngAfterViewInit() {
        this.hideLoading();
    }

    ///////////////////////////////////////////
    //Component Methods
    ///////////////////////////////////////////
    private showLoading() {
        this.loading = true;
    }

    private hideLoading() {
        this.loading = false;
    }

    getPatrolElapsedTime() {
        let result: string = this.dashboardPatrolService.getPatrolElapsedTime(this.patrol);
        if (result) {
            let s: string[] = result.split(" ");
            let r: string = "<span style='font-size: 16px; margin-top: 10px;'>" + s[0] + "</span>";
            r = r + "<span style='font-size: 13px; margin-left: 5px;'>" + s[1] + "</span>";
            return this.sanitizer.bypassSecurityTrustHtml(r);
        }
        else
            return '';
    }

    getCheckPointStatus(): PatrolCheckpointStatus {
        return this.dashboardPatrolService.getCheckPointStatus(this.patrol);
    }

    getCheckPointStatusArray(): PatrolCheckpointStatus[] {
        let patrolCPStatus: PatrolCheckpointStatus[] = [];
        let cpStatus: PatrolCheckpointStatus = this.dashboardPatrolService.getCheckPointStatus(this.patrol);
        if (cpStatus)
            patrolCPStatus.push(cpStatus);
        return patrolCPStatus;
    }

    getUserInitials(): string {
        return this.dashboardAlarmService.convertUsernameToInitials(this.patrol.UserName); //TODO move convertUsernameToInitials to the dashboard service
    }

    getPatrolAlarms(): Alarm[] {
        return this.dashboardPatrolService.getPatrolAlarms(this.patrol);
    }

    getAlarmHeaderText(): string {
        let header: string = 'Patrol Alarms';
        if (this.patrol && this.patrol.AlarmIds && this.patrol.AlarmIds.length > 0)
            header = header + ' (' + this.patrol.AlarmIds.length + ')';
        return header;
    }
}