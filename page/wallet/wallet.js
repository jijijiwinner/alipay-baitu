const app = getApp();
Page({
  data: {
    money: '',
    userId: '',
    showRefund: false,
    showPay: false,
  },
  onLoad() {
    let that = this;
    let userId = my.getStorageSync({
      key: 'userId', // 缓存数据的key
    }).data;
    that.setData({ userId: userId })
    that.getRefund();
    that.getMoney();
  },
  // 获取金额
  getMoney() {
    let that = this;
    let userId = that.data.userId;
    let time = new Date().getTime();
    let url = '/miniprogram/stu/money';
    let sign = app.common.createSign({
      userName: userId,
      timestamp: time
    })
    let params = {
      userName: userId,
      timestamp: time,
      sign: sign
    }
    app.req.requestPostApi(url, params, this, (res) => {
      that.setData({
        money: res.message
      })
    });
  },
  // 获取退款权限
  getRefund() {
    let that = this;
    let userId = that.data.userId;
    let time = new Date().getTime();
    let sign = app.common.createSign({
      userName: userId,
      timestamp: time,
    })
    let params = {
      userName: userId,
      timestamp: time,
      sign: sign
    };
    app.req.requestPostApi('/miniprogram/app/initAfterLogin', params, this, function(res) {
      if (res.res.isRefund) {
        that.setData({
          showRefund: true
        })
      }
      if (res.res.isRecharge) {
        that.setData({ showPay: true })
      } else {
        that.setData({ showPay: true })
      }
    })
  },
  // 充值
  goRecharge() {
    my.navigateTo({
      url: '../recharge/recharge'
    })
  },
  // 退款
  goRefund() {
    my.navigateTo({
      url: '../refund/refund',
    })
  },
  // 充值记录
  goTopup() {
    my.navigateTo({ url: '/page/recordRecharge/recordRecharge' });
  },
  // 消费记录
  goSpend() {
    my.navigateTo({ url: '/page/recordSpend/recordSpend' });
  },
});
