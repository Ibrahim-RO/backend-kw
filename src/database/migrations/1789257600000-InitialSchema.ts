import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1789257600000 implements MigrationInterface {
  name = 'InitialSchema1789257600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "users_profile_enum" AS ENUM ('admin', 'marketing')`,
    );
    await queryRunner.query(
      `CREATE TYPE "blog_posts_status_enum" AS ENUM ('borrador', 'publicado', 'eliminado')`,
    );
    await queryRunner.query(
      `CREATE TYPE "blog_attachments_type_enum" AS ENUM ('imagen', 'archivo', 'video')`,
    );
    await queryRunner.query(`CREATE TABLE "users" (
      "user_id" SERIAL NOT NULL,
      "name" text NOT NULL,
      "last_name" text NOT NULL,
      "surname_name" text NOT NULL,
      "email" text NOT NULL,
      "password" text NOT NULL,
      "phone" text NOT NULL,
      "avatar_url" text DEFAULT '',
      "status" boolean NOT NULL DEFAULT true,
      "profile" "users_profile_enum" NOT NULL DEFAULT 'marketing',
      "modules" text array DEFAULT '{}',
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"),
      CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")
    )`);
    await queryRunner.query(`CREATE TABLE "blog_posts" (
      "blog_id" SERIAL NOT NULL,
      "title" text NOT NULL,
      "slug" text NOT NULL,
      "published_at" TIMESTAMP NOT NULL,
      "content" text NOT NULL,
      "featured_image_url" text DEFAULT '',
      "extra_authors" text,
      "status" "blog_posts_status_enum" NOT NULL DEFAULT 'borrador',
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      "author_id" integer NOT NULL,
      CONSTRAINT "PK_e6d46ae7969c4484cb1cf367d87" PRIMARY KEY ("blog_id"),
      CONSTRAINT "UQ_5b2818a2c45c3edb9991b1c7a51" UNIQUE ("slug"),
      CONSTRAINT "FK_c3fc4a3a656aad74331acfcf2a9" FOREIGN KEY ("author_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION
    )`);
    await queryRunner.query(`CREATE TABLE "blog_attachments" (
      "attachment_id" SERIAL NOT NULL,
      "type" "blog_attachments_type_enum" NOT NULL,
      "url" text NOT NULL,
      "name" text DEFAULT '',
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "blog_id" integer,
      CONSTRAINT "PK_5456972ef2cde9aad61328eb71d" PRIMARY KEY ("attachment_id"),
      CONSTRAINT "FK_fee4a4c91cd7ab66fd9c8525d57" FOREIGN KEY ("blog_id") REFERENCES "blog_posts"("blog_id") ON DELETE CASCADE ON UPDATE NO ACTION
    )`);
    await queryRunner.query(`CREATE TABLE "homepage_settings" (
      "id" SERIAL NOT NULL,
      "draft" jsonb NOT NULL,
      "published" jsonb,
      "published_at" TIMESTAMP,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_cbc4f822929b91e3479f9ff9b7e" PRIMARY KEY ("id")
    )`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "homepage_settings"`);
    await queryRunner.query(`DROP TABLE "blog_attachments"`);
    await queryRunner.query(`DROP TABLE "blog_posts"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "blog_attachments_type_enum"`);
    await queryRunner.query(`DROP TYPE "blog_posts_status_enum"`);
    await queryRunner.query(`DROP TYPE "users_profile_enum"`);
  }
}
