import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Alarm } from '../../alarms/alarm.class';
import { Image, CorrelationType } from '../../shared/shared-interfaces';

@Injectable()
export class MediaService {

    openImageViewerSub: Subject<any> = new Subject();
    closeImageViewerSub: Subject<any> = new Subject();
    selectedImageChangedSub: Subject<any> = new Subject();

    constructor() {
    }

    openImageViewer(correlationId: string, images: Image[], imageTitle: string) {
        this.openImageViewerSub.next({correlationId: correlationId, images: images, imageTitle: imageTitle});
    }

    closeImageViewer(correlationId: string) {
        this.closeImageViewerSub.next(correlationId);
    }

    selectedImageChanged(correlationId: string) {
        this.selectedImageChangedSub.next(correlationId);
    }
}