export const DOM_ELEMENTS = {
    modePrimBtn: document.querySelector('#mode-prim-btn'),
    modeKruskalBtn: document.querySelector('#mode-kruskal-btn'),
    modeBoruvkaBtn: document.querySelector('#mode-boruvka-btn'),

    graphSection: document.querySelector('#graph-section'),
    modeTitle: document.querySelector('#mode-title'),
    dynamicButtons: document.querySelector('#dynamic-buttons'),
    selectElement: document.querySelector('#graph-select'),
    infoContainer: document.querySelector('#info-container'),
    infoBtn: document.querySelector('#info-btn'),
    infoSection: document.querySelector('#info-section'),
    infoText: document.querySelector('#info-text'),
    closeInfoBtn: document.querySelector('#close-info-btn'),
};

export const MODE_INFO_TEXTS = {
    Prim: `
        <ol>
            <li>Choisissez un sommet de départ dans le graphe.</li>
            <li>À chaque étape, sélectionnez l'arête de poids minimal qui relie un sommet déjà dans l'arbre à un sommet qui n'y est pas encore.</li>
            <li>Répétez jusqu'à ce que tous les sommets soient connectés.</li>
            <li>L'arbre résultant est l'arbre couvrant minimal.</li>
        </ol>
    `,
    Kruskal: `
        <ol>
            <li>Triez toutes les arêtes du graphe par ordre croissant de poids.</li>
            <li>À chaque étape, sélectionnez l'arête de poids minimal qui ne crée pas de cycle.</li>
            <li>Répétez jusqu'à ce que tous les sommets soient connectés.</li>
            <li>L'arbre résultant est l'arbre couvrant minimal.</li>
        </ol>
    `,
    Boruvka: `
        <ol>
            <li>À chaque étape, chaque composante connexe sélectionne son arête de poids minimal vers une autre composante.</li>
            <li>Les arêtes sélectionnées sont ajoutées à l'arbre couvrant.</li>
            <li>Les composantes sont fusionnées en une seule.</li>
            <li>Répétez jusqu'à ce qu'il ne reste qu'une seule composante.</li>
            <li>L'arbre résultant est l'arbre couvrant minimal.</li>
        </ol>
    `
};