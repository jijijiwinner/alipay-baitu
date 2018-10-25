const app = getApp();
const WxNotificationCenter = require('../../utils/WxNotificationCenter.js')

Page({
  data: {
    payMethod: '',  //支付文字
    userId: '', // 用户名
    mac: "",  // mac地址
    modelId: '',   // 模式的ID
    modeList: [], // 模式的数组
    modeName: '',  // 选择模式的文字
    modeType: '',  // 模式的类型
    payModel: '',  // 支付的ID
    money: '', // 显示余额
    signing: '',// 判断是否签约
    accMoney: false, // 字段判断
    selected: '',  // 是否选中
    is_baitu_work: false, // 判断是否是内部员工
    showBottom: false, //popup false 隐藏 true 显示
  },
  onShow() {
    let payMethod = my.getStorageSync({
      key: 'payMethod', // 缓存数据的key
    }).data;
    this.setData({ payMethod: payMethod, selected: 'normal' })
    this.getType();
    this.getMoney();
  },
  // 获取模式
  getType() {
    let userId = my.getStorageSync({
      key: 'userId', // 缓存数据的key
    }).data;
    this.setData({ userId: userId })
    let mac = my.getStorageSync({
      key: 'mac', // 缓存数据的key
    }).data;
    let payMethod = my.getStorageSync({
      key: 'payMethod', // 缓存数据的key
    }).data;
    let payModel = my.getStorageSync({
      key: 'payModel', // 缓存数据的key
    }).data;
    var that = this;
    var time = new Date().getTime();
    this.setData({ payMethod: payMethod, payModel: payModel, mac: mac, userId: userId })
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
    app.req.requestPostApi('/miniprogram/machine/scan', params, this, function(res) {
      that.setData({
        modeType: res.res.type,
        modeName: res.res.name,
        hotMode: res.res.modeList,
        mac: res.res.mapping,
        payList: res.res.pay_type_list,
        signing: res.res.is_alipay_withhold_sign
      })
    })
  },
  // 金额不足引导
  getMoney() {
    let that = this;
    let userId = my.getStorageSync({
      key: 'userId', // 缓存数据的key
    }).data;
    let params = {
      userName: userId,
    };
    app.req.requestPostApi('/miniprogram/stu/money', params, this, res => {
      this.setData({ money: res.message })
      if (res.message < 0.2) {
        this.setData({
          accMoney: true,
        })
      }
    })
  },
  // 获取点击的元素id 
  getModeType(e) {
    let modelId = e.target.id;
    this.setData({
      selected: e.currentTarget.dataset.index,
      modelId: modelId
    })
  },
  // 选择支付方式
  selectPay(e) {
    let userId = this.data.userId;
    let payModel = e.target.id;
    let payMethod = e.currentTarget.dataset.text;
    let signing = this.data.signing;
    this.setData({
      payMethod: payMethod,
      payModel: payModel,
      showBottom: false,
    })
    my.setStorageSync({
      key: 'payMethod', // 缓存数据的key
      data: payMethod, // 要缓存的数据
    });
    my.setStorageSync({
      key: 'payModel', // 缓存数据的key
      data: payModel, // 要缓存的数据
    });
    console.log(payModel)
    if (payModel == 3 && signing) {
      console.log('已选择免密支付且已签约')
    } else if (!signing && payModel == 3) {
      let url = '/alipay/miniprogram/get_withhold_sign_str';
      let params = {
        userName: userId
      }
      app.req.requestPostApi(url, params, this, res => {
        let signStr = res.res;
        // 获取签约字符串 返回结果
        my.paySignCenter({
          signStr: signStr,
          success: res => {
            console.log(JSON.stringify(res));
          }
        })
      })
    }
  },
  // 开关popUp
  openPay() {
    this.setData({
      showBottom: true
    })
  },
  onPopupClose() {
    this.setData({
      showBottom: false,
    })
  },
  // 跳转到红包页面
  goRedEnv() {
    my.navigateTo({
      url: '/page/redEnvelope/redEnvelope'
    });
  },
  // 开启设备
  openMachine() {
    let payModel = this.data.payModel;
    let modelId = this.data.modelId;
    if (payModel != null && modelId != '') {
      var obj = {
        modelId: this.data.modelId,
        modeType: this.data.modeType,
        payModel: this.data.payModel,
      }
      WxNotificationCenter.postNotificationName('NotificationName', obj);
      my.navigateBack({});
    } else if (modelId == '') {
      my.alert({
        title: '提示',
        content: '请选择机器模式'
      });
    } else if (payModel == null) {
      my.alert({
        title: '提示',
        content: '请选择支付方式'
      });
    }
  },
});
