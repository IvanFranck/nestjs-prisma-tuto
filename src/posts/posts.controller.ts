import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
  BadRequestException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { ArticleExistPipe } from '../common/pipes/article-exist.pipe';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.create(createPostDto);
  }

  @Get()
  async findAll(
    @Query(
      'limit',
      new DefaultValuePipe(10),
      new ParseIntPipe({
        exceptionFactory: () =>
          new BadRequestException('la limit doit être un nombre entier'),
      }),
    )
    limit: number,
    @Query(
      'page',
      new DefaultValuePipe(1),
      new ParseIntPipe({
        exceptionFactory: () =>
          new BadRequestException('la page doit être un nombre entier'),
      }),
    )
    page: number,
    @Query(
      'published',
      new DefaultValuePipe(true),
      new ParseBoolPipe({
        exceptionFactory: () =>
          new BadRequestException(
            "le status published doit être soit 'true' soit 'false'",
          ),
      }),
    )
    published: boolean,
  ) {
    const query: QueryPostDto = {
      limit,
      page,
      published,
    };
    return await this.postsService.findAll(query);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe, ArticleExistPipe)
    id: number,
  ) {
    return await this.postsService.findOne(id);
  }

  @Get('author/:authorId')
  findByAuthor(@Param('authorId') authorId: string) {
    return this.postsService.findByAuthor(+authorId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe, ArticleExistPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return await this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.postsService.remove(+id);
  }
}
