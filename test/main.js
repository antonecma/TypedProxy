'use strcit';

const should = require('should');
const Typed = require('../typed.js');

describe('Typed', () => {
    describe('proxy', () => {
        it('should return new instance of TypedObject', () => {
            (new Typed()).should.be.eql({name : 'Test Class'});
        });
    });
});