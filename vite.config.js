import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
    const isLibrary = mode === 'library';
    
    const baseConfig = {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        server: {
            port: 5173,
            open: true,
        },
    };

    if (isLibrary) {
        // Library build configuration
        return {
            ...baseConfig,
            build: {
                lib: {
                    entry: path.resolve(__dirname, 'src/index.js'),
                    name: 'JSEditor',
                    formats: ['es', 'cjs'],
                    fileName: (format) => `js-editor.${format}.js`
                },
                rollupOptions: {
                    // Keep dependencies external
                    external: [
                        '@fortawesome/fontawesome-free',
                        '@popperjs/core',
                        'bootstrap',
                        'prismjs',
                        'showdown'
                    ],
                    output: {
                        globals: {
                            '@fortawesome/fontawesome-free': 'FontAwesome',
                            '@popperjs/core': 'Popper',
                            'bootstrap': 'bootstrap',
                            'prismjs': 'Prism',
                            'showdown': 'showdown'
                        }
                    }
                },
                sourcemap: true,
                minify: 'esbuild',
                outDir: 'dist',
                emptyOutDir: true,
                copyPublicDir: false,
                cssCodeSplit: false
            },
            define: {
                // Ensure we're building for production
                'process.env.NODE_ENV': '"production"'
            }
        };
    }

    // Demo/development build configuration
    return {
        ...baseConfig,
        build: {
            outDir: 'demo-dist',
            assetsDir: 'assets',
            sourcemap: true
        }
    };
});