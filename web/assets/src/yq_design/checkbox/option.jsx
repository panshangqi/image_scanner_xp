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
            className={`yq-checkbox ${props.disabled ? 'disabled' : ''.trim()}`}
            onClick={() => {
                if (props.handleChange) {
                    props.handleChange(props.value, !props.checked);
                }
            }}
        >
            <input type="checkbox" {...inputProps} onChange={props.onChange || function () { }} />
            <span className="yq-checkbox-btn" />{props.children}
        </div>
    );
};

export default Option;