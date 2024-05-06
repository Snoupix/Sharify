/// <reference types="cypress" />
// ***********************************************
/* This example commands.ts shows you how to
create various custom commands and overwrite
existing commands.

For more comprehensive examples of custom
commands please read more here:
https://on.cypress.io/custom-commands
***********************************************


-- This is a parent command --
Cypress.Commands.add('login', (email, password) => { ... })


-- This is a child command --
Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })


-- This is a dual command --
Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })


-- This will overwrite an existing command --
Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare global {
	namespace Cypress {
	interface Chainable {
		login(email: string, password: string): Chainable<void>
		drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
		dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
		visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
	}
	}
} */

import { SpotifyAuth } from "./env";

Cypress.Commands.add("login", (id) => {
	cy.session(id, () => {
		cy.visit("/auth_spotify");
		cy.wait(2000);
	
		cy.origin('https://accounts.spotify.com', { args: SpotifyAuth }, creds => {
			const { email, password } = creds;
	
			cy.get('[data-testid="login-username"]').type(email).should("have.value", email);
			cy.get('[data-testid="login-password"]').type(password).should("have.value", password);
			cy.get('[data-testid="login-button"]').click();
			cy.wait(1000);
	
			cy.get('[data-testid="auth-accept"]').click();
		});

		cy.wait(2000);
		cy.get('[data-cy="auth-text"]').should('contain', "connected");
	
		cy.wait(10000);
	});
});

declare global {
	namespace Cypress {
		interface Chainable {
			login(id: string): Chainable<void>
		}
	}
}

export {};
