import {Component, ViewChild, ElementRef, Input, OnChanges} from '@angular/core';
import { SpotifyService } from '../spotify';
import {Subject} from 'rxjs';

import * as L from 'leaflet';
import 'leaflet.awesome-markers';
import 'leaflet-openweathermap';
import 'leaflet-fullscreen';


@Component({
    selector: 'event-map',
    templateUrl: 'event-map.html'
})


export class EventMap {
    @ViewChild('map') mapContainer: ElementRef;
    map: any;
    eventMarkerGroup = L.featureGroup();
    homeMarkerGroup = L.featureGroup();
    searchRadiusCircle;
    bounds;
    mapRendered = false;

    @Input()
    set reloadSubject(s: Subject<any>) {
        s.subscribe(() => {
            console.log('subscribe trigger');
            if (this.map) {
                this.renderMarkers('manual');
                if (this.bounds && this.bounds.isValid()) {
                    this.map.fitBounds(this.bounds);
                } else {
                    this.map.fitWorld();
                }
            } else {
                this.loadmap();
            }

        });

    }


    constructor(
        public spotifyService: SpotifyService
    ) {
        this.spotifyService.radiusChange.subscribe(this.renderMarkers);
        this.spotifyService.dataChange.subscribe(this.renderMarkers);

    }

    static makeMarker(fp) {
        return L.icon({
            iconUrl: fp,
            iconSize: [38, 95], // size of the icon
            iconAnchor: [19, 48], // point of the icon which will correspond to marker's location
        });
    }


    renderMarkers = (x) => {
        if (!this.mapRendered) {
            return;
        }

        this.searchRadiusCircle.setRadius(parseInt(this.spotifyService.searchRadius, 10) * 1609.34);
        this.eventMarkerGroup = L.featureGroup();
        this.spotifyService.data.topArtists.forEach(A => {
            if (A.events) {
                this.spotifyService.withinDistance(A.events).forEach(E => {
                    const title = `${A.name}@${E.venue.displayName}`;
                    const m: any = L.marker([E.venue.lat, E.venue.lng], {
                        icon: EventMap.makeMarker('assets/music.svg'),
                        title: title
                    }).on('click', () => {
                        alert(title);
                    });
                    this.eventMarkerGroup.addLayer(m);
                });
            }

        });
        this.map.addLayer(this.eventMarkerGroup);
        const bounds = this.homeMarkerGroup.getBounds().extend(this.eventMarkerGroup.getBounds());
            if (bounds.isValid()) {
                this.bounds = bounds.pad(1);
                this.map.fitBounds(this.bounds);
            }
    }

    loadmap = () => {
        this.map = L.map('map', {
            fullscreenControl: true,
        }).fitWorld();
        this.homeMarkerGroup = L.featureGroup();


        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 15
        }).addTo(this.map);

        const clouds = L.OWM.clouds({showLegend: false, opacity: 0.5, appId: 'c968ec1bd21cf1577e65d5cba488d516'});
        this.map.addLayer(clouds);

        this.map.locate().on('locationfound', (e) => {
            console.log('mapLoaded')

            this.searchRadiusCircle = L.circle(
                [e.latitude, e.longitude],
                {
                    radius: parseInt(this.spotifyService.searchRadius, 10) * 1609.34,
                    fillOpacity: .1,
                    color: '#663399',
                    stroke: true,
                    weight: 5
                }
            ).addTo(this.map);

            const marker: any = L.marker([e.latitude, e.longitude], {
                icon: EventMap.makeMarker('assets/home.svg')
            }).on('click', () => {
                alert('Marker clicked');
            });

            this.homeMarkerGroup.addLayer(marker);
            this.map.addLayer(this.homeMarkerGroup);

            const bounds = this.homeMarkerGroup.getBounds().extend(this.eventMarkerGroup.getBounds());
            if (bounds.isValid()) {
                this.bounds = bounds.pad(1);
                this.map.fitBounds(this.bounds);
            }
            this.renderMarkers('mapPromise');
            this.mapRendered = true;


        }).on('locationerror', (err) => {
            alert(err.message);
        });


    }

}



