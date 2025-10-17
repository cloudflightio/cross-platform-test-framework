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
2. Install dependencies (using `npm ci`)
3. Download Android and iOS files using npm scripts
    1. All apps: `npm run setup:apps`
    2. Android *.apk file only: `npm run setup:apps:android`
    3. iOS zipped *.app file only: `npm run setup:apps:ios`
4. Launch tests either by agreeing to the last step of the interactive app setup or via npm scripts:

| Command                       | Description                                       |
|-------------------------------|---------------------------------------------------|
| `npm run wdio:ios:native`     | iOS using native Wikipedia app                    |
| `npm run wdio:ios:web`        | iOS using Wikipedia via mobile Safari browser     |
| `npm run wdio:android:native` | Android using native Wikipedia app                |
| `npm run wdio:android:web`    | Android using Wikipedia via mobile Chrome browser |
| `npm run wdio:web:edge`       | Web tests using desktop Edge Browser              |

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

- **[nvm (Node Version Manager)](https://github.com/nvm-sh/nvm)** - Manage Node.js versions
  ```bash
  # Install nvm
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  
  # Install Node.js 22.13.0
  nvm install 22.13.0
  
  # Use specific Node.js version
  nvm use 22.13.0
  
  # Set default version
  nvm alias default 22.13.0
  ```

#### Windows Users

- **[Scoop](https://scoop.sh/)** - Command-line installer for Windows (handles environment variables automatically)
  ```powershell
  # Install Scoop (run in PowerShell)
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
  
  # Install Java
  scoop bucket add java
  scoop install openjdk17
  
  # Install Node.js
  scoop install nodejs-lts
  
  # Install other tools
  scoop install allure
  ```

- **[nvm-windows](https://github.com/coreybutler/nvm-windows)** - Node Version Manager for Windows
  ```powershell
  # Download installer from GitHub releases page
  # After installation:
  
  # Install Node.js 22.13.0
  nvm install 22.13.0
  
  # Use specific version
  nvm use 22.13.0
  ```

- **[Chocolatey](https://chocolatey.org/)** - Alternative package manager for Windows
  ```powershell
  # Install Chocolatey (run in PowerShell as Administrator)
  Set-ExecutionPolicy Bypass -Scope Process -Force
  [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
  iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
  
  # Install packages
  choco install openjdk17
  choco install nodejs-lts
  choco install allure
  ```

**Benefits of using version managers:**
- ✅ Automatically handles PATH and environment variables
- ✅ Easy switching between different versions for different projects
- ✅ No manual environment variable configuration needed
- ✅ Simplified installation and updates
- ✅ Better isolation between projects

### Wikipedia App files download

For tests on all platforms you need to get the Wikipedia `*.apk` and `*.app.zip` files.

#### Automated Setup (Recommended)

For effortless setup use the automated script:
- **All apps**: `npm run setup:apps`
- **Android only**: `npm run setup:apps:android`
- **iOS only** (macOS required): `npm run setup:apps:ios`

The script will:
- Download the Android APK automatically
- Clone the Wikipedia iOS repository
- Build the iOS app for simulator
- Create a zipped version (required by WebdriverIO)
- Optionally clean up build artifacts to save disk space

#### Manual Setup

If the automated setup fails or you prefer manual installation:

**Android APK:**
1. Download the Wikipedia APK from: https://releases.wikimedia.org/mobile/android/wikipedia/stable/
2. Look for a file like `wikipedia-2.7.50552-r-2025-10-15.apk`
3. Place it in `apps/android/wikipedia.apk`

**iOS App (macOS only):**
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
   zip -qr Wikipedia.app.zip Wikipedia.app
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

First of all, you have to install required packages.

```shell
npm ci
```

### Available Sample Tests

| Command                       | Description                                       |
|-------------------------------|---------------------------------------------------|
| `npm run wdio:ios:native`     | iOS using native Wikipedia app                    |
| `npm run wdio:ios:web`        | iOS using Wikipedia via mobile Safari browser     |
| `npm run wdio:android:native` | Android using native Wikipedia app                |
| `npm run wdio:android:web`    | Android using Wikipedia via mobile Chrome browser |
| `npm run wdio:web:edge`       | Web tests using desktop Edge Browser              |

### Web Tests

To run web-based tests you just need to make sure that you have the desired browser installed on either
your local machine or CI/CD platform.

**Note:** Web tests run in headless mode by default (browser window is not visible). If you want to see what the tests are doing in real-time:
1. Open `wdio.web.edge.conf.ts` (or your respective browser config file)
2. Find the `--headless` flag in the browser capabilities
3. Comment out or delete the `--headless` flag
4. Save and run your tests again

### After Test Run

Once your tests has been launched, you can see the results in the console/terminal.
But, if you'd like to see more detailed report, use the `allure serve` command to launch the Allure Report locally.

## Writing Tests
___

### Selectors

Within this framework selectors/locators are placed in one shared location [
`test/common/selectors.ts`](./test/common/selectors.ts).

### Available Selectors

The list of available keys is defined by the type `Selector` within the
[`test/common/sharedCommands.ts`](./test/common/sharedCommands.ts), hence possible selectors are:

| Key             | Type     | Related Platform                                 |
|-----------------|----------|--------------------------------------------------|
| `android`       | `string` | Android                                          |
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
