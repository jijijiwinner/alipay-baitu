const app = getApp();
const WxNotificationCenter = require('../../utils/WxNotificationCenter.js')

Page({
  data: {
    payMethod: '',  //支付文字
    userId: '', // 用户名
    mac: "",  // mac地址
    modeId: '',   // 模式的ID
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
    tips: [
      { image: '../../image/tag_water.png', text: '将装水容器置于开水器上，点击开始打水,请勿手持容器，以免烫伤' },
      { image: '../../image/tag_washer.png', text: '将衣物放入洗衣机内，盖好盖板，选择洗衣模式开始洗衣' }
    ]
  },
  onLoad(options) {
    this.setData({
      mac: options.mac,
    })
    this.getType();
    this.getMoney();
  },
  onShow() {
    app.globalData.devicePage = 'machineMode';
    if (app.globalData.deviceState !== 0) { 
      my.navigateBack({});
    }
  },
  // 获取模式
  getType() {
    let userId = my.getStorageSync({
      key: 'userId', // 缓存数据的key
    }).data;
    let payMethod = my.getStorageSync({
      key: 'payMethod', // 缓存数据的key
    }).data;
    let payModel = my.getStorageSync({
      key: 'payModel', // 缓存数据的key
    }).data;
    let that = this;
    let time = new Date().getTime();
    let mac = that.data.mac;
    that.setData({ payMethod: payMethod, payModel: payModel, mac: mac, userId: userId })
    let sign = app.common.createSign({
      mac: that.data.mac,
      timestamp: time,
      userName: userId
    });
    let params = {
      mac: that.data.mac,
      timestamp: time,
      userName: userId,
      sign: sign
    }
    app.req.requestPostApi('/miniprogram/machine/scan', params, this, res => {
      that.setData({
        modeType: res.res.type,
        modeName: res.res.name,
        mac: res.res.mapping,
        payList: res.res.pay_type_list,
        signing: res.res.is_alipay_withhold_sign
      })
      let modeList = res.res.modeList;
      modeList.forEach(el => {
        el.selected = false;
      });
      modeList[0].selected = true;
      that.setData({
        modeList: modeList,
        modeId: modeList[0].modeId
      });
    })
  },
  // 获取点击的元素id 
  getModeType(e) {
    let modeList = this.data.modeList;
    modeList.forEach(el => {
      el.selected = false;
      if (el.modeId == e.target.id) {
        el.selected = true;
      }
    })
    this.setData({
      modeList: modeList,
      modeId: e.target.id
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
  // 开启设备
  openMachine() {
    let userId = this.data.userId;
    let payModel = this.data.payModel;
    let mapping = this.data.mac;
    let modeId = this.data.modeId;
    let modeType = this.data.modeType;
    let url = '/alipay/miniprogram/facepay';
    let params = {
      alipayPid: userId, mapping: mapping, modeId: modeId, pay_type: payModel
    };
    app.req.requestPostApi(url, params, this, res => {
      let tradeNO = res.res.tradeNo;
      my.navigateTo({
        url: '/page/draw/draw?payModel=' + payModel + '&mapping=' + mapping + '&modeId=' + modeId + '&userId=' + userId + '&tradeNO=' + tradeNO + '&modeType=' + modeType
      });
    })
  },
  // 金额
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
});