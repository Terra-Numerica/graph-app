export const DOM_ELEMENTS = {
    modeLibreBtn: document.querySelector('#mode-libre-btn'),
    modeDefiBtn: document.querySelector('#mode-defi-btn'),
    modeCreationBtn: document.querySelector('#mode-creation-btn'),

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
    Défi: `
		<h3>🎯 Objectif</h3>

        <ul>
			<li>Deux sommets adjacents ne doivent jamais avoir la même couleur.</li>
			<li>Vous possédez un nombre limité de pastilles que vous devez placer correctement.</li>
		</ul>

		<h3>🛠️ Comment jouer à la <strong>Coloration d'un Graphe</strong></h3>
        <ul>
			<li>Sélectionnez un graphe prédéfini dans le menu déroulant.</li>
			<li>Attrapez une pastille de couleur, faites-la glisser vers un sommet et relâchez-la pour lui attribuer cette couleur.</li>
			<li>Coloriez entièrement le graphe en respectant les règles de coloration.</li>
			<li>Quand vous pensez avoir réussi, cliquez sur le bouton <strong>Valider la Coloration</strong> pour vérifier si le graphe est correctement coloré.</li>
		</ul>

        <h3>🔧 Fonctionnalités</h3>
		<ul>
			<li>Si vous pensez avoir fait une erreur, vous pouvez faire un clic droit sur un sommet pour lui retirer sa couleur.</li>
			<li>Si vous voulez recommencer, cliquez sur <strong>Réinitialiser la Coloration</strong> pour remettre tous les sommets dans leur état initial.</li>
		</ul>`,
    Libre: `
		<h3>🎯 Objectif</h3>
		<ul>
			<li>Deux sommets adjacents ne doivent jamais avoir la même couleur.</li>
			<li>Vous possédez un nombre limité de pastilles que vous devez placer correctement.</li>
		</ul>

		<h3>🛠️ Comment jouer à la <strong>Coloration d'un Graphe</strong></h3>
		<ul>
			<li>Sélectionnez un graphe prédéfini dans le menu déroulant.</li>
			<li>Attrapez une pastille de couleur, faites-la glisser vers un sommet et relâchez-la pour lui attribuer cette couleur.</li>
			<li>Coloriez entièrement le graphe en respectant les règles de coloration.</li>
			<li>Quand vous pensez avoir réussi, cliquez sur le bouton <strong>Valider la Coloration</strong> pour vérifier si le graphe est correctement coloré.</li>
			<li>Mettez-vous au défi d'utiliser le moins de couleurs possible pour colorer le graphe !</li>
		</ul>

		<h3>🔧 Fonctionnalités</h3>
		<ul>
			<li>Si vous pensez avoir fait une erreur, vous pouvez faire un clic droit sur un sommet pour lui retirer sa couleur.</li>
			<li>Si vous voulez recommencer, cliquez sur <strong>Réinitialiser la Coloration</strong> pour remettre tous les sommets dans leur état initial.</li>
		</ul>`,
    Création: `
        <h3>🎯 Objectif</h3>
        <ul>
            <li>Créer un graphe et le colorer.</li>
            <li>Deux sommets adjacents ne doivent jamais avoir la même couleur.</li>
            <li>Vous possédez un nombre limité de pastilles que vous devez placer correctement.</li>
        </ul>

        <h3>🛠️ Comment créer un <strong>Graphe</strong></h3>
        <ul>
            <li>Cliquez sur le bouton <strong>Ajouter un sommet</strong> pour ajouter un sommet au graphe.</li>
            <li>Placez le sommet en le faisant glisser là où vous le souhaitez.</li>
            <li>En faisant un clic gauche sur un sommet puis un autre clic gauche sur un autre sommet, vous pouvez ajouter une arête entre les deux sommets.</li>
            <li>Dès que vous pensez avoir terminé de créer votre graphe, cliquez sur le bouton <strong>Essayer le Graphe</strong> pour commencer à le colorer.</li>
        </ul>

        <h3>🛠️ Comment jouer à la <strong>Coloration d'un Graphe</strong></h3>
        <ul>
            <li>Attrapez une pastille de couleur, faites-la glisser vers un sommet et relâchez-la pour lui attribuer cette couleur.</li>
            <li>Coloriez entièrement le graphe en respectant les règles de coloration.</li>
            <li>Quand vous pensez avoir réussi, cliquez sur le bouton <strong>Valider la Coloration</strong> pour vérifier si le graphe est correctement coloré.</li>
            <li>Mettez-vous au défi d'utiliser le moins de couleurs possible pour colorer le graphe !</li>
        </ul>
        
        <h3>🔧 Fonctionnalités</h3>
        <ul>
            <li>Lors de la création, si vous pensez que votre graphe n'est pas bien organisé, vous pouvez le réarranger en cliquant sur <strong>Réarranger le graphe</strong>.</li>
            <li>Si vous pensez avoir fait une erreur, vous pouvez faire un clic droit sur un sommet pour lui retirer sa couleur.</li>
            <li>Si vous voulez recommencer, cliquez sur <strong>Réinitialiser la Coloration</strong> pour remettre tous les sommets dans leur état initial.</li>
        </ul>`,
};