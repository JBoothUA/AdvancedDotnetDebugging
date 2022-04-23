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
import { AppInsights } from 'applicationinsights-js';
var ApplicationInsightsService = (function () {
    function ApplicationInsightsService() {
        this.config = { instrumentationKey: 'dd498fb4-0c3c-40a0-a631-0fbb3d45b9a9' }; //TODO configure
        this.telemetrySource = 'SmartCommand.UI';
        if (!AppInsights.config) {
            AppInsights.downloadAndSetup(this.config);
        }
    }
    ApplicationInsightsService.prototype.startTrackEvent = function (event) {
        AppInsights.startTrackEvent(event);
    };
    ApplicationInsightsService.prototype.stopTrackEvent = function (event, properties) {
        if (!properties) {
            properties = {};
        }
        properties['source'] = this.telemetrySource;
        AppInsights.stopTrackEvent(event, properties);
    };
    ApplicationInsightsService.prototype.trackError = function (error, stackTrace, properties) {
        if (!properties) {
            properties = {};
        }
        properties['source'] = this.telemetrySource;
        AppInsights.trackException(error, stackTrace, properties);
    };
    ApplicationInsightsService.prototype.trackPageView = function (url, properties) {
        if (!properties) {
            properties = {};
        }
        properties['source'] = this.telemetrySource;
        AppInsights.trackPageView(url, url, properties);
    };
    ApplicationInsightsService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [])
    ], ApplicationInsightsService);
    return ApplicationInsightsService;
}());
export { ApplicationInsightsService };
//# sourceMappingURL=application-insights.service.js.map