import {
    Component, Input, ChangeDetectionStrategy,
    OnInit, ChangeDetectorRef, OnDestroy, ViewChild,
    trigger, state, style, transition, animate,
    ElementRef, HostListener
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Alarm } from '../alarms/alarm.class';
import { AlarmService } from '../alarms/alarm.service';
import { slideDown, fade } from './../shared/animations';
import { PlatformService } from './../platforms/platform.service';
import { Platform, Camera, PlatformMode } from './../platforms/platform.class';
import { PatrolService } from './../patrols/patrol.service';
import { PatrolInstance, PatrolTemplate } from './../patrols/patrol.class';
import { LocationFilterService } from './../shared/location-filter.service';
import { PatrolStatusValues } from './../patrols/patrol.class';
import { ConfirmationDialog } from './../shared/confirmation-dialog.component';
import {
    PlatformCommand, CommandName, Parameter,
    ParameterName, ParameterType, CommandDefinition, ActionStateValue
} from './../patrols/action.class';
import { CommandCollectionItem } from './command-definition-collection.class';
import { UserService } from './../shared/user.service';
import { DragulaService } from 'ng2-dragula';
import { WindowService, WindowMessage } from './../shared/window.service';
import { SortType } from './../shared/shared-interfaces';
import { Popover } from './../shared/popover.component';

import { MapService } from './../map/map.service';
import { AlarmMapService } from './../map/alarms/alarmMap.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { PatrolMapService } from '../map/patrols/patrolMap.service';
import { MapUtilityService } from '../map/map-utility.service';

import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { HubService } from "../shared/hub.service";

export enum WindowSize {
    sm,     //Width
    med,    //Width
    lg,     //Width
    short,  //Height
    normal  //Height
}

enum ItemType {
    video,
    map
}

enum Sections {
    PatrolHistory,
    ActiveAlarms,
    RobotSensors
}

class Item {
    public type: ItemType;
    public data: object;

    constructor(obj: any) {
        this.type = obj.type;
        this.data = obj.data;
    }
}

