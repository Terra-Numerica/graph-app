import { initGraph, loadPredefinedGraph, resetGraph, calculateTotalWeight, isGraphConnected, resetVisualization, startVisualization, stopVisualization, animateNextStep, clearStepInfo } from './functions.js';
import { addDynamicButton, populateGraphSelect } from '../../functions.js';

export const initBoruvkaAlgorithm = () => {
    const cy = initGraph('cy-predefined', { zoomingEnabled: false, panningEnabled: false, boxSelectionEnabled: false });
    const selectedEdgeIds = new Set();
    let solutionEdges = null;
    let solutionSteps = [];
    let currentStep = 0;
    let solutionMode = false;
    let isAnimating = false;

    populateGraphSelect();

    const predefinedGraphSelect = document.querySelector('#predefined-graph-select');

    predefinedGraphSelect.addEventListener('change', async () => {
        try {
            clearStepInfo();
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
            selectedEdgeIds.clear();
            solutionEdges = null;
            solutionSteps = [];
            currentStep = 0;
            solutionMode = false;
            isAnimating = false;
            resetGraph(cy);
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
        if (selectedEdgeIds.size === 0) {
            Swal.fire({
                icon: "warning",
                title: "Attention",
                text: "Veuillez sélectionner des arêtes pour former l'arbre couvrant.",
            });
            return;
        }

        if (!isGraphConnected(cy, new Set(Array.from(selectedEdgeIds).map(id => cy.getElementById(id))))) {
            Swal.fire({
                icon: "error",
                title: "Incorrect",
                text: "Le graphe n'est pas connecté. Tous les nœuds doivent être reliés.",
            });
            return;
        }

        const userTotalWeight = calculateTotalWeight(Array.from(selectedEdgeIds).map(id => cy.getElementById(id)));

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
        selectedEdgeIds.clear();
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
            // Sync selectedEdgeIds with solution edges (by Cytoscape instance)
            if (solutionEdges) {
                solutionEdges.forEach(edge => {
                    const cyEdge = cy.getElementById(edge.id());
                    selectedEdgeIds.add(cyEdge.id());
                });
            }
        } else {
            clearStepInfo();
            const visualizationState = startVisualization(cy, boruvkaAlgorithm, generateSolutionSteps, 'solution-btn', null, 'Boruvka');
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
                solutionMode = false;
            }
        );

        currentStep = updatedState.currentStep;

        if (isAnimating) {
            setTimeout(() => animateNextStepWrapper(), 500);
        }
    }

    cy.on('tap', 'edge', (evt) => {
        const edge = evt.target;
        const edgeId = edge.id();

        if (selectedEdgeIds.has(edgeId)) {
            selectedEdgeIds.delete(edgeId);
            edge.removeClass('selected');
            edge.removeStyle();
        } else {
            selectedEdgeIds.add(edgeId);
            edge.addClass('selected');
            edge.style({
                'line-color': '#2ecc71',
                'width': 3
            });
        }
    });

    cy.on('cxttap', 'edge', (evt) => {
        const edge = evt.target;
        const edgeId = edge.id();
        if (selectedEdgeIds.has(edgeId)) {
            selectedEdgeIds.delete(edgeId);
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