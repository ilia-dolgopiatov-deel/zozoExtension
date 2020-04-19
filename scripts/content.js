(async () => {
    const scriptName = location.hostname.includes('google') ? 'google' : 'duckduckgo';
    const src = chrome.extension.getURL(`scripts/${scriptName}.js`);
    const contentScript = await import(src);
    const isAllowed = await contentScript.isOn();
    if (isAllowed) {
        contentScript.doWork();
    }
})();