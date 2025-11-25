<template>
  <div class="not-found">
    <div class="container">
      <div class="not-found-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">Page Not Found</h2>
        <p class="error-message">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <router-link to="/dashboard" class="btn btn-primary">
          <i class="bi bi-house me-2"></i>
          Go to Dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.not-found-content {
  text-align: center;
  padding: 2rem;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1rem;
  line-height: 1;
}

.error-title {
  font-size: 2rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.125rem;
  color: #64748b;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  font-weight: 500;
}
</style>
