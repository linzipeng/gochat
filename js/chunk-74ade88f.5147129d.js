(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-74ade88f"],{"04d1":function(e,t,n){var o=n("342f"),r=o.match(/firefox\/(\d+)/i);e.exports=!!r&&+r[1]},"0cb2":function(e,t,n){var o=n("7b0b"),r=Math.floor,c="".replace,a=/\$([$&'`]|\d{1,2}|<[^>]*>)/g,i=/\$([$&'`]|\d{1,2})/g;e.exports=function(e,t,n,u,s,d){var l=n+e.length,f=u.length,m=i;return void 0!==s&&(s=o(s),m=a),c.call(d,m,(function(o,c){var a;switch(c.charAt(0)){case"$":return"$";case"&":return e;case"`":return t.slice(0,n);case"'":return t.slice(l);case"<":a=s[c.slice(1,-1)];break;default:var i=+c;if(0===i)return o;if(i>f){var d=r(i/10);return 0===d?o:d<=f?void 0===u[d-1]?c.charAt(1):u[d-1]+c.charAt(1):o}a=u[i-1]}return void 0===a?"":a}))}},"0d03":function(e,t,n){var o=n("6eeb"),r=Date.prototype,c="Invalid Date",a="toString",i=r[a],u=r.getTime;new Date(NaN)+""!=c&&o(r,a,(function(){var e=u.call(this);return e===e?i.call(this):c}))},"136c":function(e,t,n){e.exports=n.p+"img/logo.bd204563.svg"},"25f0":function(e,t,n){"use strict";var o=n("6eeb"),r=n("825a"),c=n("d039"),a=n("ad6d"),i="toString",u=RegExp.prototype,s=u[i],d=c((function(){return"/a/b"!=s.call({source:"a",flags:"b"})})),l=s.name!=i;(d||l)&&o(RegExp.prototype,i,(function(){var e=r(this),t=String(e.source),n=e.flags,o=String(void 0===n&&e instanceof RegExp&&!("flags"in u)?a.call(e):n);return"/"+t+"/"+o}),{unsafe:!0})},2804:function(e,t,n){"use strict";n.d(t,"c",(function(){return s})),n.d(t,"b",(function(){return d})),n.d(t,"k",(function(){return l})),n.d(t,"i",(function(){return f})),n.d(t,"h",(function(){return m})),n.d(t,"e",(function(){return b})),n.d(t,"d",(function(){return v})),n.d(t,"j",(function(){return p})),n.d(t,"f",(function(){return g})),n.d(t,"g",(function(){return h})),n.d(t,"a",(function(){return O}));var o=n("1da1"),r=(n("96cf"),n("d3b7"),n("0d03"),n("25f0"),n("4de4"),n("c975"),n("4e82"),n("de46")),c=n("62d8"),a=n("1e1c"),i=n("3fd4"),u=n("8dbf"),s=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"默认房间名",n=function(e){Object(i["a"])({showClose:!1,customClass:"alert-box",message:e||"开播失败，请重试"})};return new Promise((function(o,i){Object(r["a"])("createRoom",{subject:t,cover_img:e.avatar,nick_name:e.nick_name,avatar:e.avatar}).then((function(e){var t=e.ret,r=e.data;if(t&&0===t.code){var s=r.user_info,l=r.room_info;Object(u["b"])(s.uid).then((function(e){c["d"].loginRoom(l.room_id,e,{userID:s.uid.toString(),userName:s.nick_name},{userUpdate:!0}).then((function(){Object(a["a"])({uid:s.uid,roomId:l.room_id}),o(r)}))["catch"]((function(){d(s.uid,l.room_id),i()}))}))["catch"]((function(){d(s.uid,l.room_id),i()}))}else n(),i()}))["catch"]((function(){n(),i()}))}))},d=function(e,t){Object(r["a"])("closeRoom",{uid:e,room_id:t}).then((function(e){var t=e.ret;null===t||void 0===t||t.code}))},l=function(e){var t=e.uid,n=e.room_id,o=e.nick_name,c=e.target_uid,a=e.mic,i=e.camera,u=e.type;return new Promise((function(e,s){Object(r["a"])("setStatus",{uid:t,room_id:n,nick_name:o,target_uid:c,mic:a,camera:i,type:u}).then((function(t){var n=t.ret;0===n.code?e():s()}))["catch"]((function(){s()}))}))},f=function(e,t,n,o,c){return new Promise((function(a,i){Object(r["a"])("onstageRequestAction",{uid:e,nick_name:t,room_id:o,target_uid:n,action:c}).then((function(e){var t=e.ret;if(0===t.code)a();else{var n="";80018===t.code&&(n="用户没有申请连麦或者被邀请连麦"),i(n)}}))["catch"]((function(){i()}))}))},m=function(e,t,n,o,c,a){return new Promise((function(i,u){Object(r["a"])("onstageInviteAction",{uid:e,room_id:t,target_uid:n,nick_name:o,action:c,extra:a}).then((function(e){var t=e.ret;0===t.code?i():u()}))["catch"]((function(){var e="";1===c?e="邀请":2===c?e="取消邀请":3===c?e="接受邀请":4===c&&(e="拒绝邀请"),u(e+"失败，请重试")}))}))},b=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1e3,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"1";return new Promise((function(o,c){Object(r["a"])("roomList",{count:e,direct:t,from:n}).then((function(e){var t=e.ret,n=e.data;0===(null===t||void 0===t?void 0:t.code)?o(n.room_list):c([])}))["catch"]((function(){c([])}))}))},v=function(e,t){return new Promise((function(n){Object(r["a"])("getAttendeeList",{room_id:t,uid:e}).then((function(t){var o,r=t.ret,c=t.data;0===(null===r||void 0===r?void 0:r.code)&&(null===c||void 0===c||null===(o=c.attendee_list)||void 0===o||o.sort((function(t,n){return 3===t.role?-1/0:3===n.role?1/0:t.uid===e?-1e3:n.uid===e?1e3:t.onstage_state===n.onstage_state?t.onstage_timestamp-n.onstage_timestamp:n.onstage_state-t.onstage_state})),n(c.attendee_list))}))}))},p=function(e,t,n){Object(r["a"])("setRoomStream",{uid:e,room_id:t,stream_id:n}).then((function(e){var t=e.ret;t.code}))},g=function(e,t){return new Promise((function(n,o){Object(r["a"])("loginRoom",{room_id:t,nick_name:e.nick_name,avatar:e.avatar}).then((function(r){var i=r.ret,s=r.data;if(0===(null===i||void 0===i?void 0:i.code)){var d=s.user_info;Object(u["b"])(d.uid).then((function(r){c["d"].loginRoom(t,r,{userID:d.uid.toString(),userName:e.nick_name},{userUpdate:!0}).then((function(){Object(a["a"])({uid:d.uid,roomId:t}),n({ret:i,data:s})}))["catch"]((function(){h(d.uid,t),o({ret:{code:81e3,message:"直播间已经关闭！返回首页！"},data:null})}))}))["catch"]((function(){h(d.uid,t),o({ret:{code:81e3,message:"获取token异常！返回首页！"},data:null})}))}else 80002===(null===i||void 0===i?void 0:i.code)?o({ret:{code:81e3,message:"直播间已经关闭！返回首页！"},data:null}):o({ret:{code:81001,message:"随机用户已经过期！已为你重新注册"},data:null})}))["catch"]((function(){o({ret:{code:81e3,message:"直播间已经关闭！返回首页！"},data:null})}))}))},h=function(){var e=Object(o["a"])(regeneratorRuntime.mark((function e(t,n){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return c["d"].logoutRoom(),e.next=3,Object(r["a"])("quitRoom",{uid:t,room_id:n}).then((function(e){var t=e.ret;0===(null===t||void 0===t?void 0:t.code)&&a["a"].stop()}));case 3:case"end":return e.stop()}}),e)})));return function(t,n){return e.apply(this,arguments)}}(),O=function(){var e=Object(o["a"])(regeneratorRuntime.mark((function e(){var t,n,o,r,a,i,u,s,d=arguments;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return t=d.length>0&&void 0!==d[0]?d[0]:{video:!0,audio:!0},n=t.video,o=t.audio,r="",e.prev=2,e.next=5,c["d"].createStream({camera:{video:n,audio:o}});case 5:return a=e.sent,c["d"].destroyStream(a),e.next=9,c["d"].enumDevices();case 9:i=e.sent,u=i.cameras,s=i.microphones,n&&o&&0===u.length&&0===s.length?r="未检查到可用摄像头和摄像头":n&&0===u.length?r="未检查到可用摄像头":o&&0===s.length&&(r="未检查到可用麦克风"),e.next=18;break;case 15:e.prev=15,e.t0=e["catch"](2),r=n&&o?"请先授权摄像头或麦克风权限":n?"请先授权摄像头权限":"请先授权麦克风权限";case 18:return e.abrupt("return",r);case 19:case"end":return e.stop()}}),e,null,[[2,15]])})));return function(){return e.apply(this,arguments)}}()},4727:function(e,t,n){e.exports=n.p+"img/5-cover@2x.a3df72a8.png"},"4e82":function(e,t,n){"use strict";var o=n("23e7"),r=n("1c0b"),c=n("7b0b"),a=n("50c4"),i=n("d039"),u=n("addb"),s=n("a640"),d=n("04d1"),l=n("d998"),f=n("2d00"),m=n("512c"),b=[],v=b.sort,p=i((function(){b.sort(void 0)})),g=i((function(){b.sort(null)})),h=s("sort"),O=!i((function(){if(f)return f<70;if(!(d&&d>3)){if(l)return!0;if(m)return m<603;var e,t,n,o,r="";for(e=65;e<76;e++){switch(t=String.fromCharCode(e),e){case 66:case 69:case 70:case 72:n=3;break;case 68:case 71:n=4;break;default:n=2}for(o=0;o<47;o++)b.push({k:t+o,v:n})}for(b.sort((function(e,t){return t.v-e.v})),o=0;o<b.length;o++)t=b[o].k.charAt(0),r.charAt(r.length-1)!==t&&(r+=t);return"DGBEFHACIJK"!==r}})),j=p||!g||!h||!O,x=function(e){return function(t,n){return void 0===n?-1:void 0===t?1:void 0!==e?+e(t,n)||0:String(t)>String(n)?1:-1}};o({target:"Array",proto:!0,forced:j},{sort:function(e){void 0!==e&&r(e);var t=c(this);if(O)return void 0===e?v.call(t):v.call(t,e);var n,o,i=[],s=a(t.length);for(o=0;o<s;o++)o in t&&i.push(t[o]);i=u(i,x(e)),n=i.length,o=0;while(o<n)t[o]=i[o++];while(o<s)delete t[o++];return t}})},"512c":function(e,t,n){var o=n("342f"),r=o.match(/AppleWebKit\/(\d+)\./);e.exports=!!r&&+r[1]},5319:function(e,t,n){"use strict";var o=n("d784"),r=n("825a"),c=n("50c4"),a=n("a691"),i=n("1d80"),u=n("8aa5"),s=n("0cb2"),d=n("14c3"),l=Math.max,f=Math.min,m=function(e){return void 0===e?e:String(e)};o("replace",2,(function(e,t,n,o){var b=o.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE,v=o.REPLACE_KEEPS_$0,p=b?"$":"$0";return[function(n,o){var r=i(this),c=void 0==n?void 0:n[e];return void 0!==c?c.call(n,r,o):t.call(String(r),n,o)},function(e,o){if(!b&&v||"string"===typeof o&&-1===o.indexOf(p)){var i=n(t,e,this,o);if(i.done)return i.value}var g=r(e),h=String(this),O="function"===typeof o;O||(o=String(o));var j=g.global;if(j){var x=g.unicode;g.lastIndex=0}var w=[];while(1){var _=d(g,h);if(null===_)break;if(w.push(_),!j)break;var k=String(_[0]);""===k&&(g.lastIndex=u(h,c(g.lastIndex),x))}for(var y="",S=0,C=0;C<w.length;C++){_=w[C];for(var E=String(_[0]),R=l(f(a(_.index),h.length),0),I=[],A=1;A<_.length;A++)I.push(m(_[A]));var N=_.groups;if(O){var L=[E].concat(I,R,h);void 0!==N&&L.push(N);var B=String(o.apply(void 0,L))}else B=s(E,h,R,I,N,o);R>=S&&(y+=h.slice(S,R)+B,S=R+E.length)}return y+h.slice(S)}]}))},5899:function(e,t){e.exports="\t\n\v\f\r                　\u2028\u2029\ufeff"},"58a8":function(e,t,n){var o=n("1d80"),r=n("5899"),c="["+r+"]",a=RegExp("^"+c+c+"*"),i=RegExp(c+c+"*$"),u=function(e){return function(t){var n=String(o(t));return 1&e&&(n=n.replace(a,"")),2&e&&(n=n.replace(i,"")),n}};e.exports={start:u(1),end:u(2),trim:u(3)}},8e3:function(e,t,n){e.exports=n.p+"img/3-cover@2x.f8b7f9ee.png"},"895c":function(e,t,n){},"99af":function(e,t,n){"use strict";var o=n("23e7"),r=n("d039"),c=n("e8b5"),a=n("861d"),i=n("7b0b"),u=n("50c4"),s=n("8418"),d=n("65f0"),l=n("1dde"),f=n("b622"),m=n("2d00"),b=f("isConcatSpreadable"),v=9007199254740991,p="Maximum allowed index exceeded",g=m>=51||!r((function(){var e=[];return e[b]=!1,e.concat()[0]!==e})),h=l("concat"),O=function(e){if(!a(e))return!1;var t=e[b];return void 0!==t?!!t:c(e)},j=!g||!h;o({target:"Array",proto:!0,forced:j},{concat:function(e){var t,n,o,r,c,a=i(this),l=d(a,0),f=0;for(t=-1,o=arguments.length;t<o;t++)if(c=-1===t?a:arguments[t],O(c)){if(r=u(c.length),f+r>v)throw TypeError(p);for(n=0;n<r;n++,f++)n in c&&s(l,f,c[n])}else{if(f>=v)throw TypeError(p);s(l,f++,c)}return l.length=f,l}})},"9e16":function(e,t,n){e.exports=n.p+"img/4-cover@2x.05d2a46e.png"},aa2f:function(e,t,n){"use strict";n("895c")},addb:function(e,t){var n=Math.floor,o=function(e,t){var a=e.length,i=n(a/2);return a<8?r(e,t):c(o(e.slice(0,i),t),o(e.slice(i),t),t)},r=function(e,t){var n,o,r=e.length,c=1;while(c<r){o=c,n=e[c];while(o&&t(e[o-1],n)>0)e[o]=e[--o];o!==c++&&(e[o]=n)}return e},c=function(e,t,n){var o=e.length,r=t.length,c=0,a=0,i=[];while(c<o||a<r)c<o&&a<r?i.push(n(e[c],t[a])<=0?e[c++]:t[a++]):i.push(c<o?e[c++]:t[a++]);return i};e.exports=o},bba6:function(e,t,n){e.exports=n.p+"img/0-cover@2x.1eda5101.png"},c20d:function(e,t,n){var o=n("da84"),r=n("58a8").trim,c=n("5899"),a=o.parseInt,i=/^[+-]?0[Xx]/,u=8!==a(c+"08")||22!==a(c+"0x16");e.exports=u?function(e,t){var n=r(String(e));return a(n,t>>>0||(i.test(n)?16:10))}:a},d95b:function(e,t,n){var o={"./0-cover@2x.png":"bba6","./1-cover@2x.png":"edea","./2-cover@2x.png":"eb82","./3-cover@2x.png":"8000","./4-cover@2x.png":"9e16","./5-cover@2x.png":"4727","./6-cover@2x.png":"f4e7","./7-cover@2x.png":"e9cf"};function r(e){var t=c(e);return n(t)}function c(e){if(!n.o(o,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return o[e]}r.keys=function(){return Object.keys(o)},r.resolve=c,e.exports=r,r.id="d95b"},d998:function(e,t,n){var o=n("342f");e.exports=/MSIE|Trident/.test(o)},e25e:function(e,t,n){var o=n("23e7"),r=n("c20d");o({global:!0,forced:parseInt!=r},{parseInt:r})},e9cf:function(e,t,n){e.exports=n.p+"img/7-cover@2x.405a342d.png"},eb82:function(e,t,n){e.exports=n.p+"img/2-cover@2x.d967b46a.png"},edea:function(e,t,n){e.exports=n.p+"img/1-cover@2x.c0cb027e.png"},f4e7:function(e,t,n){e.exports=n.p+"img/6-cover@2x.e26fe486.png"},fc0d:function(e,t,n){"use strict";n.r(t);var o=n("7a23"),r=n("136c"),c=n.n(r),a=Object(o["n"])("div",{class:"height-56"},[Object(o["n"])("img",{src:c.a}),Object(o["n"])("span",{class:"room-list-title"}," 多人连麦直播")],-1),i={class:"height-56"},u=Object(o["m"])("用户协议"),s=Object(o["m"])("隐私协议"),d=Object(o["m"])("关于我们"),l=Object(o["m"])("应用版本 "),f=Object(o["n"])("span",{style:{float:"right",color:"#82798f"}},"v1.0.0",-1),m=Object(o["m"])("SDK版本 "),b={style:{float:"right",color:"#82798f"}},v=Object(o["n"])("span",{class:"one-line"},null,-1),p={class:"playing-tag"},g=Object(o["n"])("span",null,"正在直播",-1),h={class:"room-cards"},O={class:"room-cover-container"},j={class:"room-message"},x={class:"subject"},w={class:"room-number"},_={style:{"vertical-align":"middle"}},k={class:"goto-look"},y=Object(o["m"])(" 去观看 "),S={key:1,class:"empty-room"};function C(e,t,r,c,C,E){var R=Object(o["N"])("el-popover"),I=Object(o["N"])("icon"),A=Object(o["N"])("el-dropdown-item"),N=Object(o["N"])("el-dropdown-menu"),L=Object(o["N"])("el-dropdown"),B=Object(o["N"])("el-header"),T=Object(o["N"])("el-main"),P=Object(o["N"])("el-container"),D=Object(o["O"])("popover");return Object(o["E"])(),Object(o["j"])(P,{class:"room-list"},{default:Object(o["cb"])((function(){return[Object(o["n"])(B,{height:"56px",class:"room-list-header"},{default:Object(o["cb"])((function(){return[a,Object(o["n"])("div",i,[Object(o["db"])(Object(o["n"])("div",{class:"icon-feedback",onClick:t[1]||(t[1]=function(t){return e.gotoLink()})},null,512),[[D,void 0,"feedback-popover"]]),Object(o["n"])(R,{ref:"feedback-popover",placement:"bottom","popper-class":"about-popover feedback-popover-position",trigger:"hover","show-arrow":!1,offset:12,content:"意见反馈"},null,512),Object(o["n"])(R,{ref:"about-popover",placement:"bottom","popper-class":"about-popover about-popover-position",trigger:"hover","show-arrow":!1,content:"关于"},null,512),Object(o["n"])(L,{trigger:"click",onCommand:e.handleCommand},{dropdown:Object(o["cb"])((function(){return[Object(o["n"])(N,{class:"about-menu about-positon"},{default:Object(o["cb"])((function(){return[Object(o["n"])(A,{command:"userAgreement"},{default:Object(o["cb"])((function(){return[u]})),_:1}),Object(o["n"])(A,{command:"privacyAgreement"},{default:Object(o["cb"])((function(){return[s]})),_:1}),Object(o["n"])(A,{command:"aboutUs"},{default:Object(o["cb"])((function(){return[d]})),_:1}),Object(o["n"])(A,{divided:"",class:"nothing"},{default:Object(o["cb"])((function(){return[l,f]})),_:1}),Object(o["n"])(A,{class:"nothing"},{default:Object(o["cb"])((function(){return[m,Object(o["n"])("span",b,"v"+Object(o["R"])(e.getVersion()),1)]})),_:1})]})),_:1})]})),default:Object(o["cb"])((function(){return[Object(o["db"])(Object(o["n"])(I,{name:"icon_about_normal",class:"about-icon",isButton:!0},null,512),[[D,void 0,"about-popover"]])]})),_:1},8,["onCommand"]),v,Object(o["n"])("span",{class:"small-button zg-button",onClick:t[2]||(t[2]=function(t){return e.gotoLiveRoom()})},"我要开播")])]})),_:1}),Object(o["n"])(T,{class:"room-card-container"},{default:Object(o["cb"])((function(){var t;return[null!==(t=e.roomList)&&void 0!==t&&t.length?(Object(o["E"])(),Object(o["j"])(o["b"],{key:0},[Object(o["n"])("div",p,[Object(o["n"])(I,{name:"icon_camrea",class:"playing-icon"}),g]),Object(o["n"])("div",h,[(Object(o["E"])(!0),Object(o["j"])(o["b"],null,Object(o["L"])(e.roomList,(function(t){return Object(o["E"])(),Object(o["j"])("div",{key:t.room_id,onClick:function(n){return e.gotoLiveRoom(t)},class:"room-card"},[Object(o["n"])("div",O,[Object(o["n"])("img",{class:"room-cover",src:n("d95b")("./".concat(t.cover_img,"-cover@2x.png"))},null,8,["src"])]),Object(o["n"])("div",j,[Object(o["n"])("p",x,Object(o["R"])(t.subject),1),Object(o["n"])("div",w,[Object(o["n"])("div",null,[Object(o["n"])(I,{name:"icon_people",class:"room-person"}),Object(o["n"])("span",_,Object(o["R"])(t.online),1)]),Object(o["n"])("div",k,[y,Object(o["n"])(I,{name:"icon_into",style:{width:"9px",height:"9px"}})])])])],8,["onClick"])})),128))])],64)):(Object(o["E"])(),Object(o["j"])("div",S,"暂无在线房间，快去创建吧"))]})),_:1})]})),_:1})}n("ac1f"),n("5319"),n("c975"),n("466d"),n("e25e"),n("99af"),n("4795");var E=n("5502"),R=n("6c02"),I=n("3fd4"),A=n("2804"),N=n("62d8"),L=n("3404"),B=Object(o["o"])({components:{icon:L["a"]},setup:function(){var e=Object(E["b"])(),t=Object(R["d"])(),n=0,r=Object(o["J"])([]),c=function(n){e.state.browserIsSupport?n?t.push({path:"/liveRoom/".concat(n.room_id)}):I["b"].prompt("","创建直播间",{showInput:!0,customClass:"create-room-message",showCancelButton:!1,confirmButtonClass:"zg-button small-button",confirmButtonText:"创建直播",inputPlaceholder:"请输入直播间名称",inputValue:"".concat(e.state.user.nick_name,"创建的直播间"),inputValidator:function(e){if(e.length>15){var t=document.querySelector(".create-room-message .el-input input");t.value=e.substring(0,15)}var n=document.querySelector(".create-room-message .zg-button");return n.className=e?n.className.replace("disabled-zg-button",""):"".concat(n.className," disabled-zg-button"),!!e}}).then((function(e){var n=e.value;t.push({name:"LiveRoom",params:{roomId:"100000",name:n.substring(0,15)}})})):Object(I["b"])({title:"浏览器不支持",message:"您当前的浏览器不符合直播间要求，为获得更好的直播体验，请安装最新版本的 Chrome 浏览器",center:!0,showClose:!1,closeOnClickModal:!1,showCancelButton:!0,showConfirmButton:!0,customClass:"message-box",cancelButtonText:"我知道了",confirmButtonText:"去下载",cancelButtonClass:"message-cancel-btn border-radius-5 ",confirmButtonClass:"zg-button small-button border-radius-5 "}).then((function(){window.open("https://oomake.com/download/chrome","_blank")}))},a=function(){n&&(window.clearInterval(n),n=0)},i=function(e){var t="";"userAgreement"===e?t="https://www.zego.im/terms":"privacyAgreement"===e?t="https://www.zego.im/privacy":"aboutUs"===e&&(t="https://www.zego.im/team"),t&&window.open(t,"_blank")},u=function(){var e=navigator.userAgent.toLowerCase(),t={},n={IE:window.ActiveXObject||"ActiveXObject"in window,Chrome:e.indexOf("chrome")>-1&&e.indexOf("safari")>-1,Firefox:e.indexOf("firefox")>-1,Opera:e.indexOf("opera")>-1,Safari:e.indexOf("safari")>-1&&-1==e.indexOf("chrome"),Edge:e.indexOf("edge")>-1,QQBrowser:/qqbrowser/.test(e),WeixinBrowser:/MicroMessenger/i.test(e)};for(var o in n)if(n[o]){var r="";if("IE"==o)r=e.match(/(msie\s|trident.*rv:)([\w.]+)/)[2];else if("Chrome"==o){for(var c in navigator.mimeTypes)"application/360softmgrplugin"==navigator.mimeTypes[c]["type"]&&(o="360");r=e.match(/chrome\/([\d.]+)/)[1]}else"Firefox"==o?r=e.match(/firefox\/([\d.]+)/)[1]:"Opera"==o?r=e.match(/opera\/([\d.]+)/)[1]:"Safari"==o?r=e.match(/version\/([\d.]+)/)[1]:"Edge"==o?r=e.match(/edge\/([\d.]+)/)[1]:"QQBrowser"==o&&(r=e.match(/qqbrowser\/([\d.]+)/)[1]);t.type=o,t.versions=parseInt(r)}return t},s=function(){var e=u();window.open("https://demo-operation.zego.im/feedback/goenjoy/index.html?platform=32&system_version=".concat(e.type,"&app_version=").concat(e.versions,"&sdk_version=").concat(Object(N["c"])(),"&client=").concat(Object(N["c"])()),"_blank")};return Object(o["x"])((function(){a();var e=function(){Object(A["e"])().then((function(e){r.value=e}))["catch"]((function(){Object(I["a"])({customClass:"alert-box alert-box-40",message:"网络异常，请检查网络后重试"})}))};e(),n=window.setInterval(e,2e3)})),Object(o["y"])((function(){sessionStorage.removeItem("checkFinish"),a()})),{roomList:r,gotoLiveRoom:c,getVersion:N["c"],handleCommand:i,gotoLink:s}}});n("aa2f");B.render=C;t["default"]=B}}]);