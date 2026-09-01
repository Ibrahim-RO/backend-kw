import { IsArray, IsBoolean, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class HomepageSectionDto {
  @IsString() id!: string;
  @IsString() label!: string;
  @IsBoolean() visible!: boolean;
  @IsString() title!: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() imageAlt?: string;
  @IsOptional() @IsString() buttonLabel?: string;
  @IsOptional() @IsString() buttonUrl?: string;
  @IsOptional() @IsObject() data?: Record<string, unknown>;
}

class SeoDto {
  @IsString() title!: string;
  @IsString() description!: string;
  @IsOptional() @IsString() canonicalUrl?: string;
  @IsOptional() @IsString() robots?: string;
  @IsOptional() @IsString() ogTitle?: string;
  @IsOptional() @IsString() ogDescription?: string;
  @IsOptional() @IsString() ogImage?: string;
  @IsOptional() @IsObject() schemaJsonLd?: Record<string, unknown>;
}

class IntegrationsDto {
  @IsOptional() @IsString() headHtml?: string;
  @IsOptional() @IsString() bodyStartHtml?: string;
  @IsOptional() @IsString() bodyEndHtml?: string;
}

export class UpdateHomepageDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => HomepageSectionDto)
  sections!: HomepageSectionDto[];
  @ValidateNested() @Type(() => SeoDto) seo!: SeoDto;
  @ValidateNested() @Type(() => IntegrationsDto) integrations!: IntegrationsDto;
}
