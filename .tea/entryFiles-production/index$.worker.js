
require('./config$');
require('./importScripts$');
function success() {
require('../..//app');
require('../../node_modules/mini-antui/es/list/index');
require('../../node_modules/mini-antui/es/list/list-item/index');
require('../../node_modules/mini-antui/es/popup/index');
require('../../page/index/index');
require('../../page/helpCenter/helpCenter');
require('../../page/swingCard/swingCard');
require('../../page/recharge/recharge');
require('../../page/wallet/wallet');
require('../../page/bindNum/bindNum');
require('../../page/mine/mine');
require('../../page/about/about');
require('../../page/person/person');
require('../../page/comment_list/comment_list');
require('../../page/comment/comment');
require('../../page/cardReader/cardReader');
require('../../page/groundRecharge/groundRecharge');
require('../../page/refund/refund');
require('../../page/school/school');
require('../../page/schoolNew/schoolNew');
require('../../page/operation/operation');
require('../../page/waterThat/waterThat');
require('../../page/cardThat/cardThat');
require('../../page/webview/webview');
require('../../page/machineModel/machineModel');
require('../../page/redEnvelope/redEnvelope');
require('../../page/payAgrement/payAgrement');
require('../../page/agreement/agreement');
require('../../page/recordRecharge/recordRecharge');
require('../../page/recordSpend/recordSpend');
}
self.bootstrapApp ? self.bootstrapApp({ success }) : success();
