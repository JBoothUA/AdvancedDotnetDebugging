import { Position } from './shared-interfaces';
import { PlatformImageProperties } from './map-settings.class';

export enum LayerFormat {
	Tile = 0,
	WMS = 1,
	Image = 2,
	PlatformImage = 3,
	GeoJson = 4
}

export enum LayerType {
	Floorplan = 0,
	RobotMap = 1,
	Custom = 2
}

export class LayerOption {
	public Name: string;
	public Value: string;
	public Type: string;

	constructor(input: any) {
		if (input != null) {
			this.deserialize(input);
		}
		else {
			this.Name = "";
			this.Value = null;
			this.Type = "";
		}
	}

	public deserialize(input: any) {
		this.Name = input.Name;
		this.Value = input.Value;
		this.Type = input.Type;
	}
}

export class MapLayer {
	public Id: string;
	public Name: string;
	public LayerFormat: LayerFormat;
	public LayerType: LayerType;
	public URL: string;
	public WMSLayers: string[];
	public Rotation: number;
	public MapOrigin: Position;
	public ImageName: string;
	public ImageSize: number[];
	public ImageProperties: PlatformImageProperties;
	public IsShownOnStartup: boolean;
	public IsConstrainedTo90: boolean;
	public IsMaintainAspect: boolean;
	public IsMinMaxZoomDefined: boolean;
	public MinZoomLevel: number;
	public MaxZoomLevel: number;
	public Opacity: number;

	public IsSelected: boolean = false;

	public Options: LayerOption[];
	public Anchors: Position[];

	constructor(input: any) {
		if (input != null) {
			this.deserialize(input);
		}
		else {
			this.Id = this.createGUID();
			this.Name = "";
			this.LayerFormat = LayerFormat.Tile;
			this.LayerType = LayerType.Custom;
			this.Rotation = 0;
			this.IsConstrainedTo90 = true;
			this.IsMaintainAspect = true;
			this.IsShownOnStartup = true;
			this.IsMinMaxZoomDefined = false;
			this.MinZoomLevel = 0;
			this.MaxZoomLevel = 18;
			this.Opacity = 1;
			this.Anchors = [];
			this.WMSLayers = [];
			this.Options = [];
			this.ImageName = '';
			this.ImageProperties = null;
			this.ImageSize = null;
		}
	}

	public deserialize(input: any) {
		this.Id = input.Id;
		this.Name = input.Name;
		this.LayerFormat = input.LayerFormat;
		this.LayerType = input.LayerType;
		this.URL = input.URL;
		this.IsShownOnStartup = input.IsShownOnStartup;
		this.IsConstrainedTo90 = input.IsConstrainedTo90;
		this.IsMaintainAspect = input.IsMaintainAspect ? input.IsMaintainAspect : false;
		this.IsMinMaxZoomDefined = input.IsMinMaxZoomDefined;
		this.MinZoomLevel = input.MinZoomLevel;
		this.MaxZoomLevel = input.MaxZoomLevel;
		this.Opacity = input.Opacity;
		this.Rotation = input.Rotation;
		this.ImageName = input.ImageName;

		if (input.ImageProperties) {
			this.ImageProperties = new PlatformImageProperties(input.ImageProperties);
		}

		this.ImageSize = [];
		for (let ii = 0; input.ImageSize && ii < input.ImageSize.length; ii++) {
			this.ImageSize.push(input.ImageSize[ii]);
		}


		if (input.MapOrigin) {
			if (input.MapOrigin.Coordinates != null) {
				this.MapOrigin = { Coordinates: [input.MapOrigin.Coordinates[0], input.MapOrigin.Coordinates[1]], Type: input.MapOrigin.Type };
			}
			else {
				this.MapOrigin = { Coordinates: [input.MapOrigin.coordinates[0], input.MapOrigin.coordinates[1]], Type: input.MapOrigin.type };
			}
		}

		this.Anchors = [];
		for (let ii = 0; input.Anchors && ii < input.Anchors.length; ii++) {
			if (input.Anchors[ii].Coordinates != null) {
				this.Anchors.push({ Coordinates: [input.Anchors[ii].Coordinates[0], input.Anchors[ii].Coordinates[1]], Type: input.Anchors[ii].Type });
			}
			else {
				this.Anchors.push({ Coordinates: [input.Anchors[ii].coordinates[0], input.Anchors[ii].coordinates[1]], Type: input.Anchors[ii].type });
			}
		}

		this.Options = [];
		if (input.Options && input.Options.length > 0) {
			for (let ii = 0; ii < input.Options.length; ii++) {
				let option = new LayerOption(input.Options[ii]);
				this.Options.push(option);
			}
		} 

		this.WMSLayers = [];
		let option: LayerOption = this.Options.find((elem) => { return (elem.Name === 'layers'); });
		if (option) {
			this.WMSLayers = option.Value.split(',');
		}
	}

	public getCommaSeparatedWMSLayers(): string {
		let list: string;
		if (this.WMSLayers && this.WMSLayers.length > 0) {
			list = this.WMSLayers[0];

			for (let ii = 1; ii < this.WMSLayers.length; ii++) {
				list += ',' + this.WMSLayers[ii];
			}
		}
		return (list);
	}

	public addWMSLayer(layer: string) {
		this.WMSLayers.push(layer);
	}

	public removeWMSLayer(layer: string) {
		if (this.WMSLayers && this.WMSLayers.length > 0) {
			let idx = this.WMSLayers.indexOf(layer);
			if (idx !== -1) {
				this.WMSLayers.splice(idx, 1);
			}
		}
	}	

	public createGUID() {
		let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			let cryptoObj = window.crypto;
			let r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});

		return (guid);
	}
}
