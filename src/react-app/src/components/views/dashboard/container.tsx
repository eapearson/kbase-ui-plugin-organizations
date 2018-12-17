import { Dispatch } from 'redux'
import { connect } from 'react-redux'

import Dashboard from './component'
import { StoreState, DashboardViewModel } from '../../../types';
import * as actions from '../../../redux/actions/dashboard';
import * as userModel from '../../../data/models/user'


export interface OwnProps {

}

interface StateProps {
    viewModel: DashboardViewModel
    currentUser: userModel.Username
}

interface DispatchProps {

}

function mapStateToProps(state: StoreState, props: OwnProps): StateProps {
    const view = state.views.dashboardView
    const currentUser = state.auth.authorization.username
    if (view.viewModel === null) {
        throw new Error('view model is null!')
    }
    return {
        viewModel: view.viewModel,
        currentUser
    }
}

function mapDispatchToProps(dispatch: Dispatch<actions.DashboardAction>): DispatchProps {
    return {

    }
}

export default connect<StateProps, DispatchProps, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(Dashboard)