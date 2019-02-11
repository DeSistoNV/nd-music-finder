import { Component } from '@angular/core';
import {SpotifyService} from '../spotify';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})


export class Tab2Page {
      constructor(
        public spotifyService: SpotifyService
    ) {}

}





