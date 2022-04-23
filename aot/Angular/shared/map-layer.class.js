import { PlatformImageProperties } from './map-settings.class';
export var LayerFormat;
(function (LayerFormat) {
    LayerFormat[LayerFormat["Tile"] = 0] = "Tile";
    LayerFormat[LayerFormat["WMS"] = 1] = "WMS";
    LayerFormat[LayerFormat["Image"] = 2] = "Image";
    LayerFormat[LayerFormat["PlatformImage"] = 3] = "PlatformImage";
    LayerFormat[LayerFormat["GeoJson"] = 4] = "GeoJson";
})(LayerFormat || (LayerFormat = {}));
export var LayerType;
(function (LayerType) {
    LayerType[LayerType["Floorplan"] = 0] = "Floorplan";
    LayerType[LayerType["RobotMap"] = 1] = "RobotMap";
    LayerType[LayerType["Custom"] = 2] = "Custom";
})(LayerType || (LayerType = {}));
var LayerOption = /** @class */ (function () {
    function LayerOption(input) {
        if (input != null) {
            this.deserialize(input);
        }
        else {
            this.Name = "";
            this.Value = null;
            this.Type = "";
        }
    }
    LayerOption.prototype.deserialize = function (input) {
        this.Name = input.Name;
        this.Value = input.Value;
        this.Type = input.Type;
    };
    return LayerOption;
}());
export { LayerOption };
var MapLayer = /** @class */ (function () {
    function MapLayer(input) {
        this.IsSelected = false;
        if (input != null) {
            this.deserialize(input);
        }
        else {
            this.Id = this.createGUID();
            this.Name = "";
            this.LayerFormat = LayerFormat.Tile;
            this.LayerType = LayerType.Custom;
            this.Rotation = 0;
            this.IsConstrainedTo90 = true;
            this.IsMaintainAspect = true;
            this.IsShownOnStartup = true;
            this.IsMinMaxZoomDefined = false;
            this.MinZoomLevel = 0;
            this.MaxZoomLevel = 18;
            this.Opacity = 1;
            this.Anchors = [];
            this.WMSLayers = [];
            this.Options = [];
            this.ImageName = '';
            this.ImageProperties = null;
            this.ImageSize = null;
        }
    }
    MapLayer.prototype.deserialize = function (input) {
        this.Id = input.Id;
        this.Name = input.Name;
        this.LayerFormat = input.LayerFormat;
        this.LayerType = input.LayerType;
        this.URL = input.URL;
        this.IsShownOnStartup = input.IsShownOnStartup;
        this.IsConstrainedTo90 = input.IsConstrainedTo90;
        this.IsMaintainAspect = input.IsMaintainAspect ? input.IsMaintainAspect : false;
        this.IsMinMaxZoomDefined = input.IsMinMaxZoomDefined;
        this.MinZoomLevel = input.MinZoomLevel;
        this.MaxZoomLevel = input.MaxZoomLevel;
        this.Opacity = input.Opacity;
        this.Rotation = input.Rotation;
        this.ImageName = input.ImageName;
        if (input.ImageProperties) {
            this.ImageProperties = new PlatformImageProperties(input.ImageProperties);
        }
        this.ImageSize = [];
        for (var ii = 0; input.ImageSize && ii < input.ImageSize.length; ii++) {
            this.ImageSize.push(input.ImageSize[ii]);
        }
        if (input.MapOrigin) {
            if (input.MapOrigin.Coordinates != null) {
                this.MapOrigin = { Coordinates: [input.MapOrigin.Coordinates[0], input.MapOrigin.Coordinates[1]], Type: input.MapOrigin.Type };
            }
            else {
                this.MapOrigin = { Coordinates: [input.MapOrigin.coordinates[0], input.MapOrigin.coordinates[1]], Type: input.MapOrigin.type };
            }
        }
        this.Anchors = [];
        for (var ii = 0; input.Anchors && ii < input.Anchors.length; ii++) {
            if (input.Anchors[ii].Coordinates != null) {
                this.Anchors.push({ Coordinates: [input.Anchors[ii].Coordinates[0], input.Anchors[ii].Coordinates[1]], Type: input.Anchors[ii].Type });
            }
            else {
                this.Anchors.push({ Coordinates: [input.Anchors[ii].coordinates[0], input.Anchors[ii].coordinates[1]], Type: input.Anchors[ii].type });
            }
        }
        this.Options = [];
        if (input.Options && input.Options.length > 0) {
            for (var ii = 0; ii < input.Options.length; ii++) {
                var option_1 = new LayerOption(input.Options[ii]);
                this.Options.push(option_1);
            }
        }
        this.WMSLayers = [];
        var option = this.Options.find(function (elem) { return (elem.Name === 'layers'); });
        if (option) {
            this.WMSLayers = option.Value.split(',');
        }
    };
    MapLayer.prototype.getCommaSeparatedWMSLayers = function () {
        var list;
        if (this.WMSLayers && this.WMSLayers.length > 0) {
            list = this.WMSLayers[0];
            for (var ii = 1; ii < this.WMSLayers.length; ii++) {
                list += ',' + this.WMSLayers[ii];
            }
        }
        return (list);
    };
    MapLayer.prototype.addWMSLayer = function (layer) {
        this.WMSLayers.push(layer);
    };
    MapLayer.prototype.removeWMSLayer = function (layer) {
        if (this.WMSLayers && this.WMSLayers.length > 0) {
            var idx = this.WMSLayers.indexOf(layer);
            if (idx !== -1) {
                this.WMSLayers.splice(idx, 1);
            }
        }
    };
    MapLayer.prototype.createGUID = function () {
        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var cryptoObj = window.crypto;
            var r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return (guid);
    };
    return MapLayer;
}());
export { MapLayer };
//# sourceMappingURL=map-layer.class.js.map