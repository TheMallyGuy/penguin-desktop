// modify the editor

import { waitForReduxStore } from "./helpers/getReactStore"

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

export function modifyEditor() {
    modifyCallbackUploadButton(async () => {
        alert("Unfortunately, we cannot auto upload to the penguinmod upload site. Therefore, please save your project and upload manually to the site.")
        const store = await waitForReduxStore();
        const state = store.getState();

        window.open(`https://penguinmod.com/upload?name=${encodeURIComponent(state.scratchGui.projectTitle)}`);
    });
    removeBackToHome();
    removeSeeProjectPage();
}
