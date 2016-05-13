# TypedProxy
A module checks out type of methods parameters and properties of Class by using es6 Proxy.
##Installation
```
npm i typedproxy
```
##Example
```javascript
const Typed = require('typedproxy');
//MyClass declaration
const TypedMyClass = new Typed(MyClass, { 'nonZeroType' : (value) => { 
        if (value === 0 ) throw new TypeError('nonZeroTypeError');
    }
});
const typedInstance = new TypedMyClass();
typedInstance.nonZeroMethod(1);//ok
typedInstance.nonZeroMethod(0);//throw TypeError
```

##Usage
Suppose you have a es-6 class named *TestClass*, which contains constructor, some static methods 
and properties(probably with getter and setter), methods and etc. Probably he is looks like class which i have described below: 
```javascript
class TestClass {
    constructor(strName){
        this.soname = strName;
    }
    static staticMethod(strSomeStaticString) {
        return strSomeStaticString;
    }
    calcSomething(uIntSomeValue){
        return uIntSomeValue;
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
```
If you want **check out type** of parameters, when invoke methods (or set property value) of this class or instance of this class
you may follow next steps:

- 

> Include **typedproxy** module in your application : 
```javascript
const Typed = require('typedproxy');
```

- 

> Decide which types you will use in your application (e.g. str, uInt), and describes object that represents [this one](#typedtypes): 
```javascript
const types = {
    'str': (value) => {
        const typeOfValue = {}.toString.call(value).slice(8, -1);
        if (typeOfValue !== 'String') {
            throw new TypeError(`str parameter must be String instance, not ${typeOfValue}`);
        }
    },
    'uInt': (value) => {
        const typeOfValue = {}.toString.call(value).slice(8, -1);
        if (typeOfValue !== 'Number') {
            throw new TypeError(`uInt parameter must be Number instance, not ${typeOfValue}`);
        }
    }
};
```

- 

> Create new **typed** class based on your class and types object that you have described above. : 
```javascript
const TypedTestClass = new Typed(TestClass, types);
```

- 

> The **TypedTestClass** is typed version of **TestClass** now and you can invoke static methods (including setter of properties and constructor) of him. If parameters passed into methods are not valid, it will throw an *TypeError* (based on types object). If number of parameters passed into methods is not correct, it will throw an *RangeError* (by default): 
```javascript
TypedTestClass.staticMethod('string'); //ok
```
```javascript
TypedTestClass.staticMethod(1); //throw TypeError
```
```javascript
TypedTestClass.staticMethod('string', 'string'); //throw RangeError
```

- 

> Create new **typed** instances, which represents *TestClass* instance with *typed* feature: 
```javascript
const typedInstance = new TypedTestClass('string');
typedInstance.calcSomething(1); //ok
```

> but
```javascript
typedInstance.calcSomething('string'); //throw TypeError
```
```javascript
typedInstance.calcSomething(1, 2); //throw RangeError
```

## <a name="typedtypes">Types</a>
All types that you are planning to use in your application are described by **types object**. This is simple object wich contains type names and their *check out functions*. The first characters of the parameters used in your class methods, must match with the names of types. For example :
> if you want to use your **equalOneType** than typed object may be looks like :
```javascript
typed = {
    'equalOneType' : (value) => {
        if(value !== 1) {
            throw new TypeError(`equalOneType param must be equal 1, not ${value}`); 
        }
    }
};
```
and method must be looks like :
```javascript
someMethod(equalOneTypeParam){
    this.count+=equalOneTypeParam;
}
```
