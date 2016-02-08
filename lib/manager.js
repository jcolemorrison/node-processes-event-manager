import { EventEmitter } from 'events';

class Manager extends EventEmitter {
  constructor(boundedLength) {
    super();
    this.boundedBuffer = [];
    this.boundedLength = boundedLength;
  }
  // Producer Functions
  bindProducer(producer) {
    producer.on('message', (data) => {
      if (data.expression) {
        this.producedExpression(producer, data.expression);
      }
    });
    return producer;
  }

  producerWait(producer, expression) {
    producer.send({ notification: 'full', expression: expression });
  }

  producedExpression(producer, expression) {
    if (this.boundedBuffer.length === this.boundedLength) {
      this.producerWait(producer, expression);
    } else {
      this.boundedBuffer.push(expression);
      if (this.boundedBuffer.length === 1) {
        this.emit('consumerResume');
      }
    }
  }

  // Consumer Functions
  bindConsumer(consumer) {
    this.on('consumerResume', () => {
      this.resumeConsumption(consumer);
    });
    consumer.on('message', (data) => {
      if (data.request) {
        this.tryConsumption(consumer);
      }
    });
    return consumer;
  }

  sendConsumerExpression(consumer) {
    var expression = this.boundedBuffer.pop();
    consumer.send({ expression: expression });
  }

  tryConsumption(consumer) {
    if (this.boundedBuffer.length > 0) {
      this.sendConsumerExpression(consumer);
    } else {
      this.haltConsumption(consumer);
    }
  }

  resumeConsumption(consumer) {
    consumer.send({ command: 'resume'});
  }

  haltConsumption(consumer) {
    consumer.send({ notification: 'no expressions'});
  }
};

export default Manager;
