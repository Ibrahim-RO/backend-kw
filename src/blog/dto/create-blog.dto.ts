import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  slug?: string;

  @IsDateString(
    {},
    {
      message: 'La fecha de publicación no tiene un formato válido',
    },
  )
  @IsNotEmpty({
    message: 'La fecha de publicación es obligatoria',
  })
  published_at!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  featured_image_url?: string;

  @IsString()
  @IsOptional()
  extra_authors?: string;
}
