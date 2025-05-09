/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable cypress/unsafe-to-chain-command */
// @ts-nocheck
/* eslint-enable @typescript-eslint/ban-ts-comment */
/// <reference types="cypress" />

describe('Registration Form', () => {
  beforeEach(() => {
    cy.visit('/register')
  })

  it('shows validation error for invalid email', () => {
    cy.get('#email').type('not-an-email').blur()
    cy.contains('Email invalid').should('be.visible')
  })

  it('shows validation error when passwords do not match', () => {
    cy.get('#password').type('Password123!')
    cy.get('#confirmPassword').type('DifferentPassword').blur()
    cy.contains('Passwords don’t match').should('be.visible')
  })

  it('fetches coordinates when address is entered', () => {
    // Intercept the real GeoNorge URL used in your service
    cy.intercept(
      {
        method: 'GET',
        url: /https:\/\/ws\.geonorge\.no\/adresser\/v1\/sok\?.*sok=Oslo.*/,
      },
      {
        statusCode: 200,
        body: {
          adresser: [
            {
              representasjonspunkt: {
                lat: 59.91,
                lon: 10.75,
              },
            },
          ],
        },
      },
    ).as('getCoordinates')

    // Trigger the API call via blur on address field
    cy.get('#address').type('Oslo, Norway').blur()

    cy.wait('@getCoordinates')

    // Confirm that mocked coordinates appear on the screen
    cy.contains('Coordinates: 59.91, 10.75').should('exist')
  })
})
