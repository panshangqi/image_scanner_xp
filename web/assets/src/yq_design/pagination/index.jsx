import React from 'react';
import PropTypes from 'prop-types';
import './style.less';
import Icon from '../icon';

const Button = props => (
    <div
        className={`yq-pg-btn ${props.className || ''} ${props.active ? 'active' : ''}`.trim()}
        onClick={props.onClick}
    >
        {props.children}
    </div>
);

export default class Pagination extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: parseInt(props.current, 10),
            pageSize: parseInt(props.pageSize, 10),
            total: props.total
        };
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            current: parseInt(nextProps.current, 10),
            pageSize: parseInt(nextProps.pageSize, 10),
            total: parseInt(nextProps.total, 10)
        });
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.current !== this.state.current || nextProps.total !== this.state.total;
    }
    handleChange = (current, pageSize) => {
        this.setState(() => ({ current, pageSize }));
        if (this.props.onChange) {
            this.props.onChange(current, pageSize);
        }
    }
    prePage = () => {
        if (this.state.current <= 1) {
            return;
        }
        const pre = this.state.current - 1;
        this.handleChange(pre, this.state.pageSize);
    }
    nextPage = () => {
        const { total, pageSize } = this.state;
        const pageNum = Math.ceil(total / pageSize);
        if (this.state.current >= pageNum) {
            return;
        }
        const next = this.state.current + 1;
        this.handleChange(next, this.state.pageSize);
    }
    renderBtns = (_startIndex, _endIndex, before = false, after = false, pageNum) => {
        const btns = [
            <Button
                key={1}
                onClick={() => { this.handleChange(1, this.state.pageSize) }}
                active={this.state.current === 1}
            >
                1
            </Button>
        ];
        if (pageNum === 1) {
            return btns;
        }
        if (before) {
            btns.push(<span key={-1}>···</span>);
        }
        for (let i = _startIndex; i <= _endIndex; i++) {
            const btn = (
                <Button
                    key={i}
                    onClick={() => { this.handleChange(i, this.state.pageSize) }}
                    active={this.state.current === i}
                >
                    {i}
                </Button>
            );
            btns.push(btn);
        }
        if (after) {
            btns.push(<span key={-2}>···</span>);
        }
        const btn = (
            <Button
                key={pageNum}
                onClick={() => { this.handleChange(pageNum, this.state.pageSize) }}
                active={this.state.current === pageNum}
            >
                {pageNum}
            </Button>
        );
        btns.push(btn);
        return btns;
    }
    render() {
        this.btns = [];
        const { total, current, pageSize } = this.state;
        const pageNum = Math.ceil(total / pageSize);
        if (!total || total === '0') {
            return null;
        }
        let startIndex = 2;
        let endIndex = pageNum - 1;
        let before = false;
        let after = false;
        if (pageNum > 7) {
            if (current <= 3) {
                endIndex = 5;
                after = true;
            } else if (pageNum - current < 3) {
                startIndex = pageNum - 5;
                endIndex = pageNum - 1;
                before = true;
            } else {
                startIndex = current - 2;
                endIndex = current + 2;
                before = (startIndex !== 2);
                after = (endIndex !== pageNum - 1);
            }
        }
        if (this.props.simple) {
            return (
                <div className={`yq-pagination simple ${this.props.className || ''}`} style={{ ...this.props.style }}>
                    <Button className={current === 1 ? 'disabled' : ''} onClick={this.prePage}>
                        <Icon type="left" />
                    </Button>
                    <span style={{ fontSize: 18 }}>{current}</span>
                    <span style={{ color: 'gray', fontSize: 16 }}>/{pageNum}</span>
                    <Button className={current === pageNum ? 'disabled' : ''} onClick={this.nextPage}>
                        <Icon type="right" />
                    </Button>
                </div>
            );
        }
        return (
            <div className={`yq-pagination ${this.props.className || ''}`} style={{ ...this.props.style }}>
                <Button className={current === 1 ? 'disabled' : ''} onClick={this.prePage}>上一页</Button>
                {
                    this.renderBtns(startIndex, endIndex, before, after, pageNum)
                }
                <Button className={current === pageNum ? 'disabled' : ''} onClick={this.nextPage}>下一页</Button>
                {
                    pageNum <= 7 ? null : (
                        <input
                            type="number"
                            min={1}
                            max={pageNum}
                            onKeyUp={(e) => {
                                const forward = parseInt(e.target.value, 10);
                                if (e.keyCode === 13
                                    && !isNaN(forward)
                                    && forward <= pageNum
                                    && forward > 0) {
                                    this.handleChange(forward, pageSize);
                                }
                            }}
                        />
                    )
                }
            </div>
        );
    }
}

Pagination.propTypes = {
    current: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    pageSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    style: PropTypes.object
};