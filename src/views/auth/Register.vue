<template>
  <div class="register-form">
    <h3 class="form-title">Create Account</h3>
    <p class="form-subtitle text-muted">Sign up to get started</p>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- Name -->
      <div class="mb-3">
        <label for="name" class="form-label">Full Name</label>
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-person"></i>
          </span>
          <input
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.name }"
            id="name"
            v-model="name"
            placeholder="Enter your full name"
            autocomplete="name"
          />
        </div>
        <div v-if="errors.name" class="invalid-feedback d-block">{{ errors.name }}</div>
      </div>

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
            placeholder="Create a password"
            autocomplete="new-password"
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
        <small v-else class="form-text text-muted">
          Must contain: uppercase, lowercase, number, special character (min 8 chars)
        </small>
      </div>

      <!-- Confirm Password -->
      <div class="mb-3">
        <label for="password_confirmation" class="form-label">
          Confirm Password
        </label>
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-lock-fill"></i>
          </span>
          <input
            :type="showConfirmPassword ? 'text' : 'password'"
            class="form-control"
            :class="{ 'is-invalid': errors.password_confirmation }"
            id="password_confirmation"
            v-model="password_confirmation"
            placeholder="Confirm your password"
            autocomplete="new-password"
          />
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
        <div v-if="errors.password_confirmation" class="invalid-feedback d-block">{{ errors.password_confirmation }}</div>
      </div>

      <!-- Terms & Conditions -->
      <div class="form-check mb-4">
        <input
          class="form-check-input"
          type="checkbox"
          id="terms"
          v-model="acceptTerms"
          required
        />
        <label class="form-check-label" for="terms">
          I agree to the
          <a href="#" class="text-decoration-none">Terms & Conditions</a>
        </label>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-primary w-100 mb-3"
        :disabled="loading || !isFormValid"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
        {{ loading ? 'Creating Account...' : 'Sign Up' }}
      </button>

      <!-- Login Link -->
      <div class="text-center">
        <p class="mb-0">
          Already have an account?
          <router-link to="/login" class="text-decoration-none fw-semibold">
            Sign In
          </router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useForm } from 'vee-validate'
import { formSchemas } from '@/utils/validation'
import type { RegisterData } from '@/types/models'

const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const acceptTerms = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const { defineField, handleSubmit: useFormSubmit, errors } = useForm({
  validationSchema: formSchemas.register,
})

const [name] = defineField('name')
const [email] = defineField('email')
const [password] = defineField('password')
const [password_confirmation] = defineField('password_confirmation')

const isFormValid = computed(() => {
  return acceptTerms.value && Object.keys(errors.value).length === 0
})

const handleSubmit = useFormSubmit(async (values) => {
  try {
    loading.value = true
    errorMessage.value = ''

    const registerData: RegisterData = {
      name: values.name,
      email: values.email,
      password: values.password,
      password_confirmation: values.password_confirmation,
    }

    await authStore.register(registerData)

    // Redirect to dashboard
    router.push('/dashboard')
  } catch (error: any) {
    if (error.response?.data?.errors) {
      // Handle validation errors
      const apiErrors = error.response.data.errors
      const firstError = Object.values(apiErrors)[0] as string[]
      errorMessage.value = firstError[0]
    } else {
      errorMessage.value =
        error.response?.data?.message || 'Registration failed. Please try again.'
    }
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

.form-text {
  display: block;
  margin-top: 0.25rem;
}
</style>
