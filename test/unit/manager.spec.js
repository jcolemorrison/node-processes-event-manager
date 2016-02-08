import { EventEmitter } from 'events';
import Manager from '../../lib/manager';

// Note: Because we're using child processes, we'll have
// the same class act as the send and receiver since all we're
// trying to test is the callbacks, not the IPC or EventEmitter class
class TestChildProcess extends EventEmitter {
  constructor() {
    super();
  }
  send(message) {
    super.emit('message', message);
  }
}

describe('manager', () => {
  var manager;

  describe('Startup', () => {

    before(() => {
      console.log(Manager);
      manager = new Manager(10);
    });

    after(() => {
      manager = undefined;
    });

    it('should create a boundedBuffer and a max lenght property', () => {
      expect(manager.boundedBuffer).to.be.instanceof(Array);
      expect(manager.boundedLength).to.equal(10);
    });

  });

  describe('Producer Event Handlers', () => {
    describe('bindProducer()', () => {

      before(() => {
        manager = new Manager(10);
      });

      after(() => {
        manager = undefined;
      });

      it('should return the producer process after binding events', () => {
        var producer = new TestChildProcess();

        // simulate adding event listeners
        producer.stubbedModification = 'listener';

        expect(manager.bindProducer(producer)).to.equal(producer);
      });
    });

    describe('producedExpression()', () => {
      var managerProducedExpression;
      var producer;
      var currentBuffer;
      var consumer;

      beforeEach(() => {
        manager = new Manager(10);
        managerProducedExpression = sinon.spy(manager, 'producedExpression');
        producer = manager.bindProducer(new TestChildProcess());
        consumer = manager.bindConsumer(new TestChildProcess());
      });

      it('should send a "full" message to the producer if the boundedBuffer is full and prevent a push', () => {
        // simulate a full buffer
        currentBuffer = [1, 2, 3, 4, 5, 6 ,7 ,8, 9 ,10];
        manager.boundedBuffer.push(...currentBuffer);

        // simulate the producer handler for receiving the full event
        var producerFullCallbackStub = sinon.stub(manager, 'producerWait');

        // simulate the producer child process sending an expression
        producer.send({ expression: '2+3=' });

        expect(managerProducedExpression).to.have.been.called;
        expect(producerFullCallbackStub).to.have.been.called;

      });

      it('should push to the bounded buffer if it has space', () => {
        currentBuffer = [1, 2, 3, 4, 5, 6 ,7 ,8, 9];
        manager.boundedBuffer.push(...currentBuffer);
        producer.send({ expression: '2+3=' });
        expect(manager.boundedBuffer.length).to.equal(10);
      });

      it('should send a consumer message to resume if length is 1 after pushing', () => {
        var resumeCallbackStub = sinon.stub(manager, 'resumeConsumption');
        producer.send({ expression: '2+3=' });
        expect(resumeCallbackStub).to.be.called;
      });

    });
  });

  describe('Consumer Event Handlers', () => {

    describe('bindConsumer()', () => {
      before(() => {
        manager = new Manager(10);
      });

      after(() => {
        manager = undefined;
      });

      it('should return the consumer process after binding events', () => {
        var consumer = new TestChildProcess();

        // simulate adding event listeners
        consumer.stubbedModification = 'listener';

        // returns reference vs. new
        expect(manager.bindConsumer(consumer)).to.equal(consumer);
      });
    });

    describe('tryConsumption()', () => {
      var managerProducedExpression;
      var producer;
      var currentBuffer;
      var consumer;

      beforeEach(() => {
        manager = new Manager(10);
        managerProducedExpression = sinon.spy(manager, 'producedExpression');
        producer = manager.bindProducer(new TestChildProcess());
        consumer = manager.bindConsumer(new TestChildProcess());
      });

      it('should send a "noExpressions" message event if the buffer is empty', () => {
        var managerNoExpressionsStub = sinon.stub(manager, 'haltConsumption');
        consumer.send({ request: 'expression' });
        expect(managerNoExpressionsStub).to.be.called;
      });

      it('should send "expression" message with a popped off expression if the buffer is expressions', () => {
        var managerExpressionsStub = sinon.stub(manager, 'sendConsumerExpression', () => manager.boundedBuffer.pop());
        currentBuffer = [1, 2, 3, 4, 5, 6 ,7 ,8, 9];
        manager.boundedBuffer.push(...currentBuffer);
        var currentLength = manager.boundedBuffer.length;

        consumer.send({ request: 'expression' });
        expect(managerExpressionsStub).to.be.called;
        expect(manager.boundedBuffer.length).to.equal(currentLength - 1);
      });
    });

  });

});
