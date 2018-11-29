import { string, number } from "prop-types";
import { request } from "http";

export interface GroupsServiceInfo {
    servname: string;
    version: string;
    servertime: number;
    gitcommithash: string
}

export interface BriefGroup {
    id: string;
    name: string;
    custom: {
        gravatarhash?: string
    }
    owner: string;
    type: string;
    // createdAt: number;
    // modifiedAt: number
}

export type GroupList = Array<BriefGroup>

export type Username = string;

export interface WorkspaceInfo {
    rid: string
    name: string
    narrname: string
    public: boolean
    perm: string
}

export interface AppInfo {
    rid: string
}

export interface Group {
    id: string
    name: string
    owner: Username
    type: string
    admins: Array<Username>
    members: Array<Username>
    description: string
    createdate: number
    moddate: number
    resources: {
        workspace: Array<WorkspaceInfo>,
        catalogmethod: Array<AppInfo>
    }
    custom: {
        gravatarhash?: string
    }
}

export interface NewGroup {
    id: string
    name: string
    gravatarhash: string | null
    type: string
    description: string
}

export interface GroupUpdate {
    name: string
    gravatarhash: string | null
    description: string
}

export interface Request {
    id: string
    groupid: string
    requester: Username
    type: string
    status: string
    resource: string
    resourcetype: string
    createdate: number
    expiredate: number
    moddate: number
}

export interface RequestWithCompletion extends Request {
    complete: false
}

export interface Completion {
    complete: true
}

export interface ErrorInfo {
    appcode: number
    apperror: string
    callid: string
    httpcode: number
    httpstatus: string
    message: string
    time: number
}

export interface ErrorResult {
    error: ErrorInfo
}

// Error types: (appcode)
// 10000	Authentication failed
// 10010	No authentication token
// 10020	Invalid token
// 20000	Unauthorized
// 30000	Missing input parameter
// 30001	Illegal input parameter
// 30010	Illegal user name
// 40000	Group already exists
// 40010	Request already exists
// 40020	User already group member
// 40030	Workspace already in group
// 50000	No such group
// 50010	No such request
// 50020	No such user
// 50030	No such workspace
// 60000	Unsupported operation

export interface GroupExists {
    exists: boolean
}

// export interface GroupRequest {
//     id: string,
//     groupid: string,
//     requester: Username,
//     type: string,
//     status: string,
//     resource: string
//     resourcetype: string
//     createdate: number,
//     expiredate: number,
//     moddate: number
// }

export enum SortDirection {
    ASCENDING = 0,
    DESCENDING
}

export interface GetRequestsParams {
    includeClosed?: boolean,
    sortDirection?: SortDirection,
    startAt?: Date
}

export interface RequestMemebershipParams {
    groupId: string
}

export interface RequestNarrativeParams {
    workspaceId: number
    groupId: string
}

export class GroupsClient {
    token: string;
    url: string;

    constructor({ token, url }: { token: string, url: string }) {
        this.token = token
        this.url = url
    }

    getInfo(): Promise<GroupsServiceInfo> {
        return fetch(this.url + '/', {
            headers: {
                Authorization: this.token,
                Accept: 'application/json'
            },
            mode: 'cors'
        })
            .then((response) => {
                return response.json();
            })
            .then((result) => {
                return result as GroupsServiceInfo;
            });
    }

    groupExists(id: string): Promise<GroupExists> {
        return fetch(this.url + '/group/' + id + '/exists')
            .then((response) => {
                return response.json()
            })
            .then((exists) => {
                return exists as GroupExists
            })
    }

    // getGroups(): Promise<GroupList> {
    //     return fetch(this.url + '/group', {
    //         headers: {
    //             Authorization: this.token,
    //             Accept: 'application/json'
    //         },
    //         mode: 'cors'
    //     })
    //         .then((response) => {
    //             return response.json()
    //         })
    //         .then((result: GroupList) => {
    //             return result.filter(({ type }) => type === 'Organization')
    //         })
    // }


