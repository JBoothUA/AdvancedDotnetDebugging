var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input } from '@angular/core';
import { AlarmService } from '../../alarms/alarm.service';
import { slideDown } from '../../shared/animations';
import { NavigationService } from '../../shared/navigation.service';
var AlarmTable = /** @class */ (function () {
    function AlarmTable(alarmService, navigationService) {
        this.alarmService = alarmService;
        this.navigationService = navigationService;
        this.showBadge = true;
        this.showPriorityLine = false;
        this.itemClass = '';
        this.headerClass = '';
        this.subheaderClass = '';
        this.headerText = 'Selected Alarms';
        this.scrollingGroups = true;
    }
    AlarmTable.prototype.ngOnInit = function () {
        this.expandedState = this.expandedState || 'out';
    };
    AlarmTable.prototype.trackByAlarmFn = function (index, alarm) {
        return alarm.Id;
    };
    AlarmTable.prototype.toggleExpandedGroup = function () {
        this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
    };
    AlarmTable.prototype.getHighestPriority = function () {
        if (this.alarms && this.alarms.length) {
            var highestPriority = this.alarms.sort(function (a, b) {
                return a.Priority - b.Priority;
            })[0].Priority;
            return 'p' + (highestPriority === 0 ? 1 : highestPriority);
        }
        return '';
    };
    AlarmTable.prototype.checkSelection = function (alarm) {
        if (this.checkSelectionFunc) {
            return this.checkSelectionFunc(alarm);
        }
        else {
            return false;
        }
    };
    AlarmTable.prototype.onclick = function (alarm, event) {
        if (this.onClickFunc) {
            this.onClickFunc(alarm, event);
        }
    };
    AlarmTable.prototype.goToAlarm = function (alarm) {
        event.stopPropagation();
        this.navigationService.navigate('/MapView/Alarms', alarm.Id);
    };
    AlarmTable.prototype.onContextMenu = function (alarm, event) {
        if (this.onContextMenuFunc) {
            this.onContextMenuFunc(alarm, event);
        }
    };
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AlarmTable.prototype, "alarms", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AlarmTable.prototype, "showBadge", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AlarmTable.prototype, "showPriorityLine", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AlarmTable.prototype, "itemClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AlarmTable.prototype, "headerClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AlarmTable.prototype, "subheaderClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AlarmTable.prototype, "checkSelectionFunc", void 0);
    __decorate([
        Input('onClick'),
        __metadata("design:type", Function)
    ], AlarmTable.prototype, "onClickFunc", void 0);
    __decorate([
        Input('onContextMenu'),
        __metadata("design:type", Function)
    ], AlarmTable.prototype, "onContextMenuFunc", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AlarmTable.prototype, "headerText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AlarmTable.prototype, "scrollingGroups", void 0);
    AlarmTable = __decorate([
        Component({
            selector: 'alarm-table',
            templateUrl: 'alarm-table.component.html',
            animations: [
                slideDown
            ]
        }),
        __metadata("design:paramtypes", [AlarmService, NavigationService])
    ], AlarmTable);
    return AlarmTable;
}());
export { AlarmTable };
//# sourceMappingURL=alarm-table.component.js.map