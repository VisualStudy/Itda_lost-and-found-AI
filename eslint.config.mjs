import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

const config = defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
  globalIgnores(['.next/**', 'node_modules/**', 'data/**', 'coverage/**']),
])

export default config
