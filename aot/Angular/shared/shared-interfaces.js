var Image = /** @class */ (function () {
    function Image(input) {
        if (input != null) {
            this.deserialize(input);
        }
        else {
            this.Label = '';
            this.Uri = '';
            this.Selected = false;
        }
    }
    Image.prototype.deserialize = function (input) {
        this.Label = input.Label;
        this.Uri = input.Uri;
        if (input.Selected) {
            this.Selected = input.Selected;
        }
        else {
            this.Selected = false;
        }
    };
    return Image;
}());
export { Image };
export var CorrelationType;
(function (CorrelationType) {
    CorrelationType[CorrelationType["Unknown"] = 0] = "Unknown";
    CorrelationType[CorrelationType["Alarm"] = 1] = "Alarm";
    CorrelationType[CorrelationType["Patrol"] = 2] = "Patrol";
    CorrelationType[CorrelationType["Platform"] = 3] = "Platform";
})(CorrelationType || (CorrelationType = {}));
var DataValue = /** @class */ (function () {
    function DataValue() {
    }
    return DataValue;
}());
export { DataValue };
export var SensorType;
(function (SensorType) {
    SensorType[SensorType["Unknown"] = 0] = "Unknown";
    SensorType[SensorType["Temperature"] = 1] = "Temperature";
    SensorType[SensorType["Gas"] = 2] = "Gas";
    SensorType[SensorType["Sound"] = 3] = "Sound";
    SensorType[SensorType["PIR"] = 4] = "PIR";
    SensorType[SensorType["Light"] = 5] = "Light";
    SensorType[SensorType["Humidity"] = 6] = "Humidity";
    SensorType[SensorType["Smoke"] = 7] = "Smoke";
    SensorType[SensorType["TempHumid"] = 8] = "TempHumid";
    SensorType[SensorType["FLIR"] = 9] = "FLIR";
})(SensorType || (SensorType = {}));
export var PropertyItemType;
(function (PropertyItemType) {
    PropertyItemType[PropertyItemType["Unknown"] = 0] = "Unknown";
    PropertyItemType[PropertyItemType["Boolean"] = 1] = "Boolean";
    PropertyItemType[PropertyItemType["String"] = 2] = "String";
    PropertyItemType[PropertyItemType["Integer"] = 3] = "Integer";
    PropertyItemType[PropertyItemType["Double"] = 4] = "Double";
    PropertyItemType[PropertyItemType["Image"] = 5] = "Image";
    PropertyItemType[PropertyItemType["Hyperlink"] = 6] = "Hyperlink";
    PropertyItemType[PropertyItemType["Temperature"] = 7] = "Temperature";
    PropertyItemType[PropertyItemType["Humidity"] = 8] = "Humidity";
    PropertyItemType[PropertyItemType["Gas"] = 9] = "Gas";
    PropertyItemType[PropertyItemType["Flir"] = 10] = "Flir";
    PropertyItemType[PropertyItemType["Battery"] = 11] = "Battery";
})(PropertyItemType || (PropertyItemType = {}));
var BaseDataObject = /** @class */ (function () {
    function BaseDataObject(object) {
        this.deserialize(object);
    }
    BaseDataObject.prototype.deserialize = function (input) {
        this.Id = input.Id;
        this.TenantId = input.TenantId;
        this.Version = input.Version;
    };
    return BaseDataObject;
}());
export { BaseDataObject };
export var SortType;
(function (SortType) {
    SortType[SortType["Asc"] = 0] = "Asc";
    SortType[SortType["Desc"] = 1] = "Desc";
})(SortType || (SortType = {}));
//# sourceMappingURL=shared-interfaces.js.map