# stream-scheduler

This tiny module will allow you to stream a URL on an interval basis. It will report when is the last time it executed correctly, when it is the last time it encountered an error on the execution and whether is executing in that moment or not. On top of that, it will allow you to trigger the streaming job "out of schedule".

This component is very simple and specially useful when you need to run scheduled jobs to extract information from a URL. It is robust because it offers healthcheck information (so you could potentially return it in your server endpoint) and it is flexible, since it allows you to "manually" trigger the job, in case you need to.

The usage is quite simple. First, create an object with the following configuration. (All fields are optional, except for the url and the interval/schedule, since you need to specify at least one of these):

```
var options = {
  url: <the url to stream from>,
  interval: <your interval in seconds>,
  schedule: <your cron-like configuration>,
  onStartExec: <callback to execute when the job gets triggered>,
  pipeline: <list of streams to pass the url request execution through>,
  startNow: <forces the component to trigger the process inmediately>
}
```

The **schedule** field allows you to configure your job to run on a particular moment in time. It is using the node-schedule module, so you can visit [their page](https://github.com/mattpat/node-schedule) to check your available options. A couple of useful examples of use are these:

```
var options = {
  ...
  schedule: {hour: 14, minute: 30, dayOfWeek: 0},
  ...
}
```

or a more cron-like format ```[MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]```:

```
var options = {
  ...
  schedule: '0 17 ? * 0,4-6',
  ...
}
```

Once you've configured the stream scheduler, you just need to require and initialise the stream-scheduler:

```
var ss = require('stream-scheduler');
ss.init(options);
```

After that you will be able to interact with the stream scheduler with the following functions:

```
ss.isExecuting(); //It will tell you if your streaming job is executing at the moment
ss.getLastExecutionTime(); //It will return the last time when it finished executing successfully
ss.startExecution(); //It will force the component to execute the job (unless it's already running)
```

You can find a good usage example [here].

Please feel free to report bugs/create pull requests/give feedback.

Enjoy!

[here]:https://github.com/feliun/stream-scheduler/blob/master/samples/sample.js
