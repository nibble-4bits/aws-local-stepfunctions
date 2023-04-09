import { defineConfig, Options } from 'tsup';

function getCommonConfig(platform: 'node' | 'browser'): Options {
  return {
    entry: ['src/main.ts'],
    outDir: 'build',
    splitting: false,
    outExtension({ format }) {
      if (format === 'cjs') return { js: `.${platform}.${format}` };
      return { js: `.${platform}.${format}.js` };
    },
  };
}

export default defineConfig([
  {
    ...getCommonConfig('node'),
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
  },
  {
    ...getCommonConfig('browser'),
    format: ['esm'],
    platform: 'browser',
    noExternal: [/./],
  },
]);
