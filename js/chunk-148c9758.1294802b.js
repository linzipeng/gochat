(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-148c9758"],{"04d1":function(t,e,n){var o=n("342f"),c=o.match(/firefox\/(\d+)/i);t.exports=!!c&&+c[1]},"0cb2":function(t,e,n){var o=n("7b0b"),c=Math.floor,r="".replace,i=/\$([$&'`]|\d{1,2}|<[^>]*>)/g,a=/\$([$&'`]|\d{1,2})/g;t.exports=function(t,e,n,u,s,d){var l=n+t.length,f=u.length,b=a;return void 0!==s&&(s=o(s),b=i),r.call(d,b,(function(o,r){var i;switch(r.charAt(0)){case"$":return"$";case"&":return t;case"`":return e.slice(0,n);case"'":return e.slice(l);case"<":i=s[r.slice(1,-1)];break;default:var a=+r;if(0===a)return o;if(a>f){var d=c(a/10);return 0===d?o:d<=f?void 0===u[d-1]?r.charAt(1):u[d-1]+r.charAt(1):o}i=u[a-1]}return void 0===i?"":i}))}},"0d03":function(t,e,n){var o=n("6eeb"),c=Date.prototype,r="Invalid Date",i="toString",a=c[i],u=c.getTime;new Date(NaN)+""!=r&&o(c,i,(function(){var t=u.call(this);return t===t?a.call(this):r}))},"136c":function(t,e,n){t.exports=n.p+"img/logo.bd204563.svg"},"25f0":function(t,e,n){"use strict";var o=n("6eeb"),c=n("825a"),r=n("d039"),i=n("ad6d"),a="toString",u=RegExp.prototype,s=u[a],d=r((function(){return"/a/b"!=s.call({source:"a",flags:"b"})})),l=s.name!=a;(d||l)&&o(RegExp.prototype,a,(function(){var t=c(this),e=String(t.source),n=t.flags,o=String(void 0===n&&t instanceof RegExp&&!("flags"in u)?i.call(t):n);return"/"+e+"/"+o}),{unsafe:!0})},2804:function(t,e,n){"use strict";n.d(e,"b",(function(){return s})),n.d(e,"a",(function(){return d})),n.d(e,"j",(function(){return l})),n.d(e,"h",(function(){return f})),n.d(e,"g",(function(){return b})),n.d(e,"d",(function(){return m})),n.d(e,"c",(function(){return v})),n.d(e,"i",(function(){return p})),n.d(e,"e",(function(){return g})),n.d(e,"f",(function(){return h}));var o=n("1da1"),c=(n("96cf"),n("d3b7"),n("0d03"),n("25f0"),n("4de4"),n("c975"),n("4e82"),n("de46")),r=n("62d8"),i=n("1e1c"),a=n("3fd4"),u=n("8dbf"),s=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"默认房间名",n=function(t){Object(a["a"])({showClose:!1,customClass:"alert-box",message:t||"创建失败，请重试"})};return new Promise((function(o,a){Object(c["a"])("createRoom",{subject:e,cover_img:t.avatar,nick_name:t.nick_name,avatar:t.avatar}).then((function(t){var e=t.ret,c=t.data;if(e&&0===e.code){var s=c.user_info,l=c.room_info;Object(u["b"])(s.uid).then((function(t){r["d"].loginRoom(l.room_id,t,{userID:s.uid.toString(),userName:s.nick_name},{userUpdate:!0}).then((function(){Object(i["a"])({uid:s.uid,roomId:l.room_id}),o(c)}))["catch"]((function(){d(s.uid,l.room_id),a()}))}))["catch"]((function(){d(s.uid,l.room_id),a()}))}else n(),a()}))["catch"]((function(){n(),a()}))}))},d=function(t,e){Object(c["a"])("closeRoom",{uid:t,room_id:e}).then((function(t){var e=t.ret;null===e||void 0===e||e.code}))},l=function(t){var e=t.uid,n=t.room_id,o=t.nick_name,r=t.target_uid,i=t.mic,a=t.camera,u=t.type;return new Promise((function(t,s){Object(c["a"])("setStatus",{uid:e,room_id:n,nick_name:o,target_uid:r,mic:i,camera:a,type:u}).then((function(e){var n=e.ret;0===n.code?t():s()}))["catch"]((function(){s()}))}))},f=function(t,e,n,o,r){return new Promise((function(i,a){Object(c["a"])("onstageRequestAction",{uid:t,nick_name:e,room_id:o,target_uid:n,action:r}).then((function(t){var e=t.ret;0===e.code?i():a()}))["catch"]((function(){a()}))}))},b=function(t,e,n,o,r){return new Promise((function(i,a){Object(c["a"])("onstageInviteAction",{uid:t,room_id:e,target_uid:n,nick_name:o,action:r}).then((function(t){var e=t.ret;0===e.code?i():a()}))["catch"]((function(){a()}))}))},m=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1e3,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"1";return new Promise((function(o,r){Object(c["a"])("roomList",{count:t,direct:e,from:n}).then((function(t){var e=t.ret,n=t.data;0===(null===e||void 0===e?void 0:e.code)?o(n.room_list):r([])}))["catch"]((function(){r([])}))}))},v=function(t,e){return new Promise((function(n){Object(c["a"])("getAttendeeList",{room_id:e,uid:t}).then((function(e){var o,c=e.ret,r=e.data;0===(null===c||void 0===c?void 0:c.code)&&(null===r||void 0===r||null===(o=r.attendee_list)||void 0===o||o.sort((function(e,n){return 3===e.role?-1/0:3===n.role?1/0:e.uid===t?-1e3:n.uid===t?1e3:e.onstage_state===n.onstage_state?e.onstage_timestamp-n.onstage_timestamp:n.onstage_state-e.onstage_state})),n(r.attendee_list))}))}))},p=function(t,e,n){Object(c["a"])("setRoomStream",{uid:t,room_id:e,stream_id:n}).then((function(t){var e=t.ret;e.code}))},g=function(t,e){return new Promise((function(n,o){Object(c["a"])("loginRoom",{room_id:e,nick_name:t.nick_name,avatar:t.avatar}).then((function(c){var a=c.ret,s=c.data;if(0===(null===a||void 0===a?void 0:a.code)){var d=s.user_info;Object(u["b"])(d.uid).then((function(c){r["d"].loginRoom(e,c,{userID:d.uid.toString(),userName:t.nick_name},{userUpdate:!0}).then((function(){Object(i["a"])({uid:d.uid,roomId:e}),n({ret:a,data:s})}))["catch"]((function(){h(d.uid,e),o({ret:{code:81e3,message:"直播间已经关闭！返回首页！"},data:null})}))}))["catch"]((function(){h(d.uid,e),o({ret:{code:81e3,message:"获取token异常！返回首页！"},data:null})}))}else 80002===(null===a||void 0===a?void 0:a.code)?o({ret:{code:81e3,message:"直播间已经关闭！返回首页！"},data:null}):o({ret:{code:81001,message:"随机用户已经过期！已为你重新注册"},data:null})}))["catch"]((function(){o({ret:{code:81e3,message:"直播间已经关闭！返回首页！"},data:null})}))}))},h=function(){var t=Object(o["a"])(regeneratorRuntime.mark((function t(e,n){return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return r["d"].logoutRoom(),t.next=3,Object(c["a"])("quitRoom",{uid:e,room_id:n}).then((function(t){var e=t.ret;0===(null===e||void 0===e?void 0:e.code)&&i["a"].stop()}));case 3:case"end":return t.stop()}}),t)})));return function(e,n){return t.apply(this,arguments)}}()},4727:function(t,e,n){t.exports=n.p+"img/5-cover@2x.a3df72a8.png"},"4e82":function(t,e,n){"use strict";var o=n("23e7"),c=n("1c0b"),r=n("7b0b"),i=n("50c4"),a=n("d039"),u=n("addb"),s=n("a640"),d=n("04d1"),l=n("d998"),f=n("2d00"),b=n("512c"),m=[],v=m.sort,p=a((function(){m.sort(void 0)})),g=a((function(){m.sort(null)})),h=s("sort"),j=!a((function(){if(f)return f<70;if(!(d&&d>3)){if(l)return!0;if(b)return b<603;var t,e,n,o,c="";for(t=65;t<76;t++){switch(e=String.fromCharCode(t),t){case 66:case 69:case 70:case 72:n=3;break;case 68:case 71:n=4;break;default:n=2}for(o=0;o<47;o++)m.push({k:e+o,v:n})}for(m.sort((function(t,e){return e.v-t.v})),o=0;o<m.length;o++)e=m[o].k.charAt(0),c.charAt(c.length-1)!==e&&(c+=e);return"DGBEFHACIJK"!==c}})),O=p||!g||!h||!j,_=function(t){return function(e,n){return void 0===n?-1:void 0===e?1:void 0!==t?+t(e,n)||0:String(e)>String(n)?1:-1}};o({target:"Array",proto:!0,forced:O},{sort:function(t){void 0!==t&&c(t);var e=r(this);if(j)return void 0===t?v.call(e):v.call(e,t);var n,o,a=[],s=i(e.length);for(o=0;o<s;o++)o in e&&a.push(e[o]);a=u(a,_(t)),n=a.length,o=0;while(o<n)e[o]=a[o++];while(o<s)delete e[o++];return e}})},"512c":function(t,e,n){var o=n("342f"),c=o.match(/AppleWebKit\/(\d+)\./);t.exports=!!c&&+c[1]},5319:function(t,e,n){"use strict";var o=n("d784"),c=n("825a"),r=n("50c4"),i=n("a691"),a=n("1d80"),u=n("8aa5"),s=n("0cb2"),d=n("14c3"),l=Math.max,f=Math.min,b=function(t){return void 0===t?t:String(t)};o("replace",2,(function(t,e,n,o){var m=o.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE,v=o.REPLACE_KEEPS_$0,p=m?"$":"$0";return[function(n,o){var c=a(this),r=void 0==n?void 0:n[t];return void 0!==r?r.call(n,c,o):e.call(String(c),n,o)},function(t,o){if(!m&&v||"string"===typeof o&&-1===o.indexOf(p)){var a=n(e,t,this,o);if(a.done)return a.value}var g=c(t),h=String(this),j="function"===typeof o;j||(o=String(o));var O=g.global;if(O){var _=g.unicode;g.lastIndex=0}var w=[];while(1){var x=d(g,h);if(null===x)break;if(w.push(x),!O)break;var k=String(x[0]);""===k&&(g.lastIndex=u(h,r(g.lastIndex),_))}for(var S="",C=0,y=0;y<w.length;y++){x=w[y];for(var R=String(x[0]),E=l(f(i(x.index),h.length),0),I=[],N=1;N<x.length;N++)I.push(b(x[N]));var A=x.groups;if(j){var L=[R].concat(I,E,h);void 0!==A&&L.push(A);var P=String(o.apply(void 0,L))}else P=s(R,h,E,I,A,o);E>=C&&(S+=h.slice(C,E)+P,C=E+R.length)}return S+h.slice(C)}]}))},8e3:function(t,e,n){t.exports=n.p+"img/3-cover@2x.f8b7f9ee.png"},"9e16":function(t,e,n){t.exports=n.p+"img/4-cover@2x.05d2a46e.png"},addb:function(t,e){var n=Math.floor,o=function(t,e){var i=t.length,a=n(i/2);return i<8?c(t,e):r(o(t.slice(0,a),e),o(t.slice(a),e),e)},c=function(t,e){var n,o,c=t.length,r=1;while(r<c){o=r,n=t[r];while(o&&e(t[o-1],n)>0)t[o]=t[--o];o!==r++&&(t[o]=n)}return t},r=function(t,e,n){var o=t.length,c=e.length,r=0,i=0,a=[];while(r<o||i<c)r<o&&i<c?a.push(n(t[r],e[i])<=0?t[r++]:e[i++]):a.push(r<o?t[r++]:e[i++]);return a};t.exports=o},b1a5:function(t,e,n){"use strict";n("cf36")},bba6:function(t,e,n){t.exports=n.p+"img/0-cover@2x.1eda5101.png"},cf36:function(t,e,n){},d95b:function(t,e,n){var o={"./0-cover@2x.png":"bba6","./1-cover@2x.png":"edea","./2-cover@2x.png":"eb82","./3-cover@2x.png":"8000","./4-cover@2x.png":"9e16","./5-cover@2x.png":"4727","./6-cover@2x.png":"f4e7","./7-cover@2x.png":"e9cf"};function c(t){var e=r(t);return n(e)}function r(t){if(!n.o(o,t)){var e=new Error("Cannot find module '"+t+"'");throw e.code="MODULE_NOT_FOUND",e}return o[t]}c.keys=function(){return Object.keys(o)},c.resolve=r,t.exports=c,c.id="d95b"},d998:function(t,e,n){var o=n("342f");t.exports=/MSIE|Trident/.test(o)},e9cf:function(t,e,n){t.exports=n.p+"img/7-cover@2x.405a342d.png"},eb82:function(t,e,n){t.exports=n.p+"img/2-cover@2x.d967b46a.png"},edea:function(t,e,n){t.exports=n.p+"img/1-cover@2x.c0cb027e.png"},f4e7:function(t,e,n){t.exports=n.p+"img/6-cover@2x.e26fe486.png"},fc0d:function(t,e,n){"use strict";n.r(e);var o=n("7a23"),c=n("136c"),r=n.n(c),i=Object(o["n"])("div",{class:"height-56"},[Object(o["n"])("img",{src:r.a}),Object(o["n"])("span",{class:"room-list-title"}," 互动直播")],-1),a={class:"height-56"},u={class:"icon-feedback"},s=Object(o["m"])("用户协议"),d=Object(o["m"])("隐私协议"),l=Object(o["m"])("关于我们"),f=Object(o["m"])("应用版本 "),b=Object(o["n"])("span",{style:{float:"right",color:"#82798F"}},"v1.0.0",-1),m=Object(o["m"])("SDK版本 "),v={style:{float:"right",color:"#82798F"}},p=Object(o["n"])("span",{class:"one-line"},null,-1),g={class:"playing-tag"},h=Object(o["n"])("span",null,"正在直播",-1),j={class:"room-cards"},O={class:"room-cover-container"},_={class:"room-message"},w={class:"subject"},x={class:"room-number"},k=Object(o["n"])("div",{class:"goto-look"},"去观看 >",-1),S={key:1,class:"empty-room"};function C(t,e,c,r,C,y){var R=Object(o["N"])("el-popover"),E=Object(o["N"])("icon"),I=Object(o["N"])("el-dropdown-item"),N=Object(o["N"])("el-dropdown-menu"),A=Object(o["N"])("el-dropdown"),L=Object(o["N"])("el-header"),P=Object(o["N"])("el-main"),B=Object(o["N"])("el-container"),D=Object(o["O"])("popover");return Object(o["E"])(),Object(o["j"])(B,{class:"room-list"},{default:Object(o["cb"])((function(){return[Object(o["n"])(L,{height:"56px",class:"room-list-header"},{default:Object(o["cb"])((function(){return[i,Object(o["n"])("div",a,[Object(o["db"])(Object(o["n"])("div",u,null,512),[[D,void 0,"feedback-popover"]]),Object(o["n"])(R,{ref:"feedback-popover",placement:"bottom","popper-class":"about-popover feedback-popover-position",trigger:"hover","show-arrow":!1,offset:12,content:"意见反馈"},null,512),Object(o["n"])(R,{ref:"about-popover",placement:"bottom","popper-class":"about-popover about-popover-position",trigger:"hover","show-arrow":!1,content:"关于"},null,512),Object(o["n"])(A,{trigger:"click",onCommand:t.handleCommand},{dropdown:Object(o["cb"])((function(){return[Object(o["n"])(N,{class:"about-menu about-positon"},{default:Object(o["cb"])((function(){return[Object(o["n"])(I,{command:"userAgreement"},{default:Object(o["cb"])((function(){return[s]})),_:1}),Object(o["n"])(I,{command:"privacyAgreement"},{default:Object(o["cb"])((function(){return[d]})),_:1}),Object(o["n"])(I,{command:"aboutUs"},{default:Object(o["cb"])((function(){return[l]})),_:1}),Object(o["n"])(I,{divided:"",class:"nothing"},{default:Object(o["cb"])((function(){return[f,b]})),_:1}),Object(o["n"])(I,{class:"nothing"},{default:Object(o["cb"])((function(){return[m,Object(o["n"])("span",v,"v"+Object(o["R"])(t.getVersion()),1)]})),_:1})]})),_:1})]})),default:Object(o["cb"])((function(){return[Object(o["db"])(Object(o["n"])(E,{name:"icon_about_normal",class:"about-icon",isButton:!0},null,512),[[D,void 0,"about-popover"]])]})),_:1},8,["onCommand"]),p,Object(o["n"])("span",{class:"small-button zg-button",onClick:e[1]||(e[1]=function(e){return t.gotoLiveRoom()})},"我要开播")])]})),_:1}),Object(o["n"])(P,{class:"room-card-container"},{default:Object(o["cb"])((function(){var e;return[null!==(e=t.roomList)&&void 0!==e&&e.length?(Object(o["E"])(),Object(o["j"])(o["b"],{key:0},[Object(o["n"])("div",g,[Object(o["n"])(E,{name:"icon_camrea",class:"playing-icon"}),h]),Object(o["n"])("div",j,[(Object(o["E"])(!0),Object(o["j"])(o["b"],null,Object(o["L"])(t.roomList,(function(e){return Object(o["E"])(),Object(o["j"])("div",{key:e.room_id,onClick:function(n){return t.gotoLiveRoom(e)},class:"room-card"},[Object(o["n"])("div",O,[Object(o["n"])("img",{class:"room-cover",src:n("d95b")("./".concat(e.cover_img,"-cover@2x.png"))},null,8,["src"])]),Object(o["n"])("div",_,[Object(o["n"])("p",w,Object(o["R"])(e.subject),1),Object(o["n"])("div",x,[Object(o["n"])("div",null,[Object(o["n"])(E,{name:"icon_people",class:"room-person"}),Object(o["n"])("span",null,Object(o["R"])(e.online),1)]),k])])],8,["onClick"])})),128))])],64)):(Object(o["E"])(),Object(o["j"])("div",S,"暂无在线房间，快去创建吧"))]})),_:1})]})),_:1})}n("ac1f"),n("5319"),n("4795");var y=n("5502"),R=n("6c02"),E=n("3fd4"),I=n("2804"),N=n("62d8"),A=n("3404"),L=Object(o["o"])({components:{icon:A["a"]},setup:function(){var t=Object(y["b"])(),e=Object(R["d"])(),n=0,c=Object(o["J"])([]),r=function(n){t.state.browserIsSupport?n?e.push({path:"/liveRoom/".concat(n.room_id)}):E["b"].prompt("","创建直播间",{showInput:!0,customClass:"create-room-message",showCancelButton:!1,confirmButtonClass:"zg-button small-button",confirmButtonText:"创建直播",inputPlaceholder:"请输入直播间名称",inputValue:"".concat(t.state.user.nick_name,"创建的直播间"),inputValidator:function(t){if(t.length>15){var e=document.querySelector(".create-room-message .el-input input");e.value=t.substring(0,15)}var n=document.querySelector(".create-room-message .zg-button");return n.className=t?n.className.replace("disabled-zg-button",""):"".concat(n.className," disabled-zg-button"),!!t}}).then((function(t){var n=t.value;e.push({name:"LiveRoom",params:{roomId:"100000",name:n.substring(0,15)}})})):Object(E["b"])({title:"浏览器不支持",message:"您当前的浏览器不符合直播间要求，为获得更好的直播体验，请安装最新版本的 Chrome 浏览器",center:!0,showClose:!1,closeOnClickModal:!1,showCancelButton:!0,showConfirmButton:!0,customClass:"message-box",cancelButtonText:"我知道了",confirmButtonText:"去下载",cancelButtonClass:"message-cancel-btn border-radius-5 ",confirmButtonClass:"zg-button small-button border-radius-5 "}).then((function(){window.open("https://oomake.com/download/chrome","_blank")}))},i=function(){n&&(window.clearInterval(n),n=0)},a=function(t){var e="";"userAgreement"===t?e="https://www.zego.im/terms":"privacyAgreement"===t?e="https://www.zego.im/privacy":"aboutUs"===t&&(e="https://www.zego.im/team"),e&&window.open(e,"_blank")};return Object(o["x"])((function(){i();var t=function(){Object(I["d"])().then((function(t){c.value=t}))};t(),n=window.setInterval(t,2e3)})),Object(o["y"])((function(){sessionStorage.removeItem("checkFinish"),i()})),{roomList:c,gotoLiveRoom:r,getVersion:N["c"],handleCommand:a}}});n("b1a5");L.render=C;e["default"]=L}}]);