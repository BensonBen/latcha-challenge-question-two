import {config} from 'dotenv';
config();

export default {
  APP: process.env.APP || 'development',
  PORT: process.env.PORT || 3000,
  HOSTNAME: process.env.HOSTNAME || 'localhost',
};
