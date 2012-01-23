require('sugar');
var util = require('util');

function FakeRedis(){
  this.calls_received = {};
  this.calls_received["sadd"] = [];
  this.calls_received["hincrby"] = [];
  var self = this;
}

FakeRedis.prototype.sadd = function(key, value){
  this.calls_received["sadd"].add([[key, value]]);
}

FakeRedis.prototype.hincrby = function(rediskey, hashkey, incrby){
  this.calls_received["hincrby"].add([[rediskey, hashkey, incrby]]);
}

FakeRedis.prototype.call_count = function(){
	return(this.calls_received["sadd"].length + this.calls_received["hincrby"].length);
}

FakeRedis.prototype.received = function(call_type, body){
  var match = this.calls_received[call_type].find(function(n){
    return n.sort().toString() == body.sort().toString();
  });
  if (typeof match != "undefined"){
    return true;
  } else {
    return false;
  }
}

FakeRedis.prototype.reset = function(){
  this.calls_received["sadd"] = [];
  this.calls_received["hincrby"] = [];
}

exports.FakeRedis = FakeRedis;
