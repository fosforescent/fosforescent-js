import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import dotenv from 'dotenv'
import { resolve } from 'path'


dotenv.config() // load env vars from .env


export default defineConfig(() => {
  return {
    // define: {
    //   __LOCAL_SYC_API_URL__: `"${process.env.LOCAL_SYC_API_URL}"`, // wrapping in "" since it's a string
    //   __DEV_SYC_API_URL__: `"${process.env.DEV_SYC_API_URL}"`, // wrapping in "" since it's a string
    //   __PROD_SYC_API_URL__: `"${process.env.PROD_SYC_API_URL}"`, // wrapping in "" since it's a string
    //   __TEST_SYC_API_URL__: `"${process.env.TEST_SYC_API_URL}"`, // wrapping in "" since it's a string
    // },

    build: {
      copyPublicDir: false,
      lib: {
        entry: resolve(__dirname, 'src/fosforescent/index.ts'),
        name: 'Fosforescent',
        // the proper extensions will be added
        fileName: 'fosforescent',
        // formats: libFormats,
      },
      rollupOptions: {
        // external: ['react', 'react-dom', 'react/jsx-runtime'],
        // input: Object.fromEntries(
        //   glob.sync('src/**/*.{ts,tsx}').map(file => [
        //     // The name of the entry point
        //     // lib/nested/foo.ts becomes nested/foo
        //     relative(
        //       'src',
        //       file.slice(0, file.length - extname(file).length)
        //     ),
        //     // The absolute path to the entry file
        //     // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
        //     fileURLToPath(new URL(file, import.meta.url))
        //   ])
        // ),
        build: {
          sourcemap: true,
        },
        output: {
          sourcemap: true,
          build: {
            sourcemap: true,
          },
          // inlineDynamicImports: false,
          // assetFileNames: 'assets/[name][extname]',
          // entryFileNames: '[name].js',
          globals: {
          },
        },
        plugins: []
      }
    },
    plugins: [
      // react(), 
      viteTsconfigPaths(), 
      // svgr({ svgrOptions: { icon: true } }),
      // libInjectCss()
    ],
    // css: {
    //   postcss: {
    //     plugins: [
    //       tailwindcss,
    //       autoprefixer,
    //     ],
    //   }
    // }
  };
});
