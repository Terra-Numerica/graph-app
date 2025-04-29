import { initGraph, loadPredefinedGraph, resetGraph, calculateTotalWeight, isGraphConnected, resetVisualization, startVisualization, stopVisualization, animateNextStep } from './functions.js';
import { addDynamicButton, populateGraphSelect, clearDynamicButtons } from '../../functions.js';
import { primAlgorithm } from './prim.js';
import { kruskalAlgorithm } from './kruskal.js';
import { boruvkaAlgorithm } from './boruvka.js';

export const initTryAlgorithm = () => {
    const cy = initGraph('cy-predefined', { zoomingEnabled: false, panningEnabled: false, boxSelectionEnabled: false });
    const selectedEdges = new Set();
    let solutionEdges = null;
    let solutionSteps = [];
    let currentStep = 0;
    let solutionMode = false;
    let isAnimating = false;
    let currentAlgorithm = null;
    let validationButtonsAdded = false;

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
            resetGraph(cy);
            cy.edges().removeClass('selected').removeStyle();
            solutionMode = false;
            isAnimating = false;
            currentAlgorithm = null;
            resetVisualization(cy, 'solution-btn', null);

            cy.nodes().forEach(node => {
                node.lock();
            });
            
            // Add validation buttons if they haven't been added yet
            if (!validationButtonsAdded) {
                addValidationButtons();
                validationButtonsAdded = true;
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: "Impossible de charger le graphe. Veuillez réessayer.",
            });
        }
    });

    function addValidationButtons() {
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
        });
    }

    // Add solution buttons
    const solutionButtonsContainer = document.createElement('div');
    solutionButtonsContainer.className = 'solution-buttons-container';
    solutionButtonsContainer.style.marginTop = '20px';
    solutionButtonsContainer.style.textAlign = 'center';
    
    const solutionTitle = document.createElement('h3');
    solutionTitle.textContent = 'Solutions selon les algorithmes :';
    solutionTitle.style.marginBottom = '15px';
    solutionButtonsContainer.appendChild(solutionTitle);
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'center';
    buttonsContainer.style.gap = '15px';
    
    // Prim solution button
    const primSolutionBtn = document.createElement('button');
    primSolutionBtn.textContent = 'Solution selon l\'algorithme de Prim';
    primSolutionBtn.className = 'solution-btn';
    primSolutionBtn.style.padding = '10px 15px';
    primSolutionBtn.style.backgroundColor = '#3498db';
    primSolutionBtn.style.color = 'white';
    primSolutionBtn.style.border = 'none';
    primSolutionBtn.style.borderRadius = '5px';
    primSolutionBtn.style.cursor = 'pointer';
    primSolutionBtn.addEventListener('click', () => {
        showAlgorithmSolution(cy, primAlgorithm, 'Prim', generatePrimSolutionSteps);
    });
    buttonsContainer.appendChild(primSolutionBtn);
    
    // Kruskal solution button
    const kruskalSolutionBtn = document.createElement('button');
    kruskalSolutionBtn.textContent = 'Solution selon l\'algorithme de Kruskal';
    kruskalSolutionBtn.className = 'solution-btn';
    kruskalSolutionBtn.style.padding = '10px 15px';
    kruskalSolutionBtn.style.backgroundColor = '#2ecc71';
    kruskalSolutionBtn.style.color = 'white';
    kruskalSolutionBtn.style.border = 'none';
    kruskalSolutionBtn.style.borderRadius = '5px';
    kruskalSolutionBtn.style.cursor = 'pointer';
    kruskalSolutionBtn.addEventListener('click', () => {
        showAlgorithmSolution(cy, kruskalAlgorithm, 'Kruskal', generateKruskalSolutionSteps);
    });
    buttonsContainer.appendChild(kruskalSolutionBtn);
    
    // Boruvka solution button
    const boruvkaSolutionBtn = document.createElement('button');
    boruvkaSolutionBtn.textContent = 'Solution selon l\'algorithme de Boruvka';
    boruvkaSolutionBtn.className = 'solution-btn';
    boruvkaSolutionBtn.style.padding = '10px 15px';
    boruvkaSolutionBtn.style.backgroundColor = '#e74c3c';
    boruvkaSolutionBtn.style.color = 'white';
    boruvkaSolutionBtn.style.border = 'none';
    boruvkaSolutionBtn.style.borderRadius = '5px';
    boruvkaSolutionBtn.style.cursor = 'pointer';
    boruvkaSolutionBtn.addEventListener('click', () => {
        showAlgorithmSolution(cy, boruvkaAlgorithm, 'Boruvka', generateBoruvkaSolutionSteps);
    });
    buttonsContainer.appendChild(boruvkaSolutionBtn);
    
    solutionButtonsContainer.appendChild(buttonsContainer);
    document.querySelector('#cy-predefined').parentNode.appendChild(solutionButtonsContainer);

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
    
    // Function to show algorithm solution
    function showAlgorithmSolution(cy, algorithm, algorithmName, generateSteps) {
        // Clear previous selections
        selectedEdges.clear();
        cy.edges().removeClass('selected').removeStyle();
        
        // Get solution edges
        const algorithmEdges = algorithm(cy);
        
        // Update mode title
        document.querySelector('#mode-title').textContent = `Solution selon l'algorithme de ${algorithmName}`;
        
        // Ne plus masquer les boutons de solutions
        // solutionButtonsContainer.style.display = 'none';
        
        // Clear any existing dynamic buttons
        clearDynamicButtons();
        
        // Add back button
        addDynamicButton('Retour', 'back-btn', () => {
            // Reset visualization state
            solutionMode = false;
            isAnimating = false;
            currentAlgorithm = null;
            
            // Reset graph
            selectedEdges.clear();
            cy.edges().removeClass('selected').removeStyle();
            cy.nodes().removeClass('start-node').removeStyle();
            resetVisualization(cy, 'solution-btn', null);
            
            // Masquer la section du mode essai
            document.querySelector('#graph-section').style.display = 'none';
            // Afficher la section de choix initiale
            document.querySelector('.arbre-couvrant > div').style.display = 'block';
            
            // Nettoyer tous les anciens boutons dynamiques
            clearDynamicButtons();
        });
        
        // Add visualization button
        addDynamicButton('Voir la solution', 'solution-btn', () => {
            if (isAnimating) {
                const stateUpdate = stopVisualization('solution-btn', cy, null);
                isAnimating = stateUpdate.isAnimating;
                solutionMode = stateUpdate.solutionMode;
            } else {
                const visualizationState = startVisualization(cy, algorithm, generateSteps, 'solution-btn', null);
                solutionEdges = visualizationState.solutionEdges;
                solutionSteps = visualizationState.solutionSteps;
                currentStep = visualizationState.currentStep;
                solutionMode = visualizationState.solutionMode;
                isAnimating = visualizationState.isAnimating;
                currentAlgorithm = algorithmName;
                
                // Highlight start node for Prim algorithm
                if (algorithmName === 'Prim') {
                    const startNode = cy.nodes()[0];
                    startNode.addClass('start-node');
                    startNode.style({
                        'background-color': '#3498db',
                        'border-width': 3,
                        'border-color': '#2980b9'
                    });
                }
                
                animateNextStepWrapper();
            }
        });
        
        // Set solution mode
        solutionMode = true;
        currentAlgorithm = algorithmName;
        
        // Show solution info
        Swal.fire({
            icon: "info",
            title: `Solution selon l'algorithme de ${algorithmName}`,
            html: `
                <p>Vous êtes maintenant en mode solution pour l'algorithme de ${algorithmName}.</p>
                <p>Cliquez sur "Voir la solution" pour visualiser l'algorithme étape par étape.</p>
                <p>Cliquez sur "Retour" pour revenir au mode essai.</p>
            `,
        });
    }
    
    function animateNextStepWrapper() {
        if (!isAnimating) return;
        
        const updatedState = animateNextStep(
            { isAnimating, currentStep, solutionSteps, solutionMode },
            cy,
            () => {
                Swal.fire({
                    icon: "success",
                    title: "Solution complète !",
                    text: `Voici l'arbre couvrant de poids minimum selon l'algorithme de ${currentAlgorithm}. Nombre d'étapes : ${solutionSteps.length}`,
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
    
    // Generate solution steps for Prim algorithm
    function generatePrimSolutionSteps(cy, finalEdges) {
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
    
    // Generate solution steps for Kruskal algorithm
    function generateKruskalSolutionSteps(cy, finalEdges) {
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
    
    // Generate solution steps for Boruvka algorithm
    function generateBoruvkaSolutionSteps(cy, finalEdges) {
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