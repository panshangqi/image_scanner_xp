import React from 'react';
import classNames from 'classnames';
import omit from 'omit.js';
import './style.less';

export default class Icon extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { type, className = '', spin } = this.props;
        const classString = classNames('yq-icon', className, {
            'yq-icon-spin': !!spin || type === 'loading',
            [`yq-icon-${type}`]: true,
        });
        return (
            <i
                {...omit(this.props, ['type', 'spin'])}
                className={classString}
            />
        );
    }
}