    getGroups(): Promise<Array<Group>> {
        let start = new Date().getTime()
        return fetch(this.url + '/group', {
            headers: {
                Authorization: this.token,
                Accept: 'application/json'
            },
            mode: 'cors'
        })
            .then((response) => {
                if (response.status !== 200) {
                    console.error('error fetching groups', response)
                    throw new Error('Error fetching groups')
                }
                return response.json()
            })
            .then((result: GroupList) => {
                const orgs = result.filter(({ type }) => type === 'Organization')
                return Promise.all(orgs.map((group) => (this.getGroupById(group.id))))
            })
            .then((result) => {
                return result;
            })
    }

    getGroupById(id: string): Promise<Group> {
        return fetch(this.url + '/group/' + id, {
            headers: {
                Authorization: this.token,
                Accept: 'application/json'
            },
            mode: 'cors'
        })
            .then((response) => {
                if (response.status === 404) {
                    return null
                }
                return response.json()
            })
            .then((result) => {
                return result as Group
            })
    }

    createGroup(newGroup: NewGroup): Promise<Group> {
        return fetch(this.url + '/group/' + newGroup.id, {
            headers: {
                Authorization: this.token,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            method: 'PUT',
            body: JSON.stringify({
                name: newGroup.name,
                custom: {
                    gravatarhash: newGroup.gravatarhash
                },
                type: newGroup.type,
                description: newGroup.description
            })
        })
            .then((response) => {
                return response.json()
            })
            .then((result) => {
                return result as Group
            })
    }

    updateGroup(id: string, groupUpdate: GroupUpdate): Promise<void> {
        return fetch(this.url + '/group/' + id + '/update', {
            headers: {
                Authorization: this.token,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            method: 'PUT',

            // TODO: build more intelligently
            body: JSON.stringify({
                name: groupUpdate.name,
                custom: {
                    gravatarhash: groupUpdate.gravatarhash
                },
                type: 'Organization',
                description: groupUpdate.description
            })
        })
            .then((response) => {
                // response is an empty body.
                if (response.status === 204) {
                    return
                }
                throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText)
            })
    }

    getGroupRequests(groupId: string, params: GetRequestsParams): Promise<Array<Request>> {
        const query = new URLSearchParams()
        if (params.includeClosed) {
            query.append('closed', 'closed')
        }
        if (params.sortDirection) {
            if (params.sortDirection === SortDirection.DESCENDING) {
                query.append('order', 'desc')
            } else {
                query.append('order', 'asc')
            }
        }
        if (params.startAt) {
            query.append('excludeupto', String(params.startAt.getTime()))
        }

        return fetch(this.url + '/group/' + groupId + '/requests?' + params.toString(), {
            headers: {
                Authorization: this.token,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            method: 'GET'
        })
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText)
                }
                return response.json()
            })
    }

    getTargetedRequests(params: GetRequestsParams): Promise<Array<Request>> {
        const query = new URLSearchParams()
        if (params.includeClosed) {
            query.append('closed', 'closed')
        }
        if (params.sortDirection) {
            if (params.sortDirection === SortDirection.DESCENDING) {
                query.append('order', 'desc')
            } else {
                query.append('order', 'asc')
            }
        }
        if (params.startAt) {
            query.append('excludeupto', String(params.startAt.getTime()))
        }
        return fetch(this.url + '/request/targeted?' + params.toString(), {
            headers: {
                Authorization: this.token,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            method: 'GET'
        })
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText)
                }
                return response.json()
            })
    }
    getCreatedRequests(params: GetRequestsParams): Promise<Array<Request>> {
        const query = new URLSearchParams()
        if (params.includeClosed) {
            query.append('closed', 'closed')
        }
        if (params.sortDirection) {
            if (params.sortDirection === SortDirection.DESCENDING) {
                query.append('order', 'desc')
            } else {
                query.append('order', 'asc')
            }
        }
        if (params.startAt) {
            query.append('excludeupto', String(params.startAt.getTime()))
        }
        return fetch(this.url + '/request/created?' + params.toString(), {
            headers: {
                Authorization: this.token,
                Accept: 'application/json',
                'Content-Type': 'appcliation/json'
            },
            mode: 'cors',
            method: 'GET'
        })
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText)
                }
                return response.json()
            })
    }

    requestMembership(params: RequestMemebershipParams): Promise<Request> {
        return fetch(this.url + '/group/' + params.groupId + '/requestmembership', {
            headers: {
                Authorization: this.token,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            method: 'POST'
        })
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText)
                }
                return response.json()
            })
            .then((result) => {
                return result as Request
            })
    }

    addOrRequestNarrative(params: RequestNarrativeParams): Promise<RequestWithCompletion | Completion> {
        const url = [
            this.url,
            'group',
            params.groupId,
            'resource',
            'workspace',
            String(params.workspaceId)
        ].join('/')
        return fetch(url, {
            headers: {
                Authorization: this.token,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            method: 'POST'
        })
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText)
                }
                return response.json()
            })
            .then((result) => {
                if (result.complete === false) {
                    return result as RequestWithCompletion
                } else {
                    return result as Completion
                }

            })
    }

    deleteResource(groupId: string, resourceType: string, resourceId: string): Promise<void> {
        const url = [
            this.url,
            'group',
            groupId,
            'resource',
            resourceType,
            resourceId
        ].join('/')
        return fetch(url, {
            headers: {
                Authorization: this.token,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            method: 'DELETE'
        })
            .then((response) => {
                if (response.status !== 204) {
                    throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText)
                }
            })
    }

    cancelRequest({ requestId }: { requestId: string }): Promise<Request> {
        return fetch(this.url + '/request/id/' + requestId + '/cancel', {
            headers: {
                Authorization: this.token,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            method: 'PUT'
        })
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error('Unexpected response: ' + response.status)
                }
                return response.json()
            })
            .then((result) => {
                return result as Request
            })
    }

    acceptRequest({ requestId }: { requestId: string }): Promise<Request> {
        return fetch(this.url + '/request/id/' + requestId + '/accept', {
            headers: {
                Authorization: this.token,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            method: 'PUT'
        })
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error('Unexpected response: ' + response.status)
                }
                return response.json()
            })
            .then((result) => {
                return result as Request
            })
    }

    denyRequest({ requestId }: { requestId: string }): Promise<Request> {
        return fetch(this.url + '/request/id/' + requestId + '/deny', {
            headers: {
                Authorization: this.token,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            method: 'PUT'
        })
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error('Unexpected response: ' + response.status)
                }
                return response.json()
            })
            .then((result) => {
                return result as Request
            })
    }

    memberToAdmin({ groupId, member }: { groupId: string, member: string }): Promise<void> {
        const url = [
            this.url, 'group', groupId, 'user', member, 'admin'
        ].join('/')
        return fetch(url, {
            headers: {
                Authorization: this.token,
                Accept: 'application/json'
            },
            mode: 'cors',
            method: 'PUT'
        })
            .then((response) => {
                if (response.status !== 204) {
                    throw new Error('Unexpected response: ' + response.status + ':' + response.statusText)
                }

            })
    }

    adminToMember({ groupId, member }: { groupId: string, member: string }): Promise<void> {
        const url = [
            this.url, 'group', groupId, 'user', member, 'admin'
        ].join('/')
        return fetch(url, {
            headers: {
                Authorization: this.token,
                Accept: 'application/json'
            },
            mode: 'cors',
            method: 'DELETE'
        })
            .then((response) => {
                if (response.status !== 204) {
                    throw new Error('Unexpected response: ' + response.status + ':' + response.statusText)
                }

            })
    }

    removeMember({ groupId, member }: { groupId: string, member: string }): Promise<void> {
        const url = [
            this.url, 'group', groupId, 'user', member
        ].join('/')
        return fetch(url, {
            headers: {
                Authorization: this.token,
                Accept: 'application/json'
            },
            mode: 'cors',
            method: 'DELETE'
        })
            .then((response) => {
                if (response.status !== 204) {
                    throw new Error('Unexpected response: ' + response.status + ':' + response.statusText)
                }

            })
    }

    requestJoinGroup({ groupId, username }: { groupId: string, username: string }): Promise<Request> {
        const url = [
            this.url, 'group', groupId, 'user', username
        ].join('/')
        return fetch(url, {
            headers: {
                Authorization: this.token,
                Accept: 'application/json'
            },
            mode: 'cors',
            method: 'POST'
        })
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error('Unexpected response: ' + response.status + ':' + response.statusText)
                }
                return response.json()
            })
            .then((result) => {
                return result as Request
            })
    }
}