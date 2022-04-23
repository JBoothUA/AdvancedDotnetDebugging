import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export enum Hubs {
    Alarm = 0,
    Platform = 1,
    Patrol = 2
}

declare var _showAlarmLogs: any;
declare var _showPatrolLogs: any;
declare var _showPlatformLogs: any;

@Injectable()
export class MockHubService {
    public hubQueue: Map<Hubs, any[]> = new Map<Hubs, any[]>();
	public onAlarmHubConnected: Subject<void> = new Subject<void>();
	public onPlatformHubConnected: Subject<void> = new Subject<void>();
	public onPatrolHubConnected: Subject<void> = new Subject<void>();
    public onAlarmMessage: Subject<any> = new Subject<any>();
    public onPlatformMessage: Subject<any> = new Subject<any>();
    public onPatrolMessage: Subject<any> = new Subject<any>();
    public serviceDataLoaded: Map<Hubs, boolean> = new Map<Hubs, boolean>();

    constructor() {}

    private pushToQueue(hub: Hubs, msg: any): boolean {
        return false;
    }

    public setDataLoaded(hub: Hubs): void { }
}
