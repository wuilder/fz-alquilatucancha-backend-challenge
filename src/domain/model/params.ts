import { dataCacheType } from './dataChateType';
import { Club } from './club';

export interface Params {
    clubId?: number,
    courtId?: number,
    date?: Date,
    placeId?: string,
    type?: dataCacheType,
    club?: Club,
}