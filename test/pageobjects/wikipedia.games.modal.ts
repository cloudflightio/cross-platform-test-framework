import {selectors} from "../common/selectors.ts";
import {
  select,
  waitUntilElementsAreLoaded, getById, clickElement,
} from "../common/sharedCommands.ts";

export const wikipediaGamesModal = {
  // region ELEMENTS
  closeWikipediaGamesModalButton: () => select({
    ...selectors.articlePage.closeWikipediaGamesModalButton,
    androidSelectionMethod: getById,
  }),
  // endregion ELEMENTS
  // region ACTIONS
  async closeModal(): Promise<void> {
    if (browser.isAndroid && browser.isNativeContext) {
      await waitUntilElementsAreLoaded(
        'Wikipedia Games modal',
        this.closeWikipediaGamesModalButton()
      )

      await clickElement(this.closeWikipediaGamesModalButton(), 'Close Wikipedia Games modal button')
    }
  },
  // endregion ACTIONS
}
