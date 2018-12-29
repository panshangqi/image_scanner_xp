import React from 'react';
import Option from './option';

export default class Radio extends React.Component {
    state = {
        value: null
    }
    shouldComponentUpdate(nextProps, nextState) {
        return nextState.value !== this.state.value;
    }
    renderOption = props => (
        <Option
            key={props.value}
            {...props}
            checked={props.value === this.state.value ? 'checked' : false}
            handleChange={(value) => {
                if (props.disabled) {
                    return;
                }
                this.setState({ value });
                if (this.props.onChange) {
                    this.props.onChange(value);
                }
            }}
        />
    )
    render() {
        const { children } = this.props;
        return (
            <div>
                {
                    children instanceof Array
                        ?
                        children.map(e => this.renderOption(e.props))
                        :
                        this.renderOption(children.props)
                }
            </div>
        );
    }
}