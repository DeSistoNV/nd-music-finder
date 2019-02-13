import {Component, ViewChild, ElementRef, Input, OnChanges} from '@angular/core';
import {IonicPage} from 'ionic-angular';


import {SpotifyService} from '../spotify';
import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import * as L from 'leaflet';
import 'leaflet.awesome-markers';

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
        this.spotifyService.radiusChange.subscribe(this.renderMarkers);
        this.spotifyService.dataChange.subscribe(this.renderMarkers);
    }

    ionViewDidEnter() {
        this.loadmap();

        this.renderMarkers('manual');
    }


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
                      console.log(E);
                      const m: any = L.marker([E.venue.lat, E.venue.lng], {
                          icon: this.makeMarker('assets/music.svg'),
                          title: `${A.name}@${E.venue.displayName}`
                      }).on('click', () => {
                          alert('Marker clicked');
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

    }

    loadmap() {
        this.map = L.map('map').fitWorld();
        this.homeMarkerGroup = L.featureGroup();

        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 15
        }).addTo(this.map);

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



