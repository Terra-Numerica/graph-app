let cy;

/**
 * @description Initialise un graphe.
 * @param {string} containerId Identifiant du conteneur.
 * @param {Object} options Options du graphe.
 * @returns {cytoscape.Core} Instance de cytoscape.
*/
export const initGraph = (containerId, options = {}) => {
    cy = cytoscape({
        container: document.getElementById(containerId),
        elements: [],
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#cccccc',
                    'width': 30,
                    'height': 30,
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': 12,
                    'label': 'data(label)',
                    'text-wrap': 'wrap'
                }
            },
            {
                selector: 'edge',
                style: {
                    'line-color': '#666',
                    'width': 2,
                    'curve-style': 'unbundled-bezier',
                    'control-point-distance': 'data(controlPointDistance)',
                    'control-point-weight': 0.5,
                    'label': 'data(weight)',
                    'text-rotation': 'autorotate',
                    'text-margin-y': -10,
                    'color': '#000000',
                    'font-size': 14,
                    'font-weight': 'bold',
                    'text-background-color': '#FFFFFF',
                    'text-background-opacity': 0.7,
                    'text-background-padding': 2
                }
            },
            {
                selector: 'edge.selected',
                style: {
                    'line-color': '#2ecc71',
                    'width': 3
                }
            }
        ],
        layout: { name: 'grid' },
        ...options
    });

    return cy;
};

export const loadPredefinedGraph = async (graphId) => {
    cy.elements().remove();

    try {
        const response = await fetch(`/api/graph/${graphId}`);
        if (!response.ok) {
            throw new Error('Failed to load graph');
        }
        const graphConfig = await response.json();

        if (graphConfig?.data) {
            graphConfig.data.nodes.forEach(node => {
                node.position.y += 80;
            });

            graphConfig.data.edges.forEach(edge => {
                edge.data.controlPointDistance = edge.data.controlPointDistance ?? 0;
                if (!edge.data.weight) {
                    edge.data.weight = Math.floor(Math.random() * 10) + 1;
                }
            });

            cy.add(graphConfig.data);

            cy.edges().forEach(edge => {
                if (!edge.data('weight')) {
                    edge.data('weight', Math.floor(Math.random() * 10) + 1);
                }
            });

            return {
                data: graphConfig.data,
                difficulty: graphConfig.difficulty || "",
            };
        } else {
            throw new Error(`Données invalides pour le graphe avec l'ID ${graphId}`);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: "Impossible de charger le graphe. Veuillez réessayer.",
        });
        return { data: [], optimalColoring: null };
    }
};

/**
 * @description Calcule le poids total d'un ensemble d'arêtes.
 * @param {Array} edges Liste des arêtes dont on veut calculer le poids total.
 * @returns {number} Poids total des arêtes.
 */
export const calculateTotalWeight = (edges) => {
    return edges.reduce((total, edge) => {
        return total + edge.data('weight');
    }, 0);
};

/**
 * @description Réinitialise le graphe à son état initial en retirant les arêtes colorées.
 * @param {cytoscape.Core} cy Instance de cytoscape.
 */
export const resetGraph = (cy) => {
    cy.edges().removeClass('selected visited considering');
    cy.nodes().removeClass('visited considering');
};

/**
 * @description Vérifie si le graphe est connecté en utilisant les arêtes sélectionnées.
 * @param {cytoscape.Core} cy Instance de cytoscape.
 * @param {Set} selectedEdges Ensemble des arêtes sélectionnées.
 * @returns {boolean} True si le graphe est connecté, false sinon.
 */
export const isGraphConnected = (cy, selectedEdges) => {
    if (selectedEdges.size === 0) return false;

    const visited = new Set();
    const startNode = cy.nodes()[0];

    function dfs(node) {
        visited.add(node.id());
        node.connectedEdges().forEach(edge => {
            if (selectedEdges.has(edge)) {
                const otherNode = edge.source().id() === node.id() ? edge.target() : edge.source();
                if (!visited.has(otherNode.id())) {
                    dfs(otherNode);
                }
            }
        });
    }

    dfs(startNode);
    return visited.size === cy.nodes().length;
};

/**
 * @description Réinitialise la visualisation du graphe.
 * @param {cytoscape.Core} cy Instance de cytoscape.
 * @param {string} solutionBtnId ID du bouton de solution.
 * @param {Function | null} [onResetCallback=null] Fonction de rappel optionnelle pour des réinitialisations spécifiques à l'algorithme.
 * @param {boolean} clearSolution Indique si la solution doit être effacée.
 * @returns {void}
 */
