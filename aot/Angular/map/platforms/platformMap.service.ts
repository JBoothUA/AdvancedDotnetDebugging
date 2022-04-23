import { Injectable } from '@angular/core';
import { Platform } from '../../platforms/platform.class';
import { Alarm} from '../../alarms/alarm.class';
import { CommandDefinition, PlatformCommand, CommandName, Parameter, ParameterDefinition, ParameterName, ParameterType } from '../../patrols/action.class';
import { PlatformService } from '../../platforms/platform.service';
import { MapService } from '../map.service';
import { AlarmMapService } from '../alarms/alarmMap.service';
import { NavigationService } from '../../shared/navigation.service';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class PlatformMapService extends MapService {
	dropPinSize: number = 42;
	platformMarkers: L.SmartCommandMarker[] = [];
	platformMarkerGroup: L.MarkerClusterGroup;
	platformsVisible: boolean = true;
	interactivePlatform: Platform;
	interactiveCommandDef: CommandDefinition;
	goToLocationMarker: L.SmartCommandMarker;
	dynamicLine: L.Polyline[] = [];
	private keyPressFunc: EventListener;
	manualZoomMode: boolean = false;

	constructor(protected navigationService: NavigationService, protected platformService: PlatformService, protected alarmMapService: AlarmMapService) {
        super(navigationService);
    }

    getMarker(markerId: string): L.SmartCommandMarker {
        return super.getMarker(markerId, this.platformMarkers);
    }

    setMap(map: L.Map): void {
		super.setMap(map);

		if (map) {
			let curZoom = this.map.getZoom();
			if (curZoom < 19) {
				this.visibleMarkers = false;
			}

			this.platformMarkerGroup = L.markerClusterGroup({
				iconCreateFunction: (cluster) => {
					let markers = cluster.getAllChildMarkers();

					let childCount = 0;
					let childSelected = false;
					let labelHtml: string = '';
					let highestStatus = 4;
					for (let i = 0; i < markers.length; i++) {
						let scMarker = <L.SmartCommandMarker>markers[i];
						childCount++;
						if (!childSelected && scMarker.Selected) {
							childSelected = true;
						}

						labelHtml += `<div>${scMarker.DisplayName}</div>`;

						let status = <number>this.platformService.getPlatformStatusPriortyMapping(this.platformService.getPlatform(scMarker.RefId));
						if (status < highestStatus) {
							highestStatus = status;
						}
					}

					let classes = 'platform-marker-wrapper';
					let markerClasses = 'sc-div-icon';
					if (childSelected) {
						classes += ' selected';
					}
					if (!this.visibleMarkers) {
						markerClasses += ' hidden unclickable';
					}

					let iconHtml = `<div class="${classes}">
                                    <div class="platform-marker-inner-wrapper">
                                        <img class="platform-marker-image" src="${this.getPlatformClusterrImageFile(this.platformService.getPlatformStatusPriortyName(highestStatus))}"/>
                                    </div>
                                    <div class="platform-marker-label platform-marker-label-small platform-cluster-label">
                                        ${labelHtml}
                                    </div>
                                    <div class="platform-cluster-number">
                                        ${childCount}
                                    </div>
                                </div>`;

					let icon = new L.DivIcon({ html: iconHtml, className: markerClasses, iconSize: new L.Point(48, 48) });
					// Need a Selected property but can't extend the DivIcon and using a custom icon causes problems when calling zoomToShowLayer()
					icon['Selected'] = childSelected;
					return icon;
				},
				removeOutsideVisibleBounds: false,
				spiderfyDistanceMultiplier: 3,
				showCoverageOnHover: false,
				maxClusterRadius: 40,
				chunkedLoading: true
			});

			this.map.addLayer(this.platformMarkerGroup);
		}
		else {
			this.platformMarkerGroup = null;
		}
    }

    createPlatformMarker(markerId: string, platform: Platform): void {
        if (platform.Position.coordinates) {
            let icon = new L.SmartCommandIcon({ targetId: markerId, iconSize: new L.Point(60, 60) });
            let marker = new L.SmartCommandMarker(new L.LatLng(+platform.Position.coordinates[1], +platform.Position.coordinates[0]), { icon: icon });
            marker.Selected = platform.Selected;
            marker.RefId = platform.id;
            marker.DisplayName = platform.DisplayName;
            marker.Type = L.ScMarkerTypes.Platform;
            marker.MarkerId = markerId;

            if (this.visibleMarkers) {
                this.platformMarkerGroup.addLayer(marker);
            }
			this.platformMarkers.push(marker);
		}
    }

    updatePlatformMarker(markerId: string, platform: Platform): void {
        let marker = this.getMarker(markerId);

        if (marker) {
            marker.Selected = platform.Selected;
            super.updateMarker(marker);
            this.platformMarkerGroup.refreshClusters(marker);
        }
    }

    refreshMarker(markerId: string): void {
        super.updateMarker(this.getMarker(markerId));
    }

    removePlatformMarker(id: string): void {
        let marker = this.getMarker(id);

        if (marker) {
            if (this.visibleMarkers) {
                try {
                    this.platformMarkerGroup.removeLayer(marker);
                } catch (e) {
                    // Leaflet and Angular don't play well on route change, so ignore this if we are changing routes
                    if (!this.navigationService.RouteChanging) {
                        console.error(e);
                    }
                }
            }

            let index = this.platformMarkers.indexOf(marker);
            if (index !== -1) {
                this.platformMarkers.splice(index, 1);
            }
        }
    }

    movePlatformMarker(markerId: string, platform: Platform): void {
        let marker = this.getMarker(markerId);

        if (marker && platform.Position.coordinates) {
            marker.setLatLng(new L.LatLng(+platform.Position.coordinates[1], +platform.Position.coordinates[0]));
        }
    }

	zoomToPlatformMarker(markerId: string): void {
		if (this.map) {
			if (!this.visibleMarkers) {
				this.showPlatformMarkers();
			}
			let marker = this.getMarker(markerId);

			if (marker) {
				this.platformMarkerGroup.zoomToShowLayer(marker, () => {
					this.zoomTo(marker, 21);
				});
			}
		}
	}

	createPlatformMarkerNotification(markerId: string, content: string, className?: string) {
		let popup = L.popup({ className: className, closeButton: false, closeOnClick: false, autoPan: false });
		popup.setContent(content);
		let marker = this.getMarker(markerId);
		if (marker) {
			marker.bindPopup(popup).openPopup();
			setTimeout(() => {
				marker.closePopup();
				marker.unbindPopup();
			}, 6000); // Notify for 6 seconds.
		}
	}

    panIfOutOfView(markerId: string): void {
        if (!this.visibleMarkers) {
            this.showPlatformMarkers();
        }

        let marker = this.getMarker(markerId);
        let bounds = this.map.getBounds();
        let pos = marker.getLatLng();
        if (!bounds.contains(pos)) {
            this.panToPlatformMarker(markerId);
        } else {
            if (this.map.getZoom() < 19) {
                this.zoomToPlatformMarker(markerId);
            }
        }
    }

	panToPlatformMarker(markerId: string): void {
		if (this.map) {
			if (!this.visibleMarkers) {
				this.showPlatformMarkers();
			}
			let marker = this.getMarker(markerId);

			if (marker) {
				this.zoomTo(marker);
			}
		}
    }

    getPlatformMarkerImage(platform: Platform): string {
        let status = this.platformService.getPlatformStatusClass(platform);
        return this.getPlatformMarkerImageFile(status);
    }

    getPlatformMarkerImageFile(status: string): string {
        switch (status) {
            case 'failed':
                return '/Content/images/Platforms/single-robot-red.png';
            case 'warning':
                return '/Content/images/Platforms/single-robot-amber.png';
            default:
                return '/Content/images/Platforms/single-robot-green.png';
        }
    }

    getPlatformClusterrImageFile(status: string): string {
        switch (status) {
            case 'failed':
                return '/Content/images/Platforms/multiple-robots-red.png';
            case 'warning':
                return '/Content/images/Platforms/multiple-robots-amber.png';
            default:
                return '/Content/images/Platforms/multiple-robots-green.png';
        }
    }

    hidePlatformMarkers(): void {
        if (this.visibleMarkers) {
            try {
                this.platformMarkerGroup.clearLayers();
				if (this.goToLocationMarker) {
					this.map.removeLayer(this.goToLocationMarker);
				}
            } catch (ex) {
                // Ignore exceptions when removing/adding layers. Leaflet and Marker Cluster throw random exceptions here
                // This is mainly due to using angular components as marker icons
            }
            this.visibleMarkers = false;
        }
    }

    showPlatformMarkers(): void {
        if (!this.visibleMarkers) {
            try {
				this.platformMarkerGroup.addLayers(this.platformMarkers);
				if (this.goToLocationMarker) {
					this.map.addLayer(this.goToLocationMarker);
				}
            } catch (ex) {
                // Ignore exceptions when removing/adding layers. Leaflet and Marker Cluster throw random exceptions here
                // This is mainly due to using angular components as marker icons
            }
            this.visibleMarkers = true;
        }
    }

    togglePlatformMarkers(): void {
        if (this.visibleMarkers) {
            this.hidePlatformMarkers();
        } else {
            this.showPlatformMarkers();
        }
	}

	setGoToLocationMode(platform: Platform, commandDef?: CommandDefinition) {
		this.interactivePlatform = platform;
		if (commandDef) {
			this.interactiveCommandDef = commandDef
		} else {
			let defaultCommand = new CommandDefinition();
			defaultCommand.CommandName = CommandName.GoToLocation;
			this.interactiveCommandDef = defaultCommand;
		}
		
		this.setGoToLocationCursor();

		if (this.map) {
			this.map.on('click', this.onMapClick, this);
			this.map.on('mousemove', this.onMapDynamicPoint, this);
		}

		this.keyPressFunc = this.onMapKeypress.bind(this);
		document.addEventListener('keydown', this.keyPressFunc, true);
	}

	stopInteractiveMode() {
		this.interactivePlatform = null;
		this.interactiveCommandDef = null;
		this.resetMouse();
	}

	setGoToLocationCursor() {
		let dropPinCenter = this.dropPinSize / 2;
		document.getElementById('map').style.cursor = `url("content/images/platforms/go-to-location.png") ${dropPinCenter} ${dropPinCenter}, crosshair`;

		// Set cursor for all Alarm Icons
		$('.sc-marker, .sc-marker-icon').css('cursor', 'url("content/images/platforms/go-to-alarm.png"), crosshair');
	}

	resetMouse() {
		this.removeDynamics();

		this.map.off('click', this.onMapClick, this);
		this.map.off('mousemove', this.onMapDynamicPoint);
		if (this.keyPressFunc) {
			document.removeEventListener('keydown', this.keyPressFunc, true);
			this.keyPressFunc = null;
		}

		// Reset the cursor
		document.getElementById('map').style.cursor = '';
		$('.sc-marker, .sc-marker-icon').css('cursor', '');
	}

	onMapClick(e: any) {
		this.sendGoToLocationCommand(e.latlng, this.alarmMapService.mouseOverAlarmMarkerInformation);
	}

	sendGoToLocationCommand(latLng: L.LatLng, alarm: Alarm) {
		let platformCommand = new PlatformCommand(this.interactivePlatform.id, this.interactiveCommandDef.CommandName, this.getParameters(latLng, alarm));
		this.platformService.executePlatformCommand(platformCommand, this.interactivePlatform.TenantId);

		this.stopInteractiveMode();
	}

	addGoToLocationIcon(latLng: L.LatLng, platformId?: string, displayName?: string) {
		let robotId = (platformId || this.interactivePlatform.id);
		let icon = L.icon({
			iconUrl: 'content/images/platforms/go-to-location.png',
			iconSize: [this.dropPinSize, this.dropPinSize],
			className: 'go-to-location-icon-' + robotId
		});

		this.goToLocationMarker = new L.SmartCommandMarker(latLng, { icon: icon, title: 'Go to Location - ' + (displayName || robotId) });
		this.goToLocationMarker.on('click', function () { this.openGoToLocationDialog(platformId || this.interactivePlatform.id) }, this);

		if (this.visibleMarkers) {
			this.goToLocationMarker.addTo(this.map);
		}
	}

	openGoToLocationDialog(platformId: string) {
		let platform = this.platformService.getPlatform(platformId);
		this.platformService.showGoToLocationDialog.next(platform);
	}

	getParameters(latLng: L.LatLng, alarm: Alarm): Parameter[] {
		if (alarm) {
			let positionParam = new Parameter(null);
			positionParam.Name = ParameterName.Position;
			positionParam.Type = ParameterType.Double;
			positionParam.Value = `${alarm.Position.Coordinates[1]}, ${alarm.Position.Coordinates[0]}`;

			let alarmIdParam = new Parameter(null);
			alarmIdParam.Name = ParameterName.AlarmId;
			alarmIdParam.Type = ParameterType.String;
			alarmIdParam.Value = this.alarmMapService.mouseOverAlarmMarkerInformation.Id;

			return [positionParam, alarmIdParam];
		} else if (latLng) {
			let positionParam = new Parameter(null);
			positionParam.Name = ParameterName.Position;
			positionParam.Type = ParameterType.Double;
			positionParam.Value = `${latLng.lat}, ${latLng.lng}`;

			return [positionParam];
		}		
	}

	removeGoToLocationIcon() {
		if (this.goToLocationMarker) {
			this.goToLocationMarker.removeFrom(this.map);
		}
	}

    removeGoToLocationIconHandler() {
		return () => this.removeGoToLocationIcon();
	}

	onMapDynamicPoint(e: any) {
		// Sets a dynamic polyline from the platform to the cursor
		if (!this.interactivePlatform)
			return;

		let pts: any[] = [];
		let lat = this.interactivePlatform.Position.coordinates[1];
		let lng = this.interactivePlatform.Position.coordinates[0];
		pts[0] = L.latLng([lat, lng]);
		pts[1] = e.latlng;

		if (!this.dynamicLine[0]) {
			let dynamicPathOptions = { color: '#7F5CB3', dashArray: '5,10', weight: 5, interactive: false };
			this.dynamicLine[0] = L.polyline(pts, dynamicPathOptions);
			this.platformMarkerGroup.addLayer(this.dynamicLine[0]);
		} else {
			this.dynamicLine[0].setLatLngs(pts);
		}
	}

	private onMapKeypress(e: any) {
		if (e.code === 'Escape') {
			e.stopPropagation();
			this.stopInteractiveMode();
		}
	}

	private removeDynamics() {
		if (this.dynamicLine[0]) {
			this.platformMarkerGroup.removeLayer(this.dynamicLine[0]);
			this.dynamicLine[0] = null;
		}
	}
}