import { clearActivity, destroy, setActivity, start, Timestamps } from "tauri-plugin-drpc";
import { Activity } from "tauri-plugin-drpc"
import { waitForReduxStore } from "./helpers/getReactStore";
import { getDiscordRpc } from "./storeManager";

const w = window as any;
if (w.__penguinRpcState === undefined) {
    w.__penguinRpcState = { connected: false, starting: false };
}
const rpcState = w.__penguinRpcState;

export async function startRpc() {
    if (rpcState.connected || rpcState.starting) return;
    if (!await getDiscordRpc()) return;
    rpcState.starting = true;

    try {
        const store = await waitForReduxStore()
        let lastTitle = store.getState().scratchGui.projectTitle

        await start("1545311566717648947")

        const activity = new Activity()
            .setState(`In ${lastTitle}`)
            .setTimestamps(new Timestamps(Date.now()));

        await setActivity(activity);

        rpcState.connected = true;

        store.subscribe(async () => {
            if (!rpcState.connected) return;
            const title = store.getState().scratchGui.projectTitle
            if (title !== lastTitle) {
                lastTitle = title
                const updatedActivity = new Activity()
                    .setState(`In ${lastTitle}`)
                    .setTimestamps(new Timestamps(Date.now()));

                await setActivity(updatedActivity);
            }
        })
    } catch (e) {
        console.error("Failed to start Discord RPC:", e);
        rpcState.connected = false;
    } finally {
        rpcState.starting = false;
    }
}

export async function disconnectRpc() {
    if (!rpcState.connected) return;
    rpcState.connected = false;
    try {
        await clearActivity();
    } catch (e) {
        console.error("Failed to clear Discord RPC activity:", e);
    }
    try {
        await destroy();
    } catch (e) {
        console.error("Failed to destroy Discord RPC thread:", e);
    }
}