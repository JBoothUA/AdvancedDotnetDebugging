var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './../shared/_shared.module';
import { Administrator } from './administrator.component';
import { MapSettings } from './mapSettings/map-settings.component';
import { LayerDefinition } from './mapSettings/layer-definition.component';
import { UploadDialog } from './upload-dialog.component';
import { LinkMapToRobot } from './link-map-to-robot.component';
import { AdminService } from './admin.service';
import { DragulaModule } from 'ng2-dragula';
import { DropdownModule } from 'primeng/components/dropdown/dropdown';
import { FileUploadModule } from 'primeng/components/fileupload/fileupload';
import { SpinnerModule } from 'primeng/components/spinner/spinner';
import { SliderModule } from 'primeng/components/slider/slider';
import { CheckboxModule } from 'primeng/components/checkbox/checkbox';
import { MultiSelectModule } from 'primeng/components/multiselect/multiselect';
var AdministratorModule = /** @class */ (function () {
    function AdministratorModule() {
    }
    AdministratorModule = __decorate([
        NgModule({
            imports: [CommonModule, FormsModule, SharedModule, DropdownModule,
                SpinnerModule, SliderModule, CheckboxModule, MultiSelectModule, DragulaModule, FileUploadModule],
            providers: [AdminService],
            declarations: [Administrator, MapSettings, LayerDefinition, UploadDialog, LinkMapToRobot],
            exports: [Administrator, MapSettings, LayerDefinition]
        })
    ], AdministratorModule);
    return AdministratorModule;
}());
export { AdministratorModule };
//# sourceMappingURL=_admin.module.js.map