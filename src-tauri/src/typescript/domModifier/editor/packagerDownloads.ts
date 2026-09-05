import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

export function interceptPackagerDownloads() {
    document.addEventListener('click', async (event) => {
        const target = event.target as HTMLElement | null;
        const link = target?.closest('a[download]') as HTMLAnchorElement | null;
        if (!link || !link.href.startsWith('blob:')) return;

        event.preventDefault();

        const suggestedName = link.download || 'download';

        try {
            const response = await fetch(link.href);
            const buffer = await response.arrayBuffer();

            const path = await save({ defaultPath: suggestedName });
            if (!path) return;

            await invoke('write_file', {
                file: path,
                contents: Array.from(new Uint8Array(buffer)),
            });
        } catch (e) {
            console.error('Failed to save packager download:', e);
        }
    }, true);
}
