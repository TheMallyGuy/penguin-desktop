import { check } from "@tauri-apps/plugin-updater";
import { showInfoModal } from "./showInfoModal.ts"
import { platform } from '@tauri-apps/plugin-os';
import { relaunch } from '@tauri-apps/plugin-process';

export async function checkForUpdates() {
    const update = await check();
    if (update) {
        console.log(
            `found update ${update.version} from ${update.date} with notes ${update.body}`
        );

        // alternatively we could also call update.download() and update.install() separately
        await update.download();
        console.log("downloaded update")
        if (platform() == "windows") {
            const res = await showInfoModal({
                title: "Updater",
                message: "PenguinDesktop kindly ask you to update the app, would you like to update later or update now?",
                buttons: [{ label: "Sure thing", action: "upd" }, { label: "I'll pass", action: "pass" }]
            })

            if (res === "upd") {
                update.install()
            }
        } else {
            const res = await showInfoModal({
                title: "Updater",
                message: "PenguinDesktop kindly ask you to relaunch the app to update, would you like to relaunch later or relaunch now?",
                buttons: [{ label: "Sure thing", action: "upd" }, { label: "I'll pass", action: "pass" }]
            })

            if (res === "upd") {
                await relaunch()
            }
        }

    }
}