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
            { selector: 'node', style: { 'background-color': '#cccccc' } },
            { 
                selector: 'edge', 
                style: {
                    'line-color': '#666',
                    'width': 2,
                    'curve-style': 'unbundled-bezier',
                    'control-point-distance': 'data(controlPointDistance)',
                    'control-point-weight': 0.5
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
            throw new Error(`Erreur lors du chargement du graphe avec l'ID ${graphId}`);
        }

        const graphConfig = await response.json();

        if (graphConfig?.data) {

            graphConfig.data.nodes.forEach(node => {
                node.position.y += 80;
            });

            graphConfig.data.edges.forEach(edge => {
                edge.data.controlPointDistance = edge.data.controlPointDistance ?? 0;
            });

            cy.add(graphConfig.data);

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