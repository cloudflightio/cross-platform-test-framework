import {addStep, endStep, startStep} from '@wdio/allure-reporter';
import {isNil} from 'lodash';
import {ChainablePromiseArray, ChainablePromiseElement} from 'webdriverio';

// region LOGGING
/**
 * Logs a message to the console and adds it as a step in the Allure report.
 * It prefixes the message with a platform-specific tag.
 * @param message The message to be logged and added to Allure.
 */
export async function addStepAndLog(message: string): Promise<void> {
  let modifiedMessage: string;
  if (browser.isMobile) {
    if (browser.isIOS) {
      modifiedMessage = `[iOS] ${message}`
    } else {
      modifiedMessage = `[Android] ${message}`
    }
  } else {
    modifiedMessage = `[Web] ${message}`
  }

  await addStep(modifiedMessage);
  console.log(modifiedMessage);
}

/**
 * Starts a step in the Allure report with a given message and logs it to the console.
 * It prefixes the message with a platform-specific tag.
 * @param message The message for starting a step and logging.
 */
export async function startStepAndLog(message: string): Promise<void> {
  let modifiedMessage: string;
  if (browser.isMobile) {
    if (browser.isIOS) {
      modifiedMessage = `[iOS] ${message}`
    } else {
      modifiedMessage = `[Android] ${message}`
    }
  } else {
    modifiedMessage = `[Web] ${message}`
  }

  await startStep(modifiedMessage);
  console.log(modifiedMessage);
}

// endregion LOGGING

//region SELECTORS
type Selector = {
  android?: string;
  ios?: string;
  mobileBrowser?: string;
  web?: string;
  variables?: Record<string, string>;
  iosSelectionMethod?: (selector: string) => ChainablePromiseElement;
  androidSelectionMethod?: (selector: string) => ChainablePromiseElement;
};

type SelectorArray = {
  android?: string;
  ios?: string;
  mobileBrowser?: string;
  web?: string;
  variables?: Record<string, string>;
  iosSelectionMethod?: (selector: string) => ChainablePromiseArray;
  androidSelectionMethod?: (selector: string) => ChainablePromiseArray;
};

/**
 * Selects the element with the selector for the specific platform.
 * @param selector The selector, the selector can define variables with {{variableName}} that are replaced
 * with the corresponding value defined in the variables object.
 * @param selector.android Android selector.
 * @param selector.ios iOS selector.
 * @param selector.web Web selector.
 * @param selector.mobileBrowser Mobile browser selector.
 * @param selector.variables Variables that can be replaced in the selector string.
 * @param selector.iosSelectionMethod The iosSelectionMethod specifies a special selection method on iOS.
 * The possible methods are:
 * - getByPredicateString
 * - getByClassChain
 * - getByAccessibilityId
 * @param selector.androidSelectionMethod The androidSelectionMethod specifies a special selection method on Android.
 * The possible method is:
 * - getById
 * - getByAccessibilityId
 * If no method is specified, browser.$(selector) is used (which means a XPath/CSS selector).
 * @returns The selected element.
 */
export function select(selector: Selector): ChainablePromiseElement {
  const {android, ios, mobileBrowser, web} = selector;
  const {iosSelectionMethod, androidSelectionMethod, variables} = selector;

  const {webSelector, mobileBrowserSelector, androidSelector, iosSelector} =
    applyVariablesToSelectors(variables, web, mobileBrowser, android, ios);

  if (browser.isNativeContext) {
    if (browser.isAndroid) {
      if (androidSelectionMethod) {
        return androidSelectionMethod(androidSelector);
      } else {
        return browser.$(androidSelector);
      }
    } else if (browser.isIOS) {
      if (iosSelectionMethod) {
        return iosSelectionMethod(iosSelector);
      } else {
        return browser.$(iosSelector);
      }
    }
  }

  if (browser.isMobile && mobileBrowserSelector) {
    return browser.$(mobileBrowserSelector);
  } else {
    return browser.$(webSelector);
  }
}

