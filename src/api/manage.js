import axios from '@/utils/request'

//get
export function getAction(url,parameter, method = 'get') {
  return axios({
    url: url,
    method: method,
    params: parameter
  })
}


//post
export function postAction(url,parameter) {
  return axios({
    url: url,
    method:'post' ,
    data: parameter,
    headers:{
          'Content-Type':'application/json;charset=UTF-8'
        }

  })
}

export function uploadAction(url,parameter) {
  return axios({
    url: url,
    method:'post' ,
    data: parameter,
    headers:{
      'Content-Type': 'multipart/form-data'
    }

  })
}

//put
export function putAction(url,parameter) {
  return axios({
    url: url,
    method:'put',
    data: parameter
  })
}

//deleteAction
export function deleteAction(url,parameter) {
  return axios({
    url: url,
    method: 'delete',
    params: parameter
  })
}

//post method= {post | put}
export function httpAction(url,parameter,method) {
  return axios({
    url: url,
    method:method ,
    data: parameter
  })
}

/**
 * 下载文件 用于excel导出
 * @param url
 * @param parameter
 * @returns {*}
 */
export function downFile(url,parameter){
  return axios({
    url: url,
    params: parameter,
    method:'get' ,
    responseType: 'blob'
  })
}

export function downFilePost(url,parameter){
  return axios({
    url: url,
    method:'post' ,
    data: parameter,
    responseType: 'blob',
    headers:{
      'Content-Type':'application/json;charset=UTF-8'
    }
  })
}

export function startWith(str,pre) {
  if (pre == null || pre == "" || str==null|| str==""|| str.length == 0 || pre.length > str.length)
    return false;
  if (str.substr(0, pre.length) == pre)
    return true;
  else
    return false;
}

export function substrPre(str,pre) {
  return str.substr(pre.length);
}

//getMenuList 获取页面
export function getMenuList(url,parameter, method = 'get') {
  return axios({
    url: url,
    method: method,
    params: parameter
  })
}
