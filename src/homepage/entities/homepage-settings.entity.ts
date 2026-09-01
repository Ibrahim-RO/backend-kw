import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type HomepageDocument = {
  sections: Array<{ id: string; label: string; visible: boolean; title: string; subtitle?: string; body?: string; imageUrl?: string; imageAlt?: string; buttonLabel?: string; buttonUrl?: string; data?: Record<string, unknown> }>;
  seo: { title: string; description: string; canonicalUrl?: string; robots?: string; ogTitle?: string; ogDescription?: string; ogImage?: string; schemaJsonLd?: Record<string, unknown> };
  integrations: { headHtml?: string; bodyStartHtml?: string; bodyEndHtml?: string };
};

@Entity({ name: 'homepage_settings' })
export class HomepageSettings {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ type: 'jsonb' }) draft!: HomepageDocument;
  @Column({ type: 'jsonb', nullable: true }) published!: HomepageDocument | null;
  @Column({ type: 'timestamp', nullable: true }) published_at!: Date | null;
  @CreateDateColumn({ type: 'timestamp' }) created_at!: Date;
  @UpdateDateColumn({ type: 'timestamp' }) updated_at!: Date;
}
