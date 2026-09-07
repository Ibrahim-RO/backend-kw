import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { BlogStatus } from '../enums/blog-status.enum';

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

  // Solo borrador/publicado desde este DTO — una entrada no puede "nacer"
  // eliminada, ese estado solo lo pone remove(). Sin esto, el switch de
  // publicar del admin no podía marcar como publicado al crear, solo al
  // editar después.
  @IsIn([BlogStatus.DRAFT, BlogStatus.PUBLISHED], {
    message: 'El estado debe ser borrador o publicado',
  })
  @IsOptional()
  status?: BlogStatus;
}
