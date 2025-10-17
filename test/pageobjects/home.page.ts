import {config} from "../../config/wdio.shared.conf.ts";
import {selectors} from "../common/selectors.ts";
import {
  select,
  addStepAndLog,
  sleep,
  enterValue,
  getByClassChain,
  getById,
  getByPredicateString,
  clickElement,
} from "../common/sharedCommands.ts";

export const homePage = {
  // region ELEMENTS
  skipButton: () => select({
    ...selectors.homePage.skipButton,
    androidSelectionMethod: getById,
    iosSelectionMethod: getByClassChain,
  }),
  searchField: () => select({
    ...selectors.homePage.searchField,
    androidSelectionMethod: getById,
    iosSelectionMethod: getByClassChain,
  }),
  searchButton: () => select(selectors.homePage.searchButton),
  searchFieldInput: () => select({
    ...selectors.homePage.searchFieldInput,
    androidSelectionMethod: getById,
  }),
  searchResultItem: (searchPhrase: string) =>
    select({
      ...selectors.homePage.searchResultItem,
      variables: { searchPhrase: `${searchPhrase}` },
      iosSelectionMethod: getByPredicateString,
    }),
  // endregion ELEMENTS
  // region ACTIONS
  async openUrl(): Promise<void> {
    await addStepAndLog("Open Home page");
    await browser.url(config.baseUrl);
  },
  async pressSkipButton(): Promise<void> {
    await clickElement(this.skipButton(), 'Skip button');
  },
  async enterTextToSearchField(text: string) {
    await this.activateSearchField();

    (browser.isAndroid && browser.isNativeContext) ?
      await enterValue(await this.searchFieldInput(), text, 'search field input') :
      await enterValue(await this.searchField(), text, 'search field');
  },
  async activateSearchField() {
    if (!browser.isMobile) return;

    await addStepAndLog("Activate search field");
    if (browser.isIOS && !(browser.isNativeContext)) {
      // We need to use explicit wait, as otherwise the iOS web test will fail
      await sleep(200);
    }

    (browser.isNativeContext) ?
      await clickElement(this.searchField(), 'search field') :
      await clickElement(this.searchButton(), 'search button');
  },
  async pressFirstSearchResultItem() {
    await clickElement(this.searchResultItem(), 'the first search result');
  },
  // endregion ACTIONS
}
