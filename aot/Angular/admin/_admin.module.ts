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

@NgModule({
	imports: [CommonModule, FormsModule, SharedModule, DropdownModule,
		SpinnerModule, SliderModule, CheckboxModule, MultiSelectModule,DragulaModule, FileUploadModule],
	providers: [AdminService],
	declarations: [Administrator, MapSettings, LayerDefinition, UploadDialog, LinkMapToRobot],
	exports: [Administrator, MapSettings, LayerDefinition]
})
export class AdministratorModule { }
