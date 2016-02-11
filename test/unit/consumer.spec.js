import { Consumer } from '../../lib/consumer';
import { processHandler } from '../../lib/consumer';
import { initConsumer } from '../../lib/consumer';

describe('Consumer', () => {

  var processConsumer;
  var requestConsumptionStub;
  var consumeExpressionSpy;
  var processSendStub;
  var haltConsumptionStub;

  // mock child_process function
  process.send = function (message) {
    return message;
  };

  beforeEach(() => {
    processConsumer = new Consumer();
    initConsumer(processConsumer);
    requestConsumptionStub = sinon.spy(processConsumer, 'requestConsumption');
    consumeExpressionSpy = sinon.spy(processConsumer, 'consumeExpression');
    haltConsumptionStub = sinon.spy(processConsumer, 'haltConsumption');
  });

  afterEach(() => {
    requestConsumptionStub.reset();
    consumeExpressionSpy.reset();
  });

  describe('beginConsumption()', () => {
    it('should call the requestConsumption() function', function () {
      processConsumer.beginConsumption();
      expect(requestConsumptionStub).to.have.been.called;
    });
  });

  describe('requestConsumption()', () => {
    it('should bind the current async iterator to the instance', function () {
      processConsumer.beginConsumption();
      expect(processConsumer.currentIteration).to.be.defined;
    });
  });

  describe('sendExpression()', function () {
    it('should make a call to consumeExpression() and call the currentIteration', function () {
      var message = {
        notification: 'expression',
        expression: {
          operand1: 2,
          operand2: 3,
          operator: 'add'
        }
      };
      processConsumer.currentIteration = () => {
        return;
      };
      processConsumer.sendExpression(message);
      expect(consumeExpressionSpy).to.be.calledWith(message.expression);
    });
  });

  describe('consumeExpression()', () => {
    it('should complete the expression and return it to the manager', function () {
      var message = {
        notification: 'expression',
        expression: {
          operand1: 2,
          operand2: 3,
          operator: 'add'
        }
      };
      var result = processConsumer.consumeExpression(message.expression);
      expect(result.result).to.equal(5);
      expect(result.completed).to.be.defined;
    });
  });

  describe('wait()', function () {
    it('should call the currentIteration with an error to haltConsumption', function () {
      processConsumer.beginConsumption();
      processConsumer.wait();
      expect(haltConsumptionStub).to.be.called;
    });
  });

  describe('haltConsumption()', function () {
    it('it should log that the async loop is ending and return the error', function () {
      processConsumer.haltConsumption('no expressions');
      expect(haltConsumptionStub).to.have.returned('no expressions');
    });
  });

  describe('processHandler()', () => {
    var beginConsumptionStub;
    var sendExpressionStub;
    var waitStub;

    beforeEach(() => {
      beginConsumptionStub = sinon.stub(processConsumer, 'beginConsumption', () => {
        return;
      });
      sendExpressionStub = sinon.stub(processConsumer, 'sendExpression', () => {
        return;
      });
      waitStub = sinon.stub(processConsumer, 'wait', () => {
        return;
      });
    });

    afterEach(() => {
      beginConsumptionStub.restore();
      sendExpressionStub.restore();
      waitStub.restore();
    });

    it('should call beginConsumption() on the "start" event', () => {
      processHandler({ notification: 'start' });
      expect(beginConsumptionStub).to.be.called;
    });

    it('should call sendExpression() on the "expression" event', () => {
      processHandler({ notification: 'expression' });
      expect(sendExpressionStub).to.be.called;
    });

    it('should call wait() on the "wait" event', () => {
      processHandler({ notification: 'wait' });
      expect(waitStub).to.be.called;
    });
  });
});
