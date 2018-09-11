const app = getApp();
Page({
  data: {
    userId: 0,
    userName: '',
    money: '',
    show: false,
    czGive: [],
    actId: '',
    give: false,
    technology: '',
    worker: '',
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad() {
    let worker = my.getStorageSync({ key: "worker" }).data
    let promoters = my.getStorageSync({ key: 'promoters' }).data
    let userId = my.getStorageSync({ key: 'userId' }).data
    let url = '/miniprogram/get_gpp_name_by_no';
    this.setData({ userId: userId, worker: worker, promoters: promoters, })
    this.getGive();
    let params = {
      ground_promotion_no: promoters
    }
    app.req.requestPostApi(url, params, this, res => {
      let technology = res.res;
      this.setData({ technology: technology })
    })

  },
  // 跳到活动规则
  rules() {
    my.navigateTo({ url: "/page/activityRule/activityRule" });
  },
  /**
  * 充值送活动
  */
  getGive() {
    let url = '/miniprogram/stu/getact';
    let time = new Date().getTime();
    let sign = app.common.createSign({
      timestamp: time,
      userName: this.data.userId
    })
    let params = {
      userName: this.data.userId,
      timestamp: time,
      sign: sign
    }
    // 请求充值送
    app.req.requestPostApi(url, params, this, res => {
      let array = res.res.detail;
      for (let i = 0; i < array.length; i++) {
        if (i == 0) {
          array[i].getColor = true;
        } else {
          array[i].getColor = false;
        }
      }
      this.setData({
        give: true,
        money: res.res.detail[0].id,
        czGive: array,
        actId: res.res.activity.id
      })
    })
  },
  /**
   * 充值button事件
   */
  recharge() {
    let id = my.getStorageSync({
      key: 'id', // 缓存数据的key
    }).data;
    this.setData({ id: id })
    if (this.data.money == 0) {//充值数目不为空
      my.alert({
        title: '提示',
        content: '请输入或选择充值金额',
      })
      return;
    }
    var promoters = my.getStorageSync({ key: 'promoters' }).data,
      _promoters,
      cacheTime = my.getStorageSync({ key: 'cacheTime' }).data;
    if (promoters && cacheTime > Date.parse(new Date())) {
      _promoters = promoters;
    } else {
      my.removeStorageSync({
        key: 'promoters',
      });
      my.removeStorageSync({
        key: 'cacheTime',
      });
    }
    let url = '/miniprogram/alipay';
    let params = {
      userName: this.data.userId,
      stuId: id,
      money: this.data.money,
      activityId: this.data.actId,
      ground_promotion_no: _promoters,
    }
    // 网络请求
    app.req.requestPostApi(url, params, this, res => {
      let tradeNO = res.res
      my.tradePay({
        tradeNO: tradeNO,
        success: (res) => {
          if (res.resultCode == 9000) {
            my.showToast({
              type: 'success',
              content: '充值成功',
              duration: 1200,
              success: (res) => {
                my.removeStorageSync({
                  key: 'promoters',
                });
                my.removeStorageSync({
                  key: 'cacheTime',
                });
                my.switchTab({
                  url: '/page/index/index',
                });
              },
            });
          } else if (res.resultCode == 4000) {
            my.showToast({
              type: 'fail',
              content: '充值失败',
              duration: 1200,
            });
          } else if (res.resultCode == 6001) {
            my.showToast({
              type: 'fail',
              content: '已取消支付',
              duration: 1200,
            });
          }
        },
      })
    })
  },
});
