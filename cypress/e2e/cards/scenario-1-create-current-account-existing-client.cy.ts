// cypress/e2e/accounts/scenario-01-create-current-account-existing-client.cy.ts
describe('Feature: Kreiranje i upravljanje računima', () => {
    beforeEach(() => {
        cy.loginAsAdmin(); // pošto loginAsEmployee ne postoji kod vas trenutno
    });

    it('Scenario 1: Kreiranje tekućeg računa za postojećeg klijenta', () => {
        // page
        cy.visit('/accounts/new');

        // 1) Pretraga klijenta po emailu
        const clientEmail = 'testclient@example.com';

        cy.contains('label', /jmbg ili email adresa/i)
            .parent()
            .find('input[type="text"]')
            .clear()
            .type(clientEmail);

        // (opciono) intercept ako znate endpoint pretrage klijenta
        // cy.intercept('GET', '**/clients/search*').as('searchClient');

        cy.contains('button', /^pretraži$/i).click();

        // očekujemo FOUND status iz ClientSearch komponente
        cy.contains('Klijent pronađen u sistemu.', { timeout: 20000 }).should('be.visible');

        // 2) Tip računa: Tekući račun
        // Pošto ne znam tačan UI tekst opcija u select-u, selektujem regexom
        // Tip računa
        // Tip računa (radio)
        cy.contains('Tip računa').should('be.visible');
        cy.contains('Tekući račun').click({ force: true });
// Valuta je obavezna
        cy.contains('Valuta', { timeout: 20000 }).should('be.visible');
        cy.contains('button', 'RSD').click({ force: true }); // ili 'EUR' ako RSD nije ponuđen
// ili direktno value (iz AccountPreview: 'tekuci')
        cy.get('input[type="radio"][name="account_type"][value="tekuci"]').check({ force: true });
        // 3) Kategorija (izaberi neku ličnu, prilagodi tekst opcije ako je drugačiji)
        // Kategorija (primer: lični standardni)
        // Kategorija računa -> select je pod label "Vrsta računa"
        cy.contains('label', /vrsta računa/i)
            .parent()
            .find('select')
            .select('licni_standardni', { force: true });

        // 4) Parametri i opcije
        cy.contains('label', /početno stanje/i)
            .parent()
            .find('input[type="number"]')
            .clear()
            .type('1000');

        cy.contains('label', /dnevni limit/i)
            .parent()
            .find('input[type="number"]')
            .clear()
            .type('5000');

        cy.contains('label', /mesečni limit/i)
            .parent()
            .find('input[type="number"]')
            .clear()
            .type('20000');

        // 5) Kreiranje računa
        cy.intercept('POST', '**/accounts*').as('createAccount');
        cy.contains('button', /potvrdi kreiranje računa/i).click();

        cy.wait('@createAccount', { timeout: 20000 }).then(({ response }) => {
            expect([200, 201]).to.include(response?.statusCode);

            // Ako backend vraća broj računa, proveri 18 cifara
            const body: any = response?.body ?? {};
            const accountNumber =
                body.account_number ?? body.accountNumber ?? body.number ?? body.iban;

            if (accountNumber) {
                expect(String(accountNumber)).to.match(/^\d{18}$/);
            }
        });

        // UI uspeh (ako imate toast/poruku)
        cy.contains(/uspešno|račun je kreiran|kreiran račun/i, { timeout: 20000 }).should('be.visible');
    });
});