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
import { PatrolTemplate, PatrolInstance, PatrolStatusValues, isPatrolTemplate, isPatrolInstance } from './patrol.class';
import { PointStatusValues } from './point.class';
import { ActionCategory, ActionType, ActionScope, ActionDefinition, ActionStatusValues, CommandName, ParameterDefinition } from './action.class';
import { HttpService } from '../shared/http.service';
import { UserService } from '../shared/user.service';
import { LocationFilterService } from '../shared/location-filter.service';
import { HubService, Hubs } from '../shared/hub.service';
var PatrolService = /** @class */ (function () {
    function PatrolService(httpService, userService, locationFilterService, hubService) {
        var _this = this;
        this.httpService = httpService;
        this.userService = userService;
        this.locationFilterService = locationFilterService;
        this.hubService = hubService;
        this.patrolTemplates = [];
        this.patrolInstances = [];
        this.patrolHistoryMap = new Map();
        this.groupSelection = 'Location';
        this.onExecutePatrolError = new Subject();
        this.onUpsertTemplate = new Subject();
        this.onUpsertInstance = new Subject();
        this.onNewInstance = new Subject();
        this.onPatrolTemplateDeleted = new Subject();
        this.onPatrolSelectionChange = new Subject();
        this.onEditPatrol = new Subject();
        this.onPatrolInstanceComplete = new Subject();
        this.onPatrolActionMenuOpen = new Subject();
        this.onPatrolTemplatesLoaded = new Subject();
        this.onPatrolInstancesLoaded = new Subject();
        this.onScollToPatrol = new Subject();
        this.onUpdateHistoryItem = new Subject();
        this.ngUnsubscribe = new Subject();
        this.patrolApiBaseUrl = '/patrols/';
        this.commandApiBaseUrl = '/commands/';
        this.templatesLoaded = false;
        this.instancesLoaded = false;
        this.loadActionDefinitions();
        this.updateTemplateMap();
        this.updateInstanceTemplateMap();
        this.hubService.onPatrolHubConnected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () {
                _this.loadPatrolTemplates();
                _this.loadPatrolInstances();
            }
        });
        this.hubService.onPatrolMessage
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (msg) {
                _this.handleMessage(msg);
            }
        });
        //this.runFakePatrol(); //DO NOT REMOVE NEEDED WHEN MOCKING DATA DURING DEV
        //this.simulatePatrolSubmitted(); //DO NOT REMOVE NEEDED WHEN MOCKING DATA DURING DEV
    }
    PatrolService.prototype.startEditPatrol = function (patrolTemplateId) {
        this.onEditPatrol.next(patrolTemplateId);
    };
    PatrolService.prototype.getPatrolInstance = function (id) {
        for (var patrol in this.patrolInstances) {
            if (this.patrolInstances[patrol].TemplateId === id) {
                return this.patrolInstances[patrol];
            }
        }
        return null;
    };
    PatrolService.prototype.getPatrolInstanceByPlatformId = function (platformId) {
        for (var patrol in this.patrolInstances) {
            if (this.patrolInstances[patrol].PlatformId === platformId) {
                return this.patrolInstances[patrol];
            }
        }
        return null;
    };
    PatrolService.prototype.getPointInstanceStatusString = function (id) {
        var stringVal = '';
        for (var patrol in this.patrolInstances) {
            if (this.patrolInstances[patrol].TemplateId === id) {
                for (var _i = 0, _a = this.patrolInstances[patrol].Points; _i < _a.length; _i++) {
                    var point = _a[_i];
                    stringVal += point.CurrentStatus.toString();
                }
                break;
            }
        }
        return stringVal;
    };
    PatrolService.prototype.getActionInstanceStatusString = function (id) {
        var stringVal = '';
        for (var patrol in this.patrolInstances) {
            if (this.patrolInstances[patrol].TemplateId === id) {
                for (var _i = 0, _a = this.patrolInstances[patrol].Points; _i < _a.length; _i++) {
                    var point = _a[_i];
                    for (var _b = 0, _c = point.Actions; _b < _c.length; _b++) {
                        var action = _c[_b];
                        stringVal += action.CurrentStatus.toString();
                    }
                    //stringVal += point.CurrentStatus.toString();
                }
                break;
            }
        }
        return stringVal;
    };
    PatrolService.prototype.scollToPatrol = function (id) {
        var _this = this;
        setTimeout(function () { _this.onScollToPatrol.next(id); });
    };
    PatrolService.prototype.toggleSelectedPatrol = function (id, isSelected) {
        //Unselect any selected patrol
        if (this.selectedPatrolTemplatedID) {
            var id_1 = this.selectedPatrolTemplatedID;
            this.selectedPatrolTemplatedID = null;
            this.toggleSelectedPatrol(id_1, false);
        }
        var selectedPatrol = this.patrolTemplates[this.patrolTemplateMap.get(id)];
        if (!selectedPatrol) {
            this.onPatrolSelectionChange.next();
            return;
        }
        selectedPatrol.selected = isSelected;
        if (isSelected) {
            this.selectedPatrolTemplatedID = selectedPatrol.TemplateId;
            this.onPatrolSelectionChange.next(this.selectedPatrolTemplatedID);
        }
        else {
            this.onPatrolSelectionChange.next();
        }
    };
    PatrolService.prototype.toggleExpandedPatrol = function (id, isExpanded) {
        if (this.expandedPatrolTemplatedID) {
            var id_2 = this.expandedPatrolTemplatedID;
            this.expandedPatrolTemplatedID = null;
            this.toggleExpandedPatrol(id_2, false);
        }
        var expandedPatrol = this.patrolTemplates[this.patrolTemplateMap.get(id)];
        if (!expandedPatrol)
            return;
        expandedPatrol.expanded = isExpanded;
        if (isExpanded)
            this.expandedPatrolTemplatedID = expandedPatrol.TemplateId;
    };
    PatrolService.prototype.getCompletedPatrolPoints = function (patrolInstance) {
        if (!patrolInstance)
            return 0;
        var completedPoints = 0;
        for (var _i = 0, _a = patrolInstance.Points; _i < _a.length; _i++) {
            var point = _a[_i];
            if ((point.Actions.length === 0 && point.CurrentStatus !== PointStatusValues.Unknown
                && point.CurrentStatus !== PointStatusValues.InTransit) ||
                this.getPointStatus(point, patrolInstance.Points) === PointStatusValues.ActionsPerformed ||
                point.CurrentStatus === PointStatusValues.NotReached) {
                completedPoints++;
            }
        }
        return completedPoints;
    };
    PatrolService.prototype.getPatrolCompleteness = function (patrolInstance) {
        if (!patrolInstance)
            return 0.0000001;
        var value = this.getCompletedPatrolPoints(patrolInstance) / patrolInstance.Points.length;
        return value === 0.0 ? 0.0000001 : value;
    };
    PatrolService.prototype.getPatrolCompletenessText = function (patrolInstance) {
        return (Math.round(this.getPatrolCompleteness(patrolInstance) * 100).toString());
    };
    PatrolService.prototype.checkCriticalCheckPointErrors = function (points) {
        var checkPointCount = 0;
        var errorCount = 0;
        for (var point in points) {
            if (!points[point].Actions.length) {
                continue;
            }
            checkPointCount += 1;
            if (points[point].CurrentStatus === PointStatusValues.NotReached) {
                errorCount += 1;
            }
            for (var _i = 0, _a = points[point].Actions; _i < _a.length; _i++) {
                var action = _a[_i];
                if (action.CurrentStatus === ActionStatusValues.Failed ||
                    action.CurrentStatus === ActionStatusValues.Unsupported)
                    errorCount += 1;
            }
        }
        if (checkPointCount > 0 && errorCount > 0) {
            return !((errorCount / checkPointCount) >= .5);
        }
        return true;
    };
    PatrolService.prototype.checkPathPointErrors = function (points) {
        for (var point in points) {
            if (points[point].Actions.length) {
                continue;
            }
            if (points[point].CurrentStatus === PointStatusValues.NotReached) {
                return false;
            }
        }
        return true;
    };
    PatrolService.prototype.checkCheckPointErrors = function (points) {
        for (var point in points) {
            if (!points[point].Actions.length) {
                continue;
            }
            if (points[point].CurrentStatus === PointStatusValues.NotReached) {
                return false;
            }
            for (var _i = 0, _a = points[point].Actions; _i < _a.length; _i++) {
                var action = _a[_i];
                if (action.CurrentStatus === ActionStatusValues.Failed ||
                    action.CurrentStatus === ActionStatusValues.Unsupported)
                    return false;
            }
        }
        return true;
    };
    PatrolService.prototype.getPatrolCompletnessColor = function (patrolInstance) {
        if (!patrolInstance)
            return '';
        if (!this.checkCriticalCheckPointErrors(patrolInstance.Points)) {
            return (patrolInstance.CurrentStatus === PatrolStatusValues.Paused) ? '#efa6aa' : '#CB2127';
        }
        if (!this.checkCheckPointErrors(patrolInstance.Points)) {
            return (patrolInstance.CurrentStatus === PatrolStatusValues.Paused) ? '#f0c9ac' : '#D17727';
        }
        if (!this.checkPathPointErrors(patrolInstance.Points)) {
            return (patrolInstance.CurrentStatus === PatrolStatusValues.Paused) ? '#f9dda1' : '#E9AB08';
        }
        return (patrolInstance.CurrentStatus === PatrolStatusValues.Paused) ? '#a2d7b7' : '#249C49';
    };
    PatrolService.prototype.isCheckPoint = function (point) {
        return point.Actions.length > 0;
    };
    PatrolService.prototype.getPointCompletenessColor = function (point) {
        var color = '#249C49';
        for (var _i = 0, _a = point.Actions; _i < _a.length; _i++) {
            var action = _a[_i];
            if (action.CurrentStatus === ActionStatusValues.Failed ||
                action.CurrentStatus === ActionStatusValues.Unsupported) {
                return color = '#E9AB08';
            }
        }
        return color;
    };
    PatrolService.prototype.getPointCompletness = function (point) {
        return point.Actions.filter(function (action) {
            return action.CurrentStatus !== ActionStatusValues.Unknown &&
                action.CurrentStatus !== ActionStatusValues.Started;
        }).length / point.Actions.length;
    };
    PatrolService.prototype.getPointIconSrc = function (point, patrolInstance, isLastPoint) {
        if (isLastPoint === void 0) { isLastPoint = false; }
        var pointCurrentStatus = PointStatusValues.Unknown;
        if (patrolInstance) {
            pointCurrentStatus = this.getPointStatus(point, patrolInstance.Points);
        }
        if (!this.isCheckPoint(point) && point.Ordinal === 1 && pointCurrentStatus !== PointStatusValues.NotReached) {
            return '/Content/Images/Patrols/first-point.png';
        }
        if (!this.isCheckPoint(point) && isLastPoint && pointCurrentStatus !== PointStatusValues.NotReached) {
            return '/Content/Images/Patrols/last-point.png';
        }
        if (!this.isCheckPoint(point) && pointCurrentStatus === PointStatusValues.InTransit) {
            return '/Content/Images/Patrols/patrol-point.png';
        }
        if (pointCurrentStatus === PointStatusValues.InTransit) {
            return '/Content/Images/Patrols/checkpoint-not-yet-arrived.png';
        }
        if (pointCurrentStatus === PointStatusValues.NotReached) {
            if (this.isCheckPoint(point))
                return '/Content/Images/Patrols/checkpoint-patrol-failed.png';
            else
                return '/Content/Images/Patrols/last-patrol-checkpoint-failed.png';
        }
        if (pointCurrentStatus === PointStatusValues.Reached && point.Actions.length)
            return '/Content/Images/Patrols/checkpoint-not-yet-arrived.png';
        for (var actionIndex in point.Actions) {
            if (point.Actions[actionIndex].CurrentStatus === ActionStatusValues.Failed)
                return '/Content/Images/Patrols/checkpoint-patrol-failed.png';
            if (pointCurrentStatus === PointStatusValues.ActionsPerformed && (point.Actions[actionIndex].CurrentStatus === ActionStatusValues.Unknown ||
                point.Actions[actionIndex].CurrentStatus === ActionStatusValues.Unsupported ||
                point.Actions[actionIndex].CurrentStatus === ActionStatusValues.Failed))
                return '/Content/Images/Patrols/checkpoint-patrol-failed.png';
        }
        if (pointCurrentStatus === PointStatusValues.Unknown && point.Actions.length) {
            return '/Content/Images/Patrols/checkpoint-not-yet-arrived.png';
        }
        else if (pointCurrentStatus === PointStatusValues.Unknown) {
            return '/Content/Images/Patrols/patrol-point.png';
        }
        if (pointCurrentStatus === PointStatusValues.Reached && point.Actions.length === 0) {
            return '/Content/Images/Patrols/patrol-point.png';
        }
        return '/Content/Images/Patrols/checkpoint-succesful.png';
    };
    PatrolService.prototype.upsert = function (patrolTemplate) {
        if (this.patrolTemplateMap.has(patrolTemplate.TemplateId)) {
            var currentPatrolTemplate = this.patrolTemplates[this.patrolTemplateMap.get(patrolTemplate.TemplateId)];
            console.info('Upsert Template', currentPatrolTemplate);
            currentPatrolTemplate.deserialize(patrolTemplate);
            currentPatrolTemplate.dirtyToggle = !currentPatrolTemplate.dirtyToggle;
            this.onUpsertTemplate.next(currentPatrolTemplate);
        }
        else {
            patrolTemplate.isPatrolBuilderEdit = true;
            this.patrolTemplates.push(patrolTemplate);
            this.updateTemplateMap();
            this.onUpsertTemplate.next(patrolTemplate);
        }
    };
    PatrolService.prototype.upsertInstance = function (patrolInstance) {
        if (this.patrolInstanceMap.has(patrolInstance.InstanceId)) {
            var currentPatrolInstance = this.patrolInstances[this.patrolInstanceMap.get(patrolInstance.InstanceId)];
            currentPatrolInstance.deserialize(patrolInstance);
            currentPatrolInstance.dirtyToggle = !currentPatrolInstance.dirtyToggle;
        }
        else {
            this.patrolInstances.push(patrolInstance);
            this.updateInstanceTemplateMap();
            this.onNewInstance.next(patrolInstance);
        }
        this.onUpsertInstance.next(this.patrolInstances[this.patrolInstanceMap.get(patrolInstance.InstanceId)]);
    };
    PatrolService.prototype.removeTemplate = function (id) {
        var patrol = this.patrolTemplates[this.patrolTemplateMap.get(id)];
        patrol.IsDeleted = true;
        if (patrol) {
            this.patrolTemplates.splice(this.patrolTemplateMap.get(id), 1);
            this.updateTemplateMap();
        }
        this.onUpsertTemplate.next(patrol);
    };
    PatrolService.prototype.deletePatrolTemplate = function (patrolTemplate) {
        var url = this.patrolApiBaseUrl + 'delete?id=' + patrolTemplate.TemplateId;
        this.httpService.delete(url);
    };
    PatrolService.prototype.getPointStatus = function (point, points) {
        var status = point.CurrentStatus;
        //If not checkpoint return the current status
        if (!this.isCheckPoint(point) || point.CurrentStatus !== PointStatusValues.Reached) {
            return status;
        }
        //If next point has a status then the return actions performed
        if (point.Ordinal < points.length && points[point.Ordinal].CurrentStatus !== PointStatusValues.Unknown) {
            return PointStatusValues.ActionsPerformed;
        }
        //Lets look at all the actions
        var allActionsAttempted = true;
        for (var _i = 0, _a = point.Actions; _i < _a.length; _i++) {
            var action = _a[_i];
            if (action.CurrentStatus === ActionStatusValues.Unknown || action.CurrentStatus === ActionStatusValues.Started) {
                allActionsAttempted = false;
                break;
            }
        }
        if (allActionsAttempted)
            status = PointStatusValues.ActionsPerformed;
        return status;
    };
    PatrolService.prototype.getAvailablePatrols = function (platform) {
        var patrolList = [];
        for (var _i = 0, _a = this.patrolTemplates; _i < _a.length; _i++) {
            var patrol = _a[_i];
            if (patrol.LocationId === platform.LocationId) {
                //check if there is a running instance
                if (!this.patrolTemplateInstanceMap.has(patrol.TemplateId) && !patrol.IsPatrolSubmitted) {
                    patrolList.push(patrol);
                }
            }
        }
        return patrolList.sort(function (a, b) {
            if (a.DisplayName.toLowerCase() < b.DisplayName.toLowerCase())
                return -1;
            if (a.DisplayName.toLowerCase() > b.DisplayName.toLowerCase())
                return 1;
            return 0;
        });
    };
    PatrolService.prototype.sortbyDisplayNameAscFunc = function (a, b) {
        if (a.DisplayName.toLowerCase() < b.DisplayName.toLowerCase())
            return -1;
        if (a.DisplayName.toLowerCase() > b.DisplayName.toLowerCase())
            return 1;
        return 0;
    };
    PatrolService.prototype.sortbyDisplayNameDescFunc = function (a, b) {
        if (a.DisplayName.toLowerCase() < b.DisplayName.toLowerCase())
            return 1;
        if (a.DisplayName.toLowerCase() > b.DisplayName.toLowerCase())
            return -1;
        return 0;
    };
    PatrolService.prototype.executePatrol = function (platformID, patrol) {
        var _this = this;
        var executeCommand = {
            UserName: this.userService.currentUser.name,
            Template: patrol,
            PlatformId: platformID
        };
        var url = this.commandApiBaseUrl + 'execute/patrol';
        this.httpService.post(url, executeCommand).then(function (data) {
            if (data) {
                console.error('Patrol Execution Failed', data);
                _this.onExecutePatrolError.next(data);
            }
        });
    };
    PatrolService.prototype.abortPatrol = function (patrolInstance, patrolTemplateId, platformId) {
        var abortCommand;
        if (patrolInstance) {
            abortCommand = {
                UserName: this.userService.currentUser.name,
                InstanceId: patrolInstance.id,
                TemplateId: patrolInstance.TemplateId,
                PlatformId: patrolInstance.PlatformId
            };
        }
        else {
            abortCommand = {
                UserName: this.userService.currentUser.name,
                InstanceId: null,
                TemplateId: patrolTemplateId,
                PlatformId: platformId
            };
        }
        var url = this.commandApiBaseUrl + 'abort';
        this.httpService.post(url, abortCommand);
        console.info('Patrol abort submitted: ' + url, abortCommand);
    };
    PatrolService.prototype.getPatrolTemplate = function (patrolTemplateID) {
        return this.patrolTemplates[this.patrolTemplateMap.get(patrolTemplateID)];
    };
    PatrolService.prototype.getPatrolHistory = function (patrolTemplateId) {
        var url = this.patrolApiBaseUrl + patrolTemplateId + '/history';
        return this.httpService.get(url);
    };
    PatrolService.prototype.getPatrolHistoryByPlatformId = function (platformId) {
        var url = this.patrolApiBaseUrl + platformId + '/history?byPlatformId=true';
        return this.httpService.get(url);
    };
    PatrolService.prototype.getStatusIconSrc = function (status) {
        switch (status) {
            case PatrolStatusValues.Completed:
                return '/Content/Images/Patrols/last-patrol-successful.png';
            case PatrolStatusValues.Failed:
            case PatrolStatusValues.FailedMostCheckpoints:
                return '/Content/Images/Patrols/last-patrol-critical-failure.png';
            case PatrolStatusValues.Aborted:
            case PatrolStatusValues.PointsNotReached:
                return '/Content/Images/Patrols/last-patrol-checkpoint-failed.png';
            case PatrolStatusValues.Started:
                return '/Content/Images/Patrols/last-patrol-running-no-errors-12.png';
            case PatrolStatusValues.FailedCheckpoints:
                return '/Content/Images/Patrols/last-patrol-failed.png';
            default:
                return '/Content/Images/Patrols/last-patrol-running-no-errors-12.png';
        }
    };
    PatrolService.prototype.isOnPatrol = function (patrolTemplate) {
        var instanceId = this.patrolTemplateInstanceMap.get(patrolTemplate.id);
        if (instanceId || patrolTemplate.IsPatrolSubmitted) {
            return true;
        }
        else {
            return false;
        }
    };
    PatrolService.prototype.loadPatrolTemplates = function () {
        var _this = this;
        this.patrolTemplates = [];
        var url = this.patrolApiBaseUrl + 'templates';
        this.httpService.get(url).then(function (data) {
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var item = data_1[_i];
                _this.patrolTemplates.push(new PatrolTemplate(item));
            }
            _this.updateTemplateMap();
            console.log('Patrol Templates(' + _this.patrolTemplates.length + ')', _this.patrolTemplates);
            _this.onPatrolTemplatesLoaded.next();
            _this.templatesLoaded = true;
            if (_this.templatesLoaded && _this.instancesLoaded) {
                _this.hubService.setDataLoaded(Hubs.Patrol);
            }
        });
    };
    PatrolService.prototype.loadPatrolInstances = function () {
        var _this = this;
        this.patrolInstances = [];
        var url = this.patrolApiBaseUrl + 'active';
        this.httpService.get(url).then(function (data) {
            for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
                var item = data_2[_i];
                _this.patrolInstances.push(new PatrolInstance(item));
            }
            _this.updateInstanceTemplateMap();
            console.log('Active Patrol Instances(' + _this.patrolInstances.length + ')', _this.patrolInstances);
            _this.onPatrolInstancesLoaded.next();
            _this.instancesLoaded = true;
            if (_this.templatesLoaded && _this.instancesLoaded) {
                _this.hubService.setDataLoaded(Hubs.Patrol);
            }
        });
    };
    PatrolService.prototype.getLocationBasedPatrolTemplates = function () {
        var locIds = this.locationFilterService.getSelectedLocationIDs('mapview');
        return this.patrolTemplates.filter(function (template) {
            return locIds.includes(template.LocationId);
        });
    };
    PatrolService.prototype.loadActionDefinitions = function () {
        var _this = this;
        var actCatMap = new Map();
        this.actDefs = [];
        var actDef;
        actDef = { Manufacturer: 'Gamma2', PlatformType: 'Ground', Description: 'Actions for Gamma2 robots', Categories: [] };
        this.actDefs.push(actDef);
        var actCats = actDef.Categories;
        this.httpService.get(this.commandApiBaseUrl).then(function (data) {
            for (var _i = 0, data_3 = data; _i < data_3.length; _i++) {
                var item = data_3[_i];
                if (item.ActionScope === ActionScope.All || item.ActionScope === ActionScope.PatrolAction) {
                    if (item.Category) {
                        var actCat = void 0;
                        if (!actCatMap.has(item.Category)) {
                            actCat = new ActionCategory();
                            actCat.DisplayName = item.Category;
                            actCat.ActionDefinitions = [];
                            actCat.ExpandedState = true;
                            actCat.Description = '';
                            actCats.push(actCat);
                            actCatMap.set(item.Category, actCat);
                        }
                        else
                            actCat = actCatMap.get(item.Category);
                        switch (item.ActionType) {
                            case ActionType.Command: {
                                var cmdType = _this.getCmdType(item);
                                if (cmdType.Type === 'command') {
                                    var cmdActionDef = new ActionDefinition();
                                    cmdActionDef.ActionScope = item.ActionScope;
                                    cmdActionDef.ActionType = item.ActionType;
                                    cmdActionDef.Description = item.Description;
                                    cmdActionDef.DisplayName = item.DisplayName;
                                    cmdActionDef.Command.push(item.CommandName);
                                    cmdActionDef.Prompt = item.Prompt;
                                    cmdActionDef.Selected = false;
                                    cmdActionDef.Parameters = [];
                                    if (item.Parameters) {
                                        var paramDef = new ParameterDefinition();
                                        paramDef.DisplayName = item.Parameters[0].DisplayName;
                                        paramDef.Name = item.Parameters[0].Name;
                                        paramDef.Prompt = item.Parameters[0].Prompt;
                                        paramDef.Type = item.Parameters[0].Type;
                                        paramDef.Presets = [];
                                        cmdActionDef.Parameters.push(paramDef);
                                    }
                                    actCat.ActionDefinitions.push(cmdActionDef);
                                }
                                else if (cmdType.Type === 'toggle') {
                                    var cmdActionDef = _this.getActDef(actCat, cmdType.DisplayName);
                                    cmdActionDef.ActionScope = item.ActionScope;
                                    cmdActionDef.ActionType = ActionType.Toggle;
                                    cmdActionDef.Description = item.Description;
                                    cmdActionDef.Prompt = item.Prompt;
                                    cmdActionDef.Selected = false;
                                    cmdActionDef.Parameters = [];
                                    if (cmdType.OnOff === 'on') {
                                        cmdActionDef.Command[1] = item.CommandName;
                                    }
                                    else {
                                        cmdActionDef.Command[0] = item.CommandName;
                                    }
                                }
                                break;
                            }
                            case ActionType.Orient: {
                                var cmdActionDef = new ActionDefinition();
                                cmdActionDef.ActionScope = item.ActionScope;
                                cmdActionDef.ActionType = item.ActionType;
                                cmdActionDef.Command.push(item.CommandName);
                                cmdActionDef.Description = item.Description;
                                cmdActionDef.DisplayName = item.DisplayName;
                                cmdActionDef.Prompt = item.Prompt;
                                cmdActionDef.Selected = false;
                                cmdActionDef.Parameters = [];
                                var paramDef = new ParameterDefinition();
                                paramDef.DisplayName = item.Parameters[0].DisplayName;
                                paramDef.Name = item.Parameters[0].Name;
                                paramDef.Prompt = item.Parameters[0].Prompt;
                                paramDef.Type = item.Parameters[0].Type;
                                paramDef.Presets = [];
                                for (var ii = 0; item.Parameters[0].Presets && ii < item.Parameters[0].Presets.length; ii++) {
                                    var inputPreset = item.Parameters[0].Presets[ii];
                                    var preset = _this.populatePreset(inputPreset);
                                    paramDef.Presets.push(preset);
                                }
                                cmdActionDef.Parameters.push(paramDef);
                                actCat.ActionDefinitions.push(cmdActionDef);
                                break;
                            }
                            case ActionType.Play: {
                                var cmdActionDef = new ActionDefinition();
                                cmdActionDef.ActionScope = item.ActionScope;
                                cmdActionDef.ActionType = item.ActionType;
                                cmdActionDef.Command.push(item.CommandName);
                                cmdActionDef.Description = item.Description;
                                cmdActionDef.DisplayName = item.DisplayName;
                                cmdActionDef.Prompt = item.Prompt;
                                cmdActionDef.Selected = false;
                                cmdActionDef.Parameters = [];
                                var paramDef = new ParameterDefinition();
                                paramDef.DisplayName = item.Parameters[0].DisplayName;
                                paramDef.Name = item.Parameters[0].Name;
                                paramDef.Prompt = item.Parameters[0].Prompt;
                                paramDef.Type = item.Parameters[0].Type;
                                paramDef.Presets = [];
                                for (var ii = 0; item.Parameters[0].Presets && ii < item.Parameters[0].Presets.length; ii++) {
                                    var inputPreset = item.Parameters[0].Presets[ii];
                                    var preset = _this.populatePreset(inputPreset);
                                    paramDef.Presets.push(preset);
                                }
                                cmdActionDef.Parameters.push(paramDef);
                                actCat.ActionDefinitions.push(cmdActionDef);
                                break;
                            }
                            case ActionType.Say: {
                                var cmdActionDef = new ActionDefinition();
                                cmdActionDef.ActionScope = item.ActionScope;
                                cmdActionDef.ActionType = item.ActionType;
                                cmdActionDef.Command.push(item.CommandName);
                                cmdActionDef.Description = item.Description;
                                cmdActionDef.DisplayName = item.DisplayName;
                                cmdActionDef.Prompt = item.Prompt;
                                cmdActionDef.Selected = false;
                                cmdActionDef.Parameters = [];
                                var paramDef = new ParameterDefinition();
                                paramDef.DisplayName = item.Parameters[0].DisplayName;
                                paramDef.Name = item.Parameters[0].Name;
                                paramDef.Prompt = item.Parameters[0].Prompt;
                                paramDef.Type = item.Parameters[0].Type;
                                paramDef.Presets = [];
                                for (var ii = 0; item.Parameters[0].Presets && ii < item.Parameters[0].Presets.length; ii++) {
                                    var inputPreset = item.Parameters[0].Presets[ii];
                                    var preset = _this.populatePreset(inputPreset);
                                    paramDef.Presets.push(preset);
                                }
                                cmdActionDef.Parameters.push(paramDef);
                                actCat.ActionDefinitions.push(cmdActionDef);
                                break;
                            }
                            case ActionType.Dwell: {
                                var cmdActionDef = new ActionDefinition();
                                cmdActionDef.ActionScope = item.ActionScope;
                                cmdActionDef.ActionType = item.ActionType;
                                cmdActionDef.Command.push(item.CommandName);
                                cmdActionDef.Description = item.Description;
                                cmdActionDef.DisplayName = item.DisplayName;
                                cmdActionDef.Prompt = item.Prompt;
                                cmdActionDef.Selected = false;
                                cmdActionDef.Parameters = [];
                                var paramDef = new ParameterDefinition();
                                paramDef.DisplayName = item.Parameters[0].DisplayName;
                                paramDef.Name = item.Parameters[0].Name;
                                paramDef.Prompt = item.Parameters[0].Prompt;
                                paramDef.Type = item.Parameters[0].Type;
                                paramDef.Presets = [];
                                for (var ii = 0; item.Parameters[0].Presets && ii < item.Parameters[0].Presets.length; ii++) {
                                    var inputPreset = item.Parameters[0].Presets[ii];
                                    var preset = _this.populatePreset(inputPreset);
                                    paramDef.Presets.push(preset);
                                }
                                cmdActionDef.Parameters.push(paramDef);
                                actCat.ActionDefinitions.push(cmdActionDef);
                                break;
                            }
                            default: {
                                console.warn('Unknown action type detected', item.ActionType);
                            }
                        }
                    }
                }
            }
        });
    };
    PatrolService.prototype.getCmdType = function (item) {
        var retStr = { Type: 'command', OnOff: '', DisplayName: item.DisplayName };
        switch (item.CommandName) {
            case CommandName.FlashersOff:
                retStr.Type = 'toggle';
                retStr.OnOff = 'off';
                retStr.DisplayName = 'Flashers';
                break;
            case CommandName.FlashersOn:
                retStr.Type = 'toggle';
                retStr.OnOff = 'on';
                retStr.DisplayName = 'Flashers';
                break;
            case CommandName.HeadlightsOff:
                retStr.Type = 'toggle';
                retStr.OnOff = 'off';
                retStr.DisplayName = 'Headlights';
                break;
            case CommandName.HeadlightsOn:
                retStr.Type = 'toggle';
                retStr.OnOff = 'on';
                retStr.DisplayName = 'Headlights';
                break;
            case CommandName.IrIlluminatorsOff:
                retStr.Type = 'toggle';
                retStr.OnOff = 'off';
                retStr.DisplayName = 'I/R Illuminators';
                break;
            case CommandName.IrIlluminatorsOn:
                retStr.Type = 'toggle';
                retStr.OnOff = 'on';
                retStr.DisplayName = 'I/R Illuminators';
                break;
            case CommandName.SirenOff:
                retStr.Type = 'toggle';
                retStr.OnOff = 'off';
                retStr.DisplayName = 'Siren';
                break;
            case CommandName.SirenOn:
                retStr.Type = 'toggle';
                retStr.OnOff = 'on';
                retStr.DisplayName = 'Siren';
                break;
            case CommandName.VolumeMute:
                retStr.Type = 'toggle';
                retStr.OnOff = 'off';
                retStr.DisplayName = 'Speaker';
                break;
            case CommandName.VolumeUnmute:
                retStr.Type = 'toggle';
                retStr.OnOff = 'on';
                retStr.DisplayName = 'Speaker';
                break;
            case CommandName.Volume:
                retStr.Type = 'command';
                retStr.OnOff = '';
                retStr.DisplayName = 'Set Volume Level';
            default:
                console.warn('Unknown command name detected', item.CommandName);
        }
        return (retStr);
    };
    PatrolService.prototype.getActDef = function (actCat, displayName) {
        var actDef;
        if (!actCat.ActionDefinitions || !actCat.ActionDefinitions.length) {
            actDef = new ActionDefinition();
            actDef.DisplayName = displayName;
            actCat.ActionDefinitions.push(actDef);
        }
        else {
            for (var ii = 0; ii < actCat.ActionDefinitions.length; ii++) {
                if (actCat.ActionDefinitions[ii].DisplayName === displayName) {
                    actDef = actCat.ActionDefinitions[ii];
                    break;
                }
            }
            if (!actDef) {
                actDef = new ActionDefinition();
                actDef.DisplayName = displayName;
                actCat.ActionDefinitions.push(actDef);
            }
        }
        return actDef;
    };
    PatrolService.prototype.populatePreset = function (itemPreset) {
        var preset = {
            Name: itemPreset.Name, DisplayName: itemPreset.DisplayName, BooleanValue: itemPreset.BooleanValue,
            StringValue: itemPreset.StringValue, IntValue: itemPreset.IntValue, DoubleValue: itemPreset.DoubleValue,
            ImageValue: itemPreset.ImageValue, type: null
        };
        return (preset);
    };
    PatrolService.prototype.updateTemplateMap = function () {
        this.patrolTemplateMap = new Map();
        for (var patrol in this.patrolTemplates) {
            this.patrolTemplateMap.set(this.patrolTemplates[patrol].TemplateId, parseInt(patrol));
        }
    };
    PatrolService.prototype.updateInstanceTemplateMap = function () {
        this.patrolInstanceMap = new Map();
        this.patrolTemplateInstanceMap = new Map();
        for (var index in this.patrolInstances) {
            this.patrolInstanceMap.set(this.patrolInstances[index].InstanceId, parseInt(index));
            this.patrolTemplateInstanceMap.set(this.patrolInstances[index].TemplateId, this.patrolInstances[index].InstanceId);
        }
    };
    PatrolService.prototype.getActionDefinition = function (action) {
        var found = false;
        var actDefs = this.getActionDefinitions()[0];
        for (var _i = 0, _a = actDefs.Categories; _i < _a.length; _i++) {
            var actionCat = _a[_i];
            for (var _b = 0, _c = actionCat.ActionDefinitions; _b < _c.length; _b++) {
                var actionDef = _c[_b];
                for (var _d = 0, _e = actionDef.Command; _d < _e.length; _d++) {
                    var command = _e[_d];
                    if (command === action.Command) {
                        found = true;
                        break;
                    }
                }
                if (found)
                    return (actionDef);
            }
        }
        return null;
    };
    PatrolService.prototype.getActionDefinitions = function () {
        return (this.actDefs);
    };
    PatrolService.prototype.handleMessage = function (message) {
        var _this = this;
        if (message.IsDeleted) {
            this.removeTemplate(message.id);
            this.onPatrolTemplateDeleted.next(message.id);
            return;
        }
        if (isPatrolTemplate(message)) {
            var updatedTemplate = new PatrolTemplate(message);
            this.upsert(updatedTemplate);
            return;
        }
        if (isPatrolInstance(message)) {
            var updatedInstance_1 = new PatrolInstance(message);
            //If abort make sure it is not a dup
            if (updatedInstance_1.CurrentStatus === PatrolStatusValues.Aborted) {
                if (!this.patrolInstanceMap.has(updatedInstance_1.InstanceId)) {
                    return;
                }
            }
            if (message.CurrentStatus === PatrolStatusValues.ImageProcessorUpdate) {
                //Update current instance item
                if (this.patrolInstanceMap.has(message.InstanceId)) {
                    var currentPatrolInstance = this.patrolInstances[this.patrolInstanceMap.get(message.InstanceId)];
                    currentPatrolInstance.deserialize(message);
                    currentPatrolInstance.dirtyToggle = !currentPatrolInstance.dirtyToggle;
                    this.upsertInstance(currentPatrolInstance);
                }
                else if (this.patrolHistoryMap.has(message.TemplateId)) {
                    var historyItems = this.patrolHistoryMap.get(message.TemplateId).find(function (element) {
                        return element.InstanceId === message.InstanceId;
                    });
                    if (historyItems) {
                        this.onUpdateHistoryItem.next(historyItems.deserialize(message));
                    }
                }
            }
            else {
                this.upsertInstance(updatedInstance_1);
            }
            if (updatedInstance_1.CurrentStatus === PatrolStatusValues.Aborted ||
                updatedInstance_1.CurrentStatus === PatrolStatusValues.Failed ||
                updatedInstance_1.CurrentStatus === PatrolStatusValues.Completed ||
                updatedInstance_1.CurrentStatus === PatrolStatusValues.FailedCheckpoints ||
                updatedInstance_1.CurrentStatus === PatrolStatusValues.FailedMostCheckpoints ||
                updatedInstance_1.CurrentStatus === PatrolStatusValues.PointsNotReached) {
                //Need to update template with last patrol status
                var updatedTemplate = this.patrolTemplates[this.patrolTemplateMap.get(updatedInstance_1.TemplateId)];
                updatedTemplate.LastPatrolStatus = updatedInstance_1.CurrentStatus;
                this.onUpsertTemplate.next(updatedTemplate);
                //Wait a second then remove it from the instance list
                setTimeout(function () { return _this.completeInstance(updatedInstance_1); }, 1500);
            }
            return;
        }
    };
    PatrolService.prototype.completeInstance = function (patrolInstance) {
        var removedPatrolInstance = this.patrolInstances.splice(this.patrolInstanceMap.get(patrolInstance.InstanceId), 1)[0];
        this.updateInstanceTemplateMap();
        if (removedPatrolInstance) {
            this.onPatrolInstanceComplete.next(removedPatrolInstance);
        }
    };
    PatrolService.prototype.getActionPhraseString = function (action) {
        var actDef = this.getActionDefinition(action);
        var retStr = '';
        if (actDef) {
            switch (actDef.ActionType) {
                case ActionType.Toggle: {
                    if (action.Command === actDef.Command[0])
                        retStr = 'Turn ' + actDef.DisplayName + ' off';
                    else
                        retStr = 'Turn ' + actDef.DisplayName + ' on';
                    break;
                }
                case ActionType.Dwell: {
                    if (action.Parameters && action.Parameters.length > 0) {
                        var res = parseInt(action.Parameters[0].Value);
                        var mins = res / 60;
                        var secs = res % 60;
                        retStr = 'Dwell ' + (secs === 0 ? mins.toString() + ' minutes' : res.toString() + ' seconds');
                    }
                    break;
                }
                case ActionType.Play: {
                    if (action.Parameters && action.Parameters.length > 0) {
                        retStr = 'Play audio file: ' + action.Parameters[0].Value;
                    }
                    break;
                }
                case ActionType.Say: {
                    if (action.Parameters && action.Parameters.length > 0) {
                        retStr = 'Say: "' + action.Parameters[0].Value + '"';
                    }
                    break;
                }
                case ActionType.Orient: {
                    if (action.Parameters && action.Parameters.length > 0) {
                        retStr = 'Orient platform ' + action.Parameters[0].Value.toString() + ' degrees';
                    }
                    break;
                }
                case ActionType.Volume: {
                    if (action.Parameters && action.Parameters.length > 0) {
                        retStr = "Set volume level to " + action.Parameters[0].Value.toString();
                    }
                }
                default: {
                    var actionDef = this.getActionDefinition(action);
                    if (actionDef) {
                        retStr = this.getActionDefinition(action).DisplayName;
                    }
                    else {
                        retStr = 'Unknown Action';
                    }
                }
            }
        }
        else
            retStr = 'No definition for ' + CommandName[action.Command];
        return (retStr);
    };
    PatrolService.prototype.openPatrolActionMenu = function (patrolTemplate, event) {
        this.onPatrolActionMenuOpen.next({ patrolTemplate: patrolTemplate, event: event });
    };
    PatrolService.prototype.getShortStatusText = function (status) {
        switch (status) {
            case PatrolStatusValues.Completed:
                return 'Successful';
            case PatrolStatusValues.Failed:
            case PatrolStatusValues.FailedMostCheckpoints:
                return 'Critical';
            case PatrolStatusValues.Aborted:
            case PatrolStatusValues.PointsNotReached:
                return 'Warning';
            case PatrolStatusValues.FailedCheckpoints:
                return 'Incomplete';
            case PatrolStatusValues.Started:
            case PatrolStatusValues.Paused:
            case PatrolStatusValues.Resumed:
                return 'On Patrol';
            default:
                return '';
        }
    };
    PatrolService.prototype.getLongStatusText = function (status) {
        switch (status) {
            case PatrolStatusValues.Completed:
            case PatrolStatusValues.Started:
                return '';
            case PatrolStatusValues.Failed:
                return '- Failed to Start';
            case PatrolStatusValues.Aborted:
                return '- Aborted';
            case PatrolStatusValues.PointsNotReached:
                return '- Point(s) Not Reached';
            case PatrolStatusValues.FailedMostCheckpoints:
            case PatrolStatusValues.FailedCheckpoints:
                return '- Failed Checkpoint(s)';
            default:
                return 'No Patrol History';
        }
    };
    PatrolService.prototype.getPatrolStatusClass = function (patrolTemplate, patrolInstance) {
        if (patrolTemplate && patrolTemplate.IsPatrolSubmitted && !patrolInstance) {
            return 'availableStatus';
        }
        if (!patrolInstance) {
            return 'availableStatus';
        }
        else {
            if (!this.checkCriticalCheckPointErrors(patrolInstance.Points)) {
                return (patrolInstance.CurrentStatus === PatrolStatusValues.Paused) ? 'failedStatus-paused' : 'failedStatus';
            }
            if (!this.checkCheckPointErrors(patrolInstance.Points)) {
                return (patrolInstance.CurrentStatus === PatrolStatusValues.Paused) ? 'incompleteStatus-paused' : 'incompleteStatus';
            }
            if (!this.checkPathPointErrors(patrolInstance.Points)) {
                return (patrolInstance.CurrentStatus === PatrolStatusValues.Paused) ? 'warningStatus-paused' : 'warningStatus';
            }
            return (patrolInstance.CurrentStatus === PatrolStatusValues.Paused) ? 'healthyStatus-paused' : 'healthyStatus';
        }
    };
    PatrolService.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    //DO NOT REMOVE NEEDED WHEN MOCKING DATA DURING DEV
    PatrolService.prototype.simulatePatrolSubmitted = function () {
        var _this = this;
        setTimeout(function () {
            _this.handleMessage({
                "Points": [
                    {
                        "Actions": [],
                        "PointId": "befaefff-2cc9-455b-87d2-9645943444a4",
                        "DisplayName": "Point 1",
                        "Ordinal": 1,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07331963628532,
                                39.65030313088224
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "Actions": [],
                        "PointId": "61dcf852-463f-4ea6-9376-2eac9dfea186",
                        "DisplayName": "Point 2",
                        "Ordinal": 2,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07321570068599,
                                39.65030235644135
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "Actions": [],
                        "PointId": "def94e5b-ce0b-4426-ad2d-28933584f456",
                        "DisplayName": "Point 3",
                        "Ordinal": 3,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07321570068599,
                                39.6502796395044
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "Actions": [],
                        "PointId": "ab4569e0-81da-419a-ad97-90ed7af13534",
                        "DisplayName": "Point 4",
                        "Ordinal": 4,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07331896573307,
                                39.65028093023964
                            ],
                            "type": "Point"
                        }
                    }
                ],
                "LastPatrolStatus": 0,
                "IsPatrolSubmitted": true,
                "TemplateId": "6cb0eacf-16f8-4a03-8c92-fc3e53b23fb9",
                "DisplayName": "Ryan",
                "Description": null,
                "Type": 0,
                "IsTemplate": true,
                "IsDeleted": false,
                "AreaType": 1,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "c093abb5-58be-410b-80bf-ca7a52e52ac3",
                "Version": 0,
                "id": "6cb0eacf-16f8-4a03-8c92-fc3e53b23fb9",
                "PlatformSubmittedId": "Gamma2Platform4",
                "RunSetData": {
                    "CurrentRunNumber": 2,
                    "RunSetId": "abc",
                    "TotalRunNumber": 7,
                    "Delay": 123,
                    "NextRun": 1499437935952
                }
            });
        }, 10000);
    };
    //DO NOT REMOVE NEEDED WHEN MOCKING DATA DURING DEV
    PatrolService.prototype.runFakePatrol = function () {
        var _this = this;
        setTimeout(function () {
            _this.getPatrolTemplate('a61ba1bb-56e5-4652-a03c-47e8f6950687').PlatformSubmittedId = "Gamma2Platform4";
            _this.handleMessage({
                "RunSetData": {
                    "CurrentRunNumber": 2,
                    "RunSetId": "abc",
                    "TotalRunNumber": 7,
                    "Delay": 123,
                    "NextRun": null
                },
                "InstanceId": "775d9674-6641-48b3-a8a7-9ea3c8d4cf7a",
                "RunNumber": 0,
                "MaxRunNumber": 0,
                "LastUpdateTime": 1498233548339.4153,
                "SubmittedTime": 1498233548339.4153,
                "StartedTime": 0,
                "EndedTime": 0,
                "UserName": "live.com#jeremy.leshko@hexagonsi.com",
                "PlatformId": "Gamma2Platform4",
                "CurrentStatus": PatrolStatusValues.Started,
                "StatusHistory": null,
                "Points": [
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": null,
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "cb888d1a-76cb-4b4e-80e8-7a9c96824cef",
                        "DisplayName": "Point 1",
                        "Ordinal": 1,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07320161908866,
                                39.650304679764034
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "528a693c-9fda-482e-bb53-596d89d44942",
                                "Command": 3,
                                "Parameters": null
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "b3c0d2aa-cce2-4d16-987d-4b7349936676",
                                "Command": 12,
                                "Parameters": [
                                    {
                                        "Name": 0,
                                        "Value": "Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.",
                                        "Type": 0
                                    }
                                ]
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "50875cf9-a2e0-47c1-a5a9-66d3312cab87",
                        "DisplayName": "Checkpoint 1",
                        "Ordinal": 2,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07323648780584,
                                39.65029951682465
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "051eb2e0-7263-4f92-a13b-3767407c4863",
                                "Command": 2,
                                "Parameters": null
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "644677bc-84ce-44d1-9277-e16b53eec678",
                        "DisplayName": "Checkpoint 2",
                        "Ordinal": 3,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07328879088166,
                                39.650288416503656
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "729aa9b5-504e-4055-987f-df3a423370b2",
                                "Command": 26,
                                "Parameters": [
                                    {
                                        "Name": 5,
                                        "Value": "5",
                                        "Type": 0
                                    }
                                ]
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "fb486117-e586-4cf4-9cb0-b4de29fc9eb7",
                                "Command": 20,
                                "Parameters": [
                                    {
                                        "Name": 2,
                                        "Value": "180",
                                        "Type": 1
                                    }
                                ]
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "67626b7a-acaa-4b92-9419-f42e05334303",
                                "Command": 12,
                                "Parameters": [
                                    {
                                        "Name": 0,
                                        "Value": "I am dizzy",
                                        "Type": 0
                                    }
                                ]
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "ec8fe470-815d-4a1f-9ed9-5de72c21f8f3",
                        "DisplayName": "Checkpoint 3",
                        "Ordinal": 4,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07332298904659,
                                39.650291514267835
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "237bb7ee-cbb2-4159-9aad-f29c579a1d1c",
                        "DisplayName": "Point 5",
                        "Ordinal": 5,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07333975285293,
                                39.650304679764034
                            ],
                            "type": "Point"
                        }
                    }
                ],
                "AlarmIds": null,
                "TemplateId": "a61ba1bb-56e5-4652-a03c-47e8f6950687",
                "DisplayName": "NewRPC",
                "Description": null,
                "Type": 0,
                "IsTemplate": false,
                "IsDeleted": false,
                "AreaType": 2,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                "Version": 0,
                "id": "775d9674-6641-48b3-a8a7-9ea3c8d4cf7a"
            });
        }, 5000);
        setTimeout(function () {
            _this.handleMessage({
                "RunSetData": {
                    "CurrentRunNumber": 2,
                    "RunSetId": "abc",
                    "TotalRunNumber": 7,
                    "Delay": 123,
                    "NextRun": null
                },
                "InstanceId": "775d9674-6641-48b3-a8a7-9ea3c8d4cf7a",
                "RunNumber": 0,
                "MaxRunNumber": 0,
                "LastUpdateTime": 1498233548339.4153,
                "SubmittedTime": 1498233548339.4153,
                "StartedTime": 0,
                "EndedTime": 0,
                "UserName": "live.com#jeremy.leshko@hexagonsi.com",
                "PlatformId": "Gamma2Platform4",
                "CurrentStatus": PatrolStatusValues.Started,
                "StatusHistory": null,
                "Points": [
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": null,
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "cb888d1a-76cb-4b4e-80e8-7a9c96824cef",
                        "DisplayName": "Point 1",
                        "Ordinal": 1,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07320161908866,
                                39.650304679764034
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 2,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "528a693c-9fda-482e-bb53-596d89d44942",
                                "Command": 3,
                                "Parameters": null
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "b3c0d2aa-cce2-4d16-987d-4b7349936676",
                                "Command": 12,
                                "Parameters": [
                                    {
                                        "Name": 0,
                                        "Value": "Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.",
                                        "Type": 0
                                    }
                                ]
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "50875cf9-a2e0-47c1-a5a9-66d3312cab87",
                        "DisplayName": "Checkpoint 1",
                        "Ordinal": 2,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07323648780584,
                                39.65029951682465
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "051eb2e0-7263-4f92-a13b-3767407c4863",
                                "Command": 2,
                                "Parameters": null
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "644677bc-84ce-44d1-9277-e16b53eec678",
                        "DisplayName": "Checkpoint 2",
                        "Ordinal": 3,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07328879088166,
                                39.650288416503656
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "729aa9b5-504e-4055-987f-df3a423370b2",
                                "Command": 26,
                                "Parameters": [
                                    {
                                        "Name": 5,
                                        "Value": "5",
                                        "Type": 0
                                    }
                                ]
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "fb486117-e586-4cf4-9cb0-b4de29fc9eb7",
                                "Command": 20,
                                "Parameters": [
                                    {
                                        "Name": 2,
                                        "Value": "180",
                                        "Type": 1
                                    }
                                ]
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "67626b7a-acaa-4b92-9419-f42e05334303",
                                "Command": 12,
                                "Parameters": [
                                    {
                                        "Name": 0,
                                        "Value": "I am dizzy",
                                        "Type": 0
                                    }
                                ]
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "ec8fe470-815d-4a1f-9ed9-5de72c21f8f3",
                        "DisplayName": "Checkpoint 3",
                        "Ordinal": 4,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07332298904659,
                                39.650291514267835
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "237bb7ee-cbb2-4159-9aad-f29c579a1d1c",
                        "DisplayName": "Point 5",
                        "Ordinal": 5,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07333975285293,
                                39.650304679764034
                            ],
                            "type": "Point"
                        }
                    }
                ],
                "AlarmIds": null,
                "TemplateId": "a61ba1bb-56e5-4652-a03c-47e8f6950687",
                "DisplayName": "NewRPC",
                "Description": null,
                "Type": 0,
                "IsTemplate": false,
                "IsDeleted": false,
                "AreaType": 2,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                "Version": 0,
                "id": "775d9674-6641-48b3-a8a7-9ea3c8d4cf7a"
            });
        }, 7000);
        setTimeout(function () {
            _this.handleMessage({
                "RunSetData": {
                    "CurrentRunNumber": 2,
                    "RunSetId": "abc",
                    "TotalRunNumber": 7,
                    "Delay": 123,
                    "NextRun": null
                },
                "InstanceId": "775d9674-6641-48b3-a8a7-9ea3c8d4cf7a",
                "RunNumber": 0,
                "MaxRunNumber": 0,
                "LastUpdateTime": 1498233548339.4153,
                "SubmittedTime": 1498233548339.4153,
                "StartedTime": 0,
                "EndedTime": 0,
                "UserName": "live.com#jeremy.leshko@hexagonsi.com",
                "PlatformId": "Gamma2Platform4",
                "CurrentStatus": PatrolStatusValues.Started,
                "StatusHistory": null,
                "Points": [
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": null,
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "cb888d1a-76cb-4b4e-80e8-7a9c96824cef",
                        "DisplayName": "Point 1",
                        "Ordinal": 1,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07320161908866,
                                39.650304679764034
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 2,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "528a693c-9fda-482e-bb53-596d89d44942",
                                "Command": 3,
                                "Parameters": null
                            },
                            {
                                "CurrentStatus": 2,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "b3c0d2aa-cce2-4d16-987d-4b7349936676",
                                "Command": 12,
                                "Parameters": [
                                    {
                                        "Name": 0,
                                        "Value": "Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.",
                                        "Type": 0
                                    }
                                ]
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "50875cf9-a2e0-47c1-a5a9-66d3312cab87",
                        "DisplayName": "Checkpoint 1",
                        "Ordinal": 2,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07323648780584,
                                39.65029951682465
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "051eb2e0-7263-4f92-a13b-3767407c4863",
                                "Command": 2,
                                "Parameters": null
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "644677bc-84ce-44d1-9277-e16b53eec678",
                        "DisplayName": "Checkpoint 2",
                        "Ordinal": 3,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07328879088166,
                                39.650288416503656
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "729aa9b5-504e-4055-987f-df3a423370b2",
                                "Command": 26,
                                "Parameters": [
                                    {
                                        "Name": 5,
                                        "Value": "5",
                                        "Type": 0
                                    }
                                ]
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "fb486117-e586-4cf4-9cb0-b4de29fc9eb7",
                                "Command": 20,
                                "Parameters": [
                                    {
                                        "Name": 2,
                                        "Value": "180",
                                        "Type": 1
                                    }
                                ]
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "67626b7a-acaa-4b92-9419-f42e05334303",
                                "Command": 12,
                                "Parameters": [
                                    {
                                        "Name": 0,
                                        "Value": "I am dizzy",
                                        "Type": 0
                                    }
                                ]
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "ec8fe470-815d-4a1f-9ed9-5de72c21f8f3",
                        "DisplayName": "Checkpoint 3",
                        "Ordinal": 4,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07332298904659,
                                39.650291514267835
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "237bb7ee-cbb2-4159-9aad-f29c579a1d1c",
                        "DisplayName": "Point 5",
                        "Ordinal": 5,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07333975285293,
                                39.650304679764034
                            ],
                            "type": "Point"
                        }
                    }
                ],
                "AlarmIds": null,
                "TemplateId": "a61ba1bb-56e5-4652-a03c-47e8f6950687",
                "DisplayName": "NewRPC",
                "Description": null,
                "Type": 0,
                "IsTemplate": false,
                "IsDeleted": false,
                "AreaType": 2,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                "Version": 0,
                "id": "775d9674-6641-48b3-a8a7-9ea3c8d4cf7a"
            });
        }, 10000);
        setTimeout(function () {
            _this.handleMessage({
                "RunSetData": {
                    "CurrentRunNumber": 2,
                    "RunSetId": "abc",
                    "TotalRunNumber": 7,
                    "Delay": 123,
                    "NextRun": null
                },
                "InstanceId": "775d9674-6641-48b3-a8a7-9ea3c8d4cf7a",
                "RunNumber": 0,
                "MaxRunNumber": 0,
                "LastUpdateTime": 1498233548339.4153,
                "SubmittedTime": 1498233548339.4153,
                "StartedTime": 0,
                "EndedTime": 0,
                "UserName": "live.com#jeremy.leshko@hexagonsi.com",
                "PlatformId": "Gamma2Platform4",
                "CurrentStatus": PatrolStatusValues.Started,
                "StatusHistory": null,
                "Points": [
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": null,
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "cb888d1a-76cb-4b4e-80e8-7a9c96824cef",
                        "DisplayName": "Point 1",
                        "Ordinal": 1,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07320161908866,
                                39.650304679764034
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 2,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "528a693c-9fda-482e-bb53-596d89d44942",
                                "Command": 3,
                                "Parameters": null
                            },
                            {
                                "CurrentStatus": 2,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "b3c0d2aa-cce2-4d16-987d-4b7349936676",
                                "Command": 12,
                                "Parameters": [
                                    {
                                        "Name": 0,
                                        "Value": "Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.",
                                        "Type": 0
                                    }
                                ]
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "50875cf9-a2e0-47c1-a5a9-66d3312cab87",
                        "DisplayName": "Checkpoint 1",
                        "Ordinal": 2,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07323648780584,
                                39.65029951682465
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 1,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 1,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "051eb2e0-7263-4f92-a13b-3767407c4863",
                                "Command": 2,
                                "Parameters": null
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "644677bc-84ce-44d1-9277-e16b53eec678",
                        "DisplayName": "Checkpoint 2",
                        "Ordinal": 3,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07328879088166,
                                39.650288416503656
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "729aa9b5-504e-4055-987f-df3a423370b2",
                                "Command": 26,
                                "Parameters": [
                                    {
                                        "Name": 5,
                                        "Value": "5",
                                        "Type": 0
                                    }
                                ]
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "fb486117-e586-4cf4-9cb0-b4de29fc9eb7",
                                "Command": 20,
                                "Parameters": [
                                    {
                                        "Name": 2,
                                        "Value": "180",
                                        "Type": 1
                                    }
                                ]
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "67626b7a-acaa-4b92-9419-f42e05334303",
                                "Command": 12,
                                "Parameters": [
                                    {
                                        "Name": 0,
                                        "Value": "I am dizzy",
                                        "Type": 0
                                    }
                                ]
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "ec8fe470-815d-4a1f-9ed9-5de72c21f8f3",
                        "DisplayName": "Checkpoint 3",
                        "Ordinal": 4,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07332298904659,
                                39.650291514267835
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "237bb7ee-cbb2-4159-9aad-f29c579a1d1c",
                        "DisplayName": "Point 5",
                        "Ordinal": 5,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07333975285293,
                                39.650304679764034
                            ],
                            "type": "Point"
                        }
                    }
                ],
                "AlarmIds": null,
                "TemplateId": "a61ba1bb-56e5-4652-a03c-47e8f6950687",
                "DisplayName": "NewRPC",
                "Description": null,
                "Type": 0,
                "IsTemplate": false,
                "IsDeleted": false,
                "AreaType": 2,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                "Version": 0,
                "id": "775d9674-6641-48b3-a8a7-9ea3c8d4cf7a"
            });
        }, 13000);
        setTimeout(function () {
            _this.handleMessage({
                "RunSetData": {
                    "CurrentRunNumber": 2,
                    "RunSetId": "abc",
                    "TotalRunNumber": 7,
                    "Delay": 123,
                    "NextRun": null
                },
                "InstanceId": "775d9674-6641-48b3-a8a7-9ea3c8d4cf7a",
                "RunNumber": 0,
                "MaxRunNumber": 0,
                "LastUpdateTime": 1498233548339.4153,
                "SubmittedTime": 1498233548339.4153,
                "StartedTime": 0,
                "EndedTime": 0,
                "UserName": "live.com#jeremy.leshko@hexagonsi.com",
                "PlatformId": "Gamma2Platform4",
                "CurrentStatus": PatrolStatusValues.Paused,
                "StatusHistory": null,
                "Points": [
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": null,
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "cb888d1a-76cb-4b4e-80e8-7a9c96824cef",
                        "DisplayName": "Point 1",
                        "Ordinal": 1,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07320161908866,
                                39.650304679764034
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 2,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "528a693c-9fda-482e-bb53-596d89d44942",
                                "Command": 3,
                                "Parameters": null
                            },
                            {
                                "CurrentStatus": 2,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "b3c0d2aa-cce2-4d16-987d-4b7349936676",
                                "Command": 12,
                                "Parameters": [
                                    {
                                        "Name": 0,
                                        "Value": "Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.",
                                        "Type": 0
                                    }
                                ]
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "50875cf9-a2e0-47c1-a5a9-66d3312cab87",
                        "DisplayName": "Checkpoint 1",
                        "Ordinal": 2,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07323648780584,
                                39.65029951682465
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 1,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "051eb2e0-7263-4f92-a13b-3767407c4863",
                                "Command": 2,
                                "Parameters": null
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "644677bc-84ce-44d1-9277-e16b53eec678",
                        "DisplayName": "Checkpoint 2",
                        "Ordinal": 3,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07328879088166,
                                39.650288416503656
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "729aa9b5-504e-4055-987f-df3a423370b2",
                                "Command": 26,
                                "Parameters": [
                                    {
                                        "Name": 5,
                                        "Value": "5",
                                        "Type": 0
                                    }
                                ]
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "fb486117-e586-4cf4-9cb0-b4de29fc9eb7",
                                "Command": 20,
                                "Parameters": [
                                    {
                                        "Name": 2,
                                        "Value": "180",
                                        "Type": 1
                                    }
                                ]
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "67626b7a-acaa-4b92-9419-f42e05334303",
                                "Command": 12,
                                "Parameters": [
                                    {
                                        "Name": 0,
                                        "Value": "I am dizzy",
                                        "Type": 0
                                    }
                                ]
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "ec8fe470-815d-4a1f-9ed9-5de72c21f8f3",
                        "DisplayName": "Checkpoint 3",
                        "Ordinal": 4,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07332298904659,
                                39.650291514267835
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "237bb7ee-cbb2-4159-9aad-f29c579a1d1c",
                        "DisplayName": "Point 5",
                        "Ordinal": 5,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07333975285293,
                                39.650304679764034
                            ],
                            "type": "Point"
                        }
                    }
                ],
                "AlarmIds": null,
                "TemplateId": "a61ba1bb-56e5-4652-a03c-47e8f6950687",
                "DisplayName": "NewRPC",
                "Description": null,
                "Type": 0,
                "IsTemplate": false,
                "IsDeleted": false,
                "AreaType": 2,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                "Version": 0,
                "id": "775d9674-6641-48b3-a8a7-9ea3c8d4cf7a"
            });
        }, 16000);
    };
    PatrolService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [HttpService,
            UserService,
            LocationFilterService,
            HubService])
    ], PatrolService);
    return PatrolService;
}());
export { PatrolService };
//# sourceMappingURL=patrol.service.js.map