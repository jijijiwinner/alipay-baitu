
require('./config$');
require('./importScripts$');
function success() {
require('../..//app');
require('../../node_modules/mini-antui/es/notice/index');
require('../../node_modules/mini-antui/es/list/index');
require('../../node_modules/mini-antui/es/list/list-item/index');
require('../../node_modules/mini-antui/es/popup/index');
require('../../page/index/index');
require('../../page/mine/mine');
require('../../page/draw/draw');
require('../../page/person/person');
require('../../page/bindNum/bindNum');
require('../../page/school/school');
require('../../page/schoolNew/schoolNew');
require('../../page/machineModel/machineModel');
require('../../page/redEnvelope/redEnvelope');
require('../../page/wallet/wallet');
require('../../page/recharge/recharge');
require('../../page/groundRecharge/groundRecharge');
require('../../page/refund/refund');
require('../../page/swingCard/swingCard');
require('../../page/helpCenter/helpCenter');
require('../../page/comment_list/comment_list');
require('../../page/comment/comment');
require('../../page/about/about');
require('../../page/webview/webview');
require('../../page/recordRecharge/recordRecharge');
require('../../page/recordSpend/recordSpend');
require('../../page/agmentRecharge/agmentRecharge');
require('../../page/agmentUser/agmentUser');
require('../../page/activity/activity');
}
self.bootstrapApp ? self.bootstrapApp({ success }) : success();
