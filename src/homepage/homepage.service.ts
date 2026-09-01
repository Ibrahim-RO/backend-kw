import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomepageDocument, HomepageSettings } from './entities/homepage-settings.entity';
import { UpdateHomepageDto } from './dto/update-homepage.dto';

const defaults: HomepageDocument = {
  sections: [
    { id: 'hero', label: 'Portada', visible: true, title: 'Encuentra la casa de tus sueños', subtitle: 'El camino a tu nuevo hogar empieza aquí con los expertos.', imageUrl: '/Fondo_New_Natural.png', imageAlt: 'Residencia contemporánea' },
    { id: 'properties', label: 'Propiedades cerca de ti', visible: true, title: 'Propiedades cerca de ti', buttonLabel: 'Ver más...', buttonUrl: '/propiedades' },
    { id: 'awards', label: 'Reconocimientos', visible: true, title: 'Una compañía construida por agentes', body: 'Reconocimientos que respaldan nuestra experiencia.' },
    { id: 'about', label: 'Acerca de KW', visible: true, title: '¿QUÉ ES KW?', body: 'Empresa número 1 de entrenamiento, networking, aprendizaje y coaching para agentes inmobiliarios.', imageUrl: '/section-banner-image.png', imageAlt: 'Profesionales inmobiliarios colaborando' },
    { id: 'join', label: 'Únete', visible: true, title: 'Construye una carrera extraordinaria', buttonLabel: 'Conoce más', buttonUrl: '#contacto' },
    { id: 'family', label: 'Family Reunion', visible: true, title: 'Family Reunion', body: 'Aprende, conecta y crece con nuestra comunidad.' },
    { id: 'allies', label: 'Aliados', visible: true, title: 'Nuestros aliados' },
    { id: 'allies-info', label: 'Información de aliados', visible: true, title: 'Soluciones para hacer crecer tu negocio' },
    { id: 'prospecting', label: 'Prospección', visible: true, title: 'Haz crecer tu negocio', buttonLabel: 'Comenzar', buttonUrl: '#contacto' },
    { id: 'contact', label: 'Contacto', visible: true, title: 'Hablemos', subtitle: 'Estamos para ayudarte.' },
  ],
  seo: { title: 'Keller Williams México | Bienes raíces y oportunidades', description: 'Encuentra propiedades, agentes inmobiliarios y oportunidades para crecer con la red Keller Williams México.', robots: 'index, follow' },
  integrations: {},
};

@Injectable()
export class HomepageService {
  constructor(@InjectRepository(HomepageSettings) private readonly repository: Repository<HomepageSettings>) {}
  private async row() {
    let row = await this.repository.findOne({ where: {}, order: { id: 'ASC' } });
    if (!row) row = await this.repository.save(this.repository.create({ draft: defaults, published: defaults, published_at: new Date() }));
    return row;
  }
  async getAdmin() { return this.row(); }
  async getPublished() { const row = await this.row(); return row.published ?? defaults; }
  async updateDraft(dto: UpdateHomepageDto) { const row = await this.row(); row.draft = dto as HomepageDocument; return this.repository.save(row); }
  async publish(dto: UpdateHomepageDto) {
    const row = await this.row();
    row.draft = dto as HomepageDocument;
    row.published = structuredClone(row.draft);
    row.published_at = new Date();
    return this.repository.save(row);
  }
}
