import { initGraph, loadPredefinedGraph, resetGraph, calculateTotalWeight, isGraphConnected, resetVisualization, startVisualization, stopVisualization, animateNextStep } from './functions.js';
import { addDynamicButton, populateGraphSelect } from '../../functions.js';

export const initKruskalAlgorithm = () => {
    const cy = initGraph('cy-predefined', { zoomingEnabled: false, panningEnabled: false, boxSelectionEnabled: false });
    const selectedEdges = new Set();
    let solutionEdges = null;
    let solutionSteps = [];
    let currentStep = 0;
    let solutionMode = false;
    let isAnimating = false;

    populateGraphSelect();

    const predefinedGraphSelect = document.querySelector('#predefined-graph-select');

    predefinedGraphSelect.addEventListener('change', async () => {
        try {
            const graphId = predefinedGraphSelect.value;
            const graphData = await loadPredefinedGraph(graphId);

            if (!graphData || !graphData.data) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: "Impossible de charger le graphe. Veuillez réessayer.",
                });
                return;
            }

            cy.json(graphData);
            selectedEdges.clear();
            solutionEdges = null;
            solutionSteps = [];
            currentStep = 0;
            solutionMode = false;
            isAnimating = false;
            resetGraph(cy);
            cy.edges().removeClass('selected').removeStyle();
            resetVisualization(cy, 'solution-btn', null);

            cy.nodes().forEach(node => {
                node.lock();
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: "Impossible de charger le graphe. Veuillez réessayer.",
            });
        }
    });

    addDynamicButton('Valider', 'validate-btn', () => {
        if (selectedEdges.size === 0) {
            Swal.fire({
                icon: "warning",
                title: "Attention",
                text: "Veuillez sélectionner des arêtes pour former l'arbre couvrant.",
            });
            return;
        }

        if (!isGraphConnected(cy, selectedEdges)) {
            Swal.fire({
                icon: "error",
                title: "Incorrect",
                text: "Le graphe n'est pas connecté. Tous les nœuds doivent être reliés.",
            });
            return;
        }

        const userTotalWeight = calculateTotalWeight(Array.from(selectedEdges));

        const optimalEdges = kruskalAlgorithm(cy);
        const optimalTotalWeight = calculateTotalWeight(optimalEdges);

        if (userTotalWeight === optimalTotalWeight) {
            Swal.fire({
                icon: "success",
                title: "Félicitations !",
                text: "Vous avez trouvé l'arbre couvrant de poids minimum !",
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Incorrect",
                text: `Le poids total de votre solution (${userTotalWeight}) n'est pas minimal. Le poids minimal est ${optimalTotalWeight}.`,
            });
        }
    });

    addDynamicButton('Réinitialiser', 'reset-btn', () => {
        selectedEdges.clear();
        cy.edges().removeClass('selected').removeStyle();
        solutionMode = false;
        isAnimating = false;
        resetVisualization(cy, 'solution-btn', null);
    });

    addDynamicButton('Voir la solution', 'solution-btn', () => {
        if (isAnimating) {
            const stateUpdate = stopVisualization('solution-btn', cy, null);
            isAnimating = stateUpdate.isAnimating;
            solutionMode = stateUpdate.solutionMode;
        } else {
            const visualizationState = startVisualization(cy, kruskalAlgorithm, generateSolutionSteps, 'solution-btn', null);
            solutionEdges = visualizationState.solutionEdges;
            solutionSteps = visualizationState.solutionSteps;
            currentStep = visualizationState.currentStep;
            solutionMode = visualizationState.solutionMode;
            isAnimating = visualizationState.isAnimating;
            animateNextStepWrapper();
        }
    });

    function animateNextStepWrapper() {
        if (!isAnimating) return;
        
        const updatedState = animateNextStep(
            { isAnimating, currentStep, solutionSteps, solutionMode },
            cy,
            () => {
                Swal.fire({
                    icon: "success",
                    title: "Solution complète !",
                    text: `Voici l'arbre couvrant de poids minimum. Nombre d'étapes : ${solutionSteps.length}`,
                });
                const stateUpdate = stopVisualization('solution-btn', cy, null);
                isAnimating = stateUpdate.isAnimating;
                solutionMode = stateUpdate.solutionMode;
            }
        );
        
        currentStep = updatedState.currentStep;
        
        if (isAnimating) {
            setTimeout(() => animateNextStepWrapper(), 1000);
        }
    }

    cy.on('tap', 'edge', (evt) => {
        if (solutionMode) return;

        const edge = evt.target;

        if (selectedEdges.has(edge)) {
            selectedEdges.delete(edge);
            edge.removeClass('selected');
            edge.removeStyle();
        } else {
            selectedEdges.add(edge);
            edge.addClass('selected');
            edge.style({
                'line-color': '#2ecc71',
                'width': 3
            });
        }
    });

    cy.on('cxttap', 'edge', (evt) => {
        if (solutionMode) return;

        const edge = evt.target;

        if (selectedEdges.has(edge)) {
            selectedEdges.delete(edge);
            edge.removeClass('selected');
            edge.removeStyle();
        }
    });

    function generateSolutionSteps(cy, finalEdges) {
        const steps = [];
        const edges = Array.from(cy.edges());
        const nodes = cy.nodes();
        const parent = {};
        const rank = {};

        nodes.forEach(node => {
            parent[node.id()] = node.id();
            rank[node.id()] = 0;
        });

        edges.sort((a, b) => a.data('weight') - b.data('weight'));

        edges.forEach(edge => {
            const sourceId = edge.source().id();
            const targetId = edge.target().id();
            
            steps.push({
                type: 'consider',
                edge: edge.id()
            });

            const sourceRoot = find(sourceId);
            const targetRoot = find(targetId);

            if (sourceRoot !== targetRoot) {
                steps.push({
                    type: 'select',
                    edge: edge.id()
                });
                union(sourceRoot, targetRoot);
            } else {
                steps.push({
                    type: 'reject',
                    edge: edge.id()
                });
            }
        });

        function find(node) {
            if (parent[node] !== node) {
                parent[node] = find(parent[node]);
            }
            return parent[node];
        }

        function union(x, y) {
            const xRoot = find(x);
            const yRoot = find(y);

            if (xRoot === yRoot) return;

            if (rank[xRoot] < rank[yRoot]) {
                parent[xRoot] = yRoot;
            } else if (rank[xRoot] > rank[yRoot]) {
                parent[yRoot] = xRoot;
            } else {
                parent[yRoot] = xRoot;
                rank[xRoot]++;
            }
        }

        return steps;
    }
};

