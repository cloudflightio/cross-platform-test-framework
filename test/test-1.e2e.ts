import {addTestId} from "@wdio/allure-reporter";
import {takeScreenshotWithTitle} from "./common/sharedCommands.ts";
import {homePage} from "./pageobjects/home.page.ts";
import {articlePage} from "./pageobjects/article.page.ts";
import {wikipediaGamesModal} from "./pageobjects/wikipedia.games.modal.ts";

describe(`Wikipedia`, () => {
  it('Search for an article about "Test"', async () => {
    await addTestId('TEST-1');

    if (!browser.isNativeContext) {
      await homePage.openUrl();
    }

    if (browser.isNativeContext) {
      await homePage.pressSkipButton();
    }

    await homePage.enterTextToSearchField('Test');
    await homePage.pressFirstSearchResultItem();
    await wikipediaGamesModal.closeModal();
    await articlePage.waitForPageLoad();
    const pageTitle = await articlePage.getPageTitle();

    await expect(pageTitle).toEqualString('Test');

    await takeScreenshotWithTitle('Successful test - Page title with the "Test" value');
  })
})

