import { Position, Image } from './shared-interfaces';
import { MapLayer } from './map-layer.class';
export enum MapControlPositions {
	TopRight = 0,
	TopLeft = 1,
	BottomRight = 2,
	BottomLeft = 3
}
export class MapCreateOptions {
	Zoom: number = -1;
	Center: L.LatLng = null;
	DoubleClickZoom: boolean = true;
	Dragging: boolean = true;
	Keyboard: boolean = true;
	ScrollWheelZoom: boolean | string = true;
	ZoomControl: boolean = true;
	MinZoom: number = 0;
	MaxZoom: number = 30;
	ZoomControlPosition: MapControlPositions = MapControlPositions.TopRight;
	AttributionControl: boolean = false;
	AttributionControlPosition: MapControlPositions = MapControlPositions.BottomRight;
	AdditionalOptions: any;
}

export class PlatformImageProperties {
	Resolution: number;
	Origin: number[];
	constructor(input: any) {
		if (input !== null) {
			this.deserialize(input);
		}
		else {
			this.Resolution = null;
			this.Origin = null;
		}
	}
	public deserialize(input: any) {

		this.Resolution = input.Resolution;
		this.Origin = [];
		if (input.Origin && input.Origin.length > 0) {
			for (let ii = 0; ii < input.Origin.length; ii++) {
				this.Origin.push(input.Origin[ii]);
			}
		}
	}
}

export class TenantMapSettings {
	public Layers: MapLayer[];
	public AvailableLayers: MapLayer[];
	public AvailableImages: ImageInfo[];

	constructor(input: any) {
		if (input !== null) {
			this.deserialize(input);
		}
		else {
			this.Layers = [];
			this.AvailableLayers = [];
			this.AvailableImages = [];
		}
	}
	public deserialize(input: any) {

		this.Layers = [];
		if (input.Layers && input.Layers.length > 0) {
			for (let ii = 0; ii < input.Layers.length; ii++) {
				this.Layers.push(new MapLayer(input.Layers[ii]));
			}
		}

		this.AvailableLayers = [];
		if (input.AvailableLayers && input.AvailableLayers.length > 0) {
			for (let ii = 0; ii < input.AvailableLayers.length; ii++) {
				this.AvailableLayers.push(new MapLayer(input.AvailableLayers[ii]));
			}
		}

		this.AvailableImages = [];
		if (input.AvailableImages && input.AvailableImages.length > 0) {
			for (let ii = 0; ii < input.AvailableImages.length; ii++) {
				this.AvailableImages.push(new ImageInfo(input.AvailableImages[ii]));
			}
		}
	}
}

export class LocationMapSettings {
	public ZoomLevel: number;
	public MapCenter: Position;
	public Layers: MapLayer[];
	public AvailableLayers: MapLayer[];
	public AvailableImages: ImageInfo[];
	public AvailablePlatformImages: PlatformImageInfo[];

	constructor(input: any) {
		if (input != null) {
			this.deserialize(input);
		}
		else {
			this.Layers = [];
			this.AvailableLayers = [];
			this.AvailableImages = [];
			this.AvailablePlatformImages = [];
		}
	}
	public deserialize(input: any) {
		this.ZoomLevel = input.ZoomLevel;
		if (input.MapCenter) {
			if (input.MapCenter.Coordinates != null) {
				this.MapCenter = { Coordinates: [input.MapCenter.Coordinates[0], input.MapCenter.Coordinates[1]], Type: input.MapCenter.Type };
			}
			else {
				this.MapCenter = { Coordinates: [input.MapCenter.coordinates[0], input.MapCenter.coordinates[1]], Type: input.MapCenter.type };
			}
		}

		this.Layers = [];
		if (input.Layers && input.Layers.length > 0) {
			for (let ii = 0; ii < input.Layers.length; ii++) {
				this.Layers.push(new MapLayer(input.Layers[ii]));
			}
		}

		this.AvailableLayers = [];
		if (input.AvailableLayers && input.AvailableLayers.length > 0) {
			for (let ii = 0; ii < input.AvailableLayers.length; ii++) {
                this.AvailableLayers.push(new MapLayer(input.AvailableLayers[ii]));
			}
		}

		this.AvailableImages = [];
		if (input.AvailableImages && input.AvailableImages.length > 0) {
			for (let ii = 0; ii < input.AvailableImages.length; ii++) {
                this.AvailableImages.push(new ImageInfo(input.AvailableImages[ii]));
			}
		}

		this.AvailablePlatformImages = [];
		if (input.AvailablePlatformImages && input.AvailablePlatformImages.length > 0) {
			for (let ii = 0; ii < input.AvailablePlatformImages.length; ii++) {
                this.AvailablePlatformImages.push(new PlatformImageInfo(input.AvailablePlatformImages[ii]));
			}
		}
	}
}

