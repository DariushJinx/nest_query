import { FeatureEntity } from '../feature.entity';

export type FeatureType = Omit<FeatureEntity, 'updateTimeStamp'>;
