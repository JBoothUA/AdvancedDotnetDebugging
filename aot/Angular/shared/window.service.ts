import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';


export class WindowMessage {
    public windowId: string;
    public data: any;
}

@Injectable()
export class WindowService {
    private windowHandles: Map<string, any>;
    private url: string;
    public onReceiveMessage: Subject<WindowMessage> = new Subject<WindowMessage>();
   
    constructor() {
        let pathArray = location.href.split('/');
        let protocol = pathArray[0];
        let host = pathArray[2];
        this.url = protocol + '//' + host;

        this.windowHandles = new Map<string, any>();

        if (window.addEventListener) {
            window.addEventListener("message", this.onMessageReceived.bind(this), false);
        } else {
            (<any>window).attachEvent("onmessage", this.onMessageReceived.bind(this));
        }
    }

    public doesHandleExists(key: string): boolean {
        if (this.windowHandles.has(key)) {
            if (this.windowHandles.get(key).closed) {
                this.killWindowHandle(key);
                return false;
            }
            return true;
        } else {
            return false;
        }
    }

    public setWindowFocus(key: string): void {
        if (this.windowHandles.has(key)) {
            this.windowHandles.get(key).focus();
        }
    }

    public newWindowHandle(key: string, windowHandle: any): void {
        this.windowHandles.set(key, windowHandle);
    }

    public killWindowHandle(key: string): void {
        if (this.windowHandles.has(key)) {
            this.windowHandles.get(key).close();
            this.windowHandles.delete(key);
        }
    }

    public pushMessageToWindow(windowMessage: WindowMessage): void {
        if (this.windowHandles.has(windowMessage.windowId) && !this.windowHandles.get(windowMessage.windowId).closed) {
            this.windowHandles.get(windowMessage.windowId).postMessage(windowMessage, this.url);
        }
    }

    public pushMessageToParent(windowMessage: WindowMessage): void {
        window.opener.postMessage(windowMessage, this.url);
    }

    public killAllWindows(): void {
        this.windowHandles.forEach((value, key, map) => {
            this.killWindowHandle(key);
        });
    }

    public onMessageReceived($event: any): void {
        if ($event.origin !== this.url) {
            return;
        }

        this.onReceiveMessage.next($event.data);
    }
}