import uuid from 'uuid/v4'
import { Channel } from './windowChannel'
import { runInThisContext } from 'vm';

export interface IFrameParams {
    channelId: string,
    frameId: string,
    params: {
        groupsServiceURL: string,
        userProfileServiceURL: string,
        workspaceServiceURL: string
    },
    parentHost: string
}
/*
 channelId: "3b33179e-8a6d-4ae9-bc95-af4c0492eaa6"
frameId: "frame_kb_html_be553ee5-645c-4737-80ba-dcb642632f0c"
hostId: "host_kb_html_9a3b5d5d-bb92-43ff-a443-73267aa31323"
params: {}
parentHost: "https://ci.kbase.us"

*/

/*
IFrameSimulator
This little doozey allows us to create a simulated iframe. We can query it for
 the params placed on the iframe, and talk to it via the window channel -- it has 
 its own window channel.
 Good thing we designed the channel for multiple channels per window.
*/
class IFrameSimulator {
    params: IFrameParams | null
    channel: Channel

    constructor() {
        this.params = null

        // create a window channel.

        this.channel = new Channel({
            window: window,
            host: document.location!.origin
        })

    }

    getParamsFromIFrame(): IFrameParams {
        return {
            channelId: this.channel.id,
            frameId: uuid(),
            params: {
                groupsServiceURL: 'services/groups',
                userProfileServiceURL: 'services/user_profile/rpc',
                workspaceServiceURL: 'services/ws'
            },
            parentHost: document.location!.origin
        }
    }
}



export default IFrameSimulator