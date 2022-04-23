import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Alarm } from '../../alarms/alarm.class';
import { MapService } from '../map.service';
import { NavigationService } from '../../shared/navigation.service';

export function GetAlarmMarkerId(alarm: Alarm): string {
    return alarm && alarm.Position ? alarm.Position.Coordinates[1] + ',' + alarm.Position.Coordinates[0] : 'Unknown';
}

@Injectable()
export class AlarmMapService extends MapService {
    alarmMarkers: L.SmartCommandMarker[];
	alarmMarkerGroup: L.MarkerClusterGroup;
	mouseOverAlarmMarkerInformation: Alarm = null;

    openOverlappingAlarmsSub: Subject<any> = new Subject();
    refreshOverlappingAlarmsSub: Subject<any> = new Subject();
    closeOverlappingAlarmsSub: Subject<any> = new Subject();
    forceCloseOverlappingAlarmsSub: Subject<any> = new Subject();
    deSelectGroupSub: Subject<any> = new Subject();
    manualZoomMode: boolean = false;

    constructor(protected navigationService: NavigationService) {
        super(navigationService);
        this.alarmMarkers = [];
    }

    setMap(map: L.Map): void {
		super.setMap(map);
		if (map) {

			let curZoom = this.map.getZoom();
			if (curZoom < 10) {
				this.visibleMarkers = false;
			}
			this.alarmMarkerGroup = L.markerClusterGroup({
				iconCreateFunction: (cluster) => {
					let markers = cluster.getAllChildMarkers();

					let childCount = 0;
					let highestPriority = 4;
					let childSelected = false;
					for (let i = 0; i < markers.length; i++) {
						let scMarker = <L.SmartCommandMarker>markers[i];
						childCount += scMarker.Number;
						if (scMarker.HighestPriority < highestPriority) {
							highestPriority = scMarker.HighestPriority;
						}
						if (!childSelected && scMarker.Selected) {
							childSelected = true;
						}
					}

					let classes = 'marker-cluster p' + highestPriority;
					let markerClasses = 'sc-div-icon';
					if (childSelected) {
						classes += ' selected';
					}
					if (!this.visibleMarkers) {
						markerClasses += ' hidden unclickable';
					}

					let icon = new L.DivIcon({ html: '<div class="' + classes + '"><div>' + childCount + '</div></div>', className: markerClasses, iconSize: new L.Point(42, 42) });
					// Need a Selected property but can't extend the DivIcon and using a custom icon causes problems when calling zoomToShowLayer()
					icon['Selected'] = childSelected;
					return icon;
				},
				removeOutsideVisibleBounds: false,
				spiderfyDistanceMultiplier: 3,
				showCoverageOnHover: false,
				chunkedLoading: true
			});

			this.map.addLayer(this.alarmMarkerGroup);
		}
		else {
			this.alarmMarkerGroup = null;
		}
    }

    getMarker(markerId: string): L.SmartCommandMarker {
        return super.getMarker(markerId, this.alarmMarkers);
    }

    zoomToAlarmMarker(markerId: string): void {
        if (!this.visibleMarkers) {
            this.showAlarmMarkers();
        }
        let marker = this.getMarker(markerId);

        if (marker) {
            this.alarmMarkerGroup.zoomToShowLayer(marker, () => {
                if (this.map.getZoom() < 10) {
                    this.zoomTo(marker, 10);
                }
                this.alarmMarkerGroup.zoomToShowLayer(marker);
            });
        }
    }

    panToAlarmMarker(markerId: string): void {
        let marker = this.getMarker(markerId);

        if (marker) {
            let visibleOne = this.alarmMarkerGroup.getVisibleParent(marker);
            if (!visibleOne) {
                visibleOne = marker;
            }

            if (this.map.getZoom() < 10) {
                if (!this.visibleMarkers) {
                    this.showAlarmMarkers();
                }
                this.zoomTo(visibleOne, 10);
            } else {
                this.panTo(visibleOne);
            }
        }
    }

    getAlarmMarkerId(alarm: Alarm): string {
        return GetAlarmMarkerId(alarm);
    }

    createAlarmGroupMarker(markerId: string, alarms: Alarm[]): void {
		// Create marker
		if (!alarms[0].Position) {
			return;
		}

		let icon = new L.SmartCommandIcon({ targetId: markerId });
		let marker = new L.SmartCommandMarker(new L.LatLng(+alarms[0].Position.Coordinates[1], +alarms[0].Position.Coordinates[0]), { icon: icon });
		marker.Number = alarms.length;
		marker.HighestPriority = this.getHighestPriority(alarms);
		marker.Selected = this.anySelectedAlarm(alarms);
		marker.Type = L.ScMarkerTypes.Alarm;
        marker.MarkerId = markerId;
        marker.RefId = markerId;

		if (this.visibleMarkers) {
			this.alarmMarkerGroup.addLayer(marker);
		}
		this.alarmMarkers.push(marker);
    }

    updateGroupMarker(markerId: string, alarms: Alarm[]): void {
        let marker = this.getMarker(markerId);

        if (marker) {
            marker.Number = alarms.length;
            marker.HighestPriority = this.getHighestPriority(alarms);
            marker.Selected = this.anySelectedAlarm(alarms);

            if (!this.alarmMarkerGroup.hasLayer(marker)) {
                this.alarmMarkerGroup.addLayer(marker);
            }
            this.alarmMarkerGroup.refreshClusters(marker);
            super.updateMarker(marker);
        }
    }

