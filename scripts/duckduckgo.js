import { getRuleFor, setFulfilled, isStrictMatching, getSetting } from './storage.js';
import { toArray } from './utils.js';

console.log('UR ON DUCKDUCKGO ')

const NAME = 'duckduckgo';

export const isOn = () => getSetting(NAME);

export async function doWork() {
    const currentUrl = new URL(window.location.href);
    const query = currentUrl.searchParams.get('q');
    // TODO: no pagination on duckduck go. Can figure out proper logic later
    const isFirstPage = true;
    const ruleUrl = await getRuleFor(query);
    if (ruleUrl && isFirstPage) {
        perform(query, ruleUrl);
        // Duckduck go doesn't give all the content on render
        const resultNode = document.getElementById('links');
        const observer = new MutationObserver(() => perform(query, ruleUrl));
        observer.observe(resultNode, {
            childList: true
        });
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
    const sameHostLinks = toArray(document.querySelectorAll(`.results_links_deep[data-hostname="${url.hostname}"]`));
    if (isStrict) {
        return sameHostLinks.filter(element => {
            const innerLinks = toArray(element.querySelectorAll('a'));
            return innerLinks.reduce(
                (res, a) => res || a.href === url.toString(),
                false
            );
        })
    }
    return sameHostLinks;

}