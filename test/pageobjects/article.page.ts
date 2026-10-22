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
  pageTitle: (pageTitle: string) =>
    select({
      ...selectors.articlePage.pageTitle,
      variables: {pageTitle: `${pageTitle}`},
      iosSelectionMethod: getByClassChain,
    }),
  // endregion ELEMENTS
  // region ACTIONS
  async waitForPageLoad(): Promise<void> {
    await waitUntilElementsAreLoaded(
      'Article page',
      this.pageTitle('Software testing')
    )
  },
  async getPageTitle(): Promise<string> {
    await addStepAndLog("Get page title");
    return getTextFromElement(this.pageTitle('Software testing'));
  }
  // endregion ACTIONS
}
