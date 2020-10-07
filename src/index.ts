import 'reflect-metadata';

import {container} from 'tsyringe';
import {green} from 'chalk';
import {ServerFactory} from './server';
import CONFIG from './config/config';
import './config/sql-lite-database';

const {PORT, HOSTNAME} = CONFIG;
const logger = console.log;
const serverFactory: ServerFactory = container.resolve(ServerFactory);

serverFactory
  .generate()
  .listen(PORT as number, HOSTNAME, () =>
    logger(green(`[Server] listening on port: ${PORT}`))
  );
