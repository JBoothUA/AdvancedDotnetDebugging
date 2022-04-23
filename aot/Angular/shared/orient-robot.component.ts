import {
	Component, Input, Output, EventEmitter, SimpleChange,
	ChangeDetectionStrategy, ChangeDetectorRef, ViewChild
} from '@angular/core';
import { OrientRobotMap } from './orient-robot-map.component';

@Component({
	selector: 'orient-robot',
	templateUrl: 'orient-robot.component.html',
	styleUrls: ['orient-robot.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrientRobot {
	@Output() onOrientationChange: EventEmitter<string> = new EventEmitter<string>();
	@Input() large: boolean = false;
	@Input() valuePrompt: string = '';
	@Input() orientationValue: string = '0';
	@Input() initialMapZoom: number = 21;
	@Input() dataItems: any;
	@ViewChild(OrientRobotMap) robotMap: OrientRobotMap;

	public orientItems: any[];
	public ocId: string;
	private dragging: boolean = false;
	private offsetX: number = 0;
	private offsetY: number = 0;
	private ocElem: any;

	constructor(private changeRef: ChangeDetectorRef) {
		this.ocId = "orientationChooser-" + this.createGUID();
	}

	ngOnInit() {
		if (!this.dataItems) {
			return;
		}

		if (this.dataItems instanceof Array) {
			this.orientItems = this.dataItems;
		} else {
			this.orientItems = [];
			this.orientItems.push(this.dataItems);
		}
	}

    setUpEvents(): void {
        this.ocElem = $('#' + this.ocId);
        if (this.ocElem.length > 0) {
            this.ocElem.find('img').on('dragstart', false);
            this.ocElem.mousedown((event: any) => { this.onChooserMouseDown(event); });

            $(document).mouseup((event: any) => { this.onBodyMouseUp(event); });
            $(document).mousemove((event: any) => { this.onBodyMouseMove(event); });
        } 
    }

	ngAfterViewInit() {
        this.setUpEvents();
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        setTimeout(() => {
            this.setUpEvents();
        });
        
		if (changes.orientationValue) {
			if (this.robotMap) {
				this.robotMap.setOrientationValue(this.orientationValue);
			}
		}

		if (changes.dataItems) {
			if (this.dataItems instanceof Array) {
				this.orientItems = this.dataItems;
			} else {
				this.orientItems = [];
				this.orientItems.push(this.dataItems);
			}

			if (this.robotMap) {
				this.robotMap.updateDataItems(this.orientItems);
			}
        }

	}

	public getOrientationStyleValue() {
		let value: string = '0';
		if (this.orientationValue && this.orientationValue !== '') {
			value = this.orientationValue;
		}

		let retValue = { 'transform': 'rotate(' + value + 'deg)' };
		return (retValue);
	}

	public setOrientationValue(event: any) {
		this.orientationValue = event.target.value;
		this.changeRef.detectChanges();
		this.onOrientationChange.emit(this.orientationValue);
		if (this.robotMap) {
			this.robotMap.setOrientationValue(this.orientationValue);
		}
	}

	public onChooserMouseDown(event: any) {
		event.stopPropagation();
		this.dragging = true;
	}

	public onBodyMouseMove(event: any) {
		if (this.dragging) {
			let elem = $('#' + this.ocId);
			if (elem.length > 0) {
				this.offsetX = elem.offset().left;
				this.offsetY = elem.offset().top;

				let deg = this.calculateAngle(event.clientX, event.clientY, this.offsetX, this.offsetY);

				this.orientationValue = deg.toString();
				if (this.robotMap) {
					this.robotMap.setOrientationValue(this.orientationValue);
				}
				this.changeRef.detectChanges();
			}
		}
	}

	public onBodyMouseUp(event: any) {
		this.dragging = false;
		this.onOrientationChange.emit(this.orientationValue);
    }

    public refreshMap() {
        if (this.robotMap.map) {
            this.robotMap.map.invalidateSize();
        }

        this.setUpEvents();
    }

	private calculateAngle(clientX: number, clientY: number, offsetX: number, offsetY: number) : number {
		let x1 = offsetX + 38;
		let y1 = offsetY + 38;

		let xp = x1 - clientX;
		let yp = y1 - clientY;

		let deg = (Math.atan2(yp, xp) * (180 / Math.PI));

		if (deg < 0) {
			deg = 360 + deg;
		}

		// Make it point north
		deg = deg - 90;
		if (deg < 0) {
			deg = 360 + deg;
		}

		deg = Math.round(deg);
		if (deg === 360) {
			deg = 0;
		}

		return (deg);
	}

	private createGUID() {
		let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			let cryptoObj = window.crypto;
			let r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});

		return (guid);
	}
}
