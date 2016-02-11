# PC-System

## Installation

Please make sure to have `mocha` and `gulp` installed on your machine.

```
$ npm install
```

## Notes

This takes an approach using an intermediate manager in order to actually simulate a bounded buffer instead of assuming we will have one via the hardware.  Also, instead of using separate web-servers, it leverages child processes and inter-process-communication (IPC) in order to take full advantage and speed of the system.

# IMPORTANT NOTE:

Because it leverages node's child_process module - it does require you to have your CPU open to use.  So if you have a ton of applications open, the child processes will fail since the OS will have them rest and start trying to flip to other applications.  It does use 4 processes (1x Manager, 2x Producer and 1x Consumer).

## Usage

To start run tests:

```
$ npm test
```

To build it down in order to run, use:

```
$ gulp prepublish
$ node dist/startup.js
```

You can change the rate at which the 2 producers create expressions and the size of the bounded buffer by tweaking the settings in `config.js`.


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

