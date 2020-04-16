import Vue from "vue";
import App from "./App.vue";
import moment from "moment";
import io from "socket.io-client";
import router from "./router";
import "./assets/scss/default.scss";

/** Load components */
import Sidebar from "@/components/Sidebar";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Panel from "@/components/Panel";
import Game from "@/components/Game";
import Map from "@/components/Map";

Vue.component("m-sidebar", Sidebar);
Vue.component("m-button", Button);
Vue.component("m-modal", Modal);
Vue.component("m-panel", Panel);
Vue.component("m-game", () => import("@/components/Game"));
Vue.component("m-map", () => import("@/components/Map"));

Vue.config.productionTip = false;

if (process.env.NODE_ENV === "production") {
  Vue.prototype.$socket = io();
} else {
  Vue.prototype.$socket = io("http://localhost:5001");
}

Vue.prototype.$moment = moment;

if (!localStorage.getItem("local")) {
  localStorage.setItem("local", "en");
}

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
