import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import omit from 'omit.js';
import Icon from '../icon';
import './style.less';


function bf_child(child) {
    if (child === null) {
        return '';
    }
    if (typeof child === 'string') {
        return <span>{child}</span>;
    }
    return child;
}

export default class Button extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: props.loading,
            clicked: false
        };
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    handleClick = (e) => {
        this.setState({ clicked: true });
        clearTimeout(this.timeout);
        this.timeout = window.setTimeout(() => this.setState({ clicked: false }), 500);
        const { onClick } = this.props;
        if (onClick) {
            onClick(e);
        }
    }

    timeout: 0

    render() {
        const {
            type, size, className, children, icon, prefixCls, streak, ...others
        } = this.props;
        const { loading, clicked } = this.state;
        const Btntag = others.href ? 'a' : 'button';
        const sizeCls = !size || size === 'default' ? '' : size;
        const classes = classNames(prefixCls, className, {
            [`${prefixCls}-${type}`]: type,
            [`${prefixCls}-${sizeCls}`]: sizeCls,
            [`${prefixCls}-icon-only`]: !children && icon,
            [`${prefixCls}-loading`]: loading,
            [`${prefixCls}-clicked`]: clicked,
            [`${prefixCls}-streak`]: streak
        });
        const iconType = loading ? 'loading' : icon;
        const iconnode = iconType ? <Icon type={iconType} /> : null;
        const kids = bf_child(children);
        return (
            <Btntag
                {...omit(others, ['loading'])}
                type="button"
                className={classes}
                onClick={this.handleClick}
            >
                {iconnode}{kids}
            </Btntag>
        );
    }
}

Button.propTypes = {
    prefixCls: PropTypes.string,
    type: PropTypes.oneOf(['primary', 'default']),
    streak: PropTypes.bool,
    size: PropTypes.oneOf(['lg', 'default', 'sm']),
    icon: PropTypes.string,
    href: PropTypes.string,
    loading: PropTypes.bool,
    onClick: PropTypes.func
};

Button.defaultProps = {
    prefixCls: 'yq-btn',
    loading: false
};

