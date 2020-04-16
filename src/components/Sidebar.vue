<template>
  <div class="sidebar">

    <!-- burger -->
    <div class="sidebar-burger" :class="{ active: toggled && show }" v-if="!toggled || !show" @click="toggleSidebar">
      <img src="../assets/icons/menu_btn.svg" alt="">
    </div>
    <div class="sidebar-burger" :class="{ active: toggled && show }" v-if="toggled && show" @click="toggleSidebar">
      <img src="../assets/icons/close_btn.svg" alt="">
    </div>
    <!-- end -->

    <!-- menu -->
    <div class="sidebar-menu" :class="{ active: toggled && show }">
      <div class="sidebar-menu-logo">
        <img src="../assets/img/menu_bg.svg" alt="">
      </div>
      <ul>
        <!-- <router-link tag="li" :to="`/rules/token=${token}`">Правила</router-link> -->
        <li @click="toggleModal('rules')">
          <a href="#">Правила</a>
        </li>
        <router-link tag="li" to="/coins">Описание монеты и ссылки, как ее получить</router-link>
        <li @click="toggleModal('balance')">
          <a href="#">Магазин</a>
        </li>
        <li>
          <a href="#">Настройки игры</a>
        </li>
      </ul>

      <!-- language toggle -->
      <div class="language">
        <select v-model="language" @change="toggleLanguage">
          <option value="en">EN</option>
          <option value="ru">RU</option>
        </select>
      </div>

      <!-- author -->
      <div class="author">
        <span>v 0.2.3 White Zebra</span>
      </div>
    </div>
    <!-- end -->

  </div>
</template>

<script>
export default {
  props: {
    lang: {
      type: String,
    },
    local: {
      type: [Object, Array]
    },
    token: {
      type: [String, Number]
    },
    show: {
      type: Boolean
    }
  },
  data: () => ({
    toggled: false,
  }),
  computed: {
    language: {
      get: function () { return this.lang },
      set: function () {}
    }
  },
  methods: {
    toggleSidebar () {
      this.toggled = !this.toggled;
      this.$emit('closeModal');
    },
    toggleLanguage () {
      if (this.lang === 'ru')
        this.$emit('toggleLanguage', 'en');
      else
        this.$emit('toggleLanguage', 'ru');
    },
    toggleModal (type) {
      this.toggled = false;
      this.$emit('loadModal', type);
    }
  }
}
</script>

<style lang="scss" scoped src="@/assets/scss/components/sidebar.scss">
</style>