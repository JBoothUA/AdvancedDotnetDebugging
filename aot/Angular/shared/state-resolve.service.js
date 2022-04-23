var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/delay';
import { NavigationService } from './navigation.service';
var StateResolveService = /** @class */ (function () {
    function StateResolveService(NavigationService) {
        this.NavigationService = NavigationService;
    }
    StateResolveService.prototype.resolve = function (route) {
        // Store the route title in the navigation service
        this.NavigationService.setCurrentRoute(route.data['title']);
        // Delay return so that a loading image can be displayed on navigation start
        return Observable.create(function (observer) {
            observer.next(true);
            observer.complete();
        })
            .delay(0);
    };
    StateResolveService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [NavigationService])
    ], StateResolveService);
    return StateResolveService;
}());
export { StateResolveService };
//# sourceMappingURL=state-resolve.service.js.map