var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, NgZone } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { MediaService } from '../../shared/media/media.service';
import { WindowService, WindowMessage } from '../../shared/window.service';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
var ImageViewerWindow = /** @class */ (function () {
    function ImageViewerWindow() {
        this.imageList = [];
    }
    return ImageViewerWindow;
}());
export { ImageViewerWindow };
var ImageViewerComponent = /** @class */ (function () {
    function ImageViewerComponent(mediaService, windowService, changeDetectorRef, zone, router, route) {
        var _this = this;
        this.mediaService = mediaService;
        this.windowService = windowService;
        this.changeDetectorRef = changeDetectorRef;
        this.zone = zone;
        this.router = router;
        this.route = route;
        this.parentWindowHandleId = 'MAINWINDOW_IMAGEVIEWER';
        this.tearOffWindowIdMap = new Map(); //<correlationId, []>
        this.fullscreenState = false;
        this.popOutState = false;
        this.waitingForImageList = false;
        this.oneImage = false;
        this.imageList = [];
        this.totalDistance = 0;
        this.click = false;
        this.isFullscreenViewerUp = false;
        this.ngUnsubscribe = new Subject();
        this.mediaService.openImageViewerSub
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (obj) { return _this.open(obj.correlationId, obj.images, obj.imageTitle); }
        });
        router.events
            .takeUntil(this.ngUnsubscribe)
            .subscribe(function (event) {
            if (event instanceof NavigationStart && _this.visible) {
                _this.close();
            }
        });
    }
    ImageViewerComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.windowService.onReceiveMessage
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (msg) {
                if (msg.windowId === _this.parentWindowHandleId) {
                    if (msg.data.request === 'request_images') {
                        _this.sendImagesToChild(msg.data.correlationId, msg.data.windowhandleId);
                    }
                    else if (msg.data.request === 'window_closed') {
                        _this.tearOffWindowIdMap.delete(msg.data.correlationId);
                    }
                }
                if (msg.windowId === _this.childWindowHandleId) {
                    _this.open(_this.correlationId, msg.data.imageList, btoa(_this.imageTitle));
                }
            }
        });
        this.routeSub = this.route.params.subscribe(function (params) {
            if (params['tearOffMode']) {
                _this.childWindowHandleId = params['tearOffMode'];
                var id = params['correlationId'];
                var imageTitle = params['imageTitle'];
                if (id && imageTitle) {
                    _this.togglePopOut();
                    _this.open(id, [], imageTitle);
                }
            }
        });
    };
    ImageViewerComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        if (this.popOutState) {
            this.requestImagesFromParent();
            this.zone.runOutsideAngular(function () {
                $(document).keydown(function (e) {
                    if ((e.which || e.keyCode == 116) || (e.keyCode == 65 && e.ctrlKey)) {
                        e.preventDefault();
                    }
                });
            });
            $(window).on('unload', function () {
                _this.notifyParentOnClose();
            });
        }
        this.zone.runOutsideAngular(function () {
            $(document).keydown(function (event) {
                var key = event.which;
                switch (key) {
                    case 37:
                        _this.previousImage();
                        break;
                    case 39:
                        _this.nextImage();
                        break;
                }
                _this.changeDetectorRef.detectChanges();
            });
        });
    };
    ImageViewerComponent.prototype.ngOnDestroy = function () {
        $('body').css('height', '');
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    ImageViewerComponent.prototype.getImageBySource = function () {
        var _this = this;
        var imageProperty = this.imageList.find(function (image) { return image.Uri === _this.selectedUri; });
        return imageProperty;
    };
    ImageViewerComponent.prototype.getImageIndex = function () {
        var _this = this;
        return this.imageList.findIndex(function (image) { return image.Uri === _this.selectedUri; });
    };
    ImageViewerComponent.prototype.getSelectedImage = function () {
        return this.imageList.find(function (image) { return image.Selected === true; });
    };
    ImageViewerComponent.prototype.getImageTitle = function (obj) {
        var imageTitle = 'Image Viewer - ' + obj.Description + ' Alarm (P' + obj.Priority + ')';
        return imageTitle;
    };
    ImageViewerComponent.prototype.loadImage = function () {
        var _this = this;
        this.viewer.load(this.getSelectedImage().Uri);
        this.fullscreenViewer.load(this.getSelectedImage().Uri);
        $(function () {
            _this.zone.runOutsideAngular(function () {
                $('.iv-image-wrap img')
                    .mousedown(function (e) {
                    if (e.which === 1) {
                        _this.click = true;
                        _this.initialX = null;
                        _this.initialY = null;
                        _this.totalDistance = 0;
                        $(window).mousemove(function (event) {
                            if (_this.initialX) {
                                _this.totalDistance += Math.sqrt(Math.pow(_this.initialY - event.clientY, 2) + Math.pow(_this.initialX - event.clientX, 2));
                            }
                            _this.initialX = event.clientX;
                            _this.initialY = event.clientY;
                        });
                    }
                })
                    .mouseup(function (e) {
                    if (_this.click) {
                        $(window).unbind('mousemove');
                        if (_this.totalDistance <= 10) {
                            _this.fullscreenImage();
                        }
                    }
                    _this.click = false;
                });
            });
        });
    };
    ImageViewerComponent.prototype.refresh = function () {
        this.viewer.refresh();
        this.fullscreenViewer.refresh();
    };
    ImageViewerComponent.prototype.open = function (corrId, images, imageTitle) {
        var _this = this;
        if (images === void 0) { images = []; }
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
        }
        else {
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
                $(function () {
                    $('#image-placeholder').ImageViewer();
                    _this.viewer = $('#image-placeholder').data('ImageViewer');
                    _this.fullscreenViewer = ImageViewer();
                    _this.zone.runOutsideAngular(function () {
                        $('.iv-close').click(function () {
                            _this.isFullscreenViewerUp = false;
                            _this.snapViewToggleCSS(1);
                        });
                    });
                    if (_this.popOutState) {
                        _this.isFullscreenViewerUp = true;
                        _this.snapViewToggleCSS();
                    }
                });
            }
            $(function () {
                _this.loadImage();
                _this.zone.runOutsideAngular(function () {
                    $(document).on('keydown.ImageViewer', function (event) {
                        var key = event.which;
                        switch (key) {
                            case 27:
                                if (!_this.isFullscreenViewerUp && !_this.popOutState) {
                                    _this.close();
                                }
                                break;
                            case 70:
                                if (!_this.isFullscreenViewerUp) {
                                    _this.fullscreenImage();
                                }
                                break;
                        }
                        _this.changeDetectorRef.detectChanges();
                    });
                });
            });
            this.changeDetectorRef.markForCheck();
        }
    };
    ImageViewerComponent.prototype.close = function () {
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
    };
    ImageViewerComponent.prototype.previousImage = function () {
        if (this.imageIndex > 0) {
            this.imageIndex = this.imageIndex - 1;
            this.selectImage();
        }
    };
    ImageViewerComponent.prototype.nextImage = function () {
        if (this.imageIndex < this.imageList.length - 1) {
            this.imageIndex = this.imageIndex + 1;
            this.selectImage();
        }
    };
    ImageViewerComponent.prototype.selectImage = function () {
        for (var index in this.imageList) {
            this.imageList[index].Selected = (this.imageIndex === +index);
        }
        this.loadImage();
        this.mediaService.selectedImageChanged(this.correlationId);
    };
    ImageViewerComponent.prototype.onClickImage = function (uri) {
        this.selectedUri = uri;
        this.imageIndex = this.getImageIndex();
        this.selectImage();
    };
    ImageViewerComponent.prototype.fullscreenImage = function () {
        var _this = this;
        this.snapViewToggleCSS();
        this.zone.runOutsideAngular(function () {
            $(document).on('keydown.ImageViewerFullScreen', function (e) {
                var key = e.which;
                switch (key) {
                    case 27:
                        $(document).off('keydown.ImageViewerFullScreen');
                        _this.fullscreenViewer.hide();
                        _this.isFullscreenViewerUp = false;
                        _this.snapViewToggleCSS(1);
                        _this.refresh();
                        break;
                }
            });
        });
        this.fullscreenViewer.show(this.getSelectedImage().Uri);
        this.isFullscreenViewerUp = true;
    };
    ImageViewerComponent.prototype.toggleFullscreen = function () {
        var _this = this;
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
        $(function () {
            _this.refresh();
        });
        this.changeDetectorRef.markForCheck();
    };
    ImageViewerComponent.prototype.snapViewToggleCSS = function (option) {
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
    };
    ImageViewerComponent.prototype.togglePopOut = function () {
        $('body').css('height', '100vh');
        this.popOutState = !this.popOutState;
    };
    ImageViewerComponent.prototype.popToNewWindow = function () {
        var windowHandleId = new Date().getTime().toString();
        var createNewHandle = true;
        //Check if there is already a handle
        if (this.tearOffWindowIdMap.has(this.correlationId)) {
            //Set focus on window
            var windowHandle = this.tearOffWindowIdMap.get(this.correlationId);
            if (this.windowService.doesHandleExists(windowHandle.windowId)) {
                createNewHandle = false;
                this.windowService.setWindowFocus(windowHandle.windowId);
            }
        }
        if (createNewHandle) {
            var windowTearOff = new ImageViewerWindow();
            windowTearOff.windowId = windowHandleId;
            windowTearOff.imageList = this.imageList.map(function (x) { return Object.assign({}, x); });
            this.tearOffWindowIdMap.set(this.correlationId, windowTearOff);
            this.imageViewerWindow = window.open('/ImageViewer/' + this.correlationId + '/' + windowHandleId + '/' + btoa(this.imageTitle), '_blank', 'width=952,height=560');
            this.windowService.newWindowHandle(windowHandleId, this.imageViewerWindow);
        }
        this.close();
    };
    ImageViewerComponent.prototype.requestImagesFromParent = function () {
        var msg = new WindowMessage();
        msg.windowId = this.parentWindowHandleId;
        msg.data = {
            windowhandleId: this.childWindowHandleId,
            request: 'request_images',
            correlationId: this.correlationId
        };
        this.windowService.pushMessageToParent(msg);
    };
    ImageViewerComponent.prototype.notifyParentOnClose = function () {
        var msg = new WindowMessage();
        msg.windowId = this.parentWindowHandleId;
        msg.data = {
            request: 'window_closed',
            correlationId: this.correlationId
        };
        this.windowService.pushMessageToParent(msg);
    };
    ImageViewerComponent.prototype.sendImagesToChild = function (corrId, windowHandleId) {
        var tearOffWindow = this.tearOffWindowIdMap.get(corrId);
        if (tearOffWindow) {
            var msg = new WindowMessage();
            msg.windowId = windowHandleId;
            msg.data = {
                imageList: tearOffWindow.imageList
            };
            this.windowService.pushMessageToWindow(msg);
        }
    };
    __decorate([
        ViewChild('ImageViewer'),
        __metadata("design:type", ElementRef)
    ], ImageViewerComponent.prototype, "ImageViewer", void 0);
    __decorate([
        ViewChild('imageplaceholder'),
        __metadata("design:type", ElementRef)
    ], ImageViewerComponent.prototype, "ImageViewerContainer", void 0);
    ImageViewerComponent = __decorate([
        Component({
            selector: 'image-viewer',
            templateUrl: 'image-viewer.component.html',
            styleUrls: ['image-viewer.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [MediaService, WindowService,
            ChangeDetectorRef, NgZone,
            Router, ActivatedRoute])
    ], ImageViewerComponent);
    return ImageViewerComponent;
}());
export { ImageViewerComponent };
//# sourceMappingURL=image-viewer.component.js.map