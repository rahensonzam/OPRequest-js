module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true
  },
  globals: {
    "dayjs": "writable",
    "$": "writable",
    "Papa": "writable"
  },
  parserOptions: {
      "ecmaVersion": 2021,
      "sourceType": "module"
  },
  extends: [
    'eslint:recommended'    
  ]
};
