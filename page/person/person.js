const app = getApp();
Page({
  data: {
    id: '',           // 用户ID
    schoolName: '',   // 学校
    phone: '',         // 用户手机号
  },
  onShow() {
    let that = this;
    let url = '/miniprogram/user_info';
    let time = new Date().getTime();
    let userId = my.getStorageSync({
      key: 'userId', // 缓存数据的key
    }).data;
    let sign = app.common.createSign({
      timestamp: time,
      userName: userId
    })
    let params = {
      timestamp: time,
      userName: userId,
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
  // 跳转到绑定号码页面
  bindTel() {
    my.navigateTo({
      url: '/page/bindNum/bindNum'
    });
  },
  // 跳转到改学校页面
  changeSchool() {
    my.navigateTo({
      url: '/page/schoolNew/schoolNew'
    });
  }
});
