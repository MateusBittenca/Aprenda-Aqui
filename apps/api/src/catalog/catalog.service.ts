import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listTracks() {
    return this.prisma.track.findMany({
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        tagline: true,
        orderIndex: true,
        _count: { select: { courses: true } },
      },
    });
  }

  async getTrack(trackId: string) {
    const track = await this.prisma.track.findFirst({
      where: { OR: [{ id: trackId }, { slug: trackId }] },
      include: {
        courses: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            orderIndex: true,
            modules: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                slug: true,
                title: true,
                orderIndex: true,
                lessons: {
                  orderBy: { orderIndex: 'asc' },
                  select: {
                    id: true,
                    slug: true,
                    title: true,
                    estimatedMinutes: true,
                    orderIndex: true,
                    _count: { select: { exercises: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!track) throw new NotFoundException('Trilha não encontrada');
    return track;
  }
}
