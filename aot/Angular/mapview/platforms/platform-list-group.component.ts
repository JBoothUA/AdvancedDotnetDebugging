import {
    Component,
    ChangeDetectionStrategy,
    Input,
    trigger,
    state,
    style,
    animate,
    transition,
    OnInit
} from '@angular/core';

import { Platform } from '../../platforms/platform.class';
import { PlatformService } from '../../platforms/platform.service';
import { PlatformSort } from '../../platforms/platform-sort.class';
import { slideDown } from '../../shared/animations';
import { MapViewOptions } from '../../shared/map-view-options.class';

@Component({
    selector: 'platform-list-group',
    templateUrl: 'platform-list-group.component.html',
    animations: [
        slideDown
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformListGroup implements OnInit {
    @Input() platforms: Platform[];
    @Input() multiSelect: any;
    @Input() groupName: string;
    @Input() groupSelection: string;
	@Input() sortOrder: string;
	@Input() mapViewOptions: MapViewOptions;

    public expandedState: string;

    constructor(private platformService: PlatformService, private platformSort: PlatformSort) {}

    ngOnInit(): void {
        this.expandedState = this.expandedState || 'out';
    }

    toggleExpandedGroup(): void {
        this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
    }

    getPlatforms(): Platform[] {
        let platformList: Platform[] = [];

        for (var platform in this.platforms) {
            // If platform is part of this group, include it
            if (this.platformSort.getGroupName(this.platforms[platform], this.groupSelection) === this.groupName) {
                platformList.push(this.platforms[platform]);
            }
        }

        return this.platformSort.sortPlatforms(platformList, this.sortOrder);
    }
}