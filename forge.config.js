module.exports = {
  packagerConfig: {
    asar: false,  // Critical: unpacked files so DB is writable in src/db
    icon: undefined, // optional: add .ico later
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
    },
    // Add makers for mac/linux if needed
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: './main.js',
            config: './vite.main.config.mjs',
          },
          {
            entry: './src/preload.js',
            config: './vite.preload.config.mjs',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: './vite.renderer.config.mjs',
          },
        ],
      },
    },
  ],
};