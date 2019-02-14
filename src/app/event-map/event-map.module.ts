import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventMap } from './event-map';
import { IonicModule } from '@ionic/angular';

@NgModule({
    imports: [
        CommonModule,
        IonicModule
    ],
    exports: [
        EventMap
    ],
    declarations: [
        EventMap
    ],
    providers: [
    ]
})
export class EventMapModule {}