export class ImageInfo {
	public Id: string;
	public Image: Image;
	public ImageSize: number[];
	public Anchors: Position[];
	public Rotation: number;
	public MapOrigin: Position;
	public IsConstrainedTo90: boolean;
	public IsMaintainAspect: boolean;

	constructor(input: any) {
		if (input != null) {
			this.deserialize(input);
		}
		else {
			this.Id = this.createGUID();
			this.Rotation = 0;
			this.Anchors = [];
			this.IsConstrainedTo90 = true;
			this.IsMaintainAspect = true;
		}
	}

	public deserialize(input: any) {
		this.Id = input.Id ? input.Id : this.createGUID();
		this.Image = new Image(input.Image);
		this.Anchors = [];
		this.Rotation = input.Rotation ? input.Rotation : 0;
		this.IsMaintainAspect = input.IsMaintainAspect ? input.IsMaintainAspect : false;
		this.IsConstrainedTo90 = input.IsConstrainedTo90 ? input.IsConstrainedTo90 : false;

		this.ImageSize = [];
		for (let ii = 0; input.ImageSize && ii < input.ImageSize.length; ii++) {
			this.ImageSize.push(input.ImageSize[ii]);
		}

		for (let ii = 0; input.Anchors && ii < input.Anchors.length; ii++) {
			if (input.Anchors[ii].Coordinates != null)
				this.Anchors.push({ Coordinates: [input.Anchors[ii].Coordinates[0], input.Anchors[ii].Coordinates[1]], Type: input.Anchors[ii].Type });
			else
				this.Anchors.push({ Coordinates: [input.Anchors[ii].coordinates[0], input.Anchors[ii].coordinates[1]], Type: input.Anchors[ii].type });
		}

		if (input.MapOrigin) {
			if (input.MapOrigin.Coordinates != null) {
				this.MapOrigin = { Coordinates: [input.MapOrigin.Coordinates[0], input.MapOrigin.Coordinates[1]], Type: input.MapOrigin.Type };
			}
			else {
				this.MapOrigin = { Coordinates: [input.MapOrigin.coordinates[0], input.MapOrigin.coordinates[1]], Type: input.MapOrigin.type };
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

export class PlatformImageInfo {
	public Id: string;
	public Image: Image;
	public ImageSize: number[];
	public ImageProperties: PlatformImageProperties; 
	public Rotation: number;
	public MapOrigin: Position;
	public Anchors: Position[];

	constructor(input: any) {
		if (input != null) {
			this.deserialize(input);
		}
		else {
			this.Id = this.createGUID();
			this.Rotation = 0;
			this.Anchors = [];
			this.ImageSize = [];
			this.ImageProperties = new PlatformImageProperties(null);
		}
	}

	public deserialize(input: any) {
		this.Id = input.Id ? input.Id : this.createGUID();
        this.Image = new Image(input.Image);
		this.Rotation = input.Rotation ? input.Rotation : 0;

		this.ImageProperties = new PlatformImageProperties(input.ImageProperties);

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
			if (input.Anchors[ii].Coordinates != null)
				this.Anchors.push({ Coordinates: [input.Anchors[ii].Coordinates[0], input.Anchors[ii].Coordinates[1]], Type: input.Anchors[ii].Type });
			else
				this.Anchors.push({ Coordinates: [input.Anchors[ii].coordinates[0], input.Anchors[ii].coordinates[1]], Type: input.Anchors[ii].type });
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

