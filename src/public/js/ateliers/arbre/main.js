import { initPrimAlgorithm } from './prim.js';
import { initKruskalAlgorithm } from './kruskal.js';
import { initBoruvkaAlgorithm } from './boruvka.js';
import { MODE_INFO_TEXTS, DOM_ELEMENTS } from './constants.js';
import { clearDynamicButtons } from '../../functions.js';
import { clearStepInfo } from './functions.js';

// Store the current algorithm mode for solution modal
let currentAlgorithm = null;

// Helper to show/hide elements
function showElement(el) { if (el) el.style.display = ''; }
function hideElement(el) { if (el) el.style.display = 'none'; }

// Helper: get algorithm description
function getAlgorithmDescription(algo) {
    switch (algo) {
        case 'Prim':
            return "L'algorithme de Prim construit l'arbre couvrant en partant d'un sommet et en ajoutant à chaque fois l'arête de poids minimal qui relie un sommet déjà relié à un sommet non relié.";
        case 'Kruskal':
            return "L'algorithme de Kruskal trie toutes les arêtes par poids croissant et les ajoute une à une à l'arbre couvrant, en évitant de former des cycles.";
        case 'Boruvka':
            return "L'algorithme de Boruvka commence avec chaque sommet comme composante, puis fusionne les composantes en ajoutant à chaque étape l'arête de poids minimal reliant deux composantes distinctes.";
        default:
            return '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const explanationScreen = document.getElementById('explanation-screen');
    const graphSection = document.getElementById('graph-section');
    const tryGraphBtn = document.getElementById('try-graph-btn');
    const showSolutionBtn = document.getElementById('show-solution-btn');
    const modeTitle = document.getElementById('mode-title');
    const selectElement = document.getElementById('graph-select');
    const infoContainer = document.getElementById('info-container');
    const infoBtn = document.getElementById('info-btn');
    const infoSection = document.getElementById('info-section');
    const infoText = document.getElementById('info-text');

    // Algorithm selection/explanation screen (for after 'Voir cette solution')
    let algoChoiceScreen = null;

    // Show explanation screen by default
    showElement(explanationScreen);
    hideElement(graphSection);
    hideElement(showSolutionBtn);

    // When 'Essayer un graphe' is clicked, go directly to Kruskal
    tryGraphBtn.addEventListener('click', () => {
        hideElement(explanationScreen);
        showElement(graphSection);
        showElement(showSolutionBtn);
        clearStepInfo();
        graphSection.style.display = 'block';
        selectElement.style.display = 'block';
        clearDynamicButtons();
        modeTitle.textContent = '';
        initKruskalAlgorithm();
        displayModeInfo('Kruskal');
        currentAlgorithm = 'Kruskal';
    });

    // Info button logic (unchanged)
    infoBtn.addEventListener('click', function () {
        if (infoSection.style.display === 'none' || infoSection.style.display === '') {
            infoSection.style.display = 'block';
            infoBtn.textContent = '❌ Fermer les règles';
        } else {
            infoSection.style.display = 'none';
            infoBtn.textContent = 'ℹ️ Voir les règles';
        }
    });

    function displayModeInfo(mode) {
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
    }

    // Show solution modal when 'Voir la solution' is clicked
    if (showSolutionBtn) {
        showSolutionBtn.addEventListener('click', () => {
            showAlgorithmChoiceScreen();
        });
    }

    // Show the algorithm choice/explanation screen
    function showAlgorithmChoiceScreen() {
        // Hide graph section and solution button
        hideElement(graphSection);
        hideElement(showSolutionBtn);
        // Remove if already present
        if (algoChoiceScreen && algoChoiceScreen.parentNode) {
            algoChoiceScreen.parentNode.removeChild(algoChoiceScreen);
        }
        // Create the screen
        algoChoiceScreen = document.createElement('div');
        algoChoiceScreen.id = 'algo-choice-screen';
        algoChoiceScreen.style.display = 'flex';
        algoChoiceScreen.style.flexDirection = 'column';
        algoChoiceScreen.style.alignItems = 'center';
        algoChoiceScreen.style.marginTop = '40px';
        // Title
        const title = document.createElement('h2');
        title.textContent = 'Choisissez un algorithme pour voir sa solution';
        title.style.marginBottom = '30px';
        algoChoiceScreen.appendChild(title);
        // Buttons + explanations
        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.gap = '30px';
        btnRow.style.marginBottom = '30px';
        // For each algorithm
        ['Prim', 'Kruskal', 'Boruvka'].forEach(algo => {
            const card = document.createElement('div');
            card.style.background = '#fff';
            card.style.borderRadius = '10px';
            card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            card.style.padding = '24px 20px';
            card.style.width = '260px';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.alignItems = 'center';
            // Button
            const btn = document.createElement('button');
            btn.textContent = `Algorithme de ${algo}`;
            btn.className = 'algo-select-btn';
            btn.style.marginBottom = '16px';
            btn.style.width = '100%';
            btn.style.fontSize = '1.1em';
            btn.addEventListener('click', () => showAlgorithmSolution(algo));
            // Description
            const desc = document.createElement('div');
            desc.style.fontSize = '1em';
            desc.style.color = '#333';
            desc.style.textAlign = 'center';
            desc.textContent = getAlgorithmDescription(algo);
            // Append
            card.appendChild(btn);
            card.appendChild(desc);
            btnRow.appendChild(card);
        });
        algoChoiceScreen.appendChild(btnRow);
        // Add to DOM
        document.querySelector('.arbre-couvrant').appendChild(algoChoiceScreen);
    }

    // Show the solution for the selected algorithm
    function showAlgorithmSolution(algo) {
        // Remove the choice screen
        if (algoChoiceScreen && algoChoiceScreen.parentNode) {
            algoChoiceScreen.parentNode.removeChild(algoChoiceScreen);
        }
        // Do NOT reload or reset the graph, just show the two solution buttons
        // Show a modal with the two solution buttons
        Swal.fire({
            title: `Solution selon l'algorithme de ${algo}`,
            html: `\
                <div style='display: flex; flex-direction: column; align-items: center; gap: 20px;'>\
                    <button id='auto-solution-btn' class='swal2-confirm swal2-styled' style='width: 260px;'>Voir la solution (automatiquement)</button>\
                    <button id='manual-solution-btn' class='swal2-confirm swal2-styled' style='width: 260px;'>Voir la solution (manuellement)</button>\
                </div>`,
            showConfirmButton: false,
            showCloseButton: true,
            width: '32%',
            didOpen: () => {
                document.getElementById('auto-solution-btn').addEventListener('click', () => {
                    Swal.close();
                    runSolution(algo, 'auto');
                });
                document.getElementById('manual-solution-btn').addEventListener('click', () => {
                    Swal.close();
                    runSolution(algo, 'manual');
                });
            }
        });
    }

    // Run the solution animation on the current graph
    function runSolution(algo, mode) {
        // Set up the correct algorithm mode (but do NOT reset the graph)
        // Only set the modeTitle and info, do not call init*Algorithm
        switch (algo) {
            case 'Prim':
                modeTitle.textContent = 'Algorithme de Prim';
                displayModeInfo('Prim');
                currentAlgorithm = 'Prim';
                break;
            case 'Kruskal':
                modeTitle.textContent = 'Algorithme de Kruskal';
                displayModeInfo('Kruskal');
                currentAlgorithm = 'Kruskal';
                break;
            case 'Boruvka':
                modeTitle.textContent = 'Algorithme de Boruvka';
                displayModeInfo('Boruvka');
                currentAlgorithm = 'Boruvka';
                break;
        }
        // Find the solution button and trigger the correct mode
        // The solution button is dynamically created by the algorithm modules
        const solutionBtn = document.getElementById('solution-btn');
        if (solutionBtn) {
            // Patch the algorithm modules to support manual/auto mode if needed
            // For now, simulate a click and let the module handle the animation
            // (You can extend this to pass the mode if your modules support it)
            solutionBtn.click();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Impossible de trouver le bouton de solution pour ce mode.'
            });
        }
    }

    // Also update the 'solution-btn' (dynamic) to open the algorithm choice screen
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'solution-btn') {
            showAlgorithmChoiceScreen();
        }
    });
}); 