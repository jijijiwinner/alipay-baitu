var app = getApp();
Page({

  data: {
    schoolList: [],      //  学校列表
    inputVal: '',        //  获取输入框的值
    text: '',             //  点击选中的学校名称
  },
  // load函数
  onLoad() {
    var that = this;
    var url = '/miniprogram/getAllSchools';
    var params = null;
    app.req.requestPostApi(url, params, this, res => {
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
      inputVal: e.detail.value // 获取输入框的值
    })
  },
  // 输入完成以后
  onConfirm(e) {
    this.searchSchool();
  },
  // 表单提交
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
  // 获取学校
  selectSchool(e) {
    let text = e.target.dataset.text;
    let id = e.target.id
    let instructions = '您选中的是' + text + '选错学校将无法使用设备'
    my.confirm({
      title: '温馨提示',
      content: instructions,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (res) => {
        if (res.confirm) {
          let url = '/miniprogram/edit_school';
          let userId = my.getStorageSync({
            key: 'userId',
          }).data;
          let time = new Date().getTime()
          let sign = app.common.createSign({
            userName: userId,
            timestamp: time,
            new_school_id: id,
          })
          let params = {
            userName: userId,
            timestamp: time,
            new_school_id: id,
            sign: sign
          }

          app.req.requestPostApi(url, params, this, res => {
            my.confirm({
              title: '温馨提示',
              content: res.message,
              confirmButtonText: "确定",
              success: res => {
                my.navigateBack({});
              }
            })
          })
        }
      },
    });
  },
})