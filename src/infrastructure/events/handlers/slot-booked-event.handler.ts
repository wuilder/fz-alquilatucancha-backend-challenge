import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SlotBookedEvent } from '../../../domain/events/slot-booked.event';
import { CacheService } from 'src/application/cache.service';
import { ClubUpdatedEventHandler } from './club-updated-event.handler';

@EventsHandler(SlotBookedEvent)
export class SlotBookedEventHandler implements IEventHandler<SlotBookedEvent> {
    constructor(
        private readonly cacheService: CacheService,
        private readonly clubUpdatedEvent: ClubUpdatedEventHandler
    ) { }

    async handle(event: SlotBookedEvent): Promise<void> {
        console.log('Slot booked:', event);

        await this.bookingCreated(event);
    }

    async bookingCreated(event: SlotBookedEvent) {
        try {
            const { clubId, courtId, slot: slotEvent } = event;

            const idClub = `club:${clubId}`;

            const keySlots = `slots:${clubId}:${courtId}`;

            const club = await this.clubUpdatedEvent.getClub(idClub);

            const getSlots = await this.cacheService.getCache(keySlots);
            if (!getSlots) throw Error('Slots not found')

            const slots = JSON.parse(getSlots)

            const slotFilters = slots.find(slot => {
                const slotFromCache = `${slot.datetime}${slot.end}`;
                const slotFromEvent = `${slotEvent.datetime}${slotEvent.end}`;

                return slotFromCache === slotFromEvent;
            });

            if (slotFilters) throw Error(`Slot already exist`);

            slots.push(slotEvent);


            const courtIndex = club.courts.findIndex(court => court.id === courtId);

            club.courts[courtIndex].available = slots;

            await this.cacheService.setCache(keySlots, JSON.stringify(slots));
            await this.cacheService.setCache(idClub, JSON.stringify(club));

        } catch (err) {
            console.log(err)
        }
    }


}