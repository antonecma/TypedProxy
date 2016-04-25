'use strict';

class TestClass {
    constructor(){
        this.name = 'Test Class';
    }
}
class TypedProxy {
    constructor() {
        const handler = {
            construct : (target, argList) => {
                return new target(...argList);
            }
        };
        const proxy = new Proxy(TestClass, handler);
        return new proxy();
    }
}
module.exports =  TypedProxy;

