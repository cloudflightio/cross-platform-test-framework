import {addStep, endStep, startStep} from '@wdio/allure-reporter';
import type {ChainablePromiseArray, ChainablePromiseElement} from 'webdriverio';

// region LOGGING
/**
 * Returns a platform-specific prefix used in logs and Allure steps.
 */
function getPlatformPrefix(): string {
  if (!browser.isMobile) {
    return '[Web]';
  }

  return browser.isIOS ? '[iOS]' : '[Android]';
}

/**
 * Logs a message to the console and adds it as a step in the Allure report.
 * It prefixes the message with a platform-specific tag.
 * @param message The message to be logged and added to Allure.
 */
export async function addStepAndLog(message: string): Promise<void> {
  const modifiedMessage = `${getPlatformPrefix()} ${message}`;

  await addStep(modifiedMessage);
  console.log(modifiedMessage);
}

/**
 * Starts a step in the Allure report with a given message and logs it to the console.
 * It prefixes the message with a platform-specific tag.
 * @param message The message for starting a step and logging.
 */
export async function startStepAndLog(message: string): Promise<void> {
  const modifiedMessage = `${getPlatformPrefix()} ${message}`;

  await startStep(modifiedMessage);
  console.log(modifiedMessage);
}

// endregion LOGGING

//region SELECTORS
/**
 * Platform-specific selectors. None of them is required - define only the ones
 * for the platforms on which the element is actually used.
 * If `mobileBrowser` is not defined, the `web` selector is used in mobile browsers.
 */
type PlatformSelectors = {
  android?: string;
  ios?: string;
  mobileBrowser?: string;
  web?: string;
  variables?: Record<string, string>;
};

type Selector = PlatformSelectors & {
  iosSelectionMethod?: (selector: string) => ChainablePromiseElement;
  androidSelectionMethod?: (selector: string) => ChainablePromiseElement;
};

type SelectorArray = PlatformSelectors & {
  iosSelectionMethod?: (selector: string) => ChainablePromiseArray;
  androidSelectionMethod?: (selector: string) => ChainablePromiseArray;
};

type ResolvedSelector = {
  context: 'android' | 'ios' | 'browser';
  value: string;
};

/**
 * Throws a readable error when an element is used on a platform for which no selector was defined.
 * Selectors are NOT required for every platform - this only fires when the element is actually accessed
 * on the platform the test is currently running on.
 */
function requireSelector(value: string | undefined, platform: string): string {
  if (!value) {
    throw new Error(`No selector defined for platform: ${platform}`);
  }

  return value;
}

/**
 * Picks the selector matching the current platform (after applying variables).
 */
function resolveSelector(selector: PlatformSelectors): ResolvedSelector {
  const {webSelector, mobileBrowserSelector, androidSelector, iosSelector} =
    applyVariablesToSelectors(selector.variables, selector.web, selector.mobileBrowser, selector.android, selector.ios);

  if (browser.isNativeContext) {
    if (browser.isAndroid) {
      return {context: 'android', value: requireSelector(androidSelector, 'android')};
    }
    if (browser.isIOS) {
      return {context: 'ios', value: requireSelector(iosSelector, 'ios')};
    }
  }

  if (browser.isMobile && mobileBrowserSelector) {
    return {context: 'browser', value: mobileBrowserSelector};
  }

  return {
    context: 'browser',
    value: requireSelector(webSelector, browser.isMobile ? 'mobileBrowser (or web)' : 'web'),
  };
}

/**
 * Selects the element with the selector for the specific platform.
 * @param selector The selector, the selector can define variables with {{variableName}} that are replaced
 * with the corresponding value defined in the variables object.
 * @param selector.android Android selector.
 * @param selector.ios iOS selector.
 * @param selector.web Web selector.
 * @param selector.mobileBrowser Mobile browser selector (falls back to `web` if not defined).
 * @param selector.variables Variables that can be replaced in the selector string.
 * @param selector.iosSelectionMethod The iosSelectionMethod specifies a special selection method on iOS.
 * The possible methods are:
 * - getByPredicateString
 * - getByClassChain
 * - getByAccessibilityId
 * @param selector.androidSelectionMethod The androidSelectionMethod specifies a special selection method on Android.
 * The possible methods are:
 * - getById
 * - getByAccessibilityId
 * - getByUiSelectorClass
 * If no method is specified, browser.$(selector) is used (which means an XPath / CSS selector).
 * @returns The selected element.
 */
