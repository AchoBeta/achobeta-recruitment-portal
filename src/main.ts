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
router.beforeEach((to, from) => {
  // console.log(to);
  console.log(from);

  const isLogin: boolean = !!localStorage.store;
  if (!isLogin && to.path !== "/login") {
    return "/login";
  }
  return true;
});
