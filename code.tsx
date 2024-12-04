import React, { useEffect, useState, createRef } from 'react';
import { styled } from '@superset-ui/core';
import { SupersetPluginChartPageProps, SupersetPluginChartPageStylesProps } from './types';

const Styles = styled.div<SupersetPluginChartPageStylesProps>`
  background-color: ${({ theme }) => theme.colors.secondary.light2};
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.gridUnit * 3}px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
  }

  .filters {
    display: flex;
    gap: ${({ theme }) => theme.gridUnit * 2}px;
    margin-bottom: ${({ theme }) => theme.gridUnit * 2}px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    th,
    td {
      padding: 8px;
      border: 1px solid #ccc;
      text-align: left;
    }

    th {
      position: sticky;
      top: 0;
      background-color: white;
      z-index: 1;
    }

    tbody tr {
      background-color: white;
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    width: 300px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .modal-close {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 18px;
    cursor: pointer;
    color: #999;
  }

  .modal-form {
    display: flex;
    flex-direction: column;
    gap: 12px;

    input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    button {
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  }
`;

export default function SupersetPluginChartPage(props: SupersetPluginChartPageProps) {
  const { data, height, width } = props;

  const rootElem = createRef<HTMLDivElement>();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredData, setFilteredData] = useState(data);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = Object.keys(data[0] || {});
  const [formData, setFormData] = useState({
    functionName: '',
    group: '',
    business: '',
    assessmentLead: '',
    assessmentID: '',
    maturity: '',
    assessmentDate: '',
    status: '',
    actions: '',
    assessmentType: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Update the filtered data based on selected filters
  useEffect(() => {
    let updatedData = data;

    Object.entries(filters).forEach(([column, value]) => {
      if (value) {
        updatedData = updatedData.filter((row) => row[column] === value);
      }
    });

    setFilteredData(updatedData);
  }, [filters, data]);

  // Handle filter changes
  const handleFilterChange = (column: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  return (
    <Styles ref={rootElem} height={height} width={width}>
      <div className="header">
        <button
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={() => setIsModalOpen(true)}
        >
          Create Assessment
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span
              className="modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </span>
            <form
              className="modal-form"
              onSubmit={(e) => {
                e.preventDefault();
                const isAllFilled = Object.values(formData).every((value) => value !== '');
                if (!isAllFilled) {
                  alert("Please fill out all fields!");
                  return;
                }
                console.log("Form Data Submitted:", formData);
                console.log("Code.tsx");
                setFormData({
                  functionName: '',
                  group: '',
                  business: '',
                  assessmentLead: '',
                  assessmentID: '',
                  maturity: '',
                  assessmentDate: '',
                  status: '',
                  actions: '',
                  assessmentType: '',
                });
                setIsModalOpen(false);
              }}
            >
              <input
                type="text"
                placeholder="Function Name"
                value={formData.functionName}
                onChange={(e) => handleInputChange('functionName', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Group"
                value={formData.group}
                onChange={(e) => handleInputChange('group', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Business"
                value={formData.business}
                onChange={(e) => handleInputChange('business', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Assessment Lead"
                value={formData.assessmentLead}
                onChange={(e) => handleInputChange('assessmentLead', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Assessment ID"
                value={formData.assessmentID}
                onChange={(e) => handleInputChange('assessmentID', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Maturity"
                value={formData.maturity}
                onChange={(e) => handleInputChange('maturity', e.target.value)}
                required
              />
              <input
                type="date"
                placeholder="Assessment Date"
                value={formData.assessmentDate}
                onChange={(e) => handleInputChange('assessmentDate', e.target.value)}
                required
              />
              <div>
                <label>Status:</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="Published"
                      checked={formData.status === 'Published'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      required
                    />
                    Published
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="In Progress"
                      checked={formData.status === 'In Progress'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      required
                    />
                    In Progress
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="Pending"
                      checked={formData.status === 'Pending'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      required
                    />
                    Pending
                  </label>
                </div>
              </div>
              <input
                type="text"
                placeholder="Actions"
                value={formData.actions}
                onChange={(e) => handleInputChange('actions', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Assessment Type"
                value={formData.assessmentType}
                onChange={(e) => handleInputChange('assessmentType', e.target.value)}
                required
              />
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}

      <div className="filters">
        {columns.map((col) => (
          <div key={col} style={{ flex: 1 }}>
            <select
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor: '#f9f9f9',
              }}
              value={filters[col] || ''}
              onChange={(e) => handleFilterChange(col, e.target.value)}
            >
              <option value="" disabled>
                {col}
              </option>
              {[...new Set(data.map((row) => row[col]))].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto', maxHeight: '400px', width: '100%' }}>
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col) => (
                  <td key={col}>{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Styles>
  );
}
