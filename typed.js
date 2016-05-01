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

        let typeOfValue = {}.toString.call(value).slice(8, -1);

        if(typeOfValue !== 'String'){
            throw new TypeError(`str parameter must be String instance, not ${typeOfValue}`);
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
        const staticMethodOfTypedClass = Object.getOwnPropertyNames(typedClass).filter((property) => {
            const descOfProp = Object.getOwnPropertyDescriptor(typedClass, property);
            return (descOfProp.value instanceof Function) && descOfProp.writable && descOfProp.configurable;
        });
        staticMethodOfTypedClass.forEach((methodName) => {
            const handler = {
                apply(target, thisArgument, argList){

                }
            };
            const proxy = new Proxy();
        });
        const handler = {
            construct(target, argList) {
                /*
                    Interception for 'new' statement
                    Here we checks argList with typeTester()
                  */
                typeTester(typedClass, ...argList);
                const instance = new target(...argList);
                const instanceProxyHandler = {
                    get(target, property) {
                        return target[property];
                    }
                };
                const proxyInstance = new Proxy(instance, instanceProxyHandler);
                return proxyInstance;

            },
            get(target, prop){
                /*
                static methods
                 */
                if(staticMethodOfTypedClass.includes(prop)){
                    typeTester(target[prop])
                }
                return target[prop];
            }
        };
        const proxy = new Proxy(typedClass, handler);
        return proxy;
    }
}
module.exports =  TypedProxy;

