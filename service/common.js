var md5 = require('./md5.js');
var macro = require('./macro.js');
var obj = {};

function createSign(obj){
  this.obj = obj;
  var signArray  = [];

  for(var key in this.obj){
    signArray.push(key + '=' + this.obj[key])  ;
  }

  var sign = signArray.sort().join('&') + '&key=' + macro.key;
  var new_sign = md5.hexMD5(sign).toUpperCase();
  return new_sign;
}

function actSign(objs) {
  this.objs = objs;
  var actArray = [];

  for (var key in this.objs) {
    actArray.push(key + '=' + this.objs[key]);
  }
  var actSign = actArray.sort().join('&') + '&key=' + '2sa0ou1eikdjaldnm8';
  var new_actSign = md5.hexMD5(actSign).toUpperCase();
  return new_actSign
}


module.exports = {
  createSign,
  actSign
}
