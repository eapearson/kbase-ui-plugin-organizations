import * as React from 'react'
import './Avatar.css'

import { User } from '../../types'

export interface AvatarProps {
    user: User,
    size: number
}

interface AvatarState {

}

export class Avatar extends React.Component<AvatarProps, AvatarState> {
    constructor(props: AvatarProps) {
        super(props)
    }

    getAvatarUrl(user: User) {
        switch (user.avatarOption || 'gravatar') {
            case 'gravatar':
                const gravatarDefault = user.gravatarDefault || 'identicon';
                const gravatarHash = user.gravatarHash;
                if (gravatarHash) {
                    return 'https://www.gravatar.com/avatar/' + gravatarHash + '?s=60&amp;r=pg&d=' + gravatarDefault;
                } else {
                    return './nouserpic.png';
                }
            case 'silhouette':
            case 'mysteryman':
            default:
                return './nouserpic.png';
        }
    }

    render() {
        const avatarUrl = this.getAvatarUrl(this.props.user)
        return (
            <img
                src={avatarUrl}
                style={{ width: this.props.size }}
            />
        )
    }

}

export default Avatar