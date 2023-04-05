// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { en, ko } from "vuetify/locale";

// Vuetify
import { createVuetify } from "vuetify";
import { VSkeletonLoader } from "vuetify/labs/VSkeletonLoader";
import { themes, aliases, defaults } from "@/plugins/vuetify.config";

export default createVuetify({
  lang: {
    locales: { ko, en },
    current: "ko",
  },
  theme: {
    defaultTheme: "customTheme",
    themes: themes,
  },

  aliases: aliases,
  defaults: defaults,
  components: { VSkeletonLoader },
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
});
