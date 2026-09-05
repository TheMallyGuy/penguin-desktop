
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

type MenuCallback = (e: MouseEvent) => void;

export function menuBarEditItemModifier(onItemClick: MenuCallback): MutationObserver {
    function createMenuItem(text: string, onClick: MenuCallback): HTMLLIElement {
        const newLi = document.createElement('li');
        newLi.className = 'menu_menu-item_3ELPx menu_hoverable_3mGWm custom-addon-item';

        const newSpan = document.createElement('span');
        newSpan.textContent = text;
        newLi.appendChild(newSpan);

        newLi.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            onClick(e);
        });

        return newLi;
    }

    const observer = new MutationObserver(() => {
        const menuItems = document.querySelectorAll<HTMLDivElement>('.menu-bar_menu-bar-item_264qQ');

        menuItems.forEach((menuItem) => {
            const labelSpan = menuItem.querySelector('span');
            const isTargetMenu = labelSpan && labelSpan.textContent?.trim() === 'File';

            if (isTargetMenu) {
                const menuList = menuItem.querySelector<HTMLUListElement>('ul.menu_menu_1rWB9');

                if (menuList && !menuList.querySelector('.custom-addon-item')) {
                    const newItem = createMenuItem('Open Penguinmod packager', onItemClick);
                    menuList.appendChild(newItem);
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    return observer;
}