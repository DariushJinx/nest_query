import { CourseEntity } from '../course.entity';

export type courseType = Omit<CourseEntity, 'updateTimeStamp'>;
