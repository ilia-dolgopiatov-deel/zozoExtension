import { ELEMENTS,
    ADD_RULE_ROLE,
    RULES_STORAGE_KEY, 
    FULFILLED_STORAGE_KEY,
} from './constants.js';
import {
    isEmpty,
    showElement,
    setElementText,
    hideElement,
    toArray,
} from './utils.js';
import {
    addSettingsMenuListeners,
    addSettingsActionsListeners,
    loadSettings,
} from './settings.js';
import {
    getRules,
    addRule,
    removeRule,
    getFulfilledAt,
} from './storage.js';

const manifestData = chrome.runtime.getManifest();

// handlers
function addListeners() {
    addProActionsListeners();
    addSettingsMenuListeners();
    addSettingsActionsListeners();
    addRulesListeners();
}

function addProActionsListeners() {
    document.querySelectorAll('[data-pro-only').forEach(
        element => element.addEventListener('click', handleProAction)
    );
}

function addRulesListeners() {
    const emptyBlockEl = document.getElementById(ELEMENTS.EMPTY_BLOCK);
    const rulesListEl = document.getElementById(ELEMENTS.RULES_LIST);
    const addRuleEls = document.querySelectorAll(`[role=${ADD_RULE_ROLE}]`);
    const addRuleFormEl = document.getElementById(ELEMENTS.ADD_RULE_FORM);
    addRuleEls.forEach(element => element.addEventListener('click', () => {
        hideElement(emptyBlockEl);
        hideElement(rulesListEl);
        showElement(addRuleFormEl);
    }));
    addRuleFormEl.addEventListener('submit', handleRuleSubmitted);
}

function handleProAction(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    alert("Sorry, this feature is only available in PRO version");
}

async function handleRuleSubmitted(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    if (validateForm(data)) {
        const ruleKey = data.get('key');
        const ruleValue = data.get('value');
        return addRule(ruleKey, ruleValue).then(() => afterFormSubmitted(form));
    }
}

/**
 * validates form
 * value must be valid URL
 * @param {*} data 
 * @returns true if valid, false otherwise.
 */
function validateForm(data) {
    try {
        new URL(data.get('value'));
    } catch (e) {
        const field = document.getElementById(ELEMENTS.URL_INPUT);
        field.setCustomValidity('Incorrect URL');
        field.reportValidity();
        field.addEventListener('input', () => field.setCustomValidity(''), { once: true });
        return false;
    }
    return true;
}

function afterFormSubmitted(form) {
    for (let field of form.querySelectorAll('input')) {
        field.value = '';
    }
    hideElement(form);
}

async function initPopup() {
    setVersion();
    await loadSettings();
    addListeners();
    const storedRules = await getRules();
    if (isEmpty(storedRules)) {
        return showEmptyBlock();
    }
    await renderRules();
}

async function renderRules() {
    removeRules();

    const listEL = document.getElementById(ELEMENTS.RULES_LIST);
    const rules = await getRules();
    Object.entries(rules).forEach(async function([key, value]) {
        listEL.appendChild(await makeRule(key, value));
    });
    showElement(listEL);
}

function removeRules() {
    const rulesListEl = document.getElementById(ELEMENTS.RULES_LIST);
    const rules = toArray(rulesListEl.children).filter(el => el.getAttribute('role') !== ADD_RULE_ROLE);
    rules.forEach(n => n.remove());
}

// At this point i pretty much DO need some kind of way to deal with UI
// But for this demo i will not use any library
async function makeRule(key, value) {
    // containers
    var ruleContainer = document.createElement("div");
    var ruleHeader = document.createElement("div");
    ruleHeader.classList.add("rule-header");
    var ruleQueryNode = document.createElement("div");
    ruleQueryNode.classList.add("rule-content");
    var ruleUrlNode = document.createElement("div");
    ruleUrlNode.classList.add("rule-content");
    // delete icon
    var deleteIcon = document.createElement("img");
    deleteIcon.src = "/images/delete.png";
    deleteIcon.addEventListener('click', () => removeRule(key));

    const fulfilledAt = await getFulfilledAt(key);
    const isFulfilled = Boolean(fulfilledAt);
    if (isFulfilled) {
        ruleHeader.classList.add("rule-header--fulfilled");
    }
    const headerText = isFulfilled ? `Fulfiulled at: ${fulfilledAt}` : 'Not fulfilled';
    ruleHeader.appendChild(document.createTextNode(headerText));
    ruleHeader.appendChild(deleteIcon);
    ruleQueryNode.appendChild(document.createTextNode(`Query: ${key}`));
    ruleUrlNode.appendChild(document.createTextNode(`URL: ${value}`));

    ruleContainer.appendChild(ruleHeader);
    ruleContainer.appendChild(ruleQueryNode);
    ruleContainer.appendChild(ruleUrlNode);
    return ruleContainer;
}

function setVersion() {
    const appVersionEl = document.getElementById(ELEMENTS.APP_VERSION);
    setElementText(appVersionEl, manifestData.version);
}

function showEmptyBlock() {
    const emptyBlockEl = document.getElementById(ELEMENTS.EMPTY_BLOCK);
    showElement(emptyBlockEl);
}

/**
 * Basically handles the update of rules component.
 * This is obviously not an efficient way to update DOM
 * since i feel the need for some kind of UI lib already,
 * i will ont be inventing bicycles for now.
 */
chrome.storage.onChanged.addListener((changes) => {
    const shouldRerender = Object.keys(changes).reduce(
        (res, key) => res || [RULES_STORAGE_KEY, FULFILLED_STORAGE_KEY].includes(key),
        false
    );
    if (shouldRerender) {
        renderRules();
    }
});

initPopup();