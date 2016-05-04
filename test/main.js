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
    calcSomething(uIntSomeValue){
        return uIntSomeValue;
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
        it('should throws TypeError when invokes with invalid type of param', () => {
            const TypedTestClass = new Typed(TestClass);
            const methodParam = {};
            (() => { TypedTestClass.staticMethod(methodParam); }).should.throw(TypeError);
        });
        it('should throws RangeError when invokes with invalid count of param', () => {
            const TypedTestClass = new Typed(TestClass);
            const methodParam = 'Anton';
            (() => { TypedTestClass.staticMethod(methodParam, methodParam); }).should.throw(RangeError);
        });
    });
    describe('instance method', () => {
        it('should throw RangeError when requested with a bad length of param', () => {
            const TypedTestClass = new Typed(TestClass);
            const constructorParam = 'Anton';
            const typedInstance = new TypedTestClass(constructorParam);
            const instanceMethodParam = 'Anton';
            (() => { typedInstance.saySomething(instanceMethodParam, instanceMethodParam); }).should.throw(RangeError);
        });
        it('should throw TypeError when requested with a bad type of param', () => {
            const TypedTestClass = new Typed(TestClass);
            const constructorParam = 'Anton';
            const typedInstance = new TypedTestClass(constructorParam);
            const instanceMethodParam = 1;
            (() => { typedInstance.saySomething(instanceMethodParam); }).should.throw(TypeError);
        });
        it('should invoke instance method', () => {
            const TypedTestClass = new Typed(TestClass);
            const constructorParam = 'Anton';
            const typedInstance = new TypedTestClass(constructorParam);
            const instanceMethodParam = 'some string';
            (typedInstance.saySomething(instanceMethodParam)).should.be.eql(instanceMethodParam);
        });
    });
});