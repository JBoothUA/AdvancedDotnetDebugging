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
import { Platform, PlatformMode, ErrorState } from '../platforms/platform.class';
import { PatrolStatusValues } from './../patrols/patrol.class';
import { HttpService } from '../shared/http.service';
import { PlatformCommand, CommandDefinition, CommandName, ActionScope, ActionStateValue } from './../patrols/action.class';
import { PatrolService } from '../patrols/patrol.service';
import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { UserService } from '../shared/user.service';
import { WindowService } from './../shared/window.service';
import { CommandCollection } from './command-definition-collection.class';
import { PointStatusValues } from '../patrols/point.class';
import { AppSettings } from '../shared/app-settings';
import { HubService, Hubs } from '../shared/hub.service';
import * as moment from 'moment';
var PlatformService = /** @class */ (function () {
    function PlatformService(httpService, patrolService, locationFilterPipe, userService, windowService, appSettings, hubService) {
        var _this = this;
        this.httpService = httpService;
        this.patrolService = patrolService;
        this.locationFilterPipe = locationFilterPipe;
        this.userService = userService;
        this.windowService = windowService;
        this.appSettings = appSettings;
        this.hubService = hubService;
        this.platforms = [];
        this.groupSelection = 'Location';
        this.sortOrder = 'asc';
        this.commandApiBaseUrl = '/commands';
        this.platformsApiBaseUrl = '/platforms';
        this.selectedLocations = [];
        this.platformsLoaded = new Subject();
        this.onNewPlatform = new Subject();
        this.onEditedPlatform = new Subject();
        this.selectionChanged = new Subject();
        this.platformSelected = new Subject();
        this.openPlatformActionMenuSub = new Subject();
        this.closePlatformActionMenuSub = new Subject();
        this.refreshTimerSub = new Subject();
        this.showPlatformCommandDialog = new Subject();
        this.platformCommandDialogClosed = new Subject();
        this.onShowRobotMonitor = new Subject();
        this.onPlatformsLoaded = new Subject();
        this.onConfirmAbortPatrol = new Subject();
        this.showGoToLocationDialog = new Subject();
        this.robotMonitorPlatformId = null;
        this.ngUnsubscribe = new Subject();
        this.hubService.onPlatformHubConnected
            .subscribe({
            next: function () {
                _this.loadPlatforms();
            }
        });
        this.hubService.onPlatformMessage
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (msg) {
                _this.handleMessage(msg);
            }
        });
        //this.simulatePatrolUpdate();
    }
    PlatformService.prototype.loadPlatforms = function () {
        var _this = this;
        this.platforms = [];
        this.httpService.get(this.platformsApiBaseUrl).then(function (platforms) {
            for (var _i = 0, _a = platforms.Result; _i < _a.length; _i++) {
                var platform = _a[_i];
                _this.platforms.push(new Platform(platform));
            }
            console.log('Platforms (' + _this.platforms.length + ')', _this.platforms);
            _this.onPlatformsLoaded.next();
            _this.hubService.setDataLoaded(Hubs.Platform);
        });
    };
    PlatformService.prototype.setSelectedLocations = function (locations) {
        this.selectedLocations = locations;
    };
    PlatformService.prototype.handleMessage = function (message) {
        var index = this.indexOf(message.id);
        if (index !== -1) {
            this.edit(message);
        }
        else {
            console.warn('Message for Invalid Platform (might not be loaded yet)', message.id);
        }
    };
    PlatformService.prototype.getPlatforms = function () {
        var filteredPlatforms = [];
        if (this.platforms) {
            //apply Location Filter
            filteredPlatforms = this.locationFilterPipe.transform(this.platforms, this.selectedLocations);
        }
        return filteredPlatforms;
    };
    PlatformService.prototype.getPatrolName = function (platform) {
        return null;
    };
    PlatformService.prototype.getPlatformPatrolCompletnessColor = function (patrolInstance) {
        return this.patrolService.getPatrolCompletnessColor(patrolInstance);
    };
    PlatformService.prototype.add = function (platform) {
        if (platform.DisplayName) {
            var newPlatform = new Platform(platform);
            this.platforms.push(newPlatform);
            this.onNewPlatform.next(newPlatform);
        }
    };
    PlatformService.prototype.remove = function (id) {
        this.platforms = this.platforms.filter(function (platform) {
            return platform.id !== id;
        });
    };
    PlatformService.prototype.indexOf = function (id) {
        for (var i = 0; i < this.platforms.length; i += 1) {
            if (this.platforms[i]['id'] === id) {
                return i;
            }
        }
        return -1;
    };
    PlatformService.prototype.edit = function (object) {
        var index = this.indexOf(object.id);
        if (index === -1) {
            return;
        }
        var editPlatform = new Platform(object);
        var isOldUpdate = moment(editPlatform.LastPositionUpdate).isBefore(this.platforms[index].LastPositionUpdate);
        if (!editPlatform.LastPositionUpdate || !isOldUpdate) {
            this.platforms[index].deserialize(object);
            this.onEditedPlatform.next(this.platforms[index]);
        }
        if (isOldUpdate) {
            console.info('Threw Out Old Msg:', editPlatform);
        }
    };
    PlatformService.prototype.convertDateDisplay = function (date, dateOnly) {
        var val1 = '', val2 = '';
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
    //Third Line Text
    PlatformService.prototype.getStateText = function (platform) {
        if (!platform.State) {
            return 'Unknown';
        }
        if (platform.SentToPosition && platform.SentToPosition.CurrentStatus === PointStatusValues.InTransit) {
            if (platform.SentToPosition.AlarmIds) {
                return 'Sent to Alarm';
            }
            else {
                return 'Sent to Location';
            }
        }
        switch (platform.State.PlatformMode) {
            case PlatformMode.Unknown:
                return 'Unknown';
            case PlatformMode.Offline:
                return 'Offline';
            case PlatformMode.Inactive:
                return 'Inactive';
            case PlatformMode.Estop:
                return 'E-Stop Enabled';
            case PlatformMode.EstopPhysical:
                return 'E-Stop Enabled in Field';
            case PlatformMode.MandatoryCharge:
                return 'Mandatory Charging';
            case PlatformMode.Docking:
                if (platform.Position.coordinates[0] === 0 && platform.Position.coordinates[1] === 0) {
                    return 'Lost';
                }
                return 'Docking';
            case PlatformMode.Charging:
                if (platform.Position.coordinates[0] === 0 && platform.Position.coordinates[1] === 0) {
                    return 'Lost';
                }
                //return 'Charging' + ((platform.BatteryPercentage) ? ' - ' + Math.round(platform.BatteryPercentage)  + '%' : ''); //We will use this when gamma 2 fixes their bug
                return 'Charging';
            case PlatformMode.Error:
                switch (platform.State.ErrorState) {
                    case ErrorState.Unknown:
                        return 'Unknown Error';
                    case ErrorState.SystemCommunication:
                        return 'System Communication Error';
                    case ErrorState.GatewayCommunication:
                        return 'Gateway Communication Error';
                    case ErrorState.PlatformCommunication:
                        return 'Robot Communication Error';
                    case ErrorState.Lost:
                        return 'Lost';
                    case ErrorState.HardwareSoftware:
                        return 'Hardware/Software Error';
                    case ErrorState.DockingError:
                        return 'Docking Error';
                    case ErrorState.MapConfiguration:
                        return 'Map Configuration Error';
                    case ErrorState.DropoffDetected:
                        return 'Physical Assistance Required';
                }
        }
        if (platform.Position.coordinates[0] === 0 && platform.Position.coordinates[1] === 0) {
            return 'Lost';
        }
        if (platform.BatteryPercentage <= 20.0) {
            return 'Battery Low' + ((platform.BatteryPercentage) ? ' - ' + Math.round(platform.BatteryPercentage) + '%' : '');
        }
        return '';
    };
    PlatformService.prototype.getPlatformIconSrc = function (platform) {
        var manufacturer = this.getPlatformManufacturerName(platform);
        var imgUrlSuffix = '-healthy.png';
        var isPatrolPending = false;
        var patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(platform.id);
        //If pending a patrol
        if (patrolInstance === null && platform.PatrolTemplateSubmittedId) {
            //Check if the platform is in a delay repeat
            var patrol = this.patrolService.getPatrolTemplate(platform.PatrolTemplateSubmittedId);
            if (patrol && patrol.RunSetData && patrol.RunSetData.NextRun) {
                imgUrlSuffix = '-in-between-runs.png';
            }
            else {
                isPatrolPending = true;
            }
        }
        if (!platform.State) {
            imgUrlSuffix = '';
        }
        else {
            switch (platform.State.PlatformMode) {
                case PlatformMode.Unknown:
                case PlatformMode.Offline:
                case PlatformMode.Inactive:
                    imgUrlSuffix = '-unknown-state.png';
                    break;
                case PlatformMode.Error:
                    switch (platform.State.ErrorState) {
                        case ErrorState.Unknown:
                        case ErrorState.SystemCommunication:
                        case ErrorState.HardwareSoftware:
                            imgUrlSuffix = '-degraded.png';
                            break;
                        case ErrorState.GatewayCommunication:
                        case ErrorState.PlatformCommunication:
                            imgUrlSuffix = '-lost-connection.png';
                            break;
                        case ErrorState.Lost:
                            imgUrlSuffix = '-lost.png';
                            break;
                        case ErrorState.DockingError:
                            imgUrlSuffix = '-docking-failure-icon.gif';
                            break;
                        case ErrorState.MapConfiguration:
                            imgUrlSuffix = '-map-config-error.png';
                            break;
                        case ErrorState.DropoffDetected:
                            imgUrlSuffix = '-dropoff-detected.gif';
                            break;
                    }
                    break;
                case PlatformMode.Estop:
                case PlatformMode.EstopPhysical:
                    imgUrlSuffix = '-stop-robot.png';
                    break;
                case PlatformMode.MandatoryCharge:
                    if (!patrolInstance && (platform.SentToPosition === null || platform.SentToPosition.CurrentStatus !== PointStatusValues.InTransit)) {
                        imgUrlSuffix = '-critical-charging.png';
                    }
                    break;
                case PlatformMode.Docking:
                    imgUrlSuffix = '-docking-icon.gif';
                    break;
                case PlatformMode.Charging:
                    if (!patrolInstance && (platform.SentToPosition === null || platform.SentToPosition.CurrentStatus !== PointStatusValues.InTransit)) {
                        imgUrlSuffix = '-battery-charging.png';
                    }
                    break;
            }
            if (platform.Position.coordinates[0] === 0 && platform.Position.coordinates[1] === 0) {
                imgUrlSuffix = '-lost.png';
            }
            if (imgUrlSuffix === '') {
                //Battery low not charging
                if (platform.BatteryPercentage < 10) {
                    imgUrlSuffix = '-battery-empty.png';
                }
                else if (platform.BatteryPercentage < 20) {
                    imgUrlSuffix = '-battery-below-20.png';
                }
            }
        }
        if (imgUrlSuffix === '-healthy.png' && isPatrolPending) {
            return '/Content/Images/Patrols/patrol-pending-large.gif';
        }
        return '/Content/Images/Platforms/' + manufacturer + imgUrlSuffix;
    };
    //Get Background color class
    PlatformService.prototype.getPlatformStatusClass = function (platform, getBorderClass) {
        if (getBorderClass === void 0) { getBorderClass = false; }
        var classType = "";
        if (getBorderClass) {
            classType = '-border';
        }
        if (!platform || !platform.State) {
            return 'platform-disabled' + classType;
        }
        switch (platform.State.PlatformMode) {
            case PlatformMode.Unknown:
            case PlatformMode.Inactive:
            case PlatformMode.Offline:
                return 'platform-disabled' + classType;
            case PlatformMode.Estop:
            case PlatformMode.EstopPhysical:
            case PlatformMode.MandatoryCharge:
                return 'platform-failed' + classType;
            case PlatformMode.Error:
                switch (platform.State.ErrorState) {
                    case ErrorState.Unknown:
                    case ErrorState.SystemCommunication:
                    case ErrorState.HardwareSoftware:
                    case ErrorState.GatewayCommunication:
                    case ErrorState.PlatformCommunication:
                    case ErrorState.Lost:
                    case ErrorState.MapConfiguration:
                    case ErrorState.DropoffDetected:
                        return 'platform-error' + classType;
                }
        }
        if (platform.BatteryPercentage < 10) {
            return 'platform-failed' + classType;
        }
        else if (platform.BatteryPercentage < 20) {
            return 'platform-error' + classType;
        }
        return 'platform-healthy' + classType;
    };
    PlatformService.prototype.getPlatformStatusPriortyMapping = function (platform) {
        switch (this.getPlatformStatusClass(platform)) {
            case 'platform-disabled':
                return 1;
            case 'platform-failed':
                return 2;
            case 'platform-error':
                return 3;
            case 'platform-healthy':
                return 4;
        }
    };
    PlatformService.prototype.getPlatformStatusPriortyName = function (priorty) {
        switch (priorty) {
            case 1:
            case 2:
                return 'failed';
            case 3:
                return 'warning';
            case 4:
                return 'healthy';
        }
    };
    PlatformService.prototype.convertLocationDisplay = function (position) {
        var retVal = 'Unknown';
        if (position) {
            if (position.coordinates) {
                if (position.coordinates.length >= 2) {
                    retVal = position.coordinates['1'] + ', ' + position.coordinates['0'];
                }
            }
        }
        return retVal;
    };
    PlatformService.prototype.convertUsernameToInitials = function (userId) {
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
    PlatformService.prototype.getPlatformCount = function () {
        return this.platforms.length;
    };
    PlatformService.prototype.setExpandedItem = function (id) {
        for (var platform in this.platforms) {
            this.platforms[platform].Expanded = (this.platforms[platform].id === id);
        }
    };
    PlatformService.prototype.selectPlatform = function (id, mapContext, notifySelected) {
        if (mapContext === void 0) { mapContext = false; }
        if (notifySelected === void 0) { notifySelected = true; }
        var index = this.indexOf(id);
        if (index === -1) {
            return;
        }
        this.platforms[index].Selected = true;
        this.appSettings.lastSelectedMarkerRefId = id;
        this.selectionChanged.next(mapContext);
        if (notifySelected) {
            this.platformSelected.next(id);
        }
    };
    PlatformService.prototype.selectOnlyPlatform = function (id, mapContext, notifySelected) {
        if (mapContext === void 0) { mapContext = false; }
        if (notifySelected === void 0) { notifySelected = true; }
        for (var platform in this.platforms) {
            this.platforms[platform].Selected = (this.platforms[platform].id === id);
        }
        this.appSettings.lastSelectedMarkerRefId = id;
        this.selectionChanged.next(mapContext);
        if (notifySelected) {
            this.platformSelected.next(id);
        }
    };
    PlatformService.prototype.deSelectPlatform = function (id, mapContext) {
        if (mapContext === void 0) { mapContext = false; }
        var index = this.indexOf(id);
        if (index === -1) {
            return;
        }
        this.platforms[index].Selected = false;
        this.selectionChanged.next(mapContext);
        this.platformSelected.next();
    };
    PlatformService.prototype.deSelectAllPlatforms = function () {
        for (var platform in this.platforms) {
            this.platforms[platform].Selected = false;
        }
        this.selectionChanged.next();
    };
    PlatformService.prototype.getSelectedPlatform = function () {
        for (var _i = 0, _a = this.platforms; _i < _a.length; _i++) {
            var platform = _a[_i];
            if (platform.Selected) {
                return platform;
            }
        }
        return null;
    };
    PlatformService.prototype.getPlatformManufacturerName = function (platform) {
        switch (platform.Manufacturer) {
            case 'Gamma2':
                return 'gamma2';
            case 'Adept':
                return 'adept';
            case 'Turtlebot':
                return 'turtle-bot';
            default:
                return 'generic';
        }
    };
    PlatformService.prototype.getPlatform = function (platformID) {
        for (var platform in this.platforms) {
            if (this.platforms[platform].id === platformID)
                return this.platforms[platform];
        }
        return null;
    };
    PlatformService.prototype.isPlatformAvailable = function (platform) {
        if (platform.Position.coordinates[0] === 0 && platform.Position.coordinates[1] === 0) {
            return false;
        }
        if (platform.PatrolTemplateSubmittedId) {
            return false;
        }
        var isBusy = !((!platform.SentToPosition || platform.SentToPosition.CurrentStatus !== PointStatusValues.InTransit));
        switch (platform.State.PlatformMode) {
            case PlatformMode.Inactive:
            case PlatformMode.Offline:
            case PlatformMode.Unknown:
            case PlatformMode.Error:
            case PlatformMode.Estop:
            case PlatformMode.EstopPhysical:
            case PlatformMode.MandatoryCharge:
                return false;
            case PlatformMode.Docking:
            case PlatformMode.Charging:
            case PlatformMode.Charged:
            case PlatformMode.Healthy:
            default:
                return (true && !isBusy);
        }
    };
    PlatformService.prototype.getAvailableText = function (platform) {
        if (this.isPlatformAvailable(platform)) {
            return 'Available';
        }
        else {
            return 'Unavailable';
        }
    };
    PlatformService.prototype.getAvailablePlatforms = function (locationID) {
        var platforms = [];
        for (var _i = 0, _a = this.platforms; _i < _a.length; _i++) {
            var platform = _a[_i];
            if (this.isPlatformAvailable(platform) && locationID === platform.LocationId) {
                platforms.push(platform);
            }
        }
        return platforms.sort(this.sortbyDisplayNameAscFunc);
    };
    PlatformService.prototype.sortbyDisplayNameAscFunc = function (a, b) {
        if (a.DisplayName.toLowerCase() < b.DisplayName.toLowerCase())
            return -1;
        if (a.DisplayName.toLowerCase() > b.DisplayName.toLowerCase())
            return 1;
        return 0;
    };
    PlatformService.prototype.getUnavailablePlatforms = function (locationID) {
        var platforms = [];
        for (var _i = 0, _a = this.platforms; _i < _a.length; _i++) {
            var platform = _a[_i];
            if (!this.isPlatformAvailable(platform) && locationID === platform.LocationId) {
                platforms.push(platform);
            }
        }
        return platforms.sort(this.sortbyDisplayNameAscFunc);
    };
    PlatformService.prototype.executePlatformCommandWithDialog = function (commandDef, platform) {
        this.showPlatformCommandDialog.next({ commandDef: commandDef, platform: platform });
    };
    PlatformService.prototype.executePlatformCommand = function (command, tenantId) {
        console.info('Execute Command @' + new Date().toLocaleTimeString(), command);
        var url = this.commandApiBaseUrl + '/execute';
        if (tenantId) {
            url += '?tenantId=' + tenantId;
        }
        this.httpService.post(url, command).then(function (res) {
            if (res) {
                console.info('Execute Command Response', res);
            }
        });
    };
    PlatformService.prototype.handleClick = function (platform) {
        if (platform.Selected) {
            this.deSelectPlatform(platform.id);
        }
        else {
            this.selectOnlyPlatform(platform.id);
        }
    };
    PlatformService.prototype.getPatrolPercentComplete = function (patrol) {
        if (patrol) {
            return Math.floor(this.patrolService.getPatrolCompleteness(patrol));
        }
        else {
            return 0;
        }
    };
    PlatformService.prototype.getPlatformPatrolDisplayName = function (platform) {
        var availableText = (this.isPlatformAvailable(platform)) ? 'Available' : 'Unavailable';
        if (platform.PatrolTemplateSubmittedId) {
            var patrolInstance = this.patrolService.getPatrolInstance(platform.PatrolTemplateSubmittedId);
            if (patrolInstance) {
                return patrolInstance.DisplayName + ' | ' + this.patrolService.getPatrolCompletenessText(patrolInstance) + '% complete';
            }
            else {
                var patrolTemplate = this.patrolService.getPatrolTemplate(platform.PatrolTemplateSubmittedId);
                if (patrolTemplate) {
                    return patrolTemplate.DisplayName + ' | ' + this.patrolService.getPatrolCompletenessText(patrolInstance) + '% complete';
                }
                else {
                    return 'Unknown Patrol';
                }
            }
        }
        else {
            if (platform.LocationId) {
                for (var _i = 0, _a = this.userService.currentUser.childTenants; _i < _a.length; _i++) {
                    var tenant = _a[_i];
                    for (var _b = 0, _c = tenant.Locations; _b < _c.length; _b++) {
                        var location_1 = _c[_b];
                        if (location_1.Id === platform.LocationId) {
                            return availableText + ' | ' + location_1.Name;
                        }
                    }
                }
            }
            return availableText;
        }
    };
    PlatformService.prototype.executeEStop = function (platform) {
        var platformCommand = new PlatformCommand(platform.id, CommandName.EStop, []);
        this.executePlatformCommand(platformCommand);
    };
    PlatformService.prototype.getCommandDefinitions = function (platform) {
        var commandList = [];
        for (var _i = 0, _a = platform.Commands || []; _i < _a.length; _i++) {
            var command = _a[_i];
            if (command.ActionScope !== ActionScope.PatrolAction) {
                commandList.push(command);
            }
        }
        //add robot monitor command
        var monitorCommand = new CommandDefinition();
        monitorCommand.CommandName = null;
        monitorCommand.DisplayName = 'Robot Monitor';
        monitorCommand.Category = 'Video & Controls';
        monitorCommand.IsQuickAction = true;
        commandList.push(monitorCommand);
        return new CommandCollection(commandList);
    };
    PlatformService.prototype.getPlatformState = function (platform, stateValueName) {
        // find the state corresponding to the specified state value name
        var state = platform.State.Values.find(function (element) {
            return element.Name === stateValueName;
        });
        // If a state was found, return its boolean value
        if (state) {
            return state.BooleanValue ? ActionStateValue.On : ActionStateValue.Off;
        }
        else {
            return ActionStateValue.Off;
        }
    };
    PlatformService.prototype.getPlatformCommandState = function (platform, commandName) {
        switch (commandName) {
            case CommandName.Abort: {
                return platform.IsPatrolSubmitted ? ActionStateValue.On : ActionStateValue.Disable;
            }
            case CommandName.PausePatrol: {
                var patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(platform.id);
                var patrolTemplate = this.patrolService.getPatrolTemplate(platform.PatrolTemplateSubmittedId);
                if (!platform.IsPatrolSubmitted) {
                    return ActionStateValue.Disable;
                }
                else if (patrolTemplate && patrolTemplate.RunSetData && patrolTemplate.RunSetData.NextRun) {
                    return ActionStateValue.Disable;
                }
                else if (patrolInstance && patrolInstance.CurrentStatus === PatrolStatusValues.Paused) {
                    return ActionStateValue.Off;
                }
                else {
                    return ActionStateValue.On;
                }
            }
            case CommandName.ResumePatrol: {
                var patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(platform.id);
                return patrolInstance && patrolInstance.CurrentStatus === PatrolStatusValues.Paused ? ActionStateValue.On : ActionStateValue.Off;
            }
            case CommandName.GoToLocation: {
                if (platform.State.PlatformMode === PlatformMode.Estop || platform.State.PlatformMode === PlatformMode.EstopPhysical) {
                    return ActionStateValue.Disable;
                }
                else if (platform.SentToPosition && platform.SentToPosition.CurrentStatus === PointStatusValues.InTransit) {
                    return ActionStateValue.Off;
                }
                else {
                    if (platform.IsPatrolSubmitted || !this.isPlatformAvailable(platform)) {
                        return ActionStateValue.Disable;
                    }
                    else {
                        return ActionStateValue.On;
                    }
                }
            }
            case CommandName.CancelGoal: {
                if (platform.State.PlatformMode === PlatformMode.Estop || platform.State.PlatformMode === PlatformMode.EstopPhysical) {
                    return ActionStateValue.Disable;
                }
                else if (platform.SentToPosition && platform.SentToPosition.CurrentStatus === PointStatusValues.InTransit) {
                    return ActionStateValue.Off;
                }
                else {
                    return ActionStateValue.On;
                }
            }
            case CommandName.OrientPlatform: {
                if (platform.State.PlatformMode === PlatformMode.Estop || platform.State.PlatformMode === PlatformMode.EstopPhysical || !this.isPlatformAvailable(platform)) {
                    return ActionStateValue.Disable;
                }
            }
            case CommandName.GoCharge: {
                if (platform.State.PlatformMode === PlatformMode.Estop || platform.State.PlatformMode === PlatformMode.EstopPhysical || !this.isPlatformAvailable(platform)) {
                    return ActionStateValue.Disable;
                }
            }
            case CommandName.EStopReset: {
                if (platform.State.PlatformMode === PlatformMode.EstopPhysical) {
                    return ActionStateValue.Disable;
                }
            }
            default: {
                // No special logic for the command, so default to true
                return ActionStateValue.On;
            }
        }
    };
    PlatformService.prototype.showRobotMonitor = function (platform) {
        if (platform && this.robotMonitorPlatformId !== platform.id) {
            this.robotMonitorPlatformId = platform.id;
            this.onShowRobotMonitor.next(platform);
        }
        else {
            this.robotMonitorPlatformId = null;
            this.onShowRobotMonitor.next(null);
        }
    };
    PlatformService.prototype.showConfirmAbortPatrol = function (platform) {
        this.onConfirmAbortPatrol.next(platform);
    };
    PlatformService.prototype.hasSensorData = function (platform) {
        for (var _i = 0, _a = platform.Sensors; _i < _a.length; _i++) {
            var sensor = _a[_i];
            if (platform.hasSensorData(sensor)) {
                return true;
            }
        }
        return false;
    };
    PlatformService.prototype.getPlatformBatteryPercentage = function (platform) {
        if (platform) {
            if (platform.BatteryPercentage) {
                var bat = parseInt(platform.BatteryPercentage.toFixed());
                bat = (bat < 0) ? 0 : bat;
                return bat;
            }
        }
        return 0;
    };
    PlatformService.prototype.openPlatformActionMenu = function (platform, event, target, offsetTop, offsetLeft, disableScroll) {
        if (disableScroll === void 0) { disableScroll = true; }
        // If target is specified, the menu will be positioned based upon the target element
        // Otherwise, it will open at the mouse position of the event specified
        this.openPlatformActionMenuSub.next({ platform: platform, event: event, target: target, offsetTop: offsetTop, offsetLeft: offsetLeft, disableScroll: disableScroll });
    };
    PlatformService.prototype.executeCommand = function (platform, command, mapService) {
        if (command.Parameters) {
            this.executePlatformCommandWithDialog(command, platform);
            return;
        }
        switch (command.CommandName) {
            case null:
                if (command.DisplayName === 'Robot Monitor') {
                    this.showRobotMonitor(platform);
                }
                break;
            case CommandName.GoToLocation:
                mapService.setGoToLocationMode(platform, command);
                break;
            case CommandName.VolumeMute:
            case CommandName.VolumeUnmute:
            case CommandName.Volume:
                this.executePlatformCommandWithDialog(command, platform);
                break;
            default:
                var platformCommand = new PlatformCommand(platform.id, command.CommandName, null);
                this.executePlatformCommand(platformCommand);
                break;
        }
    };
    PlatformService.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PlatformService.prototype.simulatePatrolUpdate = function () {
        var _this = this;
        setTimeout(function () {
            _this.patrolService.getPatrolTemplate('a61ba1bb-56e5-4652-a03c-47e8f6950687').RunSetData = {
                CurrentRunNumber: 2,
                RunSetId: "abc",
                TotalRunNumber: 7,
                Delay: 123,
                NextRun: 1499443906239
            };
            _this.handleMessage({
                "DisplayName": "RAMSEE 5",
                "PlatformType": "Ground",
                "Position": {
                    "coordinates": [
                        -105.073282,
                        39.650313
                    ],
                    "type": "Point"
                },
                "Sensors": [
                    {
                        "Type": 1,
                        "Name": "TemperatureSensor",
                        "DisplayName": "Temperature",
                        "Values": [
                            {
                                "Name": "TemperatureSensor",
                                "DisplayName": "Temperature",
                                "BooleanValue": null,
                                "StringValue": null,
                                "IntValue": null,
                                "DoubleValue": null,
                                "ImageValue": null
                            }
                        ]
                    },
                    {
                        "Type": 6,
                        "Name": "HumiditySensor",
                        "DisplayName": "Humidity",
                        "Values": [
                            {
                                "Name": "HumiditySensor",
                                "DisplayName": "Humidity",
                                "BooleanValue": null,
                                "StringValue": null,
                                "IntValue": null,
                                "DoubleValue": null,
                                "ImageValue": null
                            }
                        ]
                    },
                    {
                        "Type": 2,
                        "Name": "GasSensor",
                        "DisplayName": "Gas",
                        "Values": [
                            {
                                "Name": "GasSensor",
                                "DisplayName": "Gas",
                                "BooleanValue": null,
                                "StringValue": null,
                                "IntValue": null,
                                "DoubleValue": null,
                                "ImageValue": null
                            }
                        ]
                    },
                    {
                        "Type": 9,
                        "Name": "FLIRSensor",
                        "DisplayName": "FLIR",
                        "Values": [
                            {
                                "Name": "FLIRSensor",
                                "DisplayName": "High",
                                "BooleanValue": null,
                                "StringValue": null,
                                "IntValue": null,
                                "DoubleValue": null,
                                "ImageValue": null
                            },
                            {
                                "Name": "FLIRSensor",
                                "DisplayName": "Low",
                                "BooleanValue": null,
                                "StringValue": null,
                                "IntValue": null,
                                "DoubleValue": null,
                                "ImageValue": null
                            }
                        ]
                    }
                ],
                "Configuration": null,
                "Commands": [
                    {
                        "CommandName": 0,
                        "DisplayName": "E-Stop",
                        "Description": "Stop Robot",
                        "Category": "Robot Navigation",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 1,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 1,
                        "DisplayName": "E-Stop Reset",
                        "Description": "Release Stop",
                        "Category": "Robot Navigation",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 1,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 24,
                        "DisplayName": "Go to Location",
                        "Description": "Send the robot to a specified map location",
                        "Category": "Robot Navigation",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 1,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 4,
                        "DisplayName": "Go Charge",
                        "Description": "Send robot to its charging station",
                        "Category": "Robot Navigation",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 20,
                        "DisplayName": "Orient",
                        "Description": "Orient the robot",
                        "Category": "Robot Navigation",
                        "Prompt": "Choose which way you want RAMSEE 5  to face.",
                        "Parameters": [
                            {
                                "Name": 2,
                                "DisplayName": "Degrees",
                                "Type": 1,
                                "Prompt": null,
                                "Presets": [
                                    {
                                        "Name": "North",
                                        "DisplayName": "North",
                                        "BooleanValue": null,
                                        "StringValue": "0",
                                        "IntValue": 0,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "South",
                                        "DisplayName": "South",
                                        "BooleanValue": null,
                                        "StringValue": "180",
                                        "IntValue": 180,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "East",
                                        "DisplayName": "East",
                                        "BooleanValue": null,
                                        "StringValue": "90",
                                        "IntValue": 90,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "West",
                                        "DisplayName": "East",
                                        "BooleanValue": null,
                                        "StringValue": "270",
                                        "IntValue": 270,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    }
                                ]
                            }
                        ],
                        "ActionType": 5,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 23,
                        "DisplayName": "Play Audio",
                        "Description": "Play an audio file through the sound system",
                        "Category": "Sounds",
                        "Prompt": "Choose a file",
                        "Parameters": [
                            {
                                "Name": 4,
                                "DisplayName": "Filename",
                                "Type": 0,
                                "Prompt": null,
                                "Presets": [
                                    {
                                        "Name": "bird",
                                        "DisplayName": "bird",
                                        "BooleanValue": null,
                                        "StringValue": "bird",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "caruso",
                                        "DisplayName": "caruso",
                                        "BooleanValue": null,
                                        "StringValue": "caruso",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "cat",
                                        "DisplayName": "cat",
                                        "BooleanValue": null,
                                        "StringValue": "cat",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "chicken",
                                        "DisplayName": "chicken",
                                        "BooleanValue": null,
                                        "StringValue": "chicken",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "crickets",
                                        "DisplayName": "crickets",
                                        "BooleanValue": null,
                                        "StringValue": "crickets",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "dog",
                                        "DisplayName": "dog",
                                        "BooleanValue": null,
                                        "StringValue": "dog",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "dolphin",
                                        "DisplayName": "dolphin",
                                        "BooleanValue": null,
                                        "StringValue": "dolphin",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "easy",
                                        "DisplayName": "easy",
                                        "BooleanValue": null,
                                        "StringValue": "easy",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "frog",
                                        "DisplayName": "frog",
                                        "BooleanValue": null,
                                        "StringValue": "frog",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "goat",
                                        "DisplayName": "goat",
                                        "BooleanValue": null,
                                        "StringValue": "goat",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "gong",
                                        "DisplayName": "gong",
                                        "BooleanValue": null,
                                        "StringValue": "gong",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "peacock",
                                        "DisplayName": "peacock",
                                        "BooleanValue": null,
                                        "StringValue": "peacock",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "tiger",
                                        "DisplayName": "tiger",
                                        "BooleanValue": null,
                                        "StringValue": "tiger",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    }
                                ]
                            }
                        ],
                        "ActionType": 4,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 12,
                        "DisplayName": "Say Message",
                        "Description": "Say a message through the sound system",
                        "Category": "Sounds",
                        "Prompt": "Enter custom message for RAMSEE 5  to say",
                        "Parameters": [
                            {
                                "Name": 0,
                                "DisplayName": "Phrase",
                                "Type": 0,
                                "Prompt": null,
                                "Presets": [
                                    {
                                        "Name": "Hello",
                                        "DisplayName": "Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.",
                                        "BooleanValue": null,
                                        "StringValue": "Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "Selfie",
                                        "DisplayName": "I would love to take a selfie with you. It will only cost 5 dollars. Just kidding. Ha. Ha. Ha.  Please feel free to take my picture as many times as you would like.  Please post one on the Hexagon Facebook page.",
                                        "BooleanValue": null,
                                        "StringValue": "I would love to take a selfie with you. It will only cost 5 dollars. Just kidding. Ha. Ha. Ha.  Please feel free to take my picture as many times as you would like.  Please post one on the Hexagon Facebook page.",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "LasVegas",
                                        "DisplayName": "I have heard what happens in Las Vegas stays in Las Vegas but I am programmed to see and record everything so be good and do not forget to call your mother.",
                                        "BooleanValue": null,
                                        "StringValue": "I have heard what happens in Las Vegas stays in Las Vegas but I am programmed to see and record everything so be good and do not forget to call your mother.",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "SlotMachine",
                                        "DisplayName": "I am very pleased to meet you. I hope you have a great time in Las Vegas. Just so you know, I am a security robot but I also double as a slot machine.  Please put a twenty in my slot and pull my arm.  Thank you for your contribution.",
                                        "BooleanValue": null,
                                        "StringValue": "I am very pleased to meet you. I hope you have a great time in Las Vegas. Just so you know, I am a security robot but I also double as a slot machine.  Please put a twenty in my slot and pull my arm.  Thank you for your contribution.",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "Hide",
                                        "DisplayName": "I am able to sense heat, cold, humidity, and gas. I am also able to see in total darkness so hiding under your bed will not work. I will find you.",
                                        "BooleanValue": null,
                                        "StringValue": "I am able to sense heat, cold, humidity, and gas. I am also able to see in total darkness so hiding under your bed will not work. I will find you.",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "Headlights",
                                        "DisplayName": "I use many different sensors to scan my environment and to communicate. I can see in 360 degrees and even in total darkness. I also have flashers and a siren. How do you like my headlights?",
                                        "BooleanValue": null,
                                        "StringValue": "I use many different sensors to scan my environment and to communicate. I can see in 360 degrees and even in total darkness. I also have flashers and a siren. How do you like my headlights?",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    }
                                ]
                            }
                        ],
                        "ActionType": 3,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 15,
                        "DisplayName": "Siren On",
                        "Description": "Turn siren on",
                        "Category": "Sounds",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 14,
                        "DisplayName": "Siren Off",
                        "Description": "Turn siren off",
                        "Category": "Sounds",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 3,
                        "DisplayName": "Flashers On",
                        "Description": "Turn flashers on",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 2,
                        "DisplayName": "Flashers Off",
                        "Description": "Turn flashers off",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 7,
                        "DisplayName": "Headlights On",
                        "Description": "Turn headlights on",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 6,
                        "DisplayName": "Headlights Off",
                        "Description": "Turn headlights off",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 9,
                        "DisplayName": "I/R Illuminators On",
                        "Description": "Turn I/R Illuminators On",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 8,
                        "DisplayName": "I/R Illuminators Off",
                        "Description": "Turn I/R Illuminators Off",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 10,
                        "DisplayName": "Robot at Charger",
                        "Description": "Sets the robot's position to the charger's location",
                        "Category": "Charger",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 1,
                        "IsQuickAction": false
                    },
                    {
                        "CommandName": 13,
                        "DisplayName": "Set Charger Location",
                        "Description": "Set the robot's charger location",
                        "Category": "Charger",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 1,
                        "IsQuickAction": false
                    },
                    {
                        "CommandName": 19,
                        "DisplayName": "Set Volume Level",
                        "Description": "Set volume level percentage",
                        "Category": "Sounds",
                        "Prompt": "Set the volume level for RAMSEE 5 's audio.",
                        "Parameters": [
                            {
                                "Name": 1,
                                "DisplayName": "Percentage",
                                "Type": 2,
                                "Prompt": null,
                                "Presets": null
                            }
                        ],
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 17,
                        "DisplayName": "Mute Volume",
                        "Description": "Disable sound system",
                        "Category": "Sounds",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 18,
                        "DisplayName": "Unmute Volume",
                        "Description": "Enable sound system",
                        "Category": "Sounds",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    }
                ],
                "Cameras": [
                    {
                        "Username": null,
                        "Password": null,
                        "Port": null,
                        "Ip": null,
                        "Uri": "http://10.8.0.182/jpeg/1/jpeg.php",
                        "Id": null,
                        "DisplayName": "PTZ Camera",
                        "Type": "Gamma2VideoVendor",
                        "IsPTZ": false,
                        "Properties": null
                    },
                    {
                        "Username": null,
                        "Password": null,
                        "Port": null,
                        "Ip": null,
                        "Uri": "http://10.8.0.174/jpeg/1/jpeg.php'",
                        "Id": null,
                        "DisplayName": "Front Camera",
                        "Type": "Gamma2VideoVendor",
                        "IsPTZ": false,
                        "Properties": null
                    },
                    {
                        "Username": null,
                        "Password": null,
                        "Port": null,
                        "Ip": null,
                        "Uri": "http://10.8.0.178/jpeg/1/jpeg.php",
                        "Id": null,
                        "DisplayName": "Back Camera",
                        "Type": "Gamma2VideoVendor",
                        "IsPTZ": false,
                        "Properties": null
                    }
                ],
                "Map": {
                    "Name": null,
                    "ExternalMapId": null,
                    "MapOrigin": {
                        "coordinates": [
                            -105.0731919,
                            39.6502846
                        ],
                        "type": "Point"
                    },
                    "MapRotation": 88,
                    "HomePosition": null,
                    "ChargerPosition": null
                },
                "Manufacturer": "Gamma2",
                "ModelNumber": "MN0005",
                "SerialNumber": "SN0005",
                "IsConnected": true,
                "IsReady": true,
                "IsAvailable": true,
                "IsPatrolSubmitted": true,
                "PatrolTemplateSubmittedId": "a61ba1bb-56e5-4652-a03c-47e8f6950687",
                "BatteryPercentage": 80,
                "Orientation": 179,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                "Version": 0,
                "id": "Gamma2Platform5"
            });
        }, 5000);
        setTimeout(function () {
            _this.handleMessage({
                "DisplayName": "RAMSEE 5",
                "PlatformType": "Ground",
                "Position": {
                    "coordinates": [
                        -105.073282,
                        39.650313
                    ],
                    "type": "Point"
                },
                "Sensors": [
                    {
                        "Type": 1,
                        "Name": "TemperatureSensor",
                        "DisplayName": "Temperature",
                        "Values": [
                            {
                                "Name": "TemperatureSensor",
                                "DisplayName": "Temperature",
                                "BooleanValue": null,
                                "StringValue": null,
                                "IntValue": null,
                                "DoubleValue": null,
                                "ImageValue": null
                            }
                        ]
                    },
                    {
                        "Type": 6,
                        "Name": "HumiditySensor",
                        "DisplayName": "Humidity",
                        "Values": [
                            {
                                "Name": "HumiditySensor",
                                "DisplayName": "Humidity",
                                "BooleanValue": null,
                                "StringValue": null,
                                "IntValue": null,
                                "DoubleValue": null,
                                "ImageValue": null
                            }
                        ]
                    },
                    {
                        "Type": 2,
                        "Name": "GasSensor",
                        "DisplayName": "Gas",
                        "Values": [
                            {
                                "Name": "GasSensor",
                                "DisplayName": "Gas",
                                "BooleanValue": null,
                                "StringValue": null,
                                "IntValue": null,
                                "DoubleValue": null,
                                "ImageValue": null
                            }
                        ]
                    },
                    {
                        "Type": 9,
                        "Name": "FLIRSensor",
                        "DisplayName": "FLIR",
                        "Values": [
                            {
                                "Name": "FLIRSensor",
                                "DisplayName": "High",
                                "BooleanValue": null,
                                "StringValue": null,
                                "IntValue": null,
                                "DoubleValue": null,
                                "ImageValue": null
                            },
                            {
                                "Name": "FLIRSensor",
                                "DisplayName": "Low",
                                "BooleanValue": null,
                                "StringValue": null,
                                "IntValue": null,
                                "DoubleValue": null,
                                "ImageValue": null
                            }
                        ]
                    }
                ],
                "Configuration": null,
                "Commands": [
                    {
                        "CommandName": 0,
                        "DisplayName": "E-Stop",
                        "Description": "Stop Robot",
                        "Category": "Robot Navigation",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 1,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 1,
                        "DisplayName": "E-Stop Reset",
                        "Description": "Release Stop",
                        "Category": "Robot Navigation",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 1,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 24,
                        "DisplayName": "Go to Location",
                        "Description": "Send the robot to a specified map location",
                        "Category": "Robot Navigation",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 1,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 4,
                        "DisplayName": "Go Charge",
                        "Description": "Send robot to its charging station",
                        "Category": "Robot Navigation",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 20,
                        "DisplayName": "Orient",
                        "Description": "Orient the robot",
                        "Category": "Robot Navigation",
                        "Prompt": "Choose which way you want RAMSEE 5  to face.",
                        "Parameters": [
                            {
                                "Name": 2,
                                "DisplayName": "Degrees",
                                "Type": 1,
                                "Prompt": null,
                                "Presets": [
                                    {
                                        "Name": "North",
                                        "DisplayName": "North",
                                        "BooleanValue": null,
                                        "StringValue": "0",
                                        "IntValue": 0,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "South",
                                        "DisplayName": "South",
                                        "BooleanValue": null,
                                        "StringValue": "180",
                                        "IntValue": 180,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "East",
                                        "DisplayName": "East",
                                        "BooleanValue": null,
                                        "StringValue": "90",
                                        "IntValue": 90,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "West",
                                        "DisplayName": "East",
                                        "BooleanValue": null,
                                        "StringValue": "270",
                                        "IntValue": 270,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    }
                                ]
                            }
                        ],
                        "ActionType": 5,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 23,
                        "DisplayName": "Play Audio",
                        "Description": "Play an audio file through the sound system",
                        "Category": "Sounds",
                        "Prompt": "Choose a file",
                        "Parameters": [
                            {
                                "Name": 4,
                                "DisplayName": "Filename",
                                "Type": 0,
                                "Prompt": null,
                                "Presets": [
                                    {
                                        "Name": "bird",
                                        "DisplayName": "bird",
                                        "BooleanValue": null,
                                        "StringValue": "bird",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "caruso",
                                        "DisplayName": "caruso",
                                        "BooleanValue": null,
                                        "StringValue": "caruso",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "cat",
                                        "DisplayName": "cat",
                                        "BooleanValue": null,
                                        "StringValue": "cat",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "chicken",
                                        "DisplayName": "chicken",
                                        "BooleanValue": null,
                                        "StringValue": "chicken",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "crickets",
                                        "DisplayName": "crickets",
                                        "BooleanValue": null,
                                        "StringValue": "crickets",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "dog",
                                        "DisplayName": "dog",
                                        "BooleanValue": null,
                                        "StringValue": "dog",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "dolphin",
                                        "DisplayName": "dolphin",
                                        "BooleanValue": null,
                                        "StringValue": "dolphin",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "easy",
                                        "DisplayName": "easy",
                                        "BooleanValue": null,
                                        "StringValue": "easy",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "frog",
                                        "DisplayName": "frog",
                                        "BooleanValue": null,
                                        "StringValue": "frog",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "goat",
                                        "DisplayName": "goat",
                                        "BooleanValue": null,
                                        "StringValue": "goat",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "gong",
                                        "DisplayName": "gong",
                                        "BooleanValue": null,
                                        "StringValue": "gong",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "peacock",
                                        "DisplayName": "peacock",
                                        "BooleanValue": null,
                                        "StringValue": "peacock",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "tiger",
                                        "DisplayName": "tiger",
                                        "BooleanValue": null,
                                        "StringValue": "tiger",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    }
                                ]
                            }
                        ],
                        "ActionType": 4,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 12,
                        "DisplayName": "Say Message",
                        "Description": "Say a message through the sound system",
                        "Category": "Sounds",
                        "Prompt": "Enter custom message for RAMSEE 5  to say",
                        "Parameters": [
                            {
                                "Name": 0,
                                "DisplayName": "Phrase",
                                "Type": 0,
                                "Prompt": null,
                                "Presets": [
                                    {
                                        "Name": "Hello",
                                        "DisplayName": "Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.",
                                        "BooleanValue": null,
                                        "StringValue": "Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "Selfie",
                                        "DisplayName": "I would love to take a selfie with you. It will only cost 5 dollars. Just kidding. Ha. Ha. Ha.  Please feel free to take my picture as many times as you would like.  Please post one on the Hexagon Facebook page.",
                                        "BooleanValue": null,
                                        "StringValue": "I would love to take a selfie with you. It will only cost 5 dollars. Just kidding. Ha. Ha. Ha.  Please feel free to take my picture as many times as you would like.  Please post one on the Hexagon Facebook page.",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "LasVegas",
                                        "DisplayName": "I have heard what happens in Las Vegas stays in Las Vegas but I am programmed to see and record everything so be good and do not forget to call your mother.",
                                        "BooleanValue": null,
                                        "StringValue": "I have heard what happens in Las Vegas stays in Las Vegas but I am programmed to see and record everything so be good and do not forget to call your mother.",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "SlotMachine",
                                        "DisplayName": "I am very pleased to meet you. I hope you have a great time in Las Vegas. Just so you know, I am a security robot but I also double as a slot machine.  Please put a twenty in my slot and pull my arm.  Thank you for your contribution.",
                                        "BooleanValue": null,
                                        "StringValue": "I am very pleased to meet you. I hope you have a great time in Las Vegas. Just so you know, I am a security robot but I also double as a slot machine.  Please put a twenty in my slot and pull my arm.  Thank you for your contribution.",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "Hide",
                                        "DisplayName": "I am able to sense heat, cold, humidity, and gas. I am also able to see in total darkness so hiding under your bed will not work. I will find you.",
                                        "BooleanValue": null,
                                        "StringValue": "I am able to sense heat, cold, humidity, and gas. I am also able to see in total darkness so hiding under your bed will not work. I will find you.",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "Headlights",
                                        "DisplayName": "I use many different sensors to scan my environment and to communicate. I can see in 360 degrees and even in total darkness. I also have flashers and a siren. How do you like my headlights?",
                                        "BooleanValue": null,
                                        "StringValue": "I use many different sensors to scan my environment and to communicate. I can see in 360 degrees and even in total darkness. I also have flashers and a siren. How do you like my headlights?",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    }
                                ]
                            }
                        ],
                        "ActionType": 3,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 15,
                        "DisplayName": "Siren On",
                        "Description": "Turn siren on",
                        "Category": "Sounds",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 14,
                        "DisplayName": "Siren Off",
                        "Description": "Turn siren off",
                        "Category": "Sounds",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 3,
                        "DisplayName": "Flashers On",
                        "Description": "Turn flashers on",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 2,
                        "DisplayName": "Flashers Off",
                        "Description": "Turn flashers off",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 7,
                        "DisplayName": "Headlights On",
                        "Description": "Turn headlights on",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 6,
                        "DisplayName": "Headlights Off",
                        "Description": "Turn headlights off",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 9,
                        "DisplayName": "I/R Illuminators On",
                        "Description": "Turn I/R Illuminators On",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 8,
                        "DisplayName": "I/R Illuminators Off",
                        "Description": "Turn I/R Illuminators Off",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 10,
                        "DisplayName": "Robot at Charger",
                        "Description": "Sets the robot's position to the charger's location",
                        "Category": "Charger",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 1,
                        "IsQuickAction": false
                    },
                    {
                        "CommandName": 13,
                        "DisplayName": "Set Charger Location",
                        "Description": "Set the robot's charger location",
                        "Category": "Charger",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 1,
                        "IsQuickAction": false
                    },
                    {
                        "CommandName": 19,
                        "DisplayName": "Set Volume Level",
                        "Description": "Set volume level percentage",
                        "Category": "Sounds",
                        "Prompt": "Set the volume level for RAMSEE 5 's audio.",
                        "Parameters": [
                            {
                                "Name": 1,
                                "DisplayName": "Percentage",
                                "Type": 2,
                                "Prompt": null,
                                "Presets": null
                            }
                        ],
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 17,
                        "DisplayName": "Mute Volume",
                        "Description": "Disable sound system",
                        "Category": "Sounds",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 18,
                        "DisplayName": "Unmute Volume",
                        "Description": "Enable sound system",
                        "Category": "Sounds",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    }
                ],
                "Cameras": [
                    {
                        "Username": null,
                        "Password": null,
                        "Port": null,
                        "Ip": null,
                        "Uri": "http://10.8.0.182/jpeg/1/jpeg.php",
                        "Id": null,
                        "DisplayName": "PTZ Camera",
                        "Type": "Gamma2VideoVendor",
                        "IsPTZ": false,
                        "Properties": null
                    },
                    {
                        "Username": null,
                        "Password": null,
                        "Port": null,
                        "Ip": null,
                        "Uri": "http://10.8.0.174/jpeg/1/jpeg.php'",
                        "Id": null,
                        "DisplayName": "Front Camera",
                        "Type": "Gamma2VideoVendor",
                        "IsPTZ": false,
                        "Properties": null
                    },
                    {
                        "Username": null,
                        "Password": null,
                        "Port": null,
                        "Ip": null,
                        "Uri": "http://10.8.0.178/jpeg/1/jpeg.php",
                        "Id": null,
                        "DisplayName": "Back Camera",
                        "Type": "Gamma2VideoVendor",
                        "IsPTZ": false,
                        "Properties": null
                    }
                ],
                "Map": {
                    "Name": null,
                    "ExternalMapId": null,
                    "MapOrigin": {
                        "coordinates": [
                            -105.0731919,
                            39.6502846
                        ],
                        "type": "Point"
                    },
                    "MapRotation": 88,
                    "HomePosition": null,
                    "ChargerPosition": null
                },
                "Manufacturer": "Gamma2",
                "ModelNumber": "MN0005",
                "SerialNumber": "SN0005",
                "IsConnected": true,
                "IsReady": true,
                "IsAvailable": true,
                "IsPatrolSubmitted": true,
                "PatrolTemplateSubmittedId": "a61ba1bb-56e5-4652-a03c-47e8f6950687",
                "BatteryPercentage": -1,
                "Orientation": 179,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                "Version": 0,
                "id": "Gamma2Platform5"
            });
        }, 7000);
        setTimeout(function () {
            _this.handleMessage({
                "DisplayName": "RAMSEE 5",
                "PlatformType": "Ground",
                "Position": {
                    "coordinates": [
                        -105.073282,
                        39.650313
                    ],
                    "type": "Point"
                },
                "Sensors": [
                    {
                        "Type": 1,
                        "Name": "TemperatureSensor",
                        "DisplayName": "Temperature",
                        "Values": [
                            {
                                "Name": "TemperatureSensor",
                                "DisplayName": "Temperature",
                                "BooleanValue": null,
                                "StringValue": null,
                                "IntValue": null,
                                "DoubleValue": null,
                                "ImageValue": null
                            }
                        ]
                    },
                    {
                        "Type": 6,
                        "Name": "HumiditySensor",
                        "DisplayName": "Humidity",
                        "Values": [
                            {
                                "Name": "HumiditySensor",
                                "DisplayName": "Humidity",
                                "BooleanValue": null,
                                "StringValue": null,
                                "IntValue": null,
                                "DoubleValue": null,
                                "ImageValue": null
                            }
                        ]
                    },
                    {
                        "Type": 2,
                        "Name": "GasSensor",
                        "DisplayName": "Gas",
                        "Values": [
                            {
                                "Name": "GasSensor",
                                "DisplayName": "Gas",
                                "BooleanValue": null,
                                "StringValue": null,
                                "IntValue": null,
                                "DoubleValue": null,
                                "ImageValue": null
                            }
                        ]
                    },
                    {
                        "Type": 9,
                        "Name": "FLIRSensor",
                        "DisplayName": "FLIR",
                        "Values": [
                            {
                                "Name": "FLIRSensor",
                                "DisplayName": "High",
                                "BooleanValue": null,
                                "StringValue": null,
                                "IntValue": null,
                                "DoubleValue": null,
                                "ImageValue": null
                            },
                            {
                                "Name": "FLIRSensor",
                                "DisplayName": "Low",
                                "BooleanValue": null,
                                "StringValue": null,
                                "IntValue": null,
                                "DoubleValue": null,
                                "ImageValue": null
                            }
                        ]
                    }
                ],
                "Configuration": null,
                "Commands": [
                    {
                        "CommandName": 0,
                        "DisplayName": "E-Stop",
                        "Description": "Stop Robot",
                        "Category": "Robot Navigation",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 1,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 1,
                        "DisplayName": "E-Stop Reset",
                        "Description": "Release Stop",
                        "Category": "Robot Navigation",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 1,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 24,
                        "DisplayName": "Go to Location",
                        "Description": "Send the robot to a specified map location",
                        "Category": "Robot Navigation",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 1,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 4,
                        "DisplayName": "Go Charge",
                        "Description": "Send robot to its charging station",
                        "Category": "Robot Navigation",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 20,
                        "DisplayName": "Orient",
                        "Description": "Orient the robot",
                        "Category": "Robot Navigation",
                        "Prompt": "Choose which way you want RAMSEE 5  to face.",
                        "Parameters": [
                            {
                                "Name": 2,
                                "DisplayName": "Degrees",
                                "Type": 1,
                                "Prompt": null,
                                "Presets": [
                                    {
                                        "Name": "North",
                                        "DisplayName": "North",
                                        "BooleanValue": null,
                                        "StringValue": "0",
                                        "IntValue": 0,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "South",
                                        "DisplayName": "South",
                                        "BooleanValue": null,
                                        "StringValue": "180",
                                        "IntValue": 180,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "East",
                                        "DisplayName": "East",
                                        "BooleanValue": null,
                                        "StringValue": "90",
                                        "IntValue": 90,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "West",
                                        "DisplayName": "East",
                                        "BooleanValue": null,
                                        "StringValue": "270",
                                        "IntValue": 270,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    }
                                ]
                            }
                        ],
                        "ActionType": 5,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 23,
                        "DisplayName": "Play Audio",
                        "Description": "Play an audio file through the sound system",
                        "Category": "Sounds",
                        "Prompt": "Choose a file",
                        "Parameters": [
                            {
                                "Name": 4,
                                "DisplayName": "Filename",
                                "Type": 0,
                                "Prompt": null,
                                "Presets": [
                                    {
                                        "Name": "bird",
                                        "DisplayName": "bird",
                                        "BooleanValue": null,
                                        "StringValue": "bird",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "caruso",
                                        "DisplayName": "caruso",
                                        "BooleanValue": null,
                                        "StringValue": "caruso",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "cat",
                                        "DisplayName": "cat",
                                        "BooleanValue": null,
                                        "StringValue": "cat",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "chicken",
                                        "DisplayName": "chicken",
                                        "BooleanValue": null,
                                        "StringValue": "chicken",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "crickets",
                                        "DisplayName": "crickets",
                                        "BooleanValue": null,
                                        "StringValue": "crickets",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "dog",
                                        "DisplayName": "dog",
                                        "BooleanValue": null,
                                        "StringValue": "dog",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "dolphin",
                                        "DisplayName": "dolphin",
                                        "BooleanValue": null,
                                        "StringValue": "dolphin",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "easy",
                                        "DisplayName": "easy",
                                        "BooleanValue": null,
                                        "StringValue": "easy",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "frog",
                                        "DisplayName": "frog",
                                        "BooleanValue": null,
                                        "StringValue": "frog",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "goat",
                                        "DisplayName": "goat",
                                        "BooleanValue": null,
                                        "StringValue": "goat",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "gong",
                                        "DisplayName": "gong",
                                        "BooleanValue": null,
                                        "StringValue": "gong",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "peacock",
                                        "DisplayName": "peacock",
                                        "BooleanValue": null,
                                        "StringValue": "peacock",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "tiger",
                                        "DisplayName": "tiger",
                                        "BooleanValue": null,
                                        "StringValue": "tiger",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    }
                                ]
                            }
                        ],
                        "ActionType": 4,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 12,
                        "DisplayName": "Say Message",
                        "Description": "Say a message through the sound system",
                        "Category": "Sounds",
                        "Prompt": "Enter custom message for RAMSEE 5  to say",
                        "Parameters": [
                            {
                                "Name": 0,
                                "DisplayName": "Phrase",
                                "Type": 0,
                                "Prompt": null,
                                "Presets": [
                                    {
                                        "Name": "Hello",
                                        "DisplayName": "Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.",
                                        "BooleanValue": null,
                                        "StringValue": "Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "Selfie",
                                        "DisplayName": "I would love to take a selfie with you. It will only cost 5 dollars. Just kidding. Ha. Ha. Ha.  Please feel free to take my picture as many times as you would like.  Please post one on the Hexagon Facebook page.",
                                        "BooleanValue": null,
                                        "StringValue": "I would love to take a selfie with you. It will only cost 5 dollars. Just kidding. Ha. Ha. Ha.  Please feel free to take my picture as many times as you would like.  Please post one on the Hexagon Facebook page.",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "LasVegas",
                                        "DisplayName": "I have heard what happens in Las Vegas stays in Las Vegas but I am programmed to see and record everything so be good and do not forget to call your mother.",
                                        "BooleanValue": null,
                                        "StringValue": "I have heard what happens in Las Vegas stays in Las Vegas but I am programmed to see and record everything so be good and do not forget to call your mother.",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "SlotMachine",
                                        "DisplayName": "I am very pleased to meet you. I hope you have a great time in Las Vegas. Just so you know, I am a security robot but I also double as a slot machine.  Please put a twenty in my slot and pull my arm.  Thank you for your contribution.",
                                        "BooleanValue": null,
                                        "StringValue": "I am very pleased to meet you. I hope you have a great time in Las Vegas. Just so you know, I am a security robot but I also double as a slot machine.  Please put a twenty in my slot and pull my arm.  Thank you for your contribution.",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "Hide",
                                        "DisplayName": "I am able to sense heat, cold, humidity, and gas. I am also able to see in total darkness so hiding under your bed will not work. I will find you.",
                                        "BooleanValue": null,
                                        "StringValue": "I am able to sense heat, cold, humidity, and gas. I am also able to see in total darkness so hiding under your bed will not work. I will find you.",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    },
                                    {
                                        "Name": "Headlights",
                                        "DisplayName": "I use many different sensors to scan my environment and to communicate. I can see in 360 degrees and even in total darkness. I also have flashers and a siren. How do you like my headlights?",
                                        "BooleanValue": null,
                                        "StringValue": "I use many different sensors to scan my environment and to communicate. I can see in 360 degrees and even in total darkness. I also have flashers and a siren. How do you like my headlights?",
                                        "IntValue": null,
                                        "DoubleValue": null,
                                        "ImageValue": null
                                    }
                                ]
                            }
                        ],
                        "ActionType": 3,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 15,
                        "DisplayName": "Siren On",
                        "Description": "Turn siren on",
                        "Category": "Sounds",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 14,
                        "DisplayName": "Siren Off",
                        "Description": "Turn siren off",
                        "Category": "Sounds",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 3,
                        "DisplayName": "Flashers On",
                        "Description": "Turn flashers on",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 2,
                        "DisplayName": "Flashers Off",
                        "Description": "Turn flashers off",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 7,
                        "DisplayName": "Headlights On",
                        "Description": "Turn headlights on",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 6,
                        "DisplayName": "Headlights Off",
                        "Description": "Turn headlights off",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 9,
                        "DisplayName": "I/R Illuminators On",
                        "Description": "Turn I/R Illuminators On",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 8,
                        "DisplayName": "I/R Illuminators Off",
                        "Description": "Turn I/R Illuminators Off",
                        "Category": "Lights",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 10,
                        "DisplayName": "Robot at Charger",
                        "Description": "Sets the robot's position to the charger's location",
                        "Category": "Charger",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 1,
                        "IsQuickAction": false
                    },
                    {
                        "CommandName": 13,
                        "DisplayName": "Set Charger Location",
                        "Description": "Set the robot's charger location",
                        "Category": "Charger",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 1,
                        "IsQuickAction": false
                    },
                    {
                        "CommandName": 19,
                        "DisplayName": "Set Volume Level",
                        "Description": "Set volume level percentage",
                        "Category": "Sounds",
                        "Prompt": "Set the volume level for RAMSEE 5 's audio.",
                        "Parameters": [
                            {
                                "Name": 1,
                                "DisplayName": "Percentage",
                                "Type": 2,
                                "Prompt": null,
                                "Presets": null
                            }
                        ],
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 17,
                        "DisplayName": "Mute Volume",
                        "Description": "Disable sound system",
                        "Category": "Sounds",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    },
                    {
                        "CommandName": 18,
                        "DisplayName": "Unmute Volume",
                        "Description": "Enable sound system",
                        "Category": "Sounds",
                        "Prompt": null,
                        "Parameters": null,
                        "ActionType": 0,
                        "ActionScope": 0,
                        "IsQuickAction": true
                    }
                ],
                "Cameras": [
                    {
                        "Username": null,
                        "Password": null,
                        "Port": null,
                        "Ip": null,
                        "Uri": "http://10.8.0.182/jpeg/1/jpeg.php",
                        "Id": null,
                        "DisplayName": "PTZ Camera",
                        "Type": "Gamma2VideoVendor",
                        "IsPTZ": false,
                        "Properties": null
                    },
                    {
                        "Username": null,
                        "Password": null,
                        "Port": null,
                        "Ip": null,
                        "Uri": "http://10.8.0.174/jpeg/1/jpeg.php'",
                        "Id": null,
                        "DisplayName": "Front Camera",
                        "Type": "Gamma2VideoVendor",
                        "IsPTZ": false,
                        "Properties": null
                    },
                    {
                        "Username": null,
                        "Password": null,
                        "Port": null,
                        "Ip": null,
                        "Uri": "http://10.8.0.178/jpeg/1/jpeg.php",
                        "Id": null,
                        "DisplayName": "Back Camera",
                        "Type": "Gamma2VideoVendor",
                        "IsPTZ": false,
                        "Properties": null
                    }
                ],
                "Map": {
                    "Name": null,
                    "ExternalMapId": null,
                    "MapOrigin": {
                        "coordinates": [
                            -105.0731919,
                            39.6502846
                        ],
                        "type": "Point"
                    },
                    "MapRotation": 88,
                    "HomePosition": null,
                    "ChargerPosition": null
                },
                "Manufacturer": "Gamma2",
                "ModelNumber": "MN0005",
                "SerialNumber": "SN0005",
                "IsConnected": true,
                "IsReady": true,
                "IsAvailable": true,
                "IsPatrolSubmitted": true,
                "PatrolTemplateSubmittedId": "a61ba1bb-56e5-4652-a03c-47e8f6950687",
                "BatteryPercentage": 14,
                "Orientation": 179,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                "Version": 0,
                "id": "Gamma2Platform5"
            });
        }, 10000);
    };
    PlatformService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [HttpService, PatrolService,
            LocationFilterPipe, UserService,
            WindowService, AppSettings, HubService])
    ], PlatformService);
    return PlatformService;
}());
export { PlatformService };
//# sourceMappingURL=platform.service.js.map