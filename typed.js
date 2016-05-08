'use strict';

const getFunctionArgumentsDescribe = (func) => {
    /*
     snatch from http://stackoverflow.com/a/31194949
     */
    return (Function.prototype.toString.call(func) + '').replace(/\s+/g, '')
        .replace(/[/][*][^/*]*[*][/]/g, '') // strip simple comments
        .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters
        .replace(/{+/g, '') // strip any ES6 defaults
        .replace(/}+/g, '') // strip any ES6 defaults
        .replace(/=[^,]+/g, '') // strip any ES6 defaults
        .split(',').filter(Boolean); // split & filter [""]
};
const defaultTypes = {
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
        if (!Number.isSafeInteger(value)) {
            throw new TypeError(`uInt parameter must be safe integer value`);
        }
        if (value < 0) {
            throw new TypeError(`uInt parameter must be more than 0, not ${value}`);
        }

    }
};
const typeTesterDefault = (types, functionName, ...passedArgs) => {
    //compare length of function passed args and length of expected args
    const argsLength = passedArgs.length;
    const typesOfParams = getFunctionArgumentsDescribe(functionName);

    if (argsLength !== typesOfParams.length) {
        throw new RangeError('amount of parameters is invalid');
    } else {

        const allTypes = Object.keys(types);
        const allTypesLength = allTypes.length;

        for (let i = 0; i < argsLength; i++) {
            let typeDefinedInTypesObject = false;
            for (let j = 0; j < allTypesLength; j++) {
                if (typesOfParams[i].startsWith(allTypes[j])) {
                    typeDefinedInTypesObject = true;
                    types[allTypes[j]](passedArgs[i]);
                    break;
                }
            }
            if (!typeDefinedInTypesObject) {
                throw new RangeError(`can not find type of ${typesOfParams[i]} value in [${allTypes}]`);
            }
        }
        return true;
    }
};
const mapOfAllOwnSetters = (obj) => {
    /*
     get prototype chain
     */
    const mapOfSetters = new Map();
    const excludeConstructors = [
        ({}).constructor,
        (Number()).constructor,
        (String()).constructor,
        (new Function()).constructor
    ];
    const protoChain = function protoChain(obj){
        const proto = Object.getPrototypeOf(obj);
        Object.getOwnPropertyNames(obj).forEach((property) => {
            const descOfProp = Object.getOwnPropertyDescriptor(obj, property);
            if (descOfProp.set && descOfProp.configurable && (!descOfProp.value)) {
                if(!mapOfSetters.has(property)){
                    mapOfSetters.set(property, descOfProp.set);
                }
            }
        });
        if(!excludeConstructors.includes(proto.constructor)){
            protoChain(proto);
        }
    };
    protoChain(obj);
    return mapOfSetters;
};
const arrOfAllOwnWritableAndConfigurableMethods = (obj) => {
    return Object.getOwnPropertyNames(obj).filter((property) => {
        const descOfProp = Object.getOwnPropertyDescriptor(obj, property);
        return (descOfProp.value instanceof Function) && descOfProp.writable && descOfProp.configurable;
    });
};
class TypedProxy {
    constructor(typedClass, types = defaultTypes, typeTester = typeTesterDefault) {
        /*
         Work with Class only
         */
        if (!(typedClass instanceof Function)) {
            throw new TypeError('typedClass must be a Function instance');
        }
        /*
         Determinate static methods
         */
        const createApplyProxy = (instance, methodName) => {
            const handler = {
                apply(target, thisArgument, argList){
                    typeTester(types, target, ...argList);
                    return target.apply(thisArgument, argList);
                }
            };
            return new Proxy(instance[methodName], handler);
        };
        const mapApplyHandler = (instance, methodNames, ...excludeMethods) => {


            const setOfStaticMethodsAndThemProxies = new Map();

            methodNames.forEach((methodName) => {
                if (!excludeMethods.includes(methodName)) {
                    setOfStaticMethodsAndThemProxies.set(methodName, createApplyProxy(instance, methodName));
                }
            });

            return setOfStaticMethodsAndThemProxies;
        };
        const staticMethodOfTypedClass = arrOfAllOwnWritableAndConfigurableMethods(typedClass);

        const setOfStaticMethodsAndThemProxies = mapApplyHandler(typedClass, staticMethodOfTypedClass);

        const mapOfStaticSetter = mapOfAllOwnSetters(typedClass);

        const handler = {
            construct(target, argList) {
                /*
                 Interception for 'new' statement
                 Here we checks argList with typeTester
                 */
                typeTester(types, typedClass, ...argList);
                const instance = new target(...argList);
                const methodsOfTypeInstance = arrOfAllOwnWritableAndConfigurableMethods(Object.getPrototypeOf(instance));
                const mapSettersOfInstance = mapOfAllOwnSetters(instance);
                const excludeMethods = ['constructor'];
                //TODO [Symbol.someSymbol] does not have place in map below
                const mapOfMethodsAndThemProxies = mapApplyHandler(instance, methodsOfTypeInstance, ...excludeMethods);
                const instanceHandler = {
                    get(target, prop){
                        if(!excludeMethods.includes(prop)){
                            if (!mapOfMethodsAndThemProxies.has(prop)) {
                                if(target[prop] instanceof Function){
                                    mapOfMethodsAndThemProxies.set(prop, createApplyProxy(target, prop));
                                } else {
                                    return target[prop];
                                }
                            }
                            return mapOfMethodsAndThemProxies.get(prop);
                        } else {
                            return target[prop];
                        }
                    },
                    set(target, prop, value){
                        if (mapSettersOfInstance.has(prop)) {
                            typeTester(types, mapSettersOfInstance.get(prop), value);
                        }
                        target[prop] = value;
                        return true;
                    }
                };
                return new Proxy(instance, instanceHandler);

            },
            get(target, prop){
                /*
                 static methods
                 */
                if (setOfStaticMethodsAndThemProxies.has(prop)) {
                    return setOfStaticMethodsAndThemProxies.get(prop);
                } else {
                    return target[prop];
                }
            },
            set(target, prop, value){
                if (mapOfStaticSetter.has(prop)) {
                    typeTester(types, mapOfStaticSetter.get(prop), value);
                }
                target[prop] = value;
                return true;
            }
        };
        return new Proxy(typedClass, handler);
    }
}
module.exports = TypedProxy;

