import * as React from 'react'
import { User, InviteUserViewState, OrganizationUser } from '../../../../../types';
import { Button, Icon, Alert, Tooltip } from 'antd';
import UserComponent from '../../../../User'
import * as orgModel from '../../../../../data/models/organization/model'
import * as userModel from '../../../../../data/models/user'
import MainMenu from '../../../../menu/component'
import UserEntityComponent from '../../../../entities/UserWrappedContainer'
import './component.css'
import Avatar from '../../../../entities/Avatar';

export interface InviteUserProps {
    organization: orgModel.Organization,
    selectedUser: {
        user: User,
        relation: orgModel.UserRelationToOrganization
    } | null
    editState: InviteUserViewState,
    users: Array<OrganizationUser> | null
    onSearchUsers: (query: userModel.UserQuery) => void,
    onSelectUser: (username: string) => void,
    onSendInvitation: () => void
    onFinish: () => void
}

interface InviteUserState {
    autocompleteMessage: string
}
class InviteUser extends React.Component<InviteUserProps, InviteUserState> {

    lastSearchAt: Date | null

    static searchDebounce: number = 200

    searchInput: React.RefObject<HTMLInputElement>
    searchButton: React.RefObject<Button>

    constructor(props: InviteUserProps) {
        super(props)

        this.lastSearchAt = null
        this.searchInput = React.createRef()
        this.searchButton = React.createRef()

        this.state = {
            autocompleteMessage: ''
        }
    }

    onClickCancelToViewer() {
        this.props.onFinish()
    }

    onSendInvitation() {
        this.props.onSendInvitation()
    }

    canSave() {
        if (this.props.selectedUser) {
            return true
        }
        return false
    }

    onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        let currentSearchInputValue;
        if (this.searchInput.current) {
            currentSearchInputValue = this.searchInput.current.value
        } else {
            currentSearchInputValue = ''
        }
        this.doSearchUsers(currentSearchInputValue)
    }

    onSearchInputChange() {
        let currentSearchInputValue;
        if (this.searchInput.current) {
            currentSearchInputValue = this.searchInput.current.value
        } else {
            currentSearchInputValue = ''
        }
        // this.doSearchUsers(currentSearchInputValue)
    }

    doSearchUsers(value: string) {
        // if (value.length < 3) {
        //     this.setState({ autocompleteMessage: 'Search begins after 3 or more characters' })
        //     return
        // }
        // this.setState({ autocompleteMessage: '' })
        // build up list of users already owning, members of, or with membership pending.
        const excludedUsers: Array<string> = []

        if (this.lastSearchAt === null ||
            (new Date().getTime() - this.lastSearchAt.getTime() > InviteUser.searchDebounce)) {
            this.lastSearchAt = new Date()
            this.props.onSearchUsers({
                query: value,
                excludedUsers: []
            })
        }
    }

    onSelectUser(user: OrganizationUser) {
        this.props.onSelectUser(user.username);
    }

    renderOrgName(name: string) {
        const maxLength = 25
        if (name.length < 25) {
            return name
        }
        return (
            <span>
                {name.slice(0, 25)}
                …
            </span>
        )
    }

    renderUsers() {
        if (!this.props.users) {
            const message = 'Search for users by name or username to display a list of available users in this space.'
            return (
                <Alert type="info" message={message} showIcon />
            )
        }
        if (this.props.users.length === 0) {
            return (
                <Alert type="warning" message="No users found" showIcon />
            )
        }
        const renderUser = (user: userModel.User) => {
            const tooltip = (
                <UserComponent user={user} avatarSize={30} />
            )
            return (
                <Tooltip title={tooltip}>
                    <div className="name">
                        <Avatar user={user} size={20} /> {user.realname} ({user.username})
                    </div>
                </Tooltip>
            )
        }
        return this.props.users.map((user) => {
            if (user.relation === orgModel.UserRelationToOrganization.NONE) {
                return (
                    <div
                        className="user notInOrganization "
                        key={user.username}
                        onClick={() => { this.onSelectUser.call(this, user) }}>
                        <UserEntityComponent userId={user.username} render={renderUser} />
                    </div>
                )
            } else {
                return (
                    <div
                        className="user inOrganization"
                        key={user.username}
                        onClick={() => { this.onSelectUser.call(this, user) }}>
                        <UserEntityComponent userId={user.username} render={renderUser} />
                    </div>
                )
            }
        })
    }

    renderOrgInfo() {
        return (
            <div className="orgInfo">
                <div className="name">
                    <span className="field-label">name</span>
                    <span>{this.props.organization.name}</span>
                </div>
                <div className="description">
                    <span className="field-label">description</span>
                    <span>{this.props.organization.description}</span>
                </div>
            </div>
        )
    }

    renderInvitationForm() {
        let button
        let message
        if (this.props.selectedUser) {
            if (this.props.selectedUser.relation === orgModel.UserRelationToOrganization.VIEW) {
                button = (
                    <Button
                        type="primary"
                        onClick={this.onSendInvitation.bind(this)}>Send Invitation</Button>
                )
            } else {
                button = (
                    <Button
                        disabled
                        type="primary"
                    >Send Invitation</Button>
                )
                // message = 'User is a member of this organization'
                message = (
                    <div>
                        User may not be invited because:<br />
                        {this.renderRelation(this.props.selectedUser.relation)}
                    </div>
                )
                message = (
                    <Alert
                        type="warning"
                        message={message}
                        showIcon
                    />
                )
            }
        } else {
            button = (
                <Button
                    disabled
                    type="primary"
                >Send Invitation</Button>
            )
            message = 'Please select a user'
        }
        return (
            <div className="invitationForm">
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    {button}
                </div>
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    {message}
                </div>
            </div>
        )
    }

    renderInvitationStatus() {
        switch (this.props.editState) {
            case InviteUserViewState.NONE:
                return (
                    <div>NONE</div>
                )
            case InviteUserViewState.EDITING:
                return (
                    <div>EDITING</div>
                )
            case InviteUserViewState.SENDABLE:
                return (
                    <div>SENDABLE</div>
                )
            case InviteUserViewState.SENDING:
                return (
                    <div>SENDING</div>
                )
            case InviteUserViewState.SUCCESS:
                return (
                    <div>SENT SUCCESSFULLY</div>
                )
            case InviteUserViewState.ERROR:
                return (
                    <div>ERROR SENDING</div>
                )
            default:
                return (
                    <div>Bad State</div>
                )
        }
    }

    renderRelation(relation: orgModel.UserRelationToOrganization) {
        switch (relation) {
            case (orgModel.UserRelationToOrganization.NONE):
                return (
                    <span><Icon type="stop" />None</span>
                )
            case (orgModel.UserRelationToOrganization.VIEW):
                return (
                    <span><Icon type="stop" /> Not a member</span>
                )
            case (orgModel.UserRelationToOrganization.MEMBER_REQUEST_PENDING):
                return (<span><Icon type="user" style={{ color: 'orange' }} /> User's membership <b>request</b> is pending</span>)
            case (orgModel.UserRelationToOrganization.MEMBER_INVITATION_PENDING):
                return (<span><Icon type="user" style={{ color: 'blue' }} /> User has been <b>invited</b> to join</span>)
            case (orgModel.UserRelationToOrganization.MEMBER):
                return (<span><Icon type="user" /> User is a <b>member</b> of this organization</span>)
            case (orgModel.UserRelationToOrganization.ADMIN):
                return (<span><Icon type="unlock" />User is an <b>admin</b> of this organization</span>)
            case (orgModel.UserRelationToOrganization.OWNER):
                return (

                    <span><Icon type="crown" /> User is the <b>owner</b> of this Organization</span>
                )
        }
    }

    renderSelectedUser() {
        if (this.props.selectedUser === null) {
            return (
                <div className="selectedUser">
                    <p className="noSelection">
                        No user yet selected
                    </p>
                </div>
            )
        } else {
            return (
                <div className="selectedUser">
                    <UserComponent user={this.props.selectedUser.user} />
                    {this.renderRelation(this.props.selectedUser.relation)}
                </div>
            )
        }
    }

    renderFooter() {
        return (
            <div className="footer">
            </div>
        )
    }

    renderSearchButton() {
        return (<Icon type="search" />)
    }

    renderMenuButtons() {
        return (
            <div className="ButtonSet">
                <div className="ButtonSet-button">
                    <Button icon="rollback"
                        type="danger"
                        onClick={this.onClickCancelToViewer.bind(this)}>
                        Done
                    </Button>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="InviteUser scrollable-flex-column">
                <MainMenu buttons={this.renderMenuButtons()} />
                <div className="row scrollable-flex-column">
                    <div className="col1 firstCol users scrollable-flex-column">
                        <h3>Select User to Invite</h3>
                        <form id="searchForm" className="searchBar"
                            onSubmit={this.onSubmit.bind(this)}>
                            <input
                                ref={this.searchInput}
                                autoFocus
                                onChange={this.onSearchInputChange.bind(this)}
                                placeholder="Search for a user"
                            />
                            <Button
                                className="searchButton"
                                form="searchForm"
                                key="submit"
                                htmlType="submit"
                            >
                                {this.renderSearchButton()}
                            </Button>
                        </form>
                        <div className="usersTable">
                            {this.renderUsers()}
                        </div>
                    </div>
                    <div className="col1 lastCol">
                        <h3>Selected User</h3>
                        {this.renderSelectedUser()}
                        {this.renderInvitationForm()}
                    </div>
                </div>

                {this.renderFooter()}
            </div>
        )
    }
}

export default InviteUser