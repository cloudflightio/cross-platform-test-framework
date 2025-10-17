export const selectors = {
  homePage: {
    skipButton: {
      android: 'org.wikipedia:id/fragment_onboarding_skip_button',
      ios: '**/XCUIElementTypeStaticText[`label == "Skip"`]'
    },
    searchButton: {
      web: '//*[@id="searchIcon"]',
      mobileBrowser: '//*[@id="searchIcon"]',
    },
    searchField: {
      android: 'org.wikipedia:id/search_container',
      ios: '**/XCUIElementTypeSearchField[`label == "Search Wikipedia"`]',
      web: '(//input[@name="search"])[1]',
      mobileBrowser: '//form[@id="minerva-overlay-search"]//input[@name="search"]',
    },
    searchFieldInput: {
      android: 'org.wikipedia:id/search_src_text',
    },
    searchResultItem: {
      android: '//android.widget.TextView[@resource-id="org.wikipedia:id/page_list_item_title" and @text="{{searchPhrase}}"]',
      ios: 'label == "{{searchPhrase}}"',
      web: '//li[@title="{{searchPhrase}}"]',
      mobileBrowser: '//li[@title="{{searchPhrase}}"]//a',
    },
  },
  articlePage: {
    pageTitle: {
      android: '(//android.widget.TextView[@text="Test"])[1]',
      ios: '**/XCUIElementTypeStaticText[`label == "Test"`][2]',
      web: '#firstHeading',
    },
    closeWikipediaGamesModalButton: {
      android: 'org.wikipedia:id/closeButton',
    },
  }
}

