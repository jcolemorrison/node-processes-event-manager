# PC-System

## Installation

Please make sure to have `mocha` and `gulp` installed on your machine.

```
$ npm install
```

## Notes

This takes an approach using an intermediate manager in order to actually simulate a bounded buffer instead of assuming we will have one via the hardware.  Also I got (maybe to my own dismay) a little experimental - instead of using separate web-servers, it leverages child processes and inter-process-communication (IPC) in order to take full advantage and speed of the system.

# IMPORTANT NOTE:

Because it leverages node's child_process module - it does require you to have your CPU open to use.  So if you have a ton of applications open, the child processes will fail since the OS will have them rest and start trying to flip to other applications.  It does `REQUIRE` 4 cores (1x Manager, 2x Producer and 1x Consumer) (granted very very lightly).

In fact, the best bet, is to close Google Chrome....

## Usage

To start run tests:

```
$ npm test
```

To build it down in order to run, use:

```
$ gulp prepublish
$ npm start
```

You can change the rate at which the 2 producers create expressions and the size of the bounded buffer (how many expressions it can hold) by tweaking the settings in `config.js`.

The while the 2 producers are bound to a time limit, the consumer will literally try and fetch from the bounded buffer as fast as possible.  If there are no expressions in the buffer, it will sleep.

*If the child processes fail, it's because the core's aren't available.  Try closing some applications and restarting.  It does require 4 cores.*


## UML Activity Diagrams

### Producers

![Producer Activity UML Diagram](/img/producer-uml-activity.png?raw=true)

### Consumer

![Consumer Activity UML Diagram](/img/consumer-uml-activity.png?raw=true)

### Manager

![Manager Activity UML Diagram](/img/manager-uml-activity.png?raw=true)

## UML Sequence Diagram

![UML Sequence Diagram](/img/pc-sequence-uml.png?raw=true)

## License

MIT © [J Cole Morrison](start.jcolemorrison.com)

