global.chai = require('chai');
global.sinon = require('sinon');
global.proxyquire = require('proxyquire');
global.chai.use(require('sinon-chai'));

require('babel-core/register');
require('./cleanup')();
