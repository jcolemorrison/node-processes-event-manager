import { EventEmitter } from 'events';
import color from 'cli-color';
import config from '../config';

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
      var currentLength = this.boundedBuffer.length;
      this.boundedBuffer.push(expression);
      var postLength = this.boundedBuffer.length;
      if (process.env.NODE_ENV !== 'test') {
        console.log(`Manager: buffer is currently... ${this.boundedBuffer.length}`);
      }
      if (currentLength === 0 && postLength === 1) {
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
        var operationMsg = `${color.blueBright('Operation')}: ${exp.operator} ${exp.operand1} and ${exp.operand2}.`;
        var resultMsg = `${color.green('Result')}: ${exp.result}.`;
        var timeMsg = `${color.magenta('Time')}: ${exp.completed}.`;
        if (process.env.NODE_ENV !== 'test') {
          console.log('=================');
          console.log(operationMsg);
          console.log(resultMsg);
          console.log(timeMsg);
        }
      }
    });
    return consumer;
  }

  sendConsumerExpression(consumer) {
    var currentLength = this.boundedBuffer.length;
    var expression = this.boundedBuffer.pop();
    if (currentLength === config.bufferSize && this.boundedBuffer.length === (config.bufferSize - 1)) {
      this.emit('producerResume');
    }
    consumer.send({ notification: 'expression', expression: expression });
  }

  tryConsumption(consumer) {
    if (this.boundedBuffer.length > 0) {
      this.sendConsumerExpression(consumer);
    } else {
      this.haltConsumption(consumer);
    }
  }

  resumeConsumption(consumer) {
    consumer.send({ notification: 'start'});
  }

  haltConsumption(consumer) {
    consumer.send({ notification: 'wait'});
  }
}

export default Manager;
