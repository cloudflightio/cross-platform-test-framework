import {selectors} from "../common/selectors.ts";
import {
  select,
  addStepAndLog,
  getTextFromElement,
  getByClassChain,
  waitUntilElementsAreLoaded,
} from "../common/sharedCommands.ts";

export const articlePage = {
  // region ELEMENTS
  pageTitle: () => select({
    ...selectors.articlePage.pageTitle,
    iosSelectionMethod: getByClassChain,
  }),
  // endregion ELEMENTS
  // region ACTIONS
  async waitForPageLoad(): Promise<void> {
    await waitUntilElementsAreLoaded(
      'Article page',
      this.pageTitle()
    )
  },
  async getPageTitle(): Promise<string> {
    await addStepAndLog("Get page title");
    return getTextFromElement(await this.pageTitle());
  }
  // endregion ACTIONS
}
