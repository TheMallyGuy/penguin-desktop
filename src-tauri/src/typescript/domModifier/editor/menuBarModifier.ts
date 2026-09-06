
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


    new MutationObserver(() => removeTarget())
        .observe(document.body, { childList: true, subtree: true });
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

    new MutationObserver(() => removeTarget())
        .observe(document.body, { childList: true, subtree: true });
}

export function modifyCallbackUploadButton(newCallback: () => void): void {
    if ((window as any).__uploadHandlerAttached) return;
    (window as any).__uploadHandlerAttached = true;


    document.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        if (!target?.closest('.share-button_share-button_36Wbh')) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        newCallback();
    }, true);
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