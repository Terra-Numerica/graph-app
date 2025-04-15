import { initPrimMode } from './prim.js';
import { initKruskalMode } from './kruskal.js';
import { initBoruvkaMode } from './boruvka.js';
import { MODE_INFO_TEXTS, DOM_ELEMENTS } from './constants.js';
import { clearDynamicButtons } from '../../functions.js';

document.addEventListener('DOMContentLoaded', () => {
    const graphSection = document.querySelector('#graph-section');
    const modeTitle = document.querySelector('#mode-title');
    const selectElement = document.querySelector('#graph-select');
    const infoContainer = document.querySelector('#info-container');
    const infoBtn = document.querySelector('#info-btn');
    const infoSection = document.querySelector('#info-section');
    const infoText = document.querySelector('#info-text');

    infoBtn.addEventListener("click", function () {
        if (infoSection.style.display === "none" || infoSection.style.display === "") {
            infoSection.style.display = "block";
            infoBtn.textContent = "❌ Fermer les règles";
        } else {
            infoSection.style.display = "none";
            infoBtn.textContent = "ℹ️ Voir les règles";
        }
    });

    const displayModeInfo = (mode) => {
        infoContainer.style.display = 'block';
        switch (mode) {
            case 'Prim':
                infoText.innerHTML = MODE_INFO_TEXTS.Prim;
                break;
            case 'Kruskal':
                infoText.innerHTML = MODE_INFO_TEXTS.Kruskal;
                break;
            case 'Boruvka':
                infoText.innerHTML = MODE_INFO_TEXTS.Boruvka;
                break;
            default:
                infoText.innerHTML = '';
                break;
        }
    };

    DOM_ELEMENTS.modePrimBtn.addEventListener('click', () => {
        graphSection.style.display = 'block';
        modeTitle.textContent = 'Mode Prim';
        clearDynamicButtons();
        selectElement.style.display = 'block';
        initPrimMode();
        displayModeInfo('Prim');
    });

    DOM_ELEMENTS.modeKruskalBtn.addEventListener('click', () => {
        graphSection.style.display = 'block';
        modeTitle.textContent = 'Mode Kruskal';
        clearDynamicButtons();
        selectElement.style.display = 'block';
        initKruskalMode();
        displayModeInfo('Kruskal');
    });

    DOM_ELEMENTS.modeBoruvkaBtn.addEventListener('click', () => {
        graphSection.style.display = 'block';
        modeTitle.textContent = 'Mode Boruvka';
        clearDynamicButtons();
        selectElement.style.display = 'block';
        initBoruvkaMode();
        displayModeInfo('Boruvka');
    });
}); 