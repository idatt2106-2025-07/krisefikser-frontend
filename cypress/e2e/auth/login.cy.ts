/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable cypress/unsafe-to-chain-command */
// @ts-nocheck
/* eslint-enable @typescript-eslint/ban-ts-comment */
describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  context('Regular User Login', () => {
    it('should display the login form by default', () => {
      cy.get('.auth-title').should('contain', 'Login')
      cy.get('input[id="email"]').should('exist')
      cy.get('input[id="password"]').should('exist')
      cy.get('.auth-form button[type="submit"]').should('contain', 'Login')
      cy.contains('a', 'Register').should('exist')
      cy.contains('a', 'Forgot password?').should('exist')
    })

    it('should validate email format when clicking login button', () => {
      // Initially no errors should be shown
      cy.get('.input-error').should('not.exist')
      cy.get('.error-message').should('not.exist')

      // Type invalid email and submit
      cy.get('input[id="email"]').type('invalid-email')
      cy.get('input[id="password"]').type('anypassword')
      cy.get('.auth-form button[type="submit"]').click()

      // Email validation error should now appear
      cy.get('input[id="email"]').should('have.class', 'input-error')
      cy.contains('small', 'Invalid email format').should('exist')
    })

    it('should validate required fields when clicking login button without input', () => {
      // Submit empty form - button should be disabled
      cy.get('.auth-form button[type="submit"]').should('be.disabled')

      // Type valid email but leave password empty
      cy.get('input[id="email"]').type('valid@email.com')
      cy.get('.auth-form button[type="submit"]').should('be.disabled')

      // Focus and blur password field to trigger validation
      cy.get('input[id="password"]').focus().blur()
      cy.contains('small', 'Password is required').should('exist')
    })

    it('should show error for invalid credentials (wrong password)', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { message: 'Invalid credentials' }
      }).as('loginRequest')

      cy.get('input[id="email"]').type('user@example.com')
      cy.get('input[id="password"]').type('wrongpassword')
      cy.get('.auth-form button[type="submit"]').click()

      cy.wait('@loginRequest')
      cy.get('.notification.error').should('contain', 'Invalid credentials')
    })

    it('should show error for non-existent user', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { message: 'User not found' }
      }).as('loginRequest')

      cy.get('input[id="email"]').type('nonexistent@example.com')
      cy.get('input[id="password"]').type('anypassword')
      cy.get('.auth-form button[type="submit"]').click()

      cy.wait('@loginRequest')
      cy.get('.notification.error').should('contain', 'User not found')
    })

    it('should successfully login and redirect to home', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { message: 'Login successful' }
      }).as('loginRequest')

      cy.get('input[id="email"]').type('user@example.com')
      cy.get('input[id="password"]').type('correctpassword')
      cy.get('.auth-form button[type="submit"]').click()

      cy.wait('@loginRequest')
      cy.get('.notification.success').should('contain', 'Login successful, redirecting...')
      cy.location('pathname').should('eq', '/')
    })

    it('should handle 2FA required flow', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { message: 'Two-factor authentication code sent' }
      }).as('loginRequest')

      cy.get('input[id="email"]').type('user@example.com')
      cy.get('input[id="password"]').type('correctpassword')
      cy.get('.auth-form button[type="submit"]').click()

      cy.wait('@loginRequest')

      // Verify we reached the 2FA notification page
      cy.get('.notify-message').should('contain', 'We\'ve sent a secure verification link to your email address')

      // Additional checks to ensure we're on the correct page
      cy.get('.notify-title').should('contain', 'Check Your Email')
      cy.get('.notify-button.primary').should('contain', 'Resend Email')
    })

    context('Password Reset Flow', () => {
      beforeEach(() => {
        cy.contains('a', 'Forgot password?').click()
      })

      it('should switch to reset password form', () => {
        cy.get('.auth-title').should('contain', 'Reset Password')
        cy.get('input[id="reset-email"]').should('exist')
        cy.contains('button', 'Reset Password').should('exist')
        cy.contains('button', 'Cancel').should('exist')
      })

      it('should validate reset email field after blur', () => {
        // Initially no errors
        cy.get('.input-error').should('not.exist')
        cy.get('.error-message').should('not.exist')

        // Type invalid email and blur
        cy.get('input[id="reset-email"]').type('invalid-email').blur()
        cy.get('input[id="reset-email"]').should('have.class', 'input-error')
        cy.get('.error-message').should('contain', 'Invalid email address')
      })

      it('should show success message on valid reset request', () => {
        cy.intercept('POST', '/api/auth/new-password-link', {
          statusCode: 200,
          body: { message: 'Reset link sent' }
        }).as('resetRequest')

        cy.get('input[id="reset-email"]').type('user@example.com')
        cy.contains('button', 'Reset Password').click()

        cy.wait('@resetRequest')
        cy.get('.success-message').should('contain', 'Reset link sent')
      })

      it('should show error on failed reset request', () => {
        cy.intercept('POST', '/api/auth/new-password-link', {
          statusCode: 400,
          body: { message: 'User not found' }
        }).as('resetRequest')

        cy.get('input[id="reset-email"]').type('nonexistent@example.com')
        cy.contains('button', 'Reset Password').click()

        cy.wait('@resetRequest')
        cy.get('.error-message').should('contain', 'User not found')
      })

      it('should cancel and return to login form', () => {
        cy.contains('button', 'Cancel').click()
        cy.get('.auth-title').should('contain', 'Login')
      })
    })
})
})
