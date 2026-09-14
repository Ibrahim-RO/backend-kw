import 'reflect-metadata';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { databaseOptions } from './database.options';

export default (async () => {
  await ConfigModule.forRoot({ isGlobal: true });
  return new DataSource(databaseOptions(new ConfigService()));
})();
