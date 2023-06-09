import { createApp } from "vue";
import App from "./App.vue";
import CustomDialog from "./components/CustomDialog.vue";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import router from "./router";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

loadFonts();

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const modal = createApp(CustomDialog);
modal.use(vuetify).use(pinia);

app.use(vuetify).use(router).use(pinia);
modal.mount("#modal");
router.isReady().then(() => app.mount("#app"));
