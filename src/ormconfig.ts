import { DataSource, DataSourceOptions } from 'typeorm';
import { registerAs } from '@nestjs/config';

const config = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'NewWorldJinx',
  database: 'nest_query',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migration/*{.ts,.js}'],
  synchronize: false,
  migrationsRun: true,
  autoLoadEntities: true,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
