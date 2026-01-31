import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Comment } from '../../generated/prisma/client';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    try {
      return await this.prisma.comment.create({
        data: createCommentDto,
        include: {
          author: {
            select: { id: true, name: true, imageUrl: true },
          },
          post: {
            select: { id: true, title: true },
          },
        },
      });
    } catch (error) {
      console.error('🚀 ~ CommentsService ~ create ~ error:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la création du commentaire',
      );
    }
  }

  async findAll(): Promise<Comment[]> {
    try {
      return await this.prisma.comment.findMany({});
    } catch (error) {
      console.error('🚀 ~ CommentsService ~ findAll ~ error:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la récupération de la liste des commentaires',
      );
    }
  }

  async findByPost(postId: number) {
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findOne(id: number): Promise<Comment> {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: { id },
        include: {
          author: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
          post: {
            select: { id: true, title: true },
          },
        },
      });

      if (!comment) {
        throw new NotFoundException(
          `Le commentaire avec l'id ${id} n'existe pas`,
        );
      }

      return comment;
    } catch (error) {
      console.error('🚀 ~ CommentsService ~ findOne ~ error:', error);
      throw new InternalServerErrorException(
        `Erreur lors de la récupération du commentaire avec l'id ${id}`,
      );
    }
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    try {
      return await this.prisma.comment.update({
        where: { id },
        data: updateCommentDto,
        include: {
          author: {
            select: { id: true, name: true, imageUrl: true },
          },
          post: {
            select: { id: true, title: true },
          },
        },
      });
    } catch (error) {
      console.error('🚀 ~ CommentsService ~ update ~ error:', error);
      throw new InternalServerErrorException(
        `Erreur lors de la mise à jour du commentaire avec l'id ${id}`,
      );
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.comment.delete({
        where: { id },
      });
      return { message: `Commentaire avec l'id ${id} supprimé avec succès` };
    } catch (error) {
      console.error('🚀 ~ CommentsService ~ remove ~ error:', error);
      throw new InternalServerErrorException(
        `Erreur lors de la suppression du commentaire avec l'id ${id}`,
      );
    }
  }
}
