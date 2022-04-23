﻿import { Injectable } from '@angular/core';
 import { Subject } from 'rxjs/Subject';
 import { HubConnection, TransportType, LogLevel } from '@aspnet/signalr-client';
import { UserService } from './user.service';

export enum Hubs {
    Alarm = 0,
    Platform = 1,
    Patrol = 2
}

export class HubDefinition {
    Type: Hubs;
    Name: string;
    EndPoint: string;
    OnMessage: Subject<void>;
    OnConnected: Subject<void>;
    AutoReconnect: boolean = true;
}

declare let _showAlarmLogs: any;
declare let _showPatrolLogs: any;
declare let _showPlatformLogs: any;
declare let signalRHubEndpoint: any;

@Injectable()
export class HubService {
    public onAlarmHubConnected: Subject<void> = new Subject<void>();
    public onPatrolHubConnected: Subject<void> = new Subject<void>();
    public onPlatformHubConnected: Subject<void> = new Subject<void>();

    public onAlarmMessage: Subject<any> = new Subject<any>();
    public onPlatformMessage: Subject<any> = new Subject<any>();
    public onPatrolMessage: Subject<any> = new Subject<any>();

    public hubQueue: Map<Hubs, any[]> = new Map<Hubs, any[]>();
    public serviceDataLoaded: Map<Hubs, boolean> = new Map<Hubs, boolean>();

    private hubConnections: HubConnection[] = [];
    private hubDefinitions: HubDefinition[] = [];

    private reconnectTimeout: number = 30000;

    constructor(private userService: UserService) {
        this.serviceDataLoaded.set(Hubs.Platform, false);
        this.serviceDataLoaded.set(Hubs.Patrol, false);

        let alarmHub = new HubDefinition();
        alarmHub.Type = Hubs.Alarm;
        alarmHub.Name = 'Alarm';
        alarmHub.EndPoint = `${signalRHubEndpoint}/alarmHub`;
        alarmHub.OnConnected = this.onAlarmHubConnected;
        alarmHub.OnMessage = this.onAlarmMessage;
        this.hubDefinitions[Hubs.Alarm] = alarmHub;
        this.connectToHub(this.hubDefinitions[Hubs.Alarm]);

        let patrolHub = new HubDefinition();
        patrolHub.Type = Hubs.Patrol;
        patrolHub.Name = 'Patrol';
        patrolHub.EndPoint = `${signalRHubEndpoint}/patrolHub`;
        patrolHub.OnConnected = this.onPatrolHubConnected;
        patrolHub.OnMessage = this.onPatrolMessage;
        this.hubDefinitions[Hubs.Patrol] = patrolHub;
        this.connectToHub(this.hubDefinitions[Hubs.Patrol]);

        let platformHub = new HubDefinition();
        platformHub.Type = Hubs.Platform;
        platformHub.Name = 'Platform';
        platformHub.EndPoint = `${signalRHubEndpoint}/platformHub`;
        platformHub.OnConnected = this.onPlatformHubConnected;
        platformHub.OnMessage = this.onPlatformMessage;
        this.hubDefinitions[Hubs.Platform] = platformHub;
        this.connectToHub(this.hubDefinitions[Hubs.Platform]);
    }

    private connectToHub(hub: HubDefinition): void {
        this.hubConnections[hub.Type] = new HubConnection(hub.EndPoint, { logging: LogLevel.Error });

        this.hubConnections[hub.Type].start().then(() => {
            // Build list of tenant ids for the current user and join the associated groups
            let tenantIds: string[] = [];

            tenantIds.push(this.userService.currentUser.tenant.Id);

            for (let tenant of this.userService.currentUser.childTenants) {
                tenantIds.push(tenant.Id);
            }

            this.hubConnections[hub.Type].invoke('JoinGroups', tenantIds).then((res) => {
                // Successfully connected and joined groups
                console.info(`${hub.Name} hub connected`);

                hub.OnConnected.next();

                this.hubConnections[hub.Type].on('Send', (msg: any) => {
                    if (this.pushToQueue(hub.Type, msg)) {
                        return;
                    }

                    if ((hub.Type === Hubs.Alarm && _showAlarmLogs) || (hub.Type === Hubs.Patrol && _showPatrolLogs) || (hub.Type === Hubs.Platform && _showPlatformLogs)) {
                        console.info(`${hub.Name} Msg: ${msg}`);
                    }
                    hub.OnMessage.next(JSON.parse(msg));
                });

                this.hubConnections[hub.Type].onclose((e) => {
                    if (hub.AutoReconnect) {
                        console.info(`Connection to ${hub.Name} hub closed. Reconnecting in ${this.reconnectTimeout / 1000} seconds.`);
                        this.serviceDataLoaded.set(hub.Type, false);
                        setTimeout(() => {
                            this.connectToHub(hub);
                        }, this.reconnectTimeout);
                    }
                });
            }).catch(err => {
                if (hub.AutoReconnect) {
                    console.info(`Failed to join ${hub.Name} hub groups! Retrying in ${this.reconnectTimeout / 1000} seconds.`);
                    setTimeout(() => {
                        this.connectToHub(hub);
                    }, this.reconnectTimeout);
                }
            });
        })
        .catch(err => {
            if (hub.AutoReconnect) {
                console.info(`Could not connect ${hub.Name} hub! Retrying in ${this.reconnectTimeout / 1000} seconds.`);
                setTimeout(() => {
                    this.connectToHub(hub);
                }, this.reconnectTimeout);
            }
        });
    }


    private pushToQueue(hub: Hubs, msg: any): boolean {
        if (!this.serviceDataLoaded.get(hub)) {
            let queue = this.hubQueue.get(hub);

            if (!queue) {
                queue = [];
            }

            queue.push(msg);
			console.info('Queueing ' + Hubs[hub] + ' Msg', queue);
            this.hubQueue.set(hub, queue);
            return true;
        } else {
            return false;
        }
    }

    public setDataLoaded(hub: Hubs): void {
        //Process query
        let nullCount = 0;
        while (this.hubQueue.get(hub) && this.hubQueue.get(hub).length > nullCount) {
            nullCount = 0;
            for (let msg of this.hubQueue.get(hub)) {
                if (msg) {
                    switch (hub) {
                        case Hubs.Alarm:
                            this.onAlarmMessage.next(JSON.parse(msg));
                            break;
                        case Hubs.Platform:
							this.onPlatformMessage.next(JSON.parse(msg));
                            break;
                        case Hubs.Patrol:
							this.onPatrolMessage.next(JSON.parse(msg));
                            break;
                        default:
                            break;
                    }

                    msg = null;
                    nullCount += 1;
                } else {
                    nullCount += 1;
                }
            }
		}

        this.serviceDataLoaded.set(hub, true);
		console.info(Hubs[hub] + ' Queue is Empty %c:)', 'color:green');
    }

    public stopPlatforms(): void {
        this.hubDefinitions[Hubs.Platform].AutoReconnect = false;
        this.hubConnections[Hubs.Platform].stop();
    }

    public stopAlarms(): void {
        this.hubDefinitions[Hubs.Alarm].AutoReconnect = false;
        this.hubConnections[Hubs.Alarm].stop();
    }

    public stopPatrols(): void {
        this.hubDefinitions[Hubs.Patrol].AutoReconnect = false;
        this.hubConnections[Hubs.Patrol].stop();
    }
}
