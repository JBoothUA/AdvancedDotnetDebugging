import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';

@Injectable()
export class NavigationService {
    MainMenuState: string = 'in';
    CurrentRoute: string = 'Map View';
    RouteChanging: boolean = false;
    onMainMenuToggled: Subject<any> = new Subject();

    openAboutDialogSub: Subject<any> = new Subject();

    constructor(private Router: Router) {}

    toggleMainMenu(): void {
        this.MainMenuState = this.MainMenuState === 'out' ? 'in' : 'out';
    }

    openMainMenu(): void {
        this.MainMenuState = 'out';
    }

    closeMainMenu(): void {
        this.MainMenuState = 'in';
    }

    setCurrentRoute(routeTitle: string): void {
        this.CurrentRoute = routeTitle;
    }

    navigate(routerLink: string, data?: any): void {
        this.Router.navigate((data ? [routerLink, data] : [routerLink]));
    }

    openAboutDialog(): void {
        this.openAboutDialogSub.next();
    }
}