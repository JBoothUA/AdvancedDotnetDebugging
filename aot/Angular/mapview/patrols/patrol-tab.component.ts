import {
    Component, Output, EventEmitter,
    OnInit, ChangeDetectionStrategy, Input,
    NgModule, OnChanges, OnDestroy,
    ChangeDetectorRef, ViewChild, ElementRef

} from '@angular/core';
import { PatrolSortService } from '../../patrols/patrol-sort.service';
import { PatrolTemplate, PatrolInstance } from '../../patrols/patrol.class';
import { PatrolService } from '../../patrols/patrol.service';
import { LocationFilterService } from '../../shared/location-filter.service';
import { MapViewOptions } from '../../shared/map-view-options.class';
import { UserService } from '../../shared/user.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

export interface GroupOptions {
    name: string;
    value: string;
}

@Component({
    selector: 'patrol-tab',
    templateUrl: 'patrol-tab.component.html',
    styleUrls: ['patrol-tab.component.css'],
    providers: [PatrolSortService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatrolTab implements OnInit {
    @Output() onShowPatrolBuilder: EventEmitter<string> = new EventEmitter<string>();
    @Input() patrolTemplates: PatrolTemplate[];
    @Input() patrolInstances: PatrolInstance[];
    @Input() patrolInstancesCount: number;
	@Input() patrolTemplateCount: number;
	@Input() mapViewOptions: MapViewOptions;
    @ViewChild('patrolsContainer') patrolsContainer: ElementRef;
    
    public groupList: string[];
    private groupOptions: GroupOptions[];
	
    public sortOrder: string = 'asc';
    public searchFocus: boolean = false;
    public filterBy: string;
    public showSettingsTrays: boolean = false;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private selectedPatrolTemplateId: string;
   
    constructor(private patrolService: PatrolService,
        private PatrolSortService: PatrolSortService,
        private ref: ChangeDetectorRef,
        private locationFilterService: LocationFilterService,
        private userService: UserService
    ) { }

    public groupChanged(): void {
        this.buildGroupList();
        this.showSettingsTrays = false;
    }

    public buildGroupList(): void {
        this.groupList = this.PatrolSortService.getGroupList(this.patrolTemplates, this.patrolService.groupSelection, this.sortOrder);
    }

    public toggleGroupOrder(): void {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        this.buildGroupList();
    }

	public showPatrolBuilder(): void {
        this.onShowPatrolBuilder.emit();
    }

    public getPatrolCount(): number {
        return this.patrolService.getLocationBasedPatrolTemplates().length;
    }

    public getFilteredTemplates() {
        this.filterBy = (this.filterBy && this.filterBy.trim()) ? this.filterBy.toLowerCase().trim() : null;
        if (this.filterBy) {
            return this.patrolTemplates.filter((template: PatrolTemplate) =>
                template.DisplayName.toLowerCase().lastIndexOf(this.filterBy) !== -1)
        } else {
            return this.patrolTemplates;
        }
    }

    public trackByOptionsFn(index: number, groupOption: GroupOptions) {
        return groupOption.value;
    }

    public trackByGroupFn(index: number, group: string) {
        return group;
    }

    public ngOnInit(): void {
        this.groupOptions = [
            { value: 'Location', name: 'By Location' },
            { value: 'PatrolArea', name: 'By Patrol Area ' },
            { value: 'PatrolName', name: 'By Patrol Name' },
            { value: 'Status', name: 'By Status' }
        ];

        this.buildGroupList();

        this.patrolService.onScollToPatrol
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolID) => {
                    this.scrollToPatrol(this.patrolService.getPatrolTemplate(patrolID));
                    this.patrolService.toggleSelectedPatrol(patrolID, true);
                }
            });

        this.locationFilterService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => {
                    this.buildGroupList();
                    this.ref.markForCheck();
                }
            });

        this.patrolService.onEditPatrol
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolId) => this.onShowPatrolBuilder.emit(patrolId)
            });

        this.patrolService.onUpsertTemplate
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolTemplate) => {
                    this.buildGroupList();
                    this.ref.markForCheck();
                    if (patrolTemplate.UserName === this.userService.currentUser.name && patrolTemplate.isPatrolBuilderEdit) {
                        setTimeout(() => {
                            this.scrollToPatrol(patrolTemplate);
                            this.patrolService.toggleSelectedPatrol(patrolTemplate.TemplateId, true);

                            this.ref.markForCheck();
                            patrolTemplate.isPatrolBuilderEdit = false;
                        });
                    }
                }
            });

        this.patrolService.onPatrolInstanceComplete
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolInstance) => {
                    this.buildGroupList();
                    this.ref.markForCheck();
                }
            });

        this.patrolService.onUpsertInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolInstance) => {
                    this.buildGroupList();
                    this.ref.markForCheck();
                }
            });

        this.patrolService.onPatrolSelectionChange
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrolTempalteId) => {
                    this.handleSelection(patrolTempalteId);
                }
            });
    }

    public handleSelection(patrolTempalteId: string) {
        this.selectedPatrolTemplateId = patrolTempalteId;
    }

    private scrollToPatrol(patrol: PatrolTemplate): void {

        setTimeout(() => {
            // Get the dom element of the alarm being added/removed
            let item = document.getElementById('card_' + patrol.TemplateId);

            if (item) {
                // If the patrol card is in or above the viewable section of the patrol tab, change the current scroll top to prevent the scroll offset from changing
                if (item.offsetTop < this.patrolsContainer.nativeElement.scrollTop + this.patrolsContainer.nativeElement.clientHeight) {
                    $(this.patrolsContainer.nativeElement).scrollTop($(this.patrolsContainer.nativeElement).scrollTop() + ($(item).offset().top - 154));
                }
            }
        }, 1000);

        
    }
}

