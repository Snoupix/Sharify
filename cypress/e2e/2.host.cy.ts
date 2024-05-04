describe('Creating a new room', () => {
    beforeEach(() => {
        cy.login('Snoupix');
        cy.visit('/host');
    });

    it('should create a new private room', () => {
        cy.get('[data-cy="host-form-username"]')
            .should('exist')
            .should('be.focused')
            .type('Test user')
            .should('have.value', 'Test user');

        cy.get('[data-cy="host-form-party-name"]')
            .should('exist')
            .focus()
            .type('Private Test Party')
            .should('have.value', 'Private Test Party');

        cy.get('[data-cy="host-form-make-private"]')
            .should('exist')
            .click();

        cy.get('[data-cy="host-form-make-public"]')
            .should('exist')
            .should('not.have.css', 'color', 'white');

        cy.get('[data-cy="host-form-party-password"]')
            .should('exist')
            .focus()
            .type('PasswordTesting')
            .should('have.value', 'PasswordTesting');

        cy.get('[data-cy="host-form-submit"]')
            .should('exist')
            .click();

        cy.wait(2000);
        cy.url().should('contain', 'room');
    });

    it('should create a new public room', () => {
        cy.get('[data-cy="host-form-username"]')
            .should('exist')
            .should('be.focused')
            .type('Test user')
            .should('have.value', 'Test user');

        cy.get('[data-cy="host-form-party-name"]')
            .should('exist')
            .focus()
            .type('Public Test Party')
            .should('have.value', 'Public Test Party');

        cy.get('[data-cy="host-form-make-public"]')
            .should('exist')
            .click();

        cy.get('[data-cy="host-form-make-private"]')
            .should('exist')
            .should('not.have.css', 'color', 'white');

        cy.get('[data-cy="host-form-party-password"]')
            .should('be.hidden');

        cy.get('[data-cy="host-form-submit"]')
            .should('exist')
            .click();

        cy.wait(2000);
        cy.url().should('contain', 'room');
    });
});

export {};
