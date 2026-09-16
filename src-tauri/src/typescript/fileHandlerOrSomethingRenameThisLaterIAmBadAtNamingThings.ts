import { emit, listen } from '@tauri-apps/api/event';
import { waitForReduxStore } from './helpers/getReactStore';
import { invoke } from '@tauri-apps/api/core';

// ation types matching project-state-reducer
const START_LOADING_VM_FILE_UPLOAD = 'scratch-gui/project-state/START_LOADING_VM_FILE_UPLOAD';
const DONE_LOADING_VM_WITHOUT_ID = 'scratch-gui/project-state/DONE_LOADING_VM_WITHOUT_ID';
const RETURN_TO_SHOWING = 'scratch-gui/project-state/RETURN_TO_SHOWING';

// action types matching modals-reducer
const OPEN_MODAL = 'scratch-gui/modals/OPEN_MODAL';
const CLOSE_MODAL = 'scratch-gui/modals/CLOSE_MODAL';

const log = (...args: unknown[]) => console.log('[tauriExt clone]', ...args);

async function loadProjectFromFile(path: string, storeTimeoutMs?: number) {
    log('waiting for redux store...');
    let store: any;
    try {
        store = await waitForReduxStore(storeTimeoutMs);
    } catch (e) {
        console.error('[tauriExt clone] never found redux store:', e);
        return;
    }
    log('found redux store', store);

    if (!store.getState().scratchGui) {
        console.error('[tauriExt clone] store has no scratchGui slice - state shape:', Object.keys(store.getState()));
        return;
    }
    if (!store.getState().scratchGui.vm) {
        console.error('[tauriExt clone] scratchGui slice has no vm yet');
        return;
    }

    store.dispatch({ type: START_LOADING_VM_FILE_UPLOAD });

    store.dispatch({ type: OPEN_MODAL, modal: 'loadingProject' });

    let loadingSuccess = false;
    try {
        log('reading file', path);
        const bytes: number[] = await invoke("read_file", { file: path });
        log('read', bytes.length, 'bytes, loading into vm');
        const array = new Uint8Array(bytes);
        const buffer = array.buffer;
        await store.getState().scratchGui.vm.loadProject(buffer);
        log('loadProject resolved');
        loadingSuccess = true;
    } catch (e) {
        console.error('[tauriExt clone] Failed to load project from file:', e);
    }

    store.dispatch({
        type: loadingSuccess ? DONE_LOADING_VM_WITHOUT_ID : RETURN_TO_SHOWING
    });
    store.dispatch({ type: CLOSE_MODAL, modal: 'loadingProject' });
}

export function registerPmp() {
    log('registerPmp() running at', window.location.href);

    listen("file-open-pmp", async (payload) => {
        await loadProjectFromFile(payload.payload as string);
    });


    const cloneFile = new URLSearchParams(window.location.search).get('cloneProjectFile');
    if (cloneFile) {
        log('cloneProjectFile param found:', cloneFile);

        loadProjectFromFile(cloneFile, 60000);
    } else {
        log('no cloneProjectFile param present');
    }

    emit("editor://ready")
}