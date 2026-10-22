import {selectors} from "../common/selectors.ts";
import {
  select,
  waitUntilElementsAreLoaded, getById, clickElement, getByClassChain,
} from "../common/sharedCommands.ts";

export const wikipediaModals = {
  // region ELEMENTS
  closeModalButton: () => select({
    ...selectors.articlePage.closeModalButton,
    androidSelectionMethod: getById,
    iosSelectionMethod: getByClassChain,
  }),
  // endregion ELEMENTS
  // region ACTIONS
  async closeTooltipModal(): Promise<void> {
    if (browser.isIOS && browser.isNativeContext) {
      await waitUntilElementsAreLoaded(
        'Tooltip modal',
        this.closeModalButton()
      )

      await clickElement(this.closeModalButton(), 'Close Tooltip modal button')
    }
  },
  // endregion ACTIONS
}
