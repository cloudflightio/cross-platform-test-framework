# End-to-End Cross-Platform Testing Template (WebdriverIO v9 / TypeScript)

## What is this?
___

This repository is a **production-ready testing framework template** designed to help QA engineers and developers
quickly set up and write automated end-to-end tests that work across multiple platforms - web and mobile browsers, as
well as Android and iOS native applications - using a single codebase for cross-platform applications.

### Purpose

Writing automated tests for applications that run on different platforms (web, Android, iOS) typically requires
maintaining separate test suites with different tools and approaches. This template solves that problem by providing:

- **Unified test writing**: Write your tests once and run them across all platforms
- **Cross-platform selector management**: Smart selector system that automatically picks the right element locators for
  each platform
- **Pre-configured setup**: All the boilerplate configuration for WebdriverIO, Appium, TypeScript, and reporting tools
  already done
- **Real-world examples**: Working test examples using Wikipedia apps (chosen for their open-source nature and
  availability across all platforms)

### Key Features

- ✅ **Multi-platform support**: Desktop browsers, mobile browsers, Android native apps, iOS native apps
- ✅ **Modern tech stack**: WebdriverIO v9, TypeScript, Appium 3.x
- ✅ **Smart selector system**: Platform-aware selector management with variable support
- ✅ **Reporting out of the box**: Includes Allure reporting
- ✅ **Well-structured**: Well-known Page Object Model pattern with shared commands and utilities

### Who is this for?

- **QA Engineers** looking to implement cross-platform test automation
- **Development teams** needing a robust E2E testing solution
- **Anyone** wanting to learn modern test automation practices with real examples

## Quick Start
___
1. Clone this template
2. Install dependencies (using `yarn install --immutable`)
3. Download Android and iOS files using yarn scripts
    1. All apps: `yarn setup:apps`
    2. Android *.apk file only: `yarn setup:apps:android`
    3. iOS zipped *.app file only: `yarn setup:apps:ios`
4. Launch tests either by agreeing to the last step of the interactive app setup or via yarn scripts:

| Command                       | Description                                       |
|-------------------------------|---------------------------------------------------|
| `yarn wdio:ios:native`        | iOS using native Wikipedia app                    |
| `yarn wdio:ios:web`           | iOS using Wikipedia via mobile Safari browser     |
| `yarn wdio:android:native`    | Android using native Wikipedia app                |
| `yarn wdio:android:web`       | Android using Wikipedia via mobile Chrome browser |
| `yarn wdio:web:edge`          | Web tests using desktop Edge Browser              |

## Table of Content

