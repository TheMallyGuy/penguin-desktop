export function alertOverwrite(): void {
    (window as any).alert = function (message?: any): Promise<boolean> {
        return new Promise((resolve) => {
            const userChoice = confirm(message);
            resolve(userChoice);
        });
    };
}