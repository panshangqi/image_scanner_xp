import { createContext } from 'react';

import createProvider from './provider';
import createConnect from './connect';


function createStore(store) {
    const context = createContext();
    const Provider = createProvider(context.Provider, store);
    const Connect = createConnect(context.Consumer);

    return {
        Provider,
        Connect
    };
}

export default createStore;