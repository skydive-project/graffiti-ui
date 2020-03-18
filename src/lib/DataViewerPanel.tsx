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

import * as React from "react"
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import { DataViewer } from './DataViewer'
import { DataViewerNormalizer, Result, Graph } from './DataViewerNormalizer'
import { styles } from './DataViewerPanelStyles'
import './DataViewerPanel.css'

interface Props {
    title: string
    icon?: string
    iconClass?: string
    data: any
    classes: any
    defaultExpanded?: boolean
    normalizer?: (data: any) => any
    graph?: (data: any) => Graph
    exclude?: Array<string>
    sortKeys?: Array<string>
    filterKeys?: Array<string>
    defaultColumns?: Array<string>
    selectableRows?: string
    onDeleted?: (deleted: Array<Map<string, any>>) => boolean
}

interface State {
    isExpanded: boolean
    data: Result
    filterKeys?: Array<string>
    columns?: Array<string>
}

class DataViewerPanel extends React.Component<Props, State> {

    state: State

    constructor(props: Props) {
        super(props)

        this.state = {
            isExpanded: props.defaultExpanded || false,
            data: DataViewerPanel.normalizeData(props.data, props.normalizer),
            filterKeys: DataViewerPanel.normalizeFilterKeys(props.data, props.filterKeys),
            columns: props.defaultColumns || [],
        }
    }

    static normalizeData(data: any, normalizer?: (data: any) => any, graph?: (data: any) => Graph, exclude?: Array<string>, sortKeys?: Array<string>): Result {
        var dataNormalizer = new DataViewerNormalizer(normalizer, graph, exclude, sortKeys)
        return dataNormalizer.normalize(data)
    }

    static normalizeFilterKeys(data: any, filterKeys: Array<string> | undefined): Array<string> | undefined {
        if (!filterKeys) {
            return
        }
        return filterKeys.filter(key => Boolean(data[key]))
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        if (state.isExpanded) {
            return {
                data: DataViewerPanel.normalizeData(props.data, props.normalizer, props.graph, props.exclude, props.sortKeys),
                filterKeys: DataViewerPanel.normalizeFilterKeys(props.data, props.filterKeys)
            }
        }
        return null
    }

    private onExpandChange(event: object, expanded: boolean) {
        this.setState({ isExpanded: expanded })
    }

    private onFilterReset() {
        this.setState(
            {
                data: DataViewerPanel.normalizeData(this.state.data, this.props.normalizer, this.props.graph, this.props.exclude, this.props.sortKeys),
                filterKeys: DataViewerPanel.normalizeFilterKeys(this.state.data, this.props.filterKeys),
            }
        )
    }

    render() {
        const { classes } = this.props

        const iconClass = this.props.iconClass === "font-brands" ? classes.panelIconBrands : classes.panelIconFree

        return (
            <ExpansionPanel defaultExpanded={this.props.defaultExpanded} onChange={this.onExpandChange.bind(this)}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header">
                    <Typography className={iconClass}>{this.props.icon}</Typography>
                    <Typography>{this.props.title}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    {
                        this.state.data.rows.length && this.state.isExpanded &&
                        (
                            <DataViewer
                                columns={this.state.data.columns}
                                data={this.state.data.rows}
                                filterKeys={this.state.filterKeys}
                                graph={this.state.data.graph}
                                details={this.state.data.details}
                                onFilterReset={this.onFilterReset.bind(this)}
                                defaultColumns={this.props.defaultColumns}
                                selectableRows={this.props.selectableRows}
                                onDeleted={this.props.onDeleted} />
                        )
                    }
                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }
}

export default withStyles(styles)(DataViewerPanel)