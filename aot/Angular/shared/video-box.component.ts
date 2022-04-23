import {
    Component, Input
} from '@angular/core';

import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Camera } from './../platforms/platform.class';

import * as video from './../video/_video.module';

@Component({
    selector: 'video-box',
    templateUrl: 'video-box.component.html',
    styleUrls: ['video-box.component.css']
})
export class VideoBox{
    @Input() heading: number = 0;
    @Input() camera: Camera;
    @Input() showHeading: boolean = false;

    constructor(private Sanitizer: DomSanitizer) {
     
    }

    public getRotateString(): string {
        return 'rotate('+this.heading+')deg';
    }

    public getPlatformHeadingCardinal(): string {
        if (this.heading) {
            if (this.heading < 33.75) {
                return 'N';
            } else if (this.heading < 78.75) {
                return 'NE';
            } else if (this.heading < 123.75) {
                return 'E';
            } else if (this.heading < 168.75) {
                return 'SE';
            } else if (this.heading < 213.75) {
                return 'S';
            } else if (this.heading < 258.75) {
                return 'SW';
            } else if (this.heading < 303.75) {
                return 'W';
            } else if (this.heading < 348.75) {
                return 'NW';
            }
        }
        return 'N';
    }

    public getOrientation(): SafeStyle {
        return this.Sanitizer.bypassSecurityTrustStyle('rotate(' + this.heading + 'deg)');
    }

    public getLiveVideo(): any {
        let videoPlayer: any = new video.Video[this.camera.Type](this.camera);
        return this.Sanitizer.bypassSecurityTrustHtml(videoPlayer.getLiveVideo());
    }
}