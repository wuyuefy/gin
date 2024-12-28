// ==UserScript==
// @name         店小秘自定义插件
// @namespace    http://tampermonkey.net/
// @version      2024-11-13
// @description  店小秘 跨境店 编辑设置初始化
// @author       You
// @match        https://www.dianxiaomi.com/*
// @match        https://*/*dp/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dianxiaomi.com
// @require      https://unpkg.com/sweetalert2@10.16.6/dist/sweetalert2.min.js
// @require      https://unpkg.com/hotkeys-js@3.13.3/dist/hotkeys.min.js
// @require      https://dianxiaomi.us.kg/js/temu.js
// @resource     swalStyle https://unpkg.com/sweetalert2@10.16.6/dist/sweetalert2.min.css
// @grant        GM_registerMenuCommand
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @grant        GM_deleteValues
// @grant        GM_listValues
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

// (async () => {
//     // let url = "https://dianxiaomi.pages.dev/js/temu.js"
//     let url = "https://dianxiaomi.us.kg/js/temu.js"
//     let script = document.createElement("script");
//     script.type = "text/javascript";
//     script.src = url;
//     document.body.appendChild(script);
// })()