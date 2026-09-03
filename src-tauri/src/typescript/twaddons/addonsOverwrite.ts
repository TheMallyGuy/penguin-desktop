import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export function setupAddonsOverwrite() {
    const _open = window.open;

    Object.defineProperty(window, 'open', {
        writable: true,
        configurable: true,
        value: function (
            url?: string | URL,
            target?: string,
            features?: string
        ): WindowProxy | null {
            if (!url) return null;
            const urlString = url.toString();

            if (urlString.includes('addons')) {
                const WINDOW_LABEL = 'addons-settings';

                WebviewWindow.getByLabel(WINDOW_LABEL).then(async (existingWindow) => {
                    if (existingWindow) {
                        await existingWindow.unminimize();
                        await existingWindow.setFocus();
                    } else {
                        const newWebview = new WebviewWindow(WINDOW_LABEL, {
                            url: url.toString(),
                            title: 'Addons Settings',
                            width: 800,
                            height: 600,
                            resizable: true,
                        });

                        newWebview.once('tauri://error', (err) => {
                            console.error('Failed to create window:', err);
                        });
                    }
                }).catch(console.error);

                return null;
            }

            // by default, tauri open urls outside but for sure i htink just do this :3
            if (urlString.startsWith("http://") || urlString.startsWith("https://")) {
                invoke("open_external", { url: urlString }).catch(console.error);
                return null;
            }

            const resolved = new URL(urlString, window.location.href).href;
            invoke("open_external", { url: resolved }).catch(console.error);
            return null;
        }
    });
}