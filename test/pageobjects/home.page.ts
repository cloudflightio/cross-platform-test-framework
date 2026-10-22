import {config} from "../../config/wdio.shared.conf.ts";
import {selectors} from "../common/selectors.ts";
import {
  select,
  addStepAndLog,
  sleep,
  enterValue,
  getByClassChain,
  getByPredicateString,
  clickElement,
  getByAccessibilityId,
  getByUiSelectorClass,
} from "../common/sharedCommands.ts";

export const homePage = {
  // region ELEMENTS
  onboardingSkipButton: () => select({
    ...selectors.homePage.onboardingSkipButton,
    androidSelectionMethod: getByAccessibilityId,
    iosSelectionMethod: getByClassChain,
  }),
  skipButton: () => select({
    ...selectors.homePage.skipButton,
    androidSelectionMethod: getByUiSelectorClass,
    iosSelectionMethod: getByClassChain,
  }),
  searchField: () => select({
    ...selectors.homePage.searchField,
    androidSelectionMethod: getByUiSelectorClass,
    iosSelectionMethod: getByClassChain,
  }),
  searchButton: () => select({
    ...selectors.homePage.searchButton,
    androidSelectionMethod: getByAccessibilityId,
    iosSelectionMethod: getByClassChain,
  }),
  closeSearchTooltip: () => select({
    ...selectors.homePage.closeSearchTooltip,
    androidSelectionMethod: getByAccessibilityId,
  }),
  searchResultItem: (searchPhrase: string) =>
    select({
      ...selectors.homePage.searchResultItem,
      variables: { searchPhrase: `${searchPhrase}` },
      iosSelectionMethod: getByPredicateString,
      androidSelectionMethod: getByUiSelectorClass,
    }),
  // endregion ELEMENTS
  // region ACTIONS
  async openUrl(): Promise<void> {
    await addStepAndLog("Open Home page");
    await browser.url(config.baseUrl);
  },
  async pressSkipButton(): Promise<void> {
    if (!browser.isNativeContext && await this.skipButton().isExisting()) {
      await clickElement(this.skipButton(), 'Skip button');
    } else if (browser.isAndroid) {
      await this.handleAndroidNativeOnboarding();
    } else if (browser.isIOS) {
      await this.handleIOSNativeOnboarding();
    }
  },
  async enterTextToSearchField(text: string) {
    await this.activateSearchField();

    if (browser.isAndroid && browser.isNativeContext) {
      await clickElement(this.closeSearchTooltip(), 'close search tooltip');
      await this.activateSearchField();
      await enterValue(this.searchField(), text, 'search field');
    } else {
      await enterValue(this.searchField(), text, 'search field');
    }
  },
  async activateSearchField() {
    if (!browser.isMobile) return;

    await addStepAndLog("Activate search field");
    if (browser.isIOS && !browser.isNativeContext) {
      // We need to use explicit wait, as otherwise the iOS web test will fail
      await sleep(200);
    }

    await clickElement(this.searchButton(), 'search button');
  },
  async pressSearchResultItemByTitle(title: string) {
    await clickElement(this.searchResultItem(title), `search result by title: ${title}`);
  },
  async handleAndroidNativeOnboarding() {
    if (browser.isAndroid && browser.isNativeContext) {
      for (let i = 0; i < 3; i++) {
        await clickElement(this.onboardingSkipButton(), 'Skip onboarding button');
      }
      await clickElement(this.skipButton(), 'Skip button');
    }
  },
  async handleIOSNativeOnboarding() {
    for (let i = 0; i < 6; i++) {
      await clickElement(this.onboardingSkipButton(), 'Skip onboarding button');
    }
  }
  // endregion ACTIONS
}
