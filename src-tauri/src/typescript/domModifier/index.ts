// modify the editor

import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getReduxStore } from "../helpers/getReactStore";
import { getDiscordRpc, setDiscordRpc } from "../storeManager";
import { modifyCallbackPackageButton, modifyCallbackUploadButton, removeBackToHome, removeSeeProjectPage } from "./editor/menuBarModifier";
import { alertOverwrite } from "./editor/overwriteMethods";
import { addDesktopSettings } from "./editor/settings"
import { interceptPackagerDownloads } from "./editor/packagerDownloads";
import { emit, emitTo, listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { blobToDataURL } from "../helpers/blob";

export async function modifyEditor() {
    if (!window.location.href.toString().includes("packager")) {
        localStorage.setItem("penguin_discord_rpc", String(await getDiscordRpc()))

        modifyCallbackPackageButton(async () => {
            const WINDOW_LABEL = 'packager-win';
            const handoffProject = async () => {
                const state = getReduxStore().getState();
                const blob: Blob = await state.scratchGui.vm.saveProjectSb3();
                const bytes = Array.from(new Uint8Array(await blob.arrayBuffer()));

                await emitTo(WINDOW_LABEL, "file://handoff", bytes);
            };

            WebviewWindow.getByLabel(WINDOW_LABEL)
                .then(async (existingWindow) => {
                    if (existingWindow) {
                        await existingWindow.unminimize();
                        await existingWindow.setFocus();
                        await handoffProject();
                        return;
                    }

                    const unlistenReady = await listen(`${WINDOW_LABEL}://ready`, async () => { // handle the ready
                        unlistenReady();
                        await handoffProject();
                    });

                    const packagerWindow = new WebviewWindow(WINDOW_LABEL, {
                        url: 'packager/index.html',
                        title: 'Packager',
                        width: 800,
                        height: 600,
                    });

                    packagerWindow.once('tauri://error', (e) => {
                        console.error('packager window failed to create', e);
                    });
                })
                .catch(console.error);
        });

        modifyCallbackUploadButton(async () => {
            try {
                const state = getReduxStore().getState();
                const vm = state.scratchGui.vm;
                const projectDataUrl = await blobToDataURL(await vm.saveProjectSb3());

                const thumbnailDataUrl = await new Promise<string>((resolve) => {
                    vm.postIOData('video', { forceTransparentPreview: true });
                    vm.renderer.requestSnapshot((dataURI: string) => {
                        vm.postIOData('video', { forceTransparentPreview: false });
                        resolve(dataURI);
                    });
                    vm.renderer.draw();
                });

                await invoke("open_pm_upload", {
                    title: state.scratchGui.projectTitle ?? "",
                    projectDataUrl,
                    thumbnailDataUrl,
                });
            } catch (err) {
                console.error("failed to open upload page:", err);
                await alert("Couldn't open the PenguinMod upload page. Please save your project and upload manually to the site.");
            }
        });
        addDesktopSettings(async (checkbox: boolean) => {
            await setDiscordRpc(checkbox)
        });
        removeBackToHome();
        removeSeeProjectPage();
    } else {
        interceptPackagerDownloads();

        await listen<number[]>("file://handoff", (p) => {
            const bytes = new Uint8Array(p.payload);

            const resolveImport = (window as any).__pmImportResolve;
            if (typeof resolveImport !== 'function') {
                console.warn('packager import hook not ready yet, dropping handoff payload');
                return;
            }

            resolveImport({ data: bytes.buffer, name: 'project.sb3' });
        })

        if (typeof (window as any).__pmImportResolve !== 'function') {
            await new Promise<void>((resolve) => {
                window.addEventListener("packager-importer-ready", () => resolve(), { once: true });
            });
        }

        await emit("packager-win://ready") // we emit that we're ready
    }

    // default methods must inject
    alertOverwrite();
}

export { setupNativeClosePrompt } from "./editor/nativeClose";
