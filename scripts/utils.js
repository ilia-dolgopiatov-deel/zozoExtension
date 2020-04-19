const hasOwnProperty = Object.prototype.hasOwnProperty;
const HIDDEN_CLASS = "hidden";

export const isEmpty = (value) => {
    if (value === undefined || value === null) {
        return true;
    }
    if (hasOwnProperty.call(value, 'length') || hasOwnProperty.call(value, 'size')) {
        return value.length === 0 || value.size === 0;
    }
    for (const key in value) {
        if (hasOwnProperty.call(value, key)) {
            return false;
        }
    }
    return true;
}

export const toArray = arrayLike => Array.prototype.slice.call(arrayLike);

export const hasClass = (element, value) => element && element.classList.contains(value);
export const showElement = (element) => element && element.classList.remove(HIDDEN_CLASS);
export const hideElement = (element) => element && element.classList.add(HIDDEN_CLASS);
export const toggleElement = (element) => hasClass(element, HIDDEN_CLASS) ? showElement(element) : hideElement(element);
export const setElementText = (element, value) => element && (element.textContent = value);