import {join} from "path";

import {deepmerge} from 'deepmerge-ts';

import {config as wdioConf} from './wdio.appium.shared.conf';

// https://webdriver.io/docs/organizingsuites#inherit-from-main-config-file
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
        'appium:chromedriverExecutableDir': join(process.cwd(), './drivers/'),
      }
    ],
    services: [
      [
        'appium',
        {
          args: {
            allowInsecure: 'uiautomator2:chromedriver_autodownload',
          },
        }
      ],
    ],
  },
  {clone: false}
)
