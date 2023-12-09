import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

const ormSeedConfig = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'NewWorldJinx',
  database: 'nest_query',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: ['src/seeds/*.ts'],
  synchronize: false,
  migrationsRun: true,
};

export default registerAs('typeorm', () => ormSeedConfig);
export const connectionSource = new DataSource(
  ormSeedConfig as DataSourceOptions,
);
