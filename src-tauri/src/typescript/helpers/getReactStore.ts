
let cachedStore: any = null;

export function getReduxStore() {
    if (cachedStore) return cachedStore;

    const selectors = [
        '[class*="gui_gui"]',
        '[class*="gui_"]',
        '[class*="menu-bar"]',
        '#app',
        '#root',
        'div',
    ];

    for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (!el) continue;

        const keys = Object.keys(el);
        const fiberKey = keys.find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
        if (!fiberKey) continue;

        let fiber = (el as any)[fiberKey];
        let depth = 0;
        while (fiber && depth < 100) {
            if (fiber.memoizedProps?.store) {
                cachedStore = fiber.memoizedProps.store;
                return cachedStore;
            }
            if (fiber.stateNode?.store) {
                cachedStore = fiber.stateNode.store;
                return cachedStore;
            }
            fiber = fiber.return;
            depth++;
        }
    }
    return null;
}

export function waitForReduxStore(timeoutMs = 10000): Promise<any> {
    const existing = getReduxStore();
    if (existing) return Promise.resolve(existing);

    return new Promise((resolve, reject) => {
        const start = Date.now();
        const interval = setInterval(() => {
            const store = getReduxStore();
            if (store) {
                clearInterval(interval);
                resolve(store);
            } else if (Date.now() - start > timeoutMs) {
                clearInterval(interval);
                reject(new Error("Timed out waiting for Redux store"));
            }
        }, 200);
    });
}
