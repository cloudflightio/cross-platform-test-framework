import {join} from "path";

import {deepmerge} from 'deepmerge-ts';

import {config as wdioConf} from './wdio.appium.shared.conf.ts';

// https://webdriver.io/docs/organizingsuites#inherit-from-main-config-file
// The `appium` service (incl. chromedriver_autodownload) is configured in wdio.appium.shared.conf.ts
export const config = deepmerge(
  wdioConf,
  {
    logLevel: 'debug',
    specs: [join(process.cwd(), './test/**/*.e2e.ts')],
    capabilities: [
      {
        platformName: 'Android',
        browserName: 'Chrome',
        'appium:deviceName': 'Pixel 9 Pro XL',
        'appium:avd': 'Pixel_9_Pro_XL',
        'appium:platformVersion': '15.0',
        'appium:automationName': 'UiAutomator2',
        // Chromedriver binaries downloaded by Appium are stored here (git-ignored)
        'appium:chromedriverExecutableDir': join(process.cwd(), './drivers/'),
      }
    ],
  },
  {clone: false}
)
