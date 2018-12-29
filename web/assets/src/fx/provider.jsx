import React, { Component } from 'react';

function createProvider(ContextProvider, store) {
    return (WrappedComponent) => class Provider extends Component {
        static displayName = `Provider(${WrappedComponent.displayName ||
        WrappedComponent.name ||
        'Component'})`

        constructor(props) {
            super(props);
            this.state = {
                ...store,
                setStore: this.setStore
            }
        }

        setStore = (state, callback) => {
            this.setState(state, callback);
        }

        render() {
            return (
                <ContextProvider value={this.state}>
                    <WrappedComponent {...this.state} {...this.props} />
                </ContextProvider>
            )
        }
    };
}

export default createProvider;