import { Component } from '@angular/core';
import * as SpotifyWebApi from 'spotify-web-api-js';
import { IonicPage } from 'ionic-angular';

declare var cordova: any;


interface Params {
  access_token?: string;
  refresh_token?: string;
  error ?: string;
}

const isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

@IonicPage()
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})



export class Tab1Page {


    access_token;
    refresh_token;
    spotifyApi;
    topTracks;
    topArtists;
    songKick_key = 'ivWBUlnsQwVDaYvg';
    error;

    loginApi = `https://nd-event-finder.herokuapp.com/login/${!!isMobile.any()}`;



    static getHashParams() {
        const hashParams: Params = {};
        let e = /([^&;=]+)=?([^&;]*)/g;
        const r = /([^&;=]+)=?([^&;]*)/g;
        const q = window.location.hash.substring(1);
        while (e = r.exec(q) as any) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }
    constructor() {
        const spotifyBS: any = SpotifyWebApi;
        this.spotifyApi = new spotifyBS();
        const params = Tab1Page.getHashParams();
        this.access_token = params.access_token;
        this.refresh_token = params.refresh_token;
        const error = params.error;

        alert('access_token: ' +  this.access_token);
        if (error) {
            this.error = JSON.stringify(error);
        } else {
            if (this.access_token) {
                this.spotifyApi.setAccessToken(this.access_token);
                this.spotifyApi.getMyTopArtists({ limit: 30}).then(data => {
                    this.topArtists = data.items;
                    this.topArtists.forEach(A => {
                        fetch(`https://api.songkick.com/api/3.0/search/artists.json?apikey=${this.songKick_key}&query=${A.name}`)
                            .then(res => res.json())
                            .then(res => {
                                const artistId = res.resultsPage.results.artist[0].id;
                                fetch(`https://api.songkick.com/api/3.0/artists/${artistId}/calendar.json?apikey=${this.songKick_key}`)
                                    .then(events => events.json())
                                    .then(events => {
                                        A.events = events.resultsPage.results.event;
                                        if (A.events && A.events.length) {
                                            A.nextEvent = A.events[0];
                                            console.log(A.nextEvent);
                                        }
                                    });
                            });


                    });


                  }, err => {
                    console.error(err);
                  });
                this.spotifyApi.getMyTopTracks({ limit: 10}).then(data => {
                    this.topTracks = data.items;
                  }, err => {
                    console.error(err);
                  });
              }
            }
        }

    // document.getElementById('obtain-new-token').addEventListener('click', function() {
    refreshToken() {
        fetch('http://localhost:8888/refresh_token',
            {
                body: JSON.stringify({
                    'refresh_token': this.refresh_token
                })
            }).then(res => console.log(res));
    }

    authorize() {
        if (isMobile.any()) {
            this.mobileAuthWithSpotify();
        } else {
            location.href = this.loginApi;

        }
    }

    mobileAuthWithSpotify() {
        const config = {
          clientId: '3a8d17239bfa424eb70ca1ca1d2f2527',
          redirectUrl: 'nd-event-finder://callback',
          scopes: ['user-top-read'],
          tokenExchangeUrl: 'https://nd-event-finder.herokuapp.com/exchange',
          tokenRefreshUrl: 'https://nd-event-finder.herokuapp.com/refresh_token',
        };


    cordova.plugins.spotifyAuth.authorize(config)
      .then(({ accessToken, expiresAt }) => {
          alert(accessToken + '|' + expiresAt);
          this.access_token = accessToken;
          this.spotifyApi.setAccessToken(this.access_token);
      }, err => {
        alert('error: ' + err);
      });
  }


}



