import { api } from "@/api/api";
import keepLiving from "@/service/keepLiving";

interface loginRSP {
  user: User;
  room?: Room;
  token: string;
}

export const userLogin = function (): Promise<loginRSP> {
  return new Promise((resolve) => {
    try {
      const u = sessionStorage.getItem("user") as string;
      const r = sessionStorage.getItem("room") as string;
      sessionStorage.clear();
      if (!u || !r) {
        throw new Error("正常注册！");
      }
      const user = JSON.parse(u);
      const room = JSON.parse(r);
      keepLiving({ uid: user.uid, roomId: room.room_id });
      getToken(user.uid).then((token) => {
        resolve({ user, room, token });
      });
    } catch (err) {
      // 创造用户信息
      const surName = [
        "李",
        "王",
        "张",
        "刘",
        "陈",
        "杨",
        "黄",
        "赵",
        "周",
        "吴",
        "徐",
        "孙",
        "朱",
        "马",
        "胡",
        "郭",
        "林",
        "何",
        "高",
        "梁",
        "郑",
        "罗",
        "宋",
        "谢",
        "唐",
        "韩",
        "曹",
        "许",
        "邓",
        "萧",
        "冯",
        "曾",
        "程",
        "蔡",
        "彭",
        "潘",
        "袁",
        "于",
        "董",
        "余",
        "苏",
        "叶",
        "吕",
        "魏",
        "蒋",
        "田",
        "杜",
        "丁",
        "沈",
        "姜",
        "范",
        "江",
        "傅",
        "钟",
        "卢",
        "汪",
        "戴",
        "崔",
        "任",
        "陆",
        "廖",
        "姚",
        "方",
        "金",
        "邱",
        "夏",
        "谭",
        "韦",
        "贾",
        "邹",
        "石",
        "熊",
        "孟",
        "秦",
        "阎",
        "薛",
        "侯",
        "雷",
        "白",
        "龙",
      ];
      const name = [
        "伟",
        "芳",
        "娜",
        "敏",
        "静",
        "秀英",
        "丽",
        "强",
        "磊",
        "洋",
        "艳",
        "勇",
        "军",
        "杰",
        "娟",
        "涛",
        "明",
        "霞",
        "秀兰",
        "刚",
        "平",
        "燕",
        "辉",
        "静",
        "玲",
        "桂英",
        "丹",
        "萍",
        "鹏",
        "华",
        "红",
        "超",
        "玉兰",
        "飞",
        "桂兰",
        "梅",
        "鑫",
        "波",
        "斌",
        "莉",
        "浩",
        "凯",
        "秀珍",
        "俊",
        "帆",
        "雪",
        "帅",
        "婷",
        "玉梅",
        "浩然",
        "子轩",
        "宇轩",
        "浩宇",
        "一诺",
        "子墨",
        "博文",
        "宇涵",
        "雨泽",
        "子豪",
        "明轩",
        "诗涵",
        "可鑫",
        "雨宣",
        "欣妍",
        "可欣",
        "紫涵",
        "思涵",
        "亦菲",
        "淑华",
        "佳怡",
        "慧嘉",
        "诗悦",
        "清妍",
        "佳钰",
        "昕蕊",
        "熙涵",
        "佳毅",
        "天昊",
        "佳昊",
        "文杰",
      ];
      api("login", {
        nick_name: `${surName[Math.floor(Math.random() * surName.length)]}${
          name[Math.floor(Math.random() * name.length)]
        }`,
      }).then(({ ret, data }: RSP) => {
        if (ret && ret.code === 0) {
          console.log("server登录成功！", data);
          keepLiving({ uid: data.uid });
          getToken(data.uid).then((token) => {
            resolve({ user: data, token });
          });
        }
      });
    }
  });
};

// 获取token
export const getToken = function (
  uid: number,
  ttl = 10000000
): Promise<string> {
  return new Promise((resolve) => {
    api("getToken", { uid, ttl }).then(({ ret, data }) => {
      if (ret?.code === 0) {
        resolve(data?.token as string);
      }
    });
  });
};
