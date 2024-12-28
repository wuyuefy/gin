'use strict'

let amazon = {
    base: {},
    // 产品变体选项下面的概述
    getOverview() {
        let data = {}
        document.querySelectorAll(`#productOverview_feature_div tr`).forEach(item => {
            let tds = item.querySelectorAll('span')
            if (tds[0].innerText.trim().toLowerCase() === "brand") {
                this.base.brand = tds[0].innerText
            }
            data[tds[0].innerText.trim()] = tds[1].innerText.trim()
        })
        return data
    },
    // About this item
    getFeature() {
        let data = []
        document.querySelectorAll(`#feature-bullets ul span`).forEach(item => data.push(item.innerText))
        return data
    },
    // Technical Details
    getDetails() {
        let data = {}
        document.querySelectorAll(`#prodDetails tr`).forEach(item => {
            let key = item.querySelector("th").innerText.trim()
            let value = item.querySelector("td").innerText.trim().replace("\t", "")
            if (!["Customer Reviews", "Best Sellers Rank"].includes(key)) {
                data[key] = value
            }
            if (key.toLowerCase() === "brand") {
                this.base.brand = key
            }
        })
        return data
    },
    // Product information
    getInformation() {
        let data = {}
        document.querySelectorAll(`#productDetails_expanderSectionTables tr`).forEach(item => {
            let key = item.querySelector("th").innerText.trim()
            let value = item.querySelector("td").innerText.trim().replace("\t", "")
            if (!["Customer Reviews", "Best Sellers Rank"].includes(key)) {
                data[key] = value
            }
            if (key.toLowerCase() === "brand") {
                this.base.brand = key
            }
        })
        return data
    },
    // 选择的产品
    getSelection() {
        let data = {}
        let selection = document.querySelectorAll("#twisterContainer .selection")
        if (selection.length === 0) {
            return data
        }
        selection.forEach(el => {
            data[el.previousElementSibling.innerText.replace(":", "").trim()] = el.innerText.trim()
        })
        return data
    },
    // 是否亚马逊
    isAmazon(str) {
        str = str.trim().toLowerCase()
        return str === "amazon" || document.location.hostname.includes(str)
    },
    // 获取配送时间
    getData(rightCol) {
        let fail = true
        let dataStr = rightCol.querySelector(`#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE span[class="a-text-bold"]`)
        if (!dataStr) {
            utils.error("货物无法配送")
            return fail
        }
        dataStr = dataStr.innerText
        // console.log(dataStr)
        let date = null
        let current = new Date()
        current.setHours(0, 0, 0, 0)
        if (typeof dataStr !== "string" || dataStr.length === 0) {
            utils.error("送达日期存在问题")
            return fail
        }
        let dataList = dataStr.split("-")
        let lastDate = ""
        if (dataList.length > 1) {
            lastDate = dataList[1].trim()
            if (!lastDate.includes(" ")) {
                lastDate = `${dataList[0].split(" ")[0]} ${lastDate}`
            }
            date = new Date(`${lastDate} ${current.getFullYear()}`)
        } else {
            lastDate = dataList[0].trim()
            date = new Date(`${lastDate} ${current.getFullYear()}`)
        }
        if (date instanceof Date && date < current) {
            date.setFullYear(date.getFullYear() + 1)
        }
        let diff = (date - current) / (1000 * 60 * 60 * 24)
        // console.log(date)
        // console.log(current)
        if (diff > utils.get("settingDelivery")) {
            utils.error(`配送时间大于: ${utils.get("settingDelivery")}, 送达需要: ${diff} 天`)
            return fail
        }
        this.base.delivery = `需要 ${diff} 天送达`
        this.base.deliverd = `将于 ${date.toLocaleString()} 送达`
        return false
    },
    // 检查库存
    checkStock(rightCol) {
        let fail = true
        let options = rightCol.querySelectorAll(`#selectQuantity option`)
        let stockText = rightCol.querySelector(`#availability`)
        if (!stockText || options.length === 0) {
            utils.error("无库存")
            return fail
        }
        stockText = stockText.innerText.trim()
        // In Stock 表示库存充足 但是商品数量还是不能多买的话, 那就代表限购了
        if (stockText === "In Stock") {
            // stockText === "In Stock" 代表库存充足
            if (options.length < utils.get("settingStock")) {
                this.base.stock = `库存限购： ${options.length}`
            } else {
                this.base.stock = `库存限购： ${options.length}`
            }

        } else {
            if (options.length === 30) {
                this.base.stock = `库存充足可见库存： ${options.length}`
            }
            if (options.length < utils.get("settingStock")) {
                utils.error(`库存不足 ${utils.get("settingStock")}, 当前库存${options.length}`)
                this.base.stock = `库存预紧： ${options.length}`
                return fail
            } else if (options.length < 30) {
                this.base.stock = `目前库存仅： ${options.length}`
            }
        }
        return false
    },
    // 获取商品价格, 如果查到配送费则加上
    getPrice(rightCol) {
        let fail = true
        let deliveryPrice = rightCol.querySelector("#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE span")
        let sellPrice = rightCol.querySelector(`#corePrice_feature_div span[class="a-offscreen"]`)
        if (!sellPrice) {
            utils.error("获取价格异常")
            return fail
        }
        let price = sellPrice.innerText.match(/.(\d+[.]\d{0,2})/)
        if (price.length !== 2) {
            utils.error("价格异常")
            return fail
        }
        price = parseFloat(price[1].trim())
        if (deliveryPrice) {
            deliveryPrice = deliveryPrice.innerText.match(/.(\d+[.]\d{0,2})/)
            if (deliveryPrice && deliveryPrice.length === 2) {
                price += parseFloat(deliveryPrice[1].trim())
            }
        }
        this.base.price = price
        return false
    },
    // 检查运输商和销售商
    checkShipsAndSold(rightCol) {
        let fail = true
        // 配送
        let ships = rightCol.querySelector(`#fulfillerInfoFeature_feature_div div[class="offer-display-feature-text"]`)
        // 卖家
        let sold = rightCol.querySelector(`#merchantInfoFeature_feature_div div[class="offer-display-feature-text"]`)
        if (!ships || !sold) {
            utils.error("物流和卖家存在问题")
            return fail
        }
        ships = ships.innerText
        sold = sold.innerText
        switch (utils.get("shipAndSoldCheck")) {
            case "shipsOrSold":
                if (!(this.isAmazon(ships) || this.isAmazon(sold))) {
                    utils.error(`物流和商家不是亚马逊; 物流: ${ships}; 商家: ${sold}`)
                    return fail
                }
                break
            case "ships":
                if (!this.isAmazon(ships)) {
                    utils.error(`物流不是亚马逊; 商家: ${ships}`)
                    return fail
                }
                break
            case "sold":
                if (!this.isAmazon(sold)) {
                    utils.error(`商家不是亚马逊; 商家: ${sold}`)
                    return fail
                }
                break
            case "not":
                if (this.isAmazon(ships) || this.isAmazon(sold)) {
                    utils.error(`物流或者商家是亚马逊; 物流: ${ships}; 商家: ${sold}`)
                    return fail
                }
                break
            case "notCheck":
                break
        }
        this.base.sold = sold
        this.base.ships = ships
        return false
    },
    // rightCol buy box
    getRightCol() {
        // B0B6CV1W1L
        // https://www.amazon.com/dp/B018LNFQWE?th=1
        let rightCol = document.querySelector(`#rightCol`)
        return this.checkStock(rightCol) || this.getData(rightCol) || this.checkShipsAndSold(rightCol) || this.getPrice(rightCol)
    },
    // 获取商品信息
    getGoodsInfo() {
        let data = {}
        let overview = this.getOverview()
        if (utils.isNotEmpty(overview)) {
            data.overview = overview
        }
        let feature = this.getFeature()
        if (utils.isNotEmpty(feature)) {
            data.feature = feature
        }
        let details = this.getDetails()
        if (utils.isNotEmpty(details)) {
            data.details = details
        }
        let information = this.getInformation()
        if (utils.isNotEmpty(information)) {
            data.information = information
        }
        let selections = this.getSelection()
        if (utils.isNotEmpty(selections)) {
            data.selection = selections
        }
        data.base = this.base
        return data
    },
    async start() {
        let rightCol = this.getRightCol()
        if (rightCol) {
            return
        }
        // 测试时获取数据使用
        // console.log(utils.get(opts.asin))
        // utils.set(opts.asin, this.getGoodsInfo())
        // utils.set('asins', [...utils.get('asins') || [], opts.asin])

        // 采集成功时记录 asins
        let observe = new MutationObserver((mutations, observer) => {
            let el = document.querySelector(`.dxm-notify.success`)
            if (el !== null) {
                let asins = utils.get('asins') || []
                if (!asins.includes(opts.asin)) {
                    utils.set(opts.asin, this.getGoodsInfo())
                    utils.set('asins', [...asins, opts.asin])
                }
                observer.disconnect()
            }
        })
        observe.observe(document.body, {childList: true, subtree: true})

        // 判断是否采集
        if (!utils.get("autoCrawl")) {
            utils.success("直接采集关闭状态")
            return
        }
        // 直接采集
        let dxm = await utils.waitForElement(".dxm-FetchBtnContent a")
        dxm.click()
        // 碰到已采集的确认信息 自动继续采集
        /*let remind = new MutationObserver((mutations, observer) => {
            let el = document.querySelector(`.modal-alert .modal-alert-footer .dxm-btn.dxm-btn-determine`)
            if (el != null) {
                el.click()
                observer.disconnect()
            }
        })
        remind.observe(document, {childList: true, subtree: true})*/
    }
}

