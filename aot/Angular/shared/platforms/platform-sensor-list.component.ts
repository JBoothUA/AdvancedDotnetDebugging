import {
    Component, Input, ChangeDetectionStrategy,
    OnInit, ChangeDetectorRef, OnDestroy
} from '@angular/core';
import { Platform } from '../../platforms/platform.class';
import { PlatformService } from '../../platforms/platform.service';
import { Sensor, SensorType, DataValue } from '../shared-interfaces';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'platform-sensor-list',
    templateUrl: 'platform-sensor-list.component.html',
    styleUrls: ['platform-sensor-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformSensorList implements OnInit, OnDestroy {
    @Input() platform: Platform;
    @Input() display: number = 8;

    public SensorType: typeof SensorType = SensorType;
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(private platformService: PlatformService, private ref: ChangeDetectorRef) { }

	public ngOnInit(): void {
        this.platformService.onNewPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({next: (platform) => {
                if(platform.id === this.platform.id) {
                    this.platform = platform;
                    this.ref.markForCheck();
                }
            }
            });

        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                    if (platform.id === this.platform.id) {
                        this.platform = platform;
                        this.ref.detectChanges();
                    }
                }
            });
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public getSensorImg(sensor: any): string {
        if (sensor.Values[0].ImageValue) {
            return "data:image/png;base64," + sensor.Values[0].ImageValue;
        } 

        return null;
    }

    private getSensors(sensors: Sensor[]): Sensor[] {
        return this.platform.Sensors.slice(0, this.display);
    }

	private getSensorValue(dataValue: DataValue): any {
		if (dataValue) {

			if (dataValue.BooleanValue)
				return dataValue.BooleanValue;
			else if (dataValue.DoubleValue)
				return Math.round(dataValue.DoubleValue);
			else if (dataValue.IntValue)
				return dataValue.IntValue;
			else if (dataValue.StringValue)
				return dataValue.StringValue;
			else
				return undefined;
		}
		else {
			return undefined;
		}
    }

    private getSensorIcon(sensorType: SensorType): string {
        switch (sensorType) {
            case SensorType.Gas:
                return '../../Content/Images/Platforms/gas-icon.png';
            case SensorType.Humidity:
                return '../../Content/Images/Platforms/humidity-icon.png';
            case SensorType.Temperature:
                return '../../Content/Images/Platforms/temperature-icon.png';
            case SensorType.PIR:
            case SensorType.Sound:
            case SensorType.Smoke:
            case SensorType.Unknown:
            default:
                return '../../Content/Images/Platforms/temperature-icon.png';

        }
    }

    private getSensorUom(sensorType: SensorType): string {
        switch (sensorType) {
            case SensorType.Gas:
                return '';
			case SensorType.Humidity:
				return '<span class="property-uom">%</span>';
			case SensorType.Temperature:
				return '<span class="property-uom">&#176;F</span>';
            case SensorType.PIR:
            case SensorType.Sound:
            case SensorType.Smoke:
            case SensorType.Unknown:
            default:
                return '';

        }
    }

    private isSimpleSensor(sensorType: SensorType): boolean {
        switch (sensorType) {
            case SensorType.Gas:
            case SensorType.Temperature:
            case SensorType.Humidity:
                return true;
            case SensorType.FLIR:
            default:
                return false;
        }
    }

    public isAllSensorsWaiting(): boolean {
        for (let sensor of this.platform.Sensors) {
            if (this.platform.hasSensorData(sensor))
                return false;
        }

        return true;
    }
}