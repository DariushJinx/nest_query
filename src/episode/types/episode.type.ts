import { EpisodeEntity } from '../episode.entity';

export type episodeType = Omit<EpisodeEntity, 'updateTimeStamp'>;
