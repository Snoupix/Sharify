describe('Clients joining public room', () => {
    it('should create a new public room', () => {
        cy.login('Snoupix');
        cy.visit('/host');

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

    Cypress._.times(15, i => {
        const c = `Public Test user #${i+1}`;

        if (i == 14) {
            it(`should block the ${c} from joining the room`, () => {
                cy.visit('/client');

                cy.wait(1000);

                cy.get('[data-cy="div-rooms-array"]')
                    .children()
                    .filter('[data-cy="client-form-room"]')
                    .last()
                    .should('exist')
                    .click();
                
                cy.get('[data-cy="client-username"]')
                    .should('exist')
                    .focus()
                    .type(c)
                    .should('have.value', c);
                
                cy.get('[data-cy="client-username-submit"]')
                    .should('exist')
                    .click();

                cy.url().should('not.contain', 'room');
            });

            return;
        }

        it(`makes the ${c} joins the room`, () => {
            cy.visit('/client');

            cy.wait(1000);

            cy.get('[data-cy="div-rooms-array"]')
                .children()
                .filter('[data-cy="client-form-room"]')
                .last()
                .should('exist')
                .click();
            
            cy.get('[data-cy="client-username"]')
                .should('exist')
                .focus()
                .type(c)
                .should('have.value', c);
            
            cy.get('[data-cy="client-username-submit"]')
                .should('exist')
                .click();

            cy.url().should('contain', 'room');
        });
    });

    it('should create a new private room', () => {
        cy.login('Snoupix');
        cy.visit('/host');

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

    Cypress._.times(15, i => {
        const c = `Private Test user #${i+1}`;

        if (i == 14) {
            it(`should block the ${c} from joining the room`, () => {
                cy.visit('/client');

                cy.wait(1000);

                cy.get('[data-cy="div-rooms-array"]')
                    .children()
                    .filter('[data-cy="client-form-room"]')
                    .last()
                    .should('exist')
                    .click();
                
                cy.get('[data-cy="client-username"]')
                    .should('exist')
                    .focus()
                    .type(c)
                    .should('have.value', c);
                
                cy.get('[data-cy="client-username-submit"]')
                    .should('exist')
                    .click();
                
                cy.get('[data-cy="client-party-password"]')
                    .should('exist')
                    .focus()
                    .type('PasswordTesting')
                    .should('have.value', 'PasswordTesting');
                
                cy.get('[data-cy="client-party-password-submit"]')
                    .should('exist')
                    .click();

                cy.url().should('not.contain', 'room');
            });

            return;
        }

        it(`makes the ${c} joins the room`, () => {
            cy.visit('/client');

            // rooms fetch
            cy.wait(1000);

            cy.get('[data-cy="div-rooms-array"]')
                .children()
                .filter('[data-cy="client-form-room"]')
                .last()
                .should('exist')
                .click();
            
            cy.get('[data-cy="client-username"]')
                .should('exist')
                .focus()
                .type(c)
                .should('have.value', c);

            cy.get('[data-cy="client-username-submit"]')
                .should('exist')
                .click();

            cy.get('[data-cy="client-party-password"]')
                .should('exist')
                .focus()
                .type('PasswordTesting')
                .should('have.value', 'PasswordTesting');
            
            cy.get('[data-cy="client-party-password-submit"]')
                .should('exist')
                .click();

            cy.url().should('contain', 'room');
        });
    });
});

export {};
