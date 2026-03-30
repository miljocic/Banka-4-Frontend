// cypress/e2e/kt2/scenario-4-create-business-account-for-company.cy.ts
describe('Feature: Kreiranje i upravljanje računima', () => {
    beforeEach(() => {
        cy.loginAsAdmin(); // ili employee kad bude postojalo
    });

    it('Scenario 4: Kreiranje poslovnog računa za firmu', () => {
        cy.visit('/accounts/new');

        // 1) Vlasnik (postojeći klijent)
        const ownerEmail = 'stefan.stefanovic@example.com';

        cy.contains('label', /jmbg ili email adresa/i)
            .parent()
            .find('input[type="text"]')
            .clear()
            .type(ownerEmail);

        cy.contains('button', /^pretraži$/i).click();
        cy.contains('Klijent pronađen u sistemu.', { timeout: 20000 }).should('be.visible');

        // 2) Tip računa (npr. Tekući; ako poslovni može i za devizni, promeni)
        cy.get('input[type="radio"][name="account_type"][value="tekuci"]').check({ force: true });

        // 3) Valuta (RSD tipično za poslovni tekući)
        cy.contains('button', 'RSD', { timeout: 20000 }).click({ force: true });

        // 4) Vrsta računa = poslovni... (mora postojati u option value listi)
        // NAPOMENA: ovde treba tačna value iz dropdown-a (npr. 'poslovni_doo')
        cy.contains('label', /vrsta računa/i)
            .parent()
            .find('select')
            .select('poslovni_doo', { force: true });

        // 5) Podaci o firmi (polja se pojave tek kad je category poslovni*)
        cy.contains(/naziv firme|company name|naziv/i).should('be.visible'); // sanity

        cy.contains(/naziv/i).parent().find('input').clear().type('Firma DOO');
        cy.contains(/matični broj|maticni broj|registration/i).parent().find('input').clear().type('12555678'); // 8 cifara
        cy.contains(/pib/i).parent().find('input').clear().type('123456559'); // 9 cifara
        cy.contains(/šifra delatnosti|sifra delatnosti|delatnost/i).parent().find('select').select(1, { force: true });
// Adresa firme (label je "Adresa *")
        cy.contains('label', /^Adresa\s*\*$/)
            .parent()
            .find('input')
            .clear()
            .type('Bulevar kralja Aleksandra 73, Beograd');
        // 6) Parametri i opcije
        cy.contains('label', /početno stanje/i).parent().find('input[type="number"]').clear().type('0');
        cy.contains('label', /dnevni limit/i).parent().find('input[type="number"]').clear().type('50000');
        cy.contains('label', /mesečni limit/i).parent().find('input[type="number"]').clear().type('200000');

        // 7) Kreiraj
        cy.intercept('POST', '**/accounts*').as('createAccount');
        cy.contains('button', /potvrdi kreiranje računa/i).click();

        cy.wait('@createAccount', { timeout: 20000 }).then(({ request, response }) => {
            cy.log(`status=${response?.statusCode}`);
            cy.log(`requestBody=${JSON.stringify(request?.body)}`);
            cy.log(`responseBody=${JSON.stringify(response?.body)}`);

            expect(response?.statusCode).to.be.oneOf([200, 201]);

            // (opciono) status aktivan ako backend vraća u response-u
            const body: any = response?.body ?? {};
            const status = body.status ?? body.account_status;
            if (status) expect(String(status).toLowerCase()).to.match(/active|aktivan/);
        });

        // UI: status “Aktivan” (ako se prikazuje na sledećoj stranici/modal-u)
        cy.contains(/aktivan|active/i, { timeout: 20000 }).should('be.visible');
    });
});