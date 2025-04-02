import { populateGraphSelect, addDynamicButton } from '../../functions.js';
import { loadPredefinedGraph, initGraph } from "./functions.js";
import { primAlgorithm } from './prim.js';

let cy;

export const initArbreCouvrant = () => {
    cy = initGraph('cy-predefined', {
        style: [
            {
                selector: 'edge',
                style: {
                    'line-color': '#aaa',
                    'width': 3,
                    'curve-style': 'bezier'
                }
            },
            {
                selector: 'edge.selected',
                style: {
                    'line-color': '#33cc33',
                    'width': 6
                }
            }
        ]
    });

    populateGraphSelect();

    const select = document.querySelector('#predefined-graph-select');
    select.addEventListener('change', async () => {
        const graphId = select.value;
        const graphData = await loadPredefinedGraph(graphId);

        if (!graphData || !graphData.data) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Impossible de charger le graphe.',
            });
            return;
        }

        cy.add(graphData.data);
        // cy.layout({ name: 'cose' }).run();

        attachEdgeSelection();
    });

    addDynamicButton('Terminer', 'finish-btn', () => validateSpanningTree(cy));
    addDynamicButton('Voir la solution', 'solution-btn', () => showPrimSolution(cy));
};

function attachEdgeSelection() {
    cy.edges().on('tap', function (evt) {
        const edge = evt.target;
        edge.toggleClass('selected');
    });
}

function validateSpanningTree(cy) {
    const selectedEdges = cy.edges('.selected');
    const nodes = cy.nodes();
    const visited = new Set();
    const adj = {};

    selectedEdges.forEach(edge => {
        const source = edge.source().id();
        const target = edge.target().id();

        if (!adj[source]) adj[source] = [];
        if (!adj[target]) adj[target] = [];

        adj[source].push(target);
        adj[target].push(source);
    });

    if (selectedEdges.length !== nodes.length - 1) {
        Swal.fire({
            icon: 'error',
            title: 'Incorrect',
            text: 'Un arbre couvrant..',
        });
        return;
    }

    function dfs(nodeId) {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        (adj[nodeId] || []).forEach(neighbor => dfs(neighbor));
    }

    dfs(nodes[0].id());

    if (visited.size !== nodes.length) {
        Swal.fire({
            icon: 'error',
            title: 'Incorrect',
            text: 'Le sous-graphe n\'est pas connexe.',
        });
        return;
    }

    Swal.fire({
        icon: 'success',
        title: 'Bravo !',
        text: 'Vous avez trouvé un arbre couvrant valide 🎉',
    });
}

function showPrimSolution(cy) {

    const result = primAlgorithm(cy);

    console.log(result);

    if (!result) {
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de calculer la solution.',
        });
        return;
    }

    cy.edges().removeClass('selected');
    result.forEach(edgeId => {
        const edge = cy.getElementById(edgeId);
        if (edge) edge.addClass('selected');
    });
}

initArbreCouvrant();