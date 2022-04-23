import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PageNotFound } from './not-found.component';
import { Administrator } from './admin/administrator.component';
import { StateResolveService } from './shared/state-resolve.service';
import { RobotMonitorDynamic } from './platforms/robot-monitor.component';
import { ImageViewerComponent } from '../Angular/shared/media/image-viewer.component';

const appRoutes: Routes = [
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
		data: { title: 'Image Viewer', displayHeader: false},
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

@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes
        )
    ],
    exports: [
        RouterModule
    ]
})
export class SmartCommandRouting { }