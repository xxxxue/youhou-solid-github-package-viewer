import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    solidPlugin(),
    monkey({
      entry: 'src/index.tsx',
      userscript: {
        name: "github 查看 package.json 依赖",
        namespace: 'npm/vite-plugin-monkey',
        icon: 'https://vitejs.dev/logo.svg',
        match: ['https://github.com/*'],
      },
    }),
  ],
});
