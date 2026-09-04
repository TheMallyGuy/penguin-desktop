import { load, type Store } from "@tauri-apps/plugin-store";

let storePromise: Promise<Store> | null = null;

function getStore(): Promise<Store> {
    if (!storePromise) {
        storePromise = load("appConfig.json");
    }
    return storePromise;
}

export async function setDiscordRpc(value: boolean) {
    const store = await getStore();
    await store.set("rpc", value)
}

export async function getDiscordRpc(): Promise<boolean> {
    const store = await getStore();
    const enabled = await store.get<boolean>("rpc")
    if (enabled === undefined) {
        return true
    }
    return enabled
}


export async function setTwConfigInStore(value: unknown) {
    const store = await getStore();
    await store.set("twConfigAddons", value)
}

export async function getAddonsConfigTwConfigInStore() {
    const store = await getStore();
    return await store.get("twConfigAddons")
}