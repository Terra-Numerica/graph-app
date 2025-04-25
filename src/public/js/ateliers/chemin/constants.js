export const DOM_ELEMENTS = {
    modeDijkstraBtn: document.querySelector('#mode-dijkstra-btn'),
    modeBellmanBtn: document.querySelector('#mode-bellman-btn'),
    modeFloydBtn: document.querySelector('#mode-floyd-btn'),
    graphSelect: document.querySelector('#graph-select'),
    cyContainer: document.querySelector('#cy-predefined'),
    startBtn: document.querySelector('#start-btn'),
    resetBtn: document.querySelector('#reset-btn'),
    stepBtn: document.querySelector('#step-btn'),
    timerDisplay: document.querySelector('#timer-display'),
    infoContainer: document.querySelector('#info-container'),
    infoText: document.querySelector('#info-text')
}; 

export const MODE_INFO_TEXTS = {
    Dijkstra: `
        <h3>Algorithme de Dijkstra</h3>
    `,
    BellmanFord: `
        <h3>Algorithme de Bellman-Ford</h3>
    `,
    FloydWarshall: `
        <h3>Algorithme de Floyd-Warshall</h3>
    `
};