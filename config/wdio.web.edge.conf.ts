import {join} from "path";

import {deepmerge} from 'deepmerge-ts';

import {config as wdioConf} from './wdio.shared.conf';

// https://webdriver.io/docs/organizingsuites#inherit-from-main-config-file
export const config = deepmerge(
  wdioConf,
  {
    logLevel: 'debug',
    specs: [join(process.cwd(), './test/**/*.e2e.ts')],
    capabilities: [
      {
        browserName: 'MicrosoftEdge',
        'ms:edgeOptions': {
          args: [
            "--headless",
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-gpu',
            '--window-size=1920,1080'
          ]
        },
      }
    ],
  },
  {clone: false}
);
