import {Component} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {SpotifyService} from './spotify';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import {
    NativeGeocoder,
    NativeGeocoderReverseResult,
    NativeGeocoderForwardResult,
    NativeGeocoderOptions
} from '@ionic-native/native-geocoder/ngx';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls : ['app.component.scss']
})
export class AppComponent {
    lat;
    lng;
    locationName;
    searchRadii = [50, 100, 250, 500];
    searchRadius = this.searchRadii[2];

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        public spotifyService: SpotifyService
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
    }




}







