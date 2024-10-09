import React, { useState, FunctionComponent } from 'react';
import { useHistory } from 'react-router-dom';
import './ConnectToAPI.css'; // Assuming you have a CSS file for styling
import { SupersetClient } from '@superset-ui/core';
import { logEvent } from 'src/logger/actions';
import {
  LOG_ACTIONS_DATASET_CREATION_SUCCESS,
} from 'src/logger/LogUtils';
import { useSingleViewResource } from 'src/views/CRUD/hooks';
import { t } from '@superset-ui/core';
import { DatasetObject } from './types';
interface ConnectToAPIProps {
  onHide: () => void;
  show: boolean;
}

const ConnectToAPI: FunctionComponent<ConnectToAPIProps> = ({ onHide, show }) => {
  const history = useHistory();
  const [url, setUrl] = useState('');
  const [tableName, setTableName] = useState('');
  const [jsonData, setJsonData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleTableNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableName(e.target.value);
  };

  const fetchJsonData = async () => {
    if (!url || !tableName) {
      alert('Please enter a valid URL and table name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await SupersetClient.get({
        endpoint: `/api/preview?url=${encodeURIComponent(url)}`,
      });
      setJsonData(response.json); // Store the tree-structured JSON response
      //console.log(response.json);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const UploadjsonData = async () => {
    try {
      // Prepare the request payload
      const payload = {
        keys: selectedKeys,  // Send selected keys
        url: url, // Replace with your actual API URL
        table_name: tableName // Replace with your desired table name
      };

      // Make the POST request to upload data
      const response = await SupersetClient.post({
        endpoint: '/api/upload',
        jsonPayload: payload,
      });

      // Handle the response
      const result = response.json; // Adjusted to correctly access the JSON response
      onSave();
      console.log('Uploaded keys:', result);
      setSelectedKeys([]);

    } catch (err) {
      console.error('Error uploading keys:', err);
    }
  };

  const handleCheckboxChange = (key: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedKeys([...selectedKeys, key]);
    } else {
      setSelectedKeys(selectedKeys.filter((k) => k !== key));
    }
  };

  const renderJsonTree = (data: any, parentKey = ''): React.ReactNode => {
    return Object.keys(data).map((key) => {
      const value = data[key];
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      if (typeof value === 'object' && value !== null) {
        return (
          <li key={fullKey}>
            <span>{key}</span>
            <ul>{renderJsonTree(value, fullKey)}</ul>
          </li>
        );
      }

      return (
        <li key={fullKey}>
          <label>
            <input
              type="checkbox"
              checked={selectedKeys.includes(fullKey)}
              onChange={(e) => handleCheckboxChange(fullKey, e.target.checked)}
            />
            {key}: {String(value)}
          </label>
        </li>
      );
    });
  };

  // Function to clear all variables
  const handleClose = () => {
    setUrl('');           // Clear the URL field
    setTableName('');      // Clear the table name field
    setJsonData(null);     // Clear the fetched JSON data
    setSelectedKeys([]);   // Clear selected keys
    setError(null);        // Clear any error message
    setLoading(false);     // Reset loading state
    onHide();              // Call the parent onHide function
  };

  const { createResource } = useSingleViewResource<Partial<DatasetObject>>(
    'dataset',
    t('dataset'),
    (errorMsg: string) => { console.error(`Error: ${errorMsg}`); }
  );

  const onSave = () => {
    const data = {
      database: 1,
      catalog: null,
      schema: "public",
      table_name: tableName,
    };
    console.log("Iam hear at Footer");
    createResource(data).then(response => {
      if (!response) {
        return;
      }
      if (typeof response === 'number') {
        logEvent(LOG_ACTIONS_DATASET_CREATION_SUCCESS, data);
        console.log("Dataset added");
        onHide();
        history.push(`/chart/add/?dataset=${tableName}`);
      }
    });
  };

  if (!show) {
    return null;
  }

  return (
    <div className="popup-container">
      <div className="popup-content" style={{ width: '500px' }}>
        <div className="popup-header">
          <h2>Connect to API</h2>
          <button className="close-button" onClick={handleClose}>X</button>
        </div>
        <div className="popup-body">
          <div className="url-input">
            <label>Enter API URL:</label>
            <div className="input-button-wrapper">
              <input type="text" value={url} onChange={handleUrlChange} placeholder="https://example.com/api" />
              <button onClick={fetchJsonData} disabled={loading}>
                Preview
              </button>
            </div>
          </div>
          <div className="table-input">
            <label>Enter Table Name:</label>
            <input type="text" value={tableName} onChange={handleTableNameChange} placeholder="my_table" />
          </div>
          <div className="json-body" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
            <label>Response JSON Keys:</label>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : jsonData ? (
              <ul>{renderJsonTree(jsonData)}</ul>
            ) : (
              <p>No data fetched yet.</p>
            )}
          </div>
        </div>
        <div className="popup-footer">
          <button onClick={UploadjsonData} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectToAPI;
