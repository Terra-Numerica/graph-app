import { initGraph, loadPredefinedGraph, resetGraph, calculateTotalWeight, isGraphConnected, resetVisualization, startVisualization, stopVisualization, animateNextStep } from './functions.js';
import { addDynamicButton, populateGraphSelect } from '../../functions.js';

export const initPrimAlgorithm = () => {
    const cy = initGraph('cy-predefined', { zoomingEnabled: false, panningEnabled: false, boxSelectionEnabled: false });
    const selectedEdges = new Set();
    let solutionEdges = null;
    let solutionSteps = [];
    let currentStep = 0;
    let solutionMode = false;
    let isAnimating = false;

    function initializeNodeLabels() {
        if (!cy || cy.nodes().length === 0) return;

        cy.nodes().forEach(node => {
            if (node && node.data) {
                node.data('cost', Infinity);
                node.data('prev', 'nil');
            }
        });

        const startNode = cy.nodes()[0];
        if (startNode && startNode.data) {
            startNode.data('cost', 0);
        }

        updateNodeLabels();
    }

    function updateNodeLabels() {
        if (!cy || cy.nodes().length === 0) return;

        cy.nodes().forEach(node => {
            if (node && node.data) {
                const cost = node.data('cost');
                const prev = node.data('prev');
                const costDisplay = cost === Infinity ? '∞' : cost;
                node.data('label', `${costDisplay},${prev}`);
            }
        });
    }

    function resetPrimSpecificState() {
        initializeNodeLabels();
    }

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
            resetVisualization(cy, 'solution-btn', resetPrimSpecificState);
            initializeNodeLabels();
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

        const optimalEdges = primAlgorithm(cy);
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
        cy.edges().removeClass('selected');
        solutionMode = false;
        isAnimating = false;
        resetVisualization(cy, 'solution-btn', resetPrimSpecificState);
        recalculateAllCosts();
    });

    addDynamicButton('Voir la solution', 'solution-btn', () => {
        if (isAnimating) {
            const stateUpdate = stopVisualization('solution-btn', cy, resetPrimSpecificState);
            isAnimating = stateUpdate.isAnimating;
            solutionMode = stateUpdate.solutionMode;
        } else {
            const visualizationState = startVisualization(cy, primAlgorithm, generateSolutionSteps, 'solution-btn', resetPrimSpecificState);
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
                const stateUpdate = stopVisualization('solution-btn', cy, resetPrimSpecificState);
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
        const source = edge.source();
        const target = edge.target();

        if (selectedEdges.has(edge)) {
            selectedEdges.delete(edge);
            edge.removeClass('selected');
            recalculateAllCosts();
        } else {
            if (canAddEdge(cy, selectedEdges, edge)) {
                selectedEdges.add(edge);
                edge.addClass('selected');
                updateCostsAfterEdgeSelection(edge);
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Attention",
                    text: "Cette arête créerait un cycle. Choisissez une autre arête.",
                });
            }
        }
    });

    cy.on('cxttap', 'edge', (evt) => {
        if (solutionMode) return;

        const edge = evt.target;

        if (selectedEdges.has(edge)) {
            selectedEdges.delete(edge);
            edge.removeClass('selected');
            recalculateAllCosts();
        }
    });

    function updateCostsAfterEdgeSelection(selectedEdge) {
        const source = selectedEdge.source();
        const target = selectedEdge.target();
        const weight = selectedEdge.data('weight');

        if (selectedEdges.size === 1) {
            if (source.data('cost') === 0) {
                target.data('cost', weight);
                target.data('prev', source.id());
            } else {
                source.data('cost', weight);
                source.data('prev', target.id());
            }
        } else {
            if (source.data('cost') === Infinity && target.data('cost') !== Infinity) {
                source.data('cost', weight);
                source.data('prev', target.id());
            } else if (target.data('cost') === Infinity && source.data('cost') !== Infinity) {
                target.data('cost', weight);
                target.data('prev', source.id());
            }
        }

        updateNodeLabels();
    }

    function recalculateAllCosts() {
        cy.nodes().forEach(node => {
            node.data('cost', Infinity);
            node.data('prev', 'nil');
        });

        const startNode = cy.nodes()[0];
        startNode.data('cost', 0);

        const edgeArray = Array.from(selectedEdges);

        edgeArray.sort((a, b) => {
            const aConnectedToStart = a.source().data('cost') === 0 || a.target().data('cost') === 0;
            const bConnectedToStart = b.source().data('cost') === 0 || b.target().data('cost') === 0;

            if (aConnectedToStart && !bConnectedToStart) return -1;
            if (!aConnectedToStart && bConnectedToStart) return 1;
            return 0;
        });

        edgeArray.forEach(edge => {
            updateCostsAfterEdgeSelection(edge);
        });

        updateNodeLabels();
    }

    function canAddEdge(cy, selectedEdges, newEdge) {
        const source = newEdge.source().id();
        const target = newEdge.target().id();

        const visited = new Set();

        function hasPath(currentNodeId) {
            if (currentNodeId === target) {
                return true;
            }

            visited.add(currentNodeId);

            const neighbors = [];
            cy.getElementById(currentNodeId).connectedEdges().forEach(edge => {
                if (selectedEdges.has(edge)) {
                    const neighbor = edge.source().id() === currentNodeId ? edge.target().id() : edge.source().id();
                    if (!visited.has(neighbor)) {
                        neighbors.push(neighbor);
                    }
                }
            });

            return neighbors.some(neighbor => hasPath(neighbor));
        }

        return !hasPath(source);
    }

    function generateSolutionSteps(cy, finalEdges) {
        const steps = [];
        const nodes = cy.nodes();
        const edges = Array.from(cy.edges());
        const visited = new Set();
        const selectedEdges = new Set();

        const startNode = nodes[0];
        visited.add(startNode.id());

        while (visited.size < nodes.length) {
            let minEdge = null;
            let minWeight = Infinity;
            const consideredEdges = new Set();

            edges.forEach(edge => {
                const sourceId = edge.source().id();
                const targetId = edge.target().id();
                const isSourceVisited = visited.has(sourceId);
                const isTargetVisited = visited.has(targetId);

                if (isSourceVisited !== isTargetVisited) {
                    consideredEdges.add(edge);
                    const weight = edge.data('weight');
                    if (weight < minWeight) {
                        minWeight = weight;
                        minEdge = edge;
                    }
                }
            });

            if (!minEdge) break;

            consideredEdges.forEach(edge => {
                steps.push({
                    type: 'consider',
                    edge: edge.id()
                });
            });

            consideredEdges.forEach(edge => {
                if (edge === minEdge) {
                    steps.push({
                        type: 'select',
                        edge: edge.id()
                    });
                    selectedEdges.add(edge);
                    
                    const sourceId = edge.source().id();
                    const targetId = edge.target().id();
                    if (!visited.has(sourceId)) visited.add(sourceId);
                    if (!visited.has(targetId)) visited.add(targetId);
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

    initializeNodeLabels(); 
};

export const primAlgorithm = (cy) => {
    const nodes = cy.nodes();
    const edges = cy.edges();
    const selectedEdges = new Set();
    const visited = new Set();
    const startNode = nodes[0];
    visited.add(startNode);

    function findMinimalSpanningTree(currentVisited) {
        if (currentVisited.size === nodes.length) {
            return selectedEdges;
        }

        let minEdge = null;
        let minWeight = Infinity;

        edges.forEach(edge => {
            const source = edge.source();
            const target = edge.target();
            const weight = edge.data('weight');

            if ((currentVisited.has(source) && !currentVisited.has(target)) ||
                (currentVisited.has(target) && !currentVisited.has(source))) {
                if (weight < minWeight) {
                    minWeight = weight;
                    minEdge = edge;
                }
            }
        });

        if (minEdge) {
            selectedEdges.add(minEdge);
            const unvisitedNode = currentVisited.has(minEdge.source()) ? minEdge.target() : minEdge.source();
            currentVisited.add(unvisitedNode);
            return findMinimalSpanningTree(currentVisited);
        }

        return selectedEdges;
    }

    return Array.from(findMinimalSpanningTree(visited));
};
