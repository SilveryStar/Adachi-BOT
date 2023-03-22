const template = `<div class="footer-view">
  <div class="footer-content">
    <span v-if="!isMobile">MIT Licensed | </span>
    <span>Adachi管理面板 &copy;{{ currentYear }} SilveryStar</span>
  </div>
</div>`;

const { defineComponent, computed, inject } = Vue;

export default defineComponent({
  name: "FooterView",
  template,
  setup() {
    const { device } = inject("app");
    const isMobile = computed(() => device.value === "mobile");
    const currentYear = Vue.ref('');

    Vue.onMounted(() => {
      const year = new Date().getFullYear();
      currentYear.value = year;
    });

    return {
      isMobile,
      currentYear,
    };
  },
});
