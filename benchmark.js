require('sugar');
var Benchmark = require('benchmark');
var RedistatModel = require(__dirname + '/index').RedistatModel;
var redis = require('redis');
var db = redis.createClient();
var LeadStats = new RedistatModel(db,'LeadStats','hour');
var suite = new Benchmark.Suite;
suite.add('Store stats', function(){
  LeadStats.store("account_id/pipeline_id/step_id",{email:1, "briteverify/email": 1, "briteverify/phone": 1});
})
.on('cycle', function(event, bench){
  console.log(String(bench));
})
.run({ 'async': true});
