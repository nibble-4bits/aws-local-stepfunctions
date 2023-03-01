import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['cjs', 'esm'],
  outDir: 'build',
  outExtension({ format }) {
    if (format === 'cjs') return { js: `.${format}` };
    return { js: `.${format}.js` };
  },
  dts: true,
  minify: true,
  clean: true,
  splitting: false,
});
