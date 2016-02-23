import childProcess from 'child_process';
import Manager from './manager';
import config from '../config';
import color from 'cli-color';
const numCPUs = require('os').cpus().length;

var init = () => {
  var manager = new Manager(config.bufferSize);
  var producer1 = manager.bindProducer(childProcess.fork(`${__dirname}/producer`));
  var producer2 = manager.bindProducer(childProcess.fork(`${__dirname}/producer`));
  var consumer = manager.bindConsumer(childProcess.fork(`${__dirname}/consumer`));
  var init = { notification: 'start' };
  producer1.send(init);
  producer2.send(init);
  consumer.send(init);
};

if (numCPUs < 4) {
  console.log(color.yellow(`You need at least 4 CPU cores to run this.  Your system only has ${numCPUs} CPU cores available.`));
  console.log('\n');
  process.exit(0);
} else {
  init();
}

