import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CourtUpdatedEvent } from '../../../domain/events/court-updated.event';
import { ClubUpdatedEvent } from '../../../domain/events/club-updated.event';
import { CacheService } from 'src/application/cache.service';

@EventsHandler(ClubUpdatedEvent)
export class ClubUpdatedEventHandler implements IEventHandler<ClubUpdatedEvent> {
    constructor(private readonly cacheService: CacheService,) { }

    async handle(event: ClubUpdatedEvent): Promise<void> {
        console.log('Club Update:', event);
        await this.updateClub(event)
    }

    async getClub(clubId: string) {
        try {
            const getClub = await this.cacheService.getCache(clubId);
            if (!getClub) {
                console.log('Club not found')
                return;
            };

            const club = JSON.parse(getClub);

            return club;
        } catch (err) {
            console.log(err)
        }
    }

    async updateClub(event: ClubUpdatedEvent) {
        try {
            const { clubId, fields } = event;

            const club = await this.getClub(clubId.toString());

            fields.map(field => {
                club[field] = club[field]
            });

            const objetctoUpdate = {
                ...club,
            }

            await this.cacheService.setCache(clubId.toString(), objetctoUpdate);
        } catch (err) {
            console.log(err)
        }
    }

    updateCourtsFromClub(club, event: CourtUpdatedEvent) {
        const { clubId, courtId, fields } = event;

        const courtFromClub = club.courts.map(court => {
            if (court.id === courtId) {
                fields.map(field => {
                    court[field] = court[field]
                })
            }
            return court;
        });

        return courtFromClub;
    }
}