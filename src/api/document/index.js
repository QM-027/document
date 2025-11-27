import request from "@/utils/request.js";


// 查询技术中心列表
export function getDocument() {
    return request({
        url: '/document/list',
        method: 'get'
    })
}

// 获取分类详情
export function getDocumentListByCode(code) {
    return request({
        url: `/document/code/${code}`,
        method: 'get',
    })
}

// 保存
export function saveDocument(data) {
    return request({
        url: '/document/save',
        method: 'post',
        data: data
    })
}
