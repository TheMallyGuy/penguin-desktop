import { getAddonsConfigTwConfigInStore, setTwConfigInStore } from "../storeManager";

export function getAddonsConfig() {
    const raw = localStorage.getItem("tw:addons")
    if (raw) {
        return JSON.parse(raw)
    }
}

export async function getEditorAddonsConfig() {
    const twCfg = await getAddonsConfigTwConfigInStore()

    if (twCfg) {
        localStorage.setItem("tw:addons", JSON.stringify(twCfg))
    } else {
        console.log("theres no addons config saved to device")
    }
}

async function autoSave(): Promise<void> {
    const cfg = getAddonsConfig()
    setTwConfigInStore(cfg)

    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("saved tw config")
}

export async function startAutoSavingTwAddons(): Promise<void> {
    while (true) {
        try {
            await autoSave();
        } catch (error) {
            console.error("task failed:", error);
        }

        await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000)); // 5 min
    }
}

