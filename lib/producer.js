import math from 'mathjs';
var ProcessProducer;

class Producer {
  constructor() {
    this.pendingExpressions = [];
  }
  beginProduction() {
    var expression;
    this.loop = setInterval(() => {
      expression = this.produceExpression();
      this.sendExpression(expression);
    }, 1000);
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
    process.send(expression);
  }
  wait(expression) {
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
