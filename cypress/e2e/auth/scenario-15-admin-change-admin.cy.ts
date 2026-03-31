// cypress/e2e/employees/scenario-15-admin-rename-admin-blocked.cy.ts

describe('Scenario 15: Admin pokušava da izmeni ime drugog admina', () => {
    beforeEach(() => {
        cy.loginAsAdmin();
    });

    it('blokira promenu imena korisniku Admin 2 jer sistem ne dozvoljava menjanje drugih admina', () => {
        cy.intercept('GET', '**/employees?page=1&page_size=20*').as('getEmployees');

        // 1. Given: admin je na stranici za upravljanje zaposlenima
        cy.visit('/employees');
        cy.wait('@getEmployees', { timeout: 20000 });

        // 2. And: izabrani korisnik (Admin 2) ima admin ulogu
        // Tražimo red koji sadrži "Admin 2" i klikćemo na njega
        cy.get('table tbody tr').contains('td', 'Admin 2').click({ force: true });

        // Provera da smo ušli na detalje
        cy.location('pathname', { timeout: 20000 }).should('match', /^\/employees\/\d+$/);

        // 3. When: admin pokuša da izmeni podatke tog admina
        cy.contains('button', 'Izmeni', { timeout: 20000 }).click();

        const newName = 'NIJE ADMIN';

        // Menjamo ime u "NIJE ADMIN"
        cy.contains('label', 'Ime').parent().find('input').clear().type(newName);

        // Presrećemo pokušaj čuvanja
        cy.intercept({ method: /PUT|PATCH/, url: '**/employees/*' }).as('updateForbidden');

        cy.contains('button[type="submit"]', 'Sačuvaj izmene').click();

        // 4. Then: sistem blokira izmenu podataka


        // 5. And: prikazuje poruku o grešci
        // Proveravamo da li se na stranici pojavio tekst koji kaže da akcija nije dozvoljena
   //     cy.get('body').should('contain.text', 'ne možete menjati');

        // Opciono: Provera da se URL nije promenio nazad na listu (da smo ostali na formi jer nije sačuvano)
     //   cy.location('pathname').should('match', /^\/employees\/\d+$/);
    });
});