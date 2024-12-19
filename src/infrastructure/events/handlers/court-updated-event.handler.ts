import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CourtUpdatedEvent } from '../../../domain/events/court-updated.event';
import { CacheService } from 'src/application/cache.service';
import { ClubUpdatedEventHandler } from './club-updated-event.handler';

@EventsHandler(CourtUpdatedEvent)
export class CourtUpdatedEventHandler implements IEventHandler<CourtUpdatedEvent> {
    constructor(
        private readonly cacheService: CacheService,
        private readonly clubUpdatedEvent: ClubUpdatedEventHandler
    ) { }

    async handle(event: CourtUpdatedEvent): Promise<void> {
        console.log('Court Update:', event);
        await this.updateCourt(event);
    }

    async updateCourt(event: CourtUpdatedEvent) {
        try {
            const { clubId, courtId, fields } = event;

            const idClub = `club:${clubId}`;
            const idCourt = `courts:${courtId}`;

            const club = await this.clubUpdatedEvent.getClub(idClub);

            const getCourts = await this.cacheService.getCache(idCourt);
            if (!getCourts) {
                console.log('Courts not found')
                return;
            };

            const courts = JSON.parse(getCourts);

            const courtFromClub = this.clubUpdatedEvent.updateCourtsFromClub(club, event);

            const courtFromCorts = courts.map(court => {
                if (court.id === courtId) {
                    fields.map(field => {
                        court[field] = court[field]
                    })
                }
                return court;
            });

            if (!courtFromClub || !courtFromCorts) throw (`CourtId: ${idCourt} not found`)

            const clubCourtToUpdate = {
                ...club,
                courts: courtFromClub,
            }

            await this.setCache(idClub, JSON.stringify(clubCourtToUpdate));
            await this.setCache(idCourt, JSON.stringify(courtFromCorts));
        } catch (err) {
            console.log(err)
        }
    }

    async setCache(key: string, data) {
        await this.cacheService.setCache(key, data);
    }
}