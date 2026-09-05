import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { createPrimaryButton } from "../../helpers/buttonCreator";

export function addDesktopSettings(
    onDiscordRpcChange?: (enabled: boolean) => void
) {
    const MODAL_BODY_SELECTOR = '[class*="settings-modal_body"]';
    const CONTAINER_CLASS = 'injd_desktop_sel';
    const STORAGE_KEY = 'penguin_discord_rpc';

    function injectDesktopSettings(modalBody: HTMLDivElement): void {
        if (modalBody.querySelector(`.${CONTAINER_CLASS}`)) return;

        const container = document.createElement('div');
        container.className = CONTAINER_CLASS;
        container.style.width = '100%';

        // Header Section
        const headerDiv = document.createElement('div');
        headerDiv.className = 'settings-modal_header_112iQ';

        const titleSpan = document.createElement('span');
        titleSpan.textContent = 'PenguinDesktop Settings';

        const divider = document.createElement('div');
        divider.className = 'settings-modal_divider_3K8K_';

        headerDiv.append(titleSpan, divider);

        //Button Section
        const primaryButton = createPrimaryButton('about', () => {
            const WINDOW_LABEL = 'desktop-settings';

            WebviewWindow.getByLabel(WINDOW_LABEL)
                .then(async (existingWindow) => {
                    if (existingWindow) {
                        await existingWindow.unminimize();
                        await existingWindow.setFocus();
                    } else {
                        const newWebview = new WebviewWindow(WINDOW_LABEL, {
                            url: '/desktop.html',
                            title: 'About',
                            width: 1052,
                            height: 272,
                            resizable: true,
                        });

                        newWebview.once('tauri://error', (err) => {
                            console.error('Failed to create window:', err);
                        });
                    }
                })
                .catch(console.error);
        });

        // Checkbox
        const settingRow = document.createElement('div');
        settingRow.className = 'settings-modal_setting_3KFrK';

        const labelWrapper = document.createElement('div');
        labelWrapper.className = 'settings-modal_label_21R3L';

        const label = document.createElement('label');
        label.className = 'settings-modal_label_21R3L';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'settings-modal_checkbox_3KZcV checkbox_checkbox_1UwGU';

        const savedState = localStorage.getItem(STORAGE_KEY) === 'true';
        checkbox.checked = savedState;

        checkbox.addEventListener('change', (e: Event) => {
            const target = e.target as HTMLInputElement;
            localStorage.setItem(STORAGE_KEY, String(target.checked));

            if (onDiscordRpcChange) {
                onDiscordRpcChange(target.checked);
            }

            window.dispatchEvent(
                new CustomEvent('penguin:rpc-toggle', {
                    detail: { enabled: target.checked }
                })
            );
        });

        const labelText = document.createElement('span');
        labelText.textContent = 'Enable Discord RPC';

        label.append(checkbox, labelText);
        labelWrapper.appendChild(label);
        settingRow.appendChild(labelWrapper);

        container.append(headerDiv, primaryButton, settingRow);

        modalBody.prepend(container);
    }

    function startObserver(): void {
        const existingModal = document.querySelector<HTMLDivElement>(MODAL_BODY_SELECTOR);
        if (existingModal) injectDesktopSettings(existingModal);

        const observer = new MutationObserver(() => {
            const modalBody = document.querySelector<HTMLDivElement>(MODAL_BODY_SELECTOR);
            if (modalBody) injectDesktopSettings(modalBody);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    startObserver();
}