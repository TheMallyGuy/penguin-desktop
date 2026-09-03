export function createPrimaryButton(label: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';

    button.style.cssText = `
    margin: 0.5rem 0;
    padding: 0.8rem 1.2rem;
    font-weight: 600;
    font-size: 1rem;
    border: 0px;
    border-radius: 4px;
    outline-width: 2px;
    outline-style: solid;
    outline-color: rgba(0, 195, 255, 0.35);
    color: white;
    background-color: #00c3ff;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    box-sizing: border-box;
    transition: background-color 0.15s ease;
  `;

    button.addEventListener('focus', () => {
        button.style.outlineWidth = '4px';
    });
    button.addEventListener('blur', () => {
        button.style.outlineWidth = '2px';
    });

    button.innerHTML = `<span>${label}</span>`;
    button.addEventListener('click', onClick);

    return button;
}
