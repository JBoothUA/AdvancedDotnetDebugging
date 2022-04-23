import { Image } from './shared-interfaces';
import { MapLayer } from './map-layer.class';
export var MapControlPositions;
(function (MapControlPositions) {
    MapControlPositions[MapControlPositions["TopRight"] = 0] = "TopRight";
    MapControlPositions[MapControlPositions["TopLeft"] = 1] = "TopLeft";
    MapControlPositions[MapControlPositions["BottomRight"] = 2] = "BottomRight";
    MapControlPositions[MapControlPositions["BottomLeft"] = 3] = "BottomLeft";
})(MapControlPositions || (MapControlPositions = {}));
var MapCreateOptions = /** @class */ (function () {
    function MapCreateOptions() {
        this.Zoom = -1;
        this.Center = null;
        this.DoubleClickZoom = true;
        this.Dragging = true;
        this.Keyboard = true;
        this.ScrollWheelZoom = true;
        this.ZoomControl = true;
        this.MinZoom = 0;
        this.MaxZoom = 30;
        this.ZoomControlPosition = MapControlPositions.TopRight;
        this.AttributionControl = false;
        this.AttributionControlPosition = MapControlPositions.BottomRight;
    }
    return MapCreateOptions;
}());
export { MapCreateOptions };
var PlatformImageProperties = /** @class */ (function () {
    function PlatformImageProperties(input) {
        if (input !== null) {
            this.deserialize(input);
        }
        else {
            this.Resolution = null;
            this.Origin = null;
        }
    }
    PlatformImageProperties.prototype.deserialize = function (input) {
        this.Resolution = input.Resolution;
        this.Origin = [];
        if (input.Origin && input.Origin.length > 0) {
            for (var ii = 0; ii < input.Origin.length; ii++) {
                this.Origin.push(input.Origin[ii]);
            }
        }
    };
    return PlatformImageProperties;
}());
export { PlatformImageProperties };
var TenantMapSettings = /** @class */ (function () {
    function TenantMapSettings(input) {
        if (input !== null) {
            this.deserialize(input);
        }
        else {
            this.Layers = [];
            this.AvailableLayers = [];
            this.AvailableImages = [];
        }
    }
    TenantMapSettings.prototype.deserialize = function (input) {
        this.Layers = [];
        if (input.Layers && input.Layers.length > 0) {
            for (var ii = 0; ii < input.Layers.length; ii++) {
                this.Layers.push(new MapLayer(input.Layers[ii]));
            }
        }
        this.AvailableLayers = [];
        if (input.AvailableLayers && input.AvailableLayers.length > 0) {
            for (var ii = 0; ii < input.AvailableLayers.length; ii++) {
                this.AvailableLayers.push(new MapLayer(input.AvailableLayers[ii]));
            }
        }
        this.AvailableImages = [];
        if (input.AvailableImages && input.AvailableImages.length > 0) {
            for (var ii = 0; ii < input.AvailableImages.length; ii++) {
                this.AvailableImages.push(new ImageInfo(input.AvailableImages[ii]));
            }
        }
    };
    return TenantMapSettings;
}());
export { TenantMapSettings };
var LocationMapSettings = /** @class */ (function () {
    function LocationMapSettings(input) {
        if (input != null) {
            this.deserialize(input);
        }
        else {
            this.Layers = [];
            this.AvailableLayers = [];
            this.AvailableImages = [];
            this.AvailablePlatformImages = [];
        }
    }
    LocationMapSettings.prototype.deserialize = function (input) {
        this.ZoomLevel = input.ZoomLevel;
        if (input.MapCenter) {
            if (input.MapCenter.Coordinates != null) {
                this.MapCenter = { Coordinates: [input.MapCenter.Coordinates[0], input.MapCenter.Coordinates[1]], Type: input.MapCenter.Type };
            }
            else {
                this.MapCenter = { Coordinates: [input.MapCenter.coordinates[0], input.MapCenter.coordinates[1]], Type: input.MapCenter.type };
            }
        }
        this.Layers = [];
        if (input.Layers && input.Layers.length > 0) {
            for (var ii = 0; ii < input.Layers.length; ii++) {
                this.Layers.push(new MapLayer(input.Layers[ii]));
            }
        }
        this.AvailableLayers = [];
        if (input.AvailableLayers && input.AvailableLayers.length > 0) {
            for (var ii = 0; ii < input.AvailableLayers.length; ii++) {
                this.AvailableLayers.push(new MapLayer(input.AvailableLayers[ii]));
            }
        }
        this.AvailableImages = [];
        if (input.AvailableImages && input.AvailableImages.length > 0) {
            for (var ii = 0; ii < input.AvailableImages.length; ii++) {
                this.AvailableImages.push(new ImageInfo(input.AvailableImages[ii]));
            }
        }
        this.AvailablePlatformImages = [];
        if (input.AvailablePlatformImages && input.AvailablePlatformImages.length > 0) {
            for (var ii = 0; ii < input.AvailablePlatformImages.length; ii++) {
                this.AvailablePlatformImages.push(new PlatformImageInfo(input.AvailablePlatformImages[ii]));
            }
        }
    };
    return LocationMapSettings;
}());
export { LocationMapSettings };
var ImageInfo = /** @class */ (function () {
    function ImageInfo(input) {
        if (input != null) {
            this.deserialize(input);
        }
        else {
            this.Id = this.createGUID();
            this.Rotation = 0;
            this.Anchors = [];
            this.IsConstrainedTo90 = true;
            this.IsMaintainAspect = true;
        }
    }
    ImageInfo.prototype.deserialize = function (input) {
        this.Id = input.Id ? input.Id : this.createGUID();
        this.Image = new Image(input.Image);
        this.Anchors = [];
        this.Rotation = input.Rotation ? input.Rotation : 0;
        this.IsMaintainAspect = input.IsMaintainAspect ? input.IsMaintainAspect : false;
        this.IsConstrainedTo90 = input.IsConstrainedTo90 ? input.IsConstrainedTo90 : false;
        this.ImageSize = [];
        for (var ii = 0; input.ImageSize && ii < input.ImageSize.length; ii++) {
            this.ImageSize.push(input.ImageSize[ii]);
        }
        for (var ii = 0; input.Anchors && ii < input.Anchors.length; ii++) {
            if (input.Anchors[ii].Coordinates != null)
                this.Anchors.push({ Coordinates: [input.Anchors[ii].Coordinates[0], input.Anchors[ii].Coordinates[1]], Type: input.Anchors[ii].Type });
            else
                this.Anchors.push({ Coordinates: [input.Anchors[ii].coordinates[0], input.Anchors[ii].coordinates[1]], Type: input.Anchors[ii].type });
        }
        if (input.MapOrigin) {
            if (input.MapOrigin.Coordinates != null) {
                this.MapOrigin = { Coordinates: [input.MapOrigin.Coordinates[0], input.MapOrigin.Coordinates[1]], Type: input.MapOrigin.Type };
            }
            else {
                this.MapOrigin = { Coordinates: [input.MapOrigin.coordinates[0], input.MapOrigin.coordinates[1]], Type: input.MapOrigin.type };
            }
        }
    };
    ImageInfo.prototype.createGUID = function () {
        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var cryptoObj = window.crypto;
            var r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return (guid);
    };
    return ImageInfo;
}());
export { ImageInfo };
var PlatformImageInfo = /** @class */ (function () {
    function PlatformImageInfo(input) {
        if (input != null) {
            this.deserialize(input);
        }
        else {
            this.Id = this.createGUID();
            this.Rotation = 0;
            this.Anchors = [];
            this.ImageSize = [];
            this.ImageProperties = new PlatformImageProperties(null);
        }
    }
    PlatformImageInfo.prototype.deserialize = function (input) {
        this.Id = input.Id ? input.Id : this.createGUID();
        this.Image = new Image(input.Image);
        this.Rotation = input.Rotation ? input.Rotation : 0;
        this.ImageProperties = new PlatformImageProperties(input.ImageProperties);
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
            if (input.Anchors[ii].Coordinates != null)
                this.Anchors.push({ Coordinates: [input.Anchors[ii].Coordinates[0], input.Anchors[ii].Coordinates[1]], Type: input.Anchors[ii].Type });
            else
                this.Anchors.push({ Coordinates: [input.Anchors[ii].coordinates[0], input.Anchors[ii].coordinates[1]], Type: input.Anchors[ii].type });
        }
    };
    PlatformImageInfo.prototype.createGUID = function () {
        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var cryptoObj = window.crypto;
            var r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return (guid);
    };
    return PlatformImageInfo;
}());
export { PlatformImageInfo };
//# sourceMappingURL=map-settings.class.js.map