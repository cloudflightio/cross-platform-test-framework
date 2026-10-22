import {join} from 'path';
import 'dotenv/config';
import {addStepAndLog, getDateTimeString, takeScreenshotWithTitle} from "../test/common/sharedCommands.ts";
import {addCustomMatchers} from "../test/common/customMatchers.ts";

export const config = {
  runner: 'local',
  tsConfigPath: './tsconfig.json',
  maxInstances: 1,
  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 360000,
  connectionRetryCount: 3,
  baseUrl: 'https://en.wikipedia.org/',
  specs: [],
  framework: 'mocha',
  reporters: [
    ['allure', {
      outputDir: 'allure-results',
      // Make sure to update YOUR_TMS_LINK with an actual link to your Test Management System (e.g., Jira)
      tmsLinkTemplate: 'https://YOUR_TMS_LINK.atlassian.net/browse/{}',
      issueLinkTemplate: 'https://YOUR_TMS_LINK.atlassian.net/browse/{}',
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
      useCucumberStepReporter: false,
      // Mocha hooks are not reported, to not pollute reports with ramp-up/tear-down events
      disableMochaHooks: true,
      // The following parameter allows adding any given value we'd like to display
      // there are no restrictions to what can be displayed/added
      reportedEnvironmentVars: {
        'Platform': process.platform,
      },
      addFeatures: true,
    }],
  ],
  services: [
    [
      'visual',
      {
        // https://webdriver.io/docs/visual-testing/service-options/
        baselineFolder: join(process.cwd(), './logs/visual-regression/image-reference/'),
        screenshotPath: join(process.cwd(), './logs/visual-regression/tmp/'),
        formatImageName: '{tag}-{logName}-{width}x{height}',
        clearRuntimeFolder: true,
        savePerInstance: true,
        autoSaveBaseline: true,
        returnAllCompareData: true,
      },
    ],
  ],
  mochaOpts: {
    ui: 'bdd',
    // This particular timeout value relates to the entire test case execution in milliseconds
    // (i.e., if the test execution exceeds given value then the test will fail)
    timeout: 600000,
  },
  before: function () {
    addCustomMatchers();
  },
  afterTest: async (_test: unknown, _context: unknown, {error}: { error?: Error }) => {
    if (!error) {
      return;
    }

    const currentDateTime = getDateTimeString();
    await addStepAndLog(`Something went wrong. Datetime of error: ${currentDateTime}`);
    await takeScreenshotWithTitle('Last page before failure');
  },
};
