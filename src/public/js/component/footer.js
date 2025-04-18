class CustomFooter extends HTMLElement {

	constructor() {

		super();

		const shadow = this.attachShadow({ mode: 'open' });

		const template = document.createElement('template');
		template.innerHTML = `
			<div class="footer">
				<div class="footer-container">
					<h1 class="title">Terra Numerica © ${new Date().getFullYear()}</h1>
				</div>
			</div>

			<style>
				.footer {
					width: 100%;
					background-color: var(--blue);
				}

				.footer-container {
					margin: 3rem 0 0 0;
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					align-items: center;
				}

				.title {
					font-size: 20px;
					color: white;
					text-align: center;
				}
			</style>
		`;

		shadow.appendChild(template.content.cloneNode(true));
	}
}

customElements.define('custom-footer', CustomFooter);