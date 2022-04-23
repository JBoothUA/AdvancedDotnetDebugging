var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, Injector } from '@angular/core';
import { ApplicationInsightsService } from './application-insights.service';
var ApplicationErrorHandler = /** @class */ (function () {
    function ApplicationErrorHandler(injector) {
        this.injector = injector;
    }
    ApplicationErrorHandler.prototype.handleError = function (error) {
        console.error('SmartCommand Error!', error);
        var appInsights = this.injector.get(ApplicationInsightsService);
        if (!appInsights) {
            console.error('Could not log error to Application Insights');
        }
        else {
            appInsights.trackError(error, 'SmartCommand Error!');
        }
    };
    ApplicationErrorHandler = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Injector])
    ], ApplicationErrorHandler);
    return ApplicationErrorHandler;
}());
export { ApplicationErrorHandler };
//# sourceMappingURL=application-errors.js.map