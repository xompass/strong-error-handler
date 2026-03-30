import {defineConfig} from 'tsdown/config';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['./src/index.ts'],
  fixedExtension: false,
  format: 'cjs',
  outDir: 'dist',
  platform: 'node',
  sourcemap: false,
  target: 'node20',
});
