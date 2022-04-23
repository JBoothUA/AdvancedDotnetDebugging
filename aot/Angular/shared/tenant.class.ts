import { Location } from './location.class';
import { TenantMapSettings } from './map-settings.class';

export class Tenant {
	Id: string;
	TenantId: string;
	ChildrenIds: string[];
	CustomerName: string;
	Locations: Location[];
	ParentId: string;
	Selected: boolean;
	MapSettings: TenantMapSettings;
	ETag: string;
	RowKey: string;
	PartitionKey: string;
	Timestamp: string;
	 

	constructor(tenant: any) {
		this.clone(tenant);
	}

	clone(input: any): Tenant {
		this.Id = input.Id;
		this.TenantId = input.TenantId;
		this.CustomerName = input.CustomerName;
		this.ParentId = input.ParentId;
		this.ETag = input.ETag;
		this.RowKey = input.RowKey;
		this.PartitionKey = input.PartitionKey;
		this.Timestamp = input.Timestamp;
		this.ChildrenIds = [];
		if (input.ChildrenIds && input.ChildrenIds.length > 0) {
			for (let id of input.ChildrenIds) {
				this.ChildrenIds.push(id);
			}
		}

		this.Locations = [];
		if (input.Locations) {
			if (input.Locations.length > 0) {
				for (let location of input.Locations) {
					let l = new Location(location);
					this.Locations.push(l);
				}
			}

		}
		if (input.Selected)
			this.Selected = input.Selected;
		else
			this.Selected = false;

		if (input.MapSettings) {
			this.MapSettings = new TenantMapSettings(input.MapSettings);
		}


		return this;
	}
}