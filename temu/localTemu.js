// ==UserScript==
// @name         本土 - 店小秘自定义插件
// @namespace    http://tampermonkey.net/
// @version      2024-11-13
// @description  店小秘 本土店 编辑设置初始化
// @author       You
// @match        https://www.tampermonkey.net/index.php?version=5.3.6216&ext=gcal&updated=true
// @match        https://www.dianxiaomi.com/localTemuProduct/edit.*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const stock = 3
    let data = {}
    let initTrs = 0
    let sku = ""

    function getArgs(){
        // 获取每一行 table
        let trs = document.querySelectorAll('#skuInfoTable tbody tr')
        initTrs = trs.length
        // 获取 sku
        let shopUrl = document.querySelector('#sourceUrl0')
        let url = shopUrl.value
        sku = (url.match(/.*\/dp\/(.*)[?/]/) ?? url.match(/.*\/dp\/(.*)/))[1]

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
                if (num && num > 9999) arr[index] = 9999
            })
            data[key] = {
                'sku': sku,
                'price': price.value * 2,
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
                if (num && num > 9999) arr[index] = 9999
            })
            length.value = sizeList[0]
            width.value = sizeList[1]
            height.value = sizeList[2]
        })
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
            inputs[0].onclick = modTable
        }
    }
    // 检测产品是否需要说明书
    function checkProductFileTd(){
        let td = document.querySelector('.productFileTd')
        if(td.classList.contains('must')){
            if(confirm("该商品需要说明书, 是否关闭该页面")){
                window.close()
            }else{

            }
        }
    }
    // 设置 sku 为 Product ID
    function setVariationSku(){
        let productId = document.querySelector('.extraTemplateAttrSelectIpt')
        let button = document.querySelector('.extraTemplateAttrButton')
        productId.value = sku
        button.click()
    }
    // 设置安全信息和电池信息
    function setOtherExtraAttrIptSel(){
        let Warning = document.querySelector('tr[templateid="36"] option[data-name="View Product Details Page"]')
        let Waste  = document.querySelector('tr[templateid="207"] option[data-name="Information Not Applicable"]')
        if(Warning){
            Warning.selected = true
        }
        if(Waste){
            Waste.selected = true
        }
    }
    // 设置运输运输信息
    function setTransportInformation(){
        let timeTwoDay = document.querySelector('input[type=radio][name=deliveryTime][value="2"]')
        let templateSelector = document.querySelectorAll('.transportInfoModule .menuListLi')
        // templateSelector.forEach(i => {
        //     if(i.innerText.indexOf('请选择') === -1){
        //         i.click()
        //         return
        //     }
        // })
        templateSelector[1].click()
        timeTwoDay.checked = true
    }
    // 删除图片
    function delSlideshow(){
        let imgs = document.querySelectorAll("#skuImgContent .variantImgDelBtn")
        imgs.forEach(i => i.click())
    }
    // 删除部分描述信息
    function delDesc(){
        let textareas = document.querySelectorAll("#productDetailBox textarea")
        textareas[0].value = ""
        textareas[textareas.length-1].value = ""
    }
    // 修改标题
    function modTitle(){
        let title = document.querySelector('#productTitle')
        title.value = title.value.replace(/[^\s\w"']/g, "")
    }
    // 跳过资质信息
    function skipGoodsInfoTr(){
        let skip = document.querySelectorAll('.skipGoodsInfoTr input')
        if(!skip){
            return
        }
        skip.forEach(i => {
            if(!i.checked) i.click()
        })
    }
    // 删除产品名按钮
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
        const barnd = prompt("请输入产品名字")
        let title = document.querySelector('#productTitle')
        let textareas = document.querySelectorAll("#productDetailBox textarea")
        title.value = title.value.replace(barnd, "")
        textareas.forEach(i => i.value = i.value.replace(barnd, ""))
    }
    // 批量清空重新引用前五张图片
    function cleanSelectBtn(){
        let maodian = document.querySelector('.maodian')
        let div = maodian.nextElementSibling
        let childDiv = document.createElement('div')
        childDiv.classList.add('navIcon', 'toSubmit', 'btn-plain')
        childDiv.innerHTML = '重新引用'
        childDiv.style.fontSize='10px'
        childDiv.style.textAlign ='center'
        childDiv.id = 'cleanSelectBtn'
        div.append(childDiv)
        // 调用批量编辑确定按钮
        childDiv.onclick = async () => {
            // 拿到所有图片进行删除图片
            document.querySelectorAll(`a[onclick^="LOCAL_TEMU_PRODUCT_IMAGE_UP.imageFn.delImg(this, 'productImg');"]`).forEach(i => i.click())
            // 采集引用图片
            document.querySelector(`a[onclick^="PRODUCT_QUOTE_IMG.quoteImageFn(2, LOCAL_TEMU_PRODUCT_IMAGE_UP.imageFn.proImgSpaceFromConfirm, '|');"]`).click()
            // 获取所有引用图片 并且转成数组, 点击选中前5张
            Array.from(document.querySelectorAll(`#quoteImageDiv input`)).slice(0,5).forEach(i => i.click())
            // 确认选择
            document.querySelector(`button[onclick^="PRODUCT_QUOTE_IMG.quoteImageConfirm();"]`).click()
        }
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
            document.querySelector(`li[onclick^="IMGRESIZE.modalBuild('resizeOut', LOCAL_TEMU_PRODUCT_FN.skuFn.resizecall, 'localTemu');"]`).click()
            let td = document.querySelector(`.resizeImgList`)
            let loadDivs = td.querySelectorAll('[data-type=load]')
            while(!(loadDivs.length == td.querySelectorAll("div[data-type=ready]").length)){
                await sleep(200)
            }
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
        childDiv.onclick = async () => {
            // 点击批量编辑
            document.querySelector(`li[onclick^="TOAST_IMAGE_EDITOR.onBatchEditImage('#myjDrop', '.tuiImageBox', null, true)"]`).click()
            // 获取选中的图片
            let checkedImgs = []
            // 获取所有图片
            let selected = document.querySelectorAll('[name="selectedImg"]')
            for(let i=0; i < selected.length; i++){
                if(selected[i].checked){
                    checkedImgs.push(i)
                }
            }
            // 获取批量编辑窗口
            let div = document.querySelector('.modalBodyBsm')
            checkedImgs.forEach(i =>{
                // 根据存储的索引选择图片
                div.querySelector(`img[data-id="${i}"]`).click()
            })
            div.parentElement.querySelector('.btnConfirmBsm').click()
        }
    }
    // 在 sku 轮播图中选出 描述图片
    function skuImgsforDescImgBtn(){
        let maodian = document.querySelector('.maodian')
        let div = maodian.nextElementSibling
        let childDiv = document.createElement('div')
        childDiv.classList.add('navIcon', 'toSubmit', 'btn-gray')
        childDiv.innerHTML = '轮播图'
        childDiv.style.fontSize='10px'
        childDiv.style.textAlign ='center'
        childDiv.id = 'changeSizeBtn'
        div.append(childDiv)
        // 调用批量修改
        childDiv.onclick = async () => {
            // 点击图片空间
            document.querySelectorAll(`#skuImgBox a[onclick^="LOCAL_TEMU_PRODUCT_IMAGE_UP.imageFn.uploadSkuImg(2, this);"]`).forEach(async (i) => {
                i.click()
                // 获取所有图片
                let selected = document.querySelectorAll('[data-names=auxiliaryImg]')
                // 获取选中的图片
                let checkedImgs = []
                for(let i=0; i < selected.length; i++){
                    let name = selected[i].getAttribute("src").match(/.*[/](.*.jpg)/)[1]
                    if(name){
                        checkedImgs.push(name)
                    }
                }
                // 获取图片空间节点
                await waitForElement(`#commProductMyFrame`)
                let iframe = document.querySelector(`#commProductMyFrame`)
                iframe.onload = async () => {
                    let div = iframe.contentDocument.querySelector("#rightBody")
                    checkedImgs.forEach(async (i)  => {
                        // 根据选中的图片来选取 sku 轮播图
                        div.querySelector(`img[src$="${i}"]`).click()
                    });
                    while(div.querySelectorAll(".imgHome:checked").length !== checkedImgs.length){
                        await sleep(200)
                    }
                    // 点击确定
                    document.querySelector(`button[onclick^="PRODUCT_COMM.imgSpaceFromConfirm();"]`).click()
                }
            })
        }
    }
    // 添加立即发布
    function addPublishBtn(){
        let maodian = document.querySelector('.maodian')
        let div = maodian.nextElementSibling
        let childDiv = document.createElement('div')
        childDiv.classList.add('navIcon', 'toSubmit', 'btn-green')
        childDiv.innerHTML = '发<br/>布'
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
    function init(){
        // 检查产品说明书
        checkProductFileTd()
        // 添加删除产品名按钮
        delBrandBtn()
        // 批量清空重新引用前五张图片
        cleanSelectBtn()
        // 添加修改尺寸按钮
        changeSizeBtn()
        // 添加批量编辑按钮
        editorBtn()
        // 在 sku 轮播图中选出 描述图片
        skuImgsforDescImgBtn()
        // 添加发布按钮
        addPublishBtn()
        // 获取变种信息
        getArgs()
        // 跳过信息
        skipGoodsInfoTr()
        // 删除描述
        delDesc()
        // 删除图片
        delSlideshow()
        // 设置运输信息
        setTransportInformation()
        // 设置 sku 为 Product ID
        setVariationSku()
        // 设置安全信息和电池信息
        setOtherExtraAttrIptSel()
        // 修改标题
        modTitle()
        // 绑定点击事件到变种信息多选框
        bindOncli()
    }
    // start
    (async () => {
        await waitForElement('#customTheme table tbody tr')
        await waitForElement('#skuInfoTable tbody tr')
        await waitForElement('.extraTemplateAttrSelectIpt')
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
        tr.querySelector('input[name=stock]').value = data[key]['stock']
        tr.querySelector('input[name=salePrice]').value = null
        // 绑定事件
        tr.querySelector('input[name=skuLength]').onchange = sortSize
        tr.querySelector('input[name=skuWidth]').onchange = sortSize
        tr.querySelector('input[name=skuHeight]').onchange = sortSize
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