/**
 * Selects the element with the selector for the specific platform.
 * @param selector The selector, the selector can define variables with {{variableName}} that are replaced
 * with the corresponding value defined in the variables object.
 * @param selector.android Android selector.
 * @param selector.ios iOS selector.
 * @param selector.web Web selector.
 * @param selector.mobileBrowser Mobile browser selector.
 * @param selector.variables Variables that can be replaced in the selector string.
 * @param selector.iosSelectionMethod The iosSelectionMethod specifies a special selection method on iOS.
 * The possible methods are:
 * - getArrayByPredicateString
 * - getArrayByClassChain
 * - getArrayByAccessibilityId
 * @param selector.androidSelectionMethod The androidSelectionMethod specifies a special selection method on Android.
 * The possible method is:
 * - getArrayById
 * - getArrayByAccessibilityId
 * If no method is specified, browser.$$(selector) is used (which means a XPath/CSS selector).
 * @returns The selected array of elements.
 */
export function selectArray(selector: SelectorArray): ChainablePromiseArray {
  const {android, ios, mobileBrowser, web} = selector;
  const {iosSelectionMethod, androidSelectionMethod, variables} = selector;

  const {webSelector, mobileBrowserSelector, androidSelector, iosSelector} =
    applyVariablesToSelectors(variables, web, mobileBrowser, android, ios);

  if (browser.isNativeContext) {
    if (browser.isAndroid) {
      if (androidSelectionMethod) {
        return androidSelectionMethod(androidSelector);
      } else {
        return browser.$$(androidSelector);
      }
    } else if (browser.isIOS) {
      if (iosSelectionMethod) {
        return iosSelectionMethod(iosSelector);
      } else {
        return browser.$$(iosSelector);
      }
    }
  }

  if (browser.isMobile && mobileBrowserSelector) {
    return browser.$$(mobileBrowserSelector);
  } else {
    return browser.$$(webSelector);
  }
}

/**
 * If there are variables provided in the select() or selectArray() functions
 * they will be used to update the provided selectors
 * @param variables Variables to be used for an update
 * @param webSelector Web selector that may contain variables
 * @param mobileBrowserSelector Mobile browser selector that may contain variables
 * @param androidSelector Android selector that may contain variables
 * @param iosSelector iOS selector that may contain variables
 * @returns mobileSelector, webSelector Updated selectors with variables overridden to actual values
 */
