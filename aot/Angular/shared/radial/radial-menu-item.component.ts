/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import { Component, Input, Output, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef, EventEmitter } from '@angular/core';
import { RadialMenuButtonImage } from './radial-menu-button-image.class';

@Component({
    selector: 'radial-menu-item',
    templateUrl: 'radial-menu-item.component.html',
    styleUrls: ['radial-menu.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadialMenuItem {
    @Input() id: string;
    @Input() name: string;
    @Input() image: RadialMenuButtonImage;
    @Input() hoverImage: string;
    @Input() action: (id: string) => void;
    @Input() active: boolean;
    @Input() visible: boolean;
    @Input() selected: boolean;
    @Input() error: boolean;
    @Input() loading: boolean = false;

    @Output() onAction: EventEmitter<any> = new EventEmitter();

    imgSrc: string;

    constructor(public elementRef: ElementRef) { }

    onclick(): void {
        this.onAction.emit();

        if (this.action && this.active) {
            this.action(this.id);
        }
    }

    getImageSrc(): string {
        if (this.loading) {
            return '/Content/Images/Platforms/radial-loading-icon.png';
        } else {
            return this.image.ImageSrc;
        }
    }
}