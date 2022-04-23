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
import { ActionInstance, ActionBase } from './action.class';
export var PointStatusValues;
(function (PointStatusValues) {
    PointStatusValues[PointStatusValues["Unknown"] = 0] = "Unknown";
    PointStatusValues[PointStatusValues["InTransit"] = 1] = "InTransit";
    PointStatusValues[PointStatusValues["Reached"] = 2] = "Reached";
    PointStatusValues[PointStatusValues["NotReached"] = 3] = "NotReached";
    PointStatusValues[PointStatusValues["ActionsPerformed"] = 4] = "ActionsPerformed";
    PointStatusValues[PointStatusValues["Cancelled"] = 5] = "Cancelled";
})(PointStatusValues || (PointStatusValues = {}));
var PointBase = /** @class */ (function () {
    function PointBase(pointbase) {
        this.Selected = false;
        this.IsInserted = false;
        this.ActionsExpanded = false;
        if (pointbase != null)
            this.deserialize(pointbase);
    }
    PointBase.prototype.deserialize = function (input) {
        this.PointId = input.PointId;
        this.DisplayName = input.DisplayName;
        this.Description = input.Description;
        this.Ordinal = input.Ordinal;
        if (input.Position.Coordinates != null)
            this.Position = input.Position ? { Coordinates: input.Position.Coordinates, Type: input.Position.Type } : null;
        else
            this.Position = input.Position ? { Coordinates: input.Position.coordinates, Type: input.Position.type } : null;
        return this;
    };
    return PointBase;
}());
export { PointBase };
//Type Guard
export function isPointTemplate(arg) {
    return arg.AlarmIds === undefined;
}
var PointTemplate = /** @class */ (function (_super) {
    __extends(PointTemplate, _super);
    function PointTemplate(point) {
        var _this = _super.call(this, null) || this;
        _this.Actions = [];
        if (point != null) {
            _this.deserialize(point);
        }
        return _this;
    }
    PointTemplate.prototype.deserialize = function (input) {
        _super.prototype.deserialize.call(this, input);
        if (input.Actions) {
            this.Actions = [];
            for (var ii = 0; ii < input.Actions.length; ii++) {
                var action = new ActionBase(input.Actions[ii]);
                this.Actions.push(action);
            }
        }
        return this;
    };
    return PointTemplate;
}(PointBase));
export { PointTemplate };
//Type Guard
export function isPointInstance(arg) {
    return arg.CurrentStatus !== undefined;
}
var PointInstance = /** @class */ (function (_super) {
    __extends(PointInstance, _super);
    function PointInstance(point) {
        var _this = _super.call(this, null) || this;
        if (point) {
            _this.deserialize(point);
        }
        return _this;
    }
    PointInstance.prototype.deserialize = function (input) {
        _super.prototype.deserialize.call(this, input);
        this.CurrentStatus = input.CurrentStatus;
        this.StatusHistory = input.StatusHistory;
        if (!this.Actions) {
            this.Actions = [];
        }
        if (input.Actions) {
            //Create lookup
            var actionLookup = new Map();
            for (var lookupAction in this.Actions) {
                actionLookup.set(this.Actions[lookupAction].ActionId, parseInt(lookupAction));
            }
            for (var _i = 0, _a = input.Actions; _i < _a.length; _i++) {
                var action = _a[_i];
                if (actionLookup.has(action.ActionId)) {
                    this.Actions[actionLookup.get(action.ActionId)].deserialize(action);
                }
                else {
                    this.Actions.push(new ActionInstance(action));
                }
            }
        }
        this.AlarmIds = input.AlarmIds;
        this.Telemetry = input.Telemetry;
        return this;
    };
    return PointInstance;
}(PointBase));
export { PointInstance };
//# sourceMappingURL=point.class.js.map