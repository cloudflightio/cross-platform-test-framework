import {deepmerge} from 'deepmerge-ts';

import {config as wdioConf} from './wdio.shared.conf.ts';

// https://webdriver.io/docs/organizingsuites#inherit-from-main-config-file
// NOTE: deepmerge-ts concatenates arrays. Do NOT redefine the `appium` service in the
// platform configs - it would be added a second time, and Appium would start twice.
export const config = deepmerge(
  wdioConf,
  {
    port: 4723,
    services: [
      [
        'appium',
        {
          command: 'appium',
          args: {
            // Write the Appium logs to a file in the root of the directory
            log: './logs/appium.log',
            // adb_shell - used by the native Android tests
            // chromedriver_autodownload - lets Appium download a matching Chromedriver for Android Chrome tests
            allowInsecure: 'uiautomator2:adb_shell,uiautomator2:chromedriver_autodownload',
          },
        },
      ],
    ],
  },
  {clone: false},
);