export function select(selector: Selector): ChainablePromiseElement {
  const {context, value} = resolveSelector(selector);

  if (context === 'android' && selector.androidSelectionMethod) {
    return selector.androidSelectionMethod(value);
  }
  if (context === 'ios' && selector.iosSelectionMethod) {
    return selector.iosSelectionMethod(value);
  }

  return browser.$(value);
}

/**
 * Selects the array of elements with the selector for the specific platform.
 * @param selector The selector, the selector can define variables with {{variableName}} that are replaced
 * with the corresponding value defined in the variables object.
 * @param selector.android Android selector.
 * @param selector.ios iOS selector.
 * @param selector.web Web selector.
 * @param selector.mobileBrowser Mobile browser selector (falls back to `web` if not defined).
 * @param selector.variables Variables that can be replaced in the selector string.
 * @param selector.iosSelectionMethod The iosSelectionMethod specifies a special selection method on iOS.
 * The possible methods are:
 * - getArrayByPredicateString
 * - getArrayByClassChain
 * - getArrayByAccessibilityId
 * @param selector.androidSelectionMethod The androidSelectionMethod specifies a special selection method on Android.
 * The possible methods are:
 * - getArrayById
 * - getArrayByAccessibilityId
 * If no method is specified, browser.$$(selector) is used (which means an XPath / CSS selector).
 * @returns The selected array of elements.
 */
export function selectArray(selector: SelectorArray): ChainablePromiseArray {
  const {context, value} = resolveSelector(selector);

  if (context === 'android' && selector.androidSelectionMethod) {
    return selector.androidSelectionMethod(value);
  }
  if (context === 'ios' && selector.iosSelectionMethod) {
    return selector.iosSelectionMethod(value);
  }

  return browser.$$(value);
}

/**
 * If there are variables provided in the select() or selectArray() functions
 * they will be used to update the provided selectors.
 * Selectors that are not defined for a given platform stay undefined.
 * @param variables Variables to be used for an update
 * @param webSelector Web selector that may contain variables
 * @param mobileBrowserSelector Mobile browser selector that may contain variables
 * @param androidSelector Android selector that may contain variables
 * @param iosSelector iOS selector that may contain variables
 * @returns Updated selectors with variables replaced by actual values
 */
function applyVariablesToSelectors(
  variables: Record<string, string> | undefined,
  webSelector: string | undefined,
  mobileBrowserSelector: string | undefined,
  androidSelector: string | undefined,
  iosSelector: string | undefined,
) {
  if (variables != null) {
    for (const variableKey in variables) {
      if (Object.hasOwn(variables, variableKey)) {
        const variableValue = variables[variableKey];

        if (variableValue == null) {
          continue;
        }

        const placeholder = `{{${variableKey}}}`;
        webSelector = webSelector?.replaceAll(placeholder, variableValue);
        mobileBrowserSelector = mobileBrowserSelector?.replaceAll(placeholder, variableValue);
        androidSelector = androidSelector?.replaceAll(placeholder, variableValue);
        iosSelector = iosSelector?.replaceAll(placeholder, variableValue);
      }
    }
  }

  return {
    webSelector,
    mobileBrowserSelector,
    androidSelector,
    iosSelector,
  };
}

/**
 * This selector can be used for Android automation if the resource-id is provided in the app.
 *
 * https://github.com/appium/appium-uiautomator2-driver?tab=readme-ov-file#element-location
 * @param searchBy The resource-id used to locate the element.
 * @returns ChainablePromiseElement A WebdriverIO element promise, allowing further chainable operations.
 */
export function getById(searchBy: string): ChainablePromiseElement {
  return browser.$(`id:${searchBy}`);
}

/**
 * This selector can be used for Android automation with UiAutomator UiSelector expressions
 * (e.g. `new UiSelector().text("Skip")`).
 *
 * https://webdriver.io/docs/selectors#android-uiautomator
 * @param searchBy The UiSelector expression used to locate the element.
 * @returns ChainablePromiseElement A WebdriverIO element promise, allowing further chainable operations.
 */
