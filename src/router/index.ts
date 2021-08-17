import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "roomList",
    component: () => import("@/views/liveRoomList.vue"),
  },
  {
    path: "/liveRoom/:roomId",
    name: "LiveRoom",
    component: () => import("@/views/liveRoom.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

export default router;
