namespace L {
	export enum ScMarkerTypes {
		Alarm,
		Platform,
        Patrol,
        Location
	}

	export interface SCIconOptions extends L.IconOptions {
		iconDiv: HTMLElement;
		targetId: string;
	}

	export class SmartCommandIcon extends L.Icon {
		options: SCIconOptions = {
			iconUrl: null,
			iconSize: [48, 48],
			iconAnchor: [29, 29],
			popupAnchor: [0, -31],
			iconDiv: null,
			targetId: null
		}

		constructor(options: any) {
			super(options);
		}
	}

	export class SmartCommandMarker extends L.Marker {
		Number: number;
		Data: any;
		PatrolPolyline: L.Polyline;
		HighestPriority: number;
		Selected: boolean = false;
        Type: ScMarkerTypes;
        DisplayName: string;
        RefId: string;
        MarkerId: string;

		constructor(latlng: L.LatLng, options?: L.MarkerOptions) {
			super(latlng, options);
		}

		update(): void {
		}
	}

	export class SmartCommandPolyline extends L.Polyline {
		StartMarker: SmartCommandMarker;
		EndMarker: SmartCommandMarker;
		constructor(latLngs: L.LatLngExpression[], options?: L.PolylineOptions) {
			super(latLngs, options);
		}

		update(): void {
		}
	}
 }