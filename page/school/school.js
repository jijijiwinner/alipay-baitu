var app = getApp();
Page({

  data: {
    schoolList: [],      //  学校列表
    inputVal: '',        //  获取输入框的值
    account: '',         //  userID
    schoolName: '',      //  学校名称
    cardNo: '',          //  虚拟卡号
    actoken: '',         //  令牌
    text: '',            //  点击选中的学校名称
    clicked: 0,
    userId:''
  },
  // load函数
  onLoad(options) {
    my.getStorage({
      key: 'actoken', // 缓存数据的key
      success: (res) => {
        this.setData({
          actoken: res.data
        })
      },
    });
    my.getStorage({
      key:'userId',
      success: (res) => {
        this.setData({
          userId: res.data
        })
      }
    })
    this.getAllSchools();
  },
  getAllSchools:function(){
    var that = this;
    var url = '/miniprogram/getAllSchools';
    app.req.requestPostApi(url, {}, this, function(res) {
      that.setData({
        schoolList: res.res
      })
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
  // 表单提交
  sub: function(e) {
    var that = this;
    var inputVal = e.detail.value.schoolInput;   // 输入值传递给后台获取搜索结果
    var url = "/miniprogram/getAllSchools";
    var params = {
      schoolName: inputVal,
    }
    // 调用网络接口
    app.req.requestGetApi(url, params, this, function(res) {
      that.setData({
        onInput: false,
        schoolList: res.res,
      })
    })
  },
  // 获取学校
  selectSchool(e) {
    let text = e.target.dataset.text;
    let url = '/alipay/miniprogram/register'
    let params = { schoolId:  e.target.id, account: this.data.userId, accessToken: this.data.actoken }
    let instructions = '您选中的是' + text + '选错学校设备将无法使用哦'
    this.setData({ clicked: e.target.id })    
    // 网络请求'
    let that = this;
    my.confirm({
      title: '温馨提示',
      content: instructions,
      confirmButtonText: '确定选择',
      cancelButtonText: '取消选择',
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