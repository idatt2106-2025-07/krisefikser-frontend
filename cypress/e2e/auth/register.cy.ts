/// <reference types="cypress" />
import '@cypress/code-coverage/support'

const REGISTER_PATH = '/register'
const API_ENDPOINT = '/api/auth/register'

describe('Register page', () => {
  beforeEach(() => {
    cy.visit(REGISTER_PATH)
  })

  it('renders all required fields and the submit button disabled by default', () => {
    cy.get('#name').should('exist')
    cy.get('#email').should('exist')
    cy.get('#password').should('exist')
    cy.get('#confirmPassword').should('exist')
    cy.get('.agreeToTerms').should('exist')
    cy.get('button[type="submit"]').should('be.disabled')
  })

  it('shows client‑side validation errors', () => {
    cy.get('input[placeholder="Email"]').type('not‑an‑email')
    cy.get('input[placeholder="Email"]').blur()
    cy.contains('small', 'Email invalid').should('be.visible')

    cy.get('input[placeholder="Password"]').first().type('foo')
    cy.get('input[placeholder="Confirm Password"]').type('bar')
    cy.get('input[placeholder="Confirm Password"]').blur()
    cy.contains('small', 'Passwords don’t match').should('be.visible')

    cy.contains('button', 'Register').should('be.disabled')
  })

  it('submits the form successfully and redirects to /login', () => {
    cy.intercept('POST', API_ENDPOINT, {
      statusCode: 201,
      body: {},
    }).as('registerReq')

    // fill and submit
    cy.get('#name').type('Test User')
    cy.get('#email').type('test@example.com')
    cy.get('#email').blur()
    cy.get('#password').type('Password1!')
    cy.get('#confirmPassword').type('Password1!')
    cy.get('#confirmPassword').blur()
    cy.get('.agreeToTerms').check()
    cy.get('button[type="submit"]').click()

    cy.get('.status-message.success').should('contain', 'Registered successfully')

    cy.url().should('include', '/login')
  })

  it('handles API errors gracefully', () => {
    cy.intercept('POST', API_ENDPOINT, {
      statusCode: 400,
      body: { message: 'Email already in use' },
    }).as('registerErr')

    cy.get('#name').type('Test User')
    cy.get('#email').type('test@example.com')
    cy.get('#email').blur()
    cy.get('#password').type('Password1!')
    cy.get('#confirmPassword').type('Password1!')
    cy.get('#confirmPassword').blur()
    cy.get('.agreeToTerms').check()
    cy.get('button[type="submit"]').click()
    cy.wait('@registerErr')

    cy.get('.status-message.error').should('contain', 'Email already in use')
    cy.url().should('include', REGISTER_PATH)
  })
})
