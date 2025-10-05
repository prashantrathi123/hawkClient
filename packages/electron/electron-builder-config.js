module.exports = {
    appId: 'com.hawkclient.app',
    productName: 'HawkClient',
    // afterSign: 'notarize.js',
    mac: {
        target: [
            {
                target: 'dmg',
                arch: ['x64', 'arm64']
            },
            {
                target: 'zip',
                arch: ['x64', 'arm64']
            }
        ],
        hardenedRuntime: true,
        gatekeeperAssess: false,
        identity: "Prashant Rathi",
        category: 'public.app-category.developer-tools',
        icon: 'assets/mac/HawkLogoBlueWithWh.png',
        artifactName: '${productName}-${version}-${arch}-mac.${ext}',
        entitlements: 'assets/entitlements.mac.plist',
        entitlementsInherit: 'assets/entitlements.mac.plist',
        forceCodeSigning: true
    },
    win: {
        target: [
            {
                target: 'nsis',
                arch: ['x64', 'ia32']
            },
            {
                target: 'zip',
                arch: ['x64', 'ia32']
            }
        ],
        icon: 'assets/win/HawkLogoBlueWithWh.png',
        artifactName: '${productName}-${version}-${arch}-win.${ext}'
    },
    linux: {
        target: [
            {
                target: 'AppImage',
                arch: ['x64'] // Specify x86 (ia32) and x64 only
            },
            {
                target: 'deb',
                arch: ['x64']
            },
            {
                target: 'snap',
                arch: ['x64']
            },
            {
                target: 'rpm',
                arch: ['x64']
            }
        ],
        icon: 'assets/pngnew',
        artifactName: '${productName}-${version}-${arch}-linux.${ext}'
    },
    files: [
        "**/*",
        "!build-assets/**", // exclude packages if it has secrets/certs
        "!notarize.js"
      ],
    directories: {
        buildResources: 'assets',
        output: '../../dist'
    },
    extraMetadata: {
        main: "main.js"
    },
    extends: null
};
