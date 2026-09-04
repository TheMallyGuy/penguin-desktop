const CLASS = {
    overlay: "modal_modal-overlay_2_Dgx",
    content: "modal_modal-content_3brCX security-manager-modal_modal-content_33sCQ",
    box: "box_box_tWy-0",
    header: "modal_header_1dNxf",
    headerItem: "modal_header-item_1WbOm",
    headerTitle: "modal_header-item-title_1N2BE",
    headerClose: "modal_header-item-close_4akWi",
    body: "security-manager-modal_body_1jZgz box_box_tWy-0",
    buttons: "security-manager-modal_buttons_3qEck box_box_tWy-0",
    deny: "security-manager-modal_deny-button_dMRqK",
    allow: "security-manager-modal_allow-button_3liNF",
};

const RESPONSE_EVENT = "penguin:info-modal-response";
const OPENED_CLASS = "injd_info_modal_open"; // marks the overlay so we never stack two

export interface InfoModalButton {
    label: string;
    action?: string;
}

export interface InfoModalOptions {
    title?: string;
    message?: string;
    buttons?: InfoModalButton[];
}

function closeIconSvg(): string {
    return `<svg width="16" height="16" viewBox="0 0 16 16" style="display:block">` +
        `<path d="M2 2l12 12M14 2L2 14" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`;
}

function buildElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    text?: string
): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
}

export function showInfoModal(options: InfoModalOptions): Promise<string> {
    return new Promise((resolve) => {
        const title = options.title || "PenguinMod";
        const message = options.message || "";
        const buttons: InfoModalButton[] = Array.isArray(options.buttons) && options.buttons.length > 0
            ? options.buttons
            : [{ label: "OK", action: "ok" }];

        let settled = false;
        const settle = (action: string) => {
            if (settled) return;
            settled = true;
            window.dispatchEvent(new CustomEvent(RESPONSE_EVENT, {
                detail: { action },
            }));
            cleanup();
            resolve(action);
        };

        const cleanup = () => {
            overlay.remove();
            document.removeEventListener("keydown", onKeyDown);
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") settle("close");
        };

        // Overlay
        const overlay = buildElement("div", CLASS.overlay);
        overlay.classList.add(OPENED_CLASS);
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";

        // Content
        const content = buildElement("div", CLASS.content);
        content.setAttribute("role", "dialog");
        content.setAttribute("aria-label", title);
        content.style.margin = "0 auto";

        // Inner flex column 
        const box = buildElement("div", CLASS.box);
        box.setAttribute("dir", "ltr");
        box.style.flexDirection = "column";
        box.style.flexGrow = "1";
        box.style.display = "flex";

        // Header
        const header = buildElement("div", CLASS.header);
        const titleItem = buildElement("div", `${CLASS.headerItem} ${CLASS.headerTitle}`, title);
        const closeItem = buildElement("div", `${CLASS.headerItem} ${CLASS.headerClose}`);

        const closeButton = buildElement("button");
        closeButton.type = "button";
        closeButton.className = "close-button_close-button_t5jqt close-button_large_2cCrv";
        closeButton.setAttribute("aria-label", "Close");
        closeButton.innerHTML = closeIconSvg();
        closeButton.addEventListener("click", () => settle("close"));

        closeItem.appendChild(closeButton);
        header.append(titleItem, closeItem);

        // Body
        const body = buildElement("div", CLASS.body);
        if (message) {
            const text = buildElement("p", undefined, message);
            text.style.whiteSpace = "pre-wrap";
            text.style.wordBreak = "break-word";
            text.style.margin = "8px 0";
            body.appendChild(text);
        }

        if (buttons.length > 0) {
            const buttonRow = buildElement("div", CLASS.buttons);
            buttonRow.style.flexDirection = "row";
            buttonRow.style.justifyContent = "flex-end";
            buttonRow.style.marginTop = "1rem";

            buttons.forEach((button, index) => {
                const isPrimary = index === buttons.length - 1;
                const btn = buildElement("button", isPrimary ? CLASS.allow : CLASS.deny);
                btn.type = "button";
                btn.textContent = button.label;
                btn.addEventListener("click", () =>
                    settle(typeof button.action === "string" && button.action.length > 0 ? button.action : button.label)
                );
                buttonRow.appendChild(btn);
            });

            body.appendChild(buttonRow);
        }

        box.append(header, body);
        content.appendChild(box);
        overlay.appendChild(content);

        document.addEventListener("keydown", onKeyDown);
        document.body.appendChild(overlay);
    });
}
