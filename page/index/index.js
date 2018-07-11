const app = getApp();
var interval; //  动画倒计时
var polling;  //  开启动画轮询
var QR = require('../../service/qrcode.js');
Page({
  data: {
    screenHeight: 0,
    screenWidth: 0,
    ratio: 0,     //  比率：screenWidth/750
    info: [],     //  广告位轮播
    current: 0,   //  功能位轮播
    show: true,   //  功能bar
    userId: '', //  接口参数
    mac: '',       //  mac地址
    showType: true,
    showWater: false,
    showWasher: false,
    showClose: false,
    waterType: 1,//开水器模式
    WasherType: 1,//洗衣机模式
    dryPrice: '',//单脱
    fastPrice: '',//快速
    stdPrice: '',//标准
    bigPrice: '',//大物
    state: 0,//状态，0：空闲，1：运行中
    tradeNO: '',//订单号
  },
  onLoad() {
    // 请求授权操作
    my.getAuthCode({
      scopes: 'auth_base',
      success: (res) => {
        my.getAuthUserInfo({
          success: (userInfo) => {
            let nickName = my.setStorageSync({
              key: 'nickName', // 缓存数据的key
              data: userInfo.nickName, // 要缓存的数据
            });
          }
        })
        // 将authCode传输给后台
        let authCode = res.authCode;
        let params = { authCode: authCode }
        let url = '/alipay/miniprogram/grantLogin';
        // 网络请求
        app.req.requestPostApi(url, params, this, res => {
          // 获取反馈数据的userId
          let userId = res.res.UserId;
          let actoken = res.res.AccessToken;
          my.setStorage({
            key: 'userId', // 缓存数据的key
            data: userId, // 要缓存的数据
          });
          my.setStorage({
            key: 'actoken',
            data: actoken,
          })
          if (res.message == 10002) {
            my.navigateTo({
              url: '/page/school/school'
            });
          } else if (res.message == 10001) {
            let url = '/alipay/miniprogram/autologin';
            let userId = my.getStorage({
              key: 'userId', // 缓存数据的key
              success: (res) => {
                this.setData({ userId: res.data })
              },
            })
            let params = { account: this.data.userId, };
            // 网络请求
            app.req.requestPostApi(url, params, this, res => {
              let that = this;
              let stu_id = my.setStorage({
                key: 'id', // 缓存数据的key
                data: res.res.id, // 要缓存的数据
                success: (res) => {
                  that.setData({ id: res.data })
                },
              });
              let schoolName = my.setStorage({
                key: 'schoolName', // 缓存数据的key
                data: res.res.schoolName, // 要缓存的数据
                success: (res) => {
                  that.setData({ schoolName: res.data })
                },
              });
              let cardNo = my.setStorage({
                key: 'cardNo', // 缓存数据的key
                data: res.res.cardNo, // 要缓存的数据
                success: (res) => {
                  that.setData({ cardNo: res.data })
                },
              });
              // this.getMoney();
              this.getInfo();
              this.getAdInfo();
            })
          }
        })
      }
    })
    // 异步获取数据
    my.getStorage({
      key: 'userId', // 缓存数据的key
      success: (res) => {
        this.setData({ userId: res.data })
      },
    });
    my.getStorage({
      key: 'mac', // 缓存数据的key
      success: (res) => {
        if (res.data) {
          this.setData({
            mac: res.data,
          })
        }
      },
    });
  },
  // // 获取钱包金额
  // getMoney() {
  //   let that = this;
  //   let userId = this.data.userId;
  //   let url = '/miniprogram/stu/money'
  //   let time = new Date().getTime();
  //   let sign = app.common.createSign({
  //     userName: userId,
  //     timestamp: time,
  //   })
  //   let params = {
  //     userName: userId,
  //     timestamp: time,
  //     sign: sign,
  //   };
  //   // 网络请求
  //   app.req.requestPostApi(url, params, this, (res) => {
  //     if (res.message <= 0) {
  //       my.alert({
  //         title: '提示',
  //         content: '余额不足，请前去充值',
  //         success: (res) => {
  //           my.navigateTo({
  //             url: '../wallet/wallet',
  //           });
  //         }
  //       })
  //     }
  //   })
  // },

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
        console.log(res);
        // 扫描二维码
        if (res.code.indexOf('mac=') >= 0) {
          mac = res.code.split('mac=')[1];
          if (mac.indexOf('#') >= 0) {
            mac = mac.split('#')[0];
          }
        }
        //  扫描小程序码
        else if (res.path) {
          if (res.path.indexOf('mac=')) {
            mac = res.path.split('mac=')[1];
            if (mac.indexOf('#') >= 0) {
              mac = mac.split('#')[0];
            }
          }
        }
        // 支付宝直接扫码
        else if (res.code.indexOf('mac%3D') >= 0) {
          mac = res.code.split('mac%3D')[1];
          if (mac.indexOf('#') >= 0) {
            mac = mac.split('#')[0];
          }
        }
        // 二维码内容直接为mac地址
        else {
          mac = res.code;
        }
        that.setData({
          mac: mac
        })
        that.getType();
      }
    });
  },
  // 获取模式
  getType: function () {
    var that = this;
    let userId = this.data.userId;
    var time = new Date().getTime();
    var sign = app.common.createSign({
      mac: that.data.mac,
      timestamp: time,
      userName: userId
    });
    var params = {
      mac: that.data.mac,
      timestamp: time,
      userName: userId,
      sign: sign
    }
    app.req.requestPostApi('/miniprogram/machine/scan', params, this, function (res) {
      that.setData({
        modeType: res.res.type,
        modeName: res.res.name,
        showMode: true,
        hotMode: res.res.modeList
      })
    })
  },

  /**
  * 取消功能
  */
  cancel: function (e) {
    this.setData({
      showMode: false,
    })
  },
  /**
   * 获取打水或洗衣模式
   */
  getModeType: function (e) {
    switch (this.data.modeType) {
      case 1:
        this.setData({
          waterType: e.target.id
        })
        let userId = this.data.userId;
        let mapping = this.data.mac;
        let modeId = this.data.waterType;
        let url = '/alipay/miniprogram/facepay';
        let params = { alipayPid: userId, mapping: mapping, modeId: modeId };
        // 网络请求
        app.req.requestPostApi(url, params, this, res => {
          let tradeNO = res.res;
          this.setData({ tradeNO: tradeNO })
          my.tradePay({
            tradeNO: tradeNO,
            success: (res) => {
              if (res.resultCode == 9000) {
                my.showToast({
                  type: 'success',
                  content: '支付成功',
                  duration: 1000,
                  success: (res) => {
                    this.openHot();
                  },
                });
              } else if (res.resultCode == 4000) {
                my.showToast({
                  type: 'fail',
                  content: '支付失败',
                  duration: 1200,
                });
              } else if (res.resultCode == 6001) {
                my.showToast({
                  type: 'fail',
                  content: '已取消支付',
                  duration: 1200,
                });
              } else {
                console.log(res);
              }
            },
            fail: (res) => {
              console.log(res);
            },
            complete: (res) => {
              console.log(res);
            }
          })
        })
        break;
      case 2:
        this.setData({
          washerType: e.target.id
        })
        this.openWasher();
        break;
      case 3:
        this.setData({
          blowerType: e.target.id
        })
        this.openBlower();
        break;
      case 4:
        this.setData({
          dryerType: e.target.id
        })
        this.openDryer();
        break;
    }
  },
  /**
   * 开启/关闭机器
   */
  openHot: function () {//开启开水器
    var that = this;
    var time = new Date().getTime();
    let url =  '/alipay/miniprogram/facepay_open_machine';
    let tradeNO = this.data.tradeNO;
    let userId = this.data.userId;
    var params = {
      tradeNo: tradeNO,
      alipayPid: userId,
    }
    app.req.requestPostApi(url, params, this, res => {
      if (res.res.openType == 1) {
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
          console.log(res.res)
          polling = setInterval(() => {
            app.req.requestPostApi('/miniprogram/machine/queryHotState', param_polling, this, res => {
              if (res.res == 1) {
                clearInterval(polling);
                clearInterval(interval);
                that.setData({
                  showClose: false
                });
              }
            }, function (res) {
              clearInterval(polling);
            })
          }, 2000)

        }
      } else {
        that.setData({
          showMode: false,
          showClose: false,
        });
        my.alert({
          title: '',
          content: res.message,
        })
      }
    })
  },
  endHot: function () {//关闭开水器
    var that = this;
    let userId = this.data.userId;
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
    app.req.requestPostApi('/miniprogram/machine/stophot', params, this, function (res) {
      clearInterval(interval);
      clearInterval(polling);
      that.setData({
        showClose: false
      });
    }, function (res) {
      clearInterval(interval)
      that.setData({
        showClose: false
      });
    })

  },
  /**
   * 直接出水模式打水动画
   */
  getAraw: function (t) {
    var that = this;
    var step = 2;
    interval = setInterval(function () {
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
          title: "提示",
          content: '再打一次',
          success: (res) => {
            if (res.confirm) {
              that.openHot();
            }
          },
        });
      }
    }, 1000)
  },
  openWasher: function () {//开启洗衣机
    var that = this;
    let userId = this.data.userId;
    var time = new Date().getTime();
    var sign = app.common.createSign({
      mac: that.data.mac,
      timestamp: time,
      type: that.data.washerType,
      userName: userId
    });
    var params = {
      sign: sign,
      userName: userId,
      timestamp: time,
      type: this.data.washerType,
      mac: this.data.mac
    };
    app.req.requestPostApi('/miniprogram/machine/openwater', params, this, function (res) {
      that.setData({
        showWasher: false
      })
    })
  },
  /**
 * 开启洗衣机
 */
  openWasher: function () {
    var that = this;
    let userId = this.data.userId;
    var time = new Date().getTime();
    var sign = app.common.createSign({
      mac: that.data.mac,
      timestamp: time,
      type: that.data.washerType,
      userName: userId
    });
    var params = {
      sign: sign,
      userName: userId,
      timestamp: time,
      type: this.data.washerType,
      mac: this.data.mac
    };
    app.req.requestPostApi('/miniprogram/machine/openwater', params, this, function (res) {
      that.setData({
        showMode: false
      })
      my.showToast({
        title: '机器开启成功',
      })
    })
  },
  /**
   * 开启吹风机
   */
  openBlower: function () {
    var that = this;
    let userId = this.data.userId;
    var time = new Date().getTime();
    var sign = app.common.createSign({
      mac: that.data.mac,
      timestamp: time,
      number: that.data.blowerType,
      userName: userId
    });
    var params = {
      sign: sign,
      userName: userId,
      timestamp: time,
      mac: this.data.mac,
      number: that.data.blowerType,
    };
    app.req.requestPostApi('/miniprogram/openblow', params, this, function (res) {
      console.log('成功开启吹风机')
      that.setData({
        showMode: false
      })
      my.showToast({
        title: '机器开启成功',
      })
    })
  },
  /**
   * 开启烘干机
   */
  openDryer: function () {
    var that = this;
    let userId = this.data.userId;
    var time = new Date().getTime();
    var sign = app.common.createSign({
      mac: that.data.mac,
      timestamp: time,
      userName: userId
    });
    var params = {
      sign: sign,
      userName: userId,
      timestamp: time,
      mac: this.data.mac,
    };
    app.req.requestPostApi('/miniprogram/opendryer ', params, this, function (res) {
      console.log('成功开启烘干机')
      that.setData({
        showMode: false
      })
      my.showToast({
        title: '机器开启成功',
      })
    })
  },
  /**
 * 绘制图形
 */
  draw: function (s, e) {
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
  /**
   * 获取设备信息
   */
  getInfo: function () {
    var that = this;
    my.getSystemInfo({
      success: function (res) {
        that.setData({
          screenHeight: res.screenHeight,
          screenWidth: res.windowWidth,
          pixelRatio: res.windowWidth / 750
        })
      },
    })
  },
  /**
   * 获取广告位信息
   */
  getAdInfo: function () {
    var that = this;
    let userId = this.data.userId;
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
    app.req.requestPostApi('/miniprogram/ad/adList', params, this, function (res) {
      that.setData({
        info: res.res
      })
    })
  },
  jumpTo(e) {
    switch (e.currentTarget.dataset.info) {
      case 0:
        break;
      case 1:
        my.navigateTo({
          url: '/page/webview/webview?url=' + e.currentTarget.dataset.url + '&id=' + e.currentTarget.dataset.id,
        })
        break;
      case 2:
        break;
    }
  },
  /**
   * 二维码绘制
   */
  drawQRCode: function () {
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
    app.req.requestPostApi('/miniprogram/stu/qrcode', params, this, function (res) {
      var size = that.setCanvasSize();
      var initUrl = res.message;
      that.createQrCode(initUrl, "qrcode", size.w, size.h);
    })
  },
  //适配不同屏幕大小的canvas
  setCanvasSize: function () {
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
  //调用插件中的draw方法，绘制二维码图片
  createQrCode: function (url, canvasId, cavW, cavH) {
    QR.qrApi.draw(url, canvasId, cavW, cavH);
  },
});
