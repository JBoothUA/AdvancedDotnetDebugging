import { Component, Input } from '@angular/core';
import { Alarm } from '../alarms/alarm.class';
import { slideDown } from '../shared/animations';
import { Sensor, SensorType, DataValue } from './../shared/shared-interfaces';

@Component({
	selector: 'slider',
    templateUrl: 'slider.component.html',
    styleUrls: ['slider.component.css'],
})
export class Slider {
	@Input() sensors: Sensor[];
    propertySliderOffset: number = 0;

	ngOnInit(): void {
		for (let index = 0; index < this.sensors.length; index++) {
			let sensor = this.sensors[index];

			if (!this.getSensorValue(sensor.Values[0])) {
				// Remove all sensors with null values
				this.sensors.splice(index, 1);
				index--;
			} else if (sensor.Type === SensorType.FLIR) {
				// Add all FLIR sensor values (assuming only 2 values for now)
				if (sensor.Values.length === 2) {
					let secondValue = $.extend(true, {}, sensor);
					secondValue.Values.splice(0, 1);

					index++;
					this.sensors.splice(index, 0, secondValue);
				}
			}
		}
	}

	getDisplayName(sensor: Sensor): string {
		switch (sensor.Type) {
			case SensorType.FLIR:
				return sensor.DisplayName + ' ' + sensor.Values[0].DisplayName;
			default:
				return sensor.DisplayName;
		}
	}

	getPropertyTypeImage(sensor: Sensor): string {
		let prefix = '../../Content/Images/Alarms/alarm-properties-';
		let suffix = 'unknown';
		switch (sensor.Type) {
            case SensorType.Gas:
				suffix = 'gas'
            case SensorType.Humidity:
				suffix = 'humidity'
            case SensorType.Temperature:
				suffix = 'temperature';
			case SensorType.FLIR:
				if (sensor.Values[0].DisplayName === 'High') {
					suffix = 'flir-high';
				} else if (sensor.Values[0].DisplayName === 'Low') {
					suffix = 'flir-low';
				}
				suffix = 'flir';
			default:
				suffix = 'unknown';
		}

		return (prefix + suffix);
	}

    getPropertyTypeUnitOfMeasure(type: SensorType): string {
		switch (type) {
            case SensorType.Humidity:
				return '%';
			case SensorType.FLIR:
            case SensorType.Temperature:
				return '<span class="property-uom-small">&#176;F</span>'; // degree symbol
			default:
				return '';
		}
    }

    private getSensorValue(dataValue: DataValue): any {
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
}