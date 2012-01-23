var FakeRedis = require(__dirname + "/lib/fake_redis").FakeRedis;
var RedistatModel = require(__dirname + "/../index").RedistatModel;
var db = new FakeRedis();
var TestStats = new RedistatModel(db,"TestStats","sec");
var should = require('should');

describe('RedistatModel:', function(){
  describe('TestStats', function(){

    before(function(){
      TestStats.store('account_id/pipeline_id',{val1: 1, 'val2/test1': 1, 'val2/test2': 1},'2012-01-23 00:01:02');
    });
    
    it('should be an instance of RedistatModel', function(){
      TestStats.should.be.an.instanceof(RedistatModel);
    });

    it('should make 50 calls to Redis.', function(){
      db.call_count().should.eql(50);
    });

    it('should publish all levels of date hash', function(){
      var keyBase = "TestStats/account_id/pipeline_id:2012"
      db.received('hincrby',[keyBase,'val1','1']).should.be.true;
      db.received('hincrby',[keyBase + '01','val1','1']).should.be.true;
      db.received('hincrby',[keyBase + '0123','val1','1']).should.be.true;
      db.received('hincrby',[keyBase + '012300','val1','1']).should.be.true;
      db.received('hincrby',[keyBase + '01230001','val1','1']).should.be.true;
      db.received('hincrby',[keyBase + '0123000102','val1','1']).should.be.true;
      db.received('hincrby',[keyBase + 'invalid', 'val1','2']).should.not.be.true;
    });

    it('should publish all levels of label hash', function(){
      db.received('hincrby',['TestStats/account_id:2012','val1','1']).should.be.true;
      db.received('hincrby',['TestStats/account_id/pipeline_id:2012','val1','1']).should.be.true;
    });

    it('should publish all keys in stat hash', function(){
      var key = 'TestStats/account_id:2012';
      db.received('hincrby', [key, 'val1', '1']).should.be.true;
      db.received('hincrby', [key, 'val2', '2']).should.be.true;
      db.received('hincrby', [key, 'val2/test1', '1']).should.be.true;
      db.received('hincrby', [key, 'val2/test2', '1']).should.be.true;
    });

    it('should publish all correct label indexes', function(){
      db.received('sadd',['TestStats.label_index','account_id']).should.be.true;
      db.received('sadd',['TestStats.label_index:account_id','pipeline_id']).should.be.true;
    });

  });
});
