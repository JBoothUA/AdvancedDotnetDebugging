export class Image {
	Label: string;
    Uri: string;
    Selected: boolean;
	constructor(input: any) {
		if (input != null) {
			this.deserialize(input);
		}
		else {
			this.Label = '';
			this.Uri = '';
			this.Selected = false;
		}
	}

	deserialize(input: any) {
		this.Label = input.Label;
		this.Uri = input.Uri;
		if (input.Selected) {
			this.Selected = input.Selected;
		}
		else {
			this.Selected = false;
		}
	}
}

export enum CorrelationType {
    Unknown = 0,
    Alarm = 1,
    Patrol = 2,
    Platform = 3
}

export interface Position {
	Coordinates: number[];
	Type: string;
}

export interface PlatformPosition {
    coordinates: number[];
    type: string;
}

export class DataValue {
	Name: string;
	DisplayName: string;
	BooleanValue: boolean;
    StringValue: string;
	IntValue: number;
	DoubleValue: number;
    ImageValue: string;
    type: any;
}

export enum SensorType {
	Unknown = 0,
	Temperature = 1,
	Gas = 2,
	Sound = 3,
	PIR = 4,            // passive infrared
	Light = 5,
	Humidity = 6,
	Smoke = 7,
	TempHumid = 8,
	FLIR = 9
}

export enum PropertyItemType {
	Unknown = 0,
	Boolean = 1,
	String = 2,
	Integer = 3,
	Double = 4,
	Image = 5,
	Hyperlink = 6,
	Temperature = 7,
	Humidity = 8,
	Gas = 9,
	Flir = 10,
	Battery = 11
}

export interface Sensor {
	Type: SensorType;
	Name: string;
    Values: DataValue[];
    DisplayName: string;
}

export class BaseDataObject {
	public Id: string;
	public TenantId: string;
	public Version: number;

	constructor(object: any) {
		this.deserialize(object);
	}

	deserialize(input: any) {
		this.Id = input.Id;
		this.TenantId = input.TenantId;
		this.Version = input.Version;
	}
}

export enum SortType {
    Asc = 0,
    Desc = 1
}