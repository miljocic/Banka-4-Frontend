// cypress/e2e/employees/scenario-17-assign-permission-4th-employee.cy.ts
describe('Scenario 17: Admin dodeljuje permisije zaposlenom', () => {
    beforeEach(() => {
        cy.loginAsAdmin();
    });

    it('otvara 4. zaposlenog i dodeljuje permisiju "Izmena zaposlenih" (employee.update)', () => {
        cy.intercept('GET', '**/employees?page=1&page_size=20*').as('getEmployees');

        cy.visit('/employees');
        cy.wait('@getEmployees', { timeout: 20000 }).then(({ response }) => {
            expect([200, 304]).to.include(response?.statusCode);
        });

        cy.get('table', { timeout: 20000 }).should('be.visible');

        // 4. mesto u tabeli (index 3)
        cy.get('table tbody tr', { timeout: 20000 })
            .should('have.length.greaterThan', 3)
            .eq(3)
            .click({ force: true });

        cy.location('pathname', { timeout: 20000 }).should('match', /^\/employees\/\d+$/);

        cy.contains('button', 'Izmeni', { timeout: 20000 }).click();

        const permLabel = 'Izmena zaposlenih'; // employee.update

        // Toggle da sigurno nastane diff
        cy.contains('label', permLabel, { timeout: 20000 })
            .find('input[type="checkbox"]')
            .then($cb => {
                if ($cb.is(':checked')) cy.wrap($cb).uncheck({ force: true });
                cy.wrap($cb).check({ force: true });
            });

        // Kod vas postoji logika: ako se čekira employee.update/create/delete,
        // employee.view se automatski dodaje ako nije uključen.
        // (to je u togglePermission u EmployeeDetails) citeturn0search1

        cy.intercept({ method: /PUT|PATCH/, url: '**/employees/*' }).as('updateEmployee');
        cy.contains('button[type="submit"]', 'Sačuvaj izmene').click();



        // posle save-a u view modu treba da se vidi tag permisije
        cy.contains('span', permLabel, { timeout: 20000 }).should('be.visible');
    });
});