import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, ArrayMaxSize, ArrayUnique } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];
}

export class AddAnswerDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsString()
  parentAnswerId?: string;
}

export class VoteDto {
  @IsIn(['UP', 'DOWN'])
  type!: 'UP' | 'DOWN';
}

