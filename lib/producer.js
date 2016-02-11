import math from 'mathjs';
import config from '../config';
import color from 'cli-color';
var ProcessProducer;

class Producer {
  constructor() {
    this.pendingExpressions = [];
  }
  beginProduction() {
    var expression;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`----> ${color.green('Producer is beginning!')}`);
    }
    this.loop = setInterval(() => {
      expression = this.produceExpression();
      this.sendExpression(expression);
    }, config.productionRate);
  }
  produceExpression() {
    if (this.pendingExpressions.length > 0) {
      return this.pendingExpressions.pop();
    }
    return {
      operand1: math.randomInt(-1000, 1000),
      operand2: math.randomInt(-1000, 1000),
      operator: math.pickRandom(['add', 'divide', 'subtract', 'multiply'])
    };
  }
  sendExpression(expression) {
    process.send({ expression: expression });
  }
  wait(expression) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`----> ${color.yellow('Producer is waiting!')}`);
    }
    this.pendingExpressions.push(expression);
    clearInterval(this.loop);
  }
}

function initProducer(instance) {
  ProcessProducer = instance ? instance : new Producer();
}

function processHandler(event) {
  switch (event.notification) {
    case 'start':
      ProcessProducer.beginProduction();
      break;
    case 'wait':
      ProcessProducer.wait(event.expression);
      break;
  }
}

process.on('message', processHandler);

initProducer();

export { Producer, processHandler, initProducer };
