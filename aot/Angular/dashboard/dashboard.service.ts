import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';

import { AlarmService } from '../alarms/alarm.service';
import { PlatformService } from '../platforms/platform.service';
import { Tenant } from '../shared/tenant.class';
import { Location } from '../shared/location.class';
import { FilterTimeframe, DashboardTabs } from './dashboard';
import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { NavigationService } from '../shared/navigation.service';

import { HttpService } from '../shared/http.service';
import { LocationFilterService } from '../shared/location-filter.service';

@Injectable()
export class DashboardService {
    selectedTenants: Tenant[] = [];
    selectedTimeframe: FilterTimeframe = FilterTimeframe.None;
    selectDashboardTab: DashboardTabs = DashboardTabs.None;
    locationHeader: string = '';
    view: string = 'dashboard';
    customStartDateTime: Date;
    customEndDateTime: Date;

    alarmDataLoaded: boolean = false;
    patrolDataLoaded: boolean = false;
    platformDataLoaded: boolean = false;

    locationsChanged: Subject<any> = new Subject();
    onTimeframeChange: Subject<any> = new Subject();
    onTimeframeChangeComplete: Subject<any> = new Subject();
    alarmSelected: Subject<any> = new Subject();
    onShowAlarmFilterCriteria: Subject<any> = new Subject();
    onShowPatrolFilterCriteria: Subject<any> = new Subject();
    onRemoveSelectedAlarmFilterCriteria: Subject<any> = new Subject();
    onRemoveSelectedPatrolFilterCriteria: Subject<any> = new Subject();
    onDashboardTabChanged: Subject<any> = new Subject();
    onLeftPanelToggled: Subject<any> = new Subject();
    private ngUnsubscribe: Subject<void> = new Subject<void>();

	constructor(private httpService: HttpService,
		        private alarmService: AlarmService,
		        private platformService: PlatformService,
		        private locationFilterService: LocationFilterService,
                private locationFilterPipe: LocationFilterPipe,
                private navigationService: NavigationService) {

        this.locationFilterService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (view) => this.setSelectedTenants(view)
            });

        this.navigationService.onMainMenuToggled
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.onLeftPanelToggled.next()
            });

        if (this.selectedTimeframe === FilterTimeframe.None)
            this.setSelectedTimeframe(FilterTimeframe.Current);

        if (this.selectDashboardTab === DashboardTabs.None)
            this.selectDashboardTab = DashboardTabs.Alarms;
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    //////////////////////////////////////////////
    //Event Methods
    //////////////////////////////////////////////
    showAlarmFilterCriteriaComponent(): void {
        this.onShowAlarmFilterCriteria.next();
    }

    showPatrolFilterCriteriaComponent(): void {
        this.onShowPatrolFilterCriteria.next();
    }

    removeSelectedAlarmFilterCriteria(): void {
        this.onRemoveSelectedAlarmFilterCriteria.next();
    }

    removeSelectedPatrolFilterCriteria(): void {
        this.onRemoveSelectedPatrolFilterCriteria.next();
    }

    //////////////////////////////////////////////
    //Tenant/Location Methods
    //////////////////////////////////////////////
    setSelectedTenants(view: string): void {
        if (view === this.view)
            this.locationsChanged.next();
    }

    getAllTenantLocations(): Tenant[] {
        return this.locationFilterService.getAllTenantLocations(this.view);
    }

    getTentant(tenantID: string): Tenant {
        return this.locationFilterService.getTenant(this.view, tenantID);
    }

    getLocation(tenantID: string, locID: string): Location {
        return this.locationFilterService.getLocation(this.view, tenantID, locID);
    }

    getSelectedLocationIDs(): string[] {
        return this.locationFilterService.getSelectedLocationIDs(this.view);
    }

    setSelectedLocationIDs(locationIDs: string[]) {
        this.locationFilterService.setSelectedLocationIDs(this.view, locationIDs);
    }

    getAllLocationIDs(): string[] {
        return this.locationFilterService.getAllLocationIDs(this.view);
    }

    setLocationHeader(locationHeader: string): void {
        this.locationHeader = locationHeader;
    }

    getLocationHeader(): string {
        return this.locationHeader;
    }

    getTenantLocationName(tenantID: string, locID: string): string {
        let name: string = "";
        let loc = this.getLocation(tenantID, locID);
        if (loc)
            name = loc.Name;
        return name;
    }

    getTenantName(tenantID: string): string {
        let name: string = "";
        let tenant = this.getTentant(tenantID);
        if (tenant)
            name = tenant.CustomerName;
        return name;
    }

    getTenantLocationAddr(tenantID: string, locID: string): string {
        let addr: string = "";
        let loc = this.getLocation(tenantID, locID);
        if (loc)
            addr = loc.City + ", " + loc.State;
        return addr;
    }

    //////////////////////////////////////////////
    //Timeframe Methods
    //////////////////////////////////////////////
    getSelectedTimeframe(): FilterTimeframe {
        return this.selectedTimeframe;
    }

    setSelectedTimeframe(timeframe: FilterTimeframe): void {
        this.selectedTimeframe = timeframe;

        //if (timeframe != FilterTimeframe.Custom)
        this.onTimeframeChange.next();
    }

    setCustomStartDateTime(startTime: Date): void {
        this.customStartDateTime = startTime;
    }

    setCustomEndDateTime(endTime: Date): void {
        this.customEndDateTime = endTime;
    }

    applyCustomDate(): void {
        this.onTimeframeChange.next();
    }

    getSelectedTimeframeString(selTimeFrame: FilterTimeframe): string {
        let timeframeStr: string = '';

        switch (selTimeFrame) {
            case FilterTimeframe.EightHours:
                timeframeStr = "Last 8 hours";
                break;
            case FilterTimeframe.TwelveHours:
                timeframeStr = "Last 12 hours";
                break;
            case FilterTimeframe.TwentyFourHours:
                timeframeStr = "Last 24 hours";
                break;
            case FilterTimeframe.LastWeek:
                timeframeStr = "Last Week";
                break;
            case FilterTimeframe.Custom:
                timeframeStr = "";
                break;
            default:
                timeframeStr = "";
                break;
        }

        return timeframeStr;
    }

    //////////////////////////////////////////////
    //Header Methods
    //////////////////////////////////////////////
    getSelectedDashboardTab(): DashboardTabs {
        return this.selectDashboardTab;
    }

    setSelectedDashboardTab(tab: DashboardTabs): void {
        this.selectDashboardTab = tab;
        this.onDashboardTabChanged.next();
    }

    //////////////////////////////////////////////
    //Support Methods
    //////////////////////////////////////////////
    getTimeFrameStartTime(offset: number, range: moment.unitOfTime.DurationConstructor): any {
        let start: Date;
        if ((offset) && (range))
            start = moment().utc().subtract(offset, range).utc().toDate();
        return start;
    }

    getTimeFrameEndTime(): any {
        return moment().utc().toDate();
    }

    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}