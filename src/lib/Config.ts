/*
 * Copyright (C) 2020 Sylvain Afchain
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

import { App } from './App'
import { Node, Link, NodeAttrs, LinkAttrs } from './Topology'

export interface Filter {
    id: string
    label: string
    gremlin: string
}

export interface MenuItem {
    class: string
    text: string
    disabled: boolean
    callback: () => void
}

export interface GraphField {
    type: string,
    data: any
}

export interface NodeDataField {
    field: string
    title?: string
    expanded: boolean
    icon: string
    iconClass?: string
    sortKeys?: (data: any) => Array<string>
    filterKeys?: (data: any) => Array<string>
    normalizer?: (data: any) => any
    graph?: (data: any) => GraphField
    selectableRows?: string
}

export interface LinkDataField {
    field: string
    title: string
    expanded: boolean
    icon: string
}

export interface Config {
    setApp(app: App)

    subTitle?(subTitle: string): string
    filters?(filters: Array<Filter>): Array<Filter>
    defaultFilter?(): string

    nodeAttrs?(attrs: NodeAttrs | null, node: Node): NodeAttrs
    nodeSortFnc?(a: Node, b: Node): number
    nodeClicked?(node: Node): void
    nodeDblClicked?(node: Node): void

    nodeMenu?(items: Array<MenuItem>, node: Node): Array<MenuItem>
    nodeTags?(tags: Array<string>, data: any): Array<string>

    defaultNodeTag?(): string
    nodeTabTitle?(node: Node): string

    groupSize?(): number
    groupType?(node: Node): string | undefined
    groupName?(node: Node): string | undefined
    weightTitles?(): Map<number, string>

    suggestions?(): Array<string>

    nodeDataFields?(dataFields: Array<NodeDataField>): Array<NodeDataField>

    isParentLink(node1: Node, node2: Node, data: any): boolean
    linkTags?(tags: Array<string>, node1: Node, node2: Node, data: any): Array<string>

    linkAttrs?(attrs: LinkAttrs | null, link: Link): LinkAttrs
    linkTabTitle?(link: Link): string

    linkDataFields?(dataFields: Array<LinkDataField>): Array<LinkDataField>

    defaultLinkTagMode?(): number
}

class ConfigWithID {
    id: string
    config: Config

    constructor(id: string, config: Config) {
        this.id = id
        this.config = config
    }
}

export default class ConfigReducer {

    app: App
    default: DefaultConfig
    configs: Array<ConfigWithID>

    constructor(app: App) {
        this.app = app

        this.default = new DefaultConfig(app)
        this.configs = new Array<ConfigWithID>()
    }

    append(id: string, config: Config) {
        this.configs.push(new ConfigWithID(id, config))
        config.setApp(this.app)
    }

    appendURL(id: string, url: string): Promise<Config | undefined> {
        var promise = new Promise<Config>((resolve, reject) => {
            if (!url) {
                resolve()
                return
            }

            fetch(url).then(resp => {
                resp.text().then(data => {
                    try {
                        var config = eval(data)
                        this.append(id, config)

                        resolve(config)
                    } catch (e) {
                        reject(e)
                    }
                })
            }).catch((reason) => {
                throw Error(reason)
            })
        })

        return promise
    }

    subTitle(): string {
        var subTitle = this.default.subTitle()
        for (let c of this.configs) {
            if (c.config.subTitle) {
                subTitle = c.config.subTitle(subTitle)
            }
        }
        return subTitle
    }

    filters(): Array<Filter> {
        var filters = this.default.filters()
        for (let c of this.configs) {
            if (c.config.filters) {
                filters = c.config.filters(filters)
            }
        }
        return filters
    }

    defaultFilter(): string {
        var defaultFilter = this.default.defaultFilter()
        for (let c of this.configs) {
            if (c.config.defaultFilter) {
                defaultFilter = c.config.defaultFilter()
            }
        }
        return defaultFilter
    }

    nodeAttrs(node: Node): NodeAttrs {
        var attrs = this.default.nodeAttrs(node)
        for (let c of this.configs) {
            if (c.config.nodeAttrs) {
                attrs = c.config.nodeAttrs(attrs, node)
            }
        }
        return attrs
    }

    nodeSortFnc(a: Node, b: Node): number {
        var fnc = this.default.nodeSortFnc.bind(this.default)
        for (let c of this.configs) {
            if (c.config.nodeSortFnc) {
                fnc = c.config.nodeSortFnc.bind(c.config)
            }
        }
        return fnc(a, b)
    }

    nodeClicked(node: Node): void {
        var fnc = this.default.nodeClicked.bind(this.default)
        for (let c of this.configs) {
            if (c.config.nodeClicked) {
                fnc = c.config.nodeClicked.bind(c.config)
            }
        }
        return fnc(node)
    }

    nodeDblClicked(node: Node): void {
        var fnc = this.default.nodeDblClicked.bind(this.default)
        for (let c of this.configs) {
            if (c.config.nodeDblClicked) {
                fnc = c.config.nodeDblClicked.bind(c.config)
            }
        }
        return fnc(node)
    }

    nodeMenu(node: Node): Array<MenuItem> {
        var items = this.default.nodeMenu(node)
        for (let c of this.configs) {
            if (c.config.nodeMenu) {
                items = c.config.nodeMenu(items, node)
            }
        }
        return items
    }

    nodeTags(data: any): Array<string> {
        var tags = this.default.nodeTags(data)
        for (let c of this.configs) {
            if (c.config.nodeTags) {
                tags = c.config.nodeTags(tags, data)
            }
        }
        return tags
    }

    defaultNodeTag(): string {
        var defaultNodeTag = this.default.defaultNodeTag()
        for (let c of this.configs) {
            if (c.config.defaultNodeTag) {
                defaultNodeTag = c.config.defaultNodeTag()
            }
        }
        return defaultNodeTag
    }

    nodeTabTitle(node: Node): string {
        var nodeTabTitle = this.default.nodeTabTitle(node)
        for (let c of this.configs) {
            if (c.config.nodeTabTitle) {
                nodeTabTitle = c.config.nodeTabTitle(node)
            }
        }
        return nodeTabTitle
    }

    groupSize(): number {
        var size = this.default.groupSize()
        for (let c of this.configs) {
            if (c.config.groupSize) {
                size = c.config.groupSize()
            }
        }
        return size
    }

    groupType(node: Node): string | undefined {
        var groupType = this.default.groupType(node)
        for (let c of this.configs) {
            if (c.config.groupType) {
                groupType = c.config.groupType(node)
            }
        }
        return groupType
    }

    groupName(node: Node): string | undefined {
        var groupName = this.default.groupName(node)
        for (let c of this.configs) {
            if (c.config.groupName) {
                groupName = c.config.groupName(node)
            }
        }
        return groupName
    }

    weightTitles(): Map<number, string> {
        var titles = this.default.weightTitles()
        for (let c of this.configs) {
            if (c.config.weightTitles) {
                titles = c.config.weightTitles()
            }
        }
        return titles
    }

    suggestions(): Array<string> {
        var result = this.default.suggestions()
        for (let c of this.configs) {
            if (c.config.suggestions) {
                result = c.config.suggestions()
            }
        }
        return result
    }

    nodeDataFields(): Array<NodeDataField> {
        var fields = this.default.nodeDataFields()
        for (let c of this.configs) {
            if (c.config.nodeDataFields) {
                fields = c.config.nodeDataFields(fields)
            }
        }
        return fields
    }

    isParentLink(node1: Node, node2: Node, data: any): boolean {
        var result = this.default.isParentLink(node1, node2, data)
        for (let c of this.configs) {
            if (c.config.isParentLink) {
                result = c.config.isParentLink(node1, node2, data)
            }
        }
        return result
    }

    linkTags(node1: Node, node2: Node, data: any): Array<string> {
        var tags = this.default.linkTags(node1, node2, data)
        for (let c of this.configs) {
            if (c.config.linkTags) {
                tags = c.config.linkTags(tags, node1, node2, data)
            }
        }
        return tags
    }

    linkAttrs(link: Link): LinkAttrs {
        var attrs = this.default.linkAttrs(link)
        for (let c of this.configs) {
            if (c.config.linkAttrs) {
                attrs = c.config.linkAttrs(attrs, link)
            }
        }
        return attrs
    }

    linkTabTitle(link: Link): string {
        var title = this.default.linkTabTitle(link)
        for (let c of this.configs) {
            if (c.config.linkTabTitle) {
                title = c.config.linkTabTitle(link)
            }
        }
        return title
    }

    linkDataFields(): Array<LinkDataField> {
        var fields = this.default.linkDataFields()
        for (let c of this.configs) {
            if (c.config.linkDataFields) {
                fields = c.config.linkDataFields(fields)
            }
        }
        return fields
    }

    defaultLinkTagMode(): number {
        var size = this.default.defaultLinkTagMode()
        for (let c of this.configs) {
            if (c.config.defaultLinkTagMode) {
                size = c.config.defaultLinkTagMode()
            }
        }
        return size
    }
}

class DefaultConfig {

    app: App

    constructor(app: App) {
        this.app = app
    }

    subTitle(): string {
        return ""
    }

    filters(): Array<Filter> {
        return []
    }

    defaultFilter(): string {
        return 'default'
    }

    nodeAttrs(node: Node): NodeAttrs {
        var name = node.data.Name
        if (name.length > 24) {
            name = node.data.Name.substring(0, 24) + "."
        }

        var attrs = {
            classes: [node.data.Type],
            name: name,
            icon: "\uf192",
            href: '',
            iconClass: '',
            weight: 0,
            badges: []
        }

        return attrs
    }

    nodeSortFnc(a: Node, b: Node): number {
        return a.data.Name.localeCompare(b.data.Name)
    }

    nodeClicked(node: Node): void {
        this.app.tc!.selectNode(node.id)
    }

    nodeDblClicked(node: Node): void {
        this.app.tc!.expand(node)
    }

    nodeMenu(node: Node): Array<MenuItem> {
        return [
            { class: "", text: "Empty", disabled: true, callback: () => { } }
        ]
    }

    nodeTags(node: Node): Array<string> {
        return ['Default']
    }

    defaultNodeTag(): string {
        return 'Default'
    }

    nodeTabTitle(node: Node): string {
        return node.data.Name.substring(0, 8)
    }

    groupSize() {
        return 3
    }

    groupType(node: Node): string | undefined {
        var nodeType = node.data.Type
        if (!nodeType) {
            return
        }

        return nodeType
    }

    groupName(node: Node): string | undefined {
        var nodeType = this.groupType(node)
        if (!nodeType) {
            return
        }

        return nodeType + "(s)"
    }

    weightTitles(): Map<number, string> {
        var wt = new Map<number, string>()
        wt.set(0, 'Common')
        return wt
    }

    suggestions(): Array<string> {
        return [
            "data.Name"
        ]
    }

    nodeDataFields(): Array<NodeDataField> {
        return [
            {
                field: "",
                title: "General",
                expanded: true,
                icon: "\uf05a",
                sortKeys: (data: any): Array<string> => {
                    return ['Name']
                },
                filterKeys: (data: any): Array<string> => {
                    switch (data.Type) {
                        default:
                            return ['Name']
                    }
                }
            }
        ]
    }

    isParentLink(node1: Node, node2: Node, data: any): boolean {
        return data.RelationType === "ownership"
    }

    linkTags(node1: Node, node2: Node, data: any): Array<string> {
        if (data.RelationType) {
            return [data.RelationType]
        }
        return []
    }

    linkAttrs(link: Link): LinkAttrs {
        var attrs = {
            classes: [link.data!.RelationType],
            icon: "\uf362",
            directed: false,
            href: '',
            iconClass: '',
            label: ''
        }

        if (link.data.Directed) {
            attrs.directed = true
        }

        return attrs
    }

    linkTabTitle(link: Link): string {
        var src = link.source.data.Name
        var dst = link.target.data.Name
        if (src && dst) {
            return src.substring(0, 8) + " / " + dst.substring(0, 8)
        }
        return link.id.split("-")[0]
    }

    linkDataFields(): Array<LinkDataField> {
        return [
            {
                field: "",
                title: "General",
                expanded: true,
                icon: "\uf05a",
            }
        ]
    }

    defaultLinkTagMode(): number {
        return 2
    }
}
