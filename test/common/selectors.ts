export const selectors = {
  homePage: {
    onboardingSkipButton: {
      android: 'Forward',
      ios: '**/XCUIElementTypeButton[`name == "App Onboarding Next Button"`]'
    },
    skipButton: {
      android: 'new UiSelector().text("Skip")',
      ios: '**/XCUIElementTypeStaticText[`label == "Skip"`]'
    },
    searchButton: {
      android: 'Search',
      ios: '**/XCUIElementTypeButton[`name == "Search Tab Button"`]',
      web: '//*[@id="searchIcon"]',
      mobileBrowser: '//*[@id="searchIcon"]',
    },
    searchField: {
      android: 'new UiSelector().resourceId("org.wikipedia:id/search_src_text")',
      ios: '**/XCUIElementTypeSearchField[`name == "Search Field"`]',
      web: '(//input[@name="search"])[1]',
    },
    searchFieldInput: {
      android: 'org.wikipedia:id/search_src_text',
    },
    closeSearchTooltip: {
      android: 'Close',
    },
    searchResultItem: {
      android: 'new UiSelector().text("{{searchPhrase}}").instance(1)',
      ios: 'name == "{{searchPhrase}}"',
      web: '//li[@title="{{searchPhrase}}"]',
      mobileBrowser: '//li[@title="{{searchPhrase}}"]//a',
    },
  },
  articlePage: {
    pageTitle: {
      android: '(//android.widget.TextView[@text="{{pageTitle}}"])[1]',
      ios: '**/XCUIElementTypeStaticText[`label == "{{pageTitle}}"`][2]',
      web: '#firstHeading',
    },
    closeModalButton: {
      ios: '**/XCUIElementTypeButton[`name == "xmark.circle.fill"`]',
    },
  }
}

