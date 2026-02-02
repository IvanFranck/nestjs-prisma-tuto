import { IsInt, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryPostDto {
  @Transform(({ value }) => parseInt(value as string))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Transform(({ value }) => parseInt(value as string))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
