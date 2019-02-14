import {Component, Input} from '@angular/core';
import {Event} from '../interface';
import {SpotifyService} from '../spotify';

@Component({
    selector: 'event-chip',
    templateUrl: 'event-chip.html'
})



export class EventChip {
    _event: Event;
    constructor(
        private spotifyService: SpotifyService,
    ) {}

    @Input() set event(e: Event) {
        console.log('got event', e);
        this._event = e;
    }

}



