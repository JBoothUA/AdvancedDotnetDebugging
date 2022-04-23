import {
    Component, Input, ChangeDetectionStrategy, ChangeDetectorRef,
    ViewChild, ElementRef, NgZone
} from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { Image, CorrelationType } from '../../shared/shared-interfaces';
import { Alarm } from '../../alarms/alarm.class'
import { MediaService } from '../../shared/media/media.service';
import { WindowService, WindowMessage } from '../../shared/window.service';
import { AlarmService } from '../../alarms/alarm.service';
import { PlatformService } from '../../platforms/platform.service';
import { PatrolService } from '../../patrols/patrol.service';
import { ActivatedRoute, Router, Event as RouterEvent, NavigationStart } from '@angular/router';

declare function ImageViewer(options?: any): void;

export class ImageViewerWindow {
    windowId: string;
    imageList: Image[] = [];
}

@Component({
    selector: 'image-viewer',
    templateUrl: 'image-viewer.component.html',
    styleUrls: ['image-viewer.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ImageViewerComponent {
    @ViewChild('ImageViewer') ImageViewer: ElementRef;
    @ViewChild('imageplaceholder') ImageViewerContainer: ElementRef;
    private childWindowHandleId: string;
    private parentWindowHandleId: string = 'MAINWINDOW_IMAGEVIEWER';
    private tearOffWindowIdMap: Map<string, ImageViewerWindow> = new Map<string, ImageViewerWindow>(); //<correlationId, []>
    private correlationId: string;
    private selectedImage: Image;
    private selectedUri: string;
    private fullscreenState: boolean = false;
    private popOutState: boolean = false;
    private waitingForImageList: boolean = false;
    private oneImage: boolean = false;
    public visible: boolean;
    private imageList: Image[] = [];
    private image: Image;
    private imageTitle: string;
    private imageIndex: number;
    private top: number;
    private left: number;
    private fullscreenIcon: string;
    private routeSub: any;
    private imageViewerWindow: Window;
    private viewer: any;
    private fullscreenViewer: any;
    private initialX: number;
    private initialY: number;
    private totalDistance: number = 0;
    private click: boolean = false;
    private isFullscreenViewerUp: boolean = false;
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(
        private mediaService: MediaService, private windowService: WindowService,
        private changeDetectorRef: ChangeDetectorRef, private zone: NgZone,
        private router: Router, private route: ActivatedRoute,
    ) {
        this.mediaService.openImageViewerSub
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (obj) => this.open(
                    obj.correlationId,
                    obj.images,
                    obj.imageTitle
                )
            });
        router.events
            .takeUntil(this.ngUnsubscribe)
            .subscribe((event: RouterEvent) => {
            if (event instanceof NavigationStart && this.visible) { 
                this.close();
            }
        });
    }

    ngOnInit(): void {
        this.windowService.onReceiveMessage
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (msg) => {
                    if (msg.windowId === this.parentWindowHandleId) {
                        if (msg.data.request === 'request_images') {
                            this.sendImagesToChild(msg.data.correlationId, msg.data.windowhandleId);
                        }
                        else if (msg.data.request === 'window_closed') {
                            this.tearOffWindowIdMap.delete(msg.data.correlationId);
                        }
                    }
                    if (msg.windowId === this.childWindowHandleId) {
                        this.open(this.correlationId, msg.data.imageList, btoa(this.imageTitle));
                    }
                }
            });

        this.routeSub = this.route.params.subscribe(params => {
            if (params['tearOffMode']) {
                this.childWindowHandleId = params['tearOffMode'];
                let id = params['correlationId'];
                let imageTitle = params['imageTitle'];
			    if (id && imageTitle) {
                    this.togglePopOut();                        
                    this.open(id, [], imageTitle);
                }
            }
		});
    }

    ngAfterViewInit(): void {
        if (this.popOutState) {
            this.requestImagesFromParent();
            this.zone.runOutsideAngular(() => {
                $(document).keydown(
                    function (e) {
                        if ((e.which || e.keyCode == 116) || (e.keyCode == 65 && e.ctrlKey)) {
                            e.preventDefault();
                        }
                    }
                );
            });
            $(window).on('unload', () => {
                this.notifyParentOnClose();
            });            
        }
        this.zone.runOutsideAngular(() => {
            $(document).keydown((event) => {
                var key = event.which;
                switch (key) {
                    case 37:
                        this.previousImage();
                        break;
                    case 39:
                        this.nextImage();
                        break;
                }
                this.changeDetectorRef.detectChanges();
            });
        });
    }

    ngOnDestroy() {
        $('body').css('height', '');
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
	}

    getImageBySource(): Image {
        let imageProperty: Image = this.imageList.find(image => image.Uri === this.selectedUri);
        return imageProperty;
    }

	getImageIndex(): number {
        return this.imageList.findIndex(image => image.Uri === this.selectedUri);
    }

    getSelectedImage(): Image {
        return this.imageList.find(image => image.Selected === true);
    }

    getImageTitle(obj: any): string {
        let imageTitle: string = 'Image Viewer - ' + obj.Description + ' Alarm (P' + obj.Priority + ')';
        return imageTitle;
    }

    loadImage(): void {
        this.viewer.load(this.getSelectedImage().Uri);
        this.fullscreenViewer.load(this.getSelectedImage().Uri);
        $(() => {            
            this.zone.runOutsideAngular(() => {
                $('.iv-image-wrap img')
                .mousedown((e) => {
                    if (e.which === 1) {
                        this.click = true;
                        this.initialX = null;
                        this.initialY = null;
                        this.totalDistance = 0;
                        $(window).mousemove((event) => {
                            if (this.initialX) {
                                this.totalDistance += Math.sqrt(Math.pow(this.initialY - event.clientY, 2) + Math.pow(this.initialX - event.clientX, 2));
                            }
                            this.initialX = event.clientX;
                            this.initialY = event.clientY;
                        });
                    }
                })
                .mouseup((e) => {
                    if (this.click) {
                        $(window).unbind('mousemove');
                        if (this.totalDistance <= 10) {
                            this.fullscreenImage();
                        }
                    }
                    this.click = false;
                });
            });
        });
    }

    refresh(): void {
        this.viewer.refresh();
        this.fullscreenViewer.refresh();
    }

    open(corrId: string, images: Image[] = [], imageTitle: string): void {
        if (images.length === 0) {
            //loading screen, waiting on images
            this.waitingForImageList = true;
            this.correlationId = corrId;
            this.imageTitle = atob(imageTitle);
            this.visible = true;
            this.oneImage = true;
            this.fullscreenState = false;
            this.fullscreenIcon = '/Content/images/ImageViewer/fullscreen-icon.png';
            this.changeDetectorRef.markForCheck();
        } else {
            //loaded
            this.waitingForImageList = false;
            this.imageList = images;
            this.correlationId = corrId;
            this.imageTitle = atob(imageTitle);
            this.selectedImage = this.getSelectedImage();
            this.selectedUri = this.selectedImage.Uri;
            this.imageIndex = this.getImageIndex();
            this.visible = true;
            if (this.imageList.length === 1) {
                this.oneImage = true;
            }
            else if (this.imageList.length > 1) {
                this.oneImage = false; //toggle it back to false here if it was once loading
            }
            this.fullscreenState = false;
            this.fullscreenIcon = '/Content/images/ImageViewer/fullscreen-icon.png';
            if (!this.viewer) {
                $(() => {
                    $('#image-placeholder').ImageViewer();
                    this.viewer = $('#image-placeholder').data('ImageViewer');
                    this.fullscreenViewer = ImageViewer();
                    this.zone.runOutsideAngular(() => {
                        $('.iv-close').click(() => {
                            this.isFullscreenViewerUp = false;
                            this.snapViewToggleCSS(1);
                        });
                    });
                    if (this.popOutState) {
                        this.isFullscreenViewerUp = true;
                        this.snapViewToggleCSS();
                    }
                });
            }
            $(() => {
                this.loadImage();
                this.zone.runOutsideAngular(() => {
                    $(document).on('keydown.ImageViewer', (event) => {
                        var key = event.which;
                        switch (key) {
                            case 27:
                                if (!this.isFullscreenViewerUp && !this.popOutState) {
                                    this.close();
                                }
                                break;
                            case 70:
                                if (!this.isFullscreenViewerUp) {
                                    this.fullscreenImage();
                                }
                                break;
                        }
                        this.changeDetectorRef.detectChanges();
                    });
                });                
            });
            this.changeDetectorRef.markForCheck();
        }
    }

    close(): void {
        $(document).off('keydown.ImageViewer');
        $('body').css('height', '');
        this.viewer = this.viewer.destroy();
        $('#iv-container').find('*').not('.iv-close').remove();
        this.imageList[this.imageIndex].Selected = false;
        this.mediaService.selectedImageChanged(this.correlationId);
        this.correlationId = undefined;
        this.selectedUri = undefined;
        this.imageTitle = undefined;
        this.imageIndex = undefined;
        this.imageList = [];
        this.visible = false;
        this.oneImage = false;
        this.fullscreenState = false;
        this.changeDetectorRef.markForCheck();
    }

    previousImage(): void {
        if (this.imageIndex > 0) {
            this.imageIndex = this.imageIndex - 1;
            this.selectImage();
        }
    }

    nextImage(): void {
        if (this.imageIndex < this.imageList.length - 1) {
            this.imageIndex = this.imageIndex + 1;
            this.selectImage();
        }
    }

    selectImage(): void {
        for (let index in this.imageList) {
            this.imageList[index].Selected = (this.imageIndex === +index);
        }
        this.loadImage();
        this.mediaService.selectedImageChanged(this.correlationId);
    }

    onClickImage(uri: string): void {
        this.selectedUri = uri;
        this.imageIndex = this.getImageIndex();
        this.selectImage();
    }

    fullscreenImage(): void {
        this.snapViewToggleCSS();
        this.zone.runOutsideAngular(() => {
            $(document).on('keydown.ImageViewerFullScreen', (e) => {
                var key = e.which;
                switch (key) {
                    case 27:
                        $(document).off('keydown.ImageViewerFullScreen');
                        this.fullscreenViewer.hide();
                        this.isFullscreenViewerUp = false;
                        this.snapViewToggleCSS(1);
                        this.refresh();
                        break;
                }
            });
        });
        this.fullscreenViewer.show(this.getSelectedImage().Uri);
        this.isFullscreenViewerUp = true;
    }

    toggleFullscreen(): void {
        $('body').css('height', '100vh');
        this.fullscreenState = !this.fullscreenState;
        if (this.fullscreenState) {
            this.snapViewToggleCSS();
            this.top = this.ImageViewer.nativeElement.style.top;
            this.left = this.ImageViewer.nativeElement.style.left;
            this.ImageViewer.nativeElement.style.left = 0;
            this.fullscreenIcon = '/Content/images/ImageViewer/fullscreen-minimize.png';
        }
        else if (!this.fullscreenState) {
            this.snapViewToggleCSS();
            this.ImageViewer.nativeElement.style.top = this.top;
            this.ImageViewer.nativeElement.style.left = this.left;
            this.fullscreenIcon = '/Content/images/ImageViewer/fullscreen-icon.png';
        }
        $(() => {
            this.refresh();
        })
        this.changeDetectorRef.markForCheck();
    }

    snapViewToggleCSS(option?: number): void {
        if (!option) {
            if (!$('.iv-snap-view').hasClass('lg')) {
                $('.iv-snap-view').addClass('lg');
                $('.iv-snap-image-wrap').addClass('lg');
                $('.iv-zoom-slider').addClass('lg');
            }
            else if ($('.iv-snap-view').hasClass('lg') && this.fullscreenState || this.popOutState) {
                //nothing
            }
            else {
                $('.iv-snap-view').removeClass('lg');
                $('.iv-snap-image-wrap').removeClass('lg');
                $('.iv-zoom-slider').removeClass('lg');
            }
        }
        else if (option === 1 && !this.fullscreenState && !this.popOutState) {
            //remove only
            $('.iv-snap-view').removeClass('lg');
            $('.iv-snap-image-wrap').removeClass('lg');
            $('.iv-zoom-slider').removeClass('lg');
        }
        this.changeDetectorRef.markForCheck();
    }

    togglePopOut(): void {
        $('body').css('height', '100vh');
        this.popOutState = !this.popOutState;
    }

    public popToNewWindow(): void {
        let windowHandleId: string = new Date().getTime().toString();
        let createNewHandle: boolean = true;

        //Check if there is already a handle
        if (this.tearOffWindowIdMap.has(this.correlationId)) {
            //Set focus on window
            let windowHandle: ImageViewerWindow = this.tearOffWindowIdMap.get(this.correlationId);
                if (this.windowService.doesHandleExists(windowHandle.windowId)) {
                    createNewHandle = false;
                    this.windowService.setWindowFocus(windowHandle.windowId);
                }
        }
        if (createNewHandle) {
            let windowTearOff = new ImageViewerWindow();
            windowTearOff.windowId = windowHandleId;
            windowTearOff.imageList = this.imageList.map(x => Object.assign({}, x));
            this.tearOffWindowIdMap.set(this.correlationId, windowTearOff);
            this.imageViewerWindow = window.open('/ImageViewer/' + this.correlationId + '/' + windowHandleId + '/' + btoa(this.imageTitle), '_blank', 'width=952,height=560');
            this.windowService.newWindowHandle(windowHandleId, this.imageViewerWindow);
        }

        this.close();
    }

    private requestImagesFromParent() {
        let msg = new WindowMessage();
        msg.windowId = this.parentWindowHandleId;
        msg.data = {
            windowhandleId: this.childWindowHandleId,
            request: 'request_images',
            correlationId: this.correlationId
        }
        this.windowService.pushMessageToParent(msg);
    }

    private notifyParentOnClose() {
        let msg = new WindowMessage();
        msg.windowId = this.parentWindowHandleId;
        msg.data = {
            request: 'window_closed',
            correlationId: this.correlationId
        }
        this.windowService.pushMessageToParent(msg);
    }

    private sendImagesToChild(corrId: string, windowHandleId: string) {
        let tearOffWindow = this.tearOffWindowIdMap.get(corrId);
        if (tearOffWindow) {
            let msg = new WindowMessage();
            msg.windowId = windowHandleId;
            msg.data = {
                imageList: tearOffWindow.imageList
            }
            this.windowService.pushMessageToWindow(msg);
        }
    }
}