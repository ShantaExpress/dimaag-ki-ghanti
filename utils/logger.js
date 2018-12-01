const log4js = require('log4js');
let logger;

function getTimeStamp(){
  var date = new Date();
  var op = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;//_${date.getHours()}.${date.getMinutes()}`;
  return op;
}

function iterate(){
  log4js.configure({
    appenders: { log: { type: 'file', filename: 'logs/'+getTimeStamp()+'_application.log' } },
    categories: { default: { appenders: ['log'], level: 'info' } }
  });
  return log4js;
}

setInterval(function(){  
  logger = iterate().getLogger('log');
},1000*60*60);

logger = iterate().getLogger('log');

function logMessage(message, type){
  switch(type){
    case 'info':
      logger.info(message);
      break;
    case 'warn':
      logger.warn(message);
      break;
    case 'error':
      logger.error(message);
      break;
    case 'fatal':
      logger.fatal(message);
      break;
  }
}

module.exports.info = function(message){
  console.log('in info : ', message);
  logMessage(message, 'info');
}
module.exports.warn = function(message){
  logMessage(message, 'warn');
}
module.exports.error = function(message){
  logMessage(message, 'error');
}
module.exports.fatal = function(message){
  logMessage(message, 'fatal');
}