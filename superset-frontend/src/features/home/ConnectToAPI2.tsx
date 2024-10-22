/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, {
    ChangeEvent,
    FunctionComponent,
    useState,
    useEffect,
    useCallback,
    ReactNode,
    useMemo,
} from 'react';
import { logEvent } from 'src/logger/actions';
import {
    css,
    styled,
    SupersetClient,
    t,
} from '@superset-ui/core';
import rison from 'rison';
import { useSingleViewResource } from 'src/views/CRUD/hooks';
import {
    LOG_ACTIONS_DATASET_CREATION_SUCCESS,
} from 'src/logger/LogUtils';
import {
    addReport
} from 'src/features/reports/ReportModal/actions';
import { Switch } from 'src/components/Switch';
import Modal from 'src/components/Modal';
import Collapse from 'src/components/Collapse';
import TimezoneSelector from 'src/components/TimezoneSelector';
import { propertyComparator } from 'src/components/Select/utils';
//import withToasts from 'src/components/MessageToasts/withToasts';
//import Owner from 'src/types/Owner';
import { AsyncSelect, Select } from 'src/components';
//import { useCommonConf } from 'src/features/databases/state';
import {
    AlertObject,
    Extra,
    AlertsReportsConfig,
    ValidationObject,
    Sections,
    SelectValue,
    MetaObject,
} from 'src/features/alerts/types';
import { useSelector } from 'react-redux';
import { UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';
import NumberInput from 'src/features/alerts/components/NumberInput';
import { AlertReportCronScheduler } from 'src/features/alerts/components/AlertReportCronScheduler';
import ValidatedPanelHeader from 'src/features/alerts/components/ValidatedPanelHeader';
import StyledPanel from 'src/features/alerts/components/StyledPanel';
import { DatasetObject } from './types';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    ReportObject
} from 'src/features/reports/types';

const TIMEOUT_MIN = 1;


export interface APIModalProps {
    onHide: () => void;
    show: boolean;
    isReport?: boolean;
}

const DEFAULT_WORKING_TIMEOUT = 3600;
const DEFAULT_CRON_VALUE = '0 0 * * *'; // every day
const DEFAULT_RETENTION = 90;
//const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//const DEFAULT_NOTIFICATION_FORMAT = 'PNG';
const DEFAULT_EXTRA_DASHBOARD_OPTIONS: Extra = {
    dashboard: {
        anchor: '',
    },
};

const RETENTION_OPTIONS = [
    {
        label: t('None'),
        value: 0,
    },
    {
        label: t('30 days'),
        value: 30,
    },
    {
        label: t('60 days'),
        value: 60,
    },
    {
        label: t('90 days'),
        value: 90,
    },
];


// Apply to final text input components of each collapse panel
const noMarginBottom = css`
    margin-bottom: 0;
  `;

/*
Height of modal body defined here, total width defined at component invocation as antd prop.
 */
const StyledModal = styled(Modal)`
    .ant-modal-body {
      height: 720px;
    }
  
    .control-label {
      margin-top: ${({ theme }) => theme.gridUnit}px;
    }
  
    .ant-collapse > .ant-collapse-item {
      border-bottom: none;
    }
  
    .inline-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      &.wrap {
        flex-wrap: wrap;
      }
  
      > div {
        flex: 1 1 auto;
      }
    }
  `;

const StyledSwitchContainer = styled.div`
    display: flex;
    align-items: center;
    margin-top: 10px;
  
    .switch-label {
      margin-left: 10px;
    }
  `;

