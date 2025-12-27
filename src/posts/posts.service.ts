import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Post } from '../../generated/prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService){}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    try {
      return await this.prisma.post.create({
        data: createPostDto,
        include: {
          author:  {
            select:  {name: true, email: true, imageUrl: true}
          },
          tags: true,
        }
      })
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la création du post')
    }
  }

  async findAll(): Promise<Post[]> {
    try {
      return await this.prisma.post.findMany({
        include: {
          author:  {
            select:  {name: true, email: true, imageUrl: true}
          },
          tags: true,
          _count: {
            select: {comments: true}
          }
        }
      });
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la récupération de la liste des posts')
    }
  }

  async findOne(id: number): Promise<Post> {
    try {
      const post = await this.prisma.post.findUnique({
        where: {id},
        include: {
          author:  {
            select:  {name: true, email: true, imageUrl: true, bio: true}
          },
          tags: true,
          comments: {
            take: 3,
            include: {
              author: {
                select: {name: true, email: true, imageUrl: true}
              }
            }
          },
          _count: {
            select: {comments: true}
          }
        }
      })

      if(!post){
        throw new NotFoundException(`Le post avec l'id ${id} n'existe pas`)
      }

      return post
    } catch (error) {
      throw new InternalServerErrorException(`Erreur lors de la récupération du post avec l'id ${id}`)
    }
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
     try {
      return await this.prisma.post.update({
        where: {id},
        data: updatePostDto,
        include: {
          author:  {
            select:  {name: true, email: true, imageUrl: true, bio: true}
          },
          tags: true,
          comments: {
            take: 3,
            include: {
              author: {
                select: {name: true, email: true, imageUrl: true}
              }
            }
          },
          _count: {
            select: {comments: true}
          }
        }
      })

    } catch (error) {
      throw new InternalServerErrorException(`Erreur lors de la mise à jour du post avec l'id ${id}`)
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.post.delete({
        where: {id}
      })
      return {message: `Post avec l'id ${id} supprimé avec succès`}
    } catch (error) {
      throw new InternalServerErrorException(`Erreur lors de la suppression du post avec l'id ${id}`)
    };
  }

  async findByAuthor(authorId: number) {
    return this.prisma.post.findMany({
      where: { authorId },
      include: {
        tags: true,
        _count: {
          select: { comments: true },
        },
      },
    });
  }
}
