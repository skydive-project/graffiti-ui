/*
 * Copyright (C) 2019 Sylvain Afchain
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import * as React from 'react'
import MUIDataTable from 'mui-datatables'
import TableRow from "@material-ui/core/TableRow"
import TableCell from "@material-ui/core/TableCell"
import { Chart } from 'react-google-charts'
import JSONTree from 'react-json-tree'
import FilterNoneIcon from '@material-ui/icons/FilterNone'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'

import { Column, Graph } from './DataViewerNormalizer'
import './DataViewer.css'

interface Props {
    title?: string
    columns: Array<Column>
    data: Array<Array<any>>
    graph?: Graph
    details: Map<number, any>
    filterKeys?: Array<string>
    onFilterReset?: () => void
    defaultColumns?: Array<string>
    selectableRows?: string
    onDeleted?: (deleted: Array<Map<string, any>>) => boolean
}

interface State {
    sortField: string
    sortDirection: string
    filterList: Map<string, Array<any>>
    graph?: Graph
    rowsExpanded: Array<number>
    defaultColumns?: Array<string>
    rowsSelected: Array<number>
}

export class DataViewer extends React.Component<Props, State> {

    state: State
    applyDefaultColumns: boolean

    constructor(props: Props) {
        super(props)

        this.applyDefaultColumns = true

        this.state = {
            sortField: "",
            sortDirection: "none",
            filterList: new Map<string, Array<any>>(),
            rowsExpanded: new Array<number>(),
            rowsSelected: new Array<number>()
        }
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        if (props.defaultColumns) {
            state.defaultColumns = props.defaultColumns
        }

        if (props.graph) {
            var graph = props.graph
            if (state.graph) {
                graph.data = state.graph.data.concat(graph.data.slice(1))
            }
            state.graph = graph
        }

        return state
    }

    private resetFilter() {
        this.setState({ filterList: new Map<string, Array<any>>() })

        if (this.props.onFilterReset) {
            this.props.onFilterReset()
        }
    }

    render() {
        const options = {
            filterType: 'multiselect',
            selectableRows: this.props.selectableRows,
            responsive: 'stacked',
            print: false,
            download: false,
            customToolbar: () => {
                return (
                    <Tooltip title="Apply default filters" aria-label="Apply default filters">
                        <IconButton onClick={this.resetFilter.bind(this)}>
                            <FilterNoneIcon />
                        </IconButton>
                    </Tooltip>
                )
            },
            setRowProps: (row: any, dataIndex: number) => {
                if (!this.props.details.get(dataIndex)) {
                    return { "className": "not-expandable" }
                }
                return {}
            },
            expandableRows: true,
            expandableRowsOnClick: true,
            isRowExpandable: (dataIndex: number, expandedRows: any) => {
                if (this.props.details.get(dataIndex)) {
                    return true
                }
                return false
            },
            renderExpandableRow: (rowData: any, rowMeta: any) => {
                const colSpan = rowData.length
                return (
                    <TableRow>
                        <TableCell />
                        <TableCell colSpan={colSpan}>
                            <JSONTree data={this.props.details.get(rowMeta.dataIndex)} theme="bright"
                                invertTheme={true} sortObjectKeys={true} hideRoot={true} />
                        </TableCell>
                    </TableRow>
                )
            },
            rowsExpanded: this.state.rowsExpanded,
            onRowsDelete: (rows: { data: Array<{ index: number, dataIndex: number }> }): void | boolean => {
                if (!this.props.onDeleted) {
                    return true
                }

                var deleted = new Array<Map<string, any>>()

                for (let a of rows.data) {
                    if (a.dataIndex < this.props.data.length) {
                        let entry = new Map<string, any>()
                        let data = this.props.data[a.dataIndex]
                        this.props.columns.forEach((column: Column, i: number) => {
                            entry[column.name] = data[i]
                        })
                        deleted.push(entry)
                    }
                }

                return this.props.onDeleted(deleted)
            },
            rowsSelected: this.state.rowsSelected,
            onRowsSelect: (currentRowsSelected: any, allRowsSelected: Array<{ index: number, dataIndex: number }>): void => {
                var selected = new Array<number>()
                for (let a of allRowsSelected) {
                    selected.push(a.dataIndex)
                }
                this.setState({ rowsSelected: selected })
            },
            onRowsExpand: (currentRowsExpanded: any, allRowsExpanded: any) => {
                this.setState({ rowsExpanded: allRowsExpanded.map((entry: any) => entry.dataIndex) })
            },
            onColumnSortChange: (field: string, direction: string) => {
                this.setState({ sortField: field, sortDirection: direction })
            },
            onColumnViewChange: (column: string, action: string) => {
            },
            onFilterChange: (field: string, filterList: Array<any>) => {
                var newList = new Array<any>()

                filterList.forEach((a: Array<any>) => {
                    if (a.length) {
                        newList = newList.concat(a)
                    }
                })

                this.state.filterList.set(field, newList)
                this.setState({ filterList: this.state.filterList })
            },
        };

        // re-apply sort and filter if need
        for (let column of this.props.columns) {
            if (column.name === this.state.sortField && this.state.sortDirection) {
                switch (this.state.sortDirection) {
                    case "ascending":
                        column.options.sortDirection = "asc"
                        break
                    case "descending":
                        column.options.sortDirection = "desc"
                        break
                    default:
                        column.options.sortDirection = "none"
                        break
                }
            }

            if (this.applyDefaultColumns && this.props.defaultColumns) {
                if (!this.props.defaultColumns.includes(column.name)) {
                    column.options.display = 'false'
                }
            }

            // use value from config first
            if (column.name === "Key" && this.props.filterKeys) {
                column.options.filterList = this.props.filterKeys
            }

            let filterList = this.state.filterList.get(column.name)
            if (filterList) {
                column.options.filterList = filterList
            }
        }
        this.applyDefaultColumns = false

        return (
            <React.Fragment>
                <MUIDataTable
                    title={this.props.title}
                    data={this.props.data}
                    columns={this.props.columns}
                    options={options} />
                {
                    this.state.graph &&
                    <Chart
                        height={300}
                        chartType={this.state.graph.type}
                        loader={<div>Loading Chart</div>}
                        data={this.state.graph.data}
                        options={{
                            chart: {
                            },
                        }}
                    />
                }
            </React.Fragment>
        )
    }
}