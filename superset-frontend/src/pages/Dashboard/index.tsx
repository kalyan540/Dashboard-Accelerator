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
import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardPage } from 'src/dashboard/containers/DashboardPage';
import './Buttons.css';
import AlertList from '../AlertReportList';
import Analytics from './Analytics';
import UserManagement from './usermanagement';
import { addDangerToast, addSuccessToast } from 'src/components/MessageToasts/actions';
//import { RootState } from 'src/dashboard/types';
import { useSelector } from 'react-redux';
import { UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';
import { t } from '@superset-ui/core';


const DashboardRoute: FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  //return <DashboardPage idOrSlug={idOrSlug} />;
  const [activeButton, setActiveButton] = useState<string>('Dashboard');
  //const user = useSelector((state: RootState) => state.user);
  //console.log(user);
  const currentUser = useSelector<any, UserWithPermissionsAndRoles>(
    state => state.user,
  );
  //console.log(currentUser);

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
  };
  return (
    <div style={{ display: "flex" }}>
      {/* Left Panel with Buttons */}
      <div className="left-panel">
        <div className="button-container">
          <button
            className={`button ${activeButton === 'Dashboard' ? 'active' : ''}`}
            onClick={() => handleButtonClick('Dashboard')}
          >
            <img src="/static/assets/images/dashboard.png" alt="Icon" className="icon" />
            Dashboard
          </button>
          <button
            className={`button ${activeButton === 'Analytics' ? 'active' : ''}`}
            onClick={() => handleButtonClick('Analytics')}
          >
            <img src="/static/assets/images/Analytics.png" alt="Icon" className="icon" />
            Analytics
          </button>
          <button
            className={`button ${activeButton === 'Assert Model' ? 'active' : ''}`}
            onClick={() => handleButtonClick('Assert Model')}
          >
            <img src="/static/assets/images/asset.png" alt="Icon" className="icon" />
            Assert Model
          </button>
          <button
            className={`button ${activeButton === 'Alerts' ? 'active' : ''}`}
            onClick={() => handleButtonClick('Alerts')}
          >
            <img src="/static/assets/images/Alerts.png" alt="Icon" className="icon" />
            Alerts
          </button>
          <button
            className={`button ${activeButton === 'Reports' ? 'active' : ''}`}
            onClick={() => handleButtonClick('Reports')}
          >
            <img src="/static/assets/images/Alerts.png" alt="Icon" className="icon" />
            Reports
          </button>
        </div>
        <div className="divider"></div>
        <div className="user-management">
          <button
            className={`button ${activeButton === 'User Management' ? 'active' : ''}`}
            onClick={() => handleButtonClick('User Management')}
          >
            <img src="/static/assets/images/user.png" alt="Icon" className="icon" />
            User Management
          </button>
          <button
            className={`button ${activeButton === 'Configuration' ? 'active' : ''}`}
            onClick={() => handleButtonClick('Configuration')}
          >
            <img src="/static/assets/images/configuration.png" alt="Icon" className="icon" />
            Configuration
          </button>
        </div>
      </div>

      {/* Right Panel Content */}
      <div className="right-panel">
        {activeButton === 'Dashboard' ? (
          <DashboardPage idOrSlug={idOrSlug} />
        ) : activeButton === 'Configuration' ? (
          <div>
            <h2>This Configuration page is in development.</h2>
          </div>
        ) : activeButton === 'User Management' ? (
          <UserManagement />
        ) : activeButton === 'Alerts' ? (
          <AlertList
            addDangerToast={addDangerToast(t('Hello from Dashboard screen at DangerToast'))}
            addSuccessToast={addSuccessToast(t('Hello from Dashboard screen at SuccessToast'))}
            isReportEnabled={false}
            user={currentUser}
          />
        ) : activeButton === 'Reports' ? (
          <AlertList
            addDangerToast={addDangerToast(t('Hello from Dashboard screen at DangerToast'))}
            addSuccessToast={addSuccessToast(t('Hello from Dashboard screen at SuccessToast'))}
            isReportEnabled={true}
            user={currentUser}
          />

        ) : activeButton === 'Assert Model' ? (
          <div>
            <h2>This Asset Model page is in development.</h2>
          </div>
        ) : activeButton === 'Analytics' ? (
          <Analytics />
        ) : (
          <div>
            <h2>This page is in development.</h2>
          </div>
        )}
      </div>
    </div>
  );
};

//export default DashboardRoute;
export default DashboardRoute;