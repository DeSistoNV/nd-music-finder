import { Component } from '@angular/core';
import {SpotifyService} from '../spotify';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
        constructor(
        public spotifyService: SpotifyService
    ) {}
}
