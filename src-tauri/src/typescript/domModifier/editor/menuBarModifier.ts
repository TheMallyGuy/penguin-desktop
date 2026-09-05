
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

export function modifyCallbackPackageButton(newCallback: () => void): void {
    if ((window as any).__packageHandlerAttached) return;
    (window as any).__packageHandlerAttached = true;

    const isPackageItem = (el: HTMLElement | null): HTMLElement | null => {
        const li = el?.closest('li.menu_menu-item_3ELPx') as HTMLElement | null;
        const span = li?.querySelector('span');
        return span?.textContent?.trim() === 'Package project' ? li : null;
    };

    document.addEventListener('mousedown', (event) => {
        if (isPackageItem(event.target as HTMLElement)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    }, true);

    document.addEventListener('click', async (event) => {
        const li = isPackageItem(event.target as HTMLElement);
        if (li) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            await newCallback();
        }
    }, true);
}