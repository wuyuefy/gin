// ==UserScript==
// @name         跨境 - 店小秘自定义插件
// @namespace    http://tampermonkey.net/
// @version      2024-11-13
// @description  店小秘 跨境店 编辑设置初始化
// @author       You
// @match        https://www.tampermonkey.net/index.php?version=5.3.6216&ext=gcal&updated=true
// @match        https://www.dianxiaomi.com/popTemuProduct/edit.*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const stock = 3
    let data = {}
    let initTrs = 0

    function getArgs(){
        // 获取每一行 table
        let trs = document.querySelectorAll('#skuInfoTable tbody tr')
        initTrs = trs.length
        // 获取 sku
        let shopUrl = document.querySelector('#sourceUrl0')
        let url = shopUrl.value
        let sku = (url.match(/.*\/dp\/(.*)[?/]/) ?? url.match(/.*\/dp\/(.*)/))[1]
        // 为每一行 设置对应的值
        trs.forEach(i => {
            let key = i.getAttribute('trid')
            let price = i.querySelector('input[name=price]')
            let length = i.querySelector('input[name=skuLength]')
            let width = i.querySelector('input[name=skuWidth]')
            let height = i.querySelector('input[name=skuHeight]')
            let weight = i.querySelector('input[name=weight]')
            let sizeList = [length.value, width.value, height.value].sort((x,y)=> y-x)
            sizeList.forEach((num, index, arr) => {
                if (num && num < 0.3) arr[index] = 0.3
                if (num && num > 899) arr[index] = 899
            })
            data[key] = {
                'sku': sku,
                'price': price.value,
                'stock': stock,
                'length': sizeList[0],
                'width': sizeList[1],
                'height': sizeList[2],
                'weight': weight.value
            }
            length.onchange = sortSize
            width.onchange = sortSize
            height.onchange = sortSize
        })
        if(initTrs === 1){
            modTable(null, trs[0].getAttribute('trid'))
        }
    }
    // 长宽高排序
    function sortSize(){
        let trs = document.querySelectorAll('#skuInfoTable tbody tr')
        trs.forEach(i => {
            let length = i.querySelector('input[name=skuLength]')
            let width = i.querySelector('input[name=skuWidth]')
            let height = i.querySelector('input[name=skuHeight]')
            if (!(length.value && width.value && height.value)){
                return
            }
            let sizeList = [length.value, width.value, height.value].sort((x,y)=> y-x)
            sizeList.forEach((num, index, arr) => {
                if (num && num < 0.3) arr[index] = 0.3
                if (num && num > 899) arr[index] = 899
            })
            length.value = sizeList[0]
            width.value = sizeList[1]
            height.value = sizeList[2]
        })
    }
    // 引用轮播图修改
    async function changeMapImage(tr){
        let mapImage = tr.querySelector('a[onclick^="POP_TEMU_PRODUCT_IMAGE_UP.imageFn.uploadImg(6, this);"]')
        let checkedImg = document.querySelector(`input[data-checkindex]:checked`)
        if(mapImage && checkedImg){
            mapImage.click()
            // 引用轮播图第一张
            let selectedFirst = checkedImg.parentNode.parentNode.querySelector(`img`)
            let imgName = selectedFirst.getAttribute("src").match(/.*[/](.*.jpg)/)[1]
            // 点击图片
            await waitForElement('#quoteImg0 input')
            document.querySelector(`#quoteImageDiv img[src$="${imgName}"]`).click()
            // 确定图片
            document.querySelector('button[onclick^="PRODUCT_QUOTE_IMG.quoteImageConfirm();"]').click()
            // 刷新素材图
            document.querySelector('a[onclick^="POP_TEMU_PRODUCT_FN.productFn.updateMaterialImg();"]').click()

        }
    }
    // 为 变种属性 选择绑定 onclick
    function bindOncli(){
        const table = document.querySelector('#customTheme table')
        const inputs = table.querySelectorAll('input[data-valid]')
        if(initTrs > 1){
            inputs.forEach(i => {
                i.click()
                i.onclick = modTable
            })
        }else{
            inputs.forEach(i => i.onclick = modTable)
        }
    }
    // 修改标题
    function modTitle(){
        // 修改中文标题
        let title = document.querySelector('#productTitle')
        let noChineseSymbol = title.value = title.value.replace(/[^\s\w"']/g, "")
        title.value = noChineseSymbol
        // 修改英文标题
        let titleI18n = document.querySelector('#productI18n')
        titleI18n.value = noChineseSymbol
        // debugger
    }
    // 添加删除产品名按钮
    function delBrandBtn(){
        let maodian = document.querySelector('.maodian')
        let div = maodian.nextElementSibling
        let childDiv = document.createElement('div')
        childDiv.classList.add('navIcon', 'toSubmit', 'btn-red')
        childDiv.innerHTML = '删除产品'
        childDiv.style.fontSize='10px'
        childDiv.style.textAlign ='center'
        childDiv.id = 'delBrandBtn'
        div.append(childDiv)
        // 调用删除产品名功能
        childDiv.onclick = delBrand
    }
    // 删除产品名
    function delBrand(){
        const barnd = prompt("请输入产品名字").replace(/[^\w\s]/, '.')
        let reg = new RegExp(barnd, 'gi')
        let title = document.querySelector('#productTitle')
        let titleI18n = document.querySelector('#productI18n')
        title.value = title.value.replace(reg, "")
        titleI18n.value = titleI18n.value.replace(reg, "")
        // 删除显示描述
        let desc = document.querySelector('#wirelessDescContentBox')
        let divs = desc.querySelectorAll('div')
        divs.forEach(i=>i.innerText = i.innerText.replace(reg, ""))
        if(divs.length > 1){
            let texts = divs[divs.length-1].innerText.split('\n')
            if (texts.length) {
                divs[divs.length-1].innerText = texts.slice(0,-1).join('\n')
            } else {
                divs[divs.length-1].remove()
            }
        }
        // 删除实际描述
        let dataList = JSON.parse(desc.getAttribute('data-list'))
        dataList.forEach(i => i['cont']['text'] = i['cont']['text'].replace(reg, ""))
        if(dataList.length > 1){
            let texts = dataList[dataList.length-1]['cont']['text'].split('\n')
            if (texts.length > 1) {
                dataList[dataList.length-1]['cont']['text'] = texts.slice(0,-1).join('\n')
            } else {
                dataList.pop()
            }
        }
        desc.setAttribute('data-list', JSON.stringify(dataList))
    }
    // 添加修改尺寸
    function changeSizeBtn(){
        let maodian = document.querySelector('.maodian')
        let div = maodian.nextElementSibling
        let childDiv = document.createElement('div')
        childDiv.classList.add('navIcon', 'toSubmit', 'btn-blue')
        childDiv.innerHTML = '修改尺寸'
        childDiv.style.fontSize='10px'
        childDiv.style.textAlign ='center'
        childDiv.id = 'changeSizeBtn'
        div.append(childDiv)
        // 调用批量修改
        childDiv.onclick = async () => {
            // 删除未选中的
            document.querySelectorAll(`input[name=selectedImg]`).forEach(i => {
                if (!i.checked) {
                    i.parentNode.parentNode.querySelector(".imgDivDown a[onclick]").click()
                }
            })
            // 点击编辑
            document.querySelector(`li[onclick^="IMGRESIZE.modalBuild('resizeOut', POP_TEMU_PRODUCT_FN.skuFn.resizecall, 'popTemu');"]`).click()
            let td = document.querySelector(`.resizeImgList`)
            let loadDivs = td.querySelectorAll('[data-type=load]')
            // 等待选中数量一致
            while(loadDivs.length !== td.querySelectorAll("div[data-type=ready]").length){
                await sleep(200)
            }
            // 确定修改
            document.querySelector(`button[onclick^="IMGRESIZE.beforeResize(this, true, 'jpeg');"]`).click()
        }
    }
    // 添加批量编辑按钮
    function editorBtn(){
        let maodian = document.querySelector('.maodian')
        let div = maodian.nextElementSibling
        let childDiv = document.createElement('div')
        childDiv.classList.add('navIcon', 'toSubmit', 'btn-orange')
        childDiv.innerHTML = '批量编辑'
        childDiv.style.fontSize='10px'
        childDiv.style.textAlign ='center'
        childDiv.id = 'editorBtn'
        div.append(childDiv)
        // 调用批量编辑确定按钮
        childDiv.onclick = () => {
            document.querySelector(`li[onclick^="TOAST_IMAGE_EDITOR.onBatchEditImage('#myjDrop', '.tuiImageBox', null, true)"]`).click()
            let checkImgs = document.querySelectorAll(`input[data-checkindex]`)
            let div = document.querySelector('.modalBodyBsm')
            checkImgs.forEach(i =>{
                let index = i.getAttribute("data-checkindex") - 1
                div.querySelector('img[data-id="'+index+'"]').click()
            })
            div.parentElement.querySelector('.btnConfirmBsm').click()
        }
    }
    // 添加立即发布
    function addPublishBtn(){
        let maodian = document.querySelector('.maodian')
        let div = maodian.nextElementSibling
        let childDiv = document.createElement('div')
        childDiv.classList.add('navIcon', 'toSubmit', 'btn-green')
        childDiv.innerHTML = '立即发布'
        childDiv.style.fontSize='10px'
        childDiv.style.textAlign ='center'
        childDiv.id = 'customPublishButton'
        div.append(childDiv)
        // 调用立即发布
        let btn = document.querySelector('.page-btn-group-div')
        let publishBtn = btn.querySelector('[data-value=save-2]')
        childDiv.onclick = () => publishBtn.click()
    }
    // 初始化
    async function init(){
        // 添加删除产品名按钮
        delBrandBtn()
        // 添加修改尺寸按钮
        changeSizeBtn()
        // 添加批量编辑按钮
        editorBtn()
        // 添加发布按钮
        addPublishBtn()
        // 标题修改
        modTitle()
        // 获取变体数据
        getArgs()
        // 变体选择绑定点击事件
        bindOncli()
    }

    // start
    (async () => {
        await waitForElement('#customTheme table tbody tr')
        await waitForElement('#skuInfoTable tbody tr')
        init()
    })()

    // 点击触发修改 table 信息
    async function modTable(evn, key){
        let input = null
        if(!key){
            input = evn.target
            key = input.value
        }
        let infoSelector = '#skuInfoTable tbody tr[trid$="' + key +'"]'
        await waitForElement(infoSelector)
        let tr = skuInfoTable.querySelector(infoSelector)
        key = tr.getAttribute('trid')
        if(!data[key]) {
            return
        }
        // 获取每一行 table
        tr.querySelector('input[name=variationSku]').value = data[key]['sku']
        tr.querySelector('input[name=price]').value = data[key]['price']
        tr.querySelector('input[name=skuLength]').value = data[key]['length']
        tr.querySelector('input[name=skuWidth]').value = data[key]['width']
        tr.querySelector('input[name=skuHeight]').value = data[key]['height']
        tr.querySelector('input[name=weight]').value = data[key]['weight']
        // 绑定事件
        tr.querySelector('input[name=skuLength]').onchange = sortSize
        tr.querySelector('input[name=skuWidth]').onchange = sortSize
        tr.querySelector('input[name=skuHeight]').onchange = sortSize

        // 修改引用图片
        changeMapImage(tr)
        // 修改库存
        let stockSelector = '#skuOrderInfoTable tr[trid$="' + key +'"]'
        await waitForElement(stockSelector)
        let trs = document.querySelectorAll("#skuOrderInfoTable tbody tr")
        trs.forEach(i => {
            let stockInput = i.querySelector('input[name=stock]')
            stockInput.value = data[key]['stock']
            let warehouseId = stockInput.getAttribute('data-warehouse')
            // 实际修改库存的位置
            let inputH = i.querySelector('.warehouseStockQuantityReqs')
            inputH.value = '[{"warehouseId":"'+warehouseId+'", "targetStockAvailable":"'+data[key]['stock']+'"}]'
        })
    }
    // 自定义休眠函数
    function sleep(timeout) {
        return new Promise(resolve => setTimeout(resolve, timeout))
    }
    // 等待传入的指定元素加载
    function waitForElement(selector, _document) {
        if(_document){
            document = _document
        }
        return new Promise((resolve) => {
            const observer = new MutationObserver((mutations, observerInstance) => {
                const element = document.querySelectorAll(selector)
                if (element.length > 0) {
                    resolve(element)
                    observerInstance.disconnect()
                }
            })
            observer.observe(document.body, { childList: true, subtree: true })
            // 立即检查一次，防止元素已经存在
            const element = document.querySelectorAll(selector)
            if (element.length > 0) {
                resolve(element)
                observer.disconnect()
            }
        })
    }
})();