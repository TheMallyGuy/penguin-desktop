// listen for desktop app settings when changed

import { disconnectRpc, startRpc } from "./discordRpc";

interface RpcToggleEvent extends CustomEvent {
    detail: {
        enabled: boolean;
    };
}

export function registerListener() {
    window.addEventListener('penguin:rpc-toggle', async (event: Event) => {
        const customEvent = event as RpcToggleEvent;
        const isRpcEnabled = customEvent.detail.enabled;

        if (isRpcEnabled) {
            await startRpc()
        } else {
            await disconnectRpc()
        }
    });
}