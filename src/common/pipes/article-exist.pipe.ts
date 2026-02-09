import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ArticleExistPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}
  async transform(value: number, metadata: ArgumentMetadata) {
    const post = await this.prisma.post.findUnique({
      where: { id: value },
    });
    if (!post) {
      throw new NotFoundException(`Post ${value} introuvable`);
    }

    return value;
  }
}
