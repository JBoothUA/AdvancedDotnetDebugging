import {
    Component, ChangeDetectionStrategy, ChangeDetectorRef,
    trigger, state, style, transition, animate, ViewChild,
    ElementRef, Input
} from '@angular/core';
import { AlarmMapService } from '../map/alarms/alarmMap.service';
import { MapService } from '../map/map.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { Platform, Camera } from './platform.class';
import { PatrolInstance, PatrolStatusValues } from './../patrols/patrol.class';
import { PatrolService } from './../patrols/patrol.service';
import { PlatformService } from './../platforms/platform.service';
import { ConfirmationDialog } from './../shared/confirmation-dialog.component';
import { WindowService, WindowMessage } from './../shared/window.service';
import { PlatformCommand, CommandName, Parameter, ParameterName, ParameterType } from './../patrols/action.class';
import { UserService } from './../shared/user.service';
import { MapViewOptions } from './../shared/map-view-options.class';
import { JoystickData } from './../shared/joystick/joystick.component';

import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { HubService } from "../shared/hub.service";

@Component({
    selector: 'concise-robot-monitor',
    templateUrl: 'concise-robot-monitor.component.html',
    styleUrls: ['concise-robot-monitor.component.css'],
    animations: [
        trigger('slideOut', [
            state('in', style({
                display: 'none',
                right: '-461px'
            })),
            state('out', style({
                right: '*'
            })),
            transition('in <=> out', animate('400ms ease-in-out'))
        ]),
        trigger('slideUp', [
            state('in', style({
                height: 'calc(100vh - 216px)'
            })),
            state('out', style({
                height: 'calc(100vh - 332px)'
            })),
            transition('in <=> out', animate('400ms ease-in-out'))
        ])],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConciseRobotMonitor {
    @Input() mapViewOptions: MapViewOptions;

    public platform: Platform;
    public actionMenuOpen: boolean = false;

    public isShown: boolean = false;
    private sliderIndex: number = 0;
    private secondaryCamaras: Camera[];
    private joystickExpanded: boolean = false;
    private tearOffPlatformMap: Map<string, string[]>; //<Platformid, windowhandleIds[]>
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private actionMenuUnsub: Subject<void> = new Subject<void>();
    private platformSubCollection: Map<string, any>;
    private patrolSubCollection: Map<string, any>;
    private alarmSubCollection: Map<string, any>;

    @ViewChild(ConfirmationDialog) confirmAbort: ConfirmationDialog;
    @ViewChild('platformActions') platformActions: ElementRef;

    constructor(private alarmMapService: AlarmMapService,
        private platformMapService: PlatformMapService,
        private mapService: MapService,
        private patrolService: PatrolService,
        private platformService: PlatformService,
        private windowService: WindowService,
        private userService: UserService,
        private ref: ChangeDetectorRef,
        private hubService: HubService) {

        this.tearOffPlatformMap = new Map<string, string[]>();
        this.platformSubCollection = new Map<string, any>();
        this.patrolSubCollection = new Map<string, any>();
        this.alarmSubCollection = new Map<string, any>();
    }

    public processJoystick(data: JoystickData) {
        console.info('Joystick', data);
    }

    public setPlatform(platform: Platform) {
        if (platform) {
            this.platform = platform;
            this.secondaryCamaras = this.platform.Cameras.slice(1, this.platform.Cameras.length);
            if (this.mapService.centerOffsetX === 0) {
                this.alarmMapService.centerOffsetX = this.platformMapService.centerOffsetX = this.mapService.centerOffsetX = (-459 / 2);
                this.mapService.panToCenter();
            }
            this.isShown = true;

        } else {
            this.alarmMapService.centerOffsetX = this.platformMapService.centerOffsetX = this.mapService.centerOffsetX = (459 / 2);
            this.mapService.panToCenter();
            this.alarmMapService.centerOffsetX = this.platformMapService.centerOffsetX = this.mapService.centerOffsetX = 0;
            this.isShown = false;
        }

        this.ref.detectChanges();
    }

    public isPatrolPausedEnabled(): boolean {
        let patrolInstance: PatrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.platform.id);
        return (patrolInstance && patrolInstance.CurrentStatus !== PatrolStatusValues.Paused);
    }

    public isPatrolResumeEnabled(): boolean {
        let patrolInstance: PatrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.platform.id);
        return (patrolInstance && patrolInstance.CurrentStatus === PatrolStatusValues.Paused);
    }

    public animationDone(event: any) {
        if (!this.isShown) {
            this.platform = null;
        }
        this.ref.detectChanges();
    }

    public getSecondaryCamras(): Camera[] {
        return this.secondaryCamaras.slice(this.sliderIndex, this.secondaryCamaras.length);
    }

    public slideBack(): void {
        let secondaryLength: number = this.secondaryCamaras.slice(1, this.secondaryCamaras.length).length;
        this.sliderIndex = ((this.sliderIndex + 1) >= (secondaryLength)) ? this.sliderIndex : this.sliderIndex + 1;
    }

    public slideForward(): void {
        this.sliderIndex = (this.sliderIndex - 1 < 0) ? 0 : this.sliderIndex - 1;
    }

    public confirmAbortPatrol(): void {
        if (this.patrolService.getPatrolInstanceByPlatformId(this.platform.id) || this.platform.IsPatrolSubmitted) {
            this.confirmAbort.show();
        }

    }

    public handleAbortPatrol(): void {
        let patrolInstance: PatrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.platform.id);
        if (patrolInstance) {
            this.patrolService.abortPatrol(patrolInstance, patrolInstance.TemplateId, this.platform.id);
        } else if (this.platform.IsPatrolSubmitted) {
            this.patrolService.abortPatrol(null, this.platform.PatrolTemplateSubmittedId, this.platform.id);
        }
    }

    private setUpComs(windowHandleId: string) {
        this.platformSubCollection.set(windowHandleId, this.hubService.onPlatformMessage
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (msg) => {
                    let wMsg = new WindowMessage();
                    wMsg.windowId = windowHandleId;
                    wMsg.data = {
                        platformMessage: msg
                    }
                    this.windowService.pushMessageToWindow(wMsg);
                }
            }));

        this.patrolSubCollection.set(windowHandleId, this.hubService.onPatrolMessage
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (msg) => {
                    let wMsg = new WindowMessage();
                    wMsg.windowId = windowHandleId;
                    wMsg.data = {
                        patrolMessage: msg
                    }
                    this.windowService.pushMessageToWindow(wMsg);
                }
            }));

        this.alarmSubCollection.set(windowHandleId, this.hubService.onAlarmMessage
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (msg) => {
                    let wMsg = new WindowMessage();
                    wMsg.windowId = windowHandleId;
                    wMsg.data = {
                        alarmMessage: msg
                    }
                    this.windowService.pushMessageToWindow(wMsg);
                }
            }));
    }

    public onTearOff(): void {
        let windowHandleId: string = new Date().getTime().toString();
        let createNewHandle: boolean = true;
        
        //Check if there is already a handle
        if (this.tearOffPlatformMap.has(this.platform.id)) {
            //Set focus on window
            let windowHandles: string[] = this.tearOffPlatformMap.get(this.platform.id);
            for (let windowHandle of windowHandles) {
                if (this.windowService.doesHandleExists(windowHandle)) {
                    createNewHandle = false;
                    this.windowService.setWindowFocus(windowHandle);
                } 
            }
        }

        if (createNewHandle) {
            this.tearOffPlatformMap.set(this.platform.id, [windowHandleId]);
            this.windowService.newWindowHandle(windowHandleId, window.open('/RobotMonitorTO/' + this.platform.id + '/' + windowHandleId, '_blank', 'width=952,height=560'));
        }
        this.platformService.robotMonitorPlatformId = null;
        this.setPlatform(null);
    }

    public onClose(): void {
        this.setPlatform(null);
        this.platformService.robotMonitorPlatformId = null;
    }
    
    public ngOnInit(): void {
        this.windowService.onReceiveMessage
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (msg) => {
                    if (msg.windowId === 'MAPVIEW_CONCISEROBOTMONITOR') {

                        if (msg.data['kill']) {
                            this.platformSubCollection.get(msg.data['windowhandleId']).unsubscribe();
                            this.patrolSubCollection.get(msg.data['windowhandleId']).unsubscribe();
                            this.alarmSubCollection.get(msg.data['windowhandleId']).unsubscribe();
                        } else if (msg.data['new']) {
                            this.setUpComs(msg.data['windowhandleId']);
                        }
                        else { 
                            //Update handle map
                            let mapList: string[];
                        
                            if (this.tearOffPlatformMap.has(msg.data.oldPlatformId)) {
                                let windowHandles: string[] = this.tearOffPlatformMap.get(msg.data.oldPlatformId);

                                //Remove old records
                                for (let windowHandleIndex in windowHandles) {
                                    if (windowHandles[windowHandleIndex] === msg.data.windowhandleId) {
                                        windowHandles.splice(+windowHandleIndex, 1);
                                    }
                                }
                            }

          
                            //Update new platform information
                            if (this.tearOffPlatformMap.has(msg.data.newPlatformId)) {
                                let windowhandles: string[] = this.tearOffPlatformMap.get(msg.data.newPlatformId);
                                windowhandles.push(msg.data.windowhandleId);
                                this.tearOffPlatformMap.set(msg.data.newPlatformId, windowhandles);
                           
                            } else {
                                this.tearOffPlatformMap.set(msg.data.newPlatformId, [msg.data.windowhandleId]);
                            }

                            this.ref.detectChanges();
                        }
                    }
                }
            });

        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                    if (this.platform && platform.id === this.platform.id) {
                        this.ref.detectChanges();
                    }
                }
            });
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public onPausePatrol(): void {
        let parameterList: Parameter[] = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolService.getPatrolInstanceByPlatformId(this.platform.id), Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.patrolService.getPatrolInstanceByPlatformId(this.platform.id).id, CommandName.PausePatrol, parameterList));
    }

    public onResumePatrol(): void {
        let parameterList: Parameter[] = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolService.getPatrolInstanceByPlatformId(this.platform.id), Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.patrolService.getPatrolInstanceByPlatformId(this.platform.id).id, CommandName.ResumePatrol, parameterList));
    }

    public abortPatrol(): void {
        let patrolInstance: PatrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.platform.id);
        this.patrolService.abortPatrol(patrolInstance, (patrolInstance) ? patrolInstance.TemplateId : this.platform.PatrolTemplateSubmittedId, this.platform.id);
    }

    public openActionMenu(event: MouseEvent, atMouse: boolean = false): void {
        if (atMouse) {
            event.preventDefault();
            this.platformService.openPlatformActionMenu(this.platform, event, null, null, null , false);
        } else {
            this.platformService.openPlatformActionMenu(this.platform, event, this.platformActions, null, null, false);
        }

        this.actionMenuOpen = true;
        this.platformService.platformCommandDialogClosed
            .takeUntil(this.actionMenuUnsub)
            .subscribe({
                next: () => {
                    this.actionMenuOpen = false;
                    this.ref.detectChanges();
                    this.actionMenuUnsub.next();
                }
            });
    }
}