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
    static get age(){
        if(this._age){
            return this._age;
        } else {
            return 'Age not defined';
        }
    }
    static set age(uIntValue){
        this._age = uIntValue;
        return true;
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
        return true;
    }
};
class Shape {
    get color() {
        if(this._color){
            return this._color;
        } else {
            return 'color not defined';
        }
    }
    set color(strColorName) {
        this._color = strColorName;
        return true;
    }
    shapeRepeatStr(strSomeString, uIntTimes){
        return strSomeString.repeat(uIntTimes);
    }
};

function extendedClass(parentClass) {
    const extClass = class Circle extends parentClass {
        constructor(uIntRadius) {
            super();
            this.radius = uIntRadius;
            Circle.circlesMade++;
        };

        static draw(strCanvas) {
            return `I will draw this in ${strCanvas}`;
        };

        static get circlesMade() {
            return !this._count ? 0 : this._count;
        };
        static set circlesMade(uIntVal) {
            this._count = uIntVal;
            return true;
        };

        area() {
            return Math.pow(this.radius, 2) * Math.PI;
        };

        get radius() {
            return this._radius;
        };
        set radius(uIntRadius) {
            this._radius = uIntRadius;
            return true;
        };
    };
    return extClass;
};

describe('TestClass', () => {
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
    describe('setter', () => {
        it('should throw TypeError when set invalid property type', () => {
            const TypedTestClass = new Typed(TestClass);
            const staticProperty = 'Anton';
            (() => { TypedTestClass.age = staticProperty; }).should.throw(TypeError);
        });
        it('should set value of property by setter', () => {
            const TypedTestClass = new Typed(TestClass);
            const staticProperty = 30;
            TypedTestClass.age = staticProperty;
            (TypedTestClass.age).should.be.eql(staticProperty);
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
            (() => { typedInstance.name = invalidProperty; }).should.throw(TypeError);
        });
        it('should set value of instance by setter', () => {
            const TypedTestClass = new Typed(TestClass);
            const constructorParam = 'Anton';
            const typedInstance = new TypedTestClass(constructorParam);
            const typedInstanceProperty = 'Anton';
            typedInstance.name = typedInstanceProperty;
            (typedInstance.name).should.be.eql(typedInstanceProperty);
        });
    });
});
describe('Inheritance', () => {
    describe('extends', () => {
        it('should create new instance of extended class', () => {
        //create new typed Child class
            const childTypedClass = new Typed(extendedClass(Shape));
        //create new instance of typed child class
            const constructorParam = 1;
            new childTypedClass(constructorParam);
        });

     });
    describe('parent access', () => {
        describe('methods', () => {
            it('should throw RangeError when requested with a bad length of param', () => {
                //create new typed Child class
                const childTypedClass = new Typed(extendedClass(Shape));
                //create new instance of typed child class
                const constructorParam = 1;
                const childInstance = new childTypedClass(constructorParam);
                const methodParamFirst = 'Anton';
                const methodParamSecond = 2;
                (() => { childInstance.shapeRepeatStr(methodParamFirst); }).should.throw(RangeError);

            });
            it('should throw TypeError when requested with a bad type of param', () => {
                //create new typed Child class
                const childTypedClass = new Typed(extendedClass(Shape));
                //create new instance of typed child class
                const constructorParam = 1;
                const childInstance = new childTypedClass(constructorParam);
                const methodParamFirst = 'Anton';
                const methodParamSecond = 2;
                (() => { childInstance.shapeRepeatStr(methodParamSecond, methodParamFirst); }).should.throw(TypeError);
            });
            it('should invoke parent method', () => {
                //create new typed Child class
                const childTypedClass = new Typed(extendedClass(Shape));
                //create new instance of typed child class
                const constructorParam = 1;
                const childInstance = new childTypedClass(constructorParam);
                const methodParamFirst = 'Anton';
                const methodParamSecond = 2;
                (childInstance.shapeRepeatStr(methodParamFirst, methodParamSecond)).should.be.eql(methodParamFirst.repeat(methodParamSecond));
            });
        });
        describe('setter', () => {
            it('should throw TypeError when set invalid property type', () => {
                //create new typed Child class
                const childTypedClass = new Typed(extendedClass(Shape));
                //create new instance of typed child class
                const constructorParam = 1;
                const childInstance = new childTypedClass(constructorParam);
                const propertyValue = 1;
                (() => { childInstance.color = propertyValue ;}).should.throw(TypeError);
            });
            it('should set value of property by setter', () => {
                //create new typed Child class
                const childTypedClass = new Typed(extendedClass(Shape));
                //create new instance of typed child class
                const constructorParam = 1;
                const childInstance = new childTypedClass(constructorParam);
                const propertyValue = 'red';
                childInstance.color = propertyValue ;
                (childInstance.color).should.be.eql(propertyValue);
            });
        });
    });

});