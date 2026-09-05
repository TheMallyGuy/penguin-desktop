// modify the editor

import { waitForReduxStore } from "../helpers/getReactStore";
import { getDiscordRpc, setDiscordRpc } from "../storeManager";
import { modifyCallbackUploadButton, removeBackToHome, removeSeeProjectPage } from "./editor/menuBarModifier";
import { alertOverwrite } from "./editor/overwriteMethods";
import { addDesktopSettings } from "./editor/settings"

export async function modifyEditor() {
    localStorage.setItem("penguin_discord_rpc", String(await getDiscordRpc()))
    modifyCallbackUploadButton(async () => {
        await alert("Unfortunately, we cannot auto upload to the penguinmod upload site. Therefore, please save your project and upload manually to the site.")
        const store = await waitForReduxStore();
        const state = store.getState();

        window.open(`https://penguinmod.com/upload?name=${encodeURIComponent(state.scratchGui.projectTitle)}`);
    });
    addDesktopSettings(async (checkbox: boolean) => {
        await setDiscordRpc(checkbox)
    });
    removeBackToHome();
    removeSeeProjectPage();
    alertOverwrite();
}

export { setupNativeClosePrompt } from "./editor/nativeClose";
