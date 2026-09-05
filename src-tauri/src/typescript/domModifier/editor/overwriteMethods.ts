import { confirm } from "@tauri-apps/plugin-dialog";

export function alertOverwrite(): void {
    (window as any).alert = function (message?: any): Promise<boolean> {
        return new Promise((resolve) => {
            const userChoice = confirm(message);
            resolve(userChoice);
        });
    };
}