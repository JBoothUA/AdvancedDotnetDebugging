import { Injectable } from '@angular/core';
import { Tenant } from '../../shared/tenant.class';
import { Location } from '../../shared/location.class';
import { MapService } from '../map.service';
import { NavigationService } from '../../shared/navigation.service';
import { PlatformService } from '../../platforms/platform.service';
import { UserService } from '../../shared/user.service';

class locationMapItem {
    id: string;
    position: [number, number];
    zoom: number;
}

@Injectable()
export class LocationMapService extends MapService {
    locationMarkers: L.SmartCommandMarker[] = [];
    locationMarkerGroup: L.MarkerClusterGroup;

    // Temporary for show, as locations do not currently have a position
    positionMap: locationMapItem[] = [];

    constructor(protected navigationService: NavigationService, protected platformService: PlatformService, protected userService:UserService) {
        super(navigationService);

        //let intergraph: locationMapItem = { id: 'c093abb5-58be-410b-80bf-ca7a52e52ac3', position: [34.674127733327126, -86.74312099814418], zoom: 20 };
        //let hxgn: locationMapItem = { id: '3eae2d1d-f3d8-46c0-b41d-3cd4c8113c16', position: [36.121566227189106, -115.16587972640993], zoom: 21 };
        //let gamma2: locationMapItem = { id: '37e4434b-0d2c-47d0-8bef-033ea5bd28a2', position: [39.65025666441283, -105.07308058440687], zoom: 21 };
        //this.positionMap.push(intergraph);
        //this.positionMap.push(hxgn);
        //this.positionMap.push(gamma2);

        this.visibleMarkers = false;
    }

    getMarker(markerId: string): L.SmartCommandMarker {
        return super.getMarker(markerId, this.locationMarkers);
    }

    setMap(map: L.Map): void {
		super.setMap(map);

		if (map) {

			this.locationMarkerGroup = L.markerClusterGroup({
				removeOutsideVisibleBounds: false,
				spiderfyDistanceMultiplier: 3,
				showCoverageOnHover: false,
				disableClusteringAtZoom: 1,
				chunkedLoading: true
			});
			this.map.addLayer(this.locationMarkerGroup);

			//this.map.on('click', (e: any) => {
			//	console.info('Lat Lon', e.latlng.lat, e.latlng.lng);
			//});
		}
		else {
			this.locationMarkerGroup = null;
		}
    }

    // Temporary for show
	findLocation(locationId: string): Location {
		let tenant = this.userService.currentUser.tenant;
		let loc;
		if (tenant.Locations) {
			loc = tenant.Locations.find((elem) => { return (elem.Id === locationId); });
		}

		if (!loc && this.userService.currentUser.childTenants) {
			for (let childTenant of this.userService.currentUser.childTenants) {
				loc = childTenant.Locations.find((elem) => { return (elem.Id === locationId); });
				if (loc) {
					break;
				}
			}
		}
        //for (let position of this.positionMap) {
        //    if (position.id === locationId) {
        //        return position;
        //    }
        //}

        return loc;
    }

    createLocationMarker(markerId: string, location: Location): void {
        //let obj = this.findLocation(location.Id);
		let pos = location.MapSettings && location.MapSettings.MapCenter ? location.MapSettings.MapCenter : null;
        if (pos) {
            let icon = new L.SmartCommandIcon({ targetId: markerId, iconSize: new L.Point(47, 65), iconAnchor: new L.Point(24,65) });
            let marker = new L.SmartCommandMarker(new L.LatLng(pos.Coordinates[1], pos.Coordinates[0]), { icon: icon });
            marker.RefId = location.Id;
            marker.DisplayName = location.Name;
            marker.Type = L.ScMarkerTypes.Location;
            marker.MarkerId = markerId;

            if (this.visibleMarkers) {
                this.locationMarkerGroup.addLayer(marker);
            }
            this.locationMarkers.push(marker);
        }
    }

    removeLocationMarker(markerId: string): void {
        let marker = this.getMarker(markerId);
        if (marker) {
            if (this.visibleMarkers) {
                try {
                    this.locationMarkerGroup.removeLayer(marker);
                } catch (e) {
                    // Leaflet and Angular don't play well on route change, so ignore this if we are changing routes
                    if (!this.navigationService.RouteChanging) {
                        console.error(e);
                    }
                }
            }

            let index = this.locationMarkers.indexOf(marker);
            if (index !== -1) {
                this.locationMarkers.splice(index, 1);
            }
        }
    }

    zoomToLocation(markerId: string): void {
        let marker = this.getMarker(markerId);

        if (marker) {
            let loc = this.findLocation(marker.RefId);

            if (loc) {
                this.zoomTo(marker, loc.MapSettings.ZoomLevel);
            }
        }
    }

    fitMarkers(): void {
        // If only one location is selected, pan to it if it is near the current 
        if (this.locationMarkers.length === 1) {
            this.zoomToLocation(this.locationMarkers[0].MarkerId);
        } else if (this.locationMarkers.length > 1) {
            let group = L.featureGroup(this.locationMarkers);
            this.map.fitBounds(group.getBounds().pad(0.3));
        }
    }

    hideLocationMarkers(): void {
        if (this.visibleMarkers) {
            try {
                this.locationMarkerGroup.clearLayers();
            } catch (ex) {
                // Ignore exceptions when removing/adding layers. Leaflet and Marker Cluster throw random exceptions here
                // This is mainly due to using angular components as marker icons
            }

            this.visibleMarkers = false;
        }
    }

    showLocationMarkers(): void {
        if (!this.visibleMarkers) {
            try {
                this.locationMarkerGroup.addLayers(this.locationMarkers);
            } catch (ex) {
                // Ignore exceptions when removing/adding layers. Leaflet and Marker Cluster throw random exceptions here
                // This is mainly due to using angular components as marker icons
            }

            this.visibleMarkers = true;
        }
    }
}