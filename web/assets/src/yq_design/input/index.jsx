import React from 'react';
import PropTypes from 'prop-types';
import './style.less';

const Input = function Input(props) {
    return (
        <div style={{ display: 'inline-block' }}>
            <input
                type={props.type}
                className={`yq-input ${props.className || ''} ${props.size || ''}`}
                {...props}
            />
        </div>
    );
};
Input.defaultProps = {
    type: 'text'
};
Input.propTypes = {
    type: PropTypes.oneOf(['text', 'password', 'hidden']),
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(['lg', 'sm']),
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    onKeyPress: PropTypes.func,
    autofocus: PropTypes.bool,
    style: PropTypes.object
};
export default Input;