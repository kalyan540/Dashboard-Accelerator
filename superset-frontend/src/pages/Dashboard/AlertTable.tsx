import React, { useEffect, useState } from 'react';
import { SupersetClient } from '@superset-ui/core';

// Sample function to fetch the alerts data
const fetchAlertsData = async () => {
    const response = await SupersetClient.get({
        endpoint: '/api/v1/report/?q=(filters:!((col:type,opr:eq,value:Alert)),order_column:name,order_direction:desc,page:0,page_size:25)',
    });

    // Assuming response.data contains the "result"
    return response.json.result;
};

const fetchSetValue = async (alertId: number) => {
    const response = await SupersetClient.get({
        endpoint: `/api/v1/report/${alertId}`,
    });

    const result = response.json.result;
    const validatorConfig = result?.validator_config_json ? JSON.parse(result.validator_config_json) : null;

    // Fetching threshold value from the validator_config_json
    return validatorConfig ? validatorConfig.threshold : 'N/A';
};

// Define the Alert type
interface Alert {
    id: number;
    name: string;
    crontab_humanized: string;
    recipients: { id: number; type: string }[];
    changed_on: string;
    active: boolean;
}

const AlertTable = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [setValues, setSetValues] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        const getAlerts = async () => {
            const alertsData = await fetchAlertsData();
            setAlerts(alertsData);

            // Fetch Set Values for each alert ID
            alertsData.forEach(async (alert: Alert) => {
                const setValue = await fetchSetValue(alert.id);
                setSetValues(prevState => ({
                    ...prevState,
                    [alert.id]: setValue,
                }));
            });
        };
        getAlerts();
    }, []);

    const renderNotificationMethod = (recipients: { id: number; type: string }[]) => {
        return recipients && recipients[0] ? recipients[0].type : 'N/A';
    };

    const handleAcknowledge = (alertId: number) => {
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
    };

    const renderLastModified = (changedOn: string) => {
        const date = new Date(changedOn);
        return date.toLocaleString('en-US', {
            weekday: 'short', // 'Mon' (optional, you can change or remove this)
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true, // true for 12-hour format (AM/PM), false for 24-hour format
        });
    };

    return (
        <div style={{ backgroundColor: 'white', paddingLeft: '10px', paddingRight: '10px' }}>
            <h2>Alerts</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Set Value</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Notification Method</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Triggered time</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Active</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Acknowledge</th>
                    </tr>
                </thead>
                <tbody>
                    {alerts.slice(0, 5).map((alert) => (
                        <tr key={alert.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '12px' }}>{alert.name}</td>
                            <td style={{ padding: '12px' }}>{setValues[alert.id] ? setValues[alert.id] : 'Loading...'}</td>
                            <td style={{ padding: '12px' }}>{renderNotificationMethod(alert.recipients)}</td>
                            <td style={{ padding: '12px' }}>{renderLastModified(alert.changed_on)}</td>
                            <td style={{ padding: '12px' }}>{alert.active ? 'Yes' : 'No'}</td>
                            <td style={{ padding: '12px' }}>
                                <button onClick={() => handleAcknowledge(alert.id)}>Click</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AlertTable;
