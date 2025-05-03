///<reference types="cypress" />
import '@cypress/code-coverage/support'

describe('Login page', () => {
  const emailInput = 'input#email' // PrimeVue InputText
  const passwordInput = 'input#password' // PrimeVue Password (masked)
  const submitButton = 'button[type=submit]'

  beforeEach(() => {
    cy.visit('/login')
  })

  it('renders all form fields and keeps Submit disabled initially', () => {
    cy.get(emailInput).should('exist')
    cy.get(passwordInput).should('exist')
    cy.contains(submitButton, 'Login').should('be.disabled')
  })

  it('shows an email validation error and disables submit on invalid email', () => {
    cy.get(emailInput).type('not-an-email')
    cy.get(passwordInput).type('secret')
    cy.contains(submitButton, 'Login').should('be.disabled')
    cy.get('small.p-error').should('contain', 'Email invalid')
  })

  it('allows typing a valid email and enables submit', () => {
    cy.get(emailInput).type('user@example.com')
    cy.get(passwordInput).type('superSecret')
    cy.contains(submitButton, 'Login').should('not.be.disabled')
  })

  it('logs in successfully and redirects to /', () => {
    // Mock backend 200 response
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { message: 'Logged in!' },
    }).as('loginRequest')

    // Stub window.alert so we can assert its call
    cy.window().then((win) => cy.stub(win, 'alert').as('alertStub'))

    // Fill & submit
    cy.get(emailInput).type('user@example.com')
    cy.get(passwordInput).type('superSecret')
    cy.contains(submitButton, 'Login').click()

    // Validate request payload
    cy.wait('@loginRequest').its('request.body').should('deep.equal', {
      email: 'user@example.com',
      password: 'superSecret',
    })

    // Assert alert and redirect
    cy.get('@alertStub').should('have.been.calledWith', 'Login successful: Logged in!')
    cy.location('pathname').should('eq', '/')
  })

  it('shows an error alert and stays on /login when credentials are wrong', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as('loginFail')

    cy.window().then((win) => cy.stub(win, 'alert').as('alertStub'))

    cy.get(emailInput).type('user@example.com')
    cy.get(passwordInput).type('wrongPass')
    cy.contains(submitButton, 'Login').click()

    cy.wait('@loginFail')
    cy.get('@alertStub').should(
      'have.been.calledWith',
      'Login failed. Please check your credentials and try again.',
    )
    cy.location('pathname').should('eq', '/login')
  })
})
