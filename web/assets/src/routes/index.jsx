import React from 'react';
import ReactDOM from 'react-dom';
import {Router,Route,Redirect, Link, Switch} from 'react-router-dom';
import { createHashHistory } from 'history';
import 'antd/dist/antd.less'
import 'react-virtualized/styles.css'; // only needs to be imported once
import './index.less'
import Login from '@pages/Login/index.jsx'
import Page from '@components/Page/index.jsx'


//import { StdId, Absent, Losing, Objective, Fatal} from '@pages/Abnormal'

var history = createHashHistory();
//loading-component 动态组件加载s
//使用 react-loadable 动态 import React 组件，让首次加载时只加载当前路由匹配的组件。
document.onreadystatechange = function () {
    console.log(document.readyState);
    if(document.readyState === 'complete') {

    }else{

    }
}
ReactDOM.render(
    <Router history={history}>
        <Page>
            <Switch>
                <Route exact path="/login" component={Login} />
                <Route component={Login} />
            </Switch>
        </Page>
    </Router>
    , document.getElementById('root'));

