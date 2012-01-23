require('sugar');
var Benchmark = require('benchmark');
var RedistatModel = require(__dirname + '/index').RedistatModel;
var redis = require('redis');
var db = redis.createClient();
var TestStats = new RedistatModel(db,'TestStats','hour');
var suite = new Benchmark.Suite;
suite.add('Store stats', function(){
  TestStats.store("account_id/pipeline_id/step_id",{record:1, "test1/email": 1, "test1/phone": 1});
})
.on('cycle', function(event, bench){
  console.log(String(bench));
})
.run({ 'async': true});
