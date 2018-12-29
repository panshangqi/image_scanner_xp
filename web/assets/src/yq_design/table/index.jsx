import * as React from 'react';
import RcTable from 'rc-table';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { flatFilter } from './util';
import Icon from '../icon';
import './style.less';

/**
 * Avoid creating new object, so that parent component's shouldComponentUpdate
 * can works appropriately。
 */
export default class Table extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...this.getDefaultSortOrder(this.columns)
        };
    }


    componentWillReceiveProps() {
        if (this.getSortOrderColumns(this.columns).length > 0) {
            const sortState = this.getSortStateFromColumns(this.columns);
            if (sortState.sortColumn !== this.state.sortColumn ||
          sortState.sortOrder !== this.state.sortOrder) {
                this.setState(sortState);
            }
        }
    }

    getDefaultSortOrder(columns) {
        const definedSortState = this.getSortStateFromColumns(columns);
        const temp = (column) => column.defaultSortOrder != null;
        const defaultSortedColumn = flatFilter(columns || [], temp)[0];

        if (defaultSortedColumn && !definedSortState.sortColumn) {
            return {
                sortColumn: defaultSortedColumn,
                sortOrder: defaultSortedColumn.defaultSortOrder,
            };
        }

        return definedSortState;
    }

    getSortOrderColumns(columns) {
        return flatFilter(
            columns || this.columns || [],
            (column) => 'sortOrder' in column,
        );
    }

    getSortStateFromColumns(columns) {
        const sortedColumn =
      this.getSortOrderColumns(columns).filter((col) => col.sortOrder)[0];

        if (sortedColumn) {
            return {
                sortColumn: sortedColumn,
                sortOrder: sortedColumn.sortOrder,
            };
        }

        return {
            sortColumn: null,
            sortOrder: null,
        };
    }

    getSorterFn() {
        const { sortOrder, sortColumn } = this.state;
        if (!sortOrder || !sortColumn ||
        typeof sortColumn.sorter !== 'function') {
            return null;
        }
        return (a, b) => {
            const result = sortColumn.sorter(a, b);
            if (result !== 0) {
                return (sortOrder === 'descend') ? -result : result;
            }
            return 0;
        };
    }

    getColumnKey(column, index) {
        return column.key || column.dataIndex || index;
    }

    handlePageChange = (...otherArguments) => {
        const { onChange } = this.props;
        if (onChange) {
            onChange.apply(null, ...otherArguments);
        }
    }

    isSortColumn(column) {
        const { sortColumn } = this.state;
        if (!column || !sortColumn) {
            return false;
        }
        return this.getColumnKey(sortColumn) === this.getColumnKey(column);
    }

    prepareParamsArguments(state) {
        const sorter = {};
        if (state.sortColumn && state.sortOrder) {
            sorter.column = state.sortColumn;
            sorter.order = state.sortOrder;
            sorter.field = state.sortColumn.dataIndex;
            sorter.columnKey = this.getColumnKey(state.sortColumn);
        }
        return [sorter];
    }

    toggleSortOrder(order, column) {
        let { sortColumn, sortOrder } = this.state;
        // 只同时允许一列进行排序，否则会导致排序顺序的逻辑问题
        const isSortColumn = this.isSortColumn(column);
        if (!isSortColumn) { // 当前列未排序
            sortOrder = order;
            sortColumn = column;
        } else { // 当前列已排序
            if (sortOrder === order) { // 切换为未排序状态
                sortOrder = '';
                sortColumn = null;
            } else { // 切换为排序状态
                sortOrder = order;
            }
        }
        const newState = {
            sortOrder,
            sortColumn,
        };

        // Controlled
        if (this.getSortOrderColumns().length === 0) {
            this.setState(newState);
        }

        const { onChange } = this.props;
        if (onChange) {
            onChange.apply(null, this.prepareParamsArguments({
                ...this.state,
                ...newState,
            }));
        }
    }

    recursiveSort(data, sorterFn) {
        const { childrenColumnName } = this.props;
        return data.sort(sorterFn).map((item) => (item[childrenColumnName] ? {
            ...item,
            [childrenColumnName]: this.recursiveSort(item[childrenColumnName], sorterFn),
        } : item));
    }

    renderColumnsDropdown(columns) {
        const { prefixCls } = this.props;
        const { sortOrder } = this.state;
        const self = this;
        return columns.map((originColumn, i) => {
            const column = { ...originColumn };
            const key = self.getColumnKey(column, i);
            let sortButton;
            if (column.sorter) {
                const isSortColumn = self.isSortColumn(column);
                if (isSortColumn) {
                    column.className = classNames(column.className, {
                        [`${prefixCls}-column-sort`]: sortOrder,
                    });
                }
                const isAscend = isSortColumn && sortOrder === 'ascend';
                const isDescend = isSortColumn && sortOrder === 'descend';
                sortButton = (
                    <div className={`${prefixCls}-column-sorter`}>
                        <span
                            className={`${prefixCls}-column-sorter-up ${isAscend ? 'on' : 'off'}`}
                            title="↑"
                            onClick={() => self.toggleSortOrder('ascend', column)}
                        >
                            <Icon type="caret-up" />
                        </span>
                        <span
                            className={`${prefixCls}-column-sorter-down ${isDescend ? 'on' : 'off'}`}
                            title="↓"
                            onClick={() => self.toggleSortOrder('descend', column)}
                        >
                            <Icon type="caret-down" />
                        </span>
                    </div>
                );
            }
            column.title = (
                <span key={key}>
                    {column.title}
                    {sortButton}
                </span>
            );
            return column;
        });
    }


  renderTable = () => {
      const {
          className, prefixCls, dataSource, handlePageChange, ...restProps
      } = this.props;
      const classString = classNames({
          [`${prefixCls}-${this.props.size}`]: true,
          [`${prefixCls}-bordered`]: this.props.bordered,
          [`${prefixCls}-empty`]: !dataSource.length,
      });
      let { columns } = this.props;
      columns = this.renderColumnsDropdown(columns);
      columns = columns.map((column, i) => {
          const newColumn = { ...column };
          newColumn.key = this.getColumnKey(newColumn, i);
          return newColumn;
      });
      let data = dataSource || [];
      data = data.slice(0);
      const sorterFn = this.getSorterFn();
      if (sorterFn) {
          data = this.recursiveSort(data, sorterFn);
      }
      return (
          <RcTable
              key="table"
              {...restProps}
              prefixCls={prefixCls}
              data={data}
              columns={columns}
              className={classString}
              emptyText="没数据"
              onChange={handlePageChange}
          />
      );
  }

  render() {
      const { style, className, prefixCls } = this.props;
      const table = this.renderTable();
      return (
          <div
              className={classNames(`${prefixCls}-wrapper`, className)}
              style={style}
          >
              {table}
          </div>
      );
  }
}

Table.propTypes = {
    size: PropTypes.oneOf(['default', 'small', 'large']),
    dataSource: PropTypes.array,
    columns: PropTypes.array,
    rowKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
    ]),
    rowClassName: PropTypes.func,
    bordered: PropTypes.bool,
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func
};

Table.defaultProps = {
    dataSource: [],
    prefixCls: 'yq-table',
    className: '',
    size: 'large',
    rowKey: 'key',
    bordered: false
};
