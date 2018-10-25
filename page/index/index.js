const app = getApp();
var interval; //  动画倒计时
var polling;  //  开启动画轮询
var QR = require('../../service/qrcode.js');
const WxNotificationCenter = require('../../utils/WxNotificationCenter.js')

Page({
  data: {
    screenHeight: 0,
    screenWidth: 0,
    ratio: 0, //比率：screenWidth/750

    info: [],//广告位轮播

    current: 0,//功能swiper页
    show: true,//功能bar

    userId: '',//username,接口参数
    mac: '',//mac地址
    is_baitu_work: false,

    showType: true,//扫一扫与二维码转换

    showMode: false,
    showClose: false,

    payMenu: false, // 支付下拉菜单显示隐藏
    paySelect: '', // 选中的文字
    payModel: '',  // 支付类型
    payList: [], // 支付方式
    payTop: false,
    signing: '',
    modelId: '',

    hotMode: [],//模式
    modeName: '',

    state: 0,//状态，0：空闲，1：运行中
    tradeNO: '',//订单号
  },
  //调用获取屏幕宽高以及授权方法
  onLoad(options) {
    this.getAuthCode();
    this.getInfo();
    var that = this;
    WxNotificationCenter.addNotification('NotificationName', that.didNotification, that)
  },
  // 通知处理
  didNotification: function(obj) {
    //更新数据
    var that = this;
    that.observer.setData({
      modelId: obj.modelId,
      modeType: obj.modeType,
      payModel: obj.payModel
    })
    that.observer.facePay();
  },
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
  // bar 功能以及swiper联动
  show(e) {
    if (e.target.id == 'scan') {
      this.setData({
        showType: true,
        show: true
      })
    } else {
      this.setData({
        showType: false,
        show: false
      })
      this.drawQRCode();
    };
  },
  // 扫码功能
  scan() {
    let that = this;
    var mac;
    my.scan({
      success: (res) => {
        mac = res.code;
        that.setData({ mac: mac })
        my.setStorageSync({
          key: 'mac', // 缓存数据的key
          data: res.code, // 要缓存的数据
        });
        my.navigateTo({ url: '/page/machineModel/machineModel' });
      }
    });
  },
  // facePay
  facePay() {
    let userId = this.data.userId;
    let payModel = this.data.payModel;
    let mapping = this.data.mac;
    let modelId = this.data.modelId;
    let url = '/alipay/miniprogram/facepay';
    let params = {
      alipayPid: userId, mapping: mapping, modeId: modelId, pay_type: payModel
    };
    app.req.requestPostApi(url, params, this, res => {
      my.removeStorageSync({
        key: 'mac', // 缓存数据的key
      }).data;
      let tradeNO = res.res.tradeNo;
      // payModel 1 = 余额支付
      if (payModel == 1) {
        this.signed(tradeNO)
        // payModel 2 = 当面付
      } else if (payModel == 2) {
        this.notSigned(tradeNO);
        // payModel 3 = 免密支付
      } else if (payModel == 3) {
        this.signed(tradeNO)
      }
    })
  },
  /* 不需要拉起收银台开启机器 */
  signed(tradeNO) {
    let url = '/alipay/miniprogram/facepay_open_machine';
    let userId = this.data.userId;
    let modeType = this.data.modeType;
    let parmas = { tradeNo: tradeNO, alipayPid: userId };
    app.req.requestPostApi(url, parmas, this, res => {
      var that = this;
      // 判断设备类型
      if (modeType == 1) {
        if (res.res.openType === 1) {
          var time = res.res.missionTime;
          that.setData({
            showMode: false,
            showClose: true
          });
          that.getAraw(time);
          //轮询查询开水器状态
          var time_polling = new Date().getTime();
          var sign_polling = app.common.createSign({
            mac: that.data.mac,
            userName: userId,
            timestamp: time_polling,
          })
          var param_polling = {
            sign: sign_polling,
            timestamp: time_polling,
            mac: that.data.mac,
            userName: userId,
          }
          if (res.res.isPollingEnable) {
            polling = setInterval(() => {
              app.req.requestPostApi('/miniprogram/machine/queryHotState', param_polling, this, res => {
                if (res.res === 1) {
                  clearInterval(polling);
                  clearInterval(interval);
                  that.setData({
                    showClose: false
                  });
                }
              }, function(res) {
                clearInterval(polling);
              })
            }, 2000)
          }
        }
        else if (res.res.openType == 2) {
          my.alert({
            title: '温馨提示',
            content: '请按键',
            success: (res) => {
              that.setData({
                showMode: false,
                showClose: true
              });
            },
          });
        }
        else {
          that.setData({
            showMode: false,
            showClose: false,
          });
          my.alert({
            title: '提示',
            content: res.message,
          })
        }
      } else {
        my.showToast({
          type: 'success',
          content: '开启设备成功',
          duration: 1000,
        });
      }
    })
  },
  /* 需要拉起收银台后开启机器) */
  notSigned(tradeNO) {
    my.tradePay({
      tradeNO: tradeNO,
      success: res => {
        if (res.resultCode == 9000) {
          my.showToast({
            content: '支付成功',
            type: 'success',
            duration: 1000,
            success: res => {
              let url = '/alipay/miniprogram/facepay_open_machine';
              let userId = this.data.userId;
              let modeType = this.data.modeType;
              var params = {
                tradeNo: tradeNO,
                alipayPid: userId,
              }
              app.req.requestPostApi(url, params, this, res => {
                var that = this;
                // 判断设备类型
                if (modeType == 1) {
                  if (res.res.openType === 1) {
                    var time = res.res.missionTime;
                    that.setData({
                      showMode: false,
                      showClose: true
                    });
                    that.getAraw(time);
                    //轮询查询开水器状态
                    var time_polling = new Date().getTime();
                    var sign_polling = app.common.createSign({
                      mac: that.data.mac,
                      userName: userId,
                      timestamp: time_polling,
                    })
                    var param_polling = {
                      sign: sign_polling,
                      timestamp: time_polling,
                      mac: that.data.mac,
                      userName: userId,
                    }
                    if (res.res.isPollingEnable) {
                      polling = setInterval(() => {
                        app.req.requestPostApi('/miniprogram/machine/queryHotState', param_polling, this, res => {
                          if (res.res === 1) {
                            clearInterval(polling);
                            clearInterval(interval);
                            that.setData({
                              showClose: false
                            });
                          }
                        }, function(res) {
                          clearInterval(polling);
                        })
                      }, 2000)
                    }
                  }
                  else if (res.res.openType === 2) {
                    my.alert({
                      title: '温馨提示',
                      content: '请按键',
                      success: (res) => {
                        that.setData({
                          showMode: false,
                          showClose: true
                        });
                      },
                    });
                  }
                  else {
                    that.setData({
                      showMode: false,
                      showClose: false,
                    });
                    my.alert({
                      title: '提示',
                      content: res.message,
                    })
                  }
                } else {
                  my.showToast({
                    type: 'success',
                    content: '开启设备成功',
                    duration: 1000,
                  });
                }
              })
            }
          })
        } else if (res.resultCode == 4000) {
          my.showToast({
            content: '订单支付失败',
            type: 'fail',
            duration: 1000,
          })
        } else if (res.resultCode == 6001) {
          my.showToast({
            content: '订单中途取消',
            type: 'fail',
            duration: 1000,
          })
        }
      }
    })
  },
  // 关闭开水器
  endHot() {
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
      clearInterval(interval);
      clearInterval(polling);
      that.setData({
        showClose: false
      });
    }, function(res) {
      clearInterval(interval)
      that.setData({
        showClose: false
      });
    })

  },
  // 直接出水模式打水动画
  getAraw(t) {
    var that = this;
    var step = 2;
    interval = setInterval(function() {
      var start = Math.PI * 1.5, end, n = t; //初始角度，终止角度,时间
      if (step <= n) {
        end = step / n * 2 * Math.PI + 3 / 2 * Math.PI;
        that.draw(start, end)
        step++;
      } else {
        clearInterval(interval)
        clearInterval(polling)
        that.setData({
          showClose: false
        })
        my.confirm({
          title: "温馨提示",
          content: '再打一次',
          confirmButtonText: '确定',
          success: (res) => {
            if (res.confirm) {
              that.signed();
            }
          },
        });
      }
    }, 1000)
  },
  // 绘制图形
  draw(s, e) {
    var x = this.data.screenWidth / 2,
      y = this.data.screenWidth / 2,
      radius = this.data.screenWidth / 3 + 3;
    var cxt_arc = my.createCanvasContext('scan');//创建并返回绘图上下文context对象。
    cxt_arc.setLineWidth(6);
    cxt_arc.setStrokeStyle('#3ea6ff');
    cxt_arc.setLineCap('round')
    cxt_arc.beginPath();//开始一个新的路径
    cxt_arc.arc(x, y, radius, s, e, false);
    cxt_arc.stroke();//对当前路径进行描边
    cxt_arc.draw();
  },
  // 二维码绘制 
  drawQRCode() {
    var that = this;
    let userId = this.data.userId;
    var time = new Date().getTime();
    var sign = app.common.createSign({
      userName: userId,
      timestamp: time
    });
    var params = {
      userName: userId,
      timestamp: time,
      sign: sign
    };
    app.req.requestPostApi('/miniprogram/stu/qrcode', params, this, function(res) {
      var size = that.setCanvasSize();
      var initUrl = res.message;
      that.createQrCode(initUrl, "qrcode", size.w, size.h);
    })
  },
  // 适配不同屏幕大小的canvas
  setCanvasSize() {
    var size = {};
    try {
      var res = my.getSystemInfoSync();
      var width = res.windowWidth;
      var height = width;//canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  // 调用插件中的draw方法，绘制二维码图片
  createQrCode(url, canvasId, cavW, cavH) {
    QR.qrApi.draw(url, canvasId, cavW, cavH);
  },
  // 获取设备信息
  getInfo() {
    var that = this;
    my.getSystemInfo({
      success(res) {
        that.setData({
          screenHeight: res.screenHeight,
          screenWidth: res.windowWidth,
          pixelRatio: res.windowWidth / 750
        })
      },
    })
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
  // 跳转到红包页面
  goRedEnv() {
    my.navigateTo({
      url: '/page/redEnvelope/redEnvelope'
    });
  },
});
