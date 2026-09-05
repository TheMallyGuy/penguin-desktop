import { getCurrentWindow } from "@tauri-apps/api/window";
import { getReduxStore, waitForReduxStore } from "../../helpers/getReactStore";
import { ask } from "@tauri-apps/plugin-dialog";

export function setupNativeClosePrompt(): void {
    try {
        Object.defineProperty(window, "onbeforeunload", {
            configurable: true,
            get: () => null,
            set: () => { },
        });
    } catch {
        // ignore
    }

    const win = (window as any);
    if (win.__nativeClosePromptInstalled) return;
    win.__nativeClosePromptInstalled = true;

    const appWindow = getCurrentWindow();
    if (appWindow.label !== "main") return;


    waitForReduxStore().catch(() => { });


    async function hasUnsavedChanges(): Promise<boolean> {

        let store = getReduxStore();
        if (!store) {
            try {
                store = await waitForReduxStore(2500);
            } catch {
                return false;
            }
        }
        try {
            return Boolean(store?.getState()?.scratchGui?.projectChanged);
        } catch {
            return false;
        }
    }

    let allowClose = false;

    appWindow.onCloseRequested(async (event) => {
        if (allowClose) return;

        const projectChanged = await hasUnsavedChanges();

        if (!projectChanged) return;

        event.preventDefault();

        const confirmed = await ask(
            "You have unsaved changes in your project. Close anyway?",
            {
                title: "Unsaved changes",
                kind: "warning",
                okLabel: "Close",
                cancelLabel: "Cancel",
            }
        );

        if (confirmed) {
            allowClose = true;
            await appWindow.destroy();
        }
    });
}
