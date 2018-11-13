var constant = require('./macro.js');
var URL = constant.api;
var version = constant.version;
/* POST请求API*/
function requestPostApi(url, params, sourceObj, successFun, failFun, completeFun) {
  requestApi(url, params, 'POST', 0, sourceObj, successFun, failFun, completeFun)
}
/* POST提交请求API*/
function requestPostDataApi(url, params, sourceObj, successFun, failFun, completeFun) {
  requestApi(url, params, 'POST', 1, sourceObj, successFun, failFun, completeFun)
}

/* GET请求API */
function requestGetApi(url, params, sourceObj, successFun, failFun, completeFun) {
  requestApi(url, params, 'GET', 0, sourceObj, successFun, failFun, completeFun)
}

/* 请求API */
function requestApi(url, params, method, headers, sourceObj, successFun, failFun, completeFun) {
  //构造HTTP头
  //Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36
  if (url !== '/miniprogram/sign/checkBind' && url !== '/miniprogram/machine/queryHotState') {
    my.showLoading({
      title: '加载中',
      icon: 'loading',
      mask: true,
    });
  }

  var httpUserAgent = "";
  my.getAuthUserInfo({
    success: function (res) {
      //手机品牌 手机型号
      httpUserAgent += res.brand + "/" + res.model;
      //操作系统版本-微信版本号
      httpUserAgent += " (" + res.system + "," + res.version + ")";
      //客户端平台 客户端基础库版本
      httpUserAgent += " " + res.platform + "/" + res.SDKVersion;
    }
  });

  // 公共头部
  var headerOptions = {
    'HTTP_USER_AGENT': httpUserAgent,
    'X-App-Version': version,
    'Accept': 'application/json',
    'x-platform': 'Alipay'
  };

  // 特殊头部
  if (method == 'POST' && headers == 0) {
    headerOptions["Content-Type"] = 'application/json';
    //headerOptions["Content-Type"] = 'application/x-www-form-urlencoded;charset=UTF-8';
  } else if (method == 'POST' && headers == 1) {
    headerOptions["Content-Type"] = 'multipart/form-data;charset=UTF-8';
  }
  if(url == '/miniprogram/getAllSchools'){
  } else {
     params = JSON.stringify(params)
  }
  my.httpRequest({
    url: URL + url, // 目标服务器url
    method: method,
    data: params,
    headers: headerOptions,
    success: (res) => {
      my.hideLoading();
      if (res.data.return) {
        typeof successFun == 'function' && successFun(res.data, sourceObj)
      } else {
        if (url !== '/alipay/miniprogram/autologin' 
            && url !== '/miniprogram/stu/getact'
            && url !== '/miniprogram/sign/checkBind'
            && url !== '/miniprogram/machine/stophot'
            && url !== '/miniprogram/get_school_by_qrcode') {
              my.alert({
                title: "错误提示",
                content: res.data.message,
              })
        }
      }
    },
    fail: function (res) {
      my.hideLoading();
      typeof failFun == 'function' && failFun(res.data, sourceObj)
    },
    complete: function (res) {
      my.hideLoading();      
      typeof completeFun == 'function' && completeFun(res.data, sourceObj)
    },
  });
}

module.exports = {
  requestPostApi,
  requestPostDataApi,
  requestGetApi
}