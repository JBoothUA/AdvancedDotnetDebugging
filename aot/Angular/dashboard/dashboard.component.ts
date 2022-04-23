import { Component, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardFilter } from './dashboard-filter.component';
import { DashboardHeader } from './dashboard-header.component';
import { DashboardAlarm } from './dashboard-alarm.component';
import { DashboardTabs } from './dashboard';
import { AlarmMapService } from "../map/alarms/alarmMap.service";

@Component({
    selector: 'dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.css']
})

export class Dashboard {
    //public alarmTabSelected: boolean = true;
    //public patrolTabSelected: boolean = false;
    //public robotTabSelected: boolean = false;
    dashboardTab: typeof DashboardTabs = DashboardTabs;

    isLoading: boolean = true;
    override: boolean = true;
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    constructor(public dashboardService: DashboardService,
        private dashboardAlarmService: DashboardAlarmService,
        private changeDetectorRef: ChangeDetectorRef,
        private alarmMapService: AlarmMapService) {

        this.dashboardService.onTimeframeChange
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.showLoading()
            });

        this.dashboardService.onTimeframeChangeComplete
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.hideLoading()
            });

        dashboardService.onDashboardTabChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.showLoading()
            });        
    }

    public ngAfterViewInit(): void {
        //this.hideLoading();
        this.alarmMapService.manualZoomMode = true;
        this.changeDetectorRef.detectChanges();  //had to add for an Angular 4.2 bug #17572
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        this.alarmMapService.manualZoomMode = false;
    }

    ///////////////////////////////////////////
    //Component Methods
    ///////////////////////////////////////////
    private showLoading(): void {
        this.isLoading = true;
        this.changeDetectorRef.detectChanges();
    }

    private hideLoading(): void {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
    }
}