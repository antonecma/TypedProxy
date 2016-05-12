# TypedProxy
A module checks out type of methods parameters and properties of Class by using es6 Proxy.
##Installation
```
npm i typedproxy
```

##Usage
Suppose you have a es-6 class named *TestClass*, which contains constructor, some static methods 
and properties(probably with getter and setter), methods and etc. Probably he is looks like class which i have described below: 
```javascript
class TestClass {
    constructor(strName){
        this.soname = strName;
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


## <a name="typedtypes">Types</a>
