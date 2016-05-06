'use strict';

const getFunctionArgumentsDescribe = (func) => {
    /*
    snatch from http://stackoverflow.com/a/31194949
    */
    return (func+'').replace(/\s+/g,'')
        .replace(/[/][*][^/*]*[*][/]/g,'') // strip simple comments
        .split('){',1)[0].replace(/^[^(]*[(]/,'') // extract the parameters
        .replace(/{+/g,'') // strip any ES6 defaults
        .replace(/}+/g,'') // strip any ES6 defaults
        .replace(/=[^,]+/g,'') // strip any ES6 defaults
        .split(',').filter(Boolean); // split & filter [""]
};
const defaultTypes = {
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
const typeTesterDefault = (types, functionName, ...passedArgs) => {
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
        }
        return true;
    }
};
const mapOfAllOwnSetters = (obj) => {
    const mapOfSetters = new Map();
    Object.getOwnPropertyNames(obj).forEach((property) => {
        const descOfProp = Object.getOwnPropertyDescriptor(obj, property);
         if(descOfProp.set && descOfProp.configurable && (!descOfProp.value)){
             mapOfSetters.set(property, descOfProp.set);
         }
    });
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
        if(! (typedClass instanceof Function)){
            throw new TypeError('typedClass must be a Function instance');
        }
        /*
        Determinate static methods
         */
        const mapApplyHandler = (instance, methodNames, ...excludeMethods) => {

            const setOfStaticMethodsAndThemProxies = new Map();

            methodNames.forEach((methodName) => {
                if(!excludeMethods.includes(methodName)) {
                    const handler = {
                        apply(target, thisArgument, argList){
                            typeTester(types, target, ...argList);
                            return target.apply(thisArgument, argList);
                        }
                    };
                    const proxy = new Proxy(instance[methodName], handler);
                    setOfStaticMethodsAndThemProxies.set(methodName, proxy);
                }
            });

            return setOfStaticMethodsAndThemProxies;
        };
        const staticMethodOfTypedClass =  arrOfAllOwnWritableAndConfigurableMethods(typedClass);

        const setOfStaticMethodsAndThemProxies = mapApplyHandler(typedClass, staticMethodOfTypedClass);
        /*
            Define new() and get() handler for Class
             In get handler is invoking a 'setOfStaticMethodsAndThemProxies' proxy if it static method
         */
        const mapOfStaticSetter = mapOfAllOwnSetters(typedClass);
        const handler = {
            construct(target, argList) {
                /*
                    Interception for 'new' statement
                    Here we checks argList with typeTester(types, )
                  */
                typeTester(types, typedClass, ...argList);
                const instance = new target(...argList);
                const methodsOfTypeInstance =  arrOfAllOwnWritableAndConfigurableMethods(Object.getPrototypeOf(instance));
                const mapSettersOfInstance = mapOfAllOwnSetters(Object.getPrototypeOf(instance));
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
                        if(mapSettersOfInstance.has(prop)){
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
                if(setOfStaticMethodsAndThemProxies.has(prop)){
                    return setOfStaticMethodsAndThemProxies.get(prop);
                } else {
                    return target[prop];
                }
            },
            set(target, prop, value){
                if(mapOfStaticSetter.has(prop)){
                    typeTester(types, mapOfStaticSetter.get(prop), value);
                }
                target[prop] = value;
                return true;
            }
        };
        return new Proxy(typedClass, handler);
    }
}
module.exports =  TypedProxy;

