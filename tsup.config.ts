import { defineConfig, Options } from 'tsup';

function getCommonConfig(): Options {
  return {
    splitting: false,
  };
}

function getPackageConfig(platform: 'node' | 'browser'): Options {
  return {
    ...getCommonConfig(),
    outDir: 'build',
    name: platform,
    platform,
    entry: ['src/main.ts'],
    outExtension({ format }) {
      if (format === 'cjs') return { js: `.${platform}.${format}` };
      return { js: `.${platform}.${format}.js` };
    },
  };
}

function getCLIConfig(): Options {
  return {
    ...getCommonConfig(),
    outDir: 'bin',
    name: 'cli',
    entry: ['src/cli/CLI.ts'],
    format: ['cjs'],
    esbuildPlugins: [
      {
        name: 'rewrite-main-import',
        setup(build) {
          build.onResolve({ filter: /^\.\.\/main$/ }, () => {
            return { path: '../build/main.node.cjs', external: true };
          });
        },
      },
    ],
  };
}

export default defineConfig([
  {
    ...getPackageConfig('node'),
    format: ['cjs', 'esm'],
    dts: true,
  },
  {
    ...getPackageConfig('browser'),
    format: ['esm'],
    noExternal: [/./],
  },
  {
    ...getCLIConfig(),
  },
]);
