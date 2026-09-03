// modify the editor

import { getCurrentWindow } from "@tauri-apps/api/window";
import { ask } from "@tauri-apps/plugin-dialog";
import { getReduxStore, waitForReduxStore } from "./helpers/getReactStore"

export function removeSeeProjectPage(): void {
    const removeTarget = () => {
        const items = document.querySelectorAll<HTMLDivElement>('.menu-bar_menu-bar-item_264qQ');

        items.forEach((item) => {
            if (item.textContent?.includes('See Project Page')) {
                item.remove();
            }
        });
    };

    removeTarget();

    const menuBar = document.querySelector('.menu-bar_menu-bar_1gLUp');

    if (menuBar) {
        const observer = new MutationObserver(() => {
            removeTarget();
        });

        observer.observe(menuBar, {
            childList: true,
            subtree: true,
        });
    }
}

export function removeBackToHome(): void {
    const removeTarget = () => {
        const homeLink = document.querySelector<HTMLAnchorElement>('.menu-bar_feedback-link_2Op70');

        if (homeLink) {
            const parentItem = homeLink.closest<HTMLDivElement>('.menu-bar_menu-bar-item_264qQ');
            parentItem?.remove();
        }
    };

    removeTarget();

    const menuBar = document.querySelector('.menu-bar_menu-bar_1gLUp');

    if (menuBar) {
        const observer = new MutationObserver(() => {
            removeTarget();
        });

        observer.observe(menuBar, {
            childList: true,
            subtree: true,
        });
    }
}

export function modifyCallbackUploadButton(newCallback: () => void): void {
    const attachCustomHandler = () => {
        const homeLink = document.querySelector<HTMLAnchorElement>('.share-button_share-button_36Wbh');

        if (homeLink && !homeLink.dataset.customHandlerAttached) {
            homeLink.dataset.customHandlerAttached = 'true';

            homeLink.addEventListener('click', (event: MouseEvent) => {
                event.preventDefault();

                event.stopImmediatePropagation();

                newCallback();
            }, true);
        }
    };

    attachCustomHandler();

    const menuBar = document.querySelector('.menu-bar_menu-bar_1gLUp');
    if (menuBar) {
        const observer = new MutationObserver(() => attachCustomHandler());
        observer.observe(menuBar, { childList: true, subtree: true });
    }
}



export function alertOverwrite() {
    window.alert = function (message?: any): void {

    };
}

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

export function modifyEditor() {
    modifyCallbackUploadButton(async () => {
        alert("Unfortunately, we cannot auto upload to the penguinmod upload site. Therefore, please save your project and upload manually to the site.")
        const store = await waitForReduxStore();
        const state = store.getState();

        window.open(`https://penguinmod.com/upload?name=${encodeURIComponent(state.scratchGui.projectTitle)}`);
    });
    removeBackToHome();
    removeSeeProjectPage();
    alertOverwrite();
}
