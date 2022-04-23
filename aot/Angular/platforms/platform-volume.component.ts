import {
    Component, Input, ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

import { Platform } from './platform.class';
import {
    PlatformCommand, CommandName, Parameter, ParameterName,
    ParameterType, CommandDefinition
} from './../patrols/action.class';
import { PlatformService } from './platform.service';

@Component({
    selector: 'platform-volume',
    templateUrl: 'platform-volume.component.html',
    styleUrls: ['platform-volume.component.css', 'robot-monitor-controller-cmd.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformVolume {
    @Input() platform: Platform;
    @Input() changeFlag: boolean = false;

    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public volumeCmd: CommandDefinition;
    private muteCmd: CommandDefinition;
    private unMuteCmd: CommandDefinition;
    private volumeState: number[] = [0,0];
    private isMuted: boolean;
    private isDisabled: boolean = false;

    private tempVolumeValue: number = 0;
    public isLoadingVolumeLevel: boolean = false;
    private volumeChangeTimer: NodeJS.Timer;
    public volumeLevelError: boolean = false;
    private errorTimer: NodeJS.Timer = null;
    private volumeChanging: boolean = false;
    private tempMuteValue: boolean = null;
    private muteError: boolean = false;

    private isMuteLoading: boolean = false;

    constructor(private platformService: PlatformService,
                private ref: ChangeDetectorRef) { }

    private ngOnInit(): void {
        this.volumeCmd = this.platform.Commands.find((item: CommandDefinition) => {
            return item.CommandName === CommandName.Volume;
        });

        this.muteCmd = this.platform.Commands.find((item: CommandDefinition) => {
            return item.CommandName === CommandName.VolumeMute;
        });

        this.unMuteCmd = this.platform.Commands.find((item: CommandDefinition) => {
            return item.CommandName === CommandName.VolumeUnmute;
        });

        this.volumeState[1] = this.platform.State.Values.find((item: any) => {
            return item.Name === 'volumeLevel';
        }).IntValue;

        this.tempVolumeValue = this.volumeState[1];

        this.isMuted = !this.platform.State.Values.find((item: any) => {
            return item.Name === 'volume';
        }).BooleanValue;

        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform: Platform) => {
                    if (platform.id === this.platform.id) {

                        let volumeLevel: number = this.platform.State.Values.find((item: any) => {
                            return item.Name === 'volumeLevel';
                        }).IntValue;

                        if (this.isLoadingVolumeLevel) {
                            if (volumeLevel === this.tempVolumeValue) {
                                this.volumeState = [0, (volumeLevel === -1) ? 0 : volumeLevel];

                                this.isDisabled = false;
                                this.isLoadingVolumeLevel = false;
                                clearTimeout(this.volumeChangeTimer);
                                this.volumeChangeTimer = null;
                            }
                        } else if (!this.volumeChanging) {
                            this.volumeState = [0, (volumeLevel === -1) ? 0 : volumeLevel];
                        }

                        let isMuted = !this.platform.State.Values.find((item: any) => {
                            return item.Name === 'volume';
                        }).BooleanValue;

                        if (this.isMuteLoading) {
                            if (isMuted === this.tempMuteValue) {
                                clearTimeout(this.volumeChangeTimer);
                                this.volumeChangeTimer = null;
                                this.tempMuteValue = null;

                                this.isMuteLoading = false;
                                this.isDisabled = false;
                                this.ref.detectChanges();
                            }
                        } else {
                            this.isMuted = isMuted;
                        }

                        this.changeFlag = !this.changeFlag;
                        this.ref.markForCheck();
                    }
                }
            });
    }

    private ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public getIcon(): string  {
        let sufix: string = '-not-selected';
        if (!this.isMuted) {
            sufix = '-selected';
        }
        return '/Content/images/Platforms/CommandIcons/volume-settings' + sufix + '.png';
    }

    private handleVolumeChange(event: any): void {
        this.volumeState[1] = event.values[1];
        let param: Parameter = new Parameter({
            Name: ParameterName.Percent,
            Value: event.values[1].toString(),
            Type: ParameterType.Int
        });

        this.volumeChanging = false;

        this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.Volume, [param]));

        this.isDisabled = true;
        this.tempVolumeValue = this.volumeState[1];
        this.isLoadingVolumeLevel = true;

        this.volumeLevelError = false;
        this.muteError = false;
        clearTimeout(this.errorTimer);
        this.errorTimer = null;

        this.volumeChangeTimer = setTimeout(() => {
            //Show error
            this.volumeLevelError = true;

            //Set to current value
            let volumeLevel: number = this.platform.State.Values.find((item: any) => {
                return item.Name === 'volumeLevel';
            }).IntValue;

            this.volumeState = [0, (volumeLevel === -1) ? 0 : volumeLevel];
            this.isLoadingVolumeLevel = false;

            clearTimeout(this.volumeChangeTimer);
            this.volumeChangeTimer = null;
            this.isLoadingVolumeLevel = this.isDisabled = false;
            this.volumeLevelError = true;

            this.errorTimer = setTimeout(() => {
                this.volumeLevelError = false;
                this.errorTimer = null;
                this.ref.markForCheck();
            }, 7000);

            this.ref.markForCheck();

        }, 10000);

        this.ref.detectChanges();
    }

    private handleMuteChange(event: MouseEvent): void {
        if (this.isMuteLoading) {
            return;
        }

        this.isMuteLoading = true;
        this.isDisabled = true;
        this.muteError = false;
        this.volumeLevelError = false;

        if (this.isMuted) {
            //UnMute
            this.tempMuteValue = false;
            this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.VolumeUnmute));
        } else {
            //Mute
            this.tempMuteValue = true;
            this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.VolumeMute));
        }

        if (this.volumeChangeTimer) {
            clearTimeout(this.volumeChangeTimer);
            this.volumeChangeTimer = null;
        }

        this.volumeLevelError = false;
        clearTimeout(this.errorTimer);
        this.errorTimer = null;

        this.volumeChangeTimer = setTimeout(() => {

            this.isMuted = !this.platform.State.Values.find((item: any) => {
                return item.Name === 'volume';
            }).BooleanValue;

            this.isMuteLoading = false;
            this.isDisabled = false;

            this.muteError = true;

            this.errorTimer = setTimeout(() => {
                this.muteError = false;
                this.ref.markForCheck();
                this.errorTimer = null;
            }, 7000);

            this.ref.markForCheck();
        }, 10000);

        this.ref.detectChanges();
    }
}