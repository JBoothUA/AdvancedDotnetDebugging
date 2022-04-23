import { Component, ElementRef, ChangeDetectorRef } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { NavigationService } from '../shared/navigation.service';
import { Platform } from './platform.class';
import { PlatformService } from './platform.service';

@Component({
    selector: 'platform-context-menu',
    templateUrl: 'platform-context-menu.component.html',
    styleUrls: ['platform-context-menu.component.css'],
})
export class PlatformContextMenu {
    visible: boolean = false;
    platform: Platform;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    hide: (event?: any) => void = () => {
        if (event) {
            event.preventDefault();
        }
        this.visible = false;
        this.platform = undefined;
    };

    constructor(private platformService: PlatformService, private elementRef: ElementRef, private changeDetectorRef: ChangeDetectorRef) {
        this.platformService.openPlatformActionMenuSub
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (obj) => this.show(obj)
			});

		this.platformService.closePlatformActionMenuSub
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: () => this.closeMenu()
			});
    }

    ngAfterViewInit(): void {
        $('body').append(this.elementRef.nativeElement);
    }

    show(obj: any): void {
        if (this.platform) {
            if (this.platform.id === obj.platform.id) {
                this.closeMenu();
                return;
            }
            this.closeMenu();
        }

        this.platform = obj.platform;

        this.visible = true;

        if (!obj.target) {
            setTimeout(() => {
                $(this.elementRef.nativeElement).position({
                    my: 'right top',
                    at: 'right bottom',
                    of: obj.event,
                    collision: 'flipfit'
                });
            });
        } else {
            if (obj.target.nativeElement) {
                let right = '-10';
                let bottom = '-5';

                if (obj.offsetLeft) {
                    if (obj.offsetLeft >= 0) {
                        right = '+' + obj.offsetLeft;
                    } else {
                        right = '-' + obj.offsetLeft * -1;
                    }
                }

                if (obj.offsetTop) {
                    if (obj.offsetTop >= 0) {
                        bottom = '+' + obj.offsetTop;
                    } else {
                        bottom = '-' + obj.offsetTop * -1;
                    }
                }

                setTimeout(() => {
                    $(this.elementRef.nativeElement).position({
                        my: 'right top',
                        at: `right${right} bottom${bottom}`,
                        of: obj.target.nativeElement,
                        collision: 'flipfit'
                    });
                });
            }
        }

        $(document).on('click.platformContext', (e) => {
            this.checkClick(e);
        });
        $(document).on('contextmenu.platformContext', (e) => {
            this.checkClick(e);
        });
        obj.event.stopPropagation();
        this.changeDetectorRef.detectChanges();
    }

	checkClick(event: any): void {
		if (event.target.classList.contains('closeOnClick') ||
			(this.elementRef.nativeElement !== event.target && !$.contains(this.elementRef.nativeElement, event.target))) {
            event.stopPropagation();
            this.closeMenu();
        }
    }

    closeMenu: (event?: MouseEvent) => void = (event?: MouseEvent) => {
        if (event) {
            event.preventDefault();
        }

        this.platform = undefined;
        this.visible = false;

        $(document).off('click.platformContext');
        $(document).off('contextmenu.platformContext');

		this.platformService.platformCommandDialogClosed.next();

		this.changeDetectorRef.detectChanges();
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}