import * as React from 'react';
import * as ReactDOM from 'react-dom';
import classNames from 'classnames';
import Icon from '../icon';
import Dialog from './modal';
import ActionButton from './action-button';

const IS_REACT_16 = !!ReactDOM.createPortal;

const ConfirmDialog = (props) => {
    const {
        onCancel, onOk, close, zIndex, afterClose, visible, keyboard
    } = props;
    const iconType = props.iconType || 'question-circle';
    const okType = props.okType || 'primary';
    const prefixCls = props.prefixCls || 'yq-confirm';
    // 默认为 true，保持向下兼容
    const okCancel = ('okCancel' in props) ? props.okCancel : true;
    const width = props.width || 416;
    // 默认为 false，保持旧版默认行为
    const maskClosable = props.maskClosable === undefined ? false : props.maskClosable;
    const okText = props.okText || '知道了';
    const cancelText = props.cancelText || '取消';

    const classString = classNames(
        prefixCls,
        `${prefixCls}-${props.type}`,
        props.className,
    );

    const cancelButton = okCancel && (
        <ActionButton actionFn={onCancel} closeModal={close}>
            {cancelText}
        </ActionButton>
    );

    const handleCancel = () => {
        close.bind(this, { triggerCancel: true });
    };
    return (
        <Dialog
            className={classString}
            onCancel={() => handleCancel()}
            visible={visible}
            title=""
            transitionName="zoom"
            footer=""
            maskTransitionName="fade"
            maskClosable={maskClosable}
            width={width}
            zIndex={zIndex}
            afterClose={afterClose}
            keyboard={keyboard}
        >
            <div className={`${prefixCls}-body-wrapper`}>
                <div className={`${prefixCls}-body`}>
                    <Icon type={iconType} />
                    <span className={`${prefixCls}-title`}>{props.title}</span>
                    <div className={`${prefixCls}-content`}>{props.content}</div>
                </div>
                <div className={`${prefixCls}-btns`}>
                    {cancelButton}
                    <ActionButton type={okType} actionFn={onOk} closeModal={close} autoFocus>
                        {okText}
                    </ActionButton>
                </div>
            </div>
        </Dialog>
    );
};


export default function confirm(config) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    function close(...args) {
        if (IS_REACT_16) {
            render({
                ...config, close, visible: false, afterClose: destroy.bind(this, ...args)
            });
        } else {
            destroy(...args);
        }
    }
    function destroy(...args) {
        const unmountResult = ReactDOM.unmountComponentAtNode(div);
        if (unmountResult && div.parentNode) {
            div.parentNode.removeChild(div);
        }
        const triggerCancel = args && args.length &&
      args.some(param => param && param.triggerCancel);
        if (config.onCancel && triggerCancel) {
            config.onCancel(...args);
        }
    }
    function render(props) {
        ReactDOM.render(<ConfirmDialog {...props} />, div);
    }
    render({ ...config, visible: true, close });
    return {
        destroy: close,
    };
}