export function getByUiSelectorClass(searchBy: string): ChainablePromiseElement {
  return browser.$(`android=${searchBy}`);
}

/**
 * This selector can be used for Android automation if the resource-id is provided in the app.
 *
 * https://github.com/appium/appium-uiautomator2-driver?tab=readme-ov-file#element-location
 * @param searchBy The resource-id used to locate the array of elements.
 * @returns ChainablePromiseArray An WebdriverIO elements promise array, allowing further chainable operations.
 */
export function getArrayById(searchBy: string): ChainablePromiseArray {
  return browser.$$(`id:${searchBy}`);
}

/**
 * This selector can be used for both iOS and Android automation,
 * if the Accessibility ID is provided in the app.
 *
 * https://webdriver.io/docs/selectors/#accessibility-id
 * @param searchBy The accessibility ID used to locate the element.
 * @returns ChainablePromiseElement A WebdriverIO element promise, allowing further chainable operations.
 */
export function getByAccessibilityId(searchBy: string): ChainablePromiseElement {
  return browser.$(`~${searchBy}`);
}

/**
 * This selector can be used for both iOS and Android automation,
 * if the Accessibility ID is provided in the app.
 *
 * https://webdriver.io/docs/selectors/#accessibility-id
 * @param searchBy The accessibility ID used to locate the array of elements.
 * @returns ChainablePromiseArray An WebdriverIO elements promise array, allowing further chainable operations.
 */
export function getArrayByAccessibilityId(searchBy: string): ChainablePromiseArray {
  return browser.$$(`~${searchBy}`);
}

/**
 * Finds an iOS element using a predicate string.
 *
 * https://webdriver.io/docs/selectors/#ios-xcuitest-predicate-strings-and-class-chains
 * @param searchBy The predicate string used to locate the element.
 * @returns ChainablePromiseElement A WebdriverIO element promise, allowing further chainable operations.
 */
export function getByPredicateString(searchBy: string): ChainablePromiseElement {
  return browser.$(`-ios predicate string:${searchBy}`);
}

/**
 * Finds iOS elements using a predicate string.
 *
 * https://webdriver.io/docs/selectors/#ios-xcuitest-predicate-strings-and-class-chains
 * @param searchBy The predicate string used to locate the array of elements.
 * @returns ChainablePromiseArray An WebdriverIO elements promise array, allowing further chainable operations.
 */
export function getArrayByPredicateString(searchBy: string): ChainablePromiseArray {
  return browser.$$(`-ios predicate string:${searchBy}`);
}

/**
 * Finds an iOS element using a class chain.
 *
 * https://webdriver.io/docs/selectors/#ios-xcuitest-predicate-strings-and-class-chains
 * @param searchBy The class chain string used to locate the element.
 * @returns ChainablePromiseElement A WebdriverIO element promise, allowing further chainable operations.
 */
export function getByClassChain(searchBy: string): ChainablePromiseElement {
  return browser.$(`-ios class chain:${searchBy}`);
}

/**
 * Finds iOS elements using a class chain.
 *
 * https://webdriver.io/docs/selectors/#ios-xcuitest-predicate-strings-and-class-chains
 * @param searchBy The class chain string used to locate the array of elements.
 * @returns ChainablePromiseArray An WebdriverIO elements promise array, allowing further chainable operations.
 */
export function getArrayByClassChain(searchBy: string): ChainablePromiseArray {
  return browser.$$(`-ios class chain:${searchBy}`);
}

// endregion SELECTORS

// region TEST UTILITY FUNCTIONS
/**
 * Retrieves and returns the text content of a specified element after ensuring it is displayed.
 * @param element The WebdriverIO element from which to retrieve text.
 * @returns Promise<string> A promise resolving to the text content of the element.
 */
export async function getTextFromElement(element: ChainablePromiseElement): Promise<string> {
  await element.waitForDisplayed();

  return await element.getText();
}

