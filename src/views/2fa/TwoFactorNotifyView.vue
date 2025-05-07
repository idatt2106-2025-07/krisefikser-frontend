<!-- src/views/TwoFactorNotifyView.vue -->
<template>
  <div class="notify-container">
    <div class="notify-card">
      <div class="notify-header">
        <h2 class="notify-title">Check Your Email</h2>
      </div>

      <div class="notify-content">
        <div class="email-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon-svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <p class="notify-message">We've sent a secure verification link to your email address.</p>

        <div class="notify-instructions">
          <p>Please check your inbox and click the link to complete your login.</p>
          <p class="notify-tip">Don't see the email? Check your spam folder or try again.</p>
        </div>

        <div class="notify-actions">
          <router-link to="/" class="notify-button secondary">
            Back to Home
          </router-link>
          <button @click="resendEmail" class="notify-button primary">
            Resend Email
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isResending = ref(false);
const resendSuccess = ref(false);
const resendError = ref(false);

// Simulated function to resend verification email
// Replace this with your actual API call
function resendEmail() {
  isResending.value = true;
  resendSuccess.value = false;
  resendError.value = false;

  // Simulate API call
  setTimeout(() => {
    isResending.value = false;
    resendSuccess.value = true;

    // Hide success message after a few seconds
    setTimeout(() => {
      resendSuccess.value = false;
    }, 3000);
  }, 1000);
}
</script>

<style scoped>
.notify-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 1rem;
}

.notify-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 5px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.notify-header {
  padding: 1.5rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
}

.notify-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
}

.notify-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.email-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  margin-bottom: 1.5rem;
}

.icon-svg {
  width: 32px;
  height: 32px;
}

.notify-message {
  font-size: 1.125rem;
  font-weight: 500;
  color: #334155;
  margin-bottom: 1rem;
}

.notify-instructions {
  margin-bottom: 2rem;
  color: #64748b;
}

.notify-tip {
  font-size: 0.875rem;
  margin-top: 0.75rem;
  color: #94a3b8;
}

.notify-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.notify-button {
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  text-decoration: none;
}

.notify-button.primary {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.notify-button.primary:hover {
  background-color: #2563eb;
}

.notify-button.secondary {
  background-color: transparent;
  color: #3b82f6;
  border: 1px solid #e2e8f0;
}

.notify-button.secondary:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

@media (max-width: 480px) {
  .notify-actions {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }

  .notify-button {
    width: 100%;
    text-align: center;
  }
}
</style>
