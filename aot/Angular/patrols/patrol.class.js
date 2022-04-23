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
import { PointTemplate, PointInstance } from './point.class';
export var AreaType;
(function (AreaType) {
    AreaType[AreaType["Large"] = 0] = "Large";
    AreaType[AreaType["Small"] = 1] = "Small";
    AreaType[AreaType["Perimeter"] = 2] = "Perimeter";
})(AreaType || (AreaType = {}));
;
export var PatrolType;
(function (PatrolType) {
    PatrolType[PatrolType["Ground"] = 0] = "Ground";
    PatrolType[PatrolType["Air"] = 1] = "Air";
})(PatrolType || (PatrolType = {}));
export var PatrolStatusValues;
(function (PatrolStatusValues) {
    PatrolStatusValues[PatrolStatusValues["Unknown"] = 0] = "Unknown";
    PatrolStatusValues[PatrolStatusValues["Started"] = 1] = "Started";
    PatrolStatusValues[PatrolStatusValues["Completed"] = 2] = "Completed";
    PatrolStatusValues[PatrolStatusValues["Failed"] = 3] = "Failed";
    PatrolStatusValues[PatrolStatusValues["Paused"] = 4] = "Paused";
    PatrolStatusValues[PatrolStatusValues["Resumed"] = 5] = "Resumed";
    PatrolStatusValues[PatrolStatusValues["Aborted"] = 6] = "Aborted";
    PatrolStatusValues[PatrolStatusValues["PointsNotReached"] = 7] = "PointsNotReached";
    PatrolStatusValues[PatrolStatusValues["FailedCheckpoints"] = 8] = "FailedCheckpoints";
    PatrolStatusValues[PatrolStatusValues["ImageProcessorUpdate"] = 9] = "ImageProcessorUpdate";
    PatrolStatusValues[PatrolStatusValues["FailedMostCheckpoints"] = 10] = "FailedMostCheckpoints";
})(PatrolStatusValues || (PatrolStatusValues = {}));
var PatrolBase = /** @class */ (function () {
    function PatrolBase(patrolbase) {
        this.Type = PatrolType.Ground;
        this.IsTemplate = true;
        this.selected = false;
        this.expanded = false;
        this.dirtyToggle = false;
        if (patrolbase !== null)
            this.deserialize(patrolbase);
    }
    PatrolBase.prototype.deserialize = function (input) {
        this.AreaType = input.AreaType;
        this.TemplateId = input.TemplateId;
        this.DisplayName = input.DisplayName;
        this.Description = input.Description;
        this.Type = input.Type;
        this.IsTemplate = input.IsTemplate;
        this.id = input.id;
        this.TemplateId = input.TemplateId ? input.TemplateId : null;
        this.LocationId = input.LocationId ? input.LocationId : null;
        this.Version = input.Version ? input.Version : 0;
        this.IsDeleted = input.IsDeleted;
        this.TenantId = input.TenantId;
        this.RunSetData = input.RunSetData;
        this.UserName = input.UserName;
        this.LastUpdateTime = input.LastUpdateTime;
        return this;
    };
    return PatrolBase;
}());
export { PatrolBase };
//Type Guard
export function isPatrolTemplate(arg) {
    return arg.IsTemplate === true;
}
var PatrolTemplate = /** @class */ (function (_super) {
    __extends(PatrolTemplate, _super);
    function PatrolTemplate(patrol) {
        var _this = _super.call(this, null) || this;
        _this.Points = [];
        _this.isPatrolBuilderEdit = false;
        if (patrol !== null) {
            _this.deserialize(patrol);
        }
        return _this;
    }
    PatrolTemplate.prototype.deserialize = function (input) {
        _super.prototype.deserialize.call(this, input);
        this.LastPatrolStatus = input.LastPatrolStatus;
        this.IsPatrolSubmitted = (input.PlatformSubmittedId) ? true : false;
        this.PlatformSubmittedId = input.PlatformSubmittedId;
        if (!this.Points) {
            this.Points = [];
        }
        if (!input.Points || input.Points.length === 0) {
            this.Points = [];
        }
        else {
            //Create lookups
            var pointLookup = new Map();
            for (var lookupPoint in this.Points) {
                pointLookup.set(this.Points[lookupPoint].PointId, parseInt(lookupPoint));
            }
            if (this.Points.length === 0) {
                for (var _i = 0, _a = input.Points; _i < _a.length; _i++) {
                    var point = _a[_i];
                    this.Points.push(new PointTemplate(point));
                }
            }
            else {
                // First update all the existing points and add new ones.
                var offset = 0;
                for (var _b = 0, _c = input.Points; _b < _c.length; _b++) {
                    var point = _c[_b];
                    if (pointLookup.has(point.PointId)) {
                        this.Points[pointLookup.get(point.PointId) + offset].deserialize(point);
                    }
                    else {
                        if (point.Ordinal === 1) {
                            this.Points.unshift(point);
                            offset++;
                        }
                        else if (point.Ordinal > this.Points.length) {
                            this.Points.push(new PointTemplate(point));
                        }
                        else {
                            this.Points.splice((point.Ordinal - 1), 0, point);
                            offset++;
                        }
                    }
                }
                // Now check for deletes 
                pointLookup.clear();
                for (var lookupPoint in input.Points) {
                    pointLookup.set(input.Points[lookupPoint].PointId, parseInt(lookupPoint));
                }
                var ii = this.Points.length - 1;
                while (ii > -1) {
                    var point = this.Points[ii];
                    if (!pointLookup.has(point.PointId)) {
                        this.Points.splice(ii, 1);
                    }
                    ii--;
                }
            }
        }
        return this;
    };
    return PatrolTemplate;
}(PatrolBase));
export { PatrolTemplate };
//Type Guard
export function isPatrolInstance(arg) {
    return arg.IsTemplate === false;
}
var PatrolInstance = /** @class */ (function (_super) {
    __extends(PatrolInstance, _super);
    function PatrolInstance(patrol) {
        var _this = _super.call(this, null) || this;
        if (patrol) {
            _this.deserialize(patrol);
        }
        return _this;
    }
    PatrolInstance.prototype.deserialize = function (input) {
        if (input.CurrentStatus === PatrolStatusValues.ImageProcessorUpdate) {
            this.InstanceId = input.InstanceId;
            this.TemplateId = input.TemplateId;
            if (!this.Points) {
                this.Points = [];
            }
            //Create lookup
            var pointLookup_1 = new Map();
            for (var lookupPoint in this.Points) {
                pointLookup_1.set(this.Points[lookupPoint].PointId, parseInt(lookupPoint));
            }
            for (var _i = 0, _a = input.Points; _i < _a.length; _i++) {
                var point = _a[_i];
                if (pointLookup_1.has(point.PointId)) {
                    this.Points[pointLookup_1.get(point.PointId)].deserialize(point);
                }
                else {
                    this.Points.push(new PointInstance(point));
                }
            }
            return this;
        }
        _super.prototype.deserialize.call(this, input);
        this.InstanceId = input.InstanceId;
        this.SubmittedTime = input.SubmittedTime;
        this.StartedTime = input.StartedTime;
        this.EndedTime = input.EndedTime;
        this.UserName = input.UserName;
        this.PlatformId = input.PlatformId;
        if (input.CurrentStatus === 5) {
            input.CurrentStatus = 1;
        }
        this.CurrentStatus = input.CurrentStatus;
        this.StatusHistory = input.StatusHistory;
        if (!this.Points) {
            this.Points = [];
        }
        //Create lookup
        var pointLookup = new Map();
        for (var lookupPoint in this.Points) {
            pointLookup.set(this.Points[lookupPoint].PointId, parseInt(lookupPoint));
        }
        for (var _b = 0, _c = input.Points; _b < _c.length; _b++) {
            var point = _c[_b];
            if (pointLookup.has(point.PointId)) {
                this.Points[pointLookup.get(point.PointId)].deserialize(point);
            }
            else {
                this.Points.push(new PointInstance(point));
            }
        }
        this.AlarmIds = input.AlarmIds;
        this.notficationIsPaused = false;
        return this;
    };
    return PatrolInstance;
}(PatrolBase));
export { PatrolInstance };
//# sourceMappingURL=patrol.class.js.map