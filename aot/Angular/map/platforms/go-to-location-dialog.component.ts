import { Component, ViewChild } from '@angular/core';
import { Modal } from '../../shared/modal.component';
import { Subject } from 'rxjs/Subject';
import { PlatformMapService } from './platformMap.service';
import { PlatformService } from '../../platforms/platform.service';
import { Platform } from '../../platforms/platform.class';
import { PlatformCommand, CommandName } from '../../patrols/action.class';

@Component({
	selector: 'go-to-location-dialog',
	templateUrl: 'go-to-location-dialog.component.html'
})
export class GoToLocationDialog {
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	public platform: Platform;

	@ViewChild(Modal) goToLocationModal: Modal;

	constructor(private platformService: PlatformService) {
		this.platformService.showGoToLocationDialog
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (platform) => this.show(platform)
			});
	}

	show(platform: Platform) {
		this.platform = platform;
		this.goToLocationModal.show();
	}

	hide() {
		this.goToLocationModal.hide();
	}

	cancelGoToLocation() {
		this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.CancelGoal));
		this.hide();
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}