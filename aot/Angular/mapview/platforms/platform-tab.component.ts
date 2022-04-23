import { Component, Input, ViewChild, ChangeDetectionStrategy, ElementRef, NgZone, ChangeDetectorRef, SimpleChange } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { PlatformService } from '../../platforms/platform.service';
import { PlatformSort } from '../../platforms/platform-sort.class';
import { Platform } from '../../platforms/platform.class';
import { CommandDefinition } from '../../patrols/action.class';
import { MapViewOptions } from '../../shared/map-view-options.class';
import { LocationFilterService } from '../../shared/location-filter.service';

export interface GroupOption {
    name: string;
    value: string;
}

@Component({
    selector: 'platform-tab',
    templateUrl: 'platform-tab.component.html',
    providers: [PlatformSort],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformTab {
	@ViewChild('platformsContainer') platformsContainer: ElementRef;
	@Input() platforms: Platform[];
	@Input() mapViewOptions: MapViewOptions;
	@Input() isActionMenuOpen: boolean = false;
	multiSelect: boolean;
	groupList: string[];
	groupOptions: GroupOption[];
	showSettingsTrays: boolean = false;
	currentScroll: number = 0;
	newPlatform: Platform;
    refreshInterval: NodeJS.Timer;

	private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(public platformService: PlatformService,
        private platformSort: PlatformSort,
        private ngZone: NgZone,
		private changeDetectorRef: ChangeDetectorRef,
		private locationFilterService: LocationFilterService) {
		this.multiSelect = false;

		this.platformService.openPlatformActionMenuSub
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
                next: (obj) => {
                    if (obj.disableScroll) {
                        this.isActionMenuOpen = true;
                    }
                }
			});
		this.platformService.platformCommandDialogClosed
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: () => setTimeout(() => {
					this.isActionMenuOpen = false;
					this.changeDetectorRef.detectChanges();
				})
			});
	}

	handleNewPlatform(platform: Platform): void {
		// A new platform will not yet be in the dom, so we cannot get its position until ngAfterViewChecked
		// So store the platform for now
		this.newPlatform = platform;
	}

	handleSelectedPlatform(platform: string): void {
		// A platform was selected, so ensure it is in the viewport
		// Get the dom element of the platform being added/removed
		let item = document.getElementById('platform-item-' + platform);

		if (item) {
			// If the alarm item is outside of the current viewport 
			if (item.offsetTop < this.platformsContainer.nativeElement.scrollTop ||
				item.offsetTop > this.platformsContainer.nativeElement.scrollTop + this.platformsContainer.nativeElement.clientHeight) {
				// Move the scroll height to the selected platforms position, minus half the tab height in order to place the platform in the middle of the tab
				this.platformsContainer.nativeElement.scrollTop = item.offsetTop - this.platformsContainer.nativeElement.clientHeight / 2;
			}

			this.onContainerScroll(null);
		}
	}

    getPlatformCount(): number {
        return this.platforms.length;
    }

    //To-Do
    getHighestStatePlatform(): void {
        //return this.platformService.getPlatforms().sort(function (a, b) {
        //    return a.State - b.State;
        //})[0];
    }

    groupChanged(): void {
		this.buildGroupList();
		this.showSettingsTrays = false;
		this.currentScroll = 0;
    }

    buildGroupList(): void {
		this.groupList = this.platformSort.getGroupList(this.platforms, this.platformService.groupSelection, this.platformService.sortOrder);
    }

    toggleGroupOrder(): void {
		this.platformService.sortOrder = this.platformService.sortOrder === 'asc' ? 'desc' : 'asc';
        this.buildGroupList();
	}

	selectAllPlatforms(): void {
		this.multiSelect = true;
		for (let platform in this.platforms) {
			this.platformService.selectPlatform(this.platforms[platform].id, true, false);
		}
		this.showSettingsTrays = false;
	}

    toggleSelectionCheckboxes(): void {
		this.multiSelect = !this.multiSelect;
		this.showSettingsTrays = false;

		this.toggleLeftPanelWidth();
	}

	// TODO: quick fix workaround, Angularize all $('#lpContent')
	// this works for now, as the Left Panel design changes every day.
	toggleLeftPanelWidth(): void {
		if (this.multiSelect) {
			$('#lpContent').attr('style', 'width: 445px');
		} else {
			$('#lpContent').attr('style', 'width: 407px');
		}
	}

    //To-Do
    toggleExpandedGroup(groupName:string): void {
        //for (var group in this.displayPlatforms) {
        //    if (this.displayPlatforms[group].groupName === groupName) {
        //        this.displayPlatforms[group].expandedState = this.displayPlatforms[group].expandedState === 'out' ? 'in' : 'out';
        //    }
        //}
    }

	onContainerScroll(event: any) {
		this.currentScroll = this.platformsContainer.nativeElement.scrollTop;
	}

	refreshPlatformListItems(): void {
		this.platformService.refreshTimerSub.next();
	}

    ngOnInit(): void {
        this.groupOptions = [
            { value: 'Location', name: 'By Location' },
            { value: 'Manufacturer', name: 'By Manufacturer' },
            { value: 'RobotName', name: 'By Robot Name' },
            { value: 'State', name: 'By Status' }
        ];

		this.buildGroupList();

		// Bind scroll event outside of angular so that change detection is not fired on every scroll event
		// We only need to persist the current scroll value, so change detection is not required
		this.ngZone.runOutsideAngular(() => {
			this.platformsContainer.nativeElement.addEventListener('scroll', (e: any) => {
				this.onContainerScroll(e);
			});
		});
	}

    ngAfterViewInit(): void {
		this.platformsContainer.nativeElement.scrollTop = 0;
		this.refreshInterval = setInterval(() => { this.refreshPlatformListItems(); }, 60000);
	}

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        // On change to platform list, rebuild groups
        if (changes.platforms) {
            this.buildGroupList();
		}

		if (changes.platform && changes.platform.currentValue.State !== changes.platform.previousValue.State) {
			this.platformService.closePlatformActionMenuSub.next();
		}
	}

	ngOnDestroy(): void {
		clearInterval(this.refreshInterval);

		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}