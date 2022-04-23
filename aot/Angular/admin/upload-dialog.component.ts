// Get reference to the global api base url variable
import {
    Component, ChangeDetectionStrategy,
    ViewChild, Input, Output, EventEmitter, ChangeDetectorRef
} from '@angular/core';

import { Modal } from './../shared/modal.component';
import { Tenant } from './../shared/tenant.class';
import { Location } from './../shared/location.class';
import { FileUpload } from 'primeng/components/fileupload/fileupload';
import { HttpService } from './../shared/http.service';
import { fade } from './../shared/animations';
import { UserService } from './../shared/user.service';
import { PlatformImageInfo } from '../shared/map-settings.class';
import { Image } from '../shared/shared-interfaces';

@Component({
    selector: 'upload-dialog',
    templateUrl: 'upload-dialog.component.html',
    styleUrls: ['upload-dialog.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [fade]
})
export class UploadDialog {
	@Input() location: Location;
	@Input() tenant: Tenant;
    @Input() showPNGFileUpload: boolean = true;
    @Input() showJSONFileUpload: boolean = true;
    @Input() instructionText: string = '';
    @Input() titleText: string = '';

    @Output() onUploadComplete: EventEmitter<Image | PlatformImageInfo> = new EventEmitter<Image | PlatformImageInfo>();

    @ViewChild(Modal) upload: Modal;
    @ViewChild('jsonFileUpload') jsonFileUpload: FileUpload;
    @ViewChild('pngFileUpload') pngFileUpload: FileUpload;

    private jsonFileSet: boolean = false;
    private pngFileSet: boolean = false;
    private showJsonUploadError: boolean = false;
    private showPNGUploadError: boolean = false;
    private platformImageProperties: any = null;
    public isUploading: boolean = false;
    private selectedJSONFileName: string;
    private selectedPNGFileName: string;

    constructor(private httpService: HttpService,
                private userService: UserService,
                private ref: ChangeDetectorRef) { }

    public show(): void {
        this.reset();
        this.upload.show();
    }

    private reset(): void {
        this.jsonFileSet = false;
        this.pngFileSet = false;
        this.showJsonUploadError = false;
        this.showPNGUploadError = false;
        this.platformImageProperties = null;
        this.isUploading = null;
        this.selectedJSONFileName = null;
        this.selectedPNGFileName = null;
        if (this.showPNGFileUpload) {
            this.pngFileUpload.clear();
        }
        if (this.showJSONFileUpload) {
            this.jsonFileUpload.clear();
        }
        this.ref.detectChanges();
    }

    public isUploadDisabled(): boolean {
        if (this.showPNGFileUpload && !this.pngFileSet) {
            return true;
        }

        if (this.showJSONFileUpload && !this.jsonFileSet) {
            return true;
        }

        return;
    }

    private handleOnSelectjsonFile(event: any): void {
        let upload = this.jsonFileUpload;
        this.jsonFileSet = (upload.files.length) ? true : false;
        this.showJsonUploadError = false;

        if (this.jsonFileSet) {
            this.selectedJSONFileName = upload.files[0].name;
        }  
    }

    private handleOnSelectPNGFile(event: any): void {
        let upload = this.pngFileUpload;
        this.pngFileSet = (upload.files.length) ? true : false;
        this.showPNGUploadError = false;
        if (this.pngFileSet) {
            this.selectedPNGFileName = upload.files[0].name;
        }    
    }

    private handleOnBeforeSend(event: any, fileName: string): void {
        event.xhr.setRequestHeader('Authorization', this.httpService.getApiAuthorizationHeader());
        event.formData.append("userData", JSON.stringify({
			tenantId: this.tenant.Id,
            locationId: this.location.Id,
            fileName: fileName
        }));
//		tenantId: this.userService.currentUser.tenant.Id,

        if (this.platformImageProperties) {
            event.formData.append("platformImageProperties", JSON.stringify(this.platformImageProperties));
        }
    }

    private handleOnJSONUpload(event: any): void {
        this.platformImageProperties = JSON.parse(event.xhr.response);
        this.jsonFileSet = false;
        this.selectedJSONFileName = null;
        this.jsonFileUpload.clear();

        this.pngFileUpload.upload();
    }

    private handleOnPNGUpload(event: any): void {
        this.pngFileSet = false;
        this.selectedPNGFileName = null;
        this.pngFileUpload.clear();

        this.upload.hide();
        this.onUploadComplete.emit(JSON.parse(event.xhr.response));
        
        this.isUploading = false;
        this.platformImageProperties = null;
    }

    private handleOnUploadJSONError(event: any): void {
        this.showJsonUploadError = true;
        this.selectedJSONFileName = null;
        this.jsonFileSet = false;
        this.jsonFileUpload.clear();
        this.platformImageProperties = null;
        this.isUploading = false;
    }

    private handelOnUploadPNGError(event: any): void {
        this.showPNGUploadError = true;
        this.pngFileSet = false;
        this.pngFileUpload.clear();
        this.platformImageProperties = null;
        this.isUploading = false;
        this.selectedPNGFileName = null;
    }

    public handleOnUploadClick(event: any): void {
        this.isUploading = true;
        this.showPNGUploadError = false;
        this.showJsonUploadError = false;

        if (this.showJSONFileUpload) {
            this.jsonFileUpload.upload();
        } else {
            this.pngFileUpload.upload();
        }
    }

    private getConfigString(): string {
        return JSON.stringify({ Resolution: 0.0, Origin: [], ImageSize: null });
    }
}