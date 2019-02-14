import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { SpotifyService } from '../spotify';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})

export class Tab1Page {
    viewEnter: Subject<any> = new Subject();


    constructor(
        private spotifyService: SpotifyService
    ) {}

    ionViewDidEnter() {
        this.viewEnter.next();
    }
}