function applyVariablesToSelectors(
  variables: Record<string, string>,
  webSelector: string,
  mobileBrowserSelector: string,
  androidSelector: string,
  iosSelector: string,
) {
  if (!isNil(variables)) {
    for (const variableKey in variables) {
      if (Object.hasOwn(variables, variableKey)) {
        const variableValue = variables[variableKey];

        if (isNil(variableValue)) {
          continue;
        }

        webSelector = webSelector.replaceAll(`{{${variableKey}}}`, variableValue);
        mobileBrowserSelector = mobileBrowserSelector.replaceAll(`{{${variableKey}}}`, variableValue);
        androidSelector = androidSelector.replaceAll(`{{${variableKey}}}`, variableValue);
        iosSelector = iosSelector.replaceAll(`{{${variableKey}}}`, variableValue);
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
 * This selector can be used for Android automation, if the resource-id is provided in the app.
 *
 * https://github.com/appium/appium-uiautomator2-driver?tab=readme-ov-file#element-location
 * @param searchBy The ID used to locate the element.
 * @returns ChainablePromiseElement A WebdriverIO element promise, allowing further chainable operations.
 */
export function getById(searchBy: string): ChainablePromiseElement {
  return browser.$(`id:${searchBy}`);
}

/**
 * This selector can be used for Android automation, if the resource-id is provided in the app.
 *
 * https://github.com/appium/appium-uiautomator2-driver?tab=readme-ov-file#element-location
 * @param searchBy The ID used to locate the array of elements.
 * @returns ChainablePromiseArray An WebdriverIO elements promise array, allowing further chainable operations.
 */
export function getArrayById(searchBy: string): ChainablePromiseArray {
  return browser.$$(`id:${searchBy}`);
}

/**
 * This selector can be used for both iOS and Android automation,
 * if the Accessibility ID is provided in the app.
 *
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
 * Finds an iOS element using a predicate string.
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
 * Finds an iOS element using a class chain.
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
 * @returns Promise<string> A promise resolving to the text content of the element, useful for assertions and verification processes.
 */
export async function getTextFromElement(element: ChainablePromiseElement): Promise<string> {
  await element.waitForDisplayed();

  return await element.getText();
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
  const titleMessage = `Verify ${title}`;
  const validationMessage = `${titleMessage} | Actual value: "${valueUnderVerification}" | Should equal: "${expectedValue}"`;

  await startStepAndLog(titleMessage);
  await addStepAndLog(validationMessage);
  await expect(valueUnderVerification).toEqualString(expectedValue, {
    message: validationMessage
  });

  await takeScreenshotWithTitle('After verification');
  await endStep();
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
  const titleMessage = `Verify ${title}`;
  const validationMessage = `${titleMessage} | Actual value: "${valueUnderVerification}" | Should contain partial text: "${expectedValue}"`;

  await startStepAndLog(titleMessage);
  await addStepAndLog(validationMessage);
  await expect(valueUnderVerification).toContainString(expectedValue, {
    message: validationMessage
  });

  await takeScreenshotWithTitle('After verification');
  await endStep();
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
  const titleMessage = `Verify ${title}`;
  const validationMessage = `${titleMessage} | Actual value: ${valueUnderVerification} | Should be greater than: ${expectedValue}`;

  await startStepAndLog(titleMessage);
  await addStepAndLog(validationMessage);
  await expect(valueUnderVerification).toBeGreaterThanNumber(expectedValue, {
    message: validationMessage
  });

  await takeScreenshotWithTitle('After verification');
  await endStep();
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
  const titleMessage = `Verify ${title}`;
  const validationMessage = `${titleMessage} | Actual value: ${valueUnderVerification} | Should be less than: ${expectedValue}`;

  await startStepAndLog(titleMessage);
  await addStepAndLog(validationMessage);
  await expect(valueUnderVerification).toBeLessThanNumber(expectedValue, {
    message: validationMessage
  });

  await takeScreenshotWithTitle('After verification');
  await endStep();
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
  const titleMessage = `Verify ${title}`;
  const validationMessage = `${titleMessage} | Actual value: ${valueUnderVerification} | Should be greater than or equal to: ${expectedValue}`;

  await startStepAndLog(titleMessage);
  await addStepAndLog(validationMessage);
  await expect(valueUnderVerification).toBeGreaterThanOrEqualNumber(expectedValue, {
    message: validationMessage
  });

  await takeScreenshotWithTitle('After verification');
  await endStep();
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
  const titleMessage = `Verify ${title}`;
  const validationMessage = `${titleMessage} | Actual value: ${valueUnderVerification} | Should be less than or equal to: ${expectedValue}`;

  await startStepAndLog(titleMessage);
  await addStepAndLog(validationMessage);
  await expect(valueUnderVerification).toBeLessThanOrEqualNumber(expectedValue, {
    message: validationMessage
  });

  await takeScreenshotWithTitle('After verification');
  await endStep();
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
  const titleMessage = `Verify ${title}`;
  const validationMessage = `${titleMessage} | Actual value: ${valueUnderVerification} | Should equal: ${expectedValue}`;

  await startStepAndLog(titleMessage);
  await addStepAndLog(validationMessage);
  await expect(valueUnderVerification).toEqualNumber(expectedValue, {
    message: validationMessage
  });

  await takeScreenshotWithTitle('After verification');
  await endStep();
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
  const titleMessage = `Verify ${title}`;
  const validationMessage = `${titleMessage} | Actual value: ${valueUnderVerification} | Should equal: ${expectedValue}`;

  await startStepAndLog(titleMessage);
  await addStepAndLog(validationMessage);
  await expect(valueUnderVerification).toEqualBoolean(expectedValue, {
    message: validationMessage
  });

  await takeScreenshotWithTitle('After verification');
  await endStep();
}

// endregion TEST UTILITY FUNCTIONS

// region WAIT FUNCTIONS

/**
 * Waits until a page is completely loaded by ensuring all specified elements are displayed.
 * @param elementDescription The title of the page being loaded.
 * @param elementsForValidation A variable number of WebdriverIO elements to verify visibility.
 * @returns  Resolves when all elements are confirmed to be displayed, ensuring page load completion.
 */
export async function waitUntilElementsAreLoaded(
  elementDescription: string,
  ...elementsForValidation: ChainablePromiseElement[]
): Promise<void> {
  await startStepAndLog(`Wait until ${elementDescription} is loaded`);

  if (elementsForValidation.length > 0) {
    await Promise.all(
      elementsForValidation.map(async (element: ChainablePromiseElement): Promise<void> => {
        await element.waitForDisplayed();
      }),
    );
  }

  await endStep();
}

// endregion WAIT FUNCTIONS

// region UTILITIES
/**
 * Inputs a given value into a specified element, considering platform-specific methods.
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

  if (browser.isMobile && browser.isNativeContext) {
    (browser.isIOS) ?
      await enterTextValueCharByChar(element, valueToBeEntered) :
      await element.sendKeys([valueToBeEntered]);
  } else {
    await element.setValue(valueToBeEntered);
  }
}

/**
 * Enters text into a web element character-by-character with validation to prevent
 * the WebdriverIO setValue() bug that causes missing or corrupted characters.
 *
 * @param {ChainablePromiseElement} element - The WebdriverIO element to receive the text input.
 *   Should be a text input element that supports the `addValue()` method.
 * @param {string} valueToBeEntered - The complete text string to be entered into the element.
 *   Can contain any valid UTF-8 characters including spaces, numbers, and special characters.
 *
 * @see {@link https://github.com/webdriverio/webdriverio/issues/1886} - WebdriverIO setValue() bug report
 * @see {@link https://github.com/webdriverio/webdriverio/issues/686} - ChromeDriver character skipping issue
 */
export async function enterTextValueCharByChar(
  element: ChainablePromiseElement,
  valueToBeEntered: string,
): Promise<void> {
  for (let i = 0; i < valueToBeEntered.length; i++) {
    const char = valueToBeEntered[i]!;

    await element.addValue(char);

    await browser.waitUntil(
      async () => {
        const currentValue = await element.getValue();
        return currentValue.length === i + 1 && currentValue.endsWith(char);
      },
      {timeout: 1000, interval: 50},
    );
  }
}

/**
 * Pauses the execution for a specified number of milliseconds.
 * @param ms The number of milliseconds to wait.
 * @returns A promise that resolves after the specified delay, useful for timing or waiting scenarios.
 */
export async function sleep(ms: number): Promise<void> {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Takes a screenshot and saves it with a specified title in the Allure report.
 * @param title The title to go with the screenshot in the Allure report.
 * @returns Completes after the screenshot is successfully taken and logged in the report.
 */
export async function takeScreenshotWithTitle(title: string): Promise<void> {
  await startStep(`[SCREENSHOT] ${title}`);

  await browser.takeScreenshot();

  await endStep();
}

/**
 * Clicks a button and adds a step log.
 * @param element Button to click on.
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
 * @returns {string} A formatted string in YYYY-MM-DD HH:MM:SS format
 */
export function getDateTimeString(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

//endregion UTILITIES
