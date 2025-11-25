<template>
  <div class="login-form">
    <h3 class="form-title">Welcome Back!</h3>
    <p class="form-subtitle text-muted">Sign in to your account to continue</p>

    <form @submit.prevent="handleSubmit">
      <!-- Email -->
      <div class="mb-3">
        <label for="email" class="form-label">Email Address</label>
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-envelope"></i>
          </span>
          <input
            type="email"
            class="form-control"
            :class="{ 'is-invalid': errors.email }"
            id="email"
            v-model="email"
            placeholder="Enter your email"
            autocomplete="email"
          />
        </div>
        <div v-if="errors.email" class="invalid-feedback d-block">{{ errors.email }}</div>
      </div>

      <!-- Password -->
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-lock"></i>
          </span>
          <input
            :type="showPassword ? 'text' : 'password'"
            class="form-control"
            :class="{ 'is-invalid': errors.password }"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            autocomplete="current-password"
          />
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="showPassword = !showPassword"
          >
            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
        <div v-if="errors.password" class="invalid-feedback d-block">{{ errors.password }}</div>
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            id="remember"
            v-model="rememberMe"
          />
          <label class="form-check-label" for="remember">
            Remember me
          </label>
        </div>
        <a href="#" class="text-decoration-none">Forgot Password?</a>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-primary w-100 mb-3"
        :disabled="loading"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
        {{ loading ? 'Signing in...' : 'Sign In' }}
      </button>

      <!-- Register Link -->
      <div class="text-center">
        <p class="mb-0">
          Don't have an account?
          <router-link to="/register" class="text-decoration-none fw-semibold">
            Sign Up
          </router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useForm } from 'vee-validate'
import { formSchemas } from '@/utils/validation'
import { useNotification } from '@/composables/useNotification'
import type { LoginCredentials } from '@/types/models'

const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const toast = useNotification()

const { defineField, handleSubmit: useFormSubmit, errors } = useForm({
  validationSchema: formSchemas.login,
})

const [email] = defineField('email')
const [password] = defineField('password')

const handleSubmit = useFormSubmit(async (values) => {
  try {
    loading.value = true

    const credentials: LoginCredentials = {
      email: values.email,
      password: values.password,
    }

    await authStore.login(credentials, rememberMe.value)
    
    // Fetch user to ensure proper role loading
    await authStore.fetchUser()

    // Redirect to dashboard or intended page
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/dashboard')
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Invalid email or password')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.form-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.form-subtitle {
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.form-label {
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.5rem;
}

.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
}

.input-group .form-control {
  border-left: none;
}

.input-group .form-control:focus {
  border-color: #ced4da;
}

.input-group:focus-within .input-group-text {
  border-color: var(--primary-color);
}

.input-group:focus-within .form-control {
  border-color: var(--primary-color);
}

.btn-outline-secondary {
  border-left: none;
}

.form-check-input:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-primary {
  padding: 0.75rem;
  font-weight: 500;
}

.alert {
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}
</style>
