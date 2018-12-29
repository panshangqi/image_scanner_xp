import React, { Component, PureComponent } from 'react';

export class Prevent extends PureComponent {
    render() {
        const { renderComponent, ...other } = this.props;
        return renderComponent(other);
    }
}

function createConnect(ContextConsumer) {
    return (WrappedComponent) => class Consumer extends Component {
        static displayName = `Connect(${WrappedComponent.displayName ||
        WrappedComponent.name ||
        'Component'})`

        constructor(props) {
            super(props);
        }

        render() {
            return (
                <ContextConsumer>
                    {state =>
                        (
                            <Prevent
                                renderComponent={props => <WrappedComponent {...props} />}
                                {...this.props}
                                {...state}
                            />
                        )
                    }
                </ContextConsumer>
            )
        }
    };
}

export default createConnect;