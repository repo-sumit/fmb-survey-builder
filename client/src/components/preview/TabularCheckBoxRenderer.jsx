import React, { useState } from 'react';

const TabularCheckBoxRenderer = ({ question, language }) => {
  const [selections, setSelections] = useState({});
  
  // Parse table headers and questions
  const tableHeaders = question.tableHeaderValue?.split('|').filter(h => h.trim()) || [];
  const tableQuestions = question.tableQuestionValue?.split('\n')
    .map(line => {
      const [key, value] = line.split(':');
      return { key: key?.trim(), value: value?.trim() };
    })
    .filter(q => q.key && q.value) || [];

  const handleCheckboxChange = (rowIdx, colIdx) => {
    const key = `${rowIdx}-${colIdx}`;
    setSelections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="tabular-checkbox-renderer">
      <table className="preview-table">
        <thead>
          <tr>
            <th></th>
            {tableHeaders.map((header, idx) => (
              <th key={idx}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableQuestions.map((tq, rowIdx) => (
            <tr key={rowIdx}>
              <td className="row-label">{tq.value}</td>
              {tableHeaders.map((_, colIdx) => (
                <td key={colIdx}>
                  <input
                    type="checkbox"
                    checked={selections[`${rowIdx}-${colIdx}`] || false}
                    onChange={() => handleCheckboxChange(rowIdx, colIdx)}
                    className="preview-checkbox"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TabularCheckBoxRenderer;