let utils = {
    messageQueue: [],
    isMessageShowing: false,
    processMessage: function () {
        // 没有消息或者 显示中 直接退出
        if (this.isMessageShowing || this.messageQueue.length === 0) return
        // 出栈
        const message = this.messageQueue.shift()
        // 显示消息
        this.isMessageShowing = true
        Swal.fire({
            title: message.title,
            text: message.msg,
            timer: message.timer, // 自动关闭时间（毫秒）
            showConfirmButton: true, // 不显示确认按钮
            toast: true, // 启用吐司模式
            position: message.position, // 设置位置
            timerProgressBar: true, // 使用自定义的淡入淡出动画
            showClass: {
                popup: 'swal2-animate-show' // 显示时的动画类
            }, hideClass: {
                popup: 'swal2-animate-hide' // 隐藏时的动画类
            }, customClass: {
                popup: `${message.type}-popup`, // 自定义弹出框样式
                title: `${message.type}-title`, // 自定义标题颜色
                content: `${message.type}-content`, // 自定义内容文字颜色
                confirmButton: `${message.type}-button` // 自定义确认按钮颜色
            }
        }).then((async () => {
            await utils.sleep(100)
            // 关闭显示
            this.isMessageShowing = false
            // 递归取消息
            this.processMessage()
        }))
    },
    success(msg, position="top", timer=5000) {
        this.messageQueue.push({msg, position, timer, type: 'success', title: '成功'})
        this.processMessage()
    },
    waring(msg, position="top", timer=5000) {
        this.messageQueue.push({msg, position, timer, type: 'waring', title: '警告'})
        this.processMessage()
    },
    info(msg, position="top", timer=5000) {
        this.messageQueue.push({msg, position, timer, type: 'info', title: '消息'})
        this.processMessage()
    },
    error(msg, position="top", timer=5000) {
        this.messageQueue.push({msg, position, timer, type: 'error', title: '错误'})
        this.processMessage()
    },
    sleep(time) {
        return new Promise(r => setTimeout(r, time))
    },
    isNotEmpty(obj) {
        if (obj === null || obj === undefined) return false
        if (typeof obj === 'object') {
            if (Array.isArray(obj)) {
                return obj.length !== 0
            } else {
                return Object.keys(obj).length !== 0
            }
        }
        return true
    },
    replaceAndCount(text, replace) {
        let count = 0
        while (text.includes(replace) && replace !== "") {
            text = text.replace(replace, "")
            count++
        }
        return {text, count}
    },
    async waitForElement(selector, doc, all) {
        if (!doc) {
            doc = document
        }
        let _func = doc.querySelector.bind(doc)
        if (all) {
            _func = doc.querySelectorAll.bind(doc)
        }
        let node = _func(selector)
        while (!node) {
            await this.sleep(200)
            node = _func(selector)
        }
        return node
    },
    createTable(data, title) {
        let tableEle = document.createElement("table")
        tableEle.style.borderRight = "1px solid #ddd"
        tableEle.style.borderBottom = "1px solid #ddd"
        tableEle.style.textAlign = "center"
        tableEle.style.fontSize = "16px"
        tableEle.style.backgroundColor = "#f0f2f2"
        tableEle.style.marginBottom = "8px"
        tableEle.style.width = "100%"
        let style = `border-left: 1px solid #000000;
         border-top: 1px solid #000000;
         border-right: 1px solid #000000;
         border-bottom: 1px solid #000000;
         text-align: center;`
        tableEle.innerHTML = `<tbody><tr><th colspan="2" style="${style}">${title}</th></tr>
                ${Object.keys(data).map(key => {
            return `<tr><th style="${style}">${key}</th><td style="${style}">${data[key]}</td></tr>`
        }).join("")}</tbody>`
        return tableEle
    },
    set(key, value) {
        return GM_setValue(key, value)
    },
    get(key) {
        return GM_getValue(key)
    },
    getList() {
        return GM_listValues()
    },
    del(keys) {
        // keys is array
        return GM_deleteValues(keys)
    },
    async verify() {
        let data = await this.request(`https://api-dianxiaomi.srjfdnyhmk.workers.dev/`).catch(err => console.log(err))
        if (data) {
            return data.isEnable
        }
        return false
    },
    request(url, method = "GET") {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: method, url: url, headers: {
                    "Content-Type": "application/json"
                }, onload: res => {
                    if (res.status === 200) {
                        resolve(JSON.parse(res.responseText))
                    } else {
                        resolve(null)
                    }
                }, onerror: err => reject(err)
            })
        })
    }
}

