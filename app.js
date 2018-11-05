//app.js
var constant = require('./service/macro.js');
var req = require('./service/request.js');
var common = require('./service/common.js');
var md5 = require('./service/md5.js');
App({
  globalData: {
    deviceState: 0,  // 0 未开始 1进行中 2已经结束
    devicePage: 'index'
  },
  // 初始化加载时 获取options返回值
  onLaunch(options) {
    // 如果没有返回值 则删除 缓存值 
    if (!options.query) {
      my.removeStorage({ key: 'mac', });
      my.removeStorage({ key: 'page', });
      my.removeStorage({ key: 'promoters', });
      my.removeStorage({ key: 'cacheTime', });
      my.removeStorage({ key: 'nav', });
    } else {
      // 缓存扫后台生成二维码进入的映射码 页面地址 地推人员标识 时间戳
      my.setStorage({ key: 'mac', data: options.query.mac });
      my.setStorage({ key: 'page', data: options.query.target_page });
      my.setStorage({ key: 'promoters', data: options.query.ground_promotion_no });
      my.setStorage({ key: 'cacheTime', data: Date.parse(new Date()) + 900000 })
    }
  },

  common: common,
  req: req,
  md5: md5
});
