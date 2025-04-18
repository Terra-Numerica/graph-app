import { addDynamicButton, clearDynamicButtons, createRandomNode, highlightNode, resetHighlight, startTimer } from '../../functions.js';
import { initGraph, validateGraph, resetColorsLibre, rgbToHex } from './functions.js';
import { colors } from '../../constants.js';

const colorCountInput = document.getElementById('color-count');

export const initCreationMode = () => {

    const cyCustom = initGraph('cy-predefined', { zoomingEnabled: false, panningEnabled: false, boxSelectionEnabled: false });
    cyCustom.resize();

    const defaultColor = '#cccccc';

    let firstNode = null;

    colorCountInput.addEventListener('input', function () {
        let value = this.value.trim();

        if (value === '') {
            this.value = '';
            return;
        }

        let number = parseInt(value, 10);

        if (number < 1) {
            this.value = 1;
        } else if (number > 12) {
            this.value = 12;
        }
    });

    addDynamicButton('Ajouter un sommet', 'add-node-btn', () => {
        createRandomNode(cyCustom);
    });

    addDynamicButton('Réinitialiser le graphe', 'reset-graph-btn', () => {
        Swal.fire({
            title: "Confirmer la suppression",
            text: "Voulez-vous vraiment réinitialiser le graphe ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Oui, réinitialiser",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        }).then((result) => {
            if (result.isConfirmed) {
                cyCustom.elements().remove();
                firstNode = null;
                Swal.fire("Graphe réinitialisé !", "", "success");
            }
        });
    });

    addDynamicButton('Réarranger le graphe', 'rearrange-graph-btn', () => {
        const layoutOptions = {
            name: 'circle',
            fit: true,
            padding: 30,
            avoidOverlap: true,
        };
        cyCustom.layout(layoutOptions).run();
    });

    addDynamicButton('Essayer le graphe', 'try-graph-btn', () => {
        clearDynamicButtons();
        const cyLibre = initGraph('cy-predefined', { zoomingEnabled: false, panningEnabled: false, boxSelectionEnabled: false });

        cyLibre.json(cyCustom.json());

        const minY = Math.min(...cyLibre.nodes().map(node => node.position('y')));
        const maxY = Math.max(...cyLibre.nodes().map(node => node.position('y')));
        const minSafeY = 120;
        const container = document.getElementById('cy-predefined');

        let offsetY = 0;

        if (minY < minSafeY) {
            offsetY = minSafeY - minY;
        }

        cyLibre.nodes().forEach(node => {
            node.position({
                x: node.position('x'),
                y: node.position('y') + offsetY
            });
        });

        const grapheHeight = maxY + offsetY + 100;

        if (grapheHeight > container.clientHeight) {
            container.style.height = `${grapheHeight}px`;
        }

        cyLibre.nodes().forEach((node) => {
            if (!node.data('isColorNode')) {
                node.lock();
            }
        });

        addDynamicButton('Valider la Coloration', 'validate-graph-btn', () => validateGraph(cyLibre, null));
        addDynamicButton('Réinitialiser la Coloration', 'reset-colors-btn', () => resetColorsLibre(cyLibre));

        let colorsConfig;
        const colorCount = colorCountInput.value ? parseInt(colorCountInput.value, 10) : null;

        if (!colorCount) colorsConfig = colors.splice(0, 12);
        else colorsConfig = colors.slice(0, colorCount);

        let currentXPosition = 50;
        const snapDistance = 50;
        let draggedColor = null;
        let closestNode = null;

        colorsConfig.forEach((color) => {
            createColorToken(color, currentXPosition, 50, cyLibre);
            currentXPosition += 50;
        });

        cyLibre.layout({ name: 'preset' }).run();
        startTimer();

        cyLibre.on('free', 'node', (evt) => {
            const colorNode = evt.target;

            if (closestNode && draggedColor) {
                closestNode.style('background-color', draggedColor);
                closestNode.style('border-color', '#666');
            }

            cyLibre.remove(colorNode);
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

        cyLibre.on('tapdragout', 'node', (evt) => {
            if (!closestNode && draggedColor) {
                cyLibre.remove(evt.target);
            }
        });

        cyLibre.on('tap', (evt) => {
            if (!evt.target.data('isColorNode')) {
                closestNode = null;
            }
        });

        cyLibre.on('cxttap', 'node', (evt) => {
            const node = evt.target;
            const currentColor = node.style('background-color');

            if (!node.data('isColorNode') && rgbToHex(currentColor) !== defaultColor) {
                node.style('background-color', defaultColor);
            }
        });

        cyLibre.on('grab', 'node', (evt) => {
            const node = evt.target;
            if (node.data('isColorNode')) {
                draggedColor = node.style('background-color');
                createColorToken(draggedColor, node.position('x'), node.position('y'), cyLibre);
            }
        });
    });

    document.addEventListener("contextmenu", (event) => event.preventDefault());

    cyCustom.container().addEventListener('contextmenu', (evt) => evt.preventDefault());

    cyCustom.on('tap', 'node', (evt) => {
        const clickedNode = evt.target;

        if (!firstNode) {
            firstNode = clickedNode;
            highlightNode(firstNode);
        } else {
            if (clickedNode !== firstNode) {
                cyCustom.add({
                    group: 'edges',
                    data: { source: firstNode.id(), target: clickedNode.id(), controlPointDistance: 0 },
                });
            }

            resetHighlight(firstNode);
            firstNode = null;
        }
    });

    cyCustom.on('tap', (evt) => {
        if (evt.target === cyCustom) {
            if (firstNode) {
                resetHighlight(firstNode);
                firstNode = null;
            }
        }
    });

    cyCustom.on('cxttap', 'node, edge', (evt) => {
        const target = evt.target;
        Swal.fire({
            title: "Confirmer la suppression",
            text: `Voulez-vous vraiment supprimer ${target.isNode() ? 'ce sommet' : 'cette arête'} ?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Oui, supprimer",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        }).then((result) => {
            if (result.isConfirmed) {
                target.remove();
                Swal.fire("Supprimé !", "L'élément a été supprimé.", "success");
            }
        });
    });
};

const createColorToken = (color, x, y, cy) => {
    cy.add({
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
}