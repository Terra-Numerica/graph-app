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
        <h3>🎯 Objectif</h3>
        <ul>
            <li>Trouver l'arbre couvrant minimal du graphe en utilisant l'algorithme de Prim.</li>
            <li>L'arbre couvrant minimal est un sous-graphe qui connecte tous les sommets avec un poids total minimal.</li>
        </ul>

        <h3>🛠️ Comment jouer avec l'algorithme de <strong>Prim</strong></h3>
        <ul>
            <li>Sélectionnez un graphe prédéfini dans le menu déroulant.</li>
            <li>Un sommet de départ est choisi automatiquement dans le graphe.</li>
            <li>À chaque étape, sélectionnez l'arête de poids minimal qui relie un sommet qui n'est pas encore relié à l'arbre.</li>
            <li>Répétez jusqu'à ce que tous les sommets soient connectés.</li>
            <li>L'arbre résultant est l'arbre couvrant minimal.</li>
        </ul>

        <h3>🔧 Fonctionnalités</h3>
        <ul>
            <li>Si vous voulez voir la solution, cliquez sur <strong>Voir la solution</strong>.</li>
            <li>Si vous pensez avoir fait une erreur, vous pouvez faire un clic droit sur une arête pour la retirer de l'arbre.</li>
            <li>Si vous voulez recommencer, cliquez sur <strong>Réinitialiser</strong> pour remettre tous les arêtes dans leur état initial.</li>
        </ul>
    `,
    Kruskal: `
        <h3>🎯 Objectif</h3>
        <ul>
            <li>Trouver l'arbre couvrant minimal du graphe en utilisant l'algorithme de Kruskal.</li>
            <li>L'arbre couvrant minimal est un sous-graphe qui connecte tous les sommets avec un poids total minimal.</li>
        </ul>

        <h3>🛠️ Comment jouer avec l'algorithme de <strong>Kruskal</strong></h3>
        <ul>
            <li>Sélectionnez un graphe prédéfini dans le menu déroulant.</li>
            <li>Sélectionnez une par une les arrêtes de poids minimal qui ne créent pas de cycle.</li>
            <li>Quand vous avez sélectionné toutes les arrêtes, l'arbre couvrant minimal est formé.</li>
        </ul>

        <h3>🔧 Fonctionnalités</h3>
        <ul>
            <li>Si vous voulez voir la solution, cliquez sur <strong>Voir la solution</strong>.</li>
            <li>Si vous pensez avoir fait une erreur, vous pouvez faire un clic droit sur une arête pour la retirer de l'arbre.</li>
            <li>Si vous voulez recommencer, cliquez sur <strong>Réinitialiser</strong> pour remettre tous les arêtes dans leur état initial.</li>
        </ul>
    `,
    Boruvka: `
        <h3>🎯 Objectif</h3>
        <ul>
            <li>Trouver l'arbre couvrant minimal du graphe en utilisant l'algorithme de Boruvka.</li>
            <li>L'arbre couvrant minimal est un sous-graphe qui connecte tous les sommets avec un poids total minimal.</li>
        </ul>

        <h3>🛠️ Comment jouer avec l'algorithme de <strong>Boruvka</strong></h3>
        <ul>
            <li>Sélectionnez un graphe prédéfini dans le menu déroulant.</li>
            <li>Sélectionnez une par une les arrêtes de poids minimal qui ne créent pas de cycle.</li>
            <li>Quand vous avez sélectionné toutes les arrêtes, l'arbre couvrant minimal est formé.</li>
        </ul>

        <h3>🔧 Fonctionnalités</h3>
        <ul>
            <li>Si vous voulez voir la solution, cliquez sur <strong>Voir la solution</strong>.</li>
            <li>Si vous pensez avoir fait une erreur, vous pouvez faire un clic droit sur une arête pour la retirer de l'arbre.</li>
            <li>Si vous voulez recommencer, cliquez sur <strong>Réinitialiser</strong> pour remettre tous les arêtes dans leur état initial.</li>
        </ul>
    `
};