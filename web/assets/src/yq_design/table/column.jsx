import * as React from 'react';

export default class Column extends React.Component {}

Column.propTypes = {
    title: PropTypes.string,
    key: PropTypes.string,
    dataIndex: PropTypes.string,
    render: PropTypes.func,
    sorter: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.func
    ]),
    colSpan: PropTypes.number,
    width: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    className: PropTypes.string,
    sortOrder: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool
    ])
}