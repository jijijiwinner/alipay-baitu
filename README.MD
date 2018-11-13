## 佰途（支付宝版）

- 支付宝小程序

## 技术栈

- 原生js
- ES6写法


## 注意事项

- Tips:需要安装七牛云sdk
- 扫码功能，需要硬件设备配合才有效果
- 查看项目完整效果，在小程序内搜索
- clone代码,出现看不了的情况,缺少appId和权限(请按照上句话操作)

## 项目结构

<pre>
├── assets                      // 静态资源
├── image                       // 图片文件
├── service                     // 公共封装js
├── uitls                       // 基础封装JS
├── app.js                      // 全局配置
├── app.json                    // 全局路径配置
├── app.acss                    // 全局样式配置
├── page                        // 生产目录
│   ├── about                   // 关于我们
│   ├── activity                // 活动详情
│   ├── agmentRecharge          // 充值协议
│   ├── agmentUser              // 用户协议
│   ├── bindNum                 // 绑定手机号
│   ├── comment                 // 发起反馈
│   ├── comment_list            // 反馈列表
│   ├── draw                    // 设备动画功能
│   ├── groundRecharge          // 充值送活动
│   ├── helpCenter              // 帮助中心
│   ├── index                   // 主页
│   ├── machineModel            // 设备模式
│   ├── mine                    // 用户中心
│   ├── person                  // 用户信息
│   ├── recharge                // 充值
│   ├── recordRecharge          // 充值记录
│   ├── recordSpend             // 消费记录
│   ├── redEnvelope             // 领取红包
│   ├── refund                  // 退款
│   ├── school                  // 选择学校
│   ├── schoolNew               // 修改学校
│   ├── swingCard               // 绑定实体卡
│   ├── wallet                  // 用户钱包
│   ├── webview                 // 广告位监听停留时间
└──
</pre>