const app = getApp();
Page({
  data: {
    money: '',
    userId: '',
    schoolName: '',
    telephone: '',
    id: '',
  },
  onShow() {
    let that = this;
    let userId = my.getStorageSync({
      key: 'userId', // 缓存数据的key
    }).data;
    that.setData({ userId: userId })
    that.getMoney();
    that.getInfo();
  },
  // 获取用户信息
  getInfo() {
    let that = this;
    let url = '/miniprogram/user_info';
    let time = new Date().getTime();
    let sign = app.common.createSign({
      timestamp: time,
      userName: that.data.userId
    })
    let params = {
      timestamp: time,
      userName: that.data.userId,
      sign: sign
    }
    // 网络请求
    app.req.requestPostApi(url, params, this, res => {
      that.setData({
        schoolName: res.res.schoolName,
        telephone: res.res.phone,
        id: res.res.id
      })
    })
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
  // 个人信息
  goPerson() {
    my.navigateTo({ url: '/page/person/person' });
  },
  // 钱包
  goWallet() {
    my.navigateTo({ url: '/page/wallet/wallet' });
  },
  // 绑卡
  goBindCard() {
    my.navigateTo({ url: '/page/swingCard/swingCard' });
  },
  // 帮助中心
  goHelpCenter() {
    my.navigateTo({ url: '/page/helpCenter/helpCenter' });
  },
  // 舆情反馈
  goFeedBack() {
    my.navigateTo({ url: '/page/comment_list/comment_list' });
  },
  // 关于我们
  goAbout() {
    my.navigateTo({ url: '/page/about/about' });
  },
});
