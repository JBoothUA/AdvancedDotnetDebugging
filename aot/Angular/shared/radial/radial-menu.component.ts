/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import {
    Component, Input, ChangeDetectorRef, ChangeDetectionStrategy,
    ElementRef, ViewChild, ViewChildren, AfterViewInit, QueryList
} from '@angular/core';
import { RadialMenuItem } from './radial-menu-item.component';
import { RadialMenuButton } from './radial-menu-button.class';

@Component({
    selector: 'radial-menu',
    templateUrl: 'radial-menu.component.html',
    styleUrls: ['radial-menu.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadialMenu implements AfterViewInit {
    @Input() buttons: RadialMenuButton[] = [];

    @ViewChild('menu') menu: ElementRef;
    @ViewChildren(RadialMenuItem) buttonList: QueryList<RadialMenuItem>;

    // The higher the factor, the larger the diameter of the menu
    sizeFactor: number = 35;
    eventName: string = 'radial';
    open: boolean = false;
    closeOnClick: boolean = true;

    constructor(protected changeDetectorRef: ChangeDetectorRef, protected elementRef: ElementRef) { }

    ngAfterViewInit(): void {
        if (this.buttonList) {
            let list = this.buttonList.toArray();

            for (let i = 0, l = list.length; i < l; i++) {
                list[i].elementRef.nativeElement.style.left = (50 - this.sizeFactor * Math.cos(-0.5 * Math.PI + 2 * (1 / l) * i * Math.PI)).toFixed(4) + "%";
                list[i].elementRef.nativeElement.style.top = (50 + this.sizeFactor * Math.sin(-0.5 * Math.PI + 2 * (1 / l) * i * Math.PI)).toFixed(4) + "%";
            }
        }
    }

    toggleMenu(event: MouseEvent): void {
        event.stopPropagation();

        if (this.open) {
            this.closeMenu();
        } else {
            this.openMenu();
        }

        this.changeDetectorRef.detectChanges();
    }

    checkClick(event: any): void {
        if (this.elementRef.nativeElement !== event.target && !$.contains(this.elementRef.nativeElement, event.target)) {
            this.closeMenu();
        }
    }

    openMenu(): void {
        this.menu.nativeElement.classList.add('open');
        this.open = true;

        $(document).on('click.' + this.eventName, (e) => {
            this.checkClick(e);
        });
        $(document).on('contextmenu.' + this.eventName, (e) => {
            this.checkClick(e);
        });

        this.onOpen();
    }

    closeMenu: (event?: MouseEvent) => void = (event?: MouseEvent) => {
        if (event) {
            event.preventDefault();
        }

        this.menu.nativeElement.classList.remove('open');
        this.open = false;
        $(document).off('click.' + this.eventName);
        $(document).off('contextmenu.' + this.eventName);

        this.onClose();
    }

    onOpen(): void {
        // For override
    }

    onClose(): void {
        // For override
    }
}