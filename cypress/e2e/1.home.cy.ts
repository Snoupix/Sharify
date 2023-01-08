describe('Home page', () => {
	beforeEach(() => {
		cy.visit('/', { timeout: 5000 });
	});

	it('has every buttons/links', () => {
		cy.get('[data-cy="host-link"]').should('exist');
		cy.get('[data-cy="client-link"]').should('exist');
	});

	it('is not connected', () => {
		cy.get('[data-cy="horizontal-bar"]').should('not.exist');
		cy.get('[data-cy="disconnect-btn"]').should('not.exist');
	});

	it('is connecting and it is connected', () => {
		cy.login('Snoupix');

		cy.visit('/');

		//cy.get('[data-cy="home-btn"]').click();

		cy.get('[data-cy="horizontal-bar"]').should('exist');
		cy.get('[data-cy="disconnect-btn"]').should('exist');
	});

	it('should disconnect', () => {
		it('should be disconnected', () => {
			cy.get('[data-cy="disconnect-btn"]').should('exist').click();
			/* cy.getAllLocalStorage().then(storage => {
				expect(storage).to.have.property('http://localhost:3000');
			}); */
			cy.get('[data-cy="horizontal-bar"]').should('not.exist');
			cy.get('[data-cy="disconnect-btn"]').should('not.exist');
		})
	});
});

export {};
