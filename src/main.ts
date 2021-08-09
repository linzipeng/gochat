import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import SDK from "./service/SDKServer";
import axios from "@/api/api";

import icon from "@/components/icon.vue";

import ElementPlus from "element-plus";
import "element-plus/lib/theme-chalk/index.css";

createApp(App)
  .use(store)
  .use(router)
  .use(axios)
  .use(ElementPlus)
  .use(SDK)
  .component("icon", icon)
  .mount("#app");
