import { Controller, Get, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('tracks')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list() {
    return this.catalog.listTracks();
  }

  @Get(':trackId')
  getOne(@Param('trackId') trackId: string) {
    return this.catalog.getTrack(trackId);
  }
}
