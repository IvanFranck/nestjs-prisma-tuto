import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Post } from '../../generated/prisma/client';
import { QueryPostDto } from './dto/query-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService){}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    try {
      const { tags, ...postData } = createPostDto;

    return this.prisma.post.create({
      data: {
        ...postData,
        tag: tags
          ? {
              create: tags.map((tag) => ({
                tag: {
                  connectOrCreate: {
                    where: { name: tag },
                    create: { name: tag },
                  },
                },
              })),
            }
          : undefined,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        tags: true,
        _count: {
          select: { comments: true },
        },
      },
    });
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la création du post')
    }
  }

  async findAll(query: QueryPostDto) {
    const {page = 1, limit = 10} = query;
    const skip = (page - 1) * limit;
    try {
      const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          tags: true,
          _count: {
            select: { comments: true },
          },
        },
      }),
      this.prisma.post.count(),
    ]);
    return {
      data: posts,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
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
    const { tags, ...postData } = updatePostDto;
     
    try {
      return await this.prisma.post.update({
        where: { id },
        data: {
          ...postData,
          tag: tags
            ? {
                set: [], // Supprime tous les tags existants
                create: tags.map((tag) => ({
                  tag: {
                    connectOrCreate: {
                      where: { name: tag },
                      create: { name: tag },
                    },
                  },
                })),
              }
            : undefined,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          tags: true,
          _count: {
            select: { comments: true },
          },
        },
      });

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
