import { LocationMapSettings } from './map-settings.class';
export class Location {
	Id: string;
	Name: string;
	City: string;
	State: string;
	Selected: boolean;
    Priority: string;
	Position: [number, number];
	MapSettings: LocationMapSettings;

	constructor(location: any) {
		this.clone(location);
	}

	clone(input: any): Location {
		this.Id = input.Id;
		this.Name = input.Name;
		this.City = input.City;
		this.State = input.State;
		if (input.Selected)
			this.Selected = input.Selected;
		else
			this.Selected = false;

		if (input.Priority)
			this.Priority = input.Priority;
		else
			this.Priority = '5';

		if (input.MapSettings) {
			this.MapSettings = new LocationMapSettings(input.MapSettings);
		}

		return this;
	}
}