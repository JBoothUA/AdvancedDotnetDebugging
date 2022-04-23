var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, NgZone, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { PatrolTemplate } from '../../patrols/patrol.class';
import { PatrolMapService } from './patrolMap.service';
import { PatrolService } from '../../patrols/patrol.service';
import { PatrolBuilderService } from '../../patrolBuilder/patrol-builder.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var PatrolPath = /** @class */ (function () {
    function PatrolPath(ptrlMapService, patrolBuilderService, ptrlService, changeRef, ngzone) {
        this.ptrlMapService = ptrlMapService;
        this.patrolBuilderService = patrolBuilderService;
        this.ptrlService = ptrlService;
        this.changeRef = changeRef;
        this.ngzone = ngzone;
        this.patrol = null;
        this.ngUnsubscribe = new Subject();
        this.selected = false;
        this.childSelected = false;
        // Click -> Dbl Click facilitation
        this.prevent = false;
        this.delay = 200;
        this.timer = 0;
    }
    PatrolPath.prototype.ngOnInit = function () {
        var _this = this;
        if (!this.patrolService) {
            if (this.iPatrolService)
                this.patrolService = this.iPatrolService;
            else
                this.patrolService = this.ptrlService;
        }
        if (!this.patrolMapService) {
            if (this.iPatrolMapService)
                this.patrolMapService = this.iPatrolMapService;
            else
                this.patrolMapService = this.ptrlMapService;
        }
        this.patrolBuilderService.patrolPointSelChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolPoint) { return _this.patrolModified(patrolPoint); }
        });
        this.patrolBuilderService.patrolPointAdded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolPoint) { return _this.patrolModified(patrolPoint); }
        });
        this.patrolBuilderService.patrolPointRemoved
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolPoint) { return _this.patrolModified(patrolPoint); }
        });
        this.patrolBuilderService.patrolPointModified
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolPoint) { return _this.patrolModified(patrolPoint); }
        });
        this.patrolMapService.activePatrolSet
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrol) { return _this.activePatrolSet(patrol); }
        });
        this.patrolMapService.activePatrolCleared
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrol) { return _this.activePatrolCleared(patrol); }
        });
    };
    PatrolPath.prototype.ngOnChanges = function (changes) {
        //console.log("patrol-path changed");
    };
    PatrolPath.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PatrolPath.prototype.patrolModified = function (temp) {
        this.dirtyToggle = !this.dirtyToggle;
        //this.changeRef.markForCheck();
        this.changeRef.detectChanges();
    };
    PatrolPath.prototype.activePatrolSet = function (patrol) {
        this.patrol = patrol;
        this.changeRef.detectChanges();
    };
    PatrolPath.prototype.activePatrolCleared = function (patrol) {
        this.patrol = null;
        this.changeRef.detectChanges();
    };
    __decorate([
        Input(),
        __metadata("design:type", PatrolTemplate)
    ], PatrolPath.prototype, "patrol", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], PatrolPath.prototype, "patrolPoints", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolPath.prototype, "pointCount", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolPath.prototype, "dirtyToggle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PatrolService)
    ], PatrolPath.prototype, "iPatrolService", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PatrolMapService)
    ], PatrolPath.prototype, "iPatrolMapService", void 0);
    PatrolPath = __decorate([
        Component({
            selector: 'patrol-path',
            templateUrl: 'patrol-path.component.html',
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolMapService,
            PatrolBuilderService,
            PatrolService,
            ChangeDetectorRef,
            NgZone])
    ], PatrolPath);
    return PatrolPath;
}());
export { PatrolPath };
//# sourceMappingURL=patrol-path.component.js.map