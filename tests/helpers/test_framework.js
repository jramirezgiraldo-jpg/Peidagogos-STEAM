/**
 * ============================================================================
 * 🧪 PEIDAGOGOS STEAM — ZERO-DEPENDENCY E2E & CONTRACT TEST FRAMEWORK
 * ============================================================================
 * Provides test execution harness, assertion engine, mock browser environment,
 * DOM contract inspector, and multi-tier reporting capabilities.
 */

const fs = require('fs');
const path = require('path');

// Test Execution State
const testState = {
    currentTier: 'Tier 1: Feature Coverage',
    currentSuite: 'Default Suite',
    suites: [],
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    startTime: Date.now()
};

/**
 * Define a test suite block
 */
function describe(name, tier, fn) {
    if (typeof tier === 'function') {
        fn = tier;
        tier = testState.currentTier;
    }
    const previousSuite = testState.currentSuite;
    const previousTier = testState.currentTier;

    testState.currentSuite = name;
    testState.currentTier = tier || 'Tier 1: Feature Coverage';

    let suiteObj = {
        name,
        tier: testState.currentTier,
        tests: [],
        passed: 0,
        failed: 0
    };
    testState.suites.push(suiteObj);

    try {
        fn();
    } catch (err) {
        console.error(`Error in describe block "${name}":`, err);
    } finally {
        testState.currentSuite = previousSuite;
        testState.currentTier = previousTier;
    }
}

/**
 * Define an individual test case
 */
function it(name, fn) {
    testState.totalTests++;
    const currentSuiteObj = testState.suites[testState.suites.length - 1];
    const testRecord = {
        name,
        suite: testState.currentSuite,
        tier: testState.currentTier,
        status: 'PASSED',
        error: null,
        durationMs: 0
    };

    const start = Date.now();
    try {
        fn();
        testRecord.status = 'PASSED';
        testRecord.durationMs = Date.now() - start;
        testState.passed++;
        if (currentSuiteObj) currentSuiteObj.passed++;
    } catch (err) {
        testRecord.status = 'FAILED';
        testRecord.durationMs = Date.now() - start;
        testRecord.error = err.message || String(err);
        testState.failed++;
        if (currentSuiteObj) currentSuiteObj.failed++;
    }

    if (currentSuiteObj) {
        currentSuiteObj.tests.push(testRecord);
    }
    return testRecord;
}

/**
 * Fluent assertion builder
 */
function expect(actual) {
    return {
        toBe(expected) {
            if (actual !== expected) {
                throw new Error(`Expected ${JSON.stringify(expected)} (type: ${typeof expected}) but received ${JSON.stringify(actual)} (type: ${typeof actual})`);
            }
        },
        toEqual(expected) {
            const actStr = JSON.stringify(actual);
            const expStr = JSON.stringify(expected);
            if (actStr !== expStr) {
                throw new Error(`Expected deep equality:\nExpected: ${expStr}\nReceived: ${actStr}`);
            }
        },
        toBeTruthy() {
            if (!actual) {
                throw new Error(`Expected truthy value but received: ${JSON.stringify(actual)}`);
            }
        },
        toBeFalsy() {
            if (actual) {
                throw new Error(`Expected falsy value but received: ${JSON.stringify(actual)}`);
            }
        },
        toBeGreaterThanOrEqual(expected) {
            if (!(actual >= expected)) {
                throw new Error(`Expected ${actual} to be >= ${expected}`);
            }
        },
        toBeLessThanOrEqual(expected) {
            if (!(actual <= expected)) {
                throw new Error(`Expected ${actual} to be <= ${expected}`);
            }
        },
        toContain(item) {
            if (typeof actual === 'string') {
                if (!actual.includes(item)) {
                    throw new Error(`Expected string to contain substring "${item}", but it did not.\nTarget: ${actual.slice(0, 200)}...`);
                }
            } else if (Array.isArray(actual)) {
                if (!actual.includes(item)) {
                    throw new Error(`Expected array to contain item ${JSON.stringify(item)}`);
                }
            } else {
                throw new Error(`toContain called on non-string/non-array: ${typeof actual}`);
            }
        },
        toMatch(pattern) {
            if (typeof pattern === 'string') pattern = new RegExp(pattern);
            if (!pattern.test(String(actual))) {
                throw new Error(`Expected "${String(actual).slice(0, 150)}" to match pattern ${pattern}`);
            }
        },
        toNotContain(item) {
            if (typeof actual === 'string') {
                if (actual.includes(item)) {
                    throw new Error(`Expected string NOT to contain substring "${item}", but it was found.`);
                }
            } else if (Array.isArray(actual)) {
                if (actual.includes(item)) {
                    throw new Error(`Expected array NOT to contain item ${JSON.stringify(item)}`);
                }
            }
        }
    };
}