export const StyledInputContainer = styled.div`
    ${({ theme }) => css`
      flex: 1;
      margin-top: 0px;
      margin-bottom: ${theme.gridUnit * 4}px;
  
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type='number'] {
        -moz-appearance: textfield;
      }
  
      .helper {
        display: block;
        color: ${theme.colors.grayscale.base};
        font-size: ${theme.typography.sizes.s}px;
        padding: ${theme.gridUnit}px 0;
        text-align: left;
      }
  
      .required {
        margin-left: ${theme.gridUnit / 2}px;
        color: ${theme.colors.error.base};
      }
  
      .input-container {
        display: flex;
        align-items: center;
  
        > div {
          width: 100%;
        }
  
        label {
          display: flex;
          margin-right: ${theme.gridUnit * 2}px;
        }
  
        i {
          margin: 0 ${theme.gridUnit}px;
        }
      }
  
      input,
      textarea {
        flex: 1 1 auto;
      }
  
      input[disabled] {
        color: ${theme.colors.grayscale.base};
      }
  
      textarea {
        height: 300px;
        resize: none;
      }
  
      input::placeholder,
      textarea::placeholder {
        color: ${theme.colors.grayscale.light1};
      }
  
      textarea,
      input[type='text'],
      input[type='number'] {
        padding: ${theme.gridUnit}px ${theme.gridUnit * 2}px;
        border-style: none;
        border: 1px solid ${theme.colors.grayscale.light2};
        border-radius: ${theme.gridUnit}px;
  
        &[name='description'] {
          flex: 1 1 auto;
        }
      }
  
      .input-label {
        margin-left: 10px;
      }
    `}
  `;

export const TRANSLATIONS = {
    // Panel titles
    GENERAL_TITLE: t('Configuration'),
    DATABASE_TITLE: t('Database'),
    SCHEDULE_TITLE: t('Schedule'),
    // Error text
    NAME_ERROR_TEXT: t('name'),
    OWNERS_ERROR_TEXT: t('owners'),
    CONTENT_ERROR_TEXT: t('content type'),
    DATABASE_ERROR_TEXT: t('database'),
    SQL_ERROR_TEXT: t('sql'),
    ALERT_CONDITION_ERROR_TEXT: t('alert condition'),
    CRONTAB_ERROR_TEXT: t('crontab'),
    WORKING_TIMEOUT_ERROR_TEXT: t('working timeout'),
    RECIPIENTS_ERROR_TEXT: t('recipients'),
    EMAIL_SUBJECT_ERROR_TEXT: t('email subject'),
    EMAIL_VALIDATION_ERROR_TEXT: t('invalid email'),
    ERROR_TOOLTIP_MESSAGE: t(
        'Not all required fields are complete. Please provide the following:',
    ),
};