@Component({
    selector: 'robot-monitor-dynamic',
    templateUrl: 'robot-monitor.component.html',
    styleUrls: ['robot-monitor.component.css'],
    animations: [slideDown, fade,
        trigger('slideOut', [
            state('out', style({
                right: '0'
            })),
            state('in', style({
                display: 'none',
                right: '*'
            })),
            transition('in <=> out', animate('400ms ease-in-out'))
        ])
    ],
    providers: [PlatformMapService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RobotMonitorDynamic implements OnInit, OnDestroy {
    public PatrolStatusValues: typeof PatrolStatusValues = PatrolStatusValues;

    public widthSize: WindowSize;
    private heightSize: WindowSize;
    private WindowSize: typeof WindowSize = WindowSize;
    private routePlatformId: string;
    private routeSub: any;
    public selectedPlatform: Platform;
    private itemList: Item[];
    private ItemType: typeof ItemType = ItemType;
    private sliderIndex: number = 0;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private historyItems: PatrolInstance[] = [];
    private isLoadingHistory: boolean = true;
    private expandedPatrolOverview: string = null;
    private Sections: typeof Sections = Sections;
    private expandedSection: Sections[] = [Sections.PatrolHistory];
    private alarmCount: number = 0;
    private pauseNoficationTimeout: NodeJS.Timer = null;
    private notificationIsPaused: boolean = true;
    private isTearOff: boolean = false;
    private windowhandleId: string;
    public controllerIsShown: boolean = false;
    public patrolHistorySortOrder: SortType = SortType.Desc;
    private PlatformMode: typeof PlatformMode = PlatformMode;
    private commandGroups: string[] = [];
    private expandedCommandGroups: string[] = [];
    public showAllPatrolPoints: boolean = false;
    private isMapLocked: boolean = true;
    private isMapLoadedReset: boolean = true;

    @ViewChild(ConfirmationDialog) confirmAbort: ConfirmationDialog;
    @ViewChild('popover') pointOptions: Popover;
    @ViewChild('btnPointOptions') popoverTarget: ElementRef;

    constructor(private route: ActivatedRoute,
        private platformService: PlatformService,
        public patrolService: PatrolService,
        private locationFilterService: LocationFilterService,
        private ref: ChangeDetectorRef,
        private alarmService: AlarmService,
        private userService: UserService,
        private dragulaService: DragulaService,
        private windowService: WindowService,
        private hubService: HubService) {
        
        if (dragulaService.find('moveElement')) {
            dragulaService.destroy('moveElement');
        }

        dragulaService.setOptions('moveElement', {
            copy:true,
            revertOnSpill: true,
            invalid: (el: any, handle: any) => {
                return !$(handle).hasClass('title');
            }
        });

    } 

    @HostListener('window:beforeunload', ['$event'])
    killCom($event: any) {
        let msg = new WindowMessage();
        msg.windowId = "MAPVIEW_CONCISEROBOTMONITOR";
        msg.data = {
            kill: true,
            windowhandleId: this.windowhandleId
        }

        this.windowService.pushMessageToParent(msg);
    }

    public handleOnPatrolSelected(): void {
        this.isMapLocked = false;
        this.ref.markForCheck();
    }

    public handleOnChooserShown(): void {
        this.isMapLoadedReset = this.isMapLocked;
    }

    public handleOnChooserHide(): void {
        //this.patrolService.toggleSelectedPatrol('', true);

        this.isMapLocked = this.isMapLoadedReset;
        this.isMapLoadedReset = this.isMapLocked;

        this.ref.markForCheck();
    }

    public onResize(event: any) {
        this.widthSize = this.getWidthWindowSize();
        this.heightSize = this.getHightWindowSize();

        this.ref.detectChanges();
    }

    public showPauseNotfication(): boolean {
        let patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.selectedPlatform.id);
        //If patrol is paused and notfication not seen
        if (patrolInstance &&
            patrolInstance.CurrentStatus === PatrolStatusValues.Paused &&
            this.notificationIsPaused ) {
            //Hide pause button
            if (!this.pauseNoficationTimeout) {
              
                this.pauseNoficationTimeout = setTimeout(() => {
                    this.notificationIsPaused = false;
                    this.ref.detectChanges();
                }, 3000);
            }

            return true;
        }

        return false;
    }

    public isPaused(): boolean {
        let patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.selectedPlatform.id);
        if (patrolInstance && patrolInstance.CurrentStatus === PatrolStatusValues.Paused)
            return true;

        return false;
    }

    public resumeOnClick(event: any) {
        let parameterList: Parameter[] = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolService.getPatrolInstanceByPlatformId(this.selectedPlatform.id).InstanceId, Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.selectedPlatform.id, CommandName.ResumePatrol, parameterList));
    }

    public pauseOnClick(event: any) {
        let parameterList: Parameter[] = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolService.getPatrolInstanceByPlatformId(this.selectedPlatform.id).InstanceId, Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.selectedPlatform.id, CommandName.PausePatrol, parameterList));
    }

    public handleAbortClick(): void {
        this.confirmAbort.show();
    }

    public getWidthWindowSize(): WindowSize {
        if (window.innerWidth <= 1365) {
            return WindowSize.sm;
        } else if (window.innerWidth <= 1871) {
            return WindowSize.med;
        } else {
            return WindowSize.lg;
        }
    }

    public getHightWindowSize(): WindowSize {
        if (window.innerHeight < 600) {
            return WindowSize.short;
        } else {
            return WindowSize.normal;
        }
    }

    public getPlatformList(platformId: string): Platform[] {
        let platformList: Platform[] = [];

        for (let platform of this.platformService.platforms) {
            if (platformId !== platform.id) {
                platformList.push(platform);
            }
        }

        return platformList.sort((a, b) => {
            if (a.DisplayName.toLowerCase() < b.DisplayName.toLowerCase())
                return -1;
            if (a.DisplayName.toLowerCase() > b.DisplayName.toLowerCase())
                return 1;
            return 0;
        });
    }

    public onPlatformChange(platform: Platform): void {
        if (this.isTearOff) {
            this.sendPlatformChangedMessageToParent(this.selectedPlatform.id, platform.id);
        }
        this.selectedPlatform = platform;
        this.builItemList();
        this.historyItems = [];
        this.getPatrolHistory();
        this.buildCommandListGroups(); 
    }

    public getPatrolHistory(): void {

        let response: Promise<any> = this.patrolService.getPatrolHistoryByPlatformId(this.selectedPlatform.id);
        this.isLoadingHistory = true;
        response.then((data) => {
            this.historyItems = [];

            for (let item of data) {
                this.historyItems.push(new PatrolInstance(item));
            }
            this.isLoadingHistory = false;
            this.ref.markForCheck();
        });
    }

    public handlePatrolOverviewExpansion(instanceId: string) {
        this.expandedPatrolOverview = instanceId;
    }

    public isProgressBarHidden(patrolInstance: PatrolInstance): boolean {
        let isHidden: boolean = true;
        if (patrolInstance) {
            isHidden = false;
        } else if (this.selectedPlatform.PatrolTemplateSubmittedId) {
            isHidden = false;
        }

        return isHidden;
    }

    public getFirstItem(): Item {

        if (this.itemList.length > 0) {
            return this.itemList[0];
        }

        return null;
    }

    public getLastItem(): Item {
        if (this.itemList.length > 1) {
            return this.itemList.slice(-1)[0];
        }
        
        return null;
    }

    public getSecondaryContent(excludeLastItem: boolean = false): Item[] {
        let offset = (excludeLastItem) ? 1 : 0;
        if (this.widthSize !== WindowSize.sm) {
            return this.itemList.slice(1, this.itemList.length - offset);
        } else {
            return this.itemList.slice(1 + this.sliderIndex, this.itemList.length - offset);
        }
    }

    public getLocName(): string {
        return this.locationFilterService.getLocation('robotMonitor', this.selectedPlatform.TenantId, this.selectedPlatform.LocationId).Name;
    }

    public slideForward(): void {
        this.sliderIndex = (this.sliderIndex - 1 < 0) ? 0 : this.sliderIndex - 1;
    }

    public slideBack(): void {
        let secondaryLength: number = this.itemList.slice(1, this.itemList.length).length;
        this.sliderIndex = ((this.sliderIndex + 1) >= (secondaryLength)) ? this.sliderIndex : this.sliderIndex + 1;
    }

    public toggleExpandedSection(section: Sections): void {
        event.stopPropagation;
        if (this.expandedSection.includes(section)) {
            this.expandedSection.splice(this.expandedSection.indexOf(section), 1);
        } else {
            this.expandedSection.unshift(section);
            this.expandedSection = this.expandedSection.slice(0, 2);
        }
    }

    public toggleExpandedSectionView(section: Sections): boolean {
        return this.expandedSection.includes(section);
    }

    public getAlarmList(): Alarm[] {
        let alarms: Alarm[] = [];

        alarms = this.alarmService.alarms.filter((alarm: Alarm) => {
            return alarm.PlatformId === this.selectedPlatform.id;
        });

        this.alarmCount = alarms.length;
        return alarms;
    }

    public markForCheck(alarms: any): void {
        if (!this.selectedPlatform)
            return;

        if (this.selectedPlatform.id && alarms.PlatformId === this.selectedPlatform.id)
            this.ref.markForCheck();
    }

    public getHighestAlarmPriorityClass(alarmList: Alarm[]): string {
        let priorty: number = 99;

        for (let alarm of alarmList) {
            if (alarm.Priority < priorty)
                priorty = alarm.Priority;
        }

        if (priorty !== 99)
            return 'p' + priorty.toString();
        else
            return 'p';
    }

    public makeMainItem(sourceIndex: number):void {
  
        let targetItem = this.itemList[0];
        let sourceItem = this.itemList[sourceIndex];

        this.itemList[sourceIndex] = targetItem;
        this.itemList[0] = sourceItem;

        this.ref.detectChanges();
    }

    public ngOnInit(): void {
        this.widthSize = this.getWidthWindowSize();
        this.heightSize = this.getHightWindowSize();
    
        this.locationFilterService.registerComponent('robotMonitor', false);

        this.routeSub = this.route.params.subscribe(params => {
            this.routePlatformId = params['id'];

            if (params['tearOffMode']) {
                this.isTearOff = true;
                this.windowhandleId = params['tearOffMode'];
                this.ref.markForCheck();


                let msg = new WindowMessage();
                msg.windowId = "MAPVIEW_CONCISEROBOTMONITOR";
                msg.data = {
                    new: true,
                    windowhandleId: this.windowhandleId
                }

                this.windowService.pushMessageToParent(msg);

                this.hubService.stopPlatforms();
                this.hubService.stopPatrols();
                this.hubService.stopAlarms();

                if (!this.platformService.platforms || !this.platformService.platforms.length) { 
                    this.platformService.loadPlatforms();
                }

                if (!this.patrolService.patrolTemplates || !this.patrolService.patrolTemplates.length) {
                    this.patrolService.loadPatrolTemplates();
                }
                if (!this.patrolService.patrolInstances || !this.patrolService.patrolInstances.length) {
                    this.patrolService.loadPatrolInstances();
                }

                if (!this.alarmService.alarms || !this.alarmService.alarms.length) {
                    this.alarmService.loadAlarms();
                }

                this.windowService.onReceiveMessage
                    .takeUntil(this.ngUnsubscribe)
                    .subscribe({
                        next: (msg) => {
                            if (msg.windowId === this.windowhandleId) {
                                if (msg.data['platformMessage']) {
                                    this.platformService.handleMessage(msg.data['platformMessage']);
                                } else if (msg.data['patrolMessage']) {
                                    this.patrolService.handleMessage(msg.data['patrolMessage']);
                                } else if (msg.data['alarmMessage']) {
                                    this.alarmService.handleMessage(msg.data['alarmMessage']);
                                }
                            }
                        }
                    });

            }
        });

        if (this.platformService.platforms.length > 0) {
            this.processInitPlatformSelection();

            this.patrolService.toggleSelectedPatrol(this.selectedPlatform.PatrolTemplateSubmittedId, true);
            this.ref.markForCheck();
        }

        this.platformService.onPlatformsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => {
                    this.processInitPlatformSelection();
                    this.patrolService.toggleSelectedPatrol(this.selectedPlatform.PatrolTemplateSubmittedId, true);
                    this.ref.markForCheck();
                }
            });

        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                        this.ref.markForCheck();
                    }
            });

        this.platformService.onNewPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                    this.ref.markForCheck();
                }
            });

        this.platformService.onConfirmAbortPatrol
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                    this.confirmAbort.show();
                }
            });

        this.patrolService.onNewInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrol) => {
                    if (patrol.PlatformId === this.selectedPlatform.id) {
                        if (patrol.UserName === this.userService.currentUser.name) {
                            this.expandedPatrolOverview = patrol.id; 
                        }
                        this.ref.markForCheck();
                    }
                }
            });

        this.patrolService.onUpsertTemplate
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrol) => {
                    if (patrol.PlatformSubmittedId === this.selectedPlatform.id) {
                        this.patrolService.toggleSelectedPatrol(patrol.id, true);
                    }
                }
            });

        this.alarmService.clearingAlarms
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarms) => this.markForCheck(alarms)
            });

        this.alarmService.dismissingAlarms
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarms) => this.markForCheck(alarms)
            });

        this.alarmService.newAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.markForCheck(alarm)
            });

        this.alarmService.editedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.markForCheck(alarm)
            });

        this.alarmService.removedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.markForCheck(alarm)
            });

        this.patrolService.onPatrolInstanceComplete
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolInstance) => {
                    if (patrolInstance && this.selectedPlatform) {
                        if (this.selectedPlatform.id === patrolInstance.PlatformId) {
                            this.historyItems.unshift(patrolInstance);
                            this.historyItems = this.historyItems.slice(0, 5);
                            this.ref.markForCheck();
                        }
                    }
                }
            });

        this.dragulaService.drop
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (args) => {

                    this.dragulaService.find('moveElement').drake.cancel(true);

                    let [el, target, source, sibling] = args.slice(1);
                    let targetIndex: any = target.getAttribute('itemindex');
                    let sorceIndex: any = source.getAttribute('itemindex');

                    let targetItem = this.itemList[targetIndex];
                    let sourceItem = this.itemList[sorceIndex];

                    this.itemList[sorceIndex] = targetItem;
                    this.itemList[targetIndex] = sourceItem;

                    this.ref.detectChanges();
                }
            });
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();

        
    }

    

    public getPatrolTemplateIdForAbort(): string {
        if (this.selectedPlatform.PatrolTemplateSubmittedId) {
            return this.selectedPlatform.PatrolTemplateSubmittedId;
        } 

        let patrolInstance: PatrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.selectedPlatform.id);

        if (patrolInstance) {
            return patrolInstance.TemplateId;
        }

        return '';
    }

    private mapUpdateEvent(platform: Platform) {
        alert('FIRE');
    }

    private builItemList(): void {
        this.itemList = [];

        for (let camera of this.selectedPlatform.Cameras) {
            this.itemList.push(new Item({ type: ItemType.video, data: camera}));
        }

        this.itemList.push(new Item({ type: ItemType.map, data: null }));
    }

    private processInitPlatformSelection(): void {
        if (this.routePlatformId) {
            this.selectedPlatform = this.platformService.getPlatform(this.routePlatformId);

            this.builItemList();
            this.getPatrolHistory()
            this.ref.markForCheck();
        }

        let patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.selectedPlatform.id);
        if (patrolInstance) {
            this.expandedPatrolOverview = patrolInstance.InstanceId;
        }

        this.buildCommandListGroups();
    }

    private sendPlatformChangedMessageToParent(oldPlatformId: string, newPlatformId:string) {
        let msg = new WindowMessage();
        msg.windowId = "MAPVIEW_CONCISEROBOTMONITOR";
        msg.data = {
            oldPlatformId: oldPlatformId,
            newPlatformId: newPlatformId,
            windowhandleId: this.windowhandleId
        }

        this.windowService.pushMessageToParent(msg);
    }

    private buildCommandListGroups(): void {
        this.commandGroups = [];
        for (let command of this.selectedPlatform.Commands) {
            switch (command.CommandName) {
                case CommandName.Abort:
                case CommandName.CancelGoal:
                case CommandName.EStop:
                case CommandName.EStopReset:
                case CommandName.GoToLocation:
                case CommandName.ResetCameras:
                case CommandName.PausePatrol:
                case CommandName.ResumePatrol:
                case CommandName.TiltCameraAbsolute:
                    continue;
            }

            if (!this.commandGroups.includes(command.Category)) {
                this.commandGroups.push(command.Category);
            }

        }

        this.expandedCommandGroups = this.commandGroups;
    }

    private showPointOptions(event: MouseEvent): void {
        try {
            event.stopPropagation();
        } catch (e) {
            console.error(e);
        }
        this.pointOptions.show(this.popoverTarget, 1, -1)
    }

    private toggleHistorySort(): void {
        try {
            event.stopPropagation();
        } catch (e) {
            console.error(e);
        }

        if (this.patrolHistorySortOrder === SortType.Desc)
            this.patrolHistorySortOrder = SortType.Asc;
        else
            this.patrolHistorySortOrder = SortType.Desc;

        this.ref.markForCheck();
    }
}