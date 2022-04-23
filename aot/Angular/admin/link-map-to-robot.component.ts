import { Component, ViewChild, ChangeDetectorRef, Input } from '@angular/core';
import { Modal } from '../shared/modal.component';
import { SelectItem } from 'primeng/components/common/selectitem';
import { Platform } from '../platforms/platform.class';
import { PlatformService } from '../platforms/platform.service';
import { PlatformImageInfo } from '../shared/map-settings.class';
import { AdminService } from './admin.service';

@Component({
	selector: 'link-map-to-robot',
	templateUrl: 'link-map-to-robot.component.html',
	styleUrls: ['link-map-to-robot.component.css'],
})
export class LinkMapToRobot {
	public layerName: string = null;
	public robots: SelectItem[];
	public selectedRobots: Platform[];
	public platformImageInfo: PlatformImageInfo;
	public dialogVisible: boolean = false;
	public animatedOpaque: boolean = false;

	public linkIcon: string = '../../Content/Images/Admin/link-icon-for-dialog.png';
	public linkRobotsMessage: string = 'Choose Robot(s) to link with the Robot Map';

 
	constructor(
		private platformService: PlatformService,
		private changeRef: ChangeDetectorRef,
		private adminService: AdminService) {
	}

	setPlatformInfo(locationId: string, platformImageInfo: PlatformImageInfo, layerName: string) {
		this.layerName = layerName;
		let allPlats = this.platformService.platforms;
		let platforms: Platform[] = [];
		this.selectedRobots = [];
		for (let temp of allPlats) {
			if (temp.LocationId === locationId && temp.IsPatrolSubmitted === false) {
				platforms.push(temp);
			}
		}
		this.robots = [];
		for (let platform of platforms) {
			this.robots.push({ label: platform.DisplayName, value: platform });
		}

		this.platformImageInfo = platformImageInfo;
		this.changeRef.detectChanges();
	}

	linkMapToRobot() {
		let modifiedPlats: Platform[] = [];
		if (this.selectedRobots.length > 0) {
			for (let platform of this.selectedRobots) {
				if (platform.IsPatrolSubmitted === false) {
					let name = this.platformImageInfo.Image.Label;
					let noExt = name.substr(0, name.lastIndexOf('.')) || name;
					platform.Map.ExternalMapId = noExt;
					platform.Map.Name = noExt;
					platform.Map.MapRotation = this.platformImageInfo.Rotation;
					platform.Map.MapOrigin = { coordinates: this.platformImageInfo.MapOrigin.Coordinates.slice(), type: this.platformImageInfo.MapOrigin.Type };
					modifiedPlats.push(platform);
				}
			}
			if (modifiedPlats.length > 0) {
				this.adminService.savePlatforms(modifiedPlats);
			}
			this.hide();
		}
	}

	selectedRobotsChanged(event: any) {
	}

	show() {
		this.dialogVisible = true;
		setTimeout(() => {
			this.animatedOpaque = true;
			this.changeRef.detectChanges();
		});
	}

	hide() {
		this.animatedOpaque = false;
		setTimeout(() => { this.dialogVisible = false; this.changeRef.detectChanges(); }, 400);
	}
	ngOnDestroy(): void {
	}
}