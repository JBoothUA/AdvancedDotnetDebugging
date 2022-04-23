import { Component, Input, ViewChild, ChangeDetectionStrategy, ElementRef, NgZone, ChangeDetectorRef, SimpleChange } from '@angular/core';
import { AlarmService } from '../../alarms/alarm.service';
import { AlarmSort } from '../../alarms/alarm-sort.class';
import { Alarm } from '../../alarms/alarm.class';
import { LocationFilterService } from '../../shared/location-filter.service';
import { MapViewOptions } from '../../shared/map-view-options.class';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

interface GroupOption {
    name: string;
    value: string;
}

@Component({
    selector: 'alarm-tab',
	templateUrl: 'alarm-tab.component.html',
    providers: [AlarmSort],
    /* OnPush change detection strategy causes change detection to only occur when an input variable is changed to a new value (or manually triggered). 
       Objects in javascript are mutable, so when a object property is changed it will not trigger change detection. If passing an object as input, 
       you must make it immutable (pass a new instance of the variable in) or pass each attribute invididually so that the inputs are primitive (immutable) types */
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AlarmTab {
    @ViewChild('alarmsContainer') alarmsContainer: ElementRef;
	@Input() alarms: Alarm[];
	@Input() mapViewOptions: MapViewOptions;
    multiSelect: boolean;
    groupList: string[];
	groupOptions: GroupOption[];
	showSettingsTrays: boolean = false;
    currentScroll: number = 0;
    newAlarm: Alarm;
    refreshInterval: NodeJS.Timer;
	resetScroll: boolean = false;
	toggleDisplay: string = 'Select All';
	currentlyToggling: boolean = false;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(public alarmService: AlarmService, private alarmSort: AlarmSort, private ngZone: NgZone, private changeDetectorRef: ChangeDetectorRef,
                private locationFilterService: LocationFilterService) {
        this.multiSelect = false;

        this.alarmService.newAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.handleNewAlarm(alarm)
            });
        this.alarmService.editedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.buildGroupList()
            });
        this.alarmService.removedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.handleRemoveAlarm(alarm)
            });
        this.alarmService.alarmSelected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.handleSelectedAlarm(alarm)
            });
        this.alarmService.alarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (status) => {
                    if (status) {
                        this.resetScroll = true;
                    }
                }
            });

        this.locationFilterService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (view) => this.resetScroll = true
            });
    }

    handleNewAlarm(alarm: Alarm): void {
        // A new alarm will not yet be in the dom, so we cannot get its position until ngAfterViewChecked
        // So store the alarm for now
        this.newAlarm = alarm;
    }

    handleRemoveAlarm(alarm: Alarm): void {
        // When an alarm is removed, we need to find its position before it is actually removed from the dom
        // So handle updating the scrollbar now
        this.updateScroll(alarm, false);
    }

    handleSelectedAlarm(alarm: string): void {
        // An alarm was selected, so ensure it is in the viewport
        let item = document.getElementById('alarm-item-' + alarm);

        if (item) {
            // If the alarm item is outside of the current viewport 
            if (item.offsetTop < this.alarmsContainer.nativeElement.scrollTop ||
                item.offsetTop > this.alarmsContainer.nativeElement.scrollTop + this.alarmsContainer.nativeElement.clientHeight) {
                // Move the scroll height to the selected alarms position, minus half the tab height in order to place the alarm in the middle of the tab
                this.alarmsContainer.nativeElement.scrollTop = item.offsetTop - this.alarmsContainer.nativeElement.clientHeight / 2;
            }

            this.onContainerScroll(null);
        }
    }

    ngAfterViewChecked(): void {
        if (this.newAlarm) {
            this.updateScroll(this.newAlarm, true);
            this.newAlarm = undefined;
        }

        if (this.resetScroll) {
            this.alarmsContainer.nativeElement.scrollTop = 0;
            this.resetScroll = false;
        }
	}

	trackByOptionsFn(index: number, groupOption: GroupOption) {
		return groupOption.value;
	}

	trackByGroupFn(index: number, group: string) {
		return group;
	}

    updateScroll(alarm: Alarm, newAlarm: boolean): void {
        // Get the dom element of the alarm being added/removed
        let item = document.getElementById('alarm-item-' + alarm.Id);

        if (item) {
            // If the alarm item is in or above the viewable section of the alarm tab, change the current scroll top to prevent the scroll offset from changing
            if (item.offsetTop < this.alarmsContainer.nativeElement.scrollTop + this.alarmsContainer.nativeElement.clientHeight) {
                if (newAlarm) {
                    this.currentScroll += $(item).find('.lpItem').height() + 2; // +2 to account for border
                } else {
                    this.currentScroll -= item.children[0].clientHeight;
                }
            }
        }

        this.maintainScroll();
    }

	maintainScroll(): void {
        this.alarmsContainer.nativeElement.scrollTop = this.currentScroll;
    }

    getAlarmCount(): number {
        return this.alarms.length;
    }

    groupChanged(): void {
		this.buildGroupList();
		this.showSettingsTrays = false;
		this.currentScroll = 0;
	}

    buildGroupList(): void {
        if (this.alarms && this.alarms.length > 0) {
            this.groupList = this.alarmSort.getGroupList(this.alarms, this.alarmService.groupSelection, this.alarmService.sortOrder);
        }
    }

    toggleGroupOrder(): void {
        this.alarmService.sortOrder = this.alarmService.sortOrder === 'asc' ? 'desc' : 'asc';
        this.buildGroupList();
	}

	toggleAllAlarms(): void {
		this.toggleSelectionCheckboxes();

		this.currentlyToggling = true;

		let toggleOn = (this.toggleDisplay === 'Select All');
		this.toggleDisplay = (this.toggleDisplay === 'Select All') ? 'Unselect All' : 'Select All';

		for (let alarm of this.alarms) {
			if (toggleOn) {
				this.alarmService.selectAlarm(alarm.Id, true, false);
			} else {
				this.alarmService.deSelectAlarm(alarm.Id, true);
			}
		}

		this.currentlyToggling = false;
	}

    toggleSelectionCheckboxes(): void {
		this.multiSelect = !this.multiSelect;
		this.showSettingsTrays = false;

		this.toggleLeftPanelWidth();
	}

	// TODO: quick fix workaround, Angularize all $('#lpContent')
	// this works for now, as the Left Panel design changes every day
	toggleLeftPanelWidth(): void {
		if (this.multiSelect) {
			$('#lpContent').attr('style', 'width: 445px');
		} else {
			$('#lpContent').attr('style', 'width: 407px');
		}
	}

    ngOnInit(): void {
        this.groupOptions = [
            { value: 'Location', name: 'By Location' },
            { value: 'UserId', name: 'By Operator' },
            { value: 'Priority', name: 'By Priority' },
            { value: 'Created', name: 'By Reported Time' },
            { value: 'RobotName', name: 'By Robot Name' },
            { value: 'Type', name: 'By Type' },
            { value: 'State', name: 'By Status' } 
        ];

        this.buildGroupList();

        // Bind scroll event outside of angular so that change detection is not fired on every scroll event
        // We only need to persist the current scroll value, so change detection is not required
        this.ngZone.runOutsideAngular(() => {
            this.alarmsContainer.nativeElement.addEventListener('scroll', (e: any) => {
                this.onContainerScroll(e);
            });
        });
    }

	onContainerScroll(event: any) {
        this.currentScroll = this.alarmsContainer.nativeElement.scrollTop;
    }

    refreshAlarmListItems(): void {
        this.alarmService.refreshTimerSub.next();
    }

    ngAfterViewInit(): void {
        this.alarmsContainer.nativeElement.scrollTop = 0;

        this.refreshInterval = setInterval(() => { this.refreshAlarmListItems(); }, 60000);
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        this.maintainScroll();

        if ((changes.alarms && changes.alarms.currentValue.length > 0) && (changes.alarms.previousValue && changes.alarms.previousValue.length === 0)) {
            this.buildGroupList();
		}

		if (changes.alarms && !this.currentlyToggling) {
			// Toggle to 'Unselect All'
			let allSelected = true;
			for (let alarm of this.alarms) {
				if (!alarm.Selected) {
					allSelected = false;
					break;
				}
			}
			if (allSelected) {
				this.toggleDisplay = 'Unselect All';
			} else {
				this.toggleDisplay = 'Select All';
			}
		}
    }

    ngOnDestroy(): void {
        clearInterval(this.refreshInterval);
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}