export const resetVisualization = (cy, solutionBtnId, onResetCallback = null, clearSolution = true) => {
    if (clearSolution) {
        cy.edges().removeClass('selected visited considering').removeStyle();
        cy.nodes().removeClass('visited considering').removeStyle();
    }
    
    if (onResetCallback) {
        onResetCallback(cy);
    }
    
    const solutionBtn = document.getElementById(solutionBtnId);
    if (solutionBtn) {
        solutionBtn.textContent = 'Voir la solution';
    }
};

/**
 * @description Démarre la visualisation de la solution.
 * @param {cytoscape.Core} cy Instance de cytoscape.
 * @param {Function} algorithmFunction Fonction de l'algorithme à utiliser.
 * @param {Function} generateStepsFunction Fonction pour générer les étapes.
 * @param {string} solutionBtnId ID du bouton de solution.
 * @param {Function | null} [onResetCallback=null] Fonction de rappel optionnelle pour des réinitialisations spécifiques à l'algorithme avant le démarrage.
 * @param {string} algorithmName Nom de l'algorithme.
 * @returns {Object} État initial de la visualisation.
 */
export const startVisualization = (cy, algorithmFunction, generateStepsFunction, solutionBtnId, onResetCallback = null, algorithmName = '') => {
    resetVisualization(cy, solutionBtnId, onResetCallback, false);

    let solutionEdges = algorithmFunction(cy);
    let solutionSteps = generateStepsFunction(cy, solutionEdges);
    
    const solutionBtn = document.getElementById(solutionBtnId);
    if (solutionBtn) {
        solutionBtn.textContent = 'Arrêter';
    }
    
    // Add step info element if it doesn't exist
    let stepInfoElement = document.getElementById('step-info');
    if (!stepInfoElement) {
        stepInfoElement = document.createElement('div');
        stepInfoElement.id = 'step-info';
        stepInfoElement.style.fontWeight = 'bold';
        stepInfoElement.style.color = '#333';
        document.getElementById('step-info-container').appendChild(stepInfoElement);
    }
    
    // Add algorithm explanation
    let algorithmExplanation = '';
    if (algorithmName === 'Prim') {
        algorithmExplanation = 'Algorithme de Prim: On commence par un sommet et on ajoute à chaque étape l\'arête de poids minimal qui connecte un sommet déjà visité à un sommet non visité.';
    } else if (algorithmName === 'Kruskal') {
        algorithmExplanation = 'Algorithme de Kruskal: On trie les arêtes par poids croissant et on les ajoute une par une si elles ne créent pas de cycle.';
    } else if (algorithmName === 'Boruvka') {
        algorithmExplanation = 'Algorithme de Boruvka: On commence avec chaque sommet comme composante, puis on trouve l\'arête de poids minimal pour chaque composante et on fusionne les composantes.';
    }
    
    let explanationElement = document.getElementById('algorithm-explanation');
    if (!explanationElement) {
        explanationElement = document.createElement('div');
        explanationElement.id = 'algorithm-explanation';
        explanationElement.style.marginBottom = '10px';
        explanationElement.style.fontStyle = 'italic';
        document.getElementById('step-info-container').insertBefore(explanationElement, stepInfoElement);
    }
    explanationElement.textContent = algorithmExplanation;
    
    // Add color legend
    let legendElement = document.getElementById('color-legend');
    if (!legendElement) {
        legendElement = document.createElement('div');
        legendElement.id = 'color-legend';
        legendElement.style.marginTop = '10px';
        legendElement.style.marginBottom = '10px';
        legendElement.style.display = 'flex';
        legendElement.style.flexWrap = 'wrap';
        legendElement.style.gap = '15px';
        document.getElementById('step-info-container').insertBefore(legendElement, stepInfoElement);
        
        // Red edge (considering)
        const redLegend = document.createElement('div');
        redLegend.style.display = 'flex';
        redLegend.style.alignItems = 'center';
        redLegend.style.gap = '5px';
        
        const redBox = document.createElement('div');
        redBox.style.width = '20px';
        redBox.style.height = '3px';
        redBox.style.backgroundColor = '#ff0000';
        redLegend.appendChild(redBox);
        
        const redText = document.createElement('span');
        redText.textContent = 'Arête examinée';
        redLegend.appendChild(redText);
        
        // Green edge (selected)
        const greenLegend = document.createElement('div');
        greenLegend.style.display = 'flex';
        greenLegend.style.alignItems = 'center';
        greenLegend.style.gap = '5px';
        
        const greenBox = document.createElement('div');
        greenBox.style.width = '20px';
        greenBox.style.height = '3px';
        greenBox.style.backgroundColor = '#2ecc71';
        greenLegend.appendChild(greenBox);
        
        const greenText = document.createElement('span');
        greenText.textContent = 'Arête sélectionnée';
        greenLegend.appendChild(greenText);
        
        // Gray edge (rejected)
        const grayLegend = document.createElement('div');
        grayLegend.style.display = 'flex';
        grayLegend.style.alignItems = 'center';
        grayLegend.style.gap = '5px';
        
        const grayBox = document.createElement('div');
        grayBox.style.width = '20px';
        grayBox.style.height = '3px';
        grayBox.style.backgroundColor = '#666';
        grayLegend.appendChild(grayBox);
        
        const grayText = document.createElement('span');
        grayText.textContent = 'Arête rejetée';
        grayLegend.appendChild(grayText);
        
        legendElement.appendChild(redLegend);
        legendElement.appendChild(greenLegend);
        legendElement.appendChild(grayLegend);
    }
    
    return {
        solutionEdges,
        solutionSteps,
        currentStep: 0,
        solutionMode: true,
        isAnimating: true
    };
};

