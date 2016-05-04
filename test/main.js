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
    repeatSomeString(uIntSomeValue, strSomeString){
        return strSomeString.repeat(uIntSomeValue);
    }
    static staticMethod(strSomeStaticString) {
        return strSomeStaticString;
    }
    get name(){
        if(this._name){
            return this._name;
        } else {
            return 'Name not defined';
        }
    }
    set name(strName){
        this._name = strName;
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
            const wrongConstructorParam = 1;
            (() => { new TypedTestClass(wrongConstructorParam); }).should.throw(TypeError);
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
    describe('instance method with str param', () => {
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
    describe('instance method with uInt param', () => {
        it('should throw RangeError when requested with a bad length of param', () => {
            const TypedTestClass = new Typed(TestClass);
            const constructorParam = 'Anton';
            const typedInstance = new TypedTestClass(constructorParam);
            const instanceMethodParam = 1;
            (() => { typedInstance.calcSomething(instanceMethodParam, instanceMethodParam); }).should.throw(RangeError);
        });
        it('should throw TypeError when requested with a bad type of param', () => {
            const TypedTestClass = new Typed(TestClass);
            const constructorParam = 'Anton';
            const typedInstance = new TypedTestClass(constructorParam);
            const instanceMethodParam = 'Anton';
            (() => { typedInstance.calcSomething(instanceMethodParam); }).should.throw(TypeError);
        });
        it('should throw TypeError when requested with a negative value of param', () => {
            const TypedTestClass = new Typed(TestClass);
            const constructorParam = 'Anton';
            const typedInstance = new TypedTestClass(constructorParam);
            const instanceMethodParam = -1;
            (() => { typedInstance.calcSomething(instanceMethodParam); }).should.throw(TypeError);
        });
        it('should invoke instance method', () => {
            const TypedTestClass = new Typed(TestClass);
            const constructorParam = 'Anton';
            const typedInstance = new TypedTestClass(constructorParam);
            const instanceMethodParam = 1;
            (typedInstance.calcSomething(instanceMethodParam)).should.be.eql(instanceMethodParam);
        });
    });
    describe('instance method with uInt and str param', () => {
        it('should throw RangeError when requested with a bad length of param', () => {
            const TypedTestClass = new Typed(TestClass);
            const constructorParam = 'Anton';
            const typedInstance = new TypedTestClass(constructorParam);
            const instanceMethodParamFirst = 2;
            (() => { typedInstance.repeatSomeString(instanceMethodParamFirst); }).should.throw(RangeError);
        });
        it('should throw TypeError when requested with a bad oreder of params', () => {
            const TypedTestClass = new Typed(TestClass);
            const constructorParam = 'Anton';
            const typedInstance = new TypedTestClass(constructorParam);
            const instanceMethodParamFirst = 2;
            const instanceMethodParamSecond = 'Anton';
            (() => { typedInstance.repeatSomeString(instanceMethodParamSecond, instanceMethodParamFirst); }).should.throw(TypeError);
        });
        it('should invoke instance method', () => {
            const TypedTestClass = new Typed(TestClass);
            const constructorParam = 'Anton';
            const typedInstance = new TypedTestClass(constructorParam);
            const instanceMethodParamFirst = 2;
            const instanceMethodParamSecond = 'Anton';
            (typedInstance.repeatSomeString(instanceMethodParamFirst, instanceMethodParamSecond)).should.be.eql(instanceMethodParamSecond.repeat(instanceMethodParamFirst));
        });
    });
    describe('instance property getter', () => {
        it('should get instance param', () => {
            const TypedTestClass = new Typed(TestClass);
            const constructorParam = 'Anton';
            const typedInstance = new TypedTestClass(constructorParam);
            (typedInstance.name).should.be.eql('Name not defined');
        });
    });
    describe('instance property setter with str param', () => {
        it('should throw TypeError when set invalid property type', () => {
            const TypedTestClass = new Typed(TestClass);
            const constructorParam = 'Anton';
            const typedInstance = new TypedTestClass(constructorParam);
            const invalidProperty = 1;
            typedInstance.name = invalidProperty;
            console.log(typedInstance.name);
            (() => { typedInstance.name = invalidProperty; }).should.throw(TypeError);
        });
        it('should invoke instance method', () => {
            const TypedTestClass = new Typed(TestClass);
            const constructorParam = 'Anton';
            const typedInstance = new TypedTestClass(constructorParam);
            const instanceMethodParamFirst = 2;
            const instanceMethodParamSecond = 'Anton';
            (typedInstance.repeatSomeString(instanceMethodParamFirst, instanceMethodParamSecond)).should.be.eql(instanceMethodParamSecond.repeat(instanceMethodParamFirst));
        });
    });
});