import {Component, ViewChild, ElementRef, Input, OnChanges} from '@angular/core';
import {IonicPage} from 'ionic-angular';


import {SpotifyService} from '../spotify';
import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import * as L from 'leaflet';
import 'leaflet.awesome-markers';
import 'leaflet-openweathermap';
import 'leaflet-fullscreen';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})



export class Tab1Page {
    @ViewChild('map') mapContainer: ElementRef;
    map: any;
    eventMarkerGroup = L.featureGroup();
    homeMarkerGroup = L.featureGroup();
    searchRadiusCircle;


    constructor(
        public spotifyService: SpotifyService,
        private geolocation: Geolocation,
    ) {
        console.log(this.spotifyService);
        this.spotifyService.radiusChange.subscribe(this.renderMarkers);
        this.spotifyService.dataChange.subscribe(this.renderMarkers);
    }

    ionViewDidEnter() {
        // todo: recenter map here
        this.loadmap();

        this.renderMarkers('manual');
    }

    // todo: map directive, share across tabs
    makeMarker(fp) {
        return L.icon({
                iconUrl: fp,
                iconSize:     [38, 95], // size of the icon
                iconAnchor:   [19, 48], // point of the icon which will correspond to marker's location
        });
    }

    renderMarkers = (x) => {

        if (!this.map || !this.searchRadiusCircle) {
            return;
        }
        this.searchRadiusCircle.setRadius(parseInt(this.spotifyService.searchRadius, 10) * 1609.34);
        this.eventMarkerGroup = L.featureGroup();
          this.spotifyService.data.topArtists.forEach(A => {
              if (A.events) {
                  this.spotifyService.withinDistance(A.events).forEach(E => {
                      const title = `${A.name}@${E.venue.displayName}`;
                      const m: any = L.marker([E.venue.lat, E.venue.lng], {
                          icon: this.makeMarker('assets/music.svg'),
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
              this.map.fitBounds(bounds.pad(1));
            }

    };

    loadmap() {
        if (this.map) return;
        const fullScreenCtrl = L.control.fullscreen();

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

            this.searchRadiusCircle = L.circle(
                [e.latitude, e.longitude],
                {
                    radius: parseInt(this.spotifyService.searchRadius, 10) * 1609.34,
                    fillOpacity : .1,
                    color: '#663399',
                    stroke: true,
                    weight : 5
                }
            ).addTo(this.map);

            const marker: any = L.marker([e.latitude, e.longitude], {
                icon: this.makeMarker('assets/home.svg')
            }).on('click', () => {
                alert('Marker clicked');
            });

            this.homeMarkerGroup.addLayer(marker);
            this.map.addLayer(this.homeMarkerGroup);

            const bounds = this.homeMarkerGroup.getBounds().extend(this.eventMarkerGroup.getBounds());
            if (bounds.isValid()) {
                this.map.fitBounds(bounds.pad(1));
            }


          }).on('locationerror', (err) => {
              alert(err.message);
        });


    }
}



