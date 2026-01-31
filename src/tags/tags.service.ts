import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Tag } from '../../generated/prisma/client';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    try {
      return await this.prisma.tag.create({
        data: createTagDto,
      });
    } catch (error) {
      console.log('🚀 ~ TagsService ~ create ~ error:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la création du tag',
      );
    }
  }

  async findAll(): Promise<Tag[]> {
    try {
      return await this.prisma.tag.findMany({});
    } catch (error) {
      console.log('🚀 ~ TagsService ~ findAll ~ error:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la récupération de la liste des tags',
      );
    }
  }

  async findOne(id: number): Promise<Tag> {
    try {
      const tag = await this.prisma.tag.findUnique({
        where: { id },
      });

      if (!tag) {
        throw new NotFoundException(`Le tag avec l'id ${id} n'existe pas`);
      }

      return tag;
    } catch (error) {
      console.error('🚀 ~ TagsService ~ findOne ~ error:', error);
      throw new InternalServerErrorException(
        `Erreur lors de la récupération du tag avec l'id ${id}`,
      );
    }
  }

  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    try {
      return await this.prisma.tag.update({
        where: { id },
        data: updateTagDto,
      });
    } catch (error) {
      console.error('🚀 ~ TagsService ~ update ~ error:', error);
      throw new InternalServerErrorException(
        `Erreur lors de la mise à jour du tag avec l'id ${id}`,
      );
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.tag.delete({
        where: { id },
      });
      return { message: `Tag avec l'id ${id} supprimé avec succès` };
    } catch (error) {
      console.error('🚀 ~ TagsService ~ remove ~ error:', error);
      throw new InternalServerErrorException(
        `Erreur lors de la suppression du tag avec l'id ${id}`,
      );
    }
  }
}
