import { terser } from 'rollup-plugin-terser';
import alias from 'rollup-plugin-alias';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import license from 'rollup-plugin-license';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import bundleSize from 'rollup-plugin-bundle-size';

const commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD', { encoding: 'utf-8' })
  .trim();

const plugins = [
  replace({
    API_ENDPOINT: JSON.stringify('https://api.understand.io/')
  }),
  json({
    include: 'package.json'
  }),
  alias({
    applicationRoot: __dirname + '/src'
  }),
  resolve(),
  commonjs(),
  babel({
    exclude: 'node_modules/**',
    presets: [
      // https://babeljs.io/docs/en/babel-preset-env
      // targets ES5 env
      [
        '@babel/preset-env', {
          modules: false,
          spec: true,
          forceAllTransforms: true,
          useBuiltIns: 'usage',
          corejs: 3
        }
      ]
    ]
  }),
  license({
    sourcemap: true,
    banner: `/*! understand/understand-js <%= pkg.version %> (${commitHash}) | https://github.com/understand/understand-js */`,
  }),
  bundleSize()
];

const bundleConfig = {
  input: 'src/index.js',
  output: {
    format: 'umd',
    name: 'Understand'
  },
  context: 'window',
  external: ['babel-polyfill'],
  plugins: [
    ...plugins,
  ],
};

export default [
  {
    ...bundleConfig,
    output: {
      ...bundleConfig.output,
      file: 'build/bundle.js'
    },
  },
  {
    ...bundleConfig,
    output: {
      ...bundleConfig.output,
      file: 'build/bundle.min.js',
      sourcemap: true
    },
    // Uglify has to be at the end of compilation, BUT before the license banner
    plugins: bundleConfig.plugins
      .slice(0, -2)
      .concat(terser())
      .concat(bundleConfig.plugins.slice(-2)),
  },
  {
    input: 'src/Understand.js',
    output: {
      format: 'esm',
      file: 'build/bundle.es6.js',
    },
    plugins: bundleConfig.plugins
      .slice(0, -3)
      .concat(babel({
        exclude: 'node_modules/**',
        presets: [
          [
            '@babel/preset-env', {
              modules: false
            }
          ]
        ]
      }))
      .concat(bundleConfig.plugins.slice(-2))
  },
  {
    input: 'src/Understand.js',
    output: {
      format: 'esm',
      sourcemap: true,
      file: 'build/bundle.es6.min.js',
    },
    plugins: bundleConfig.plugins
      .slice(0, -3)
      .concat(babel({
        exclude: 'node_modules/**',
        presets: [
          [
            '@babel/preset-env', {
              modules: false
            }
          ]
        ]
      }))
      .concat(terser())
      .concat(bundleConfig.plugins.slice(-2))
  }
];