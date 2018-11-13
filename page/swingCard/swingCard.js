const app = getApp();
Page({
  data: {
    userId: '',
    mac: '',
    cardNo: '',
    task_uuid: '',
    scanBox: false,  // 弹出扫码弹框
    readCard: false, // 倒计时读卡弹框
    countDown: '30',  // 倒计时
    state: 0,    // 默认绑卡状态为0
  },
  onShow() {
    let that = this;
    my.getStorage({
      key: 'userId', // 缓存数据的key
      success: (res) => {
        that.setData({
          userId: res.data
        })
      },
    });
    my.getStorage({
      key: 'cardNo', // 缓存数据的key
      success: (res) => {
        that.setData({
          cardNo: res.data
        })
      },
    });
  },

  // 绑卡 - 显示弹窗
  bind() {
    let card = my.getStorageSync({
      key: 'cardNo', // 缓存数据的key
    }).data;
    if (!card) {
      this.setData({
        scanBox: true
      })
    } else {
      my.showToast({
        content: '已绑卡',
        type: 'fail',
        duration: 1000,
      });
    }
  },
  // 点击开始扫码
  startScan() {
    let that = this;
    let cardNo = that.data.cardNo;
    let mac = that.data.mac;
    let userId = that.data.userId;
    my.scan({
      success: (res) => {
        mac = res.code;
        that.setData({ mac: mac, })
        let url = '/miniprogram/sign/bind';
        let time = new Date().getTime();
        let sign = app.common.createSign({
          mac: mac,
          userName: userId,
          timestamp: time,
        });
        let params = {
          mac: mac,
          sign: sign,
          userName: userId,
          timestamp: time,
        }
        let task_uuid = that.data.task_uuid;
        this.setData({ scanBox: false, })
        app.req.requestPostApi(url, params, this, res => {
          let task_uuid = res.message;
          this.setData({ task_uuid: task_uuid, state: 0, readCard: true })
          this.cardRead();
        })
      }
    });
  },
  // 读卡操作
  cardRead() {
    let userId = this.data.userId;
    let task_uuid = this.data.task_uuid;
    let timestamp = new Date().getTime();
    let url = '/miniprogram/sign/checkBind';
    let sign = app.common.createSign({
      userName: userId,
      timestamp: timestamp,
      task_uuid: task_uuid,
    })
    let params = {
      sign: sign,
      userName: userId,
      timestamp: timestamp,
      task_uuid: task_uuid,
    }

    let _this = this;
    let countDown = 29;
    let timer = setInterval(() => {
      _this.setData({
        countDown: countDown
      })
      countDown--;
      app.req.requestPostApi(url, params, this, res => {
        if (res.return && res.res.sa_card_no) {
          clearInterval(timer);
          my.setStorageSync({
            key: 'cardNo',
            data: res.res.sa_card_no,
          });
          _this.setData({
            state: 1,
            countDown: 30,
            cardNo: res.res.sa_card_no
          });
          let polling = setTimeout(() => {
            _this.setData({
              readCard: false,
            })
            clearTimeout(polling);
          }, 1000)
        }
      })
      //倒计时结束未进行绑卡操作
      if (countDown < 0) {
        clearInterval(timer);
        _this.setData({
          countDown: 30,
          readCard: false,
        });
      }
    }, 1000)
  },
  // 解绑
  remove() {
    let that = this;
    let userId = that.data.userId;
    let cardNo = that.data.cardNo;
    let time = new Date().getTime();
    let url = '/miniprogram/sign/unlock';
    let sign = app.common.createSign({
      userName: userId,
      timestamp: time,
    });
    let params = {
      sign: sign,
      timestamp: time,
      userName: userId,
    }
    if (cardNo !== null && cardNo !== '' && cardNo !== "") {
      my.confirm({
        title: '提示',
        content: '确认解绑吗',
        confirmButtonText: '确定',
        success: res => {
          if (res.confirm) {
            my.showToast({
              content: '解绑成功',
              type: 'success',
              duration: 1000,
              success: (res) => {
                app.req.requestPostApi(url, params, this, res => {
                  my.removeStorage({
                    key: 'cardNo',
                  });
                  that.setData({ cardNo: '' })
                })
              },
            });
          } else {
            my.showToast({
              content: '已取消',
              type: 'fail',
              duration: 1000,
              success: (res) => {
                return false;
              },
            });
          }
        }
      })
    } else {
      my.showToast({
        content: '未绑卡',
        type: 'fail',
        duration: 1000,
        success: res => {
          return false;
        }
      })
    }
  }
});
