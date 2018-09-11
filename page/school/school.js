var app = getApp();
Page({

  data: {
    schoolList: [],      //  学校列表
    inputVal: '',        //  获取输入框的值
    schoolName: '',      //  学校名称
    scName: '',           //  扫码学校
    scId: '',             //  学校标识
    userId: '',          //  用户标识
    actoken: '',         //  令牌
    text: '',            //  点击选中的学校名称
    clicked: 0,          //  选中状态
    pop: false           //   显示模态框
  },
  // load函数
  onLoad() {
    this.getAllSchools();
    let promoters = my.getStorageSync({ key: 'promoters' }).data;
    let actoken = my.getStorageSync({ key: 'actoken' }).data;
    let userId = my.getStorageSync({ key: 'userId' }).data;
    this.setData({ actoken: actoken, userId: userId });
    let url = '/miniprogram/get_school_by_qrcode';
    let params = {
      ground_promotion_no: promoters
    }
    if (promoters !== null) {
      app.req.requestPostApi(url, params, this, res => {
        let scName = res.res.schoolName;
        let scId = res.res.schoolId;
        this.setData({ scName: scName, scId: scId })
        this.setData({ pop: true })
      })
    } else {
      return false;
    }
  },
  getAllSchools() {
    var that = this;
    var url = '/miniprogram/getAllSchools';
    app.req.requestPostApi(url, {}, this, res => {
      that.setData({
        schoolList: res.res
      })
    })
  },
  // 模态框noSchool选择
  noSchool() {
    this.setData({ pop: false });
    return false;
  },
  // 模态框okSchool选择
  okSchool() {
    this.setData({ pop: false });
    this.getSchool();
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
    this.sub();
  },
  // 表单提交
  sub(e) {
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
  // 获取学校 - 扫码用户选择
  getSchool() {
    let url = '/alipay/miniprogram/register'
    let params = { schoolId: this.data.scId, account: this.data.userId, accessToken: this.data.actoken }
    app.req.requestPostApi(url, params, this, res => {
      my.reLaunch({
        url: '/page/index/index',
      });
    })
  },
  // 获取学校 - 非扫码进入用户选择
  selectSchool(e) {
    let text = e.target.dataset.text;
    let url = '/alipay/miniprogram/register'
    let params = { schoolId: e.target.id, account: this.data.userId, accessToken: this.data.actoken }
    let instructions = '您选中的是' + text + '选错学校设备将无法使用哦'
    this.setData({ clicked: e.target.id })
    // 网络请求'
    my.confirm({
      title: '温馨提示',
      content: instructions,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (res) => {
        if (res.confirm) {
          app.req.requestPostApi(url, params, this, res => {
            my.reLaunch({
              url: '/page/index/index',
            });
          })
        }
      },
    });
  },
})