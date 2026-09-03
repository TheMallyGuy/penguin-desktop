import { load, type Store } from "@tauri-apps/plugin-store";

let storePromise: Promise<Store> | null = null;

function getStore(): Promise<Store> {
    if (!storePromise) {
        storePromise = load("appConfig.json");
    }
    return storePromise;
}

export async function setTwConfigInStore(value: unknown) {
    const store = await getStore();
    await store.set("twConfigAddons", value)
}

export async function getAddonsConfigTwConfigInStore() {
    const store = await getStore();
    return await store.get("twConfigAddons")
}