import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/delay';

import { NavigationService } from './navigation.service';

@Injectable()
export class StateResolveService implements Resolve<any> {
    constructor(private NavigationService: NavigationService) { }

    public resolve(route: ActivatedRouteSnapshot) {
        // Store the route title in the navigation service
        this.NavigationService.setCurrentRoute(route.data['title']);

        // Delay return so that a loading image can be displayed on navigation start
        return Observable.create((observer: any) => {
            observer.next(true);
            observer.complete();
        })
        .delay(0);
    }
}
