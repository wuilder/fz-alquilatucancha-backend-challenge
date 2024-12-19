import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SlotBookedEventHandler } from './handlers/slot-booked-event.handler';
import { SlotAvailableEventHandler } from './handlers/slot-available-event.handler';
import { ClubUpdatedEventHandler } from './handlers/club-updated-event.handler';
import { CourtUpdatedEventHandler } from './handlers/court-updated-event.handler';
import { CacheService } from 'src/application/cache.service';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [CqrsModule, RedisModule], // Importa el módulo CQRS para habilitar la funcionalidad del eventBus
    providers: [
        SlotBookedEventHandler,
        SlotAvailableEventHandler,
        ClubUpdatedEventHandler,
        CourtUpdatedEventHandler,
        CacheService,
    ],
})
export class EventsModule { }