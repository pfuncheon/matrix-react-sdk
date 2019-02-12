/*
Copyright 2019 Vector Creations Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';
import React from "react";
import dis from "../../../dispatcher";
import MatrixClientPeg from "../../../MatrixClientPeg";
import AccessibleButton from '../elements/AccessibleButton';
import RoomAvatar from '../avatars/RoomAvatar';

const MAX_ROOMS = 20;

export default class RoomBreadcrumbs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {rooms: []};
        this.onAction = this.onAction.bind(this);
        this._previousRoomId = null;
        this._dispatcherRef = null;
    }

    componentWillMount() {
        this._dispatcherRef = dis.register(this.onAction);
    }

    componentWillUnmount() {
        dis.unregister(this._dispatcherRef);
    }

    onAction(payload) {
        switch (payload.action) {
            case 'view_room':
                if (this._previousRoomId) {
                    this._appendRoomId(this._previousRoomId);
                }
                this._previousRoomId = payload.room_id;
        }
    }

    _appendRoomId(roomId) {
        const room = MatrixClientPeg.get().getRoom(roomId);
        if (!room) {
            return;
        }
        const rooms = this.state.rooms.slice();
        const existingIdx = rooms.findIndex((r) => r.roomId === room.roomId);
        if (existingIdx !== -1) {
            rooms.splice(existingIdx, 1);
        }
        rooms.push(room);
        if (rooms.length > MAX_ROOMS) {
            rooms.splice(0, rooms.length - MAX_ROOMS);
        }
        this.setState({rooms});
    }

    _viewRoom(room) {
        dis.dispatch({action: "view_room", room_id: room.roomId});
    }

    render() {
        const avatars = this.state.rooms.map((room) => {
            return (
                <AccessibleButton key={room.roomId} title={room.name} onClick={() => this._viewRoom(room)}>
                    <RoomAvatar room={room} width={32} height={32} />
                </AccessibleButton>
            );
        });
        return (<div className="mx_RoomBreadcrumbs"><div>{ avatars }</div></div>);
    }
}
