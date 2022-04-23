import { Component, Input, NgZone, ChangeDetectorRef, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, Event as RouterEvent , NavigationStart } from '@angular/router';

import { AlarmService } from '../alarms/alarm.service';
import { AlarmMapService } from '../map/alarms/alarmMap.service';
import { PlatformService } from '../platforms/platform.service';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolTemplate, PatrolInstance } from '../patrols/patrol.class';
import { PatrolMapService } from '../map/patrols/patrolMap.service';
import { LocationMapService } from '../map/locations/locationMap.service';
import { LeafletMap } from '../map/leaflet-map.component';
import { Modal } from './../shared/modal.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { LocationFilterService } from '../shared/location-filter.service';
import { Alarm } from '../alarms/alarm.class';
import { Platform } from '../platforms/platform.class';
import { Location } from '../shared/location.class';
import { ConciseRobotMonitor } from '../platforms/concise-robot-monitor.component';
import { ConfirmationDialog } from './../shared/confirmation-dialog.component';
import { AppSettings } from '../shared/app-settings';
import { MapViewOptions } from '../shared/map-view-options.class';

@Component({
    selector: 'map-view',
    templateUrl: 'mapview.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class MapView {
    @ViewChild(ConciseRobotMonitor) conciseRobotMonitor: ConciseRobotMonitor;
    @ViewChild('map') Map: LeafletMap;
    @ViewChild(Modal) executePatrolError: Modal;
    @ViewChild(ConfirmationDialog) confirmAbort: ConfirmationDialog;
        
    options: MapViewOptions;
    loading: boolean = true;
	selectAlarmId: string = null;
    patrol: PatrolTemplate;
    locationViewName: string = 'mapview';
    platforms: Platform[] = [];

    private pendingAbortPatrolPlatform: Platform;

    public executeErrorMessage: string;
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(private ngZone: NgZone, public alarmService: AlarmService, private platformService: PlatformService,
                private route: ActivatedRoute, private changeDetectorRef: ChangeDetectorRef, private patrolService: PatrolService,
                private patrolMapService: PatrolMapService, private alarmMapService: AlarmMapService, public appSettings: AppSettings,
                private locationFilterService: LocationFilterService, private locationMapService: LocationMapService,
                private router: Router) {

        // Restore alarm states
        this.alarmService.restoreMapViewAlarmStates();

        this.options = new MapViewOptions();
        this.options.showAlarmsTab = true;
        this.options.showPlatformsTab = false;
		this.options.showPatrolsTab = false;
		this.options.lastShownTab = 'Alarm';
        //TODO how to localization, angular-translate? resourceModel = Html.Raw(serializer.Serialize(Model["ResourceModel"]));
	}

	alarmsTabClicked(): void {
		this.options.showPlatformsTab = false;
		this.options.showPatrolsTab = false;
		this.options.showLeftPanelContent = !this.options.showAlarmsTab;
		this.options.showAlarmsTab = !this.options.showAlarmsTab;
		this.options.lastShownTab = 'Alarm';
		
		this.ensureMapResizes();
    }

	platformsTabClicked(): void {
		this.options.showAlarmsTab = false;
		this.options.showPatrolsTab = false;
		this.options.showLeftPanelContent = !this.options.showPlatformsTab;
		this.options.showPlatformsTab = !this.options.showPlatformsTab;
		this.options.lastShownTab = 'Platform';

		this.ensureMapResizes();
    }

	patrolsTabClicked(): void {
		this.options.showAlarmsTab = false;
		this.options.showPlatformsTab = false;
		this.options.showLeftPanelContent = !this.options.showPatrolsTab;
		this.options.showPatrolsTab = !this.options.showPatrolsTab;
		this.options.lastShownTab = 'Patrol';

		this.ensureMapResizes();
	}

	ensureMapResizes() {
		this.changeDetectorRef.detectChanges();
		$(window).resize();
	}

	handleShowPatrolBuilder(patrolTemplateId: string) {
		this.patrol = this.patrolService.getPatrolTemplate(patrolTemplateId);
		//if (this.patrol)
		//	this.patrolMapService.setActivePatrol(this.patrol);
        this.options.showLeftPanel = false;
        this.options.showPatrolBuilder = true;
    }

	handleHidePatrolBuilder() {
		this.options.showLeftPanel = true;
		this.options.showPatrolBuilder = false;
    }

    ngAfterViewInit(): void {
        //Bring back concise robot monitor if it was open
        if (this.platformService.robotMonitorPlatformId) {
            let platform = this.platformService.getPlatform(this.platformService.robotMonitorPlatformId);
            this.platformService.robotMonitorPlatformId = null;
            this.platformService.showRobotMonitor(platform);
        }

        this.router.events.takeUntil(this.ngUnsubscribe).subscribe((event: RouterEvent) => {
            if (event instanceof NavigationStart) {
                this.appSettings.mapViewMapCenter = this.alarmMapService.map.getCenter();
                this.appSettings.mapViewMapZoom = this.alarmMapService.map.getZoom();
                this.alarmService.persistMapViewAlarmStates();
            }
        });

        this.alarmService.alarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (status) => {
                    if (status) {
                        // After dom is constructed, load the alarms
                        $(() => {
                            if(!this.alarmService.filterAlarms || this.alarmService.filterAlarms.length == 0) {
                            this.applyLocationFilter(this.locationViewName);
                            }

                            this.checkRouteParams();
                        });
                    }
                }
            });
        this.alarmService.newAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.changeDetectorRef.markForCheck()
            });
        this.alarmService.removedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.changeDetectorRef.markForCheck()
            });

        this.alarmService.selectionChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.changeDetectorRef.markForCheck()
            });

        this.platformService.onPlatformsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => this.updatePlatforms()
            });
        this.platformService.onNewPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => this.updatePlatforms()
            });
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => this.updatePlatforms()
            });
        this.platformService.selectionChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => this.changeDetectorRef.markForCheck()
            });
        this.platformService.onShowRobotMonitor
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                    this.conciseRobotMonitor.setPlatform(platform);
                }
            });
        this.platformService.onConfirmAbortPatrol
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                    this.pendingAbortPatrolPlatform = platform;
                    this.confirmAbort.show();
                }
            });

        this.patrolService.onExecutePatrolError
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (error) => {
                    this.executeErrorMessage = error;
                    this.executePatrolError.show();
                }
            });

        this.locationFilterService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (view) => this.applyLocationFilter(view)
            });

        this.locationFilterService.onZoomToLocation
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (location) => this.handleZoomToMapLocation(location)
            });

        this.route.params.takeUntil(this.ngUnsubscribe).subscribe(
            (params) => {
                if (!this.loading) {
                    this.checkRouteParams();
                }
            });

        this.loading = false;
    }

    public checkRouteParams(): void {
        let tab: string = this.route.snapshot.data['tab'];
        if (tab) {
            this.options.lastShownTab = tab;
            let id: string = this.route.snapshot.params['id'];

            // If a tab was specified, swap to it
            if (tab === 'Alarm') {
                this.options.showAlarmsTab = true;
                this.options.showPlatformsTab = false;
                this.options.showPatrolsTab = false;

                if (id) {
                    $(() => {
                        this.alarmService.selectOnlyAlarm(id);
                    });
                }

                this.changeDetectorRef.markForCheck();
            } else if (tab === 'Platform') {
                this.options.showAlarmsTab = false;
                this.options.showPlatformsTab = true;
                this.options.showPatrolsTab = false;

                if (id) {
                    $(() => {
                        this.platformService.selectPlatform(id);
                    });
                }
            } else if (tab === 'Patrol') {
                this.options.showAlarmsTab = false;
                this.options.showPlatformsTab = false;
                this.options.showPatrolsTab = true;

                if (id) {
                    $(() => {
                        // select patrol
                    });
                }
            }
        }
    }

    public applyLocationFilter(view: string): void {
		if (view === this.locationViewName) {
			let locations = this.locationFilterService.getSelectedLocationIDs(view);
			this.alarmService.setSelectedLocations(locations);
            this.platformService.setSelectedLocations(locations);
            this.alarmService.filterAlarms();
            this.platforms = this.getPlatforms();
            this.changeDetectorRef.markForCheck();
		}
    }

    public updatePlatforms() {
        this.platforms = this.getPlatforms();
    }

    public getPlatforms(): Platform[] {
        return this.platformService.getPlatforms();
    }

    public getLocations(): Location[] {
        return this.locationFilterService.getSelectedLocations(this.locationViewName);
    }

    public abortPatrol(): void {
        let patrolInstance: PatrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.pendingAbortPatrolPlatform.id);
        this.patrolService.abortPatrol(patrolInstance, (patrolInstance) ? patrolInstance.TemplateId : this.pendingAbortPatrolPlatform.PatrolTemplateSubmittedId, this.pendingAbortPatrolPlatform.id);
        this.pendingAbortPatrolPlatform = null;
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    handleZoomToMapLocation(location: Location) {
        this.Map.zoomToMapLocation(location);
    }
}