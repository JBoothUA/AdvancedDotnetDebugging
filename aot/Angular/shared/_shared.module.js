var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FocusDirective } from './focus.directive';
import { DraggableDirective } from './draggable.directive';
import { Modal } from './modal.component';
import { SquareProgressbar } from './square-progressbar.component';
import { CircleProgressbar } from './circle-progressbar.component';
import { ChooserStatus } from './chooser-status.component';
import { MapValuePipe } from './mapValue.pipe';
import { Loading } from './loading.component';
import { OrderPipe } from './reverse.pipe';
import { Slider } from './slider.component';
import { PropertyDisplay } from './property-display.component';
import { ToggleButton } from './toggle-button.component';
import { ConfirmationDialog } from './confirmation-dialog.component';
import { VideoBox } from './video-box.component';
import { LocationFilter } from './location-filter.component';
import { PlatformCommandList } from './platforms/platform-command-list.component';
import { PlatformCommandItemComponent } from './platforms/platform-command-item.component';
import { SayPlayChooser } from './say-play-chooser.component';
import { LocationFilterPipe } from './location-filter.pipe';
import { DropDown } from './dropdown.component';
import { KeysPipe } from './keys.pipe';
import { BatteryLife } from './battery-life.component';
import { RadialMenu } from './radial/radial-menu.component';
import { RadialMenuItem } from './radial/radial-menu-item.component';
import { ImageViewerComponent } from './media/image-viewer.component';
import { OrientRobot } from './orient-robot.component';
import { OrientRobotMap } from './orient-robot-map.component';
import { Popover } from './popover.component';
import { Joystick } from './joystick/joystick.component';
import { RobotCard } from './platforms/robot-card.component';
import { PatrolRobotBaseCard } from './patrol-robot-base-card.component';
import { PlatformSensorList } from './platforms/platform-sensor-list.component';
import { AlarmTable } from './alarms/alarm-table.component';
var SharedModule = /** @class */ (function () {
    function SharedModule() {
    }
    SharedModule = __decorate([
        NgModule({
            imports: [CommonModule, FormsModule],
            declarations: [
                FocusDirective, Modal, SquareProgressbar,
                CircleProgressbar, ChooserStatus,
                MapValuePipe, Loading, OrderPipe, DraggableDirective, Slider, PropertyDisplay,
                ToggleButton, ConfirmationDialog, VideoBox, LocationFilter,
                PlatformCommandItemComponent, SayPlayChooser, LocationFilterPipe, KeysPipe,
                DropDown, PlatformCommandList, RadialMenu, RadialMenuItem, BatteryLife, OrientRobot,
                OrientRobotMap, ImageViewerComponent, Popover, Joystick, RobotCard, PatrolRobotBaseCard, PlatformSensorList, AlarmTable
            ],
            exports: [
                FocusDirective, Modal, CircleProgressbar,
                SquareProgressbar, ChooserStatus,
                MapValuePipe, Loading, OrderPipe, DraggableDirective, Slider,
                ToggleButton, ConfirmationDialog, VideoBox,
                LocationFilter, PropertyDisplay,
                PlatformCommandItemComponent, SayPlayChooser, LocationFilterPipe, KeysPipe,
                DropDown, PlatformCommandList, RadialMenu, RadialMenuItem, BatteryLife, OrientRobot,
                OrientRobotMap, ImageViewerComponent, Popover, Joystick, RobotCard, PatrolRobotBaseCard, PlatformSensorList, AlarmTable
            ]
        })
    ], SharedModule);
    return SharedModule;
}());
export { SharedModule };
//# sourceMappingURL=_shared.module.js.map