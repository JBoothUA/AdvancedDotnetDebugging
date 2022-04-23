var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
var WindowMessage = /** @class */ (function () {
    function WindowMessage() {
    }
    return WindowMessage;
}());
export { WindowMessage };
var WindowService = /** @class */ (function () {
    function WindowService() {
        this.onReceiveMessage = new Subject();
        var pathArray = location.href.split('/');
        var protocol = pathArray[0];
        var host = pathArray[2];
        this.url = protocol + '//' + host;
        this.windowHandles = new Map();
        if (window.addEventListener) {
            window.addEventListener("message", this.onMessageReceived.bind(this), false);
        }
        else {
            window.attachEvent("onmessage", this.onMessageReceived.bind(this));
        }
    }
    WindowService.prototype.doesHandleExists = function (key) {
        if (this.windowHandles.has(key)) {
            if (this.windowHandles.get(key).closed) {
                this.killWindowHandle(key);
                return false;
            }
            return true;
        }
        else {
            return false;
        }
    };
    WindowService.prototype.setWindowFocus = function (key) {
        if (this.windowHandles.has(key)) {
            this.windowHandles.get(key).focus();
        }
    };
    WindowService.prototype.newWindowHandle = function (key, windowHandle) {
        this.windowHandles.set(key, windowHandle);
    };
    WindowService.prototype.killWindowHandle = function (key) {
        if (this.windowHandles.has(key)) {
            this.windowHandles.get(key).close();
            this.windowHandles.delete(key);
        }
    };
    WindowService.prototype.pushMessageToWindow = function (windowMessage) {
        if (this.windowHandles.has(windowMessage.windowId) && !this.windowHandles.get(windowMessage.windowId).closed) {
            this.windowHandles.get(windowMessage.windowId).postMessage(windowMessage, this.url);
        }
    };
    WindowService.prototype.pushMessageToParent = function (windowMessage) {
        window.opener.postMessage(windowMessage, this.url);
    };
    WindowService.prototype.killAllWindows = function () {
        var _this = this;
        this.windowHandles.forEach(function (value, key, map) {
            _this.killWindowHandle(key);
        });
    };
    WindowService.prototype.onMessageReceived = function ($event) {
        if ($event.origin !== this.url) {
            return;
        }
        this.onReceiveMessage.next($event.data);
    };
    WindowService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [])
    ], WindowService);
    return WindowService;
}());
export { WindowService };
//# sourceMappingURL=window.service.js.map