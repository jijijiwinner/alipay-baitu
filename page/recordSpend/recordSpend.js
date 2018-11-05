const app = getApp();
Page({
  data: {
    userId: '',    // 用户标识
    co_array: [], // 消费记录
    co_page: 1,   // 消费记录页数
    pageNum: 15,   // 消费记录显示多少条
  },
  onLoad() {
    let userId = my.getStorageSync({
      key: 'userId', // 缓存数据的key
    }).data;
    this.setData({ userId: userId })
    this.getConsumption(1)
  },
  // 下拉刷新
  onPullDownRefresh() {
    var page = this.data.co_page + 1;
    this.getConsumption(page);
  },
  // 获取消费记录
  getConsumption(page) {
    let url = '/miniprogram/stu/useorders';
    let time = new Date().getTime();
    let sign = app.common.createSign({
      timestamp: time,
      userName: this.data.userId,
      pn: page,
      ps: this.data.pageNum
    });
    let params = {
      userName: this.data.userId,
      timestamp: time,
      pn: page,
      ps: this.data.pageNum,
      sign: sign
    }
    app.req.requestPostApi(url, params, this, (res) => {
      my.stopPullDownRefresh();      
      if (res.res.length == 0) {
        return;
      }
      let array = this.data.co_array;
      if (page == 1) {
        array = [];
      }
      for (let i = 0; i < res.res.length; i++) {
        array.push(res.res[i]);
      }
      this.setData({
        co_array: array,
        co_page: page
      })
    })
  },
});
