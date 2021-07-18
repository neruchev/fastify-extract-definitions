import { MODE } from 'src/types';

export const NODE_ENV = (process.env.NODE_ENV as MODE) || 'development';
