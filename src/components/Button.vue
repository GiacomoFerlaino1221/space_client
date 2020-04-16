<template>
  <button class="btn" @click="handleClick" :disabled="disabled">
    <span>{{ title }}</span>
  </button>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'button'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick () {
      this.$emit('click');
    }
  }
}
</script>

<style lang="scss" scoped src="@/assets/scss/components/button.scss">
</style>