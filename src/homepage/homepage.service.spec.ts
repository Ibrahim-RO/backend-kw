import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { HomepageService } from './homepage.service';
import { HomepageDocument, HomepageSettings } from './entities/homepage-settings.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/enums/user-profile.enum';

describe('Homepage events', () => {
  const admin = { profile: UserProfile.ADMIN } as User;
  const document = (): HomepageDocument => ({
    sections: [{ id: 'hero', label: 'Portada', visible: true, title: 'Inicio' }],
    seo: { title: 'Inicio', description: '' }, integrations: {},
  });
  function setup() {
    const row = { draft: document(), published: document() } as HomepageSettings;
    const repository = { findOne: jest.fn().mockResolvedValue(row), save: jest.fn().mockImplementation((value) => Promise.resolve(value)) };
    return { service: new HomepageService(repository as unknown as Repository<HomepageSettings>), repository, row };
  }
  const event = (buttonUrl = 'https://example.com/evento') => ({ id: 'events', label: 'Eventos', visible: true, title: 'Próximo evento', buttonUrl });

  it('adds a hidden level zero to existing homepages', async () => {
    const { service } = setup();
    const settings = await service.getAdmin();
    expect(settings.draft.sections.map((s) => s.id)).toEqual(['events', 'hero']);
    expect(settings.draft.sections[0].visible).toBe(false);
  });

  it('keeps draft changes unpublished and publishes events before the hero', async () => {
    const { service } = setup();
    const input = document();
    input.sections.push(event());
    await service.updateDraft(input, admin);
    expect((await service.getPublished()).sections[0].visible).toBe(false);
    await service.publish(input, admin);
    const published = await service.getPublished();
    expect(published.sections.map((s) => s.id)).toEqual(['events', 'hero']);
    expect(published.sections[0]).toMatchObject(event());
  });

  it.each(['javascript:alert(1)', '//example.com', '/\\example.com', ''])('rejects invalid event destination %s', async (url) => {
    const { service, repository } = setup();
    const input = document();
    input.sections.push(event(url));
    await expect(service.publish(input, admin)).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('accepts internal destinations', async () => {
    const { service } = setup();
    const input = document();
    input.sections.push(event('/eventos/reunion'));
    expect((await service.publish(input, admin)).published?.sections[0].buttonUrl).toBe('/eventos/reunion');
  });
});
