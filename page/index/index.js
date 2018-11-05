const app = getApp();
var QR = require('../../service/aliqrcode.js');

Page({
  /*
  params {
    userName:userId, 用户名
    mapping:mac, 映射码地址
  }
  info:广告位数组
  codeData:二维码数组
  showType:扫一扫与二维码转换
  state:判断是否出水
  payModel:支付类型
  modeId:模式型号
  tradeNO:订单号
  switchName:切换名称
  switch:切换
  */
  data: {
    userId: '',
    mac: '',
    info: [],
    codeData: '',
    showType: true,
    state: false,
    payModel: '',
    modeId: '',
    tradeNO: '',
    switch: '',
    switchName: '扫一扫'
  },
  //调用获取屏幕宽高以及授权方法
  onLoad(options) {
    this.getAuthCode();
  },
  onShow() {
    app.globalData.devicePage = 'index';
    if (app.globalData.deviceState == 1) {
      this.setData({
        state: true,
      })
    };
    if (app.globalData.deviceState == 2) {
      app.globalData.deviceState = 0;
    }
  },
  // 获取授权判断用户状态
  getAuthCode() {
    my.getAuthCode({
      scopes: 'auth_base',
      success: res => {
        let self = this;
        let authCode = res.authCode;
        let params = { authCode: authCode }
        let url = '/alipay/miniprogram/grantLogin';
        app.req.requestPostApi(url, params, this, res => {
          let userId = res.res.UserId;
          let actoken = res.res.AccessToken;
          this.setData({
            userId: userId,
            actoken: actoken
          });
          my.setStorage({
            key: 'userId',
            data: userId,
          });
          my.setStorage({
            key: 'actoken',
            data: actoken
          })
          if (res.message == "10002") {
            my.reLaunch({
              url: '/page/school/school',
            });
            // 10001 为已经注册的账号 执行登录接口
          } else if (res.message == "10001") {
            self.getAutoLogin();
          }
        })
      }
    })
  },
  // 已登录用户缓存数据
  getAutoLogin() {
    let url = '/alipay/miniprogram/autologin';
    let params = { account: this.data.userId };
    app.req.requestPostApi(url, params, this, res => {
      my.setStorage({
        key: 'worker',
        data: res.res.is_baitu_worker
      });
      my.setStorage({
        key: 'stuId',
        data: res.res.id,
      });
      my.setStorage({
        key: 'cardNo',
        data: res.res.cardNo,
      });
      this.getCookie();
    })
  },
  // 调用广告位接口
  getCookie() {
    /* 调用主页广告位接口 */
    this.getAdInfo();
    /* 缓存值判断用户什么入口进入 跳转相应页面 */
    my.getStorage({
      key: 'page',
      success: (res) => {
        if (res.data && res.data !== 'undefined') {
          my.navigateTo({
            url: res.data
          });
        } else {
          my.getStorage({
            key: 'mac',
            success: (res) => {
              if (res.data && res.data !== 'undefined') {
                this.setData({
                  mac: res.data
                })
                my.navigateTo({
                  url: '/page/machineModel/machineModel'
                });
              }
            },
          });
        }
      },
    });
  },
  // 扫码功能
  scanCode() {
    let that = this;
    var mac;
    my.scan({
      success: (res) => {
        mac = res.code;
        that.setData({ mac: mac })
        my.navigateTo({ url: '/page/machineModel/machineModel?mac=' + mac });
      }
    });
  },
  // 停止开水
  stopHot() {
    var that = this;
    let userId = this.data.userId;
    let url = '/miniprogram/machine/stophot';
    var time = new Date().getTime();
    var sign = app.common.createSign({
      mac: that.data.mac,
      timestamp: time,
      userName: userId
    });
    var params = {
      userName: userId,
      timestamp: time,
      mac: that.data.mac,
      sign: sign
    };
    app.req.requestPostApi(url, params, this, res => {
      that.setData({
        state: false
      });
      app.globalData.deviceState = 0;
    }, function(err) {
      that.setData({
        state: false
      });
      app.globalData.deviceState = 0;
    })

  },
  // 切换扫一扫
  scaning() {
    this.setData({
      switch: 'animation: scaning 0.3s linear 1 forwards',
      switchName: '扫一扫',
      showType: true
    })
  },
  // 切换二维码
  ewm() {
    this.setData({
      switch: 'animation: ewm 0.3s linear 1 forwards',
      switchName: '二维码',
      showType: false
    })
    this.drawQRCode();
  },
  // 获取广告位信息
  getAdInfo() {
    var that = this;
    let userId = this.data.userId;
    let url = '/miniprogram/ad/adList';
    var time = new Date().getTime();
    var sign = app.common.createSign({
      userName: userId,
      timestamp: time
    })
    var params = {
      userName: userId,
      timestamp: time,
      sign: sign
    }
    app.req.requestPostApi(url, params, this, res => {
      that.setData({
        info: res.res
      })
    })
  },
  // 跳转到H5页面
  jumpTo(e) {
    switch (e.currentTarget.dataset.info) {
      case 0:
        break;
      case 1:
        my.setStorageSync({
          key: 'nav',
          data: e.currentTarget.dataset.url,
        });
        my.navigateTo({
          url: '/page/webview/webview?id=' + e.currentTarget.dataset.id,
        })
        break;
      case 2:
        my.navigateTo({ url: '/page/operation/operation' });
        break;
    }
  },
  // 绘制二维码
  drawQRCode() {
    let url = '/miniprogram/stu/qrcode';
    let time = new Date().getTime();
    let sign = app.common.createSign({
      userName: this.data.userId,
      timestamp: time
    });
    let params = {
      userName: this.data.userId,
      timestamp: time,
      sign: sign
    }
    app.req.requestPostApi(url, params, this, res => {
      let initUrl = res.res;
      let codeData = QR.createQrCodeImg(initUrl, {});
      this.setData({ codeData: codeData })
    })
  }
});