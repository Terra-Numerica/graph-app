let startTime = null;
let timerInterval = null;

// === Ajout de boutons dynamiques ===
const dynamicButtons = document.querySelector('#dynamic-buttons');

/**
 * @description Ajoute un bouton dynamique.
 * @param {string} text Texte du bouton.
 * @param {string} id Identifiant du bouton.
 * @param {Function} onClick Fonction à exécuter lors du clic.
*/
export const addDynamicButton = (text, id, onClick) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.id = id;
    button.addEventListener('click', onClick);
    dynamicButtons.appendChild(button);
};

/**
 * @description Efface tous les boutons dynamiques.
*/
export const clearDynamicButtons = () => {
    dynamicButtons.innerHTML = '';
};

/**
 * @description Crée un sommet avec une position aléatoire.
 * @param {cytoscape.Core} cy Instance de cytoscape.
*/
export const createRandomNode = (cy) => {
    const id = `n${cy.nodes().length + 1}`;
    cy.add({
        group: 'nodes',
        data: { id },
        position: { x: 200 + Math.random() * 300, y: 200 + Math.random() * 300 },
    });
};

/**
 * @description Met en surbrillance un sommet.
 * @param {cytoscape.NodeSingular} node Instance d'un sommet.
*/
export const highlightNode = (node) => {
    node.style('border-color', '#FFD700');
    node.style('border-width', '3px');
}

/**
 * @description Réinitialise la surbrillance d'un sommet.
 * @param {cytoscape.NodeSingular} node Instance d'un sommet.
*/
export const resetHighlight = (node) => {
    node.style('border-color', '#666');
    node.style('border-width', '1px');
}

/**
 * @description Remplit le selecteur de graphes avec les graphes disponibles.
*/
export const populateGraphSelect = async () => {
    const selectElement = document.getElementById('predefined-graph-select');
    selectElement.innerHTML = '<option value="" disabled selected>Veuillez sélectionner un graphe</option>';

    try {
        const response = await fetch('/api/graph');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des graphes.');
        }

        const graphs = await response.json();

        const groupedGraphs = {
            'Très facile': [],
            'Facile': [],
            'Moyen': [],
            'Difficile': [],
            'Extrême': []
        };

        graphs.forEach(graph => {
            if (groupedGraphs[graph.difficulty]) {
                groupedGraphs[graph.difficulty].push(graph);
            } else if (graph.difficulty === 'Impossible-preuve-facile') {
                groupedGraphs['Moyen'].push(graph);
            } else if (graph.difficulty === 'Impossible-preuve-difficile') {
                groupedGraphs['Extrême'].push(graph);
            }
        });

        Object.keys(groupedGraphs).forEach(difficulty => {
            if (groupedGraphs[difficulty].length > 0) {

                const separator = document.createElement('optgroup');
                separator.label = difficulty;
                selectElement.appendChild(separator);

                groupedGraphs[difficulty].forEach(graph => {
                    const option = document.createElement('option');
                    option.value = graph._id;
                    option.textContent = graph.name || `Graphe ${graph._id}`;
                    separator.appendChild(option);
                });
            }
        });

    } catch (error) {
        console.error(`Erreur : ${error.message}`);
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: "Impossible de charger les graphes. Veuillez réessayer.",
        });
    }
};

export const startTimer = () => {
    const timerElement = document.querySelector('#timer');

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    timerElement.textContent = '00:00';
    
    startTime = Date.now();
    
    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

export const stopTimer = () => {
    const timerElement = document.querySelector('#timer');
    timerElement.textContent = '00:00';
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    const elapsedTime = Date.now() - startTime;
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}