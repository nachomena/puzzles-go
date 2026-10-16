import { serveGenerator } from '../../core/generator-worker.js';
import { generate } from './engine/generator.js';

serveGenerator(generate);
