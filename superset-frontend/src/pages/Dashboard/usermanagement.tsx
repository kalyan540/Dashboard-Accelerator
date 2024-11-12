import React, { useEffect} from 'react';//, useState }
import './UserManagement.css';
import { SupersetClient } from '@superset-ui/core';

const UserManagement: React.FC = () => {
    //const [htmlContent, setHtmlContent] = useState<string>('');
    //const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchHtml = async () => {
            try {
                const response = await SupersetClient.get({
                    endpoint: '/users/list',
                });
                console.log(response);
                //setHtmlContent(response); // Assuming the HTML is in the `data` property
            } catch (error) {
                console.error('Error fetching HTML:', error);
            } finally {
                //setLoading(false);
                console.log("Hello");
            }
        };

        fetchHtml();
    }, []);
    return (
        <div className='user-main'>
            <h1 className="page-title">User Management</h1>
            <div className="user-management-container">
                asdfghjkl
            </div>
        </div>
    );
};

export default UserManagement;

/*{loading ? (
    <p>Loading...</p>
) : (
    <div
        className="html-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
)}*/
