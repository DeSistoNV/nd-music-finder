import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventChip } from './event-chip';
import { IonicModule } from '@ionic/angular';

@NgModule({
    imports: [
        CommonModule,
        IonicModule
    ],
    exports: [
        EventChip
    ],
    declarations: [
        EventChip
    ]
})
export class EventChipModule {}
