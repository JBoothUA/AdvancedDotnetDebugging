var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera } from './../platforms/platform.class';
import * as video from './../video/_video.module';
var VideoBox = /** @class */ (function () {
    function VideoBox(Sanitizer) {
        this.Sanitizer = Sanitizer;
        this.heading = 0;
        this.showHeading = false;
    }
    VideoBox.prototype.getRotateString = function () {
        return 'rotate(' + this.heading + ')deg';
    };
    VideoBox.prototype.getPlatformHeadingCardinal = function () {
        if (this.heading) {
            if (this.heading < 33.75) {
                return 'N';
            }
            else if (this.heading < 78.75) {
                return 'NE';
            }
            else if (this.heading < 123.75) {
                return 'E';
            }
            else if (this.heading < 168.75) {
                return 'SE';
            }
            else if (this.heading < 213.75) {
                return 'S';
            }
            else if (this.heading < 258.75) {
                return 'SW';
            }
            else if (this.heading < 303.75) {
                return 'W';
            }
            else if (this.heading < 348.75) {
                return 'NW';
            }
        }
        return 'N';
    };
    VideoBox.prototype.getOrientation = function () {
        return this.Sanitizer.bypassSecurityTrustStyle('rotate(' + this.heading + 'deg)');
    };
    VideoBox.prototype.getLiveVideo = function () {
        var videoPlayer = new video.Video[this.camera.Type](this.camera);
        return this.Sanitizer.bypassSecurityTrustHtml(videoPlayer.getLiveVideo());
    };
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], VideoBox.prototype, "heading", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Camera)
    ], VideoBox.prototype, "camera", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], VideoBox.prototype, "showHeading", void 0);
    VideoBox = __decorate([
        Component({
            selector: 'video-box',
            templateUrl: 'video-box.component.html',
            styleUrls: ['video-box.component.css']
        }),
        __metadata("design:paramtypes", [DomSanitizer])
    ], VideoBox);
    return VideoBox;
}());
export { VideoBox };
//# sourceMappingURL=video-box.component.js.map