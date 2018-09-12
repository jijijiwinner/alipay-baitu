var app = getApp();
Page({

  data: {
    schoolList: [],      //  学校列表
    inputVal: '',        //  获取输入框的值
    schoolName: '',      //  学校名称
    schoolId: '',        //  学校标识
    mapping: '',         //  扫码返回的映射码
    userId: '',          //  用户标识
    actoken: '',         //  令牌
    pop: false           //   显示模态框
  },
  // 生命周期 获取学校
  onLoad() {
    var that = this;
    var params = null;
    var url = '/miniprogram/getAllSchools';
    app.req.requestPostApi(url, params, this, res => {
      that.setData({
        schoolList: res.res
      })
    })
    this.scanSchool();
  },
  // 扫设备码或地推码获取学校
  scanSchool() {
    let promoters = my.getStorageSync({ key: 'promoters' }).data;
    let mapping = my.getStorageSync({ key: 'mac' }).data
    let actoken = my.getStorageSync({ key: 'actoken' }).data;
    let userId = my.getStorageSync({ key: 'userId' }).data;
    this.setData({ actoken: actoken, userId: userId, mapping: mapping });
    let url = '/miniprogram/get_school_by_qrcode';
    let params = {
      ground_promotion_no: promoters,
      mapping: mapping,
    }
    if (promoters !== null || mapping !== null) {
      app.req.requestPostApi(url, params, this, res => {
        let schoolName = res.res.schoolName;
        let schoolId = res.res.schoolId;
        this.setData({ schoolName: schoolName, schoolId: schoolId })
        this.setData({ pop: true })
      })
    } else {
      return false;
    }
  },
  // 模态框选择学校
  selectSchool(e) {
    this.setData({
      pop: true,
      schoolName: e.currentTarget.dataset.text,
      schoolId: e.currentTarget.id
    })
  },
  // 模态框重新选择
  selectOther() {
    this.setData({ pop: false });
  },
  // 模态框确定
  confirm() {
    this.setData({ pop: false });
    this.register();
  },
  // 注册
  register() {
    let url = '/alipay/miniprogram/register'
    let params = { schoolId: this.data.schoolId, account: this.data.userId, accessToken: this.data.actoken }
    app.req.requestPostApi(url, params, this, res => {
      my.reLaunch({
        url: '/page/index/index',
      });
    })
  },
  // 输入事件
  onInput(e) {
    let that = this;
    that.setData({
      onInput: true,
      inputVal: e.detail.value // 获取输入框的值s
    })
  },
  // 输入完成以后
  onConfirm(e) {
    this.searchSchool();
  },
  // 搜索学校
  searchSchool(e) {
    var that = this;
    var inputVal = that.data.inputVal;   // 输入值传递给后台获取搜索结果
    var url = "/miniprogram/getAllSchools";
    var params = {
      schoolName: inputVal,
    }
    // 调用网络接口
    app.req.requestGetApi(url, params, this, res => {
      that.setData({
        onInput: false,
        schoolList: res.res,
      })
    })
  },
})