/**
 * Common wrapper for all verify* functions: opens an Allure step, runs the assertion,
 * takes a screenshot and always closes the step - also when the assertion fails.
 * @param title A descriptive title of the verification being performed.
 * @param details Actual/expected values description added to the log.
 * @param assertion The assertion to run. Receives the full validation message.
 */
async function runVerification(
  title: string,
  details: string,
  assertion: (validationMessage: string) => unknown,
): Promise<void> {
  const titleMessage = `Verify ${title}`;
  const validationMessage = `${titleMessage} | ${details}`;

  await startStepAndLog(titleMessage);
  try {
    await addStepAndLog(validationMessage);
    await assertion(validationMessage);
    await takeScreenshotWithTitle('After verification');
  } finally {
    await endStep();
  }
}

/**
 * Verifies if a text value equals an expected text value and logs the verification step.
 * @param title A descriptive title of the verification being performed.
 * @param valueUnderVerification The actual value to verify.
 * @param expectedValue The value expected for the verification to pass.
 */
export async function verifyTextEquality(
  title: string,
  valueUnderVerification: string,
  expectedValue: string,
): Promise<void> {
  await runVerification(
    title,
    `Actual value: "${valueUnderVerification}" | Should equal: "${expectedValue}"`,
    (message) => expect(valueUnderVerification).toEqualString(expectedValue, {message}),
  );
}

/**
 * Verifies if a value contains an expected substring text and logs the verification step.
 * @param title A descriptive title of the verification being performed.
 * @param valueUnderVerification The actual value to verify.
 * @param expectedValue The substring expected within the value for the verification to pass.
 */
export async function verifyPartialText(
  title: string,
  valueUnderVerification: string,
  expectedValue: string,
): Promise<void> {
  await runVerification(
    title,
    `Actual value: "${valueUnderVerification}" | Should contain partial text: "${expectedValue}"`,
    (message) => expect(valueUnderVerification).toContainString(expectedValue, {message}),
  );
}

/**
 * Verifies if a value is greater than the provided base value and logs the verification step.
 * @param title A descriptive title of the verification being performed.
 * @param valueUnderVerification The actual value to verify.
 * @param expectedValue The base value that the actual should be greater than.
 */
export async function verifyGreaterThan(
  title: string,
  valueUnderVerification: number,
  expectedValue: number,
): Promise<void> {
  await runVerification(
    title,
    `Actual value: ${valueUnderVerification} | Should be greater than: ${expectedValue}`,
    (message) => expect(valueUnderVerification).toBeGreaterThanNumber(expectedValue, {message}),
  );
}

/**
 * Verifies if a value is less than the provided base value and logs the verification step.
 * @param title A descriptive title of the verification being performed.
 * @param valueUnderVerification The actual value to verify.
 * @param expectedValue The base value that the actual should be less than.
 */
export async function verifyLessThan(
  title: string,
  valueUnderVerification: number,
  expectedValue: number,
): Promise<void> {
  await runVerification(
    title,
    `Actual value: ${valueUnderVerification} | Should be less than: ${expectedValue}`,
    (message) => expect(valueUnderVerification).toBeLessThanNumber(expectedValue, {message}),
  );
}

/**
 * Verifies if a value is greater than or equal to the provided base value and logs the verification step.
 * @param title A descriptive title of the verification being performed.
 * @param valueUnderVerification The actual value to verify.
 * @param expectedValue The base value that the actual should be greater than or equal to.
 */
export async function verifyGreaterThanOrEqual(
  title: string,
  valueUnderVerification: number,
  expectedValue: number,
): Promise<void> {
  await runVerification(
    title,
    `Actual value: ${valueUnderVerification} | Should be greater than or equal to: ${expectedValue}`,
    (message) => expect(valueUnderVerification).toBeGreaterThanOrEqualNumber(expectedValue, {message}),
  );
}

/**
 * Verifies if a value is less than or equal to the provided base value and logs the verification step.
 * @param title A descriptive title of the verification being performed.
 * @param valueUnderVerification The actual value to verify.
 * @param expectedValue The base value that the actual should be less than or equal to.
 */
