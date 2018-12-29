import React from 'react';
import './style.less';

const Option = function Option(props) {
    const inputProps = {};
    ['id', 'value', 'checked', 'disabled'].forEach((e) => {
        if (props[e] !== undefined) {
            inputProps[e] = props[e];
        }
    });
    return (
        <div
            className={`yq-radio ${props.disabled ? 'disabled' : ''.trim()}`}
            onClick={() => {
                if (props.handleChange) {
                    props.handleChange(props.value);
                }
            }}
        >
            <input type="radio" {...inputProps} onChange={props.onChange || function () { }} />
            <span className="yq-radio-btn" />{props.children}
        </div>
    );
};

export default Option;