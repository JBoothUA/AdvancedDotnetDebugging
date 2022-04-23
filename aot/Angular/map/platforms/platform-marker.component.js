var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { PlatformMapService } from '../platforms/platformMap.service';
import { Platform, PlatformState, PlatformMode } from '../../platforms/platform.class';
import { PatrolService } from '../../patrols/patrol.service';
import { PlatformService } from '../../platforms/platform.service';
import { PointInstance, PointStatusValues } from '../../patrols/point.class';
import { PlatformRadialMenu } from './platform-radial-menu.component';
import { MapViewOptions } from '../../shared/map-view-options.class';
var PlatformMarker = /** @class */ (function () {
    function PlatformMarker(mpService, PlatformService, ChangeDetectorRef, ptrlService) {
        var _this = this;
        this.mpService = mpService;
        this.PlatformService = PlatformService;
        this.ChangeDetectorRef = ChangeDetectorRef;
        this.ptrlService = ptrlService;
        this.ShowSelection = false;
        this.HideLabel = false;
        this.SmallMarker = false;
        this.ClickEvents = true;
        this.NotifyMovement = false;
        this.OnMove = new EventEmitter;
        this.Hover = false;
        this.Dragging = false;
        this.MapZoomThreshold = 21;
        this.PlatformMode = PlatformMode;
        this.ngUnsubscribe = new Subject();
        // Click -> Dbl Click facilitation
        this.Prevent = false;
        this.Delay = 200;
        this.Timer = null;
        $(document).mouseup(function () {
            _this.Dragging = false;
        });
    }
    PlatformMarker.prototype.ngOnInit = function () {
        if (!this.patrolService) {
            if (this.iPatrolService)
                this.patrolService = this.iPatrolService;
            else
                this.patrolService = this.ptrlService;
        }
        if (!this.MapService) {
            if (this.iPlatformMapService)
                this.MapService = this.iPlatformMapService;
            else
                this.MapService = this.mpService;
            this.MapZoom = this.MapService.getMapZoom();
        }
    };
    PlatformMarker.prototype.ngAfterViewInit = function () {
        var _this = this;
        if (this.Platform.Position && this.Platform.Position.coordinates) {
            if (!this.MarkerId) {
                this.MarkerId = this.Platform.id;
            }
            this.MapService.createPlatformMarker(this.MarkerId, this.Platform);
            if (this.NotifyMovement) {
                this.OnMove.emit();
            }
        }
        this.MapService.zoomChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (zoomLevel) {
                _this.MapZoom = zoomLevel;
                _this.ChangeDetectorRef.detectChanges();
            }
        });
        this.patrolService.onUpsertInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolInstance) {
                if (patrolInstance.PlatformId === _this.Platform.id) {
                    _this.ChangeDetectorRef.detectChanges();
                }
            }
        });
        this.patrolService.onPatrolInstanceComplete
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolInstance) {
                if (patrolInstance.PlatformId === _this.Platform.id) {
                    _this.ChangeDetectorRef.detectChanges();
                }
            }
        });
        this.PlatformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                if (_this.Platform.id === platform.id) {
                    _this.ChangeDetectorRef.detectChanges();
                }
            }
        });
        this.MapZoom = this.MapService.getMapZoom();
    };
    PlatformMarker.prototype.setupDraggableElement = function () {
        var _this = this;
        this.ChangeDetectorRef.detectChanges();
        if (!this.GoToLocationIcon)
            return;
        var draggable = new L.Draggable(this.GoToLocationIcon.nativeElement);
        draggable.enable();
        draggable.off('dragstart');
        draggable.on('dragstart', function () {
            _this.Dragging = true;
            _this.MapService.setGoToLocationMode(_this.Platform);
        });
        draggable.off('dragend');
        draggable.on('dragend', function () {
            _this.Dragging = false;
            // Restore the draggable element's position
            _this.GoToLocationIcon.nativeElement.style.transform = null;
        });
    };
    PlatformMarker.prototype.openRadial = function (event) {
        event.preventDefault();
        this.PlatformService.selectOnlyPlatform(this.Platform.id, true);
        this.radial.toggleMenu(event);
    };
    PlatformMarker.prototype.openActionMenu = function (event) {
        this.PlatformService.openPlatformActionMenu(this.Platform, event, this.platformActions, 10, 0, false);
    };
    PlatformMarker.prototype.select = function (event) {
        var _this = this;
        // Delay click action to allow dblclick to occur
        this.Timer = setTimeout(function () {
            if (!_this.Prevent) {
                if (_this.ClickEvents) {
                    if (_this.MapZoom < _this.MapZoomThreshold) {
                        _this.PlatformService.selectOnlyPlatform(_this.Platform.id);
                        _this.MapService.zoomToPlatformMarker(_this.MarkerId);
                    }
                    else {
                        _this.PlatformService.handleClick(_this.Platform);
                    }
                    _this.ChangeDetectorRef.detectChanges();
                }
            }
            _this.Prevent = false;
        }, this.Delay);
    };
    PlatformMarker.prototype.zoomTo = function () {
        clearTimeout(this.Timer);
        this.Prevent = true;
        if (this.ClickEvents) {
            this.MapService.zoomToPlatformMarker(this.MarkerId);
        }
    };
    PlatformMarker.prototype.getHeadingImage = function () {
        if (this.ShowSelection || this.Platform.Selected) {
            return '/Content/images/Platforms/robot-heading-selected.png';
        }
        else {
            return '/Content/images/Platforms/robot-heading-not-selected.png';
        }
    };
    PlatformMarker.prototype.isProgressBarHidden = function () {
        var isHidden = true;
        if (this.patrolService.getPatrolInstanceByPlatformId(this.Platform.id)) {
            isHidden = false;
        }
        else if (this.Platform.PatrolTemplateSubmittedId) {
            isHidden = false;
        }
        return isHidden;
    };
    PlatformMarker.prototype.getPlatformPatrolCompleteness = function () {
        var patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.Platform.id);
        if (patrolInstance) {
            return this.patrolService.getPatrolCompleteness(patrolInstance);
        }
        return null;
    };
    PlatformMarker.prototype.mouseEnter = function () {
        this.Hover = true;
    };
    PlatformMarker.prototype.mouseLeave = function () {
        this.Hover = false;
    };
    PlatformMarker.prototype.ngOnDestroy = function () {
        clearTimeout(this.Timer);
        if (this.MapService.map) {
            this.MapService.removePlatformMarker(this.MarkerId);
        }
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PlatformMarker.prototype.ngOnChanges = function (changes) {
        if (!this.patrolService) {
            if (this.iPatrolService)
                this.patrolService = this.iPatrolService;
            else
                this.patrolService = this.ptrlService;
        }
        if (!this.MapService) {
            if (this.iPlatformMapService)
                this.MapService = this.iPlatformMapService;
            else
                this.MapService = this.mpService;
            this.MapZoom = this.MapService.getMapZoom();
        }
        if (changes.SentToPosition && changes.SentToPosition.currentValue !== changes.SentToPosition.previousValue) {
            $('.go-to-location-icon-' + this.Platform.id).remove();
            if (this.Platform.SentToPosition && this.Platform.SentToPosition.Position && this.Platform.SentToPosition.CurrentStatus === PointStatusValues.InTransit) {
                // Do not show an additional Location Icon if the destination is an Alarm
                if (!this.Platform.SentToPosition.AlarmIds || !this.Platform.SentToPosition.AlarmIds.length) {
                    this.MapService.addGoToLocationIcon(new L.LatLng(+this.Platform.SentToPosition.Position.Coordinates[1], +this.Platform.SentToPosition.Position.Coordinates[0]), this.Platform.id, this.Platform.DisplayName);
                }
            }
            if (changes.SentToPosition.previousValue
                && (changes.SentToPosition.currentValue.Position.Coordinates[0] !== changes.SentToPosition.previousValue.Position.Coordinates[0]
                    || changes.SentToPosition.currentValue.Position.Coordinates[1] !== changes.SentToPosition.previousValue.Position.Coordinates[1]
                    || changes.SentToPosition.currentValue.CurrentStatus !== changes.SentToPosition.previousValue.CurrentStatus)) {
                if (this.Platform.SentToPosition && this.Platform.SentToPosition.CurrentStatus === PointStatusValues.InTransit) {
                    if (this.Platform.SentToPosition.AlarmIds && this.Platform.SentToPosition.AlarmIds.length) {
                        this.MapService.createPlatformMarkerNotification(this.MarkerId, '<img src="/Content/Images/Platforms/sent-to-alarm.png" /> Sent to Alarm', 'popup-goal-started');
                    }
                    else {
                        this.MapService.createPlatformMarkerNotification(this.MarkerId, '<img src="/Content/Images/Platforms/sent-to-location.png" /> Sent to Location', 'popup-goal-started');
                    }
                }
                else if (this.Platform.SentToPosition && this.Platform.SentToPosition.CurrentStatus === PointStatusValues.Reached) {
                    this.MapService.createPlatformMarkerNotification(this.MarkerId, '<img src="/Content/Images/goal-success-icon.png" /> Arrived at Location', 'popup-goal-success');
                }
                else if (this.Platform.SentToPosition && this.Platform.SentToPosition.CurrentStatus === PointStatusValues.NotReached) {
                    this.MapService.createPlatformMarkerNotification(this.MarkerId, '<img src="/Content/Images/goal-warning-icon.png" /> Failed to Reach Location', 'popup-goal-warning');
                }
            }
        }
        if (changes.Selected && changes.Selected.currentValue !== changes.Selected.previousValue) {
            this.MapService.updatePlatformMarker(this.MarkerId, this.Platform);
        }
        if (changes.Orientation && changes.Orientation.currentValue !== changes.Orientation.previousValue) {
            // Set the rotate css. Use jQuery so that the transition animation fires (setting style in the template does not use transition)
            $(this.Heading.nativeElement).css('Transform', 'rotate(' + this.Platform.Orientation + 'deg)');
            $(this.Cone.nativeElement).css('Transform', 'rotate(' + this.Platform.Orientation + 'deg)');
            $(this.HeadingIcon.nativeElement).css('Transform', 'rotate(' + this.Platform.Orientation + 'deg)');
        }
        if ((changes.Latitude && !changes.Latitude.firstChange && changes.Latitude.currentValue !== changes.Latitude.previousValue) ||
            (changes.Longitude && !changes.Longitude.firstChange && changes.Longitude.currentValue !== changes.Longitude.previousValue)) {
            this.MapService.movePlatformMarker(this.MarkerId, this.Platform);
            if (this.NotifyMovement) {
                this.OnMove.emit();
            }
        }
        if (!this.Platform.IsPatrolSubmitted) {
            this.setupDraggableElement();
        }
    };
    PlatformMarker.prototype.showPlatformPopup = function (content, className) {
        var popup = L.popup({ className: className, closeButton: false, closeOnClick: false, autoPan: false });
        popup.setContent(content);
        var marker = this.MapService.getMarker(this.MarkerId);
        if (marker) {
            marker.bindPopup(popup).openPopup();
            setTimeout(function () {
                marker.closePopup();
                marker.unbindPopup();
            }, 6000);
        }
    };
    PlatformMarker.prototype.goToPatrol = function (platform) {
        if (!platform.PatrolTemplateSubmittedId) {
            return;
        }
        if (this.mapViewOptions) {
            this.mapViewOptions.showAlarmsTab = false;
            this.mapViewOptions.showPlatformsTab = false;
            this.mapViewOptions.showPatrolsTab = true;
            this.mapViewOptions.lastShownTab = 'Patrol';
        }
        this.patrolService.toggleSelectedPatrol(platform.PatrolTemplateSubmittedId, true);
        this.patrolService.scollToPatrol(platform.PatrolTemplateSubmittedId);
    };
    PlatformMarker.prototype.isDisabled = function () {
        if (this.Platform && this.Platform.State) {
            if (this.Platform.State.PlatformMode === PlatformMode.Estop || this.Platform.State.PlatformMode === PlatformMode.EstopPhysical) {
                return true;
            }
        }
        return this.Platform.IsPatrolSubmitted;
    };
    __decorate([
        Input(),
        __metadata("design:type", Platform)
    ], PlatformMarker.prototype, "Platform", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PointInstance)
    ], PlatformMarker.prototype, "SentToPosition", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PlatformMarker.prototype, "Selected", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PlatformMarker.prototype, "Orientation", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PlatformState)
    ], PlatformMarker.prototype, "State", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PlatformMarker.prototype, "Longitude", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PlatformMarker.prototype, "Latitude", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PlatformMarker.prototype, "MarkerId", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PlatformMarker.prototype, "ShowSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PlatformMarker.prototype, "HideLabel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PlatformMarker.prototype, "SmallMarker", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PlatformMarker.prototype, "ClickEvents", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PlatformMarker.prototype, "NotifyMovement", void 0);
    __decorate([
        Input(),
        __metadata("design:type", MapViewOptions)
    ], PlatformMarker.prototype, "mapViewOptions", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PatrolService)
    ], PlatformMarker.prototype, "iPatrolService", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PlatformMapService)
    ], PlatformMarker.prototype, "iPlatformMapService", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], PlatformMarker.prototype, "OnMove", void 0);
    __decorate([
        ViewChild('GoToLocationIcon'),
        __metadata("design:type", ElementRef)
    ], PlatformMarker.prototype, "GoToLocationIcon", void 0);
    __decorate([
        ViewChild('Cone'),
        __metadata("design:type", ElementRef)
    ], PlatformMarker.prototype, "Cone", void 0);
    __decorate([
        ViewChild('Heading'),
        __metadata("design:type", ElementRef)
    ], PlatformMarker.prototype, "Heading", void 0);
    __decorate([
        ViewChild('HeadingIcon'),
        __metadata("design:type", ElementRef)
    ], PlatformMarker.prototype, "HeadingIcon", void 0);
    __decorate([
        ViewChild(PlatformRadialMenu),
        __metadata("design:type", PlatformRadialMenu)
    ], PlatformMarker.prototype, "radial", void 0);
    __decorate([
        ViewChild('platformActions'),
        __metadata("design:type", ElementRef)
    ], PlatformMarker.prototype, "platformActions", void 0);
    PlatformMarker = __decorate([
        Component({
            selector: 'platform-marker',
            templateUrl: 'platform-marker.component.html',
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PlatformMapService, PlatformService,
            ChangeDetectorRef, PatrolService])
    ], PlatformMarker);
    return PlatformMarker;
}());
export { PlatformMarker };
//# sourceMappingURL=platform-marker.component.js.map