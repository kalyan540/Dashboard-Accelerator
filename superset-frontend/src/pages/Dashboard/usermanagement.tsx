import React from 'react';
import './UserManagement.css';

const UserManagement: React.FC = () => {
    return (
        <div className='user-main'>
            <h1 className="page-title">User Management</h1>
            <div className="user-management-container">
                <iframe
                    src="http://ec2-44-223-6-181.compute-1.amazonaws.com:8088/users/list/"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 'none', width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
};

export default UserManagement;
