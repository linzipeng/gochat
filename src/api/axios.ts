import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
import router from "@/router/index";
import { _RouteRecordBase } from "vue-router";
import { apiError } from "./apiError";

const REQ_SUCCESS = 0;
let NET_ERROR = false; // 是否展示网络错误

const config = {
  timeout: 10 * 1000,
  baseURL: "https://demo-server-sh.zego.im/alpha",
};

// function showErrorTips(message: string | undefined, title: string | undefined) {
//   ElMessage({
//     message,
//     title: `${title || "请求"} - 失败`,
//     customClass: "alert-box",
//   } as MessageParams);
// }

const axiosInstance = axios.create(config);

interface RSPConfig extends AxiosRequestConfig {
  routeName?: string;
  label?: string;
  ignoreError?: boolean;
}

axiosInstance.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    NET_ERROR = false;
    const currentRoute = router.currentRoute as unknown as _RouteRecordBase;
    const rspConfig: RSPConfig = response.config;
    const rspData: RSP = response.data;
    //同一路由
    if (
      currentRoute?.name === rspConfig.routeName &&
      !rspConfig.url?.match("^http") &&
      rspData?.ret.code !== REQ_SUCCESS &&
      !rspConfig.ignoreError
    ) {
      debugger;
      // showErrorTips(
      //   Object.keys(apiError)?.indexOf(rspData.ret.code?.toString()) !== 0
      //     ? apiError[rspData.ret.code]
      //     : rspData.ret.message,
      //   rspConfig.label
      // );
    }
    return response.data;
  },
  (error) => {
    if (error instanceof axios.Cancel) {
      return Promise.reject(error.message);
    }
    if (!error.response && !NET_ERROR) {
      ElMessage({
        customClass: "alert-box",
        message: `网络异常，请检查网络后重试`,
      });
      NET_ERROR = true;
    }
    return Promise.reject();
  }
);

export default axiosInstance;
