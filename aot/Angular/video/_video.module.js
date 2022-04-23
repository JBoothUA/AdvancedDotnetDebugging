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
export var Video;
(function (Video) {
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
    Video.Camera = Camera;
    var VideoVendor = /** @class */ (function () {
        function VideoVendor(cameraData) {
            this.cameraData = cameraData;
        }
        VideoVendor.prototype.getLiveVideo = function () { };
        VideoVendor.prototype.playLiveVideo = function () { };
        VideoVendor.prototype.stopLiveVideo = function () { };
        VideoVendor.prototype.disposeLiveVideo = function () { };
        VideoVendor.prototype.resumeLiveVideo = function () { };
        VideoVendor.prototype.refreshCameraVideo = function () { };
        VideoVendor.prototype.initVideo = function () { };
        VideoVendor.prototype.getCameraResolution = function () { };
        return VideoVendor;
    }());
    Video.VideoVendor = VideoVendor;
    var Gamma2VideoVendor = /** @class */ (function (_super) {
        __extends(Gamma2VideoVendor, _super);
        function Gamma2VideoVendor(cameraData) {
            return _super.call(this, cameraData) || this;
        }
        Gamma2VideoVendor.prototype.getLiveVideo = function () {
            return "<img width = \"auto\" height= \"auto\" \n                    style=\"background-repeat: no-repeat; background-position: center;-webkit-user-select: none;max-width:100%;max-height:100%;min-width:66px;min-height:66px;background-image:url('../../Content/Images/loading-spinner-white.gif')\"\n                    src= \"" + this.cameraData.Uri + "\" >";
        };
        return Gamma2VideoVendor;
    }(VideoVendor));
    Video.Gamma2VideoVendor = Gamma2VideoVendor;
    var AdeptVideoVendor = /** @class */ (function (_super) {
        __extends(AdeptVideoVendor, _super);
        function AdeptVideoVendor(cameraData) {
            return _super.call(this, cameraData) || this;
        }
        AdeptVideoVendor.prototype.getLiveVideo = function () {
        };
        return AdeptVideoVendor;
    }(VideoVendor));
    Video.AdeptVideoVendor = AdeptVideoVendor;
})(Video || (Video = {}));
//# sourceMappingURL=_video.module.js.map