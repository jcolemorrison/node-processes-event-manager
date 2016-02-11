import { EventEmitter } from 'events';

class Manager extends EventEmitter {
  constructor(boundedLength) {
    super();
    this.boundedBuffer = [];
    this.boundedLength = boundedLength;
  }
  // Producer Functions
  bindProducer(producer) {
    this.on('producerResume', () => {
      this.resumeProduction(producer);
    });
    producer.on('message', (data) => {
      if (data.expression) {
        this.producedExpression(producer, data.expression);
      }
    });
    return producer;
  }

  producerWait(producer, expression) {
    producer.send({ notification: 'wait', expression: expression });
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

  resumeProduction(producer) {
    producer.send({ notification: 'start' });
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
      if (data.expression) {
        var exp = data.expression;
        var successMsg = `Operation: ${exp.operator} ${exp.operand1} and ${exp.operand2}.  Result: ${exp.result}.  Time: ${exp.completed}`;
        console.log(successMsg);
      }
    });
    return consumer;
  }

  sendConsumerExpression(consumer) {
    var currentLength = this.boundedBuffer.length;
    var expression = this.boundedBuffer.pop();
    if (currentLength === 10 && this.boundedBuffer.length === 9) {
      this.emit('producerResume');
    }
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
    consumer.send({ command: 'start'});
  }

  haltConsumption(consumer) {
    consumer.send({ notification: 'no expressions'});
  }
}

export default Manager;
