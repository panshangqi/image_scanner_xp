import React from 'react';
import Option from './option';

export default class CheckBox extends React.Component {
    state = {
        values: []
    }
    shouldComponentUpdate(nextProps, nextState) {
        return nextState.values !== this.state.values;
    }
    renderOption = props => (
        <Option
            key={props.value}
            {...props}
            checked={this.state.values.indexOf(props.value) !== -1 ? 'checked' : false}
            handleChange={(value, isPush) => {
                if (props.disabled) {
                    return;
                }
                let values = this.state.values.slice();
                if (isPush) {
                    values.push(value);
                } else {
                    values = values.filter(e => e !== value);
                }
                this.setState({ values });
                if (this.props.onChange) {
                    this.props.onChange(values);
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