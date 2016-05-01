'use strcit';

const should = require('should');
const assert = require('assert');
const Typed = require('../typed.js');

class TestClass {
    constructor(strName){
        this.soname = strName;
    }
    saySomething(strSomeString){
        return strSomeString;
    }
    static staticMethod(strSomeStaticString) {
        return strSomeStaticString;
    }
}

describe('Typed', () => {
    describe('constructor', () => {
        it('should throw type error when invoke without typedClass as first param', ()=>{
            (() => { new Typed(); }).should.throw();
        });
        it('should throw type error when invoke when first param is not Function instance', ()=>{
            (() => { new Typed(1); }).should.throw();
        });
    });
    describe('new()', () => {
        it('should invoke through proxy', () => {
            const constructorParam = 'Anton';
            const TypedTestClass = new Typed(TestClass);
            (new TypedTestClass(constructorParam)).should.be.eql(new TestClass(constructorParam));
        });
        it('should throw error with bad construct param', () => {
            const TypedTestClass = new Typed(TestClass);
            (() => { new TypedTestClass(1); }).should.throw(TypeError);
        });
        it('should throw error with bad length of  construct param', () => {
            const TypedTestClass = new Typed(TestClass);
            const constructorParam = 'Anton';
            (() => { new TypedTestClass(constructorParam, constructorParam); }).should.throw(RangeError);
        });
    });
    describe('static methods', () => {
        it('should invoke static method', () => {
            const TypedTestClass = new Typed(TestClass);
            const methodParam = 'something';
            (TypedTestClass.staticMethod(methodParam)).should.be.equal(methodParam);
        });
    });
});