___
<!-- TOC -->
* [End-to-End Cross-Platform Testing Template (WebdriverIO v9 / TypeScript)](#end-to-end-cross-platform-testing-template-webdriverio-v9--typescript)
  * [What is this?](#what-is-this)
    * [Purpose](#purpose)
    * [Key Features](#key-features)
    * [Who is this for?](#who-is-this-for)
  * [Quick Start](#quick-start)
  * [Table of Content](#table-of-content)
  * [Test Applications](#test-applications)
  * [Prerequisites](#prerequisites)
    * [General requirements](#general-requirements)
    * [Version Management Tools (Recommended)](#version-management-tools-recommended)
      * [macOS/Linux Users](#macoslinux-users)
      * [Windows Users](#windows-users)
    * [Wikipedia App files download](#wikipedia-app-files-download)
      * [Automated Setup (Recommended)](#automated-setup-recommended)
      * [Manual Setup](#manual-setup)
    * [Android tests](#android-tests)
    * [iOS/Safari tests](#iossafari-tests)
  * [Running Tests](#running-tests)
    * [Getting Started](#getting-started)
    * [Available Sample Tests](#available-sample-tests)
    * [Web Tests](#web-tests)
    * [After Test Run](#after-test-run)
  * [Writing Tests](#writing-tests)
    * [Selectors](#selectors)
    * [Available Selectors](#available-selectors)
    * [Using select() and selectArray()](#using-select-and-selectarray)
    * [Selectors with Variables](#selectors-with-variables)
      * [Without Variables](#without-variables)
      * [With Variables](#with-variables)
  * [Reporting](#reporting)
    * [Allure Report](#allure-report)
  * [Known Issues](#known-issues)
    * [iOS Simulator Not Responding](#ios-simulator-not-responding)
<!-- TOC -->

## Test Applications
___

This project uses the following applications for testing examples:

- **Wikipedia for Android** (Apache 2.0) - Available at https://github.com/wikimedia/apps-android-wikipedia
- **Wikipedia for iOS** (MIT) - Available at https://github.com/wikimedia/wikipedia-ios

These apps are used solely for demonstration and testing purposes.
For information about how to obtain them refer to the [Wikipedia App files download](#wikipedia-app-files-download) section.

## Prerequisites
___

For Android and/or iOS tests make sure that you have installed prerequisites mentioned below, and that you have setup up
simulators accordingly to the following:

Android:
1. Launch Virtual Device Manager setup
2. Device: `Pixel 9 Pro XL`
3. API Version: `API 35 "VanillaIceCream"; Android 15.0`

iOS:
1. Launch the XCode at least once, and open the Simulator app
2. Verify that you have version `18.5`
3. Verify that you have both `iPad Pro 13-inch (M4)` & `iPhone 16 Pro`

### General requirements

`macOS (ver. Sequoia 15.6.1)` - it is required to use macOS in order to launch [`iOS/Safari`](#iossafari-tests)
tests. If you don't want to perform iOS tests - feel free to use any OS of your choice.

[`NodeJS (ver. 22.13.0)`](https://nodejs.org/en) - required for Appium & WebdriverIO

[`Yarn (ver. 4.10.3)`](https://yarnpkg.com/) - required for package management (Yarn Berry)

[`Appium Server (ver. 3.1.0)`](https://appium.io/docs/en/latest/quickstart/install/) - required to launch mobile tests (
both Android & iOS) - or simply use the `npm install -g appium`

[`Allure Report`](https://allurereport.org/docs/gettingstarted-installation/) - required to generate after test reports

### Version Management Tools (Recommended)

Managing multiple versions of development tools can be challenging, especially when dealing with environment variables and PATH configurations. We strongly recommend using version managers to simplify this process:

#### macOS/Linux Users

- **[SDKMAN!](https://sdkman.io/)** - Manage Java versions effortlessly
  ```bash
  # Install SDKMAN!
  curl -s "https://get.sdkman.io" | bash
  
  # Install Java 17
  sdk install java 17.0.13-tem
  
  # Switch between Java versions
  sdk use java 17.0.13-tem
  ```

- **[Volta](https://volta.sh/)** - Manage Node.js and Yarn versions seamlessly
  ```bash
  # Install Volta
  curl https://get.volta.sh | bash
  
  # Install Node.js 22.13.0
  volta install node@22.13.0
  
  # Install Yarn 4.10.3
  volta install yarn@4.10.3
  ```

#### Windows Users

- **[winget](https://learn.microsoft.com/en-us/windows/package-manager/winget/)** - Windows Package Manager (built into Windows 10/11)
  ```powershell
  # winget comes pre-installed on Windows 10 (1809+) and Windows 11
  
  # Install Java
  winget install Microsoft.OpenJDK.17

- **[Volta](https://volta.sh/)** - Manage Node.js and Yarn versions seamlessly (cross-platform)
- ```powershell
  # Install Volta
  winget install Volta.Volta
  
  # After installation:
  
  # Install Node.js 22.13.0
  volta install node@22.13.0
  
  # Install Yarn 4.10.3
  volta install yarn@4.10.3
  ```

### Wikipedia App files download

To run mobile app tests, you'll need the Wikipedia application files. There are two ways to obtain them:

#### Automated Setup (Recommended)

The easiest way is to use the provided setup scripts. These will download, extract, and place the app files in the correct location automatically.

**Run All Setup Steps:**
```shell
yarn setup:apps
```
This interactive script will guide you through:
1. Downloading the Android APK file
2. Downloading the iOS app file
3. Build the iOS app for simulator and create a zipped version of it (required by WebdriverIO)
4. Running your first test (optional)

**Individual Setup Commands:**

If you prefer to set up only specific platforms, use these commands:

```shell
# Android only
yarn setup:apps:android

# iOS only
yarn setup:apps:ios
```

**Manual Verification:**

After running the setup scripts, verify the files are in place:
- Android APK: `./apps/android/wikipedia.apk`
- iOS App: `./apps/ios/wikipedia.app.zip/`

#### Manual Setup

If you prefer to download and set up the files manually:

**For Android:**
1. Download the latest APK from [Wikipedia Android releases](https://releases.wikimedia.org/mobile/android/wikipedia/stable/)
2. Rename it to `wikipedia.apk`
3. Place it in `apps/android/wikipedia.apk`

**For iOS (macOS only):**
1. Ensure you have Xcode, Git, and Homebrew installed
2. Clone the Wikipedia iOS repository:
   ```bash
   cd apps/ios
   git clone --depth 1 https://github.com/wikimedia/wikipedia-ios.git wikipedia-ios-source
   cd wikipedia-ios-source
   ```
3. Run the setup script (installs dependencies via Homebrew):
   ```bash
   ./scripts/setup
   ```
4. Build the app:
   ```bash
   xcodebuild -project Wikipedia.xcodeproj -scheme Wikipedia -configuration Debug \
     -sdk iphonesimulator -destination "platform=iphonesimulator,OS=18.5,name=iPhone 16 Pro" build
   ```
5. Find the built app in `DerivedData/Build/Products/Debug-iphonesimulator/Wikipedia.app`
6. Copy `Wikipedia.app` to `apps/ios/Wikipedia.app`
7. Create a zip (required by WebdriverIO):
   ```bash
   cd apps/ios
   zip -qr wikipedia.app.zip Wikipedia.app
   ```

**Note:** WebdriverIO requires iOS apps to be in `.zip` format for simulator testing.

### Android tests

[`Android Studio (ver. 2025.1.2)`](https://developer.android.com/studio) - required for an easy setup of the Android
devices

[`Java (ver. 17)`](https://www.oracle.com/java/) - required for proper Android Studio functioning

[`UiAutomator 2 (ver. 5.0.0)`](https://appium.io/docs/en/2.19/quickstart/uiauto2-driver/) - required to launch Appium
tests on Android devices - or simply use the `appium driver install uiautomator2`

### iOS/Safari tests

[`XCode (ver. 26.0.1)`](https://developer.apple.com/xcode/) - required to build the iOS app and run tests on Apple's
simulators/devices

[`Homebrew`](https://brew.sh/) - required for iOS app setup (the Wikipedia iOS setup script uses Homebrew to install SwiftLint, ClangFormat, and other dependencies)
  ```bash
  # Install Homebrew (if not already installed)
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```

[`XCUITest Driver (ver. 10.0.4)`](https://appium.github.io/appium-xcuitest-driver/9.10/installation/) - required to
launch Appium tests on iOS devices - or simply use the `appium driver install xcuitest`

## Running Tests
___

### Getting Started

After completing the [Wikipedia App files download](#wikipedia-app-files-download) section, you're ready to run tests.

**Note for CI/CD:** When setting up continuous integration, use `yarn install --immutable` to ensure dependencies match exactly what's in your `yarn.lock` file. This prevents unexpected dependency updates and ensures reproducible builds.

### Available Sample Tests

This template includes pre-configured sample tests that demonstrate how to write cross-platform tests. Each test suite showcases different testing scenarios:

| Command                       | Platform                | Browser/App             |
|-------------------------------|-------------------------|-------------------------|
| `yarn wdio:ios:native`        | iOS Simulator           | Native Wikipedia App    |
| `yarn wdio:ios:web`           | iOS Simulator           | Mobile Safari           |
| `yarn wdio:android:native`    | Android Emulator        | Native Wikipedia App    |
| `yarn wdio:android:web`       | Android Emulator        | Chrome Mobile           |
| `yarn wdio:web:edge`          | Desktop                 | Microsoft Edge          |

**What the sample tests do:**
- Navigate to Wikipedia (via app or browser)
- Search for articles
- Verify search results
- Demonstrate platform-specific element interactions
- Show cross-platform selector usage

These tests serve as both a validation of your setup and templates for writing your own tests.

### Web Tests

**Pre-requisites:**

Install one of the below browsers that you want to use for testing, like:

- Microsoft Edge (used in example)
- Google Chrome
- Mozilla Firefox

Note: **Safari** it's pre-installed on macOS. In Safari 18 or later, open the Settings app. Go to Apps > Safari > Advanced,
then turn on `Allow remote automation`.

### After Test Run

After running any test suite, test results are automatically saved in the `allure-results` directory. You can view detailed test reports using the commands described in the [Reporting](#reporting) section.

## Writing Tests
___

### Selectors

This framework uses a centralized selector management system that allows you to define platform-specific selectors in one place and use them across your entire test suite.

**Selector File Location:** `./test/common/selectors.ts`

All selectors are stored in the `selectors` object, organized by page/feature. Each selector can have up to four platform-specific variants to support different environments:

### Available Selectors

| Selector Key    | Type     | Description                                      |
|-----------------|----------|--------------------------------------------------|
| `android`       | `string` | Android native app                               |
| `ios`           | `string` | iOS (iPhone / iPad)                              |
| `mobileBrowser` | `string` | Mobile Browser (Android - Chrome / iOS - Safari) |
| `web`           | `string` | Desktop Browser (Windows / macOS / Linux)        |

### Using select() and selectArray()

The reason we use this division between selectors is because of the way the application behaves on different platforms.

If you look at our demo application under test - `Wikipedia`, you can see that even the user flow within the
application is different if it's a native mobile application or a browser version.

To make this process a little bit less bizarre to handle, we can utilise `select()` and `selectArray()` functions
(both can be found within the [`test/common/sharedCommands.ts`](./test/common/sharedCommands.ts)).

At first, they seem complicated and not very intuitive, but once you get used to them, they save a lot of maintenance
headaches when writing complex cross-platform tests.

Here's a small comparison, how cross-platform selectors can be handled without separate `select()` and `selectArray()`
functions:

```typescript
searchField: async () => {
  if (browser.isNativeContext) {
    return browser.isAndroid ?
      await getById(selectors.homePage.searchField.android) :
      await getByClassChain(selectors.homePage.searchField.ios);
  } else {
    return browser.isMobile ?
      await browser.$(selectors.homePage.searchField.mobileBrowser) :
      await browser.$(selectors.homePage.searchField.web);
  }
}
```

As you can see, if we have to specify all four different selectors, the single selector function
can get huge and unfriendly in terms of maintenance.

If we use either `select()` or `selectArray()`, the selector function still is quite complex, don't get me wrong, but it
is much easier to maintain and understand.

The biggest advantage is that we don't need to specify every single property (i.e. `.searchField.android`,
`.searchField.ios`, `.searchField.mobileBrowser`, `.searchField.web`).

Additionally, if we're using a specific mobile selection method (e.g.
for [iOS](https://webdriver.io/docs/selectors/#ios-xcuitest-predicate-strings-and-class-chains)
or [Android](https://webdriver.io/docs/selectors/#accessibility-id)), we can define this using dedicated parameters:
`androidSelectionMethod` and `iosSelectionMethod`.

```typescript
searchField: () => select({
  ...selectors.homePage.searchField,
  androidSelectionMethod: getById,
  iosSelectionMethod: getByClassChain,
})
```

In a *perfect world* scenario, where we use the standard `browser.$()` for all platforms
(which is doable if we only use XPath for mobile selectors), the selector function can be simplified even further to:

```javascript
searchField: () => select(selectors.homePage.searchField)
```

### Selectors with Variables

Sometimes, we want to use selectors with variables. The most common scenario would be a `data-id` attribute that has a
dynamically generated counter (e.g., `item-0-dropdown`, `item-1-dropdown` etc.).

#### Without Variables

The first way to handle this situation, would be the naive and straightforward one.

1. Simply create a hardcoded selector that would represent that given element:

```typescript
homePage: {
  firstDropdownItem: {
    ios: '//XCUIElementTypeStaticText[@name, "item-0-dropdown"]',
    android: '//android.widget.TextView[@text, "item-0-dropdown"]',
    web: '//*[@data-testid="item-0-dropdown"]',
    mobileBrowser: '//*[@data-testid="item-0-dropdown"]//span',
  },
  secondDropdownItem: {
    ios: '//XCUIElementTypeStaticText[@name, "item-1-dropdown"]',
    android: '//android.widget.TextView[@text, "item-1-dropdown"]',
    web: '//*[@data-testid="item-1-dropdown"]',
    mobileBrowser: '//*[@data-testid="item-1-dropdown"]//span',
  },
  thirdDropdownItem: {
    ios: '//XCUIElementTypeStaticText[@name, "item-2-dropdown"]',
    android: '//android.widget.TextView[@text, "item-2-dropdown"]',
    web: '//*[@data-testid="item-2-dropdown"]',
    mobileBrowser: '//*[@data-testid="item-2-dropdown"]//span',
  }
  // [rest of the code]
}
```

2. Use it within your Page Object Model file:

```typescript
firstDropdownItem: () => select(selectors.homePage.firstDropdownItem)
secondDropdownItem: () => select(selectors.homePage.secondDropdownItem)
thirdDropdownItem: () => select(selectors.homePage.thirdDropdownItem)
```

3. Example usage in the code could look like this:

```typescript
async selectDropdownItemByIndex(itemIndex: number): Promise < void > {
  switch(itemIndex) {
    case 0:
      await this.firstDropdownItem().click();
      break;
    case 1:
      await this.secondDropdownItem().click();
      break;
    case 2:
      await this.thirdDropdownItem().click();
      break;
    default:
      throw new Error(`Invalid dropdown item index: ${itemIndex}.`);
  }
},
```

#### With Variables
The second method allows us to provide dynamic data, and make our tests more robust.

1. Create a selector providing the variable within the curly braces `{{itemIndex}}`

*Note: If the `mobileBrowser` selector is the same as the `web` selector you can use just the `web` one, as it will
propagate the value to `mobileBrowser` as well.*

```typescript
homePage: {
  dropdownItem: {
    ios: '//XCUIElementTypeStaticText[@name, "item-{{itemIndex}}-dropdown"]',
    android: '//android.widget.TextView[@text, "item-{{itemIndex}}-dropdown"]', 
    web: '//*[@data-testid="item-{{itemIndex}}-dropdown"]'
  }
  // [rest of the code]
}
```

2. Then in your Page Object Model file add the selector as follows:

*Note: In the following example we're using separate identifiers `dropdownItemIndex` and `itemIndex` for demonstrative
purposes only.
If you want, you can use the variable identifier from the `selectors.ts` (`itemIndex`) for both.*

```typescript
nthDropdownItem: (dropdownItemIndex: number) =>
  select({
    ...selectors.homePage.dropdownItem,
    variables: {itemIndex: `${dropdownItemIndex}`},
  }),
```

3. Example usage in the code could look like this:

```typescript
async selectDropdownItemByIndex(itemIndex: number): Promise <void> {
  await this.nthDropdownItem(itemIndex).click();
},
```

## Reporting
___

### Allure Report

Allure is a popular test reporting framework that provides detailed, visual test execution reports. After your tests complete, you can generate and view reports using the following commands:

**Prerequisites:** You need to install [Allure](https://allurereport.org/docs/gettingstarted-installation/) before using these commands.

**Quick View (Recommended for local development):**
```shell
allure serve
```
Generates a report from the latest test results and automatically opens it in your browser. This is the fastest way to view test results after a test run.

**Generate Static Report (For hosting/sharing):**
```shell
allure generate
```
Creates a standalone HTML report in the `allure-report` directory. Use this when you want to host the report on a web server (e.g., GitHub Pages, GitLab Pages, or internal documentation sites).

**Open Generated Report:**
```shell
allure open
```
Opens a previously generated static report. Run this command from the directory containing the `allure-report` folder (typically the project root after running `allure generate`).

## Known Issues
___

### iOS Simulator Not Responding

**Issue:** iOS tests may fail on the first launch with simulator-related errors.

**Solution:** Simply retry running the tests. The iOS Simulator sometimes doesn't initialize properly on the first attempt, but typically works on subsequent runs. This is a known behavior with iOS Simulators and not specific to this framework.
