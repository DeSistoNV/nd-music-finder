import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';


import {SpotifyService} from '../spotify';
import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})



export class Tab1Page {

    constructor(
        public spotifyService: SpotifyService
    ) {}
}



