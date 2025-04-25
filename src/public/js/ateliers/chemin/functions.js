let cy;

export const initGraph = (containerId, options = {}) => {
    cy = cytoscape({
        container: document.getElementById(containerId),
        elements: [],
        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(id)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'background-color': '#fff',
                    'border-color': '#ccc',
                    'border-width': 1,
                    'width': 30,
                    'height': 30,
                    'font-size': 12,
                    'text-outline-color': '#fff',
                    'text-outline-width': 2,
                    'color': '#333',
                    'z-index': 10
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(weight)',
                    'font-size': 10,
                    'text-rotation': 'autorotate',
                    'text-margin-y': -10,
                    'text-background-color': '#FFFFFF',
                    'text-background-opacity': 0.7,
                    'text-background-padding': 2
                }
            },
            {
                selector: '.path-highlight',
                style: {
                    'line-color': 'var(--yellow)',
                    'target-arrow-color': 'var(--yellow)',
                    'width': 3,
                    'z-index': 5
                }
            },
            {
                selector: '.start-node',
                style: {
                    'background-color': 'var(--green)',
                    'border-color': 'var(--green)',
                    'color': '#fff',
                    'z-index': 11
                }
            },
            {
                selector: '.end-node',
                style: {
                    'background-color': 'var(--red)',
                    'border-color': 'var(--red)',
                    'color': '#fff',
                    'z-index': 11
                }
            },
            {
                selector: '.path-node',
                style: {
                    'background-color': 'var(--lightBlue)',
                    'border-color': 'var(--blue)',
                    'z-index': 12
                }
            },
            {
                selector: '.visited',
                style: {
                    'background-color': 'var(--lightBlue)',
                    'border-color': 'var(--blue)',
                    'z-index': 12
                }
            },
            {
                selector: '.considering',
                style: {
                    'background-color': 'var(--yellow)',
                    'border-color': 'var(--yellow)',
                    'z-index': 12
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