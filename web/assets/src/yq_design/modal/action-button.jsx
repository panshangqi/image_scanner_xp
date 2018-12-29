import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '../button';

export default class ActionButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
    }
    componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }
    onClick = () => {
        const { actionFn, closeModal } = this.props;
        if (actionFn) {
            let ret;
            if (actionFn.length) {
                ret = actionFn(closeModal);
            } else {
                ret = actionFn();
                if (!ret) {
                    closeModal();
                }
            }
            if (ret && ret.then) {
                this.setState({ loading: true });
                ret.then((...args) => {
                    closeModal(...args);
                }, () => {
                    this.setState({ loading: false });
                });
            }
        } else {
            closeModal();
        }
    }
    timeoutId: 0
    render() {
        const { type, children } = this.props;
        const { loading } = this.state;
        return (
            <Button
                type={type}
                onClick={this.onClick}
                loading={loading}
                ref={(node) => { this.node = node }}
            >
                {children}
            </Button>
        );
    }
}

ActionButton.propTypes = {
    type: PropTypes.oneOf(['default', 'primary', 'ghost', 'dashed', 'danger']),
    actionFn: PropTypes.func,
    closeModal: PropTypes.func
};
