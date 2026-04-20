import { Controller, Get, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('courses')
  listCourses() {
    return this.catalog.listCoursesPublic();
  }

  @Get('courses/:courseId')
  getCourse(@Param('courseId') courseId: string) {
    return this.catalog.getCoursePublic(courseId);
  }
}
