
declare global {
    interface Window {
        ReduxStore?: any;
    }
}

export function getReduxStore() {
    return window.ReduxStore ?? null;
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