export const kruskalAlgorithm = (cy) => {
    const nodes = cy.nodes();
    const edges = Array.from(cy.edges());
    const selectedEdges = new Set();
    const parent = new Map();
    const rank = new Map();

    nodes.forEach(node => {
        parent.set(node.id(), node.id());
        rank.set(node.id(), 0);
    });

    const find = (nodeId) => {
        if (parent.get(nodeId) !== nodeId) {
            parent.set(nodeId, find(parent.get(nodeId)));
        }
        return parent.get(nodeId);
    };

    const union = (nodeId1, nodeId2) => {
        const root1 = find(nodeId1);
        const root2 = find(nodeId2);

        if (root1 === root2) return false;

        if (rank.get(root1) < rank.get(root2)) {
            parent.set(root1, root2);
        } else if (rank.get(root1) > rank.get(root2)) {
            parent.set(root2, root1);
        } else {
            parent.set(root2, root1);
            rank.set(root1, rank.get(root1) + 1);
        }
        return true;
    };

    edges.sort((a, b) => a.data('weight') - b.data('weight'));

    edges.forEach(edge => {
        const sourceId = edge.source().id();
        const targetId = edge.target().id();

        if (union(sourceId, targetId)) {
            selectedEdges.add(edge);
        }
    });

    return Array.from(selectedEdges);
}; 