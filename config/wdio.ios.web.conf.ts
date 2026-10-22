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
        platformName: 'iOS',
        browserName: "Safari",
        maxInstances: 1,
        'appium:options': {
          deviceName: 'iPhone 18 Pro',
          platformVersion: '27.0',
          orientation: 'PORTRAIT',
          automationName: 'XCUITest',
          newCommandTimeout: 500,
          wdaConnectionTimeout: 600000,
          wdaLaunchTimeout: 600000,
          appWaitForLaunch: true,
          noReset: false,
          fullReset: false,
          isHeadless: true,
        }
      },
    ],
  },
  {clone: false}
)
