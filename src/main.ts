import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import router from "@/router/index.ts";
import "vfonts/Lato.css"; // 通用字体
import "vfonts/FiraCode.css"; // 等宽字体
import piniaPluginPersist from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(piniaPluginPersist);

createApp(App).use(pinia).use(router).mount("#app");