/**
 * Lightweight DOM & HTML contract parser
 */
class SimpleDomElement {
    constructor(tagName, attributes = {}, innerHtml = '', outerHtml = '') {
        this.tagName = tagName.toUpperCase();
        this.attributes = attributes;
        this.innerHTML = innerHtml;
        this.outerHTML = outerHtml;
        this.style = {};
        this.id = attributes.id || '';
        this.className = attributes.class || '';

        // Parse inline style if present
        if (attributes.style) {
            const stylePairs = attributes.style.split(';').map(s => s.trim()).filter(Boolean);
            for (const pair of stylePairs) {
                const colonIdx = pair.indexOf(':');
                if (colonIdx > -1) {
                    const k = pair.substring(0, colonIdx).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                    const v = pair.substring(colonIdx + 1).trim();
                    this.style[k] = v;
                }
            }
        }
    }

    getAttribute(name) {
        return this.attributes[name] !== undefined ? this.attributes[name] : null;
    }

    hasAttribute(name) {
        return this.attributes[name] !== undefined;
    }
}

/**
 * Inspect raw HTML string and extract element contracts
 */
function inspectHtml(htmlString) {
    return {
        hasElementWithId(id) {
            const idRegex = new RegExp(`id=["']${id}["']`, 'i');
            return idRegex.test(htmlString);
        },
        getElementById(id) {
            // Find opening tag
            const tagRegex = new RegExp(`<([a-zA-Z0-9]+)[^>]*id=["']${id}["'][^>]*>`, 'i');
            const match = htmlString.match(tagRegex);
            if (!match) return null;

            const fullOpeningTag = match[0];
            const tagName = match[1];

            // Parse attributes
            const attributes = {};
            const attrRegex = /([a-zA-Z0-9_-]+)(?:=["']([^"']*)["'])?/g;
            let attrMatch;
            while ((attrMatch = attrRegex.exec(fullOpeningTag)) !== null) {
                const key = attrMatch[1];
                const val = attrMatch[2] !== undefined ? attrMatch[2] : '';
                if (key.toLowerCase() !== tagName.toLowerCase()) {
                    attributes[key] = val;
                }
            }

            return new SimpleDomElement(tagName, attributes, '', fullOpeningTag);
        },
        hasSnippet(snippet) {
            return htmlString.includes(snippet);
        },
        matchesPattern(regex) {
            return regex.test(htmlString);
        }
    };
}

/**
 * Create Mock Browser Environment for running SPA modules
 */
function createMockBrowserEnv(initialHtml = '') {
    const storageStore = {
        local: {},
        session: {}
    };

    const localStorageMock = {
        getItem: (k) => (storageStore.local[k] !== undefined ? storageStore.local[k] : null),
        setItem: (k, v) => { storageStore.local[k] = String(v); },
        removeItem: (k) => { delete storageStore.local[k]; },
        clear: () => { storageStore.local = {}; }
    };

    const sessionStorageMock = {
        getItem: (k) => (storageStore.session[k] !== undefined ? storageStore.session[k] : null),
        setItem: (k, v) => { storageStore.session[k] = String(v); },
        removeItem: (k) => { delete storageStore.session[k]; },
        clear: () => { storageStore.session = {}; }
    };

    const domElements = new Map();

    const documentMock = {
        getElementById: (id) => {
            if (domElements.has(id)) return domElements.get(id);
            // Default mock element if queried
            const el = new SimpleDomElement('div', { id }, '', `<div id="${id}"></div>`);
            domElements.set(id, el);
            return el;
        },
        querySelector: (selector) => {
            if (selector.startsWith('#')) {
                return documentMock.getElementById(selector.slice(1));
            }
            return new SimpleDomElement('div', {}, '', '<div></div>');
        },
        querySelectorAll: (selector) => {
            return [];
        },
        createElement: (tag) => {
            return new SimpleDomElement(tag, {}, '', `<${tag}></${tag}>`);
        }
    };

    const windowMock = {
        document: documentMock,
        localStorage: localStorageMock,
        sessionStorage: sessionStorageMock,
        location: { reload: () => {}, href: '' },
        alert: (msg) => {},
        confirm: () => true,
        LISTA_HERRAMIENTAS_PEDAGOGICAS: [],
        METADATOS_CAJAS_TEMATICAS: {},
        _archivosAsignaturaDocente: []
    };

    return {
        window: windowMock,
        document: documentMock,
        localStorage: localStorageMock,
        sessionStorage: sessionStorageMock,
        domElements,
        resetStorage: () => {
            storageStore.local = {};
            storageStore.session = {};
        }
    };
}

module.exports = {
    describe,
    it,
    expect,
    inspectHtml,
    createMockBrowserEnv,
    testState
};
