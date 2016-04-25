'use strcit';

const should = require('should');
const typed = require('../typed.js');

describe('Typed', () => {
    describe('proxy', () => {
        it('should return new instance of TypedObject', () => {
            (new typed()).should.be.eql({rules : {}});
        });
    });
});