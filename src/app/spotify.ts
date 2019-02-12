import {Observable, of} from 'rxjs';
import * as _ from 'lodash';

import {Injectable, } from '@angular/core';

import * as SpotifyWebApi from 'spotify-web-api-js';
import {NativeGeocoder, NativeGeocoderReverseResult} from '@ionic-native/native-geocoder/ngx';
import {Geolocation} from '@ionic-native/geolocation/ngx';

declare var cordova: any;



const isApp = !document.URL.startsWith('http');

interface User {
    firstImage?: object;
    images?: Array<object>;
}

interface Artist {
    events?: Array<object>;
    nextEvent?: object;
    name?: string;
    genres?: Array<string>;
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
    genres: Array<string>;
}

@Injectable({
    providedIn: 'root',
})
export class SpotifyService {
    refresh_token;
    loginApi;
    access_token;
    spotifyApi;
    error;
    lat;
    lng;
    searchRadii = ['50', '100', '250', '500'];
    searchRadius = this.searchRadii[3];
    data: ApiData = {
        genres: []
    };
    spotify_limit = 25;

    constructor(
        private geolocation: Geolocation,
        private nativeGeocoder: NativeGeocoder
    ) {
        this.locate();

        console.log('SpotifyService');

        this.loginApi = `https://nd-event-finder.herokuapp.com/login/${!!isApp}`;
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

    withinDistance(events) {
        const searchRadius = parseInt(this.searchRadius, 10);
        return events.filter(E => this.calculateDistance(E.location.lat, E.location.lng) < searchRadius);
    }

    calculateDistance(lat: number, lng: number) {
        const p = 0.017453292519943295;    // Math.PI / 180
        const c = Math.cos;
        const a = 0.5 - c((this.lat - lat) * p) / 2 + c(lat * p) * c((this.lat) * p) * (1 - c(((this.lng - lng) * p))) / 2;
        const dis = (12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
        return Math.round(dis * 0.621371);
    }

    addEvents(A: Artist) {
        A.events = [];
        const songKickKey = 'ivWBUlnsQwVDaYvg';
        fetch(`https://api.songkick.com/api/3.0/search/artists.json?apikey=${songKickKey}&query=${A.name}`)
            .then(res => res.json())
            .then(res => {
                if (res.resultsPage.results.artist && res.resultsPage.results.artist.length) {
                    const artistId = res.resultsPage.results.artist[0].id;
                    fetch(`https://api.songkick.com/api/3.0/artists/${artistId}/calendar.json?apikey=${songKickKey}`)
                        .then(events => events.json())
                        .then(data => {
                            const events = data.resultsPage.results.event;
                            console.log('events', events);
                            if (events) {
                                A.events = events;
                            }
                        });
                } else {
                    console.log(`${A.name} not found on SongKick`);
                }

            });
    }

    locate() {
        this.geolocation.getCurrentPosition().then((resp) => {
            console.log(resp);
            this.lat = resp.coords.latitude;
            this.lng = resp.coords.longitude;
            this.nativeGeocoder.reverseGeocode(this.lat, this.lng, {
                useLocale: true,
                maxResults: 5
            }).then((result: NativeGeocoderReverseResult[]) => {
                console.log('reverseGeocode', result);
            }).catch((error: any) => console.log(error));

        }).catch((error) => {
            console.log('Error getting location', error);
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
        if (isApp) {
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
        if (isApp) {
            cordova.plugins.spotifyAuth.forget();
        } else {
            this.access_token = null;
        }
        this.data = {
            genres: []
        };
    }


    loadData() {

        this.spotifyApi.getMyTopArtists({limit: this.spotify_limit}).then(data => {
            this.data.topArtists = data.items;
            this.data.topArtists.forEach(this.addEvents);
            const allGenres = [];
            this.data.topArtists.forEach(A => allGenres.push(...A.genres) );
            this.data.genres = allGenres.filter((v, i, a) => a.indexOf(v) === i);
            this.data.genres = this.data.genres
                .sort((a, b) => allGenres.filter(x => x === a).length - allGenres.filter(x => x === b).length);
        }, err => {
            console.error(err);
        });

        this.spotifyApi.getMyTopTracks({limit: this.spotify_limit}).then(data => {
            this.data.topTracks = data.items;
            console.log('Tracks', this.data.topTracks);

            this.data.topTracks.forEach(T => {
                if (T.artists.length) {
                    T.firstArtist = T.artists[0];
                    this.addEvents(T.artists[0]);
                }

            });
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

