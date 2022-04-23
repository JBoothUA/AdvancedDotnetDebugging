var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { PatrolService } from '../../patrols/patrol.service';
import { PlatformService } from '../../platforms/platform.service';
import { NavigationService } from '../../shared/navigation.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { ConfirmationDialog } from '../../shared/confirmation-dialog.component';
var PatrolContextMenu = /** @class */ (function () {
    function PatrolContextMenu(patrolService, platformService, elementRef, ref, navigationService) {
        var _this = this;
        this.patrolService = patrolService;
        this.platformService = platformService;
        this.elementRef = elementRef;
        this.ref = ref;
        this.navigationService = navigationService;
        this.visible = false;
        this.ngUnsubscribe = new Subject();
        this.hide = function () {
            if (event) {
                event.preventDefault();
            }
            _this.visible = false;
        };
    }
    PatrolContextMenu.prototype.show = function (obj) {
        this.patrolTemplate = obj.patrolTemplate;
        var x = obj.event.clientX;
        var y = obj.event.clientY;
        this.elementRef.nativeElement.style.left = x + 'px';
        this.elementRef.nativeElement.style.top = y + 'px';
        this.elementRef.nativeElement.style.position = 'absolute';
        this.visible = true;
    };
    PatrolContextMenu.prototype.ngOnInit = function () {
        var _this = this;
        this.patrolService.onPatrolActionMenuOpen
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (obj) {
                _this.show(obj);
                _this.ref.markForCheck();
            }
        });
    };
    PatrolContextMenu.prototype.onEditClick = function () {
        var _this = this;
        if (!this.patrolService.isOnPatrol(this.patrolTemplate)) {
            setTimeout(function () {
                _this.patrolService.startEditPatrol(_this.patrolTemplate.id);
                _this.platformService.showRobotMonitor(null);
            }, 100);
        }
    };
    PatrolContextMenu.prototype.onDeleteClick = function () {
        var _this = this;
        if (!this.patrolService.isOnPatrol(this.patrolTemplate)) {
            setTimeout(function () { return _this.confirmDelete.show(); }, 100);
        }
    };
    PatrolContextMenu.prototype.ngAfterViewInit = function () {
        $('body').append(this.elementRef.nativeElement);
    };
    PatrolContextMenu.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    __decorate([
        ViewChild(ConfirmationDialog),
        __metadata("design:type", ConfirmationDialog)
    ], PatrolContextMenu.prototype, "confirmDelete", void 0);
    PatrolContextMenu = __decorate([
        Component({
            selector: 'patrol-context-menu',
            templateUrl: 'patrol-context-menu.component.html',
            styleUrls: ['patrol-context-menu.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService,
            PlatformService,
            ElementRef,
            ChangeDetectorRef,
            NavigationService])
    ], PatrolContextMenu);
    return PatrolContextMenu;
}());
export { PatrolContextMenu };
//# sourceMappingURL=patrol-context-menu.component.js.map