import { Component } from '@angular/core';
import * as SpotifyWebApi from 'spotify-web-api-js';
import { Storage } from '@ionic/storage';

declare var cordova: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  result = {};
  data = '';
  playlists = [];
  spotifyApi: any;
  loggedIn = false;

  constructor(private storage: Storage) {
    const spotifyBS: any = SpotifyWebApi;
    this.spotifyApi = new spotifyBS();

  }

  authWithSpotify(showLoading = false) {
    const config = {
      clientId: '3a8d17239bfa424eb70ca1ca1d2f2527',
      redirectUrl: 'nd-event-finder://callback',
      scopes: ['streaming', 'playlist-read-private', 'user-read-email', 'user-read-private'],
      tokenExchangeUrl: 'https://nd-event-finder.herokuapp.com/exchange',
      tokenRefreshUrl: 'https://nd-event-finder.herokuapp.com/refresh',
    };


    cordova.plugins.spotifyAuth.authorize(config)
      .then(({ accessToken, encryptedRefreshToken, expiresAt }) => {


        this.result = { access_token: accessToken, expires_in: expiresAt, refresh_token: encryptedRefreshToken };
        this.loggedIn = true;
        this.spotifyApi.setAccessToken(accessToken);
        this.getUserPlaylists();
        this.storage.set('logged_in', true);
      }, err => {
        console.error(err);
      });
  }

  getUserPlaylists() {

    this.spotifyApi.getUserPlaylists()
      .then(data => {
        this.playlists = data.items;
        console.log(this.playlists);
      }, err => {
        console.error(err);
      });
  }



  logout() {
    // Should be a promise but isn't
    cordova.plugins.spotifyAuth.forget();

    this.loggedIn = false;
    this.playlists = [];
    this.storage.set('logged_in', false);
  }

}
