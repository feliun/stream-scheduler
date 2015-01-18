# stream-scheduler

This tiny module will allow you to stream a URL on an interval basis. It will report when is the last time it executed correctly, when it is the last time it encountered an error on the execution and whether is executing in that moment or not. On top of that, it will allow you to trigger the streaming job "out of schedule".

This component is very simple and specially useful when you need to run scheduled jobs to extract information from a URL. It is robust because it offers healthcheck information (so you could potentially return it in your server endpoint) and it is flexible, since it allows you to "manually" trigger the job, in case you need to.

The usage is quite simple. First, create an object with the following configuration. (All fields are optional, except for the url):

```
var options = {
  url: <the url to stream from>,
  interval: <your interval in seconds>,
  onStartExec: <callback to execute when the job gets triggered>,
  onData: <callback to execute every time you receive a chunk from the streaming>,
  onEnd: <callback to execute when the streaming finishes>,
  onError: <callback to execute when an error occurs in the streaming or in the scheduling>,
  startNow: <forces the component to trigger the process inmediately>
}
```

Once you've done that, just require and initialise the stream-scheduler:

```
var ss = require('stream-scheduler');
ss.init(options);
```

After that you will be able to interact with the stream scheduler with the following functions:

```
ss.isExecuting(); //It will tell you if your streaming job is executing at the moment
ss.lastExecutionTime(); //It will return the last time when it finished executing successfully
ss.startExecution(); //It will force the component to execute the job (unless it's already running)
```

You can find a good usage example [here].

Please feel free to report bugs/create pull requests/give feedback.

Enjoy!

[here]:https://github.com/feliun/stream-scheduler/blob/master/samples/sample.js
