import React from 'react';
import { getDatabase, ref, set } from 'firebase/database';
import {app} from "../firebase-config/config";

const AdminTools = () => {
    const deleteRooms = () => {
        const db = getDatabase(app);
        const roomsRef = ref(db, 'rooms');

        set(roomsRef, null)
            .then(() => {
                console.log('Rooms deleted successfully');
            })
            .catch(error => {
                console.log('Error deleting rooms:', error);
            });
    };

    return (
        <div>
            <button onClick={deleteRooms}>Delete All Rooms</button>
        </div>
    );
};

export default AdminTools;
