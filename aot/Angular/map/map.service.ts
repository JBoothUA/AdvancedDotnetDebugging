import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Platform } from '../platforms/platform.class';
import { Position } from '../shared/shared-interfaces';
import { NavigationService } from '../shared/navigation.service';

@Injectable()
export class MapService {
    baseMaps: any;
    map: L.Map;
    visibleMarkers: boolean = true;
    centerOffsetX: number;
    centerOffsetY: number;

    zoomChanged: Subject<number> = new Subject();

    constructor(protected navigationService: NavigationService) {
        this.centerOffsetX = 0;
        this.centerOffsetY = 0;

        L.Icon.Default.imagePath = '/Content/Images/Leaflet/';
        this.baseMaps = {
            OpenStreetMap: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }),
            MapBox: L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamJvb3RoIiwiYSI6ImNpdXk4MHF2eDA0NnEyb25vNmFxY2N0amkifQ._0rgAd8uU5v7Slxy_X6rZw', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
                maxZoom: 18
            }),
            WMS: L.tileLayer.wms('http://vm-aliens.ingrnet.com/Bldg305/service.svc/get', {
                crs: L.CRS.EPSG3857,
                format: 'image/png',
                transparent: true,
                minZoom: 19,
                maxZoom: 28,
                layers: 'FourthFloor',
                version: '1.3.0'
			}) 
        };
    }

    getMapZoom(): number {
        return this.map.getZoom();
    }

    zoomTo(marker: L.Marker, zoomLevel = 19): void {
        if (marker) {
            let pos = marker.getLatLng();

            let targetPoint = this.map.project(pos, zoomLevel).subtract([this.centerOffsetX, this.centerOffsetY]);
            pos = this.map.unproject(targetPoint, zoomLevel);

            this.map.setView(pos, zoomLevel);
        }
    }

    zoomToMapLocation(position: Position, zoomLevel: number): void {
        if (position) {
            let pos = this.convertPositionToLatLng(position);
            this.map.setView(pos, zoomLevel);
        }

    }

    convertPositionToLatLng(position: Position): L.LatLng {
        let latLng: L.LatLng = L.latLng([position.Coordinates[1], position.Coordinates[0]]);
        return (latLng);
    }

	panTo(marker: L.Marker): void {
		if (this.map) {
			if (marker) {

				let pos = marker.getLatLng();

				let targetPoint = this.map.project(pos, this.map.getZoom()).subtract([this.centerOffsetX, this.centerOffsetY]);
				pos = this.map.unproject(targetPoint, this.map.getZoom());

				this.map.panTo(pos);
			}
		}
    }

    panToCenter(): void {
        let pos = this.map.getCenter();
        let targetPoint = this.map.project(pos, this.map.getZoom()).subtract([this.centerOffsetX, this.centerOffsetY]);
        pos = this.map.unproject(targetPoint, this.map.getZoom());

        this.map.panTo(pos);
    }

    setMap(map: L.Map): void {
        this.map = map;

		if (this.map) {
			this.map.on('zoomend', (e) => {
				this.zoomChanged.next(this.map.getZoom());
			});
		}
	}

    destroyMap(): void {
        if (this.map) {
            try {
				this.map.remove();
				this.map = null;
            }
            catch (e) {
                 // Leaflet and Angular don't play well on route change, so ignore this if we are changing routes
				this.map = null;
				if (!this.navigationService.RouteChanging) {
                    console.error(e);
                }
            }
        }
    }

    refreshMap(): void {
        if (this.map) {
            this.map.invalidateSize({ animate: true });
        }
    }

    protected updateMarker(marker: L.SmartCommandMarker): void {
        marker.update();
    }

    getMarker(markerId: string, list: L.SmartCommandMarker[]): L.SmartCommandMarker {
        let marker = list.filter((val) => {
            return val.MarkerId === markerId;
        });
        return marker.length ? marker[0] : undefined;
    }
}