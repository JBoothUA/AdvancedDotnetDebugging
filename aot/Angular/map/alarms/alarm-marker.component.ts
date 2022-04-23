import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Alarm } from '../../alarms/alarm.class';
import { AlarmService } from '../../alarms/alarm.service';
import { PlatformService } from '../../platforms/platform.service';
import { PlatformMapService } from '../../map/platforms/platformMap.service';
import { AlarmMapService } from './alarmMap.service';
import { AlarmRadialMenu } from './alarm-radial-menu.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'alarm-marker',
    templateUrl: 'alarm-marker.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlarmMarker {
    @Input() alarm: Alarm;
    @Input() groupName: string;
    @Input() description: string;
    @Input() priority: number;
    @Input() selected: boolean;
    @Input() state: number;
    @Input() overlapSelected: boolean;
    @Input() alarmService: AlarmService;

    @ViewChild(AlarmRadialMenu) radial: AlarmRadialMenu;

	Hover: boolean;
    prevent: boolean;
    delay: number;
    timer: NodeJS.Timer;
    actionMenuOpen: boolean = false;
    actionMenuTimeout: any;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

	constructor(private mapService: AlarmMapService, private changeDetectorRef: ChangeDetectorRef, private platformService: PlatformService, private platformMapService: PlatformMapService) {
        // Click -> Dbl Click facilitation
        this.prevent = false;
        this.delay = 200;
        this.timer = null;
	}

	mouseEnter() {
		this.Hover = true;
		this.mapService.mouseOverAlarmMarkerInformation = this.alarm;
	}

	mouseLeave() {
		this.Hover = false;
		this.mapService.mouseOverAlarmMarkerInformation = null;
	}

    openRadial(event: MouseEvent): void {
        event.preventDefault();
        this.radial.toggleMenu(event);
    }

    select(event: MouseEvent): void {
        // Delay click action to allow dblclick to occur
        this.timer = setTimeout(() => {
			if (!this.prevent) {
				if (this.platformMapService.interactivePlatform) {
					this.platformMapService.sendGoToLocationCommand(null, this.alarm);
				} else {
					this.alarmService.handleClickAlarm(this.alarm, event, true);
				}
            }
            this.prevent = false;
        }, this.delay);
    }

    zoomTo(): void {
        clearTimeout(this.timer);
        this.prevent = true;

        this.mapService.zoomToAlarmMarker(this.groupName);
    }

    multipleOccurances(): boolean {
        // TODO: Return based upon the number of occurances here
        return false;
    }

	hasAttachments(): boolean {
		if (this.alarm.Comments && this.alarm.Comments.length) {
			return true;
		}

		return false;
	}

    getDescription(): string {
        return this.alarm.getDescription();
    }

    acknowledgeAlarms(): void {
        this.alarmService.acknowledgeAlarms(this.alarm);
        this.closeActionMenu();
    }

    clearAlarms(): void {
        this.alarmService.clearAlarmsWithConfirmation(this.alarm);
        this.closeActionMenu();
    }

    dismissAlarms(): void {
        this.alarmService.dismissAlarmsWithConfirmation(this.alarm);
        this.closeActionMenu();
    }

    toggleActionMenu(state: boolean): void {
        if (state !== undefined) {
            if (state) {
                this.openActionMenu();
            } else {
                this.closeActionMenu();
            }
        } else {
            if (this.actionMenuOpen) {
                this.closeActionMenu();
            } else {
                this.openActionMenu();
            }
        }
    }

    getPlatformDisplayName(): string {
        if (this.alarm.PlatformId) {
            let platform = this.platformService.getPlatform(this.alarm.PlatformId);
            if (platform && platform.DisplayName) {
                return platform.DisplayName;
            } else {
                return this.alarm.PlatformId;
            }
        }

        return null;
    }

    getPlatformStatusClass(): string {
        if (this.alarm.PlatformId) {
            let platform = this.platformService.getPlatform(this.alarm.PlatformId);

            if (platform) {
                return this.platformService.getPlatformStatusClass(platform);
            }
        }
    }

    openActionMenu(): void {
        this.actionMenuOpen = true;

        if (this.actionMenuTimeout) {
            clearTimeout(this.actionMenuTimeout);
        }
        this.actionMenuTimeout = setTimeout(() => this.toggleActionMenu(false), 5000);
        this.changeDetectorRef.detectChanges();
    }

    closeActionMenu: () => void = () => {
        if (this.actionMenuTimeout) {
            clearTimeout(this.actionMenuTimeout);
        }
        this.actionMenuOpen = false;
        this.changeDetectorRef.detectChanges();
    }

    public getIcon(): string {
        if (this.alarm.Cleared) {
            return '/Content/images/dashboard/cleared-icon.png';
        } else if (this.alarm.Dismissed) {
            return '/Content/images/dashboard/dismiss-icon.png';
        } else if (this.alarm.Acknowledged) {
            return '/Content/images/Alarms/acknowledge-bubble.png';
        } else {
            return null;
        }
    }

    private ngOnDestroy(): void {
        clearTimeout(this.actionMenuTimeout);
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private ngAfterViewInit(): void {

        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                    if (this.alarm.PlatformId === platform.id) {
                        this.changeDetectorRef.detectChanges();
                    }
                }
            });
    }
}