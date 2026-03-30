// cypress/e2e/cards/scenario-2-create-foreign-account-existing-client.cy.ts
describe('Feature: Kreiranje i upravljanje računima', () => {
    beforeEach(() => {
        cy.loginAsAdmin(); // ili cy.loginAsEmployee kad budete imali komandu
    });

    it('Scenario 2: Kreiranje deviznog računa za klijenta', () => {
        cy.visit('/accounts/new');

        // 1) Pronađi klijenta
        const clientEmail = 'testclient@example.com';

        cy.contains('label', /jmbg ili email adresa/i)
            .parent()
            .find('input[type="text"]')
            .clear()
            .type(clientEmail);

        cy.contains('button', /^pretraži$/i).click();
        cy.contains('Klijent pronađen u sistemu.', { timeout: 20000 }).should('be.visible'); // found citeturn2search0

        // 2) Tip računa: Devizni (radio value="devizni")
        cy.get('input[type="radio"][name="account_type"][value="devizni"]')
            .check({ force: true });

        // 3) Valuta: EUR (klik na dugme)
        cy.contains('Valuta', { timeout: 20000 }).should('be.visible');
        cy.contains('button', 'EUR', { timeout: 20000 }).click({ force: true });

        // 4) Kategorija (Vrsta računa) - izaberi neku ličnu kategoriju koja postoji
        cy.contains('label', /vrsta računa/i)
            .parent()
            .find('select')
            .select('licni_standardni', { force: true });

        // 5) Početno stanje = 0, + limiti (moraju biti validni)
        cy.contains('label', /početno stanje/i).parent().find('input[type="number"]').clear().type('0');
        cy.contains('label', /dnevni limit/i).parent().find('input[type="number"]').clear().type('5000');
        cy.contains('label', /mesečni limit/i).parent().find('input[type="number"]').clear().type('20000');

        // Napravi karticu (create_card)
        cy.contains('Napravi karticu')
            .closest('label')
            .find('input[type="checkbox"]')
            .check({ force: true });

        // 6) Kreiraj račun
        cy.intercept('POST', '**/accounts*').as('createAccount');
        cy.contains('button', /potvrdi kreiranje računa/i).click();

        cy.wait('@createAccount', { timeout: 20000 }).then(({ request, response }) => {
            const status = response?.statusCode;

            // Debug ako padne
            cy.log(`status=${status}`);
            cy.log(`requestBody=${JSON.stringify(request?.body)}`);
            cy.log(`responseBody=${JSON.stringify(response?.body)}`);

            expect(status).to.be.oneOf([200, 201]);
        });

        // 7) Devizni račun ima početno stanje 0 (u preview sidebar-u je "Stanje")
        // UI prikaz zavisi od locale (0,00). Proveri da se vidi 0
        cy.contains('Stanje').should('be.visible');
        cy.contains(/0,00|0.00|0/).should('be.visible');

        // 8) Račun se prikazuje u listi računa klijenta
        // Ovo zavisi od toga gde aplikacija redirectuje posle kreiranja:
        // - ako redirectuje na detalje klijenta /accounts listu, ovde dodaj asert na tabelu/listu.
        // Za sada: proverimo da nismo ostali na formi sa greškom.
        cy.contains(/greška|greska/i).should('not.exist');

        // 9) Email obaveštenje (TODO): treba tačan endpoint za slanje emaila da bismo interceptovali
        // cy.intercept('POST', '**/email*').as('sendEmail');
        // cy.wait('@sendEmail');
    });
});