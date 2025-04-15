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
 * @returns {void}
 */
export const resetVisualization = (cy, solutionBtnId, onResetCallback = null) => {
    cy.edges().removeClass('selected visited considering').removeStyle();
    cy.nodes().removeClass('visited considering').removeStyle();
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
 * @returns {Object} État initial de la visualisation.
 */
export const startVisualization = (cy, algorithmFunction, generateStepsFunction, solutionBtnId, onResetCallback = null) => {
    resetVisualization(cy, solutionBtnId, onResetCallback);

    let solutionEdges = algorithmFunction(cy);
    let solutionSteps = generateStepsFunction(cy, solutionEdges);
    
    const solutionBtn = document.getElementById(solutionBtnId);
    if (solutionBtn) {
        solutionBtn.textContent = 'Arrêter';
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
    resetVisualization(cy, solutionBtnId, onStopCallback);
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

    cy.edges().removeClass('considering');
    cy.nodes().removeClass('considering');

    if (step.type === 'consider') {
        const edge = cy.getElementById(step.edge);
        edge.addClass('considering');
        edge.source().addClass('considering');
        edge.target().addClass('considering');
        
        edge.style({
            'line-color': '#ff0000',
            'width': 3
        });
    } else if (step.type === 'select') {
        const edge = cy.getElementById(step.edge);
        edge.removeClass('considering').addClass('selected');
        edge.source().addClass('visited');
        edge.target().addClass('visited');
        
        edge.style({
            'line-color': '#2ecc71',
            'width': 3
        });
    } else if (step.type === 'reject') {
        const edge = cy.getElementById(step.edge);
        edge.removeClass('considering');
        
        edge.style({
            'line-color': '#666',
            'width': 2
        });
    }

    return {
        ...state,
        currentStep: currentStep + 1
    };
};