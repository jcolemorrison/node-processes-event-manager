import math from 'mathjs';
import async from 'async';

var ProcessConsumer;

class Consumer {
  constructor() {
  }
  beginConsumption() {
    var self = this;
    async.forever(
      (next) => {
        self.requestConsumption(next, self);
      },
      (err) => {
        self.haltConsumption(err);
      }
    );
  }
  requestConsumption(next, instance) {
    instance.currentIteration = next;
    process.send({ request: 'expression'});
  }
  haltConsumption(err) {
    console.log(err);
    return err;
  }
  consumeExpression(expression) {
    expression.result = math[expression.operator](expression.operand1, expression.operand2);
    expression.completed = new Date();
    return expression;
  }
  sendExpression(expression) {
    var consumedExpression = this.consumeExpression(expression);
    process.send({ expression: consumedExpression });
    this.currentIteration();
  }
  wait(expression) {
    this.currentIteration('no expressions');
  }
}

function initConsumer(instance) {
  ProcessConsumer = instance ? instance : new Consumer();
}

function processHandler(event) {
  switch (event.notification) {
    case 'start':
      ProcessConsumer.beginConsumption();
      break;
    case 'expression':
      ProcessConsumer.sendExpression(event.expression);
      break;
    case 'wait':
      ProcessConsumer.wait(event.expression);
      break;
  }
}

initConsumer();

process.on('message', processHandler);

export { Consumer , processHandler, initConsumer };
