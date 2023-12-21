import { courseType } from './course.types';

export interface CoursesResponseInterface {
  courses: courseType[];
  coursesCount: number;
}
