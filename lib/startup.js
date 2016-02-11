import childProcess from 'child_process';
import Manager from './manager';

var init = () => {
  var manager = new Manager(10);
  var producer1 = manager.bindProducer(childProcess.fork(`${__dirname}/producer`));
  var producer2 = manager.bindProducer(childProcess.fork(`${__dirname}/producer`));
  var consumer = manager.bindConsumer(childProcess.fork(`${__dirname}/consumer`));
  var init = { notification: 'start' };
  producer1.send(init);
  producer2.send(init);
  consumer.send(init);
};

init();
