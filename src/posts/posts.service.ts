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
        data: createPostDto
      })
    } catch (error) {
      console.log("🚀 ~ PostsService ~ create ~ error:", error)
      throw new InternalServerErrorException('Erreur lors de la création du post')
    }
  }

  async findAll(): Promise<Post[]> {
    try {
      return await this.prisma.post.findMany();
    } catch (error) {
      console.log("🚀 ~ PostsService ~ findAll ~ error:", error)
      throw new InternalServerErrorException('Erreur lors de la récupération de la liste des posts')
    }
  }

  async findOne(id: number): Promise<Post> {
    try {
      const post = await this.prisma.post.findUnique({
        where: {id},
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
        data: updatePostDto
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
}