const APIModal: FunctionComponent<APIModalProps> = ({
    onHide,
    show,
    isReport = false
}) => {
    const currentUser = useSelector<any, UserWithPermissionsAndRoles>(
        state => state.user,
    );
    // Check config for alternate notification methods setting
    //const conf = useCommonConf();
    //const allowedNotificationMethods: NotificationMethodOption[] =
    //conf?.ALERT_REPORTS_NOTIFICATION_METHODS || DEFAULT_NOTIFICATION_METHODS;

    const [disableSave, setDisableSave] = useState<boolean>(true);

    const [currentAlert, setCurrentAlert] =
        useState<Partial<AlertObject> | null>();


    // Validation
    const [validationStatus] = useState<ValidationObject>({
        [Sections.General]: {
            hasErrors: false,
            name: TRANSLATIONS.GENERAL_TITLE,
            errors: [],
        },
        [Sections.Schedule]: {
            hasErrors: false,
            name: TRANSLATIONS.SCHEDULE_TITLE,
            errors: [],
        },
    });
    const [errorTooltipMessage, setErrorTooltipMessage] = useState<ReactNode>('');

    const enforceValidation = () => {
        /*const sections = [
            Sections.General,
            Sections.Content,
            isReport ? undefined : Sections.Alert,
            Sections.Schedule,
            Sections.Notification,
        ];*/
        const tooltip = '';
        /*const hasErrors = sections.some(
            section => section && validationStatus[section].hasErrors,
          );*/
        setErrorTooltipMessage(tooltip);
        setDisableSave(false);
    };

    useEffect(() => {
        enforceValidation();
    }, []);
    // API configuration
    const history = useHistory();
    const [url, setUrl] = useState('');
    const [active, setactive] = useState<boolean>(false);
    const [crontab, setcrontab] = useState('');
    //const [log_retention, setlogretention] = useState('');
    const [timezone, settimezone] = useState('');
    const [tableName, setTableName] = useState('');
    //const [scheduleName, setscheduleName] = useState('');
    const [jsonData, setJsonData] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    //const [authType, setAuthType] = useState('no-auth'); // Default to 'No Auth'
    const dispatch = useDispatch();
    const [sourceOptions, setSourceOptions] = useState<MetaObject[]>([]);
    const { createResource } = useSingleViewResource<Partial<DatasetObject>>(
        'dataset',
        t('dataset'),
        (errorMsg: string) => { console.error(`Error: ${errorMsg}`); }
    );

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value);
    };

    const handleTableNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTableName(e.target.value);
    };

    /*const handlescheduleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setscheduleName(e.target.value);
    };*/

    /*const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAuthType(e.target.value);
    };*/

    const onSave = async () => {
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
            if(active){
                onSaveSchedule();
            }
            
            Save();
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



    const isEditMode = false;

    

    const getSourceData = useCallback(
        (db?: MetaObject) => {
            const database = db || currentAlert?.database;

            if (!database || database.label) {
                return null;
            }

            let result;

            // Cycle through source options to find the selected option
            sourceOptions.forEach(source => {
                if (source.value === database.value || source.value === database.id) {
                    result = source;
                }
            });

            return result;
        },
        [currentAlert?.database, sourceOptions],
    );

    const databaseLabel = currentAlert?.database && !currentAlert.database.label;
    useEffect(() => {
        // Find source if current alert has one set
        if (databaseLabel) {
            updateAlertState('database', getSourceData());
        }
    }, [databaseLabel, getSourceData]);

    const {
        ALERT_REPORTS_DEFAULT_WORKING_TIMEOUT,
        ALERT_REPORTS_DEFAULT_CRON_VALUE,
        ALERT_REPORTS_DEFAULT_RETENTION,
    } = useSelector<any, AlertsReportsConfig>(state => {
        const conf = state.common?.conf;
        return {
            ALERT_REPORTS_DEFAULT_WORKING_TIMEOUT:
                conf?.ALERT_REPORTS_DEFAULT_WORKING_TIMEOUT ?? DEFAULT_WORKING_TIMEOUT,
            ALERT_REPORTS_DEFAULT_CRON_VALUE:
                conf?.ALERT_REPORTS_DEFAULT_CRON_VALUE ?? DEFAULT_CRON_VALUE,
            ALERT_REPORTS_DEFAULT_RETENTION:
                conf?.ALERT_REPORTS_DEFAULT_RETENTION ?? DEFAULT_RETENTION,
        };
    });

    const defaultAlert = {
        active: false,
        url: '',
        databasename: '',
        tablename: '',
        creation_method: 'alerts_reports',
        crontab: ALERT_REPORTS_DEFAULT_CRON_VALUE,
        extra: DEFAULT_EXTRA_DASHBOARD_OPTIONS,
        log_retention: ALERT_REPORTS_DEFAULT_RETENTION,
        working_timeout: ALERT_REPORTS_DEFAULT_WORKING_TIMEOUT,
        name: '',
        owners: [],
        recipients: [],
        sql: '',
        email_subject: '',
        validator_config_json: {},
        validator_type: '',
        force_screenshot: false,
        grace_period: undefined,
    };

    // Updating alert/report state
    const updateAlertState = (name: string, value: any) => {
        setCurrentAlert(currentAlertData => ({
            ...currentAlertData,
            [name]: value,
        }));
        if (name === 'active') {
            setactive(value);
        }
        if (name === 'crontab') {
            setcrontab(value);
        }
        if (name === 'timezone') {
            settimezone(value);
        }
    };

    useEffect(() => {
        setCurrentAlert({
            ...defaultAlert,
            owners: currentUser
                ? [
                    {
                        value: currentUser.userId,
                        label: `${currentUser.firstName} ${currentUser.lastName}`,
                    },
                ]
                : [],
        });
    }, [currentUser]);

    // Handle input/textarea updates
    const onInputChange = (
        event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => {
        const {
            target: { type, value, name },
        } = event;
        const parsedValue = type === 'number' ? parseInt(value, 10) || null : value;

        updateAlertState(name, parsedValue);

        /*if (name === 'name') {
            handlescheduleNameChange(event as React.ChangeEvent<HTMLInputElement>);
        }*/
        if (name === 'url') {
            handleUrlChange(event as React.ChangeEvent<HTMLInputElement>);  // Ensure the event is passed to handleUrlChange
        }
        if (name === 'tablename') {
            handleTableNameChange(event as React.ChangeEvent<HTMLInputElement>);  // Ensure the event is passed to handleUrlChange
        }
    };

    const onTimeoutVerifyChange = (
        event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => {
        const { target } = event;
        const value = +target.value;

        // Need to make sure grace period is not lower than TIMEOUT_MIN
        if (value === 0) {
            updateAlertState(target.name, undefined);
        } else {
            updateAlertState(
                target.name,
                value ? Math.max(value, TIMEOUT_MIN) : value,
            );
        }
    };

    const onOwnersChange = (value: Array<SelectValue>) => {
        updateAlertState('owners', value || []);
    };

    const onSourceChange = (value: Array<SelectValue>) => {
        updateAlertState('database', value || []);
    };

    const onActiveSwitch = (checked: boolean) => {
        updateAlertState('active', checked);
    };

    const onLogRetentionChange = (retention: number) => {
        updateAlertState('log_retention', retention);
        //setlogretention(retention);
    };

    const onTimezoneChange = (timezone: string) => {
        updateAlertState('timezone', timezone);
    };

    const getTitleText = () => {
        let titleText = t('API Data Importer');
        return titleText;
    };

    const hide = () => {
        setUrl('');           // Clear the URL field
        setTableName('');      // Clear the table name field
        setJsonData(null);     // Clear the fetched JSON data
        setSelectedKeys([]);   // Clear selected keys
        setError(null);        // Clear any error message
        setLoading(false);
        onHide(); // Ensure this prop is passed properly from parent
        setCurrentAlert({ ...defaultAlert });
        //setactive(false);
    };

    const Save = () => {
        // Notification Settings
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
                hide();
                history.push(`/chart/add/?dataset=${tableName}`);
            }
        });

    };

    const loadSourceOptions = useMemo(
        () =>
            (input = '', page: number, pageSize: number) => {
                const query = rison.encode({
                    filter: input,
                    page,
                    page_size: pageSize,
                });
                return SupersetClient.get({
                    endpoint: `/api/v1/report/related/database?q=${query}`,
                }).then(response => {
                    const list = response.json.result.map(
                        (item: { value: number; text: string }) => ({
                            value: item.value,
                            label: item.text,
                        }),
                    );
                    setSourceOptions(list);
                    return { data: list, totalCount: response.json.count };
                });
            },
        [],
    );

    const loadOwnerOptions = useMemo(
        () =>
            (input = '', page: number, pageSize: number) => {
                const query = rison.encode({
                    filter: input,
                    page,
                    page_size: pageSize,
                });
                return SupersetClient.get({
                    endpoint: `/api/v1/report/related/created_by?q=${query}`,
                }).then(response => ({
                    data: response.json.result.map(
                        (item: { value: number; text: string }) => ({
                            value: item.value,
                            label: item.text,
                        }),
                    ),
                    totalCount: response.json.count,
                }));
            },
        [],
    );
    const onSaveSchedule = async () => {
        // Create new Report
        const newReportValues: Partial<ReportObject> = {
            type: "Report",
            active: active,
            force_screenshot: false,
            custom_width: null,
            creation_method: "alerts_reports",
            dashboard: 11,
            chart: null,
            owners: [1],
            recipients: [
                {
                    recipient_config_json: {
                        target: "",
                        ccTarget: "",
                        bccTarget: "",
                    },
                    type: 'Email',
                },
            ],
            name: tableName,
            description: url+'#'+String(selectedKeys),
            crontab: crontab,
            report_format: "TEXT",
            timezone: timezone
        };
        await dispatch(addReport(newReportValues as ReportObject));
    }

    const fetchJsonData = async () => {
        if (!url) {
            alert('Please enter a valid URL');
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

    return (
        <StyledModal
            className="no-content-padding"
            responsive
            disablePrimaryButton={disableSave}
            primaryTooltipMessage={errorTooltipMessage}
            onHandledPrimaryAction={onSave}
            onHide={hide}
            primaryButtonName={isEditMode ? t('Save') : t('Add')}
            show={show}
            width="500px"
            centered
            title={<h4 data-test="alert-report-modal-title">{getTitleText()}</h4>}
        >
            <Collapse
                expandIconPosition="right"
                defaultActiveKey="general"
                accordion
                css={css`
            border: 'none';
          `}
            >
                <StyledPanel
                    header={
                        <ValidatedPanelHeader
                            title={TRANSLATIONS.GENERAL_TITLE}
                            subtitle={t(
                                'Set up basic API details, such as url and data selection.',
                            )}
                            validateCheckStatus={
                                !validationStatus[Sections.General].hasErrors
                            }
                            testId="general-information-panel"
                        />
                    }
                    key="general"
                >
                    <div className="header-section">
                        <StyledInputContainer>
                            <div className="control-label">
                                {t('API name')}
                                <span className="required">*</span>
                            </div>
                            <div className="input-container">
                                <input
                                    type="text"
                                    name="name"
                                    value={currentAlert ? currentAlert.name : ''}
                                    placeholder={
                                        t('Enter api name')
                                    }
                                    onChange={onInputChange}
                                />
                            </div>
                        </StyledInputContainer>
                        <StyledInputContainer>
                            <div className="control-label">
                                {t('URL')}
                                <span className="required">*</span>
                            </div>
                            <div className="input-container">
                                <input
                                    type="text"
                                    name="url"
                                    value={currentAlert ? currentAlert.url : ''}
                                    placeholder={
                                        t('Enter API url')
                                    }
                                    onChange={onInputChange}
                                />
                                <button
                                    type="button"
                                    onClick={fetchJsonData}
                                    style={{
                                        marginLeft: '10px',
                                        padding: '5px 10px',
                                        backgroundColor: '#007bff',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {t('Preview')}
                                </button>
                            </div>
                        </StyledInputContainer>
                        <StyledInputContainer>
                            <div className="control-label">
                                {t('Owners')}
                                <span className="required">*</span>
                            </div>
                            <div data-test="owners-select" className="input-container">
                                <AsyncSelect
                                    ariaLabel={t('Owners')}
                                    allowClear
                                    name="owners"
                                    mode="multiple"
                                    placeholder={t('Select owners')}
                                    value={
                                        (currentAlert?.owners as {
                                            label: string;
                                            value: number;
                                        }[]) || []
                                    }
                                    options={loadOwnerOptions}
                                    onChange={onOwnersChange}
                                />
                            </div>
                        </StyledInputContainer>
                        <StyledInputContainer>
                            <div className="control-label">{t('Response Body:')}</div>

                            <div className="json-body" style={{ maxHeight: '350px', overflowY: 'scroll' }}>
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

                        </StyledInputContainer>
                        <StyledSwitchContainer>
                            <Switch
                                checked={currentAlert ? currentAlert.active : false}
                                defaultChecked
                                onChange={onActiveSwitch}
                            />
                            <div className="switch-label">
                                {t('API schedule is active')}
                            </div>
                        </StyledSwitchContainer>
                    </div>
                </StyledPanel>
                <StyledPanel
                    header={
                        <ValidatedPanelHeader
                            title={TRANSLATIONS.DATABASE_TITLE}
                            subtitle={t(
                                'Define the database, tablename.',
                            )}
                            validateCheckStatus={
                                !validationStatus[Sections.General].hasErrors
                            }
                            testId="general-information-panel"
                        />
                    }
                    key="database"
                >
                    <div className="header-section">
                        <StyledInputContainer>
                            <div className="control-label">
                                {t('Database')}
                                <span className="required">*</span>
                            </div>
                            <div className="input-container">
                                <AsyncSelect
                                    ariaLabel={t('Database')}
                                    name="source"
                                    placeholder={t('Select database')}
                                    value={
                                        currentAlert?.database?.label &&
                                            currentAlert?.database?.value
                                            ? {
                                                value: currentAlert.database.value,
                                                label: currentAlert.database.label,
                                            }
                                            : undefined
                                    }
                                    options={loadSourceOptions}
                                    onChange={onSourceChange}
                                />
                            </div>
                        </StyledInputContainer>
                        <StyledInputContainer>
                            <div className="control-label">
                                {t('Table name')}
                                <span className="required">*</span>
                            </div>
                            <div data-test="owners-select" className="input-container">
                                <input
                                    type="text"
                                    name="tablename"
                                    value={currentAlert ? currentAlert.tablename : ''}
                                    placeholder={
                                        t('Enter Table name')
                                    }
                                    onChange={onInputChange}
                                />
                            </div>
                        </StyledInputContainer>
                    </div>
                </StyledPanel>
                {active && (
                    <StyledPanel
                        header={
                            <ValidatedPanelHeader
                                title={TRANSLATIONS.SCHEDULE_TITLE}
                                subtitle={t(
                                    'Define delivery schedule, timezone, and frequency settings.',
                                )}
                                validateCheckStatus={
                                    !validationStatus[Sections.Schedule].hasErrors
                                }
                                testId="schedule-panel"
                            />
                        }
                        key="schedule"
                    >
                        <AlertReportCronScheduler
                            value={currentAlert?.crontab || ''}
                            onChange={newVal => updateAlertState('crontab', newVal)}
                        />
                        <StyledInputContainer>
                            <div className="control-label">
                                {t('Timezone')} <span className="required">*</span>
                            </div>
                            <TimezoneSelector
                                onTimezoneChange={onTimezoneChange}
                                timezone={currentAlert?.timezone}
                                minWidth="100%"
                            />
                        </StyledInputContainer>
                        <StyledInputContainer>
                            <div className="control-label">
                                {t('Log retention')}
                                <span className="required">*</span>
                            </div>
                            <div className="input-container">
                                <Select
                                    ariaLabel={t('Log retention')}
                                    placeholder={t('Log retention')}
                                    onChange={onLogRetentionChange}
                                    value={currentAlert?.log_retention}
                                    options={RETENTION_OPTIONS}
                                    sortComparator={propertyComparator('value')}
                                />
                            </div>
                        </StyledInputContainer>
                        <StyledInputContainer css={noMarginBottom}>
                            {isReport ? (
                                <>
                                    <div className="control-label">
                                        {t('Working timeout')}
                                        <span className="required">*</span>
                                    </div>
                                    <div className="input-container">
                                        <NumberInput
                                            min={1}
                                            name="working_timeout"
                                            value={currentAlert?.working_timeout || ''}
                                            placeholder={t('Time in seconds')}
                                            onChange={onTimeoutVerifyChange}
                                            timeUnit={t('seconds')}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="control-label">{t('Grace period')}</div>
                                    <div className="input-container">
                                        <NumberInput
                                            min={1}
                                            name="grace_period"
                                            value={currentAlert?.grace_period || ''}
                                            placeholder={t('Time in seconds')}
                                            onChange={onTimeoutVerifyChange}
                                            timeUnit={t('seconds')}
                                        />
                                    </div>
                                </>
                            )}
                        </StyledInputContainer>
                    </StyledPanel>
                )}
            </Collapse>
        </StyledModal>
    );
};

export default APIModal;
