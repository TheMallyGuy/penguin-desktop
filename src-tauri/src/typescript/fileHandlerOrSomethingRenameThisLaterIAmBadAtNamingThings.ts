import { listen } from '@tauri-apps/api/event';
import { waitForReduxStore } from './helpers/getReactStore';
import { invoke } from '@tauri-apps/api/core';

// ation types matching project-state-reducer
const START_LOADING_VM_FILE_UPLOAD = 'scratch-gui/project-state/START_LOADING_VM_FILE_UPLOAD';
const DONE_LOADING_VM_WITHOUT_ID = 'scratch-gui/project-state/DONE_LOADING_VM_WITHOUT_ID';
const RETURN_TO_SHOWING = 'scratch-gui/project-state/RETURN_TO_SHOWING';

// action types matching modals-reducer
const OPEN_MODAL = 'scratch-gui/modals/OPEN_MODAL';
const CLOSE_MODAL = 'scratch-gui/modals/CLOSE_MODAL';

export function registerPmp() {
    listen("file-open-pmp", async (payload) => {
        const store = await waitForReduxStore();

        store.dispatch({ type: START_LOADING_VM_FILE_UPLOAD });

        store.dispatch({ type: OPEN_MODAL, modal: 'loadingProject' });

        let loadingSuccess = false;
        try {
            const bytes: number[] = await invoke("read_file", { file: payload.payload });
            const array = new Uint8Array(bytes);
            const buffer = array.buffer;
            await store.getState().scratchGui.vm.loadProject(buffer);
            loadingSuccess = true;
        } catch (e) {
            console.error('Failed to load project from file:', e);
        }

        store.dispatch({
            type: loadingSuccess ? DONE_LOADING_VM_WITHOUT_ID : RETURN_TO_SHOWING
        });
        store.dispatch({ type: CLOSE_MODAL, modal: 'loadingProject' });
    });
}