import {
    RULES_STORAGE_KEY,
    SETTINGS_STORAGE_KEY,
    FULFILLED_STORAGE_KEY ,
    STRICT_MODE_KEY,
} from './constants.js';

export const getFromStorage = (key, defaultValue) => new Promise(
    (resolve) => chrome.storage.sync.get(key, (data) => resolve(data[key] || defaultValue))
);
export const setToStorage = (data) => new Promise((resolve) => chrome.storage.sync.set(data, resolve));

export const getSettings = () => getFromStorage(SETTINGS_STORAGE_KEY, {});

export const getRules = () => getFromStorage(RULES_STORAGE_KEY, {});

export const getFulfileld = () => getFromStorage(FULFILLED_STORAGE_KEY, {});


export async function getSetting(key) {
    const settings = await getSettings();
    return settings[key];
}
export const isStrictMatching = () => getSetting(STRICT_MODE_KEY);

export async function getRuleFor(key) {
    const rules = await getRules();
    return rules[key];
}

export const saveSettings = data => setToStorage({
    [SETTINGS_STORAGE_KEY]: data
})

export async function addRule(key, value) {
    const rules = await getRules();
    return setToStorage({
        [RULES_STORAGE_KEY]: {
            ...rules,
            [key]: value
        }
    })
}

export async function getFulfilledAt(key) {
    const fulfilled = await getFulfileld() || {};
    return fulfilled[key];
}

export async function setFulfilled(key, searchEngine) {
    const fulfilled = await getFulfileld();
    const time = (new Date()).toLocaleTimeString();
    return setToStorage({
        [FULFILLED_STORAGE_KEY]: {
            ...fulfilled,
            [key]: `${time} (${searchEngine})`
        }
    })
}

export async function removeRule(key) {
    const rules = await getRules();
    const fulfilled = await getFulfileld();
    delete rules[key];
    delete fulfilled[key];
    return setToStorage({
        [RULES_STORAGE_KEY]: rules,
        [FULFILLED_STORAGE_KEY]: fulfilled,
    })
}