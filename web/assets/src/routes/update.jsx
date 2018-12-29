import React from 'react';
import ReactDOM from 'react-dom';
import {Router,Route,Redirect, IndexRoute, Switch} from 'react-router-dom';
import { createBrowserHistory, createHashHistory } from 'history';
import 'antd/dist/antd.less'
import './update.less'
import AppUpdate from '@pages/AppUpdate'
var history = createBrowserHistory();

ReactDOM.render(
    <Router history={history}>
        <Switch>
            <Route path="/AppUpdate" component={AppUpdate} />
            <Route component={AppUpdate} />
        </Switch>
    </Router>
    , document.getElementById('update_root'));

