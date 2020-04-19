import { getRuleFor, setFulfilled, isStrictMatching, getSetting } from './storage.js';
import { toArray } from './utils.js';

const NAME = 'google';

export const isOn = () => getSetting(NAME);

export async function doWork() {
    const currentUrl = new URL(window.location.href);
    const query = currentUrl.searchParams.get('q');
    const isFirstPage = !Number(currentUrl.searchParams.get('start'));
    const ruleUrl = await getRuleFor(query);
    if (ruleUrl && isFirstPage) {
        perform(query, ruleUrl);
    }
}

async function perform(query, ruleUrl) {
    const fulfillingLinks = await getFulfillingLinks(ruleUrl);
    fulfillingLinks.forEach(link => link.addEventListener(
        'click',
        () => setFulfilled(query, NAME)
    ));
}

async function getFulfillingLinks(ruleUrl) {
    const isStrict = await isStrictMatching();
    const url = new URL(ruleUrl);
    const allLinks = toArray(document.querySelectorAll('a'));
    return allLinks.filter(a => (isStrict
        ? a.href === url.toString()
        : a.hostname === url.hostname
    ))
}
