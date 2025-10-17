export function addCustomMatchers() {
    // Without the workaround below it will end up with the following error:
    // TypeError: expect(...).toEqualString is not a function
    if ((global.expect as any).expect !== undefined) {
        global.expect = (global.expect as any).expect;
    }

    // The message option is capable of handling the ".not" part as well
    // (e.g. expect(valueUnderVerification).not.toEqualString())
    // this is why we have two different fallback strings (for "regular" and "negative")
    expect.extend({
        toEqualString(actual: string, expected: string, options?: any) {
            const pass = actual === expected;
            const customMessage = options?.message;
            return {
                pass,
                message: () => customMessage || (pass
                    ? `Expected "${actual}" not to equal "${expected}"`
                    : `Expected "${actual}" to equal "${expected}"`)
            };
        },

        toContainString(actual: string, expected: string, options?: any) {
            const pass = actual.includes(expected);
            const customMessage = options?.message;
            return {
                pass,
                message: () => customMessage || (pass
                    ? `Expected "${actual}" not to contain "${expected}"`
                    : `Expected "${actual}" to contain "${expected}"`)
            };
        },

        toBeGreaterThanNumber(actual: number, expected: number, options?: any) {
            const pass = actual > expected;
            const customMessage = options?.message;
            return {
                pass,
                message: () => customMessage || (pass
                    ? `Expected ${actual} not to be greater than ${expected}`
                    : `Expected ${actual} to be greater than ${expected} (difference: ${actual - expected})`)
            };
        },

        toBeLessThanNumber(actual: number, expected: number, options?: any) {
            const pass = actual < expected;
            const customMessage = options?.message;
            return {
                pass,
                message: () => customMessage || (pass
                    ? `Expected ${actual} not to be less than ${expected}`
                    : `Expected ${actual} to be less than ${expected} (difference: ${actual - expected})`)
            };
        },

        toBeGreaterThanOrEqualNumber(actual: number, expected: number, options?: any) {
            const pass = actual >= expected;
            const customMessage = options?.message;
            return {
                pass,
                message: () => customMessage || (pass
                    ? `Expected ${actual} not to be greater than or equal to ${expected}`
                    : `Expected ${actual} to be greater than or equal to ${expected} (difference: ${actual - expected})`)
            };
        },

        toBeLessThanOrEqualNumber(actual: number, expected: number, options?: any) {
            const pass = actual <= expected;
            const customMessage = options?.message;
            return {
                pass,
                message: () => customMessage || (pass
                    ? `Expected ${actual} not to be less than or equal to ${expected}`
                    : `Expected ${actual} to be less than or equal to ${expected} (difference: ${actual - expected})`)
            };
        },

        toEqualNumber(actual: number, expected: number, options?: any) {
            const pass = actual === expected;
            const customMessage = options?.message;
            return {
                pass,
                message: () => customMessage || (pass
                    ? `Expected ${actual} not to equal ${expected}`
                    : `Expected ${actual} to equal ${expected} (difference: ${actual - expected})`)
            };
        },

        toEqualBoolean(actual: boolean, expected: boolean, options?: any) {
            const pass = actual === expected;
            const customMessage = options?.message;
            return {
                pass,
                message: () => customMessage || (pass
                    ? `Expected ${actual} not to equal ${expected}`
                    : `Expected ${actual} to equal ${expected}`)
            };
        }
    });
}

declare global {
    namespace ExpectWebdriverIO {
        interface Matchers<R, T> {
            toEqualString(expected: string, options?: ExpectWebdriverIO.CommandOptions): R;
            toContainString(expected: string, options?: ExpectWebdriverIO.CommandOptions): R;
            toBeGreaterThanNumber(expected: number, options?: ExpectWebdriverIO.CommandOptions): R;
            toBeLessThanNumber(expected: number, options?: ExpectWebdriverIO.CommandOptions): R;
            toBeGreaterThanOrEqualNumber(expected: number, options?: ExpectWebdriverIO.CommandOptions): R;
            toBeLessThanOrEqualNumber(expected: number, options?: ExpectWebdriverIO.CommandOptions): R;
            toEqualNumber(expected: number, options?: ExpectWebdriverIO.CommandOptions): R;
            toEqualBoolean(expected: boolean, options?: ExpectWebdriverIO.CommandOptions): R;
        }
    }
}