export async function verifyLessThanOrEqual(
  title: string,
  valueUnderVerification: number,
  expectedValue: number,
): Promise<void> {
  await runVerification(
    title,
    `Actual value: ${valueUnderVerification} | Should be less than or equal to: ${expectedValue}`,
    (message) => expect(valueUnderVerification).toBeLessThanOrEqualNumber(expectedValue, {message}),
  );
}

/**
 * Verifies if a numeric value equals an expected numeric value and logs the verification step.
 * @param title A descriptive title of the verification being performed.
 * @param valueUnderVerification The actual value to verify.
 * @param expectedValue The value expected for the verification to pass.
 */
export async function verifyNumberEquality(
  title: string,
  valueUnderVerification: number,
  expectedValue: number,
): Promise<void> {
  await runVerification(
    title,
    `Actual value: ${valueUnderVerification} | Should equal: ${expectedValue}`,
    (message) => expect(valueUnderVerification).toEqualNumber(expectedValue, {message}),
  );
}

/**
 * Verifies if a boolean value equals an expected boolean value and logs the verification step.
 * @param title A descriptive title of the verification being performed.
 * @param valueUnderVerification The actual boolean value to verify.
 * @param expectedValue The expected boolean value.
 */
export async function verifyBooleanEquality(
  title: string,
  valueUnderVerification: boolean,
  expectedValue: boolean,
): Promise<void> {
  await runVerification(
    title,
    `Actual value: ${valueUnderVerification} | Should equal: ${expectedValue}`,
    (message) => expect(valueUnderVerification).toEqualBoolean(expectedValue, {message}),
  );
}

// endregion TEST UTILITY FUNCTIONS

// region WAIT FUNCTIONS

/**
 * Waits until a page is completely loaded by ensuring all specified elements are displayed.
 * @param elementDescription The title of the page being loaded.
 * @param elementsForValidation A variable number of WebdriverIO elements to verify visibility.
 * @returns Resolves when all elements are confirmed to be displayed, ensuring page load completion.
 */
export async function waitUntilElementsAreLoaded(
  elementDescription: string,
  ...elementsForValidation: ChainablePromiseElement[]
): Promise<void> {
  await startStepAndLog(`Wait until ${elementDescription} is loaded`);

  try {
    await Promise.all(
      elementsForValidation.map((element) => element.waitForDisplayed()),
    );
  } finally {
    await endStep();
  }
}

// endregion WAIT FUNCTIONS

// region UTILITIES
/**
 * Inputs a given value into a specified element.
 * @param element The WebdriverIO element to receive the input.
 * @param valueToBeEntered The string value to be entered.
 * @param inputName A name of the input for logging purposes.
 */
export async function enterValue(
  element: ChainablePromiseElement,
  valueToBeEntered: string,
  inputName: string,
): Promise<void> {
  await addStepAndLog(`Enter ${valueToBeEntered} to the ${inputName}`);
  await element.setValue(valueToBeEntered);
}

/**
 * Pauses the execution for a specified number of milliseconds.
 * Prefer explicit waits (waitForDisplayed, waitUntil) whenever possible.
 * @param ms The number of milliseconds to wait.
 */
export async function sleep(ms: number): Promise<void> {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Takes a screenshot and saves it with a specified title in the Allure report.
 * @param title The title to go with the screenshot in the Allure report.
 */
export async function takeScreenshotWithTitle(title: string): Promise<void> {
  await startStep(`[SCREENSHOT] ${title}`);

  try {
    await browser.takeScreenshot();
  } finally {
    await endStep();
  }
}

/**
 * Clicks an element and adds a step log.
 * @param element Element to click on.
 * @param buttonName A custom button name for logging.
 * @param shouldScroll A flag that is helpful to avoid potential mobile testing failures due to scrolling issues
 * (disabled by default).
 */
export async function clickElement(
  element: ChainablePromiseElement,
  buttonName: string,
  shouldScroll: boolean = false,
): Promise<void> {
  await addStepAndLog(`Click ${buttonName}`);

  if (shouldScroll) {
    await element.scrollIntoView();
  }

  await element.click();
}

/**
 * Generates a formatted date-time string based on the local machine's current date and time
 * @returns A formatted string in YYYY-MM-DD HH:MM:SS format
 */
export function getDateTimeString(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');

  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return `${date} ${time}`;
}

//endregion UTILITIES
