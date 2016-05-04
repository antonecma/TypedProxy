'use strict';

function getFunctionArgumentsDescribe(func) {
    return (func+'').replace(/\s+/g,'')
        .replace(/[/][*][^/*]*[*][/]/g,'') // strip simple comments
        .split('){',1)[0].replace(/^[^(]*[(]/,'') // extract the parameters
        .replace(/{+/g,'') // strip any ES6 defaults
        .replace(/}+/g,'') // strip any ES6 defaults
        .replace(/=[^,]+/g,'') // strip any ES6 defaults
        .split(',').filter(Boolean); // split & filter [""]
};

const types = {
    'str' : (value) => {

        const typeOfValue = {}.toString.call(value).slice(8, -1);

        if(typeOfValue !== 'String'){
            throw new TypeError(`str parameter must be String instance, not ${typeOfValue}`);
        }
    },
    'uInt' : (value) => {

        const typeOfValue = {}.toString.call(value).slice(8, -1);

        if(typeOfValue !== 'Number'){
            throw new TypeError(`uInt parameter must be Number instance, not ${typeOfValue}`);
        }
        if(!Number.isSafeInteger(value)) {
            throw new TypeError(`uInt parameter must be safe integer value`);
        }
        if(value < 0) {
            throw new TypeError(`uInt parameter must be more than 0, not ${value}`);
        }

    }
};

const typeTester = (functionName, ...passedArgs) => {
    //compare length of function passed args and length of expected args
    const argsLength = passedArgs.length;
    const typesOfParams = getFunctionArgumentsDescribe(functionName);

    if(argsLength !== typesOfParams.length) {
        throw new RangeError('amount of parameters is invalid');
    } else {

        const allTypes = Object.keys(types);
        const allTypesLength = allTypes.length;

        for(let i = 0; i < argsLength; i++){
            let typeDefinedInTypesObject = false;
            for(let j = 0; j < allTypesLength; j++){
                if(typesOfParams[i].startsWith(allTypes[j])){
                    typeDefinedInTypesObject = true;
                    types[allTypes[j]](passedArgs[i]);
                    break;
                }
            }
            if(!typeDefinedInTypesObject) {
                throw new RangeError(`can not find type of ${typesOfParams[i]} value in [${allTypes}]`);
            }
        };

        return true;
    }
};
const mapOfAllOwnWritableAndConfigurableMethods = (obj) => {
    const staticMethodOfTypedClass = Object.getOwnPropertyNames(obj).filter((property) => {
        const descOfProp = Object.getOwnPropertyDescriptor(obj, property);
        return (descOfProp.value instanceof Function) && descOfProp.writable && descOfProp.configurable;
    });
    return staticMethodOfTypedClass;
};
const mapApplyHandler = (instance, methodNames, ...excludeMethods) => {

    const setOfStaticMethodsAndThemProxies = new Map();

    methodNames.forEach((methodName) => {
        if(!excludeMethods.includes(methodName)) {
            const handler = {
                apply(target, thisArgument, argList){
                    typeTester(target, ...argList);
                    return target.apply(thisArgument, argList);
                }
            };
            const proxy = new Proxy(instance[methodName], handler);
            setOfStaticMethodsAndThemProxies.set(methodName, proxy);
        }
    });

    return setOfStaticMethodsAndThemProxies;
};

class TypedProxy {
    constructor(typedClass) {
        /*
        Work with Class only
         */
        if(! (typedClass instanceof Function)){
            throw new TypeError('typedClass must be a Function instance');
        }
        /*
        Determinate static methods
         */
        const staticMethodOfTypedClass =  mapOfAllOwnWritableAndConfigurableMethods(typedClass);

        const setOfStaticMethodsAndThemProxies = mapApplyHandler(typedClass, staticMethodOfTypedClass);
        /*
            Define new() and get() handler for Class
             In get handler is invoking a 'setOfStaticMethodsAndThemProxies' proxy if it static method
         */
        const handler = {
            construct(target, argList) {
                /*
                    Interception for 'new' statement
                    Here we checks argList with typeTester()
                  */
                typeTester(typedClass, ...argList);
                const instance = new target(...argList);
                const methodsOfTypeInstance =  mapOfAllOwnWritableAndConfigurableMethods(Object.getPrototypeOf(instance));
                const mapOfMethodsAndThemProxies = mapApplyHandler(instance, methodsOfTypeInstance, 'constructor');
                const instanceHandler = {
                    get(target, prop){
                        if(mapOfMethodsAndThemProxies.has(prop)){
                            return mapOfMethodsAndThemProxies.get(prop);
                        } else {
                            return target[prop];
                        }
                    },
                    set(target, prop, value){

                        
                    }
                };
                const proxyInstance = new Proxy(instance, instanceHandler);
                return proxyInstance;

            },
            get(target, prop){
                /*
                static methods
                 */
                if(setOfStaticMethodsAndThemProxies.has(prop)){
                    return setOfStaticMethodsAndThemProxies.get(prop);
                } else {
                    return target[prop];
                }
            }
        };
        const proxy = new Proxy(typedClass, handler);
        return proxy;
    }
}
module.exports =  TypedProxy;

