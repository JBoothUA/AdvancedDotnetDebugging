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
var L;
(function (L) {
    var ScMarkerTypes;
    (function (ScMarkerTypes) {
        ScMarkerTypes[ScMarkerTypes["Alarm"] = 0] = "Alarm";
        ScMarkerTypes[ScMarkerTypes["Platform"] = 1] = "Platform";
        ScMarkerTypes[ScMarkerTypes["Patrol"] = 2] = "Patrol";
        ScMarkerTypes[ScMarkerTypes["Location"] = 3] = "Location";
    })(ScMarkerTypes = L.ScMarkerTypes || (L.ScMarkerTypes = {}));
    var SmartCommandIcon = /** @class */ (function (_super) {
        __extends(SmartCommandIcon, _super);
        function SmartCommandIcon(options) {
            var _this = _super.call(this, options) || this;
            _this.options = {
                iconUrl: null,
                iconSize: [48, 48],
                iconAnchor: [29, 29],
                popupAnchor: [0, -31],
                iconDiv: null,
                targetId: null
            };
            return _this;
        }
        return SmartCommandIcon;
    }(L.Icon));
    L.SmartCommandIcon = SmartCommandIcon;
    var SmartCommandMarker = /** @class */ (function (_super) {
        __extends(SmartCommandMarker, _super);
        function SmartCommandMarker(latlng, options) {
            var _this = _super.call(this, latlng, options) || this;
            _this.Selected = false;
            return _this;
        }
        SmartCommandMarker.prototype.update = function () {
        };
        return SmartCommandMarker;
    }(L.Marker));
    L.SmartCommandMarker = SmartCommandMarker;
    var SmartCommandPolyline = /** @class */ (function (_super) {
        __extends(SmartCommandPolyline, _super);
        function SmartCommandPolyline(latLngs, options) {
            return _super.call(this, latLngs, options) || this;
        }
        SmartCommandPolyline.prototype.update = function () {
        };
        return SmartCommandPolyline;
    }(L.Polyline));
    L.SmartCommandPolyline = SmartCommandPolyline;
})(L || (L = {}));
//# sourceMappingURL=smartcommand-leaflet.namespace.js.map