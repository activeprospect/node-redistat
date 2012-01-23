# node-redistat

A write-only Redistat module for node.js intended to be used in
conjunction with the [Redistat Ruby gem](https://github.com/jimeh/redistat).

### To Use
		// Include the RedistatModel code
		var RedistatModel = require('redistat').RedistatModel;

		// Include Redis and create a connection
		var redis = require('redis');
		var db = redis.createClient();

		// Create a Redistat model (note you'll need a model by the same
		// name in the Ruby portion of your codebase).
		// Arguments are a Redis connection, the name of your model,
		// and the time resolution (year, month, day, hour, min, sec).
		var LeadStats = new Redistat(db,'LeadStats','hour');

		// Store some stats
		LeadStats.store('account_id/pipeline_id',{leads: 1, emails: 1});

### To Run Tests
The test lib uses a fake Redis client to avoid polluting your
local Redis database. The suite is built using [Mocha](https://github.com/visionmedia/mocha)
and [Should.js](https://github.com/visionmedia/should.js).

		make test

### To Run Benchmark
The benchmark code uses [Benchmark.js](http://benchmarkjs.com/) to fire
RedistatModel#store calls asynchronously. Each op in the benchmark
script equates to 75 Redis calls.

		node benchmark.js
