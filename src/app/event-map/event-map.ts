import {Component, Input} from '@angular/core';
import {Event} from '../interface';
import {SpotifyService} from '../spotify';

@Component({
    selector: 'event-chip',
    templateUrl: 'event-chip.html'
})



export class EventChip {
    @Input() event: Event;

    constructor(
        private spotifyService: SpotifyService,
    ) {}

}



