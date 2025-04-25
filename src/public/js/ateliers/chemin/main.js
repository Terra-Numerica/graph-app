import { MODE_INFO_TEXTS, DOM_ELEMENTS } from './constants.js';
import { clearDynamicButtons } from '../../functions.js';

import { initDijkstraMode } from './dijkstra.js';
import { initBellmanMode } from './bellman.js';
import { initFloydMode } from './floyd.js';

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
            case 'Dijkstra':
                infoText.innerHTML = MODE_INFO_TEXTS.Dijkstra;
                break;
            case 'Bellman-Ford':
                infoText.innerHTML = MODE_INFO_TEXTS.BellmanFord;
                break;
            case 'Floyd-Warshall':
                infoText.innerHTML = MODE_INFO_TEXTS.FloydWarshall;
                break;
            default:
                infoText.innerHTML = '';
                break;
        }
    };

    const cyContainer = document.querySelector('#cy-predefined');

    DOM_ELEMENTS.modeDijkstraBtn.addEventListener('click', () => {
        graphSection.style.display = 'block';
        modeTitle.textContent = 'Algorithme de Dijkstra';
        clearDynamicButtons();
        selectElement.style.display = 'block';
        cyContainer.innerHTML = '';
        initDijkstraMode();
        displayModeInfo('Dijkstra');
    });

    DOM_ELEMENTS.modeBellmanBtn.addEventListener('click', () => {
        graphSection.style.display = 'block';
        modeTitle.textContent = 'Algorithme de Bellman-Ford';
        clearDynamicButtons();
        selectElement.style.display = 'block';
        cyContainer.innerHTML = '';
        initBellmanMode();
        displayModeInfo('Bellman-Ford');
    });

    DOM_ELEMENTS.modeFloydBtn.addEventListener('click', () => {
        graphSection.style.display = 'block';
        modeTitle.textContent = 'Algorithme de Floyd-Warshall';
        clearDynamicButtons();
        selectElement.style.display = 'block';
        cyContainer.innerHTML = '';
        initFloydMode();
        displayModeInfo('Floyd-Warshall');
    });
}); 