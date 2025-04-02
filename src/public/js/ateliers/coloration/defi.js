import { initGraph, loadPredefinedGraph, validateGraph, resetColorsDefi, rgbToHex } from './functions.js';
import { addDynamicButton, populateGraphSelect, startTimer, stopTimer } from '../../functions.js';

export const initDefiMode = () => {
    const cyDefi = initGraph('cy-predefined', { zoomingEnabled: false, panningEnabled: false, boxSelectionEnabled: false });

    let draggedColor = null;
    let selectedColorNode = null;
    let closestNode = null;
    const snapDistance = 50;
    const defaultColor = '#cccccc';
    let difficulty = "";

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
                })
                return;
            }

            setTimeout(async () => {
                difficulty = graphData.difficulty;

                addDynamicColorTokens(graphData.pastilleCounts, cyDefi);

                cyDefi.nodes().forEach((node) => {
                    if (!node.data('isColorNode')) {
                        node.lock();
                    }
                });

                startTimer();
            }, 100);
        } catch (error) {
            console.error("Erreur lors du chargement du graphe :", error.message);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: "Impossible de charger le graphe. Veuillez réessayer.",
            })
        }
    });

    addDynamicButton('Valider la Coloration', 'validate-graph-btn', () => validateGraph(cyDefi, difficulty));
    addDynamicButton('Réinitialiser la Coloration', 'reset-colors-btn', resetColorsDefi);

    function hasColoredNodes(cy) {
        return cy.nodes().some(node => {
            return !node.data('isColorNode') && rgbToHex(node.style('background-color')) !== '#cccccc';
        });
    }

    addDynamicButton("Je pense qu'il est impossible", 'impossible-btn', () => {
        const hasTriedColoring = hasColoredNodes(cyDefi);

        if (!hasTriedColoring || timeElapsed < 10) {
            Swal.fire({
                icon: 'warning',
                title: "Attention !",
                text: "Vous devez essayer de colorer le graphe avant de déclarer qu'il est impossible !",
            });
            return;
        }

        if (difficulty.trim().toLowerCase() === "impossible") {
            const timeElapsed = stopTimer();
            Swal.fire({
                icon: 'success',
                title: 'Bonne analyse !',
                html: `
                    <p>✅ Ce graphe est effectivement impossible à colorer en ${timeElapsed}.</p>
                    <hr>
                    <p>
                        <strong>Justification :</strong><br>
                        Imaginez que chaque sommet du graphe est une <strong>antenne de télécommunication</strong>, 
                        et que chaque arête représente une <strong>connexion</strong> entre elles.
                    </p>
                    <p>
                        <strong>📡 Règle importante :</strong><br>
                        Deux antennes reliées <strong>ne peuvent pas utiliser la même fréquence</strong> 
                        pour éviter les interférences.
                    </p>
                    <p>
                        ❌ Mais ici, il y a <strong>trop de connexions</strong> et <strong>pas assez de fréquences (couleurs)</strong>. 
                        Cela signifie qu'à un moment, une antenne devra utiliser une fréquence 
                        <strong>déjà prise par une voisine</strong>, ce qui cause une interférence et rend le réseau inutilisable.
                    </p>
                    <p>
                        🛑 <strong>C'est pour ça que ce graphe est impossible à colorer.</strong>
                    </p>
                `,
            });

        } else {
            Swal.fire({
                icon: 'error',
                title: "Non, ce graphe n'est pas impossible.",
                text: "Ce graphe peut être coloré correctement. Essayez encore !",
            });
        }
    });

    function addDynamicColorTokens(pastilleCounts, cy) {
        let currentXPosition = 50;

        if (!pastilleCounts) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: "Impossible de charger les pastilles. Veuillez réessayer.",
            })
            return;
        }

        Object.entries(pastilleCounts).forEach(([color, count]) => {
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

        cy.on('tap', 'node[isColorNode]', (evt) => {
            if (selectedColorNode) {
                selectedColorNode.style('border-color', '#000');
            }
            selectedColorNode = evt.target;
            selectedColorNode.style('border-color', '#FFD700');
        });

        cy.layout({ name: 'preset' }).run();
    }

    function findFreePositionX(cy) {
        const maxX = 1000;
        const step = 50;
        let x = 50;

        while (x < maxX) {
            const isOccupied = cy.nodes().some((node) => {
                const nodePos = node.position();
                return nodePos.x === x && nodePos.y === 50;
            });

            if (!isOccupied) {
                return x;
            }

            x += step;
        }

        console.error("No free position found on X-axis within the limit.");
        return null;
    }

    cyDefi.on('tap', 'node', (evt) => {
        const node = evt.target;
        const currentColor = rgbToHex(node.style('background-color'));

        if (!node.data('isColorNode') && selectedColorNode) {
            const selectedColor = selectedColorNode.style('background-color');

            if (currentColor === defaultColor) {
                node.style('background-color', selectedColor);

                cyDefi.remove(selectedColorNode);

                selectedColorNode = null;
            }
        }
    });

    cyDefi.on('grab', 'node', (evt) => {
        const node = evt.target;

        if (node.data('isColorNode')) {
            draggedColor = node.style('background-color');
            node.data('initialPosition', { x: node.position('x'), y: node.position('y') });
        }
    });

    cyDefi.on('mousemove', (evt) => {
        if (draggedColor) {
            let closest = null;
            let minDistance = Infinity;

            cyDefi.nodes().forEach((node) => {
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

    cyDefi.on('free', 'node', (evt) => {
        const colorNode = evt.target;

        if (closestNode && draggedColor) {
            const currentColor = rgbToHex(closestNode.style('background-color'));

            if (currentColor !== defaultColor) {
                const initialPosition = colorNode.data('initialPosition');
                if (initialPosition) colorNode.position(initialPosition);

            } else {
                closestNode.style('background-color', draggedColor);
                closestNode.style('border-color', '#666');
                cyDefi.remove(colorNode);
            }
        } else {
            const initialPosition = colorNode.data('initialPosition');
            if (initialPosition) colorNode.position(initialPosition);
        }

        draggedColor = null;
        closestNode = null;
    });

    cyDefi.on('cxttap', 'node', (evt) => {
        const node = evt.target;
        const currentColor = rgbToHex(node.style('background-color'));
        const isColorNode = node.data('isColorNode');

        if (currentColor === defaultColor || isColorNode) return;

        node.style('background-color', defaultColor);

        const x = findFreePositionX(cyDefi);

        if (x !== null) {
            cyDefi.add({
                group: 'nodes',
                data: { id: `color-${currentColor}-${Math.random()}`, isColorNode: true },
                position: { x, y: 50 },
                style: {
                    'background-color': currentColor,
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
    });
};