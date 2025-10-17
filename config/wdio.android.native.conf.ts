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
        'appium:deviceName': 'Pixel 9 Pro XL',
        'appium:avd': 'Pixel_9_Pro_XL',
        'appium:platformVersion': '15.0',
        'appium:automationName': 'UiAutomator2',
        'appium:app': join(process.cwd(), './apps/android/wikipedia.apk'),
        'appium:appPackage': 'org.wikipedia',
        'appium:appActivity': 'org.wikipedia.main.MainActivity',
        'appium:autoGrantPermissions': true,
      }
    ],
  },
  {clone: false}
)
