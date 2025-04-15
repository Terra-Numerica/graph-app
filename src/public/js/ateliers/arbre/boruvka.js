import { initGraph, loadPredefinedGraph, resetGraph, calculateTotalWeight, isGraphConnected, resetVisualization, startVisualization, stopVisualization, animateNextStep } from './functions.js';
import { addDynamicButton, populateGraphSelect } from '../../functions.js';

export const initBoruvkaMode = () => {
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
            resetVisualization(cy, 'solution-btn', null);
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

        const optimalEdges = boruvkaAlgorithm(cy);
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
            const visualizationState = startVisualization(cy, boruvkaAlgorithm, generateSolutionSteps, 'solution-btn', null);
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
                    text: "Voici l'arbre couvrant de poids minimum.",
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
        const nodes = cy.nodes();
        const edges = Array.from(cy.edges());
        const component = new Map();
        const selectedEdges = new Set();

        nodes.forEach(node => {
            component.set(node.id(), node.id());
        });

        function find(nodeId) {
            if (component.get(nodeId) !== nodeId) {
                component.set(nodeId, find(component.get(nodeId)));
            }
            return component.get(nodeId);
        }

        function union(nodeId1, nodeId2) {
            const root1 = find(nodeId1);
            const root2 = find(nodeId2);
            if (root1 !== root2) {
                component.set(root2, root1);
                return true;
            }
            return false;
        }

        while (selectedEdges.size < nodes.length - 1) {
            const minEdges = new Map();
            const consideredEdges = new Set();

            edges.forEach(edge => {
                const sourceId = edge.source().id();
                const targetId = edge.target().id();
                const sourceRoot = find(sourceId);
                const targetRoot = find(targetId);

                if (sourceRoot !== targetRoot) {
                    consideredEdges.add(edge);
                    const weight = edge.data('weight');

                    if (!minEdges.has(sourceRoot) ||
                        weight < minEdges.get(sourceRoot).data('weight')) {
                        minEdges.set(sourceRoot, edge);
                    }

                    if (!minEdges.has(targetRoot) ||
                        weight < minEdges.get(targetRoot).data('weight')) {
                        minEdges.set(targetRoot, edge);
                    }
                }
            });

            if (minEdges.size === 0) break;

            consideredEdges.forEach(edge => {
                steps.push({
                    type: 'consider',
                    edge: edge.id()
                });
            });

            consideredEdges.forEach(edge => {
                const sourceId = edge.source().id();
                const targetId = edge.target().id();
                const sourceRoot = find(sourceId);
                const targetRoot = find(targetId);

                const isMinEdge = minEdges.has(sourceRoot) && minEdges.get(sourceRoot) === edge ||
                    minEdges.has(targetRoot) && minEdges.get(targetRoot) === edge;

                if (isMinEdge && sourceRoot !== targetRoot) {
                    steps.push({
                        type: 'select',
                        edge: edge.id()
                    });
                    selectedEdges.add(edge);
                    union(sourceId, targetId);
                } else {
                    steps.push({
                        type: 'reject',
                        edge: edge.id()
                    });
                }
            });
        }

        return steps;
    }
};

export const boruvkaAlgorithm = (cy) => {
    const nodes = cy.nodes();
    const edges = Array.from(cy.edges());
    const selectedEdges = new Set();
    const component = new Map();

    nodes.forEach(node => {
        component.set(node.id(), node.id());
    });

    function find(nodeId) {
        if (component.get(nodeId) !== nodeId) {
            component.set(nodeId, find(component.get(nodeId)));
        }
        return component.get(nodeId);
    }

    function union(nodeId1, nodeId2) {
        const root1 = find(nodeId1);
        const root2 = find(nodeId2);
        if (root1 !== root2) {
            component.set(root2, root1);
            return true;
        }
        return false;
    }

    while (selectedEdges.size < nodes.length - 1) {
        const minEdges = new Map();

        edges.forEach(edge => {
            const sourceId = edge.source().id();
            const targetId = edge.target().id();
            const sourceRoot = find(sourceId);
            const targetRoot = find(targetId);

            if (sourceRoot !== targetRoot) {
                const weight = edge.data('weight');

                if (!minEdges.has(sourceRoot) ||
                    weight < minEdges.get(sourceRoot).data('weight')) {
                    minEdges.set(sourceRoot, edge);
                }

                if (!minEdges.has(targetRoot) ||
                    weight < minEdges.get(targetRoot).data('weight')) {
                    minEdges.set(targetRoot, edge);
                }
            }
        });

        if (minEdges.size === 0) break;

        let edgesAdded = false;
        minEdges.forEach((edge, componentId) => {
            const sourceId = edge.source().id();
            const targetId = edge.target().id();
            if (find(sourceId) !== find(targetId)) {
                selectedEdges.add(edge);
                union(sourceId, targetId);
                edgesAdded = true;
            }
        });

        if (!edgesAdded) break;
    }

    return Array.from(selectedEdges);
}; 