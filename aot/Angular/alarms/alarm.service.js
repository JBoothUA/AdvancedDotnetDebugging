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
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as moment from 'moment';
import { Alarm } from './alarm.class';
import { HttpService } from '../shared/http.service';
import { UserService } from '../shared/user.service';
import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { AppSettings } from '../shared/app-settings';
import { GetAlarmMarkerId } from '../map/alarms/alarmMap.service';
import { HubService, Hubs } from '../shared/hub.service';
var AlarmService = /** @class */ (function () {
    function AlarmService(httpService, userService, locationFilterPipe, appSettings, hubService) {
        var _this = this;
        this.httpService = httpService;
        this.userService = userService;
        this.locationFilterPipe = locationFilterPipe;
        this.appSettings = appSettings;
        this.hubService = hubService;
        this.filteredAlarms = [];
        this.groupSelection = 'Location';
        this.sortOrder = 'asc';
        this.alarmApiBaseUrl = '/alarms/';
        this.selectedLocations = [];
        this.alarmsLoaded = new BehaviorSubject(false);
        this.newAlarm = new Subject();
        this.editedAlarm = new Subject();
        this.removedAlarm = new Subject();
        this.clearingAlarms = new Subject();
        this.dismissingAlarms = new Subject();
        this.selectionChanged = new Subject();
        this.alarmSelected = new Subject();
        this.openAlarmActionMenuSub = new Subject();
        this.refreshTimerSub = new Subject();
        this.ngUnsubscribe = new Subject();
        this.alarms = [];
        this.hubService.onAlarmHubConnected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () {
                _this.loadAlarms();
            }
        });
        this.hubService.onAlarmMessage
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (msg) {
                _this.handleMessage(msg);
            }
        });
    }
    AlarmService.prototype.loadAlarms = function () {
        var _this = this;
        this.alarms = [];
        var url = this.alarmApiBaseUrl + 'Active';
        return this.httpService.get(url).then(function (activeAlarms) {
            for (var _i = 0, _a = activeAlarms.Result; _i < _a.length; _i++) {
                var alarm = _a[_i];
                // Map Location data into the Alarm
                if (alarm.LocationId) {
                    for (var _b = 0, _c = _this.userService.currentUser.tenant.Locations || []; _b < _c.length; _b++) {
                        var location_1 = _c[_b];
                        if (alarm.LocationId === location_1.Id) {
                            alarm.Location = location_1;
                            break;
                        }
                    }
                }
                // Add alarms directly so that we do not get the newAlarm event multiple times
                var index = _this.indexOf(alarm.Id, _this.alarms);
                if (index === -1) {
                    _this.alarms.push(new Alarm(alarm));
                }
            }
            console.log('Active Alarms (' + _this.alarms.length + ')', _this.alarms);
            _this.filterAlarms();
            _this.alarmsLoaded.next(true);
            _this.hubService.setDataLoaded(Hubs.Alarm);
        });
    };
    AlarmService.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    AlarmService.prototype.loadAlarmsByIds = function (alarmIds) {
        var alarms = [];
        var url = this.alarmApiBaseUrl + '?ids=' + alarmIds[0];
        if (alarmIds.length > 0) {
            for (var i in alarmIds) {
                url += '&ids=' + alarmIds[i];
            }
        }
        return this.httpService.get(url);
    };
    AlarmService.prototype.setSelectedLocations = function (locations) {
        this.selectedLocations = locations;
    };
    AlarmService.prototype.getAlarms = function () {
        return this.filteredAlarms;
    };
    AlarmService.prototype.filterAlarms = function () {
        this.filteredAlarms = [];
        if (this.alarms) {
            //apply Location Filter
            this.filteredAlarms = this.locationFilterPipe.transform(this.alarms, this.selectedLocations);
        }
    };
    AlarmService.prototype.getAlarmById = function (id) {
        for (var _i = 0, _a = this.alarms; _i < _a.length; _i++) {
            var alarm = _a[_i];
            if (alarm.Id === id) {
                return alarm;
            }
        }
        return null;
    };
    AlarmService.prototype.handleMessage = function (message) {
        this.upsert(message);
    };
    AlarmService.prototype.add = function (alarm) {
        var alarmObj = new Alarm(alarm);
        this.alarms.push(alarmObj);
        if (this.selectedLocations.indexOf(alarmObj.LocationId) > -1) {
            // New alarm is in a selected location, so add it to the filtered alarms list
            this.filteredAlarms.push(alarmObj);
            this.newAlarm.next(alarmObj);
        }
    };
    AlarmService.prototype.remove = function (id) {
        var index = this.indexOf(id, this.alarms);
        if (index > -1) {
            // alarm found, remove it
            this.alarms.splice(index, 1);
            var filterIndex = this.indexOf(id, this.filteredAlarms);
            if (filterIndex > -1) {
                // Alarm is in the filtered list, so remove it from there as well
                var alarm = this.filteredAlarms[filterIndex];
                this.filteredAlarms.splice(filterIndex, 1);
                this.removedAlarm.next(alarm);
            }
        }
    };
    AlarmService.prototype.indexOf = function (id, alarms) {
        for (var i = 0; i < alarms.length; i++) {
            if (alarms[i].Id === id) {
                return i;
            }
        }
        return -1;
    };
    AlarmService.prototype.upsert = function (alarm) {
        if (alarm instanceof Array) {
            for (var _i = 0, alarm_1 = alarm; _i < alarm_1.length; _i++) {
                var a = alarm_1[_i];
                var index = this.indexOf(a.id, this.alarms);
                if (index === -1) {
                    this.add(a);
                }
                else {
                    this.edit(a);
                }
            }
        }
        else {
            var index = this.indexOf(alarm.id, this.alarms);
            if (index === -1) {
                this.add(alarm);
            }
            else {
                this.edit(alarm);
            }
        }
    };
    AlarmService.prototype.edit = function (alarm) {
        var index = this.indexOf(alarm.id, this.alarms);
        if (index === -1) {
            return;
        }
        var editAlarm = this.alarms[index];
        editAlarm.deserialize(alarm);
        // Remove Cleared and Dismissed alarms.
        if (editAlarm.State > 2) {
            this.remove(editAlarm.Id);
        }
        else {
            if (this.selectedLocations.indexOf(editAlarm.LocationId) > -1) {
                this.editedAlarm.next(editAlarm);
            }
        }
    };
    AlarmService.prototype.convertDateDisplay = function (date, dateOnly) {
        var val1 = '';
        var val2 = '';
        if (moment().isSame(date, 'day')) {
            val1 = 'Today';
        }
        else if (moment().subtract(1, 'day').isSame(date, 'day')) {
            val1 = 'Yesterday';
        }
        else {
            val1 = moment(date).format('M/D/YY');
        }
        if (dateOnly) {
            return val1;
        }
        if (val1 !== '') {
            val2 = ' - ';
        }
        val2 += moment(date).format('h:mm:ssa');
        return val1 + val2;
    };
    AlarmService.prototype.convertPriorityName = function (name) {
        switch (name) {
            case 1:
                return 'Critical';
            case 2:
                return 'High';
            case 3:
                return 'Medium';
            default:
                return 'Low';
        }
    };
    AlarmService.prototype.convertPriorityNameToNum = function (priority) {
        switch (priority) {
            case 'Critical':
                return 1;
            case 'High':
                return 2;
            case 'Medium':
                return 3;
            case 'Low':
            default:
                return 4;
        }
    };
    AlarmService.prototype.convertStateName = function (name) {
        switch (name) {
            case 1:
                return 'Reported';
            default:
                return 'Acknowledged';
        }
    };
    AlarmService.prototype.convertLocationDisplay = function (position) {
        var retVal = 'Unknown';
        if (position) {
            if (position.Coordinates) {
                if (position.Coordinates.length >= 2) {
                    retVal = position.Coordinates['1'] + ', ' + position.Coordinates['0'];
                }
            }
        }
        return retVal;
    };
    AlarmService.prototype.convertUsernameToInitials = function (userId) {
        if (!userId) {
            return '';
        }
        var retVal = '';
        var splitStr = userId.split(' ');
        $.each(splitStr, function (i, str) {
            if (i === 0 || i === splitStr.length - 1) {
                var val = str.split('');
                retVal += val[0];
            }
        });
        return retVal.toUpperCase();
    };
    AlarmService.prototype.getHighestPriorityAlarm = function () {
        if (this.alarms && this.alarms.length) {
            return this.alarms.sort(function (a, b) {
                return a.Priority - b.Priority;
            })[0];
        }
        return null;
    };
    AlarmService.prototype.setExpandedItem = function (id) {
        for (var alarm in this.alarms) {
            this.alarms[alarm].Expanded = (this.alarms[alarm].Id === id);
        }
    };
    AlarmService.prototype.getAlarmMarkerId = function (alarm) {
        return GetAlarmMarkerId(alarm);
    };
    AlarmService.prototype.selectAlarm = function (id, mapContext, notifySelected) {
        if (mapContext === void 0) { mapContext = false; }
        if (notifySelected === void 0) { notifySelected = true; }
        var index = this.indexOf(id, this.alarms);
        if (index === -1) {
            return;
        }
        this.alarms[index].Selected = true;
        this.selectOverlapAlarm(id);
        this.appSettings.lastSelectedMarkerRefId = this.getAlarmMarkerId(this.alarms[index]);
        this.selectionChanged.next(mapContext);
        if (notifySelected) {
            this.alarmSelected.next(id);
        }
    };
    AlarmService.prototype.deSelectAlarm = function (id, mapContext, sendEvent) {
        if (mapContext === void 0) { mapContext = false; }
        if (sendEvent === void 0) { sendEvent = true; }
        var index = this.indexOf(id, this.alarms);
        if (index === -1) {
            return;
        }
        var alarm = this.alarms[index];
        alarm.OverlapSelected = false;
        if (!alarm.Selected) {
            return;
        }
        alarm.Selected = false;
        if (sendEvent) {
            this.selectionChanged.next(mapContext);
        }
    };
    AlarmService.prototype.deSelectAllAlarms = function (mapContext) {
        if (mapContext === void 0) { mapContext = false; }
        for (var alarm in this.alarms) {
            this.alarms[alarm].Selected = false;
            this.alarms[alarm].OverlapSelected = false;
        }
        this.selectionChanged.next(mapContext);
    };
    AlarmService.prototype.deSelectAllOverlap = function () {
        for (var alarm in this.alarms) {
            this.alarms[alarm].OverlapSelected = false;
        }
    };
    AlarmService.prototype.selectOnlyAlarm = function (id, mapContext, notifySelected) {
        if (mapContext === void 0) { mapContext = false; }
        if (notifySelected === void 0) { notifySelected = true; }
        for (var alarm in this.alarms) {
            this.alarms[alarm].Selected = (this.alarms[alarm].Id === id);
            this.alarms[alarm].OverlapSelected = (this.alarms[alarm].Id === id);
        }
        this.appSettings.lastSelectedMarkerRefId = this.getAlarmMarkerId(this.getAlarmById(id));
        ;
        this.selectionChanged.next(mapContext);
        if (notifySelected) {
            this.alarmSelected.next(id);
        }
    };
    AlarmService.prototype.selectOverlapAlarm = function (id) {
        for (var alarm in this.alarms) {
            this.alarms[alarm].OverlapSelected = (this.alarms[alarm].Id === id);
        }
    };
    AlarmService.prototype.getSelectedAlarms = function () {
        var alarms = this.getAlarms();
        var selectedAlarms = [];
        for (var alarm in alarms) {
            if (alarms[alarm].Selected) {
                selectedAlarms.push(alarms[alarm]);
            }
        }
        return selectedAlarms;
    };
    AlarmService.prototype.getSelectedAlarmsCount = function () {
        var alarms = this.getAlarms();
        var count = 0;
        for (var alarm in alarms) {
            if (alarms[alarm].Selected) {
                count++;
            }
        }
        return count;
    };
    AlarmService.prototype.acknowledgeAlarms = function (alarm) {
        var alarmIds = [];
        if (!alarm.Selected) {
            alarmIds.push(alarm.Id);
        }
        else {
            var selectedAlarms = this.getSelectedAlarms();
            if (!selectedAlarms || !selectedAlarms.length) {
                selectedAlarms = [alarm];
            }
            for (var index in selectedAlarms) {
                var curAlarm = selectedAlarms[index];
                if (!curAlarm.Acknowledged) {
                    alarmIds.push(selectedAlarms[index].Id);
                }
            }
        }
        var url = this.alarmApiBaseUrl + 'Acknowledge?userId=' + this.userService.currentUser.name;
        this.httpService.put(url, alarmIds);
    };
    AlarmService.prototype.clearAlarms = function (alarms) {
        var alarmIds = [];
        for (var index in alarms) {
            var alarm = alarms[index];
            alarmIds.push(alarm.Id);
        }
        var url = this.alarmApiBaseUrl + 'Clear?userId=' + this.userService.currentUser.name;
        this.httpService.put(url, alarmIds);
    };
    AlarmService.prototype.clearAlarmsWithConfirmation = function (alarm) {
        var alarms = [];
        if (!alarm.Selected) {
            alarms.push(alarm);
        }
        else {
            var selectedAlarms = this.getSelectedAlarms();
            if (!selectedAlarms || !selectedAlarms.length) {
                selectedAlarms = [alarm];
            }
            for (var index in selectedAlarms) {
                alarms.push(selectedAlarms[index]);
            }
        }
        this.clearingAlarms.next(alarms);
    };
    AlarmService.prototype.dismissAlarms = function (alarms, dismissReason) {
        var alarmIds = [];
        for (var index in alarms) {
            var alarm = alarms[index];
            alarmIds.push(alarm.Id);
        }
        var msg = { AlarmIds: alarmIds, CommentText: dismissReason, UserId: this.userService.currentUser.name };
        var url = this.alarmApiBaseUrl + 'Dismiss';
        this.httpService.put(url, msg);
    };
    AlarmService.prototype.dismissAlarmsWithConfirmation = function (alarm) {
        var alarms = [];
        if (!alarm.Selected) {
            alarms.push(alarm);
        }
        else {
            var selectedAlarms = this.getSelectedAlarms();
            if (!selectedAlarms || !selectedAlarms.length) {
                selectedAlarms = [alarm];
            }
            for (var index in selectedAlarms) {
                alarms.push(selectedAlarms[index]);
            }
        }
        this.dismissingAlarms.next(alarms);
    };
    AlarmService.prototype.addComment = function (alarmId, comment) {
        var url = this.alarmApiBaseUrl + alarmId + '/AddComment?userId=' + this.userService.currentUser.name;
        this.httpService.put(url, comment, null);
    };
    AlarmService.prototype.openAlarmActionMenu = function (alarm, event) {
        this.openAlarmActionMenuSub.next({ alarm: alarm, event: event });
    };
    AlarmService.prototype.handleClickAlarm = function (alarm, event, mapContext) {
        if (mapContext === void 0) { mapContext = false; }
        if (alarm.Selected) {
            if (event.ctrlKey) {
                this.deSelectAlarm(alarm.Id, mapContext);
            }
            else {
                // if more than one alarm is selected, only select this one
                if (this.getSelectedAlarmsCount() > 1) {
                    this.selectOnlyAlarm(alarm.Id, mapContext);
                }
                else {
                    // This is the only alarm selected, so deselect it
                    this.deSelectAlarm(alarm.Id, mapContext);
                }
            }
        }
        else {
            if (!event.ctrlKey) {
                this.selectOnlyAlarm(alarm.Id, mapContext);
            }
            else {
                this.selectAlarm(alarm.Id, mapContext);
            }
        }
    };
    AlarmService.prototype.persistMapViewAlarmStates = function () {
        this.mapViewStates = [];
        for (var _i = 0, _a = this.alarms; _i < _a.length; _i++) {
            var alarm = _a[_i];
            this.mapViewStates.push({
                Id: alarm.Id,
                Selected: alarm.Selected,
                OverlapSelected: alarm.OverlapSelected,
                Expanded: alarm.Expanded
            });
            alarm.Selected = false;
            alarm.OverlapSelected = false;
            alarm.Expanded = false;
        }
    };
    AlarmService.prototype.restoreMapViewAlarmStates = function () {
        if (this.mapViewStates) {
            for (var _i = 0, _a = this.mapViewStates; _i < _a.length; _i++) {
                var state = _a[_i];
                // If alarm still exists, restore its previous state
                var index = this.indexOf(state.Id, this.alarms);
                if (index === -1) {
                    continue;
                }
                this.alarms[index].Selected = state.Selected;
                this.alarms[index].Expanded = state.Expanded;
                this.alarms[index].OverlapSelected = state.OverlapSelected;
                this.mapViewStates = [];
            }
        }
        else {
            for (var alarm in this.alarms) {
                this.alarms[alarm].Selected = false;
                this.alarms[alarm].Expanded = false;
                this.alarms[alarm].OverlapSelected = false;
            }
        }
    };
    AlarmService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [HttpService, UserService, LocationFilterPipe,
            AppSettings, HubService])
    ], AlarmService);
    return AlarmService;
}());
export { AlarmService };
//# sourceMappingURL=alarm.service.js.map