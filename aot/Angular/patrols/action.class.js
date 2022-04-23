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
import * as moment from 'moment';
export var CommandName;
(function (CommandName) {
    CommandName[CommandName["EStop"] = 0] = "EStop";
    CommandName[CommandName["EStopReset"] = 1] = "EStopReset";
    CommandName[CommandName["FlashersOff"] = 2] = "FlashersOff";
    CommandName[CommandName["FlashersOn"] = 3] = "FlashersOn";
    CommandName[CommandName["GoCharge"] = 4] = "GoCharge";
    CommandName[CommandName["GoHome"] = 5] = "GoHome";
    CommandName[CommandName["HeadlightsOff"] = 6] = "HeadlightsOff";
    CommandName[CommandName["HeadlightsOn"] = 7] = "HeadlightsOn";
    CommandName[CommandName["IrIlluminatorsOff"] = 8] = "IrIlluminatorsOff";
    CommandName[CommandName["IrIlluminatorsOn"] = 9] = "IrIlluminatorsOn";
    CommandName[CommandName["LocalizeOnCharger"] = 10] = "LocalizeOnCharger";
    CommandName[CommandName["ResetCameras"] = 11] = "ResetCameras";
    CommandName[CommandName["SayMessage"] = 12] = "SayMessage";
    CommandName[CommandName["SetChargerLocation"] = 13] = "SetChargerLocation";
    CommandName[CommandName["SirenOff"] = 14] = "SirenOff";
    CommandName[CommandName["SirenOn"] = 15] = "SirenOn";
    CommandName[CommandName["StartRun"] = 16] = "StartRun";
    CommandName[CommandName["VolumeMute"] = 17] = "VolumeMute";
    CommandName[CommandName["VolumeUnmute"] = 18] = "VolumeUnmute";
    CommandName[CommandName["Volume"] = 19] = "Volume";
    CommandName[CommandName["OrientPlatform"] = 20] = "OrientPlatform";
    CommandName[CommandName["TiltCameraAbsolute"] = 21] = "TiltCameraAbsolute";
    CommandName[CommandName["Snapshot"] = 22] = "Snapshot";
    CommandName[CommandName["Play"] = 23] = "Play";
    CommandName[CommandName["GoToLocation"] = 24] = "GoToLocation";
    CommandName[CommandName["Abort"] = 25] = "Abort";
    CommandName[CommandName["Dwell"] = 26] = "Dwell";
    CommandName[CommandName["PausePatrol"] = 27] = "PausePatrol";
    CommandName[CommandName["ResumePatrol"] = 28] = "ResumePatrol";
    CommandName[CommandName["CancelGoal"] = 29] = "CancelGoal";
    CommandName[CommandName["GetSnapshot"] = 30] = "GetSnapshot";
    CommandName[CommandName["ShutDown"] = 31] = "ShutDown";
    CommandName[CommandName["FailPatrolCommand"] = 32] = "FailPatrolCommand";
})(CommandName || (CommandName = {}));
;
export var ActionScope;
(function (ActionScope) {
    ActionScope[ActionScope["All"] = 0] = "All";
    ActionScope[ActionScope["Command"] = 1] = "Command";
    ActionScope[ActionScope["PatrolAction"] = 2] = "PatrolAction";
})(ActionScope || (ActionScope = {}));
// Leaving for now until platform code is updated to use new name (ActionType)
export var ActionCommandType;
(function (ActionCommandType) {
    ActionCommandType[ActionCommandType["Command"] = 0] = "Command";
    ActionCommandType[ActionCommandType["Toggle"] = 1] = "Toggle";
    ActionCommandType[ActionCommandType["Dwell"] = 2] = "Dwell";
    ActionCommandType[ActionCommandType["Say"] = 3] = "Say";
    ActionCommandType[ActionCommandType["Play"] = 4] = "Play";
    ActionCommandType[ActionCommandType["Orient"] = 5] = "Orient";
    ActionCommandType[ActionCommandType["Volume"] = 6] = "Volume";
})(ActionCommandType || (ActionCommandType = {}));
export var ActionType;
(function (ActionType) {
    ActionType[ActionType["Command"] = 0] = "Command";
    ActionType[ActionType["Toggle"] = 1] = "Toggle";
    ActionType[ActionType["Dwell"] = 2] = "Dwell";
    ActionType[ActionType["Say"] = 3] = "Say";
    ActionType[ActionType["Play"] = 4] = "Play";
    ActionType[ActionType["Orient"] = 5] = "Orient";
    ActionType[ActionType["Volume"] = 6] = "Volume";
})(ActionType || (ActionType = {}));
export var ActionStateValue;
(function (ActionStateValue) {
    ActionStateValue[ActionStateValue["On"] = 0] = "On";
    ActionStateValue[ActionStateValue["Disable"] = 1] = "Disable";
    ActionStateValue[ActionStateValue["Off"] = 2] = "Off";
})(ActionStateValue || (ActionStateValue = {}));
var ActionCategory = /** @class */ (function () {
    function ActionCategory() {
    }
    return ActionCategory;
}());
export { ActionCategory };
var ActionDefinition = /** @class */ (function () {
    function ActionDefinition() {
        this.Command = [];
        this.Parameters = [];
    }
    return ActionDefinition;
}());
export { ActionDefinition };
var CommandDefinition = /** @class */ (function () {
    function CommandDefinition() {
    }
    return CommandDefinition;
}());
export { CommandDefinition };
var ParameterDefinition = /** @class */ (function () {
    function ParameterDefinition() {
    }
    return ParameterDefinition;
}());
export { ParameterDefinition };
export var ParameterName;
(function (ParameterName) {
    ParameterName[ParameterName["Phrase"] = 0] = "Phrase";
    ParameterName[ParameterName["Percent"] = 1] = "Percent";
    ParameterName[ParameterName["Angle"] = 2] = "Angle";
    ParameterName[ParameterName["Position"] = 3] = "Position";
    ParameterName[ParameterName["File"] = 4] = "File";
    ParameterName[ParameterName["Seconds"] = 5] = "Seconds";
    ParameterName[ParameterName["Username"] = 6] = "Username";
    ParameterName[ParameterName["PatrolTemplateId"] = 7] = "PatrolTemplateId";
    ParameterName[ParameterName["PatrolInstanceId"] = 8] = "PatrolInstanceId";
    ParameterName[ParameterName["AlarmId"] = 9] = "AlarmId";
    ParameterName[ParameterName["PlatformParameter"] = 10] = "PlatformParameter";
    ParameterName[ParameterName["OriginId"] = 11] = "OriginId";
    ParameterName[ParameterName["OriginType"] = 12] = "OriginType";
    ParameterName[ParameterName["Camera"] = 13] = "Camera";
})(ParameterName || (ParameterName = {}));
export var ParameterType;
(function (ParameterType) {
    ParameterType[ParameterType["String"] = 0] = "String";
    ParameterType[ParameterType["Double"] = 1] = "Double";
    ParameterType[ParameterType["Int"] = 2] = "Int";
    ParameterType[ParameterType["Boolean"] = 3] = "Boolean";
})(ParameterType || (ParameterType = {}));
export var ActionStatusValues;
(function (ActionStatusValues) {
    ActionStatusValues[ActionStatusValues["Unknown"] = 0] = "Unknown";
    ActionStatusValues[ActionStatusValues["Started"] = 1] = "Started";
    ActionStatusValues[ActionStatusValues["Completed"] = 2] = "Completed";
    ActionStatusValues[ActionStatusValues["Failed"] = 3] = "Failed";
    ActionStatusValues[ActionStatusValues["Unsupported"] = 4] = "Unsupported";
})(ActionStatusValues || (ActionStatusValues = {}));
var Parameter = /** @class */ (function () {
    function Parameter(parameter) {
        if (parameter != null)
            this.deserialize(parameter);
    }
    Parameter.prototype.deserialize = function (input) {
        this.Name = input.Name;
        this.Value = input.Value;
        this.Type = input.Type;
        return this;
    };
    return Parameter;
}());
export { Parameter };
var ActionBase = /** @class */ (function () {
    function ActionBase(actionbase) {
        if (actionbase != null)
            this.deserialize(actionbase);
    }
    ActionBase.prototype.deserialize = function (input) {
        this.ActionId = input.ActionId;
        this.Command = input.Command;
        //this.Parameters = input.Parameters;
        this.Parameters = [];
        if (input.Parameters) {
            for (var _i = 0, _a = input.Parameters; _i < _a.length; _i++) {
                var parameter = _a[_i];
                this.Parameters.push(new Parameter(parameter));
            }
        }
        return this;
    };
    return ActionBase;
}());
export { ActionBase };
var ActionInstance = /** @class */ (function (_super) {
    __extends(ActionInstance, _super);
    function ActionInstance(action) {
        var _this = _super.call(this, null) || this;
        _this.CurrentStatus = ActionStatusValues.Unknown;
        if (action) {
            _this.deserialize(action);
        }
        return _this;
    }
    ActionInstance.prototype.deserialize = function (input) {
        _super.prototype.deserialize.call(this, input);
        this.CurrentStatus = input.CurrentStatus;
        this.ActionId = input.ActionId;
        this.StatusHistory = input.StatusHistory;
        this.AlarmIds = input.AlarmIds;
        this.Images = input.Images;
        this.HasSnapshots = input.HasSnapshots;
        return this;
    };
    return ActionInstance;
}(ActionBase));
export { ActionInstance };
var CommandBase = /** @class */ (function () {
    function CommandBase() {
    }
    return CommandBase;
}());
export { CommandBase };
var PlatformCommand = /** @class */ (function (_super) {
    __extends(PlatformCommand, _super);
    function PlatformCommand(platformId, command, parameters) {
        var _this = _super.call(this) || this;
        _this.PlatformId = platformId;
        _this.Name = command;
        _this.Parameters = parameters;
        return _this;
    }
    return PlatformCommand;
}(CommandBase));
export { PlatformCommand };
//TODO: remove this fallback when we are correctly processing alarm images
var tempHardcodedAlarmImages = [
    {
        'Label': '',
        'Selected': false,
        'ImageFileName': 'smoke-detected-ramsee2-frontcamera2-2017-07-11_04-28-30.jpg',
        'Timestamp': moment.utc().format('YYYY-MM-DD HH:mm:ss'),
        'Uri': '../../Content/Images/temp-SnapshotImages/smoke-detected-ramsee2-frontcamera2-2017-07-11_04-28-30.jpg'
    },
    {
        'Label': '',
        'Selected': false,
        'ImageFileName': 'smoke-detected-ramsee2-frontcamera1-2017-07-11_04-28-30.jpg',
        'Timestamp': moment.utc().format('YYYY-MM-DD HH:mm:ss'),
        'Uri': '../../Content/Images/temp-SnapshotImages/smoke-detected-ramsee2-frontcamera1-2017-07-11_04-28-30.jpg'
    },
    {
        'Label': '',
        'Selected': false,
        'ImageFileName': 'smoke-detected-ramsee2-back-camera-2017-07-11_04-28-30.jpg',
        'Timestamp': moment.utc().format('YYYY-MM-DD HH:mm:ss'),
        'Uri': '../../Content/Images/temp-SnapshotImages/smoke-detected-ramsee2-back-camera-2017-07-11_04-28-30.jpg'
    }
];
//# sourceMappingURL=action.class.js.map