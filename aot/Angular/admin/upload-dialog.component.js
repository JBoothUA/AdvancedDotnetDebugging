var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// Get reference to the global api base url variable
import { Component, ChangeDetectionStrategy, ViewChild, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Modal } from './../shared/modal.component';
import { Tenant } from './../shared/tenant.class';
import { Location } from './../shared/location.class';
import { FileUpload } from 'primeng/components/fileupload/fileupload';
import { HttpService } from './../shared/http.service';
import { fade } from './../shared/animations';
import { UserService } from './../shared/user.service';
var UploadDialog = /** @class */ (function () {
    function UploadDialog(httpService, userService, ref) {
        this.httpService = httpService;
        this.userService = userService;
        this.ref = ref;
        this.showPNGFileUpload = true;
        this.showJSONFileUpload = true;
        this.instructionText = '';
        this.titleText = '';
        this.onUploadComplete = new EventEmitter();
        this.jsonFileSet = false;
        this.pngFileSet = false;
        this.showJsonUploadError = false;
        this.showPNGUploadError = false;
        this.platformImageProperties = null;
        this.isUploading = false;
    }
    UploadDialog.prototype.show = function () {
        this.reset();
        this.upload.show();
    };
    UploadDialog.prototype.reset = function () {
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
    };
    UploadDialog.prototype.isUploadDisabled = function () {
        if (this.showPNGFileUpload && !this.pngFileSet) {
            return true;
        }
        if (this.showJSONFileUpload && !this.jsonFileSet) {
            return true;
        }
        return;
    };
    UploadDialog.prototype.handleOnSelectjsonFile = function (event) {
        var upload = this.jsonFileUpload;
        this.jsonFileSet = (upload.files.length) ? true : false;
        this.showJsonUploadError = false;
        if (this.jsonFileSet) {
            this.selectedJSONFileName = upload.files[0].name;
        }
    };
    UploadDialog.prototype.handleOnSelectPNGFile = function (event) {
        var upload = this.pngFileUpload;
        this.pngFileSet = (upload.files.length) ? true : false;
        this.showPNGUploadError = false;
        if (this.pngFileSet) {
            this.selectedPNGFileName = upload.files[0].name;
        }
    };
    UploadDialog.prototype.handleOnBeforeSend = function (event, fileName) {
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
    };
    UploadDialog.prototype.handleOnJSONUpload = function (event) {
        this.platformImageProperties = JSON.parse(event.xhr.response);
        this.jsonFileSet = false;
        this.selectedJSONFileName = null;
        this.jsonFileUpload.clear();
        this.pngFileUpload.upload();
    };
    UploadDialog.prototype.handleOnPNGUpload = function (event) {
        this.pngFileSet = false;
        this.selectedPNGFileName = null;
        this.pngFileUpload.clear();
        this.upload.hide();
        this.onUploadComplete.emit(JSON.parse(event.xhr.response));
        this.isUploading = false;
        this.platformImageProperties = null;
    };
    UploadDialog.prototype.handleOnUploadJSONError = function (event) {
        this.showJsonUploadError = true;
        this.selectedJSONFileName = null;
        this.jsonFileSet = false;
        this.jsonFileUpload.clear();
        this.platformImageProperties = null;
        this.isUploading = false;
    };
    UploadDialog.prototype.handelOnUploadPNGError = function (event) {
        this.showPNGUploadError = true;
        this.pngFileSet = false;
        this.pngFileUpload.clear();
        this.platformImageProperties = null;
        this.isUploading = false;
        this.selectedPNGFileName = null;
    };
    UploadDialog.prototype.handleOnUploadClick = function (event) {
        this.isUploading = true;
        this.showPNGUploadError = false;
        this.showJsonUploadError = false;
        if (this.showJSONFileUpload) {
            this.jsonFileUpload.upload();
        }
        else {
            this.pngFileUpload.upload();
        }
    };
    UploadDialog.prototype.getConfigString = function () {
        return JSON.stringify({ Resolution: 0.0, Origin: [], ImageSize: null });
    };
    __decorate([
        Input(),
        __metadata("design:type", Location)
    ], UploadDialog.prototype, "location", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Tenant)
    ], UploadDialog.prototype, "tenant", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], UploadDialog.prototype, "showPNGFileUpload", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], UploadDialog.prototype, "showJSONFileUpload", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], UploadDialog.prototype, "instructionText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], UploadDialog.prototype, "titleText", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], UploadDialog.prototype, "onUploadComplete", void 0);
    __decorate([
        ViewChild(Modal),
        __metadata("design:type", Modal)
    ], UploadDialog.prototype, "upload", void 0);
    __decorate([
        ViewChild('jsonFileUpload'),
        __metadata("design:type", FileUpload)
    ], UploadDialog.prototype, "jsonFileUpload", void 0);
    __decorate([
        ViewChild('pngFileUpload'),
        __metadata("design:type", FileUpload)
    ], UploadDialog.prototype, "pngFileUpload", void 0);
    UploadDialog = __decorate([
        Component({
            selector: 'upload-dialog',
            templateUrl: 'upload-dialog.component.html',
            styleUrls: ['upload-dialog.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush,
            animations: [fade]
        }),
        __metadata("design:paramtypes", [HttpService,
            UserService,
            ChangeDetectorRef])
    ], UploadDialog);
    return UploadDialog;
}());
export { UploadDialog };
//# sourceMappingURL=upload-dialog.component.js.map