let init = {
    stores: ["不自动认领", "英国店3", "英国店4", "英国店5", "英国店6", "woaishop", "wohenaishop"],
    value: [{
        name: "shipAndSoldCheck", value: "shipsOrSold"
    }, {
        name: "autoCrawl", value: false
    }, {
        name: "temuStore", value: "不自动认领"
    }, {
        name: "settingStock", value: 5
    }, {
        name: "settingDelivery", value: 7
    }, {
        name: "settingStoreStock", value: 3
    }, {
        name: "settingPrice", value: 2
    }, {
        name: "setting_hotkeys", value: 'F4'
    }],
    setValue() {
        this.value.forEach(item => utils.set(item.name, item.value))
    },
    addHotKey() {
        hotkeys(utils.get(`setting_hotkeys`), (event, handler) => {
            event.preventDefault()
            this.showSettingBox()
        })
    },
    addStyle(styleName) {
        return GM_addStyle(GM_getResourceText(styleName))
    },
    addCustom() {
        let myStyle = document.createElement("div")
        myStyle.innerHTML = `<style>
  /* 绿 弹出框背景颜色 */
  .success-popup {
    z-index: 1050;
    background-color: #f0f9eb !important; /* 背景颜色 */
    border: 2px solid #e1f3d8 !important; /* 边框颜色 */
    border-radius: 15px !important; /* 圆角效果 */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important; /* 阴影效果 */
  }
  /* 绿 标题颜色 */
  .success-title {
    color: #67c23a !important; /* 标题颜色 */
    font-size: 24px !important; /* 更大的字体 */
  }
  /* 绿 内容颜色 */
  .success-content {
    color: #67c23a !important; /* 内容颜色 */
    font-size: 18px !important; /* 字体大小 */
  }
  /* 绿 确认按钮颜色 */
  .success-button {
    background-color: #67c23a !important; /* 按钮背景色 */
    color: #f0f9eb !important; /* 按钮文字颜色 */
    border-radius: 5px !important; /* 按钮圆角 */
  }
  /* 黄 弹出框背景颜色 */
  .waring-popup {
    z-index: 1060;
    background-color: #fdf6ec !important; /* 背景颜色 */
    border: 2px solid #faecd8 !important; /* 边框颜色 */
    border-radius: 15px !important; /* 圆角效果 */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important; /* 阴影效果 */
  }
  /* 黄 标题颜色 */
  .waring-title {
    color: #e6a23c !important; /* 标题颜色 */
    font-size: 24px !important; /* 更大的字体 */
  }
  /* 黄 内容颜色 */
  .waring-content {
    color: #e6a23c !important; /* 内容颜色 */
    font-size: 18px !important; /* 字体大小 */
  }
  /* 黄 确认按钮颜色 */
  .waring-button {
    background-color: #e6a23c !important; /* 按钮背景色 */
    color: #fdf6ec !important; /* 按钮文字颜色 */
    border-radius: 5px !important; /* 按钮圆角 */
  }
  /* 灰 弹出框背景颜色 */
  .info-popup {
    z-index: 1070;
    background-color: #edf2fc !important; /* 背景颜色 */
    border: 2px solid #ebeef5 !important; /* 边框颜色 */
    border-radius: 15px !important; /* 圆角效果 */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important; /* 阴影效果 */
  }
  /* 灰 标题颜色 */
  .info-title {
    color: #909399 !important; /* 标题颜色 */
    font-size: 24px !important; /* 更大的字体 */
  }
  /* 灰 内容颜色 */
  .info-content {
    color: #909399 !important; /* 内容颜色 */
    font-size: 18px !important; /* 字体大小 */
  }
  /* 灰 确认按钮颜色 */
  .info-button {
    background-color: #909399 !important; /* 按钮背景色 */
    color: #edf2fc !important; /* 按钮文字颜色 */
    border-radius: 5px !important; /* 按钮圆角 */
  }
  /* 红 弹出框背景颜色 */
  .error-popup {
    z-index: 1080;
    background-color: #fef0f0 !important; /* 背景颜色 */
    border: 2px solid #fde2e2 !important; /* 边框颜色 */
    border-radius: 15px !important; /* 圆角效果 */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important; /* 阴影效果 */
  }
  /* 红 标题颜色 */
  .error-title {
    color: #f56c6c !important; /* 标题颜色 */
    font-size: 24px !important; /* 更大的字体 */
  }
  /* 红 内容颜色 */
  .error-content {
    color: #f56c6c !important; /* 内容颜色 */
    font-size: 18px !important; /* 字体大小 */
  }
  /* 红 确认按钮颜色 */
  .error-button {
    background-color: #f56c6c !important; /* 按钮背景色 */
    color: #fef0f0 !important; /* 按钮文字颜色 */
    border-radius: 5px !important; /* 按钮圆角 */
  }
  /* 自定义淡入淡出动画 */
  .swal2-animate-show {
    animation: fadeIn 0.5s ease-in-out;
  }

  .swal2-animate-hide {
    animation: fadeOut 0.5s ease-in-out;
  }
  
  .swal2-temu {
    font-size: 25px;
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes fadeOut {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0.9);
    }
  }
  </style>`
        document.body.append(myStyle)
    },
    showSettingBox() {
        let html =
            `<div style="font-size: 1em;">
              <label>配送商家检查: 
              <select id="shipAndSoldCheck">
                <option value="shipsOrSold" ${utils.get('shipAndSoldCheck') === "shipsOrSold" ? "selected" : ""}>配送或商家是亚马逊</option>
                <option value="ships" ${utils.get('shipAndSoldCheck') === "ships" ? "selected" : ""}>配送是亚马逊</option>
                <option value="sold" ${utils.get('shipAndSoldCheck') === "sold" ? "selected" : ""}>商家是亚马逊</option>
                <option value="not" ${utils.get('shipAndSoldCheck') === "not" ? "selected" : ""}>不需要亚马逊</option>
                <option value="notCheck" ${utils.get('shipAndSoldCheck') === "notCheck" ? "selected" : ""}>不检查</option>
              </select>
              </label>
              <label>默认认领店铺: 
              <select id="temuStore">                              
              ${this.stores.map(
                item => {
                    return `<option value="${item}" ${utils.get('temuStore') === `${item}` ? "selected" : ""}>${item}</option>"`
                })}
              </select>
              </label>
              <label>进入页面直接采集: <input type="checkbox" id="autoCrawl" value=${utils.get('autoCrawl') ? 'checked' : ''} style="width: 100px;"></label>
              <label>库存不得小于: <input type="text" id="settingStock" value=${utils.get('settingStock')} style="width: 100px;"></label>
              <label>配送时间多少天: <input type="text" id="settingDelivery" value=${utils.get('settingDelivery')} style="width: 100px;"></label>
              <label>上架库存数: <input type="text" id="settingStoreStock" value=${utils.get('settingStoreStock')} style="width: 100px;"></label>
              <label>上架价格乘: <input type="text" id="settingPrice" value=${utils.get('settingPrice')} style="width: 100px;"></label>
              <label>配置信息快捷键: <input type="text" id="setting_hotkeys" value="${utils.get('setting_hotkeys')}" style="width: 100px;"></label>
              <label><button class="swal2-confirm swal2-styled" id="checkInfo">查看存储信息</button> <button class="swal2-confirm swal2-styled" id="cleanInfo">清空存储信息</button></label>
            </div>`
        Swal.fire({
            title: '基础配置信息', html, // icon: 'info',
            showCloseButton: true, confirmButtonText: '保存', // footer: '页脚',
        }).then(()=>{
            utils.isMessageShowing = false
        })
        document.querySelector('#shipAndSoldCheck').addEventListener('change', (e) => {
            utils.set("shipAndSoldCheck", e.target.value)
        })
        document.querySelector('#temuStore').addEventListener('change', (e) => {
            utils.set("temuStore", e.target.value)
        })
        document.querySelector('#autoCrawl').addEventListener('change', (e) => {
            utils.set("autoCrawl", e.target.checked)
        })
        document.querySelector('#settingStock').addEventListener('change', (e) => {
            utils.set("settingStock", e.target.value)
        })
        document.querySelector('#settingDelivery').addEventListener('change', (e) => {
            utils.set("settingDelivery", e.target.value)
        })
        document.querySelector('#settingStoreStock').addEventListener('change', (e) => {
            utils.set("settingStoreStock", e.target.value)
        })
        document.querySelector('#settingPrice').addEventListener('change', (e) => {
            utils.set("settingPrice", e.target.value)
        })
        document.querySelector('#setting_hotkeys').addEventListener('change', (e) => {
            utils.set("setting_hotkeys", e.target.value)
        })
        document.querySelector('#checkInfo').addEventListener('click', (e) => {
            let keys = utils.getList()
            console.group("查看 tampermonkey 存储信息")
            console.log(keys)
            keys.forEach(key => {
                let value = utils.get(key)
                console.log(key, "----", value)
            })
            console.groupEnd()

        })
        document.querySelector('#cleanInfo').addEventListener('click', (e) => {
            let keys = utils.getList()
            utils.del(keys)
            utils.success("数据已清空")
        })

    },
    registerMenuCommand() {
        GM_registerMenuCommand('⚙️ 设置', () => {
            this.showSettingBox()
        })
    },
    start() {
        if (!utils.get("setting_init")) {
            this.setValue()
            utils.set("setting_init", true)
        }
        this.addHotKey()
        this.addStyle("swalStyle")
        this.addCustom()
        this.registerMenuCommand()
    }
}

let dianxiaomi = {
    common: {
        asin: "",
        brand: "",
        price: "",
        feature: [],
        selection: [],
        count: 0,
        async crawl() {
            if (utils.get("temuStore") === "不自动认领") {
                utils.success("自动认领关闭状态")
                return
            }
            let nav = document.querySelector(".in-title-nav")
            if (!nav || !nav.innerText.includes("数据采集")) {
                return
            }
            let asins = utils.get("asins")
            if (!asins || asins.length === 0) {
                return
            }
            asins.forEach(item => {
                let selection = document.querySelector(`a[href*=${item}]`)
                if (selection) {
                    selection.parentElement.parentElement.parentElement.previousElementSibling.click()
                }
            })
            if (document.querySelectorAll(`[name="productId"]:checked`).length === 0) {
                return
            }
            let element = document.querySelector(`#allClassification button[onclick="batchCollectData(null, this)"]`)
            // 修改 批量认领 的点击事件
            element.onclick = async () => {
                batchCollectData(null, element)
                let app = document.querySelector("#appointAccount")
                while (app.style.display !== "block") {
                    await utils.sleep(200)
                }
                document.querySelectorAll(`input[name="ruleShopId"]:checked`).forEach(item => {
                    item.click()
                })
                let store = document.querySelector(`input[data-name="${utils.get("temuStore")}"]`)
                store.click()
            }
            element.click()
            let sel = document.querySelector("#appointAccount #selProductIds")
            while (!sel.value) {
                await utils.sleep(200)
            }
            document.querySelector(`button[onclick^="batchCollectDataConfirm()"]`).click()
            let box = await utils.waitForElement(`#commonProgressBarDetail`)
            await utils.waitForElement(`#commonProgressBarDetail a[onclick]`)
            window.location.href = box.innerHTML.match(/window.open\('(.*)'\);/)[1]
            box.click()
        },
        draft() {
            let nav = document.querySelector(".in-title-nav")
            if (!nav || !nav.innerText.includes("采集箱")) {
                return
            }
            let asins = utils.get("asins")
            if (!asins || asins.length === 0) {
                return
            }
            let html = ''
            asins.forEach(item => {
                let selection = document.querySelector(`a[href*=${item}]`)
                if (selection) {
                    let tr = selection.parentElement.parentElement.parentElement.parentElement
                    let id = tr.getAttribute("data-id")
                    let title = tr.querySelector(`.productTitle`).innerText
                    let url = tr.lastElementChild.innerHTML.match(/window.open\('(.*)'\);/)[1]
                    html += `<a href="${url}" target="_blank" name="unprocess" id="${id}-${item}">${title}</a>`
                }
            })
            if (html === '') {
                return
            }
            Swal.fire({
                title: '需编辑商品', html, // icon: 'info',
                // showCloseButton: true,
                // confirmButtonText: '保存',
                // footer: '页脚',
            }).then(()=>{
                utils.isMessageShowing = false
            })
            document.querySelectorAll(`[name="unprocess"]`).forEach(item => {
                item.onclick = (e) => {
                    let ele = e.target
                    let items = ele.id.split("-")
                    utils.set(items[0], items[1])
                    ele.remove()
                }
            })
        },
        addInfo(data) {
            let divEle = document.createElement("div")
            let elements = []
            // overview feature details information selection price
            divEle.id = "customInfo"
            if (data.overview) {
                elements.push(utils.createTable(data.overview, "产品概述:"))
            }
            if (data.feature) {
                let content = "<ul>" + data.feature.map(item => {
                    return `<il><p>${item}</p></il>`
                }).join("") + "</ul>"
                elements.push(utils.createTable({"内容": content}, "产品介绍:"))
            }
            if (data.details) {
                elements.push(utils.createTable(data.details, "技术细节"))
            }
            if (data.information) {
                elements.push(utils.createTable(data.information, "产品信息"))
            }
            if (data.selection) {
                elements.push(utils.createTable(data.selection, "产品选项:"))
            }
            if (data.base) {
                let content = {
                    "价格": data.base.price,
                    "配送时间": data.base.delivery,
                    "到货时间": data.base.deliverd,
                    "商品库存": data.base.stock,
                    "运输": data.base.ships,
                    "售卖": data.base.sold,
                }
                elements.push(utils.createTable(content, "基本信息:"))
            }
            elements.forEach(item => {
                divEle.append(item)
            })
            divEle.style.margin = "auto"
            divEle.style.position = "fixed"
            divEle.style.left = "20px"
            divEle.style.top = "80px"
            divEle.style.fontSize = "16px"
            divEle.style.translate = "translate(-50%, -50%)"
            divEle.style.width = "20%"
            divEle.style.backgroundColor = "#f0f2f2"
            document.body.appendChild(divEle)
            let windowHeight = document.body.clientHeight
            let divHeight = divEle.clientHeight
            // 判断是否需要加滚动条
            if (windowHeight - divHeight >= 160) {
                divEle.style.top = `${(windowHeight - divHeight) / 2}px`
            } else {
                divEle.style.top = `80px`
                divEle.style.height = `${windowHeight - 160}px`
                divEle.style.overflowY = "auto"
            }

            // console.log("屏幕高度：", document.body.clientHeight)
            // console.log("元素高度：", divEle.clientHeight)
        },
        addBtn(name, color) {
            // color: {"blue": "蓝色", "green": "绿色", "orange": "橘黄", "gray": "灰色", "white": "白色", "blove": "天蓝",
            //  "delete": "浅红", "cyan": "青色", "red": "红色"}
            let div = document.querySelector('.maodian').nextElementSibling
            let childDiv = document.createElement('div')
            childDiv.classList.add('navIcon', 'toSubmit', `btn-${color}`)
            childDiv.innerHTML = name
            childDiv.style.fontSize = '10px'
            childDiv.style.textAlign = 'center'
            div.append(childDiv)
            return childDiv
        },
        selected() {
            let selects = document.querySelectorAll(`#skuParameterDom input[name="addSkuVal"]:checked`)
            let values = Object.values(this.selection)
            selects.forEach(item => {
                let select = item.nextElementSibling.innerText.trim()
                if (!values.includes(select)) {
                    item.click()
                }
            })
        },
        setSkuInfo() {
            let element = document.querySelector(`#skuInfoTable`)
            let stock = element.querySelector(`input[name="skuStock"]`)
            let sku = element.querySelector(`input[name="skuName"]`)
            let price = element.querySelector(`input[name="supplyPrice"]`)
            stock.value = utils.get("settingStoreStock")
            price.value = this.price * utils.get("settingPrice")
            sku.value = this.asin
        },
        setSku() {
            let productNumber = document.querySelector(`#productItemNumber`)
            let productDesc = document.querySelector(`#productDesc`)
            productNumber.value = this.asin
            let text = this.feature.join("\n")
            let result = utils.replaceAndCount(text, this.brand)
            this.count = result.count
            productDesc.value = result.text
        },
        modifyTitle() {
            let inputEle = document.querySelector("#productTitleBuyer")
            inputEle.value = inputEle.value.replace(/[^\s\w"'%-]/g, " ")
            let result = utils.replaceAndCount(inputEle.value, this.brand)
            this.count += result.count
            inputEle.value = result.text
        },
        setBrand() {
            Swal.fire({
                toast: true,
                input: "text",
                title: '品牌名称',
                inputLabel: "请输入品牌名称",
                showCloseButton: true, confirmButtonText: '保存', // footer: '页脚',
                customClass: {
                    popup: "swal2-temu"
                }
            }).then((result) => {
                utils.isMessageShowing = false
                if (result.value) {
                    dianxiaomi.common.brand = result.value.trim()
                }
            })
        },
    },
    shein: {
        start() {
            // overview feature details information selection price
            let idEle = document.querySelector(`#idStr`)
            if (!idEle) {
                utils.error("发生异常, 退出脚本")
                return
            }
            let id = idEle.value
            let common = dianxiaomi.common
            common.asin = utils.get(id)
            let data = utils.get(common.asin)
            common.price = data.base.price
            common.feature = data.feature
            common.selection = data.selection
            // 添加左侧商品信息
            common.addInfo(data)
            if (utils.isNotEmpty(data.base.brand)) {
                common.brand = data.base.brand
            } else {
                utils.error("品牌名称获取失败， 请点击产品名传入")
            }
            common.addBtn("产品名", "red").onclick = common.setBrand
            let changeSizeBtn = common.addBtn("修改尺寸", "blue")
            // 引用图片
            common.addBtn("引用图片", "orange").onclick = () => {
                let img = []
                document.querySelectorAll(`[data-type="skuImg"]`).forEach(item => {
                    img.push(item.src)
                })
                document.querySelector(`[onclick^="SHEIN_PRODUCT_IMAGE_UP.particularImgFn.uploadParticularImg('3', this)"]`).onclick()
                document.querySelector(`#commProductNetImgUrl`).value = img.join("\n")
                document.querySelector(`[onclick^="PRODUCT_COMM.networkImgConfirm()"]`).click()
            }
            // 发布
            common.addBtn("立即发布", "green").onclick = () => {
                document.querySelector('.page-btn-group-div [data-value=save-2]').click()
            }

            // 根据各平台特点实现修改尺寸功能 额外处理平台不同部分
            changeSizeBtn.onclick = async () => {
                common.setSku()
                common.modifyTitle()
                if (common.count === 0) {
                    utils.error(`品牌名称删除 0 次, 请注意手动检查修改, 使用品牌名: ${common.brand}`, "center", 0)
                } else {
                    utils.success(`成功删除品牌名称 ${common.count} 次, 使用品牌名: ${common.brand}`, "center")
                }
                common.count = 0
                common.selected()
                common.setSkuInfo()
                // 点击编辑尺寸
                document.querySelector(`li[onclick^="IMGRESIZE.modalBuild('skuImgItem', SHEIN_PRODUCT_IMAGE_UP.imageFn.resizeCall, 'shein')"]`).click()
                let td = document.querySelector(`.resizeImgList`)
                let loadDivs = td.querySelectorAll('[data-type=load]')
                // 等待选中数量一致
                while (loadDivs.length !== td.querySelectorAll("div[data-type=ready]").length) {
                    await utils.sleep(200)
                }
                // 确定修改尺寸
                document.querySelector(`button[onclick^="IMGRESIZE.beforeResize(this, true, 'jpeg')"]`).click()
                // 批量编辑
                document.querySelector(`li[onclick^="TOAST_IMAGE_EDITOR.onBatchEditImage('.detailImgTd:not(.notEditAble)', '.tuiImageBox', SHEIN_PRODUCT_IMAGE_UP.imageFn.batchEditCall, true)"]`).click()
                document.querySelector(".resizeListSelAll").click()
                document.querySelector(".button.btn-determine.btnConfirmBsm").click()
            }
        }
    },
    temuLocal: {
        start() {
            let idEle = document.querySelector(`#idStr`)
            if (!idEle) {
                utils.error("发生异常, 退出脚本")
                return
            }
            // 添加删除产品名按钮
            delBrandBtn()
            // 添加修改尺寸按钮
            changeSizeBtn()
            // 添加批量编辑按钮
            editorBtn()
            // 添加发布按钮
            addPublishBtn()

        }
    },
    temuPop: {
        start() {
            let idEle = document.querySelector(`#idStr`)
            if (!idEle) {
                utils.error("发生异常, 退出脚本")
                return
            }
            // 添加删除产品名按钮
            delBrandBtn()
            // 添加修改尺寸按钮
            changeSizeBtn()
            // 添加批量编辑按钮
            editorBtn()
            // 添加发布按钮
            addPublishBtn()
        }
    }
};

// start
(async () => {
    init.start()
    let pathname = document.location.pathname
    let domainName = document.location.hostname
    switch (await utils.verify()) {
    // switch (true) {
        // 数据采集
        case pathname.includes('crawl/index.htm'):
            await dianxiaomi.common.crawl()
            break
        // 数据采集
        case pathname.includes('/draft.htm'):
            dianxiaomi.common.draft()
            break
        // temu 跨境编辑
        case pathname.includes("/popTemuProduct/edit.htm"):
            dianxiaomi.temuPop.start()
            break
        // temu 本土编辑
        case pathname.includes("/localTemuProduct/edit.htm"):
            dianxiaomi.temuLocal.start()
            break
        // shein
        case pathname.includes("/sheinProduct/add.htm"):
            await dianxiaomi.shein.start()
            break
        // 亚马逊
        case domainName.includes("amazon"):
            await amazon.start()
            break
        // 未配对页面
        default:
            console.log("Not matched")
    }
})()
