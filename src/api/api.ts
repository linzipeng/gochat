import _ from "underscore";
import { api as apiConfig } from "./config";
import axios from "./axios";
import router from "@/router/index";
import { _RouteRecordBase } from "vue-router";
import { App } from "vue";

export function api(apiName: string, data: unknown): Promise<RSP> {
  const keys = Object.keys(apiConfig);
  if (keys.indexOf(apiName) === -1) {
    return Promise.reject({ message: `接口${apiName}不存在` });
  }
  const config = _.extend({}, apiConfig[apiName]);
  const currentRoute = router.currentRoute as unknown as _RouteRecordBase;
  if (currentRoute) {
    config.routeName = currentRoute.name;
  }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const method = config.method ? config.method.toUpperCase() : "GET";
    if (["PUT", "POST", "PATCH"].indexOf(method) !== -1) {
      config.data = _.extend({}, config.data || {}, data);
    } else {
      config.params = _.extend({}, config.params || {}, data);
    }
  }
  return axios.request(config);
}

export default {
  install(app: App): void {
    app.config.globalProperties.$api = api;
  },
};
