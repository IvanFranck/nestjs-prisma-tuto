import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ArticleExistPipe } from '../common/pipes/article-exist.pipe';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    return await this.commentsService.create(createCommentDto);
  }

  @Get()
  async findAll() {
    return await this.commentsService.findAll();
  }

  @Get('post/:postId')
  findByPost(@Param('postId', ParseIntPipe, ArticleExistPipe) postId: string) {
    return this.commentsService.findByPost(+postId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.commentsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return await this.commentsService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.commentsService.remove(+id);
  }
}
