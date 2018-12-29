import * as React from 'react';
import Dialog from 'rc-dialog';
import PropTypes from 'prop-types';
import Button from '../button';

export default class Modal extends React.Component {
    handleCancel = (e) => {
        const { onCancel } = this.props;
        if (onCancel) {
            onCancel(e);
        }
    }

    handleOk = (e) => {
        const { onOk } = this.props;
        if (onOk) {
            onOk(e);
        }
    }

    renderFooter() {
        const {
            okText, okType, cancelText, confirmLoading, showCancel
        } = this.props;
        return (
            <div>
                {
                    showCancel && (
                        <Button
                            onClick={this.handleCancel}
                        >
                            {cancelText}
                        </Button>
                    )
                }
                <Button
                    type={okType}
                    loading={confirmLoading}
                    onClick={this.handleOk}
                >
                    {okText}
                </Button>
            </div>
        );
    }

    render() {
        const { footer, visible } = this.props;
        const defaultFooter = this.renderFooter();
        return (
            <Dialog
                {...this.props}
                footer={footer === undefined ? defaultFooter : footer}
                visible={visible}
                onClose={this.handleCancel}
            />
        );
    }
}

Modal.propTypes = {
    prefixCls: PropTypes.string,
    visible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    title: PropTypes.node,
    closable: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    width: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    footer: PropTypes.node,
    okText: PropTypes.string,
    okType: PropTypes.oneOf(['default', 'primary', 'ghost', 'dashed', 'danger']),
    cancelText: PropTypes.string,
    maskClosable: PropTypes.bool,
    wrapClassName: PropTypes.string,
    maskTransitionName: PropTypes.string,
    transitionName: PropTypes.string,
    showCancel: PropTypes.bool,
};

Modal.defaultProps = {
    cancelText: '取 消',
    okText: '确 认',
    showCancel: true,
    okType: 'primary',
    width: 520,
    transitionName: 'zoom',
    maskTransitionName: 'fade',
    confirmLoading: false,
    visible: false,
    prefixCls: 'yq-modal',
    title: '提示',
    closable: true,
    footer: React.ReactNode,
    maskClosable: true,
    wrapClassName: ''
};