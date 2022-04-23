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
import { Subject } from 'rxjs/Subject';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolTemplate, PatrolType, AreaType } from '../patrols/patrol.class';
import { PointTemplate } from '../patrols/point.class';
import { LocationFilterService } from '../shared/location-filter.service';
import { HttpService } from '../shared/http.service';
import { UserService } from '../shared/user.service';
var PatrolBuilderService = /** @class */ (function () {
    function PatrolBuilderService(httpService, userService, patrolService, locFilterService) {
        this.httpService = httpService;
        this.userService = userService;
        this.patrolService = patrolService;
        this.locFilterService = locFilterService;
        this.patrolApiBaseUrl = '/patrols/';
        this.actionDefSelChanged = new Subject();
        this.patrolPointSelChanged = new Subject();
        this.patrolPointAdded = new Subject();
        this.patrolPointRemoved = new Subject();
        this.patrolPointModified = new Subject();
        this.patrolPointEditSelected = new Subject();
    }
    PatrolBuilderService.prototype.getActiveTenantID = function () {
        var tenantId;
        var mapviewTenants = this.locFilterService.getSelectedTenantLocations('mapview');
        if (mapviewTenants && mapviewTenants.length > 0) {
            tenantId = mapviewTenants[0].Id;
        }
        else {
            mapviewTenants = this.locFilterService.getAllTenantLocations('mapview');
            if (mapviewTenants && mapviewTenants.length > 0) {
                tenantId = mapviewTenants[0].Id;
            }
        }
        return (tenantId);
    };
    PatrolBuilderService.prototype.getActiveLocationID = function () {
        var locationId;
        var mapviewTenants = this.locFilterService.getSelectedTenantLocations('mapview');
        if (mapviewTenants && mapviewTenants.length > 0) {
            if (mapviewTenants[0].Locations && mapviewTenants[0].Locations.length > 0) {
                locationId = mapviewTenants[0].Locations[0].Id;
            }
        }
        else {
            mapviewTenants = this.locFilterService.getAllTenantLocations('mapview');
            if (mapviewTenants && mapviewTenants.length > 0) {
                if (mapviewTenants[0].Locations && mapviewTenants[0].Locations.length > 0) {
                    locationId = mapviewTenants[0].Locations[0].Id;
                }
            }
        }
        return (locationId);
    };
    // Patrol Builder methods
    PatrolBuilderService.prototype.selectOnlyPatrolPoint = function (patrol, pointId) {
        this.deselectAllPatrolPoints(patrol);
        this.selectPatrolPoint(patrol, pointId);
    };
    PatrolBuilderService.prototype.selectPatrolPoint = function (patrol, pointId) {
        var index = this.indexOf(patrol, pointId);
        if (index === -1)
            return;
        patrol.Points[index].Selected = true;
        this.patrolPointSelChanged.next(patrol.Points[index]);
    };
    PatrolBuilderService.prototype.deselectPatrolPoint = function (patrol, pointId) {
        var index = this.indexOf(patrol, pointId);
        if (index === -1)
            return;
        patrol.Points[index].Selected = false;
        this.patrolPointSelChanged.next(patrol.Points[index]);
    };
    PatrolBuilderService.prototype.deselectAllPatrolPoints = function (patrol) {
        for (var ii = 0; ii < patrol.Points.length; ii++) {
            patrol.Points[ii].Selected = false;
        }
    };
    PatrolBuilderService.prototype.getSelectedPatrolPointCount = function (patrol) {
        var count = 0;
        for (var ii = 0; ii < patrol.Points.length; ii++) {
            if (patrol.Points[ii].Selected === true)
                count++;
        }
        return (count);
    };
    PatrolBuilderService.prototype.indexOf = function (patrol, pointId) {
        for (var ii = 0; ii < patrol.Points.length; ii++) {
            if (patrol.Points[ii].PointId === pointId)
                return (ii);
        }
        return (-1);
    };
    PatrolBuilderService.prototype.selectActionDef = function (actionDef) {
        actionDef.Selected = true;
        this.selectedActionDef = actionDef;
        this.actionDefSelChanged.next(actionDef.Selected);
    };
    PatrolBuilderService.prototype.deselectActionDef = function (actionDef) {
        actionDef.Selected = false;
        this.selectedActionDef = null;
        this.actionDefSelChanged.next(actionDef.Selected);
    };
    PatrolBuilderService.prototype.createNewPatrol = function () {
        var patrol = new PatrolTemplate(null);
        patrol.TemplateId = this.createGUID();
        patrol.id = patrol.TemplateId;
        patrol.Type = -1;
        patrol.AreaType = -1;
        patrol.Points = [];
        patrol.TenantId = null;
        patrol.LocationId = null;
        patrol.Version = 0;
        patrol.IsDeleted = false;
        patrol.IsPatrolSubmitted = false;
        patrol.PlatformSubmittedId = null;
        patrol.DisplayName = null;
        return (patrol);
    };
    PatrolBuilderService.prototype.savePatrol = function (patrol) {
        var url = this.patrolApiBaseUrl + 'templates';
        this.httpService.put(url, patrol);
    };
    PatrolBuilderService.prototype.isStep1Completed = function (patrol) {
        if (patrol.DisplayName &&
            (patrol.AreaType === AreaType.Large || patrol.AreaType === AreaType.Perimeter || patrol.AreaType === AreaType.Small) &&
            (patrol.Type === PatrolType.Air || patrol.Type === PatrolType.Ground) &&
            (patrol.TemplateId && patrol.TemplateId !== '' && patrol.LocationId && patrol.LocationId !== '')) {
            return (true);
        }
        else
            return (false);
    };
    PatrolBuilderService.prototype.notifyPatrolPointEditSelected = function (patrolPoint) {
        this.patrolPointEditSelected.next(patrolPoint);
    };
    PatrolBuilderService.prototype.notifyPatrolPointModified = function (patrolPoint) {
        this.patrolPointModified.next(patrolPoint);
    };
    PatrolBuilderService.prototype.appendPatrolPoint = function (patrol, lat, lng) {
        var patrolPoint = new PointTemplate(null);
        patrolPoint.PointId = this.createGUID();
        patrolPoint.DisplayName = 'Point ' + (patrol.Points.length + 1).toString();
        patrolPoint.Actions = [];
        patrolPoint.Ordinal = patrol.Points.length + 1;
        patrolPoint.Position = { Coordinates: [lng, lat], Type: 'Point' };
        patrol.Points.push(patrolPoint);
        this.patrolPointAdded.next(patrolPoint);
        return (patrolPoint);
    };
    PatrolBuilderService.prototype.prependPatrolPoint = function (patrol, lat, lng) {
        var patrolPoint = new PointTemplate(null);
        patrolPoint.PointId = this.createGUID();
        patrolPoint.Ordinal = 1;
        patrolPoint.Actions = [];
        patrolPoint.Position = { Coordinates: [lng, lat], Type: 'Point' };
        patrol.Points.unshift(patrolPoint);
        this.setPointDisplayName(patrol, patrolPoint);
        this.updatePointOrdinalAndDisplayNames(patrol, patrolPoint, patrolPoint.Ordinal);
        //for (let ii = 1; ii < patrol.Points.length; ii++) {
        //	patrol.Points[ii].Ordinal = ii + 1;
        //	this.setPointDisplayName(patrol, patrol.Points[ii]);
        //}
        this.patrolPointAdded.next(patrolPoint);
        return (patrolPoint);
    };
    PatrolBuilderService.prototype.insertPatrolPointAfter = function (patrol, beforePoint, lat, lng) {
        var patrolPoint = new PointTemplate(null);
        patrolPoint.PointId = this.createGUID();
        patrolPoint.Ordinal = beforePoint.Ordinal + 1;
        patrolPoint.Actions = [];
        patrolPoint.Position = { Coordinates: [lng, lat], Type: 'Point' };
        patrolPoint.IsInserted = true;
        this.setPointDisplayName(patrol, patrolPoint);
        patrol.Points.splice((patrolPoint.Ordinal - 1), 0, patrolPoint);
        this.updatePointOrdinalAndDisplayNames(patrol, patrolPoint, patrolPoint.Ordinal);
        this.patrolPointAdded.next(patrolPoint);
        return (patrolPoint);
    };
    PatrolBuilderService.prototype.removePatrolPoint = function (patrol, patrolPoint) {
        if (patrol && patrolPoint) {
            for (var ii = 0; ii < patrol.Points.length; ii++) {
                if (patrolPoint.PointId === patrol.Points[ii].PointId) {
                    patrol.Points.splice(ii, 1);
                    this.updatePointOrdinalAndDisplayNames(patrol, patrolPoint, ii);
                    this.patrolPointRemoved.next(patrolPoint);
                    break;
                }
            }
        }
    };
    PatrolBuilderService.prototype.updatePointOrdinalAndDisplayNames = function (patrol, patrolPoint, startIndex) {
        var checkPtCnt = 1;
        for (var ii = 0; ii < patrolPoint.Ordinal - 1; ii++) {
            if (this.patrolService.isCheckPoint(patrol.Points[ii]) === true) {
                checkPtCnt++;
            }
        }
        for (var ii = startIndex; ii < patrol.Points.length; ii++) {
            var point = patrol.Points[ii];
            point.Ordinal = ii + 1;
            if (this.patrolService.isCheckPoint(point) === true) {
                point.DisplayName = "Checkpoint " + checkPtCnt.toString();
                checkPtCnt++;
            }
            else {
                point.DisplayName = 'Point ' + (point.Ordinal).toString();
            }
        }
    };
    PatrolBuilderService.prototype.setPointDisplayName = function (patrol, patrolPoint) {
        if (this.patrolService.isCheckPoint(patrolPoint) === true) {
            var checkPtCnt = 1;
            for (var ii = 0; ii < patrolPoint.Ordinal - 1; ii++) {
                if (this.patrolService.isCheckPoint(patrol.Points[ii]) === true) {
                    checkPtCnt++;
                }
            }
            patrolPoint.DisplayName = "Checkpoint " + checkPtCnt.toString();
        }
        else {
            patrolPoint.DisplayName = 'Point ' + (patrolPoint.Ordinal).toString();
        }
    };
    PatrolBuilderService.prototype.createGUID = function () {
        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var cryptoObj = window.crypto;
            var r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return (guid);
    };
    PatrolBuilderService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [HttpService,
            UserService,
            PatrolService,
            LocationFilterService])
    ], PatrolBuilderService);
    return PatrolBuilderService;
}());
export { PatrolBuilderService };
//# sourceMappingURL=patrol-builder.service.js.map