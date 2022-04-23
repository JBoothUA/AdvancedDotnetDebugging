import * as moment from 'moment';
export var PlatformMode;
(function (PlatformMode) {
    PlatformMode[PlatformMode["Unknown"] = 0] = "Unknown";
    PlatformMode[PlatformMode["Inactive"] = 1] = "Inactive";
    PlatformMode[PlatformMode["Offline"] = 2] = "Offline";
    PlatformMode[PlatformMode["Error"] = 3] = "Error";
    PlatformMode[PlatformMode["Estop"] = 4] = "Estop";
    PlatformMode[PlatformMode["EstopPhysical"] = 5] = "EstopPhysical";
    PlatformMode[PlatformMode["Docking"] = 6] = "Docking";
    PlatformMode[PlatformMode["MandatoryCharge"] = 7] = "MandatoryCharge";
    PlatformMode[PlatformMode["Charging"] = 8] = "Charging";
    PlatformMode[PlatformMode["Charged"] = 9] = "Charged";
    PlatformMode[PlatformMode["Healthy"] = 10] = "Healthy";
})(PlatformMode || (PlatformMode = {}));
export var PlatformMessageType;
(function (PlatformMessageType) {
    PlatformMessageType[PlatformMessageType["Full"] = 0] = "Full";
    PlatformMessageType[PlatformMessageType["AMCLPos"] = 1] = "AMCLPos";
    PlatformMessageType[PlatformMessageType["Sensor"] = 2] = "Sensor";
})(PlatformMessageType || (PlatformMessageType = {}));
export var ErrorState;
(function (ErrorState) {
    ErrorState[ErrorState["Unknown"] = 0] = "Unknown";
    ErrorState[ErrorState["SystemCommunication"] = 1] = "SystemCommunication";
    ErrorState[ErrorState["GatewayCommunication"] = 2] = "GatewayCommunication";
    ErrorState[ErrorState["PlatformCommunication"] = 3] = "PlatformCommunication";
    ErrorState[ErrorState["Lost"] = 4] = "Lost";
    ErrorState[ErrorState["HardwareSoftware"] = 5] = "HardwareSoftware";
    ErrorState[ErrorState["DockingError"] = 6] = "DockingError";
    ErrorState[ErrorState["None"] = 7] = "None";
    ErrorState[ErrorState["MapConfiguration"] = 8] = "MapConfiguration";
    ErrorState[ErrorState["DropoffDetected"] = 9] = "DropoffDetected";
})(ErrorState || (ErrorState = {}));
var PlatformState = /** @class */ (function () {
    function PlatformState() {
    }
    return PlatformState;
}());
export { PlatformState };
var Camera = /** @class */ (function () {
    function Camera(camera) {
        if (camera)
            this.deserialize(camera);
    }
    Camera.prototype.deserialize = function (input) {
        this.Username = input.Username;
        this.Password = input.Password;
        this.Port = input.Port;
        this.Ip = input.Ip;
        this.Uri = input.Uri;
        this.Id = input.Id;
        this.DisplayName = input.DisplayName;
        this.Type = input.Type;
        this.IsPTZ = input.IsPtz;
        return this;
    };
    return Camera;
}());
export { Camera };
var Platform = /** @class */ (function () {
    function Platform(platform) {
        this.Commands = [];
        this.Cameras = [];
        this.deserialize(platform, true);
        this.Selected = false;
        this.Expanded = false;
        this.ShowMoreCommands = false;
    }
    Platform.prototype.hasSensorData = function (sensor) {
        if (sensor && sensor.Values) {
            for (var _i = 0, _a = sensor.Values; _i < _a.length; _i++) {
                var value = _a[_i];
                if (value.BooleanValue)
                    return true;
                if (value.DoubleValue) {
                    return true;
                }
                if (value.IntValue)
                    return true;
                if (value.StringValue)
                    return true;
                if (value.ImageValue)
                    return true;
            }
        }
        return false;
    };
    Platform.prototype.getLocalTime = function (dateTime) {
        if (dateTime) {
            var time = moment(dateTime);
            if (time.format('YYYY') === '0001') {
                return null;
            }
            var timestamp = time.isUtc() ? moment.utc(dateTime).local().format('YYYY-MM-DD HH:mm:ss')
                : time.format('YYYY-MM-DD HH:mm:ss');
            return timestamp;
        }
        else {
            return null;
        }
    };
    Platform.prototype.deserializeAMCLPos = function (input, isCreated) {
        if (isCreated === void 0) { isCreated = false; }
        if (input.Position) {
            this.Position = input.Position;
        }
        if (input.LastPositionUpdate) {
            this.LastPositionUpdate = this.getLocalTime(input.LastPositionUpdate);
        }
        if (input.Orientation) {
            this.Orientation = input.Orientation;
        }
    };
    Platform.prototype.deserializeSensor = function (input, isCreated) {
        if (isCreated === void 0) { isCreated = false; }
        if (input.Sensors) {
            if (isCreated) {
                this.Sensors = input.Sensors;
            }
            else {
                if (this.Sensors) {
                    for (var _i = 0, _a = input.Sensors; _i < _a.length; _i++) {
                        var inputSensor = _a[_i];
                        if (inputSensor.Values) {
                            var found = false;
                            for (var sensor in this.Sensors) {
                                if (this.Sensors[sensor].Name === inputSensor.Name) {
                                    if (this.hasSensorData(inputSensor)) {
                                        for (var value in this.Sensors[sensor].Values) {
                                            if (inputSensor.Values[value] && !inputSensor.Values[value].ImageValue) {
                                                this.Sensors[sensor].Values[value].BooleanValue = inputSensor.Values[value].BooleanValue;
                                                this.Sensors[sensor].Values[value].StringValue = inputSensor.Values[value].StringValue;
                                                this.Sensors[sensor].Values[value].IntValue = inputSensor.Values[value].IntValue;
                                                this.Sensors[sensor].Values[value].DoubleValue = inputSensor.Values[value].DoubleValue;
                                            }
                                            else if (inputSensor.Values[value] && inputSensor.Values[value].ImageValue) {
                                                this.Sensors[sensor].Values[value].ImageValue = inputSensor.Values[value].ImageValue;
                                            }
                                        }
                                    }
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                this.Sensors.push(inputSensor);
                            }
                        }
                    }
                }
                else {
                    this.Sensors = input.Sensors;
                }
            }
        }
    };
    Platform.prototype.deserialize = function (input, isCreated) {
        if (isCreated === void 0) { isCreated = false; }
        if (input.PlatformMessageType) {
            this.PlatformMessageType = input.PlatformMessageType;
        }
        else {
            this.PlatformMessageType = PlatformMessageType.Full;
        }
        if (this.PlatformMessageType === PlatformMessageType.Full) {
            if (input.DisplayName) {
                for (var property in input) {
                    if (property !== 'Sensors'
                        && property !== 'Position'
                        && property !== 'Orientation'
                        && property !== 'BatteryPercentage'
                        && property != 'LastPositionUpdate'
                        && property != 'PlatformMessageType') {
                        if (input.hasOwnProperty(property)) {
                            this[property] = input[property];
                        }
                    }
                }
                this.IsPatrolSubmitted = (input.PatrolTemplateSubmittedId) ? true : false;
            }
            if (input.SentToPosition) {
                this.SentToPosition = input.SentToPosition;
                // Workaround: We have some horrible logic with .Coordinates vs .coordinates
                if (input.SentToPosition.Position) {
                    this.SentToPosition.Position.Coordinates = input.SentToPosition.Position.Coordinates
                        || input.SentToPosition.Position.coordinates;
                }
            }
            if (input.BatteryPercentage && input.BatteryPercentage !== -1) {
                this.BatteryPercentage = input.BatteryPercentage;
            }
        }
        if (this.PlatformMessageType === PlatformMessageType.Full || this.PlatformMessageType === PlatformMessageType.AMCLPos) {
            this.deserializeAMCLPos(input, isCreated);
        }
        if (this.PlatformMessageType === PlatformMessageType.Full || this.PlatformMessageType === PlatformMessageType.Sensor) {
            this.deserializeSensor(input, isCreated);
        }
        return this;
    };
    return Platform;
}());
export { Platform };
//# sourceMappingURL=platform.class.js.map