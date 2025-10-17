import {deepmerge} from 'deepmerge-ts';

import {config as wdioConf} from './wdio.shared.conf';

// https://webdriver.io/docs/organizingsuites#inherit-from-main-config-file
export const config = deepmerge(
  wdioConf,
  {
    port: 4723,
    services: [
      [
        'appium',
        {
          args: {
            // Write the Appium logs to a file in the root of the directory
            log: "./logs/appium.log",
            allowInsecure: 'uiautomator2:adb_shell'
          },
        }],
    ],
  },
  {clone: false}
);
