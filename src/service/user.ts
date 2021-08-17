import { api } from "@/api/api";

const getPictureIndex = function (val: string): string {
  let hash = 0,
    i,
    chr;
  if (val.length === 0) return String(hash);
  for (i = 0; i < val.length; i++) {
    chr = val.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  // 目前只有八张图片
  return String(hash % 8);
};

export const createUserInfo = function (): User {
  let user: User;
  try {
    const u = sessionStorage.getItem("user") as string;
    if (!u) {
      throw new Error("正常生成用户信息！");
    }
    user = JSON.parse(u) as User;
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
    const nick_name = `${
      surName[Math.floor(Math.random() * surName.length)] +
      name[Math.floor(Math.random() * name.length)]
    }`;
    user = {
      uid: 0,
      nick_name,
      avatar: getPictureIndex(nick_name),
    };
  }
  return user;
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
