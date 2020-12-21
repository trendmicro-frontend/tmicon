import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';

const packageName = 'tmicon';
const input = path.resolve(__dirname, 'src/index.js');
const outputDirectory = path.resolve(__dirname, 'build');
const isExternal = id => !id.startsWith('.') && !id.startsWith('/');

const getBabelOptions = ({ useESModules }) => ({
  exclude: '**/node_modules/**',
  plugins: []
});

export default [
  {
    input,
    output: {
      file: path.join(outputDirectory, 'index.cjs.js'),
      format: 'cjs',
    },
    external: isExternal,
    plugins: [
      resolve(),
      babel(getBabelOptions({ useESModules: false })),
    ],
  },
  {
    input,
    output: {
      file: path.join(outputDirectory, 'index.es.js'),
      format: 'esm',
    },
    external: isExternal,
    plugins: [
      resolve(),
      babel(getBabelOptions({ useESModules: true })),
    ],
  }
];
