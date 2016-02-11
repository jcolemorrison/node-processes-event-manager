import { Producer } from '../../lib/producer';
import { processHandler } from '../../lib/producer';
import { initProducer } from '../../lib/producer';

describe('Producer', () => {

  var processProducer;
  var produceExpressionSpy;
  var sendExpressionStub;

  beforeEach(() => {
    processProducer = new Producer();
    produceExpressionSpy = sinon.spy(processProducer, 'produceExpression');
    sendExpressionStub = sinon.stub(processProducer, 'sendExpression');
    initProducer(processProducer);
  });

  afterEach(() => {
    produceExpressionSpy.reset();
    sendExpressionStub.reset();
  });

  describe('beginProduction()', () => {
    // use function, other wise the lexical this falls through for mocha
    it('should produce and send 1 expression per second', function (done) {
      processProducer.beginProduction();
      setTimeout(() => {
        clearInterval(processProducer.loop);
        expect(produceExpressionSpy).to.be.calledTwice;
        expect(sendExpressionStub).to.be.calledTwice;
        done();
      }, 2100);
    });

    it('should send pending expressions instead of producing new ones if any exist', function (done) {
      processProducer.pendingExpressions = [{
        expression: {
          operand1: 2,
          operand2: 3,
          operator: 'add'
        }
      }];
      processProducer.beginProduction();
      setTimeout(() => {
        clearInterval(processProducer.loop);
        expect(produceExpressionSpy).to.have.returned({
          expression: {
            operand1: 2,
            operand2: 3,
            operator: 'add'
          }
        });
        done();
      }, 1100);
    });

  });

  describe('wait()', () => {
    it('should halt the production loop if it receives the full expression', function (done) {
      processProducer.beginProduction();
      setTimeout(() => {
        processProducer.wait('2+3=');
        expect(processProducer.pendingExpressions.length).to.equal(1);
        expect(produceExpressionSpy.callCount).to.equal(0);
        done();
      }, 100);
    });
  });

  describe('processHandler()', () => {
    var beginProductionStub;
    var sendExpressionStub;
    var waitStub;

    beforeEach(() => {
      beginProductionStub = sinon.stub(processProducer, 'beginProduction', () => {
        return;
      });
      waitStub = sinon.stub(processProducer, 'wait', () => {
        return;
      });
    });

    afterEach(() => {
      beginProductionStub.restore();
      waitStub.restore();
    });

    it('should call beginProduction() on the "start" event', () => {
      processHandler({ notification: 'start' });
      expect(beginProductionStub).to.be.called;
    });

    it('should call wait() on the "wait" event', () => {
      processHandler({ notification: 'wait' });
      expect(waitStub).to.be.called;
    });
  });

});
