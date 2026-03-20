const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const package = require('./package.json');

module.exports = {
  packagerConfig: {
    asar: true,
    appBundleId: "com.ds1nc.rexart",
    name: "ReXart",
    appCopyright: "itachicoders",
    icon: "icon/icon",
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'ReXart',
        iconUrl: "https://raw.githubusercontent.com/itachicoders/ReXart/refs/heads/main/icon/icon.ico",
        setupExe: `${package.name}-${package.version}-win32.exe`,
        setupIcon: 'icon/icon.ico',
        loadingGif: 'icon/install-anim.gif'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          name: "rexart",
          productName: "ReXart",
          icon: "icon/icon.ico",
          maintainer: 'itachicoders',
          homepage: "https://github.com/itachicoders/ReXart",
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
