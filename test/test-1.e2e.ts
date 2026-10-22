import {addTestId} from "@wdio/allure-reporter";
import {takeScreenshotWithTitle} from "./common/sharedCommands.ts";
import {homePage} from "./pageobjects/home.page.ts";
import {articlePage} from "./pageobjects/article.page.ts";
import {wikipediaModals} from "./pageobjects/wikipediaModals.ts";

describe(`Wikipedia`, () => {
  it('Search for an article about "Software testing"', async () => {
    await addTestId('TEST-1');

    if (!browser.isNativeContext) {
      await homePage.openUrl();
    }

    if (browser.isNativeContext) {
      await homePage.pressSkipButton();
    }

    await homePage.enterTextToSearchField('Software testing');
    await wikipediaModals.closeTooltipModal();
    await homePage.pressSearchResultItemByTitle('Software testing');
    await articlePage.waitForPageLoad();
    const pageTitle = await articlePage.getPageTitle();

    expect(pageTitle).toEqualString('Software testing');

    await takeScreenshotWithTitle('Successful test - Page title with the "Software testing" value');
  })
})
