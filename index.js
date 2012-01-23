require('sugar');
var util = require('util');
// var KeyMaker = require(__dirname + '/lib/keyMaker').KeyMaker;

function RedistatModel(redisConnection, modelName, timeDepth){
  this.depth = timeDepth || "hour";
	if (typeof ["year","month","day","hour","min","sec"].find(this.depth) === "undefined"){
		throw new Error("Invalid key depth.");
  }
  this.scope = modelName;
  this.redis = redisConnection;
  // this.KeyMaker = new KeyMaker(this.depth,this.scope);
  var self = this;
}

RedistatModel.prototype.store = function(label, stats, timestamp){
  if ((typeof label === "undefined") || (typeof stats === "undefined")){
    throw new Error("Cannot store without provided label and stats");
  }
  var self = this;
  var keys = buildKeys(label,stats,timestamp);
  console.log(util.inspect(keys));
  var indexes = buildLabelIndexes(label);
  Object.extended(keys).each(function(key,value){
    Object.extended(value).each(function(stat_key,incr_by){
      self.redis.hincrby(key, stat_key, incr_by);
    });
  });
  Object.extended(indexes).each(function(key,value){
    self.redis.sadd(key, value);
  });

  function buildKeys(label,stats,timestamp){
    timestamp = timestamp || new Date;

    var dateKeys = buildDateKeys(timestamp);
    console.log(util.inspect(dateKeys));
    var labelKeys = buildLabelKeys(label);
    var statHash = buildStatHash(stats);
    var returnHsh = {};
    labelKeys.each(function(labelKey){
      dateKeys.each(function(dateKey){
        returnHsh[labelKey + ":" + dateKey] = statHash;
      });
    });
    return returnHsh;

    function buildLabelKeys(label){
      var components = label.split('/');
      var labelKeys = [];
      components.each(function(comp,idx){
        key = self.scope + "/";
        components.to(idx + 1).each(function(component){
          key = key + component + "/";
        });
        labelKeys.add(key.slice(0,-1));
      });
      return labelKeys;
    }


    function buildDateKeys(timestamp){
      var dateHash = buildDateHash(timestamp);
      var components = ["year","month","day","hour","min","sec"];
      // removeAt doesn't support indexes from the end, so I'm using
      // 99 as an arbitrarily high index.
      components.removeAt((components.findIndex(self.depth) + 1),99)
      var date_keys = []
      components.each(function(comp,idx){
        var key = "";
        components.to(idx + 1).each(function(component){
          key = key + dateHash[component];
        });
        date_keys.add(key);
      });
      return date_keys;

      function buildDateHash(timestamp){
        var timestamp = Date.create(timestamp);
        if(!timestamp.isValid())
          throw new Error("Cannot parse provided date");
        var t = timestamp;
        return {  year: t.getFullYear().pad(4), 
                  month: (t.getMonth() + 1).pad(2), 
                  day: t.getDate().pad(2), 
                  hour: t.getHours().pad(2), 
                  min: t.getMinutes().pad(2), 
                  sec: t.getSeconds().pad(2)
               };
      }
    }

    function buildStatHash(hsh){
      var returnHsh = {};
      hsh = Object.extended(hsh);
      hsh.each(function(key,value){
        var components = key.split('/');
        components.each(function(comp,idx){
          key = "";
          components.to(idx + 1).each(function(component){
            key = key + component + '/';
          });
          returnHsh[key.slice(0,-1)] = returnHsh[key.slice(0,-1)] || 0;
          returnHsh[key.slice(0,-1)] = returnHsh[key.slice(0,-1)] + value;
        });
      });
      return returnHsh;
    }
  }

  function buildLabelIndexes(label){
    var returnHsh = {};
    base = this.scope + ".label_index:"
    components = label.split('/');
    while (components.length > 0){
      label = base;
      var value = components.pop();
      components.each(function(comp){
        label = label + comp + "/" 
      });
      returnHsh[label.slice(0,-1)] = value;
    }
    return returnHsh;
  }


}

exports.RedistatModel = RedistatModel;
