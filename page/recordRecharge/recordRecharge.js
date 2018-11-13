const app = getApp();
Page({
  data: {
    userId: '',     // 用户标识
    re_array: [],   // 充值记录列表
    re_page: 1,     // 充值记录页数1
    pageNum: 15,    // 页面显示数量
    scrollTop: 0,   // 滚动距离,
    backTop: false, // 回到顶部隐藏
  },
  onLoad() {
    let userId = my.getStorageSync({
      key: 'userId', // 缓存数据的key
    }).data;
    this.setData({ userId: userId })
    this.getRecharge(1);
    this.getHeight();
  },
  // 下拉刷新
  onPullDownRefresh() {
    var page = this.data.re_page + 1;
    this.getRecharge(page);
  },
  // 获取充值记录
  getRecharge(page) {
    let url = '/miniprogram/stu/rechargeorders';
    let time = new Date().getTime();
    let sign = app.common.createSign({
      timestamp: time,
      userName: this.data.userId,
      pn: page,
      ps: this.data.pageNum
    })
    let params = {
      userName: this.data.userId,
      timestamp: time,
      pn: page,
      ps: this.data.pageNum,
      sign: sign
    }

    app.req.requestPostApi(url, params, this, res => {
      my.stopPullDownRefresh()
      let array = this.data.re_array;
      if (res.res.length == 0) {
        return;
      }
      if (page == 1) {
        array = []
      }
      for (let i = 0; i < res.res.length; i++) {
        //后端数据坑，需要自己解时间
        let date = new Date(res.res[i].timestamp);
        let month = date.getMonth() + 1;
        let minute = date.getMinutes();
        if (minute < 10) {
          minute = '0' + minute;
        }
        res.res[i].timestamp = date.getFullYear() + '-' + month + '-' + date.getDate() + ' ' + date.getHours() + ':' + minute;
        array.push(res.res[i]);
      }
      this.setData({
        re_array: array,
        re_page: page
      })
    })
  },
  // 获取高度
  getHeight() {
    my.getSystemInfo({
      success: (res) => {
        this.setData({
          winHeight: res.windowHeight
        })
      },
    });
  },
  // scroll
  scroll(e) {
    if (e.detail.scrollTop > 300) {
      this.setData({
        backTop: true,
        scrollTop: e.detail.scrollTop,
      })
    } else {
      this.setData({
        backTop: false
      })
    }
  },
  // goTop
  goTop() {
    let scrollTop = this.data.scrollTop;
    this.setData({
      scrollTop: 0,
    })
  }
});
