import request from "@/utils/request.js";

// 获取知识点题目列表
export function getQuestionInfoList() {
    return request({
        url: '/questionInfo/list',
        method: 'get'
    })
}