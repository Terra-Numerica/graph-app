import { initDefiMode } from './defi.js';
import { initLibreMode } from './libre.js';
import { initCreationMode } from './creation.js';
import { MODE_INFO_TEXTS, DOM_ELEMENTS } from './constants.js';
import { clearDynamicButtons, stopTimer } from '../../functions.js';

document.addEventListener('DOMContentLoaded', () => {
	const graphSection = document.querySelector('#graph-section');
	const modeTitle = document.querySelector('#mode-title');
	const selectElement = document.querySelector('#graph-select');
	const infoContainer = document.querySelector('#info-container');
	const infoBtn = document.querySelector('#info-btn');
	const infoSection = document.querySelector('#info-section');
	const infoText = document.querySelector('#info-text');

	const colorConfigInput = document.querySelector('#color-config');

	infoBtn.addEventListener("click", function () {
		if (infoSection.style.display === "none" || infoSection.style.display === "") {
			infoSection.style.display = "block";
			infoBtn.textContent = "❌ Fermer les règles";
		} else {
			infoSection.style.display = "none";
			infoBtn.textContent = "ℹ️ Voir les règles";
		}
	});

	const displayModeInfo = (mode) => {
		infoContainer.style.display = 'block';
		switch (mode) {
			case 'Défi':
				infoText.innerHTML = MODE_INFO_TEXTS.Défi;
				break;

			case 'Libre':
				infoText.innerHTML = MODE_INFO_TEXTS.Libre;
				break;

			case 'Création':
				infoText.innerHTML = MODE_INFO_TEXTS.Création;
				break;

			default:
				infoText.innerHTML = '';
				break;
		}
	};

	const cyContainer = document.querySelector('#cy-predefined');

	DOM_ELEMENTS.modeDefiBtn.addEventListener('click', () => {
		graphSection.style.display = 'block';
		modeTitle.textContent = 'Mode Défi';
		clearDynamicButtons();
		selectElement.style.display = 'block';
		colorConfigInput.style.display = 'none';

		cyContainer.innerHTML = '';

		initDefiMode();
		displayModeInfo('Défi');

		stopTimer();
	});

	DOM_ELEMENTS.modeLibreBtn.addEventListener('click', () => {
		graphSection.style.display = 'block';
		modeTitle.textContent = 'Mode Libre';
		clearDynamicButtons();
		selectElement.style.display = 'block';
		colorConfigInput.style.display = 'none';

		cyContainer.innerHTML = '';

		initLibreMode();
		displayModeInfo('Libre');

		stopTimer();
	});

	DOM_ELEMENTS.modeCreationBtn.addEventListener('click', () => {
		graphSection.style.display = 'block';
		modeTitle.textContent = 'Mode Création';
		clearDynamicButtons();
		selectElement.style.display = 'none';
		colorConfigInput.style.display = 'block';

		cyContainer.innerHTML = '';

		initCreationMode();
		displayModeInfo('Création');

		stopTimer();
	});
});