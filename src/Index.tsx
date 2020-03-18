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

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import { SnackbarProvider } from 'notistack'
import '@fortawesome/fontawesome-free/css/all.css'
import { Provider, connect } from 'react-redux'
import { createBrowserHistory } from 'history'
import { BrowserRouter, Route, Redirect, Switch, withRouter } from 'react-router-dom'

import './Index.css'
import { AppState } from './lib/Store'
import { store } from './Store'
import Login from './lib/Login'
import App from './lib/App'
import GremlinButton from './lib/ActionButtons/Gremlin'
import GremlinPanel from './lib/DataPanels/Gremlin'
import { Node, Link } from './lib/Topology'

import Logo from '../assets/logo.png'
import LogoLarge from '../assets/logo-large.png'

const queryString = require('query-string')

// from options
declare var baseURL: string

const history = createBrowserHistory()

export const mapStateToProps = (state: AppState) => ({
  session: state.session
})

export const mapDispatchToProps = ({
})

const PrivateRoute = connect(mapStateToProps, mapDispatchToProps)(({ component, session, ...props }: any) => {
  const routeComponent = (props: any) => (
    session.endpoint
      ? React.createElement(component, props)
      : <Redirect to={{ pathname: '/login' }} />
  )
  return <Route {...props} render={routeComponent} />
})

interface LoginProps {
  location: any
  history: any
}

class GraffitiLogin extends React.Component<LoginProps> {

  constructor(props: LoginProps) {
    super(props)
  }

  onLogged() {
    var from = "/"
    if (this.props.location.state && this.props.location.state.from !== "/login") {
      from = this.props.location.state.from
    }
    this.props.history.push(from)
  }

  render() {
    return (
      <Login logo={<img src={LogoLarge} alt="graffiti" />} onLogged={this.onLogged.bind(this)} />
    )
  }
}


interface Props {
  location: any
  history: any
}

interface State {
  isGremlinPanelOpen: boolean
}

class GraffitiApp extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)

    this.state = {
      isGremlinPanelOpen: false
    }
  }

  actionButtons(el: Node | Link): JSX.Element {
    return (
      <React.Fragment>
        <GremlinButton el={el} onClick={() => { this.setState({ isGremlinPanelOpen: !this.state.isGremlinPanelOpen }) }} />
      </React.Fragment>
    )
  }

  dataPanels(el: Node | Link): JSX.Element {
    return (
      <React.Fragment>
        <GremlinPanel el={el} expanded={this.state.isGremlinPanelOpen} />
      </React.Fragment>
    )
  }

  onLogout() {
    this.props.history.push("/login")
  }

  render() {
    const parsed = queryString.parse(this.props.location.search)
    return <App configURL={parsed.config} dataURL={parsed.data} logo={<img src={Logo} alt="graffiti" />}
      dataPanels={this.dataPanels.bind(this)} actionButtons={this.actionButtons.bind(this)} onLogout={this.onLogout.bind(this)} />
  }
}

ReactDOM.render(
  <Provider store={store}>
    <SnackbarProvider>
      <BrowserRouter history={history} basename={baseURL || ""}>
        <Switch>
          <PrivateRoute path="/" component={withRouter(GraffitiApp)} exact />
          <Route path="/login" component={withRouter(GraffitiLogin)} />
          <Redirect from="*" to={(baseURL || "/") + history.location.search} />
        </Switch>
      </BrowserRouter>
    </SnackbarProvider>
  </Provider>,
  document.getElementById('index')
)