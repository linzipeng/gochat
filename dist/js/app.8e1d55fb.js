(function(e){function t(t){for(var n,r,u=t[0],c=t[1],s=t[2],l=0,d=[];l<u.length;l++)r=u[l],Object.prototype.hasOwnProperty.call(a,r)&&a[r]&&d.push(a[r][0]),a[r]=0;for(n in c)Object.prototype.hasOwnProperty.call(c,n)&&(e[n]=c[n]);m&&m(t);while(d.length)d.shift()();return i.push.apply(i,s||[]),o()}function o(){for(var e,t=0;t<i.length;t++){for(var o=i[t],n=!0,r=1;r<o.length;r++){var u=o[r];0!==a[u]&&(n=!1)}n&&(i.splice(t--,1),e=c(c.s=o[0]))}return e}var n={},r={app:0},a={app:0},i=[];function u(e){return c.p+"js/"+({about:"about"}[e]||e)+"."+{about:"7759d229","chunk-5357432d":"2b6aabce"}[e]+".js"}function c(t){if(n[t])return n[t].exports;var o=n[t]={i:t,l:!1,exports:{}};return e[t].call(o.exports,o,o.exports,c),o.l=!0,o.exports}c.e=function(e){var t=[],o={about:1,"chunk-5357432d":1};r[e]?t.push(r[e]):0!==r[e]&&o[e]&&t.push(r[e]=new Promise((function(t,o){for(var n="css/"+({about:"about"}[e]||e)+"."+{about:"6ee84557","chunk-5357432d":"554a2820"}[e]+".css",a=c.p+n,i=document.getElementsByTagName("link"),u=0;u<i.length;u++){var s=i[u],l=s.getAttribute("data-href")||s.getAttribute("href");if("stylesheet"===s.rel&&(l===n||l===a))return t()}var d=document.getElementsByTagName("style");for(u=0;u<d.length;u++){s=d[u],l=s.getAttribute("data-href");if(l===n||l===a)return t()}var m=document.createElement("link");m.rel="stylesheet",m.type="text/css",m.onload=t,m.onerror=function(t){var n=t&&t.target&&t.target.src||a,i=new Error("Loading CSS chunk "+e+" failed.\n("+n+")");i.code="CSS_CHUNK_LOAD_FAILED",i.request=n,delete r[e],m.parentNode.removeChild(m),o(i)},m.href=a;var f=document.getElementsByTagName("head")[0];f.appendChild(m)})).then((function(){r[e]=0})));var n=a[e];if(0!==n)if(n)t.push(n[2]);else{var i=new Promise((function(t,o){n=a[e]=[t,o]}));t.push(n[2]=i);var s,l=document.createElement("script");l.charset="utf-8",l.timeout=120,c.nc&&l.setAttribute("nonce",c.nc),l.src=u(e);var d=new Error;s=function(t){l.onerror=l.onload=null,clearTimeout(m);var o=a[e];if(0!==o){if(o){var n=t&&("load"===t.type?"missing":t.type),r=t&&t.target&&t.target.src;d.message="Loading chunk "+e+" failed.\n("+n+": "+r+")",d.name="ChunkLoadError",d.type=n,d.request=r,o[1](d)}a[e]=void 0}};var m=setTimeout((function(){s({type:"timeout",target:l})}),12e4);l.onerror=l.onload=s,document.head.appendChild(l)}return Promise.all(t)},c.m=e,c.c=n,c.d=function(e,t,o){c.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},c.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},c.t=function(e,t){if(1&t&&(e=c(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(c.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)c.d(o,n,function(t){return e[t]}.bind(null,n));return o},c.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return c.d(t,"a",t),t},c.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},c.p="",c.oe=function(e){throw console.error(e),e};var s=window["webpackJsonp"]=window["webpackJsonp"]||[],l=s.push.bind(s);s.push=t,s=s.slice();for(var d=0;d<s.length;d++)t(s[d]);var m=l;i.push([0,"chunk-vendors"]),o()})({0:function(e,t,o){e.exports=o("cd49")},"0662":function(e,t,o){"use strict";o("53c5")},"1e1c":function(e,t,o){"use strict";o("d3b7"),o("4795");var n=o("de46"),r=o("3fd4"),a=o("afbc"),i=function(e){var t=e.uid,o=e.roomId,i=void 0===o?"":o,u=e.wait,c=void 0===u?1e4:u,s=e.immediate,l=void 0===s||s,d=e.maxSecond,m=void 0===d?6:d,f=0,b=function(){return new Promise((function(e,o){Object(n["a"])("heartbeat",{uid:t,room_id:i}).then((function(t){var o=t.ret;0===(null===o||void 0===o?void 0:o.code)&&(f=0,e())}))["catch"]((function(){++f,o()}))}))};l&&b();var h=setInterval((function(){b()["catch"]((function(){f>=m?(sessionStorage.clear(),r["b"].confirm("网络连接失败，请检查网络后重试","网络异常",{confirmButtonText:"重试",cancelButtonText:"退出",customClass:"message-box",confirmButtonClass:"zg-button small-button border-radius-5 ",cancelButtonClass:"message-cancel-btn border-radius-5 ",center:!0,showClose:!1}).then((function(){a["a"].go(0)}))["catch"]((function(){a["a"].push({path:"/"})}))):r["b"].alert("网络异常，请检查网络后重试","网络异常",{confirmButtonText:"确定",customClass:"message-box",confirmButtonClass:"zg-button small-button border-radius-5 ",center:!0,showClose:!1})}))}),c);return h},u=function(){var e,t=function t(o){var n=o.uid,r=o.roomId,a=void 0===r?null:r,u=o.wait,c=void 0===u?1e4:u,s=o.immediate,l=void 0===s||s,d=o.maxSecond,m=void 0===d?6:d;t.stop(),e=i({uid:n,roomId:a,wait:c,immediate:l,maxSecond:m})};return t.stop=function(){e&&(clearInterval(e),e=0)},t},c=u();t["a"]=c},"1e60":function(e,t,o){"use strict";o("ea1b")},3404:function(e,t,o){"use strict";o("b0c0");var n=o("7a23");function r(e,t,o,r,a,i){return Object(n["E"])(),Object(n["j"])("svg",{class:["icon",{"icon-button":e.isButton}],"aria-hidden":"true"},[Object(n["n"])("use",{"xlink:href":"#icon-"+e.name},null,8,["xlink:href"])],2)}var a=o("5530"),i=Object(n["o"])({name:"Icon",props:{name:{type:String,require:!0},className:{type:String},isButton:{type:Boolean,default:function(){return!1}}},setup:function(e){return Object(a["a"])({},Object(n["U"])(e))}});o("0662");i.render=r;t["a"]=i},"53c5":function(e,t,o){},"62d8":function(e,t,o){"use strict";o.d(t,"d",(function(){return a})),o.d(t,"c",(function(){return i})),o.d(t,"a",(function(){return u}));var n=o("1da1"),r=(o("96cf"),o("fcc3")),a=new r["ZegoExpressEngine"](3127407533,"wss://webliveroom3127407533-api.zego.im/ws");a.setDebugVerbose(!1);var i=function(){return a.getVersion()},u=function(){var e=Object(n["a"])(regeneratorRuntime.mark((function e(){var t,o;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return a.getVersion(),e.prev=1,e.next=4,a.checkSystemRequirements();case 4:if(o=e.sent,o.webRTC){e.next=10;break}return e.abrupt("return",!1);case 10:if(null!==o&&void 0!==o&&null!==(t=o.videoCodec)&&void 0!==t&&t.VP8){e.next=13;break}return e.abrupt("return",!1);case 13:return e.abrupt("return",!0);case 16:return e.prev=16,e.t0=e["catch"](1),console.error("checkSystemRequirements",e.t0),e.abrupt("return",!1);case 20:case"end":return e.stop()}}),e,null,[[1,16]])})));return function(){return e.apply(this,arguments)}}();t["b"]={install:function(e){e.config.globalProperties.$zg=a}}},afbc:function(e,t,o){"use strict";o("d3b7"),o("3ca3"),o("ddb0");var n=o("6c02"),r=[{path:"/",name:"roomList",component:function(){return o.e("chunk-5357432d").then(o.bind(null,"fc0d"))}},{path:"/liveRoom/:roomId",name:"LiveRoom",component:function(){return o.e("about").then(o.bind(null,"9691"))}}],a=Object(n["a"])({history:Object(n["b"])(""),routes:r});t["a"]=a},cd49:function(e,t,o){"use strict";o.r(t);o("e260"),o("e6cf"),o("cca6"),o("a79d");var n=o("7a23"),r={id:"nav"};function a(e,t,o,a,i,u){var c=Object(n["N"])("router-view");return Object(n["E"])(),Object(n["j"])("div",r,[Object(n["n"])(c)])}var i=o("5502"),u=o("1e1c"),c=(o("d3b7"),o("99af"),o("de46")),s=function(){return new Promise((function(e){try{var t=sessionStorage.getItem("user"),o=sessionStorage.getItem("room");if(sessionStorage.clear(),!t||!o)throw new Error("正常注册！");var n=JSON.parse(t),r=JSON.parse(o);Object(u["a"])({uid:n.uid,roomId:r.room_id}),l(n.uid).then((function(t){e({user:n,room:r,token:t})}))}catch(s){var a=["李","王","张","刘","陈","杨","黄","赵","周","吴","徐","孙","朱","马","胡","郭","林","何","高","梁","郑","罗","宋","谢","唐","韩","曹","许","邓","萧","冯","曾","程","蔡","彭","潘","袁","于","董","余","苏","叶","吕","魏","蒋","田","杜","丁","沈","姜","范","江","傅","钟","卢","汪","戴","崔","任","陆","廖","姚","方","金","邱","夏","谭","韦","贾","邹","石","熊","孟","秦","阎","薛","侯","雷","白","龙"],i=["伟","芳","娜","敏","静","秀英","丽","强","磊","洋","艳","勇","军","杰","娟","涛","明","霞","秀兰","刚","平","燕","辉","静","玲","桂英","丹","萍","鹏","华","红","超","玉兰","飞","桂兰","梅","鑫","波","斌","莉","浩","凯","秀珍","俊","帆","雪","帅","婷","玉梅","浩然","子轩","宇轩","浩宇","一诺","子墨","博文","宇涵","雨泽","子豪","明轩","诗涵","可鑫","雨宣","欣妍","可欣","紫涵","思涵","亦菲","淑华","佳怡","慧嘉","诗悦","清妍","佳钰","昕蕊","熙涵","佳毅","天昊","佳昊","文杰"];Object(c["a"])("login",{nick_name:"".concat(a[Math.floor(Math.random()*a.length)]).concat(i[Math.floor(Math.random()*i.length)])}).then((function(t){var o=t.ret,n=t.data;o&&0===o.code&&(Object(u["a"])({uid:n.uid}),l(n.uid).then((function(t){e({user:n,token:t})})))}))}}))},l=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1e7;return new Promise((function(o){Object(c["a"])("getToken",{uid:e,ttl:t}).then((function(e){var t=e.ret,n=e.data;0===(null===t||void 0===t?void 0:t.code)&&o(null===n||void 0===n?void 0:n.token)}))}))},d=o("62d8"),m=o("3fd4"),f=Object(n["o"])({setup:function(){var e=Object(i["b"])();Object(d["a"])().then((function(e){e||Object(m["b"])({title:"浏览器不支持",message:"您当前的浏览器不符合直播间要求，为获得更好的直播体验，请安装最新版本的 Chrome 浏览器",center:!0,showClose:!1,closeOnClickModal:!1,showCancelButton:!0,showConfirmButton:!0,customClass:"message-box",cancelButtonText:"我知道了",confirmButtonText:"去下载",cancelButtonClass:"message-cancel-btn border-radius-5 ",confirmButtonClass:"zg-button small-button border-radius-5 "}).then((function(){window.open("https://oomake.com/download/chrome","_blank")}))})),Object(n["ab"])((function(){var t;return null===(t=e.state.user)||void 0===t?void 0:t.uid}),(function(t){0===t&&s().then((function(t){var o=t.user,n=t.room,r=t.token;n&&e.commit("setter",{key:"room",value:n}),e.commit("setter",{key:"user",value:o}),e.commit("setter",{key:"token",value:r}),sessionStorage.setItem("user",JSON.stringify(o))}))}),{immediate:!0}),Object(n["y"])((function(){sessionStorage.clear(),u["a"].stop()}))}});o("1e60");f.render=a;var b=f,h=o("afbc"),p={user:{uid:0,nick_name:"",avatar:""},token:"",room:{room_id:"",subject:"",create_time:"",creator_name:"",creator_id:0,online_count:"",on_stage_count:""},cameraConfig:{videoInput:"",audioInput:"",video:!0,audio:!0,videoQuality:2,volume:50},speakerDevice:{deviceID:"",deviceName:"",volume:50}},v=Object(i["a"])({state:p,mutations:{setter:function(e,t){e[t.key]=t.value}},actions:{},modules:{}}),g=o("3404");o("7dd6");Object(n["i"])(b).use(v).use(h["a"]).use(c["b"]).use(m["c"]).use(d["b"]).component("icon",g["a"]).mount("#app")},de46:function(e,t,o){"use strict";o.d(t,"a",(function(){return v}));var n=o("53ca"),r=(o("b64b"),o("c975"),o("d3b7"),o("b0c0"),o("277d"),o("c46f")),a={getToken:{label:"获取token",url:"/chat_room/misc/get_web_token",method:"post",data:{ttl:1e7}},login:{label:"登录",url:"/chat_room/login",method:"post"},logout:{label:"退出登录",url:"/chat_room/login",method:"post"},roomList:{label:"拉取房间列表",url:"/chat_room/get_room_list",method:"post"},createRoom:{label:"创建房间",url:"/chat_room/create_room",method:"post"},loginRoom:{label:"进入房间",url:"/chat_room/login_room",ignoreError:!0,method:"post"},quitRoom:{label:"离开房间",url:"/chat_room/quit_room",method:"post"},closeRoom:{label:"关闭房间",url:"/chat_room/close_room",method:"post"},getAttendeeList:{label:"拉取成员列表",url:"/chat_room/get_attendee_list",method:"post"},getRaiseHandList:{label:"拉取举手列表",url:"/chat_room/get_raise_hand_list",method:"post"},getStatefulList:{label:"拉取台上用户列表",url:"/chat_room/get_stateful_list",method:"post"},operateRaiseHand:{label:"举手操作",url:"/chat_room/operate_raise_hand",method:"post"},setUserInfo:{label:"设置用户属性",url:"/chat_room/set_user_info",method:"post"},inviteOnstage:{label:"邀请上台",url:"/chat_room/invite_onstage",method:"post"},responseOnstageInvite:{label:"回应邀请",url:"/chat_room/response_onstage_invite",method:"post"},heartbeat:{label:"心跳",url:"/chat_room/heartbeat",method:"post"}},i=(o("ac1f"),o("466d"),o("0d03"),o("25f0"),o("bc3a")),u=o.n(i),c=o("3fd4"),s=o("afbc"),l={0:"成功",8e4:"用户名已在使用中",80001:"错误的参数",80002:"系统错误",80003:"房间人已满",80004:"用户已经在房间内",80005:"上麦人数已到上限",80006:"已经上麦",80007:"获得房间码失败",80008:"清理房间失败",80009:"发送房间消息失败",80010:"用户无权进行更改",80011:"目标用户不在会议房间",80012:"用户不在线",80013:"已连麦",80014:"无效的 invite token",1e5:"房间不存在",100001:"程序出错"},d=0,m=!1,f={timeout:3e4,baseURL:"https://gochat-server-sh.zego.im/"};function b(e,t){Object(c["a"])({message:e,title:"".concat(t||"请求"," - 失败"),customClass:"alert-box"})}var h=u.a.create(f);h.interceptors.request.use((function(e){return e}),(function(e){return Promise.reject(e)})),h.interceptors.response.use((function(e){var t;m=!1;var o,n,r=s["a"].currentRoute,a=e.config,i=e.data;(null===r||void 0===r?void 0:r.name)!==a.routeName||null!==(t=a.url)&&void 0!==t&&t.match("^http")||(null===i||void 0===i?void 0:i.ret.code)===d||a.ignoreError||b(0!==(null===(o=Object.keys(l))||void 0===o?void 0:o.indexOf(null===(n=i.ret.code)||void 0===n?void 0:n.toString()))?l[i.ret.code]:i.ret.message,a.label);return e.data}),(function(e){return e instanceof u.a.Cancel?Promise.reject(e.message):(e.response||m||(Object(c["a"])({customClass:"alert-box",title:"网络异常，请稍后再试"}),m=!0),Promise.reject())}));var p=h;function v(e,t){var o=Object.keys(a);if(-1===o.indexOf(e))return Promise.reject({message:"接口".concat(e,"不存在")});var i=r["a"].extend({},a[e]),u=s["a"].currentRoute;if(u&&(i.routeName=u.name),t&&"object"===Object(n["a"])(t)&&!Array.isArray(t)){var c=i.method?i.method.toUpperCase():"GET";-1!==["PUT","POST","PATCH"].indexOf(c)?i.data=r["a"].extend({},i.data||{},t):i.params=r["a"].extend({},i.params||{},t)}return p.request(i)}t["b"]={install:function(e){e.config.globalProperties.$api=v}}},ea1b:function(e,t,o){}});