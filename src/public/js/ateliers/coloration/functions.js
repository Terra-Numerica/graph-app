import { colors } from "../../constants.js";
import { stopTimer } from "../../functions.js";

let cy;

export const initGraph = (containerId, options = {}) => {

    if (cy !== undefined) cy = undefined;

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

export const rgbToHex = (rgb) => {
    const result = rgb.match(/\d+/g).map((num) => parseInt(num, 10).toString(16).padStart(2, '0'));
    return `#${result.join('')}`;
}

export const validateGraph = (cy, difficulty) => {
    const defaultColor = '#cccccc';
    let isCompleted = true;
    let isValid = true;

    cy.nodes().forEach((node) => {
        const nodeColor = node.style('background-color');
        let hexNodeColor = '';

        if (nodeColor.startsWith('rgb')) {
            hexNodeColor = rgbToHex(nodeColor);
        }

        if (hexNodeColor === defaultColor) isCompleted = false;

        node.connectedEdges().forEach((edge) => {
            const neighbor = edge.source().id() === node.id() ? edge.target() : edge.source();
            if (neighbor.style('background-color') === nodeColor) {
                isValid = false;
            }
        });
    });

    if (!isCompleted) {
        Swal.fire({
            icon: "warning",
            title: "Attention !",
            text: "Le graphe n'est pas entièrement coloré.",
        });
    } else if (!isValid) {
        Swal.fire({
            icon: "error",
            title: "Erreur !",
            text: "Deux sommets adjacents ont la même couleur.",
        });
    } else {
        const timeElapsed = stopTimer();
        Swal.fire({
            icon: "success",
            title: "Félicitations !",
            text: `Bravo ! La coloration est valide en ${timeElapsed}.`,
        });
    }
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
                name: graphConfig.name,
                data: graphConfig.data,
                optimalColoring: graphConfig.optimalColoring || null,
                pastilleCounts: graphConfig.pastilleCounts || null,
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

export const addNode = () => {
    const id = `n${cy.nodes().length + 1}`;
    cy.add({ data: { id: id } });
    cy.layout({ name: 'grid' }).run();
};

export const addEdge = () => {
    const sourceId = prompt("Entrez l'ID du sommet source :");
    const targetId = prompt("Entrez l'ID du sommet cible :");

    if (cy.$id(sourceId).length && cy.$id(targetId).length && sourceId !== targetId) {
        cy.add({ data: { source: sourceId, target: targetId } });
        cy.layout({ name: 'grid' }).run();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: "IDs invalides ou identiques. Veuillez réessayer.",
        });
    }
};

export const resetGraph = () => {
    Swal.fire({
        title: "Confirmer la suppression",
        text: `Voulez-vous vraiment rénitialiser le graphe ?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, supprimer",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
    }).then((result) => {
        if (result.isConfirmed) {
            element.remove();
            resetNodeSelection();
            Swal.fire("Graphe réinitialisé !", "", "success");
        }
    });
};

export const resetColorsLibre = () => {
    cy.nodes().forEach((node) => {
        if (!node.data('isColorNode')) {
            node.style('background-color', '#cccccc');
        }
    });
};

export const resetColorsDefi = () => {
    const colorCounts = {};
    const unusedColors = {};

    cy.nodes().forEach((node) => {
        if (!node.data('isColorNode')) {
            const currentColor = rgbToHex(node.style('background-color'));
            if (currentColor !== '#cccccc') {
                colorCounts[currentColor] = (colorCounts[currentColor] || 0) + 1;
            }
            node.style('background-color', '#cccccc');
        } else {
            const color = rgbToHex(node.style('background-color'));
            unusedColors[color] = (unusedColors[color] || 0) + 1;
        }
    });

    cy.nodes().filter(node => node.data('isColorNode')).forEach(node => cy.remove(node));

    let currentXPosition = 50;

    const allColors = { ...colorCounts };

    Object.entries(unusedColors).forEach(([color, count]) => {
        allColors[color] = (allColors[color] || 0) + count;
    });

    Object.entries(allColors).forEach(([color, count]) => {
        for (let i = 0; i < count; i++) {
            cy.add({
                group: 'nodes',
                data: { id: `color-${color}-${i}`, isColorNode: true },
                position: { x: currentXPosition, y: 50 },
                style: {
                    'background-color': color,
                    'width': 30,
                    'height': 30,
                    'label': '',
                    'border-width': 2,
                    'border-color': '#000',
                    'shape': 'ellipse',
                },
                locked: false,
            });
            currentXPosition += 50;
        }
    });

    cy.layout({ name: 'preset' }).run();
};

export const generateRandomColors = (cy) => {
    const numNodes = cy.nodes().length;

    let deltaMax = 0;
    cy.nodes().forEach((node) => {
        const degree = node.degree();
        if (degree > deltaMax) {
            deltaMax = degree;
        }
    });

    const numColors = Math.max(deltaMax + 1, Math.round((numNodes + (deltaMax + 1)) / 2));

    const selectedColors = colors.slice(0, Math.min(numColors, colors.length));

    return selectedColors.map((color) => ({
        color,
        count: Math.ceil(numNodes / selectedColors.length),
    }));
};

export const generateBalancedColors = (cy, optimalColorCount) => {
    const nodes = cy.nodes();
    const numNodes = nodes.length;

    let deltaMax = 0;
    nodes.forEach((node) => {
        const degree = node.degree();
        if (degree > deltaMax) {
            deltaMax = degree;
        }
    });

    const numColors = optimalColorCount && optimalColorCount > 0
        ? optimalColorCount
        : Math.max(deltaMax + 1, Math.round((numNodes + (deltaMax + 1)) / 2));

    const availableColors = ['#FF5733', '#3498DB', '#2ECC71', '#F1C40F', '#9400D3', '#2A233E', '#34495E', '#00FFFF', '#1A182D']
        .slice(0, Math.min(numColors, 9));

    const colorCounts = new Map(availableColors.map(color => [color, 0]));
    const nodeColors = new Map();

    function getAvailableColor(node) {
        const usedColors = new Set();
        node.connectedEdges().forEach(edge => {
            const neighbor = edge.source().id() === node.id() ? edge.target() : edge.source();
            if (neighbor.length > 0 && nodeColors.has(neighbor[0].id())) {
                usedColors.add(nodeColors.get(neighbor[0].id()));
            }
        });

        let leastUsedColor = null;
        let minCount = Infinity;

        for (let color of availableColors) {
            if (!usedColors.has(color) && colorCounts.get(color) < minCount) {
                leastUsedColor = color;
                minCount = colorCounts.get(color);
            }
        }

        return leastUsedColor || availableColors[0];
    }

    const sortedNodes = nodes.sort((a, b) => b.degree() - a.degree());
    sortedNodes.forEach(node => {
        const color = getAvailableColor(node);
        nodeColors.set(node.id(), color);
        colorCounts.set(color, colorCounts.get(color) + 1);
    });

    return Array.from(colorCounts.entries()).map(([color, count]) => ({
        color,
        count
    }));
};

export const isGraphConnected = (cy) => {
    if (cy.nodes().length === 0) return false;

    let visited = new Set();
    let stack = [cy.nodes()[0]];
    while (stack.length > 0) {
        let node = stack.pop();
        if (!visited.has(node.id())) {
            visited.add(node.id());
            let neighbors = node.neighborhood('node');
            neighbors.forEach(n => {
                if (!visited.has(n.id())) {
                    stack.push(n);
                }
            });
        }
    }

    return visited.size === cy.nodes().length;
};