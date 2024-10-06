import React from 'react';
import './UserManagement.css';

interface User {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    role: string;
    isActive: boolean;
}

const initialUsers: User[] = [
    { firstName: 'John', lastName: 'Sam', userName: 'JohnS', email: 'johnsam@altimetrik.com', role: 'Building Manager', isActive: true },
    { firstName: 'Sasi', lastName: 'Kumar', userName: 'SKumar', email: 'sasikumar@altimetrik.com', role: 'Floor 1 Incharge', isActive: true },
    { firstName: 'Vishnu', lastName: 'Das', userName: 'VishnuD', email: 'vishnudas@altimetrik.com', role: 'Energy Efficiency Officer', isActive: true },
    { firstName: 'Shiv', lastName: 'Dev', userName: 'Shiv', email: 'shivdev@altimetrik.com', role: 'Floor 2 Incharge', isActive: false },
];

const UserManagement: React.FC = () => {
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Implement search functionality here
        //console.log('Search term:', event.target.value);
    };

    return (
        <div className='main'>
            <h1 className="page-title">User Management</h1>
            <div className="user-management-container">


                <div className="header">
                    <input
                        type="text"
                        placeholder="Search"
                        className="search-input"
                        onChange={handleSearch}
                    />
                    <button className="add-button">+ Add</button>
                </div>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Is Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialUsers.map((user, index) => (
                            <tr key={index}>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.userName}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>{user.isActive ? 'True' : 'False'}</td>
                                <td>
                                    <button className="edit-button">Edit</button>
                                    <button className="delete-button">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