    refreshMarker(markerId: string): void {
        super.updateMarker(this.getMarker(markerId));
    }

    removeAlarmMarker(id: string): void {
        let marker = this.getMarker(id);
        if (marker) {
            if (this.visibleMarkers) {
                try {
                    this.alarmMarkerGroup.removeLayer(marker);
                } catch (e) {
                    // Leaflet and Angular don't play well on route change, so ignore this if we are changing routes
                    if (!this.navigationService.RouteChanging) {
                        console.error(e);
                    }
                }
            }

            let index = this.alarmMarkers.indexOf(marker);
            if (index !== -1) {
                this.alarmMarkers.splice(index, 1);
            }
        }
    }

    anySelectedAlarm(alarms: Alarm[]): boolean {
        let selected = false;

        for (let alarm in alarms) {
            if (alarms[alarm].Selected) {
                selected = true;
                break;
            }
        }

        return selected;
    }

    getHighestPriority(alarms: Alarm[]): number {
        if (alarms && alarms.length) {
            let highestPriority = alarms.sort(function (a, b) {
                return a.Priority - b.Priority;
            })[0].Priority;
            return (highestPriority === 0 ? 1 : highestPriority);
        }

        return null;
    }

    getHighestPriorityAlarm(alarms: Alarm[]): Alarm {
        if (alarms && alarms.length) {
            return alarms.sort(function (a, b) {
                let res = 0;

                if (a.Priority === b.Priority) {
                    if (a.ReportedTime !== null && b.ReportedTime !== null) {
                        if (a.ReportedTime < b.ReportedTime) {
                            res = 1;
                        } else {
                            res = -1;
                        }

                    } else if (a.ReportedTime === null && b.ReportedTime === null) {
                        res = 0;
                    } else if (a.ReportedTime === null) {
                        res = 1;
                    } else if (b.ReportedTime === null) {
                        res = -1;
                    }
                } else if (a.Priority < b.Priority) {
                    return -1;
                } else if (a.Priority > b.Priority) {
                    return 1;
                }

                return res;
            })[0];
        }

        return null;
    }

    openOverlappingAlarms(groupName: string, alarms: Alarm[]): void {
        this.openOverlappingAlarmsSub.next({ groupName: groupName, alarms: alarms });
    }

    refreshOverlappingAlarms(groupName: string): void {
        this.refreshOverlappingAlarmsSub.next(groupName);
    }

    closeOverlappingAlarms(groupName: string): void {
        this.closeOverlappingAlarmsSub.next(groupName);
    }

    forceCloseOverlappingAlarms(): void {
        this.forceCloseOverlappingAlarmsSub.next();
    }

    fitMarkers(alarms: Alarm[]): void {
        // If only one alarm is selected, pan to it if it is near the current 
        if (alarms.length === 1) {
            if (alarms[0].Position) {
                let groupName = GetAlarmMarkerId(alarms[0]);
                let marker = this.getMarker(groupName);
                if (marker) {
                    if (marker.Number === 1) {
                        let bounds = this.map.getBounds();
                        let pos = marker.getLatLng();
                        if (!bounds.contains(pos) || !this.visibleMarkers) {
                            this.panToAlarmMarker(groupName);
                        }
                    } else if (marker.Number > 1) {
                        this.panToAlarmMarker(groupName);
                    }
                }
            }
        } else if (alarms.length > 1) {
            let selectedMarkers: L.SmartCommandMarker[] = [];
            for (let alarm in alarms) {
                if (alarms[alarm].Position) {
                    let groupName = GetAlarmMarkerId(alarms[alarm]);
                    let marker = this.getMarker(groupName);
                    if (marker) {
                        if (!selectedMarkers.includes(marker)) {
                            selectedMarkers.push(marker);
                        }
                    }
                }
            }

            if (selectedMarkers.length === 1) {
                // Multiple alarms selected, but they are in the same group so just zoom to it
                this.panToAlarmMarker(GetAlarmMarkerId(alarms[0]));
            } else {
                if (selectedMarkers.length > 0) {
                    if (!this.visibleMarkers) {
                        this.showAlarmMarkers();
                    }
                    let group = L.featureGroup(selectedMarkers);

                    this.map.fitBounds(group.getBounds().pad(0.3));
                }
            }
        }
    }

    deSelectGroupMarker(groupName: string): void {
        this.deSelectGroupSub.next(groupName);
    }

    hideAlarmMarkers(): void {
        if (this.visibleMarkers) {
            try {
                this.alarmMarkerGroup.clearLayers();
            } catch (ex) {
                // Ignore exceptions when removing/adding layers. Leaflet and Marker Cluster throw random exceptions here
                // This is mainly due to using angular components as marker icons
            }

            this.forceCloseOverlappingAlarms();
            this.visibleMarkers = false;
        }
    }

    showAlarmMarkers(): void {
        if (!this.visibleMarkers) {
            try {
                this.alarmMarkerGroup.addLayers(this.alarmMarkers);
            } catch (ex) {
                // Ignore exceptions when removing/adding layers. Leaflet and Marker Cluster throw random exceptions here
                // This is mainly due to using angular components as marker icons
            }
            this.visibleMarkers = true;
        }
    }

    toggleAlarmMarkers(): void {
        if (this.visibleMarkers) {
            this.hideAlarmMarkers();
        } else {
            this.showAlarmMarkers();
        }
    }
}