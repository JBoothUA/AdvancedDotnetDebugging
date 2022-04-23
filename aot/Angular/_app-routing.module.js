var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageNotFound } from './not-found.component';
import { Administrator } from './admin/administrator.component';
import { StateResolveService } from './shared/state-resolve.service';
import { RobotMonitorDynamic } from './platforms/robot-monitor.component';
import { ImageViewerComponent } from '../Angular/shared/media/image-viewer.component';
var appRoutes = [
    // loadChildren here triggers the lazy loading of that module.
    // Any child routing is handled within the module.
    // Dashboard
    { path: '', redirectTo: '/Dashboard', pathMatch: 'full' },
    { path: 'Dashboard', loadChildren: './dashboard/_dashboard.module#DashboardModule' },
    { path: 'Report', loadChildren: './dashboard/_dashboard.module#DashboardModule' },
    // MapView
    { path: 'mapview', redirectTo: '/MapView', pathMatch: 'full' },
    { path: 'MapView', loadChildren: './mapview/_mapview.module#MapViewModule' },
    {
        path: 'RobotMonitor/:id',
        component: RobotMonitorDynamic,
        data: { title: 'Robot Monitor', displayHeader: true },
        resolve: {
            state: StateResolveService
        }
    },
    {
        path: 'RobotMonitorTO/:id/:tearOffMode',
        component: RobotMonitorDynamic,
        data: { title: 'Robot Monitor', displayHeader: false },
        resolve: {
            state: StateResolveService
        }
    },
    {
        path: 'ImageViewer/:correlationId/:tearOffMode/:imageTitle',
        component: ImageViewerComponent,
        data: { title: 'Image Viewer', displayHeader: false },
        resolve: {
            state: StateResolveService
        }
    },
    {
        path: 'Administrator',
        component: Administrator,
        data: { title: 'Map Layers', displayHeader: true },
        resolve: {
            state: StateResolveService
        }
    },
    { path: '**', component: PageNotFound }
];
var SmartCommandRouting = /** @class */ (function () {
    function SmartCommandRouting() {
    }
    SmartCommandRouting = __decorate([
        NgModule({
            imports: [
                RouterModule.forRoot(appRoutes)
            ],
            exports: [
                RouterModule
            ]
        })
    ], SmartCommandRouting);
    return SmartCommandRouting;
}());
export { SmartCommandRouting };
//# sourceMappingURL=_app-routing.module.js.map