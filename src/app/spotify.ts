import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';

import * as SpotifyWebApi from 'spotify-web-api-js';

declare var cordova: any;

const isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

interface User {
    firstImage?: object;
    images?: Array<object>;
}

interface Artist {
    events?: Array<object>;
    nextEvent?: object;
    name?: string;
}


interface Params {
    access_token?: string;
    refresh_token?: string;
    error?: string;
}

interface Track {
    artists?: Array<Artist>;
    firstArtist?: Artist;
}

interface ApiData {
    user?: User;
    topTracks?: Array<Track>;
    topArtists?: Array<Artist>;
}

@Injectable({
    providedIn: 'root',
})
export class SpotifyService {
    refresh_token;
    loginApi = `https://nd-event-finder.herokuapp.com/login/${!!isMobile.any()}`;
    access_token;
    spotifyApi;
    error;
    data: ApiData = {};
    spotify_limit = 25;

    constructor() {
        const spotifyBS: any = SpotifyWebApi;
        this.spotifyApi = new spotifyBS();
        const params = SpotifyService.getHashParams();
        this.access_token = params.access_token;
        this.refresh_token = params.refresh_token;
        const error = params.error;

        if (error) {
            this.error = JSON.stringify(error);
        } else {
            if (this.access_token) {
                this.spotifyApi.setAccessToken(this.access_token);
                this.loadData();
            }
        }
    }

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
    addEvents(A: Artist) {
        const songKickKey = 'ivWBUlnsQwVDaYvg';
        fetch(`https://api.songkick.com/api/3.0/search/artists.json?apikey=${songKickKey}&query=${A.name}`)
            .then(res => res.json())
            .then(res => {
                if (res.resultsPage.results.artist && res.resultsPage.results.artist.length) {
                    const artistId = res.resultsPage.results.artist[0].id;
                    fetch(`https://api.songkick.com/api/3.0/artists/${artistId}/calendar.json?apikey=${songKickKey}`)
                        .then(events => events.json())
                        .then(events => {
                            A.events = events.resultsPage.results.event;
                            if (A.events && A.events.length) {
                                A.nextEvent = A.events[0];
                            }
                        });
                } else {
                    console.log(`${A.name} not found on SongKick`);
                }

            });
    }


    refreshToken() {
        // document.getElementById('obtain-new-token').addEventListener('click', function() {
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
            scopes: ['user-top-read', 'user-read-birthdate'],
            tokenExchangeUrl: 'https://nd-event-finder.herokuapp.com/exchange',
            tokenRefreshUrl: 'https://nd-event-finder.herokuapp.com/refresh_token',
        };

        cordova.plugins.spotifyAuth.forget();
        cordova.plugins.spotifyAuth.authorize(config)
            .then(({accessToken, encryptedRefreshToken, expiresAt}) => {
                const result = {access_token: accessToken, expires_in: expiresAt, ref: encryptedRefreshToken};
                this.access_token = accessToken;
                this.spotifyApi.setAccessToken(this.access_token);
                this.loadData();
            }, err => {
                alert('error: ' + err);
            });
    }

    logOut() {
        if (isMobile.any()) {
            cordova.plugins.spotifyAuth.forget();
        } else {
            this.access_token = null;
        }
        this.data = {};
    }


    loadData() {

        this.spotifyApi.getMyTopArtists({limit: this.spotify_limit}).then(data => {
            this.data.topArtists = data.items;
            this.data.topArtists.forEach(this.addEvents);
        }, err => {
            console.error(err);
        });

        this.spotifyApi.getMyTopTracks({limit: this.spotify_limit}).then(data => {
            this.data.topTracks = data.items;
            this.data.topTracks.forEach(T => {
                if (T.artists.length) {
                    T.firstArtist = T.artists[0];
                    this.addEvents(T.artists[0]);
                }

            });
            console.log(this.data.topTracks);
        }, err => {
            console.error(err);
        });

        this.spotifyApi.getMe().then(data => {
            this.data.user = data;
            this.data.user.firstImage = this.data.user.images[0];
            console.log('user', this.data.user);
        });
    }

}
