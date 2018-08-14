'use strict'

module.exports = {
  extends: ['react-app', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    semi: ['warn', 'never'],
  },
}
