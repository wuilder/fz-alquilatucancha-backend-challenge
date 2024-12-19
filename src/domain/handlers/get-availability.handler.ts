import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import * as moment from 'moment';

import {
  ClubWithAvailability,
  GetAvailabilityQuery,
} from '../commands/get-availaiblity.query';
import {
  ALQUILA_TU_CANCHA_CLIENT,
  AlquilaTuCanchaClient,
} from '../ports/aquila-tu-cancha.client';

import { CacheService } from '../../application/cache.service';

import { Club } from '../model/club';
import { Court } from '../model/court';
import { Slot } from '../model/slot';
import { Params } from '../model/params';
import { dataCacheType } from '../model/dataChateType';

@QueryHandler(GetAvailabilityQuery)
export class GetAvailabilityHandler
  implements IQueryHandler<GetAvailabilityQuery> {
  constructor(
    @Inject(ALQUILA_TU_CANCHA_CLIENT)
    private alquilaTuCanchaClient: AlquilaTuCanchaClient,
    private readonly cacheService: CacheService,
  ) { }

  async execute(query: GetAvailabilityQuery): Promise<ClubWithAvailability[]> {
    const key = `clubs:${query.placeId}`;

    const param: Params = {
      placeId: query.placeId,
      type: dataCacheType.CLUBS
    }
    const clubs = await this.getFromCache(key, param) as Club[];


    const clubs_with_availability: ClubWithAvailability[] = await this.getClubsWithAvailability(clubs, query);
    return clubs_with_availability;
  }

  async getClubsWithAvailability(clubs: Club[], query) {
    const clubs_with_availability: ClubWithAvailability[] = [];

    for (const club of clubs) {
      const key = `courts:${club.id}`;

      const param: Params = {
        clubId: club.id,
        type: dataCacheType.COURTS
      }
      const courts = await this.getFromCache(key, param) as Court[];

      const courts_with_availability: ClubWithAvailability['courts'] = [];

      for (const court of courts) {
        const key = `slots:${club.id}:${court.id}`;

        const param: Params = {
          clubId: club.id,
          courtId: court.id,
          date: query.date,
          type: dataCacheType.SLOTS
        }
        const slots = await this.getFromCache(key, param) as Slot[];

        courts_with_availability.push({
          ...court,
          available: slots,
        });
      }

      const clubWithCourts = {
        ...club,
        courts: courts_with_availability
      }

      clubs_with_availability.push(clubWithCourts);

      const keyClub = `club:${club.id}`;
      const params = {
        club: clubWithCourts,
        type: dataCacheType.CLUB
      }
      await this.getFromCache(keyClub, params);

    }
    return clubs_with_availability;
  }

  async getFromCache<T>(key: string, params: Params): Promise<T[]> {
    const { clubId, courtId, date, placeId, type, club } = params;

    const dataFromCache = await this.cacheService.getCache(key);
    if (dataFromCache) {
      try {
        return JSON.parse(dataFromCache);
      } catch (error) {
        console.error("Error al parsear la caché:", error);
      }
    }

    let dataToSave

    if (type === dataCacheType.COURTS) {
      dataToSave = await this.alquilaTuCanchaClient.getCourts(clubId ?? 166);
    } else if (type === dataCacheType.SLOTS) {
      dataToSave = await this.alquilaTuCanchaClient.getAvailableSlots(clubId ?? 166, courtId ?? 166, date ?? new Date('2022-08-25'));
    } else if (type === dataCacheType.CLUBS) {
      dataToSave = await this.alquilaTuCanchaClient.getClubs(placeId ?? 'ChIJW9fXNZNTtpURV6VYAumGQOw');
    } else {
      dataToSave = club;
    }
    await this.cacheService.setCache(key, JSON.stringify(dataToSave));

    return dataToSave;
  }
}
