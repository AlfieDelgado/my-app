export default {
  presets: [
    ['@babel/preset-env', {
      targets: { node: 'current' },
      modules: 'auto'
    }],
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-syntax-import-meta'
  ],
};