
import { isEmpty, toggleElement } from './utils.js';
import { getSettings, saveSettings } from './storage.js';
import { ELEMENTS, SETTINGS_ITEMS_SELECTOR, SEARCH_ENGINES } from './constants.js';

export async function loadSettings() {
    const settings = await getSettings();
    if (isEmpty(settings)) {
        return saveSettings(getDefaultSettings());
    }
    getSettingsItems().forEach(element => {
        element.checked = settings[element.id];
    });
}

export function addSettingsMenuListeners() {
    const settingsIconEl = document.getElementById(ELEMENTS.SETTINGS_ICON);
    const settingsBlockEl = document.getElementById(ELEMENTS.SETTINGS_BLOCK);
    settingsIconEl.addEventListener('click', () => toggleElement(settingsBlockEl));
}

export function addSettingsActionsListeners() {
    getSettingsItems().forEach(element => (
        element.addEventListener('click', onSettingsChanged)
    ));
}

function getSettingsItems() {
    return document.querySelectorAll(SETTINGS_ITEMS_SELECTOR);
}

/**
 * only works with checkboxes, since it's all i have for now
 * @param {*} e 
 */
async function onSettingsChanged(e) {
    // gotta check if it's possible
    e.preventDefault();
    const { id, checked } = e.target;
    const settings = await getSettings();
    settings[id] = checked;
    if (SEARCH_ENGINES.includes(id) && !isSettingsValid(settings)) {
        return alert('At least one search engine must be selected');
    }
    // after the check we can change the ui state
    e.target.checked = checked;
    saveSettings(settings);
}

// Check if at least one search engine is selected
function isSettingsValid(settings) {
    return SEARCH_ENGINES.reduce((res, se) => res || settings[se], false);
}

function getDefaultSettings() {
    const defaultSettings = {};
    getSettingsItems().forEach(element => {
        defaultSettings[element.id] = Boolean(element.checked);
    });
    return defaultSettings;
}