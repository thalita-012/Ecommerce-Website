<template>
  <button
    type="button"
    class="wishlist-button"
    :class="{ active, loading }"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :title="title"
    @click.stop="$emit('click')"
  >
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <span v-else aria-hidden="true">{{ active ? activeIcon : inactiveIcon }}</span>
  </button>
</template>

<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  ariaLabel: {
    type: String,
    default: 'Toggle wishlist',
  },
  title: {
    type: String,
    default: 'Toggle wishlist',
  },
  activeIcon: {
    type: String,
    default: '♥',
  },
  inactiveIcon: {
    type: String,
    default: '♡',
  },
})

defineEmits(['click'])
</script>

<style scoped>
.wishlist-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  color: #58705c;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease, opacity 0.2s ease;
  box-shadow: 0 8px 24px rgba(24, 48, 28, 0.12);
}

.wishlist-button:hover:not(:disabled) {
  transform: translateY(-1px);
  color: #ef4444;
}

.wishlist-button.active {
  color: #ef4444;
}

.wishlist-button:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
