import React from 'react';
import './IFrameContainer.css'; // Import CSS for styling

const Analytics = () => {
    /*const iframes = [
        { title: 'Building 1', src: 'http://localhost:8088/superset/explore/p/z3NVkM195ab/?standalone=1&height=400' },
        { title: 'Building 2', src: 'http://localhost:8088/superset/explore/p/agJYemrY7kE/?standalone=1&height=400' },
        { title: 'Building 3', src: 'http://localhost:8088/superset/explore/p/AjZVQOZ9rWg/?standalone=1&height=400' },
    ];*/

    return (
        <div className='main'>
            <h1 className="page-title">Advanced Analytics</h1>
        </div>
    );
};

export default Analytics;

/*<div className="iframe-container">
                {iframes.map((iframe, index) => (
                    <div key={index} className="iframe-wrapper">
                        <h3 className="iframe-title">{iframe.title}</h3>
                        <iframe
                            width="600"
                            height="400"
                            seamless
                            frameBorder="0"
                            scrolling="no"
                            src={iframe.src}
                        ></iframe>
                    </div>
                ))}
            </div> */
