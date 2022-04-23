var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NgZone } from '@angular/core';
//import { Subject } from 'rxjs/Subject';
//import 'rxjs/add/operator/takeUntil';
//import { PatrolTemplate, PatrolInstance, PatrolStatus, PatrolStatusValues } from '../patrols/patrol.class';
//import { PointTemplate, PointInstance, PointStatus, PointStatusValues } from '../patrols/point.class';
//import { ActionInstance, ActionStatus, ActionStatusValues } from '../patrols/action.class';
//import { PatrolService } from '../patrols/patrol.service';
import { NavigationService } from '../../shared/navigation.service';
import { PatrolMapService } from '../patrols/patrolMap.service';
import { PatrolBuilderService } from '../../patrolBuilder/patrol-builder.service';
import { DashboardPatrolService } from '../../dashboard/dashboard-patrol.service';
export var PatrolMapInteractMode;
(function (PatrolMapInteractMode) {
    PatrolMapInteractMode[PatrolMapInteractMode["None"] = 0] = "None";
    PatrolMapInteractMode[PatrolMapInteractMode["Append"] = 1] = "Append";
    PatrolMapInteractMode[PatrolMapInteractMode["Prepend"] = 2] = "Prepend";
    PatrolMapInteractMode[PatrolMapInteractMode["Edit"] = 3] = "Edit";
})(PatrolMapInteractMode || (PatrolMapInteractMode = {}));
var DashboardPatrolMapService = /** @class */ (function (_super) {
    __extends(DashboardPatrolMapService, _super);
    function DashboardPatrolMapService(patrolService, patrolBuilderService, ngzone, navigationService) {
        var _this = _super.call(this, patrolService, patrolBuilderService, ngzone, navigationService) || this;
        _this.patrolService = patrolService;
        _this.patrolBuilderService = patrolBuilderService;
        _this.ngzone = ngzone;
        _this.navigationService = navigationService;
        return _this;
    }
    DashboardPatrolMapService.prototype.patrolSelected = function (patrolTemplateId) {
        var _this = this;
        if (!this.patrolService.selectedPatrol) {
            this.clearPatrol();
        }
        else {
            var patrol = this.patrolService.selectedPatrol;
            if (patrol) {
                if (patrol.IsTemplate) {
                    //this is a template - get the template
                    var patrolTemplate = this.patrolService.getPatrolTemplate(patrolTemplateId);
                    patrolTemplate.selected = true;
                    if (patrolTemplate)
                        this.setActivePatrol(patrolTemplate);
                }
                else {
                    this.setActivePatrol(patrol);
                }
                setTimeout(function () { _this.zoomToPatrolBounds(); }, 100);
            }
        }
    };
    DashboardPatrolMapService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [DashboardPatrolService,
            PatrolBuilderService,
            NgZone,
            NavigationService])
    ], DashboardPatrolMapService);
    return DashboardPatrolMapService;
}(PatrolMapService));
export { DashboardPatrolMapService };
//# sourceMappingURL=dashboard-patrol-map.service.js.map