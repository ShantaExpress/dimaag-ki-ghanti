let logger = require('./logger');
logger.log('test', 'info');


function logExamples(){
    logger.log('Logging Info from logTest', 'info');
    logger.log('Logging Warn from logTest', 'warn');
    logger.log('Logging Error from logTest', 'error');
    logger.log('Logging Fatal from logTest', 'fatal');
}

  
setInterval(function(){
    logExamples();
},1000*5);