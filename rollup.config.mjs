import path from 'path';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const packageName = process.env.PACKAGE_NAME;
const input = process.env.INPUT || path.resolve(__dirname, 'src', 'index.js');
const outputDirectory = process.env.OUTPUT_DIRECTORY || path.resolve(__dirname, 'dist');
const cjsOutputDirectory = path.resolve(outputDirectory, 'cjs');
const esmOutputDirectory = path.resolve(outputDirectory, 'esm');
const isExternal = id => !id.startsWith('.') && !id.startsWith('/');

export default [
  {
    input,
    output: {
      file: path.join(cjsOutputDirectory, `${packageName}.js`),
      format: 'cjs',

      // https://rollupjs.org/guide/en/#changed-defaults
      // https://rollupjs.org/guide/en/#outputinterop
      interop: 'auto',
    },
    external: isExternal,
    plugins: [
      nodeResolve(),
      babel({ babelHelpers: 'bundled' }),
      terser({
        compress: false,
        mangle: false,
        output: {
          comments: false,
        },
      }),
    ],
  },
  {
    input,
    output: {
      dir: esmOutputDirectory,
      format: 'esm',
      preserveModules: true,
    },
    external: isExternal,
    plugins: [
      nodeResolve(),
      babel({ babelHelpers: 'bundled' }),
      terser({
        compress: false,
        mangle: false,
        output: {
          comments: false,
        },
      }),
    ],
  }
];
