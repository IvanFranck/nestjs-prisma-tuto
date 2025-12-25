import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService){}
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: createUserDto
      })
    } catch (error) {
      console.log("🚀 ~ UsersService ~ create ~ error:", error)
      throw new InternalServerErrorException('Erreur lors de la création de l\'utilisateur ')
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      console.log("🚀 ~ UsersService ~ findAll ~ error:", error)
      throw new InternalServerErrorException('Erreur lors de la récupération de la liste des users')
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {id}
      })

      if(!user){
        throw new NotFoundException(`le user avec l'id ${id} n'existe pas`)
      }

      return user
    } catch (error) {
      throw new InternalServerErrorException(`Erreur lors de la récupération du user avec l'id ${id}`)
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
     try {
      return await this.prisma.user.update({
        where: {id},
        data: updateUserDto
      })

    } catch (error) {
      throw new InternalServerErrorException(`Erreur lors de la mise à jour des infos du user avec l'id ${id}`)
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.user.delete({
        where: {id}
      })
      return {message: `User avec l'id ${id} supprimé avec succès`}
    } catch (error) {
      throw new InternalServerErrorException(`Erreur lors de la suppression du user avec l'id ${id}`)
    };
  }
}
