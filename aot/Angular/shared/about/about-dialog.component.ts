import { Component, ViewChild } from '@angular/core';
import { Modal } from '../../shared/modal.component';
import { Subject } from 'rxjs/Subject';
import { NavigationService } from '../navigation.service';
import { ActivatedRoute, Router, Event as RouterEvent, NavigationStart } from '@angular/router';

@Component({
	selector: 'about-dialog',
	templateUrl: 'about-dialog.component.html',
	styleUrls: ['about-dialog.component.css']
})
export class AboutDialog {
	@ViewChild(Modal) aboutModal: Modal;
	private visible: boolean;
	private ngUnsubscribe: Subject<void> = new Subject<void>();

	constructor(private navigation: NavigationService, private router: Router) {
		this.navigation.openAboutDialogSub
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (obj) => this.show()
			});
		router.events
			.takeUntil(this.ngUnsubscribe)
			.subscribe((event: RouterEvent) => {
				if (event instanceof NavigationStart && this.visible) {
					this.hide();
				}
			});
	}

	ngOnDestroy(): void {
	}

	public show() {
		this.aboutModal.show();
	}

	public hide() {
		this.aboutModal.hide();
	}
}