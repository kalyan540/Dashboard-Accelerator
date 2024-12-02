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
            <form className="modal-form">
              <input type="text" placeholder="Name" required />
              <input type="text" placeholder="Project" required />
              <input type="text" placeholder="Employee ID" required />
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
