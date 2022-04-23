import {
    Component, ElementRef, OnInit,
    OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef,
    ViewChild
} from '@angular/core';
import { PatrolTemplate } from '../../patrols/patrol.class';
import { PatrolService } from '../../patrols/patrol.service';
import { PlatformService } from '../../platforms/platform.service';
import { NavigationService } from '../../shared/navigation.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { ConfirmationDialog } from '../../shared/confirmation-dialog.component';

@Component({
    selector: 'patrol-context-menu',
    templateUrl: 'patrol-context-menu.component.html',
    styleUrls: ['patrol-context-menu.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatrolContextMenu implements OnInit, OnDestroy {
    @ViewChild(ConfirmationDialog) confirmDelete: ConfirmationDialog;

    public visible: boolean = false;
    public patrolTemplate: PatrolTemplate;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(public patrolService: PatrolService,
        private platformService: PlatformService,
        private elementRef: ElementRef,
        private ref: ChangeDetectorRef,
        private navigationService: NavigationService) {

    }

    public show(obj: any): void {
        this.patrolTemplate = obj.patrolTemplate;

        let x = obj.event.clientX;
        let y = obj.event.clientY;

        this.elementRef.nativeElement.style.left = x + 'px';
        this.elementRef.nativeElement.style.top = y + 'px';
        this.elementRef.nativeElement.style.position = 'absolute';

        this.visible = true;
    }

    public hide: (event?: any) => void = () => {
        if (event) {
            event.preventDefault();
        }
        this.visible = false;
    };

    public ngOnInit(): void {
        this.patrolService.onPatrolActionMenuOpen
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (obj) => {
                    this.show(obj);
                    this.ref.markForCheck();
                }
            });
    }

    public onEditClick(): void {
        if (!this.patrolService.isOnPatrol(this.patrolTemplate)) {
            setTimeout(() => {
                this.patrolService.startEditPatrol(this.patrolTemplate.id);
                this.platformService.showRobotMonitor(null);
            }, 100);
        }
    }

    public onDeleteClick(): void {
        if (!this.patrolService.isOnPatrol(this.patrolTemplate)) {
            setTimeout(() => this.confirmDelete.show(), 100);
        }
    }

    ngAfterViewInit(): void {
        $('body').append(this.elementRef.nativeElement);
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}