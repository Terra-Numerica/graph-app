import { initGraph, loadPredefinedGraph, resetColorsLibre, rgbToHex } from './functions.js';
import { addDynamicButton, populateGraphSelect, startTimer, stopTimer } from '../../functions.js';
import { colors } from '../../constants.js';

export const initLibreMode = () => {
    const cyLibre = initGraph('cy-predefined', { zoomingEnabled: false, panningEnabled: false, boxSelectionEnabled: false });

    cyLibre.resize();

    let draggedColor = null;
    let closestNode = null;
    const snapDistance = 50;
    const defaultColor = '#cccccc';
    let optimalColorCount = null;
    let difficulty = "";

    populateGraphSelect()

    const predefinedGraphSelect = document.querySelector('#predefined-graph-select');

    predefinedGraphSelect.addEventListener('change', async () => {

        try {
            const graphId = predefinedGraphSelect.value;

            if (!graphId) return;

            const graphData = await loadPredefinedGraph(graphId);

            if (!graphData || !graphData.data) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: "Impossible de charger le graphe. Veuillez réessayer.",
                })
                return;
            }

            optimalColorCount = graphData.optimalColoring;
            difficulty = graphData.difficulty;

            setTimeout(() => {

                const existingColors = Object.keys(graphData.pastilleCounts);

                const availableColors = colors.filter(c => !existingColors.includes(c));

                const numRandomColors = Math.min(Math.floor(Math.random() * 3) + 1, availableColors.length);

                const shuffled = availableColors.sort(() => 0.5 - Math.random());

                const randomColors = shuffled.slice(0, numRandomColors);

                const finalColors = existingColors.concat(randomColors);
                
                cyLibre.nodes().forEach((node) => {
                    if (!node.data('isColorNode')) {
                        node.lock();
                    }
                });

                addInfiniteColorTokens(finalColors, cyLibre);

                startTimer();
            }, 100);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: "Impossible de charger le graphe. Veuillez réessayer.",
            })
        };
    });

    addDynamicButton('Valider la Coloration', 'validate-graph-btn', () => validateGraphLibre(cyLibre, optimalColorCount));
    addDynamicButton('Réinitialiser la Coloration', 'reset-colors-btn', resetColorsLibre);

    function addInfiniteColorTokens(pastilleCounts, cy) {

        let currentXPosition = 50;

        pastilleCounts.forEach((color) => {
            createColorToken(color, currentXPosition, 50, cy);
            currentXPosition += 50;
        });

        //setTimeout(() => cy.layout({ name: 'preset' }).run(), 0);
    };

    function createColorToken(color, x, y, cy) {

        const token = cy.add({
            group: 'nodes',
            data: { id: `color-${color}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, isColorNode: true },
            position: { x, y },
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

        token.on('grab', () => {
            draggedColor = color;
            createColorToken(color, x, y, cy);
        });
    }

    cyLibre.on('free', 'node', (evt) => {
        const colorNode = evt.target;

        if (closestNode && draggedColor) {
            const currentColor = rgbToHex(closestNode.style('background-color'));

            if (currentColor === defaultColor) {
                closestNode.style('background-color', draggedColor);
                closestNode.style('border-color', '#666');
                cyLibre.remove(colorNode);
            }
        } else {
            cyLibre.remove(colorNode);
        }

        draggedColor = null;
        closestNode = null;
    });

    cyLibre.on('mousemove', (evt) => {
        if (draggedColor) {
            let closest = null;
            let minDistance = Infinity;

            cyLibre.nodes().forEach((node) => {
                if (!node.data('isColorNode')) {
                    const distance = Math.sqrt(
                        Math.pow(node.position('x') - evt.position.x, 2) +
                        Math.pow(node.position('y') - evt.position.y, 2)
                    );

                    if (distance < minDistance && distance < snapDistance) {
                        minDistance = distance;
                        closest = node;
                    }
                }
            });

            if (closest) {
                closestNode = closest;
                closestNode.style('border-color', '#FFD700');
            } else if (closestNode) {
                closestNode.style('border-color', '#666');
                closestNode = null;
            }
        }
    });

    cyLibre.on('cxttap', 'node', (evt) => {
        const node = evt.target;
        const currentColor = node.style('background-color');
        const isColorNode = node.data('isColorNode');

        if (currentColor === defaultColor || isColorNode) return;

        node.style('background-color', defaultColor);
    });

    cyLibre.on('tapdragout', 'node', (evt) => {
        if (!closestNode && draggedColor) {
            cyLibre.remove(evt.target);
        }
    });
};

function validateGraphLibre(cy, optimalColorCount) {
    const defaultColor = '#cccccc';
    let isCompleted = true;
    let isValid = true;
    let usedColors = new Set();

    cy.nodes().forEach((node) => {
        if (node.data('isColorNode')) return;

        const nodeColor = node.style('background-color');
        let hexNodeColor = '';

        if (nodeColor.startsWith('rgb')) {
            hexNodeColor = rgbToHex(nodeColor);
        }

        if (hexNodeColor === defaultColor) {
            isCompleted = false;
        } else {
            usedColors.add(hexNodeColor);
        }

        node.connectedEdges().forEach((edge) => {
            const neighbor = edge.source().id() === node.id() ? edge.target() : edge.source();
            if (!neighbor.data('isColorNode') && neighbor.style('background-color') === nodeColor) {
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
        if (usedColors.size > optimalColorCount) {
            Swal.fire({
                icon: "success",
                title: "Félicitations !",
                text: `Vous avez réussi à colorer le graphe en ${timeElapsed} ! Il existe une solution qui utilise moins de couleurs. Allez-vous réussir à la trouver ?`,
            });
        } else {
            Swal.fire({
                icon: "success",
                title: "Félicitations !",
                text: `Vous avez réussi à colorer le graphe en ${timeElapsed} ! Vous avez trouvé la solution qui utilise le nombre minimum de couleurs !`,
            });
        }
    }
}