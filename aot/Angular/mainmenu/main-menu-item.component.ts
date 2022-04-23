import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NavigationService } from '../shared/navigation.service';

@Component({
    selector: 'main-menu-item',
    templateUrl: 'main-menu-item.component.html',
    styleUrls: ['main-menu-item.component.css'],
})

export class MainMenuItem {
    @Input() Id: string;
    @Input() Text: string;
    @Input() ImageSrc: string;
    @Input() RouterLink: string;
    @Input() Selected: boolean;

    constructor(public NavigationService: NavigationService) { }

    followRoute(): void {
        this.NavigationService.closeMainMenu();
		setTimeout(() => { this.NavigationService.navigate(this.RouterLink); }, 400);
    }
}