/**
 * @description Arrête la visualisation de la solution.
 * @param {string} solutionBtnId ID du bouton de solution.
 * @param {cytoscape.Core} cy Instance de cytoscape.
 * @param {Function | null} [onStopCallback=null] Fonction de rappel optionnelle pour des réinitialisations spécifiques à l'algorithme lors de l'arrêt.
 * @returns {Object} Nouvel état (animation arrêtée, mode solution désactivé).
 */
export const stopVisualization = (solutionBtnId, cy, onStopCallback = null) => {
    // Don't clear the solution or step info, just update the button text
    const solutionBtn = document.getElementById(solutionBtnId);
    if (solutionBtn) {
        solutionBtn.textContent = 'Voir la solution';
    }
    
    return { isAnimating: false, solutionMode: false };
};

/**
 * @description Anime la prochaine étape de la solution.
 * @param {Object} state État de la visualisation.
 * @param {cytoscape.Core} cy Instance de cytoscape.
 * @param {Function} onComplete Fonction à appeler lorsque l'animation est terminée.
 * @returns {Object} État de la visualisation mis à jour.
 */
export const animateNextStep = (state, cy, onComplete) => {
    const { isAnimating, currentStep, solutionSteps } = state;
    
    if (!isAnimating || currentStep >= solutionSteps.length) {
        if (currentStep >= solutionSteps.length && onComplete) {
            onComplete();
        }
        return state;
    }

    const step = solutionSteps[currentStep];
    let stepDescription = '';
    let color = '#333';

    if (step.type === 'consider') {
        const edge = cy.getElementById(step.edge);
        edge.addClass('considering');
        edge.source().addClass('considering');
        edge.target().addClass('considering');
        
        edge.style({
            'line-color': '#ff0000',
            'width': 3
        });
        stepDescription = `Étape ${currentStep + 1}/${solutionSteps.length}: Test de l'arête ${edge.source().id()}-${edge.target().id()} de poids ${edge.data('weight')} (colorée en rouge)`;
        color = '#ff0000';
    } else if (step.type === 'select') {
        const edge = cy.getElementById(step.edge);
        edge.removeClass('considering').addClass('selected');
        edge.source().addClass('visited');
        edge.target().addClass('visited');
        
        edge.style({
            'line-color': '#2ecc71',
            'width': 3
        });
        stepDescription = `Étape ${currentStep + 1}/${solutionSteps.length}: Sélection de l'arête ${edge.source().id()}-${edge.target().id()} de poids ${edge.data('weight')} (colorée en vert)`;
        color = '#2ecc71';
    } else if (step.type === 'reject') {
        const edge = cy.getElementById(step.edge);
        edge.removeClass('considering');
        
        edge.style({
            'line-color': '#666',
            'width': 2
        });
        stepDescription = `Étape ${currentStep + 1}/${solutionSteps.length}: Rejet de l'arête ${edge.source().id()}-${edge.target().id()} de poids ${edge.data('weight')} (retour à la couleur grise)`;
        color = '#666';
    }

    // Append the step description as a colored line
    const stepInfoElement = document.getElementById('step-info');
    if (stepInfoElement) {
        const line = document.createElement('div');
        line.textContent = stepDescription;
        line.style.color = color;
        line.style.fontWeight = 'bold';
        stepInfoElement.appendChild(line);
        // Scroll to bottom
        stepInfoElement.scrollTop = stepInfoElement.scrollHeight;
    }

    return {
        ...state,
        currentStep: currentStep + 1
    };
};

export function clearStepInfo() {
    const stepInfoElement = document.getElementById('step-info');
    if (stepInfoElement) stepInfoElement.innerHTML = '';
    const explanationElement = document.getElementById('algorithm-explanation');
    if (explanationElement) explanationElement.textContent = '';
    const legendElement = document.getElementById('color-legend');
    if (legendElement) legendElement.remove();
}