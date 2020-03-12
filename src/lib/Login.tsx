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
import { connect } from 'react-redux'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

import { AppState, openSession, Session } from './Store'
import { styles } from './LoginStyles'
import { Configuration } from './api/configuration'
import { LoginApi } from './api'

interface Props {
    classes: any
    logo?: JSX.Element
    onLogged?: () => void

    openSession: typeof openSession
    session: Session
}

interface State {
    endpoint: string
    username: string
    password: string
    submitted: boolean
    failure: boolean
    persistent: boolean
}

class Login extends React.Component<Props, State> {

    state: State

    constructor(props: Props) {
        super(props)

        this.state = {
            endpoint: this.props.session.endpoint,
            username: "",
            password: "",
            submitted: false,
            failure: false,
            persistent: false
        }
    }

    handleChange(e: any) {
        const { name, value } = e.target;
        switch (name) {
            case "endpoint":
                this.setState({ endpoint: value })
                break
            case "username":
                this.setState({ username: value })
                break
            case "password":
                this.setState({ password: value })
                break
            case "persistent":
                this.setState({ persistent: Boolean(value) })
                break
        }
    }

    handleSubmit(e: any) {
        e.preventDefault();

        this.setState({ submitted: true })

        if (!this.state.username || !this.state.password) {
            return
        }

        var endpoint = this.state.endpoint || this.props.session.endpoint

        var conf = new Configuration({ basePath: endpoint })
        var api = new LoginApi(conf)

        api.login(this.state.username, this.state.password)
            .catch(() => {
                this.setState({ failure: true })
            })
            .then(response => {
                if (response) {
                    this.setState({ failure: false })
                    return response.json()
                } else {
                    this.setState({ failure: true })
                }
            })
            .then(data => {
                if (data) {
                    this.props.openSession(endpoint, this.state.username, data.Token, data.Permissions, this.state.persistent)

                    if (this.props.onLogged) {
                        this.props.onLogged()
                    }
                }
            })
    }

    render() {
        const { classes } = this.props

        return (
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <div className={classes.logo}>

                    <Typography className={classes.logoTitle} variant="h3" component="h3">
                        {this.props.logo}
                    </Typography>
                </div>
                <div className={classes.paper}>
                    {this.state.failure &&
                        <React.Fragment>
                            <div className={classes.failure}>Login failure</div>
                            <div className={classes.failure}>bad Endpoint, Username or Password</div>
                        </React.Fragment>
                    }
                    <form className={classes.form} noValidate onSubmit={this.handleSubmit.bind(this)}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="endpoint"
                            label="Endpoint"
                            name="endpoint"
                            autoComplete="endpoint"
                            autoFocus
                            value={this.state.endpoint}
                            onChange={this.handleChange.bind(this)}
                        />
                        {this.state.submitted && !this.state.endpoint &&
                            <div className={classes.error}>Endpoint is required</div>
                        }
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={this.state.username}
                            onChange={this.handleChange.bind(this)}
                        />
                        {this.state.submitted && !this.state.username &&
                            <div className={classes.error}>Username is required</div>
                        }
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={this.state.password}
                            onChange={this.handleChange.bind(this)}
                        />
                        {this.state.submitted && !this.state.password &&
                            <div className={classes.error}>Password is required</div>
                        }
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                            name="persistent"
                            value={true}
                            onChange={this.handleChange.bind(this)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Sign In
                        </Button>
                    </form>
                </div>
            </Container>
        )
    }
}

export const mapStateToProps = (state: AppState) => ({
    session: state.session
})

export const mapDispatchToProps = ({
    openSession
})

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Login))