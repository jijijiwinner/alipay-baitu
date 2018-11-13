const app = getApp();
let missionTime;
Page({
  data: {
    mapping: '',    // 映射
    modeId: '',     // 设备模式标识
    payModel: '',   // 支付模式
    userId: '',     // 用户标识
    tradeNO: '',    // 支付订单号
    modeType: '',   // 机器模式：区分开水器还是其他
    drawFlow1: '',  // 动画效果变量1
    drawFlow2: '',  // 动画效果变量2
    info: [],        // 广告位数组
  },

  onLoad(options) {
    let that = this;
    that.setData({
      mapping: options.mapping,
      modeId: options.modeId,
      userId: options.userId,
      tradeNO: options.tradeNO,
      payModel: options.payModel,
      modeType: options.modeType
    })
    let payModel = that.data.payModel;
    let tradeNO = that.data.tradeNO;

    if (payModel == 1) {
      this.freeOpenMachine(tradeNO)
    } else if (payModel == 2) {
      this.nofreeMachine(tradeNO);
    } else if (payModel == 3) {
      this.freeOpenMachine(tradeNO);
    }
  },
  onShow() {
    app.globalData.devicePage = 'draw';
    this.getAdInfo();
  },
  // 免密开启设备
  freeOpenMachine() {
    let that = this;
    let userId = that.data.userId;
    let modeType = that.data.modeType;
    let tradeNO = that.data.tradeNO;
    let url = '/alipay/miniprogram/facepay_open_machine';
    let parmas = { tradeNo: tradeNO, alipayPid: userId };
    app.req.requestPostApi(url, parmas, this, res => {
      if (modeType == 1) {
        if (res.res.openType == 1) {
          this.setData({
            drawFlow1: 'animation:drawFlow1 ' + res.res.missionTime + 's 1',
            drawFlow2: 'animation:drawFlow2 ' + res.res.missionTime + 's 1',
          })
          app.globalData.deviceState = 1;
          let time = setTimeout(() => {
            clearTimeout(time);
            app.globalData.deviceState = 2;
            my.navigateBack({});
          }, res.res.missionTime * 1000)
        } else if (res.res.openType == 2) {
          app.globalData.deviceState = 1;
          my.alert({
            title: '温馨提示',
            content: '请按键',
            success: res => {
              my.navigateBack({ delta: 2 });
            }
          });
        }
      } else {
        my.navigateBack({});
      }
    })
  },
  // 非免密开启设备
  nofreeMachine(tradeNO) {
    my.tradePay({
      tradeNO: tradeNO,
      success: (res) => {
        if (res.resultCode == 9000) {
          my.showToast({
            content: '支付成功',
            type: 'success',
            duration: 1000,
            success: res => {
              let that = this;
              let userId = that.data.userId;
              let modeType = that.data.modeType;
              let tradeNO = that.data.tradeNO;
              let url = '/alipay/miniprogram/facepay_open_machine';
              let parmas = { tradeNo: tradeNO, alipayPid: userId };
              app.req.requestPostApi(url, parmas, this, res => {
                if (modeType == 1) {
                  if (res.res.openType == 1) {
                    this.setData({
                      drawFlow1: 'animation:drawFlow1 ' + res.res.missionTime + 's 1',
                      drawFlow2: 'animation:drawFlow2 ' + res.res.missionTime + 's 1',
                    })
                    app.globalData.deviceState = 1;
                    let time = setTimeout(() => {
                      clearTimeout(time);
                      app.globalData.deviceState = 2;
                      my.navigateBack({});
                    }, res.res.missionTime * 1000)
                  } else if (res.res.openType == 2) {
                    app.globalData.deviceState = 1;
                    my.alert({
                      title: '温馨提示',
                      content: '请按键',
                      success: res => {
                        my.navigateBack({ delta: 2 });
                      }
                    });
                  }
                } else {
                  my.navigateBack({});
                }
              })
            }
          })
        } else if (res.resultCode == 4000) {
          my.showToast({
            content: '订单支付失败',
            type: 'fail',
            duration: 1000,
            success: res => {
              my.navigateBack({})
            }
          })
        } else if (res.resultCode == 6001) {
          my.showToast({
            content: '订单中途取消',
            type: 'fail',
            duration: 1000,
            success: res => {
              my.navigateBack({})
            }
          })
        }
      }
    });
  },
  // 停止开水
  stopHot() {
    let that = this;
    let mapping = that.data.mapping;
    let userId = that.data.userId;
    let url = '/miniprogram/machine/stophot';
    let time = new Date().getTime();
    let sign = app.common.createSign({
      mac: mapping,
      timestamp: time,
      userName: userId
    });
    let params = {
      userName: userId,
      timestamp: time,
      mac: mapping,
      sign: sign
    };
    app.req.requestPostApi(url, params, this, res => {
      that.setData({
        state: false
      });
      app.globalData.deviceState = 0;
      my.navigateBack({ delta: 2 });
    }, function(err) {
      that.setData({
        state: false
      });
      app.globalData.deviceState = 0;
      my.navigateBack({ delta: 2 });
    })
  },
  // 获取广告位信息
  getAdInfo() {
    let that = this;
    let userId = that.data.userId;
    let url = '/miniprogram/ad/adList';
    let time = new Date().getTime();
    let sign = app.common.createSign({
      userName: userId,
      timestamp: time
    })
    let params = {
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
});
