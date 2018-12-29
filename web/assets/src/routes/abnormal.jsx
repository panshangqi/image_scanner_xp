import React from 'react';
import ReactDOM from 'react-dom';
import {Router,Route,Redirect, Link, Switch} from 'react-router-dom';
import { createHashHistory } from 'history';
import 'antd/dist/antd.less'
import 'react-virtualized/styles.css'; // only needs to be imported once
import './index.less'

import Page from '@components/Page/index.jsx'
import SubPage from '@components/SubPage'
import Normal from '@pages/Normal'
import Home from '@pages/Home'

import { StdId, Absent, Losing, Objective, Fatal} from '@pages/Abnormal'

var history = createHashHistory();
//loading-component 动态组件加载
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
            <SubPage>
                <Switch>
                    <Route path="/home" component={Home} />
                    <Route path="/abnormal/:abnormal_id/student" component={StdId} />
                    <Route path="/abnormal/:abnormal_id/absent" component={Absent} />
                    <Route path="/abnormal/:abnormal_id/losing" component={Losing} />
                    <Route path="/abnormal/:abnormal_id/objective" component={Objective} />
                    <Route path="/abnormal/:abnormal_id/fatal" component={Fatal} />
                    <Route path="/normal" component={Normal} />
                    <Route component={Home} />
                </Switch>
            </SubPage>
        </Page>
    </Router>
    , document.getElementById('root_abnormal'));

