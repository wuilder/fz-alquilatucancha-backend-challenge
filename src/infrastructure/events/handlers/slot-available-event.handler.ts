import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SlotAvailableEvent } from '../../../domain/events/slot-cancelled.event';
import { CacheService } from 'src/application/cache.service';
import { ClubUpdatedEventHandler } from './club-updated-event.handler';

@EventsHandler(SlotAvailableEvent)
export class SlotAvailableEventHandler implements IEventHandler<SlotAvailableEvent> {
    constructor(
        private readonly cacheService: CacheService,
        private readonly clubUpdatedEvent: ClubUpdatedEventHandler
    ) { }

    async handle(event: SlotAvailableEvent): Promise<void> {
        console.log('Slot Available:', event);

        await this.bookingCancelled(event);
    }

    async bookingCancelled(event: SlotAvailableEvent) {
        try {
            const { clubId, courtId, slot: slotEvent } = event;

            const idClub = `club:${clubId}`;

            const keySlots = `slots:${clubId}:${courtId}`;

            const club = await this.clubUpdatedEvent.getClub(idClub);

            const getSlots = await this.cacheService.getCache(keySlots);
            if (!getSlots) throw ('Slots not found')

            const slots = JSON.parse(getSlots)

            const slotFilters = slots.filter(slot => {
                const slotFromCache = `${slot.datetime}${slot.end}`;
                const slotFromEvent = `${slotEvent.datetime}${slotEvent.end}`;

                return slotFromCache !== slotFromEvent;
            });

            const courtIndex = club.courts.findIndex(court => court.id === courtId);

            club.courts[courtIndex].available = slotFilters;

            await this.cacheService.setCache(keySlots, JSON.stringify(slotFilters));
            await this.cacheService.setCache(idClub, JSON.stringify(club));
        } catch (err) {
            console.log(err)
        }
    }
}