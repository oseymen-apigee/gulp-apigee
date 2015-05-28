/*jshint expr: true*/

var expect = require('chai').expect;
var sinon = require('sinon');
var request = require('request');
var apigee = require('../../source/apigee.js');

var successResponse = {
	statusCode: 200
};

var deployResponseBody = {
	name: 'api-v1',
	revision: '1'
};

var options = {
	org: 'org',
	env: 'env',
	api: 'api',
	revision: '1',
	override: true,
	delay: 5,
	username: '',
	password: ''
};

var bundle = {
	content: ''
};

var requestPostMethod;

describe('feature: deploy revision to apigee', function() {

	beforeEach(function(done) {
		requestPostMethod = sinon.stub(request, 'post');
		done();
	});

	afterEach(function(done) {
		requestPostMethod.restore();
		done();
	});

	it('should handle successful deploy response', function(done) {
		requestPostMethod
			.yields(null, successResponse, JSON.stringify(deployResponseBody));

		apigee.deploy(options, function(err, body) {
			expect(err).to.be.null;
			expect(body.name).to.be.equal('api-v1');
			expect(body.revision).to.be.equal('1');
			done();
		});
	});

	it('should return request module err', function(done) {
		requestPostMethod
			.yields({message: 'someerr'});

		apigee.deploy(options, function(err, body) {
			expect(err).to.not.be.null;
			expect(err.message).to.be.equal('someerr');
			expect(body).to.be.undefined;
			done();
		});
	});

	it('should return err if response code is not 201', function(done) {
		requestPostMethod
			.yields(null, {statusCode: 400}, '{"message": "not-important"}');

		apigee.deploy(options, function(err, body) {
			expect(err).to.not.be.null;
			expect(err.statusCode).to.be.equal(400);
			expect(err.body.message).to.be.equal('not-important');
			done();
		});
	});

	it('should validate options being null', function(done) {
		requestPostMethod
			.yields(null, successResponse, JSON.stringify(deployResponseBody));

		var o = null;

		apigee.deploy(o, function(err, body) {
			expect(err).to.not.be.null;
			expect(err.message).to.contain('options is required');
			done();
		});
	});

	it('should validate options properties', function(done) {
		requestPostMethod
			.yields(null, successResponse, JSON.stringify(deployResponseBody));

		var o = {};

		apigee.deploy(o, function(err, body) {
			expect(err).to.not.be.null;
			expect(err.message).to.contain('A valid options.org is required');
			expect(err.message).to.contain('A valid options.env is required');
			expect(err.message).to.contain('A valid options.api is required');
			expect(err.message).to.contain('A valid options.revision is required');
			expect(err.message).to.contain('A valid options.override is required');
			expect(err.message).to.contain('A valid options.delay is required');
			expect(err.message).to.contain('A valid options.username is required');
			expect(err.message).to.contain('A valid options.password is required');
			done();
		});
	});

});
