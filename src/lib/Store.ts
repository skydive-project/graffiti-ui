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

import { Node, Link } from './Topology'

export const SELECT_ELEMENT = 'SELECT_ELEMENT'
export const UNSELECT_ELEMENT = 'UNSELECT_ELEMENT'
export const BUMP_REVISION = 'BUMP_REVISION'
export const OPEN_SESSION = 'OPEN_SESSION'
export const CLOSE_SESSION = 'CLOSE_SESSION'

interface SelectElementAction {
    type: typeof SELECT_ELEMENT
    payload: Node | Link
}

interface UnselectElementAction {
    type: typeof UNSELECT_ELEMENT
    payload: Node | Link
}

interface BumpRevisionAction {
    type: typeof BUMP_REVISION
    payload: string
}

export interface Session {
    endpoint: string
    username: string
    token: string
    permissions: any
    persistent: boolean
}

interface OpenSessionAction {
    type: typeof OPEN_SESSION
    payload: Session
}

interface CloseSessionAction {
    type: typeof CLOSE_SESSION
    payload: null
}

export function selectElement(node: Node | Link): SelectElementAction {
    return {
        type: SELECT_ELEMENT,
        payload: node
    }
}

export function unselectElement(node: Node | Link): UnselectElementAction {
    return {
        type: UNSELECT_ELEMENT,
        payload: node
    }
}

export function bumpRevision(id: string): BumpRevisionAction {
    return {
        type: BUMP_REVISION,
        payload: id
    }
}

export function openSession(endpoint: string, username: string, token: string, permissions: any, persistent: boolean): OpenSessionAction {
    return {
        type: OPEN_SESSION,
        payload: {
            endpoint: endpoint,
            username: username,
            token: token,
            permissions: permissions,
            persistent: persistent
        }
    }
}

export function closeSession(): CloseSessionAction {
    return {
        type: CLOSE_SESSION,
        payload: null
    }
}

export type ActionTypes = SelectElementAction | UnselectElementAction | BumpRevisionAction | OpenSessionAction | CloseSessionAction

const emptySession = {
    endpoint: `${window.location.protocol}//${window.location.hostname}:8082`,
    username: "",
    token: "",
    permissions: {},
    persistent: false
}

const loadSession = (): Session => {
    try {
        const serializedSession = localStorage.getItem('session');
        if (serializedSession === null) {
            return emptySession
        }
        return JSON.parse(serializedSession);
    } catch (err) {
        return emptySession
    }
}

const initialState = {
    selection: new Array<Node | Link>(),
    selectionRevision: 0,
    session: loadSession()
}

export function appReducer(state = initialState, action: ActionTypes) {
    switch (action.type) {
        case SELECT_ELEMENT:
            var selection = state.selection.filter(d => action.payload.id !== d.id)
            selection.push(action.payload)
            return {
                ...state,
                selection: selection
            }
        case UNSELECT_ELEMENT:
            var selection = state.selection.filter(d => action.payload.id !== d.id)
            return {
                ...state,
                selection: selection
            }
        case BUMP_REVISION:
            if (state.selection.some(el => el.id === action.payload)) {
                return {
                    ...state,
                    selectionRevision: state.selectionRevision + 1
                }
            }
            return state
        case OPEN_SESSION:
            if (action.payload.persistent) {
                localStorage.setItem('session', JSON.stringify(action.payload))
            }

            return {
                ...state,
                session: action.payload
            }
        case CLOSE_SESSION:
            localStorage.removeItem('session')

            return {
                ...state,
                session: emptySession
            }
        default:
            return state
    }
}

export type AppState = ReturnType<typeof appReducer>