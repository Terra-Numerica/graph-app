import { initGraph, loadPredefinedGraph, validateGraph, resetColorsDefi, rgbToHex } from './functions.js';
import { addDynamicButton, populateGraphSelect, startTimer, stopTimer } from '../../functions.js';

export const initDefiMode = () => {
    const cyDefi = initGraph('cy-predefined', { zoomingEnabled: false, panningEnabled: false, boxSelectionEnabled: false });

    cyDefi.resize();

    let draggedColor = null;
    let selectedColorNode = null;
    let closestNode = null;
    const snapDistance = 50;
    const defaultColor = '#cccccc';
    let difficulty = "";
    let graphName = "";

    populateGraphSelect();

    const predefinedGraphSelect = document.querySelector('#predefined-graph-select');

    predefinedGraphSelect.addEventListener('change', async () => {

        const graphId = predefinedGraphSelect.value;

        if (!graphId) return;

        try {
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
                graphName = graphData.name;

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

    addDynamicButton("Je pense qu'il est impossible", 'impossible-btn', () => {
        const totalNodes = cyDefi.nodes().filter(node => !node.data('isColorNode')).length;
        const coloredNodes = cyDefi.nodes().filter(node => {
            return !node.data('isColorNode') && rgbToHex(node.style('background-color')) !== '#cccccc';
        }).length;

        const percentage = (coloredNodes / totalNodes) * 100;

        if (percentage < 15) {
            Swal.fire({
                icon: 'warning',
                title: "Attention !",
                text: "Vous devez essayer de colorer au moins 15% du graphe avant de déclarer qu'il est impossible !",
            });
            return;
        }

        if (difficulty.trim().toLowerCase() === "impossible-preuve-facile" || difficulty.trim().toLowerCase() === "impossible-preuve-difficile") {

            const gameNumber = parseInt(graphName.split(' ')[1]);
            let explanation = "";

            stopTimer();

            switch (gameNumber) {
                case 12:
                    explanation = "Pour ce graphe, nous avons deux couleurs à disposition (rouge et bleu). Mais, on ne peut pas colorer ce graphe avec deux couleurs. En effet, ce graphe possède deux cycles impairs (i.e. avec un nombre impair de sommets) : celui formé par les sommets en vert clair, et celui formé par les sommets en jaune dans la figure ci-contre. En effet, sur un cycle impair, il est impossible de faire alterner deux couleurs.";
                    break;
                case 13:
                    explanation = "Observons que les trois sommets d'un triangle doivent être de couleurs différentes. Ainsi chacune des trois couleurs apparaît sur chaque triangle. Supposons que ce soit possible de colorer avec les jetons fournis. abc, efh et ihk sont des triangles. Comme on ne dispose que de deux jetons jaunes, l'un d'entre eux doit forcément être sur h, le seul sommet qui soit dans deux de ces triangles. De même, abc et bcf sont des triangles, donc le deuxième jeton jaune doit être sur b, le sommet commun à ces deux triangles. Une fois placés les deux jetons jaunes, il ne reste que deux couleurs. On peut bien colorer le graphe restant avec deux couleurs. Cependant une telle coloration est fixée à permutation des couleurs près. En effet, une fois que la couleur d'un sommet est fixée, celle de ses voisins doit être différente, celles des voisins de ses voisins la même et ainsi de suite. Ainsi une coloration en deux couleurs de ce graphe a forcément 5 sommets d'une couleur (ceux en gris dans la figure ci-dessus) et 8 de l'autre (ceux en blanc). Or ici nous disposons de 6 jetons rouges et 7 jetons bleus.";
                    break;
                case 16:
                    explanation = "Pour ce graphe, nous avons un seul jeton de couleur jaune. Celui-ci doit forcément être au sommet central qui est relié à tous les autres. Il reste ensuite les deux couleurs, rouge et bleu, pour colorer le cycle externe. Mais, cela est impossible car ce cycle est impair (il a 9 sommets), et qu'on ne peut donc pas faire alterner deux couleurs sur ce cycle.";
                    break;
                case 22:
                    explanation = "Ce graphe possède 4 triangles disjoints représentés en vert sur la figure ci-contre. Comme on ne dispose que de trois couleurs de jetons, chacun de ces triangles doit avoir un sommet de chaque couleur. Il faudrait donc au moins quatre jetons de chaque couleur pour avoir une solution, mais nous ne disposons que de trois jetons bleus.";
                    break;
                case 25:
                    explanation = "Dans ce problème, nous disposons de 6 jetons rouges. Il faut pouvoir placer ces jetons sur un ensemble indépendant du graphe, c'est-à-dire un ensemble dont aucune paire n'est reliée par une arête. Montrons que ceci est impossible. On peut tout d'abord facilement voir qu'aucun des deux sommets en gris sur la figure ci-contre ne peut être dans un tel ensemble indépendant car ils ont trop de voisins. Les sommets non-gris forment un enchaînement de dix sommets sur lesquels il est impossible de mettre 6 jetons rouges. En effet, deux sommets consécutifs ne peuvent pas être rouge, donc on peut placer les jetons rouges au mieux un sommet sur deux, soit 5 fois.";
                    break;
                case 38:
                    explanation = "Pour ce graphe, nous avons deux couleurs à disposition (rouge et bleu). On peut bien colorer ce graphe avec deux couleurs (voir la solution au problème 37). Cependant une telle coloration est fixée à permutation des couleurs près. En effet, une fois que la couleur d'un sommet est fixée, celle de ses voisins doit être différente, celles des voisins de ses voisins la même et ainsi de suite. Ainsi une coloration en deux couleurs de ce graphe a forcément 6 sommets d'une couleur et 4 de l'autre. Or ici nous disposons de 5 jetons de chaque couleur.";
                    break;
                case 39:
                    explanation = "Pour ce graphe, nous avons deux couleurs à disposition (rouge et bleu). Mais, on ne peut pas colorer ce graphe avec deux couleurs. En effet, ce graphe possède des cycles impairs (i.e. avec un nombre impair de sommets). Par exemple, celui formé par les sommets en vert clair dans la figure ci-contre. En effet, sur un cycle impair, il est impossible de faire alterner deux couleurs.";
                    break;
                default:
                    explanation = difficulty === "Impossible-preuve-facile"
                        ? "En essayant le graphe, vous venez de comprendre pourquoi il est dans la catégorie moyenne."
                        : "En essayant le graphe, vous venez de comprendre pourquoi il est dans la catégorie extrême.";
            }

            Swal.fire({
                icon: 'success',
                title: 'Bonne analyse !',
                text: explanation
            });

        } else {
            Swal.fire({
                icon: 'error',
                title: "Non, ce graphe n'est pas impossible.",
                text: "Ce graphe peut être coloré correctement. Essayez encore !",
            });
        }
    });

    const impossibleBtn = document.querySelector('#impossible-btn');
    impossibleBtn.disabled = true;
    impossibleBtn.style.cursor = 'not-allowed';
    impossibleBtn.style.opacity = '0.6';

    function checkColoredPercentage() {
        const totalNodes = cyDefi.nodes().filter(node => !node.data('isColorNode')).length;
        const coloredNodes = cyDefi.nodes().filter(node => {
            return !node.data('isColorNode') && rgbToHex(node.style('background-color')) !== '#cccccc';
        }).length;

        const percentage = (coloredNodes / totalNodes) * 100;

        if (percentage >= 15) {
            impossibleBtn.disabled = false;
            impossibleBtn.style.cursor = 'pointer';
            impossibleBtn.style.opacity = '1';
        } else {
            impossibleBtn.disabled = true;
            impossibleBtn.style.cursor = 'not-allowed';
            impossibleBtn.style.opacity = '0.6';
        }
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
                checkColoredPercentage();
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
                checkColoredPercentage();
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
        checkColoredPercentage();

        const x = findFreePositionX(cyDefi);

        if (x !== null) {
            cyDefi.add({
                group: 'nodes',
                data: { id: `color-${currentColor}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, isColorNode: true },
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
                    data: { id: `color-${color}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, isColorNode: true },
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

        //cy.layout({ name: 'preset' }).run();
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
};