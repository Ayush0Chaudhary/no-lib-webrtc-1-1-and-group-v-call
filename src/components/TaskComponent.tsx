import React, { useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';

const TaskComponent = ({ task, updateTask }) => {
  const [expandedTask, setExpandedTask] = useState(false);
  const [result, setResult] = useState('');
  const [classification, setClassification] = useState('');
  const [note, setNotes] = useState('');

  const handleToggleDetails = () => {
    setExpandedTask(!expandedTask);
  };

  function parseDetails(detailsString) {
    const detailsArray = detailsString.split(',');
    const detailsObject = {};
  
    for (let i = 0; i < detailsArray.length; i += 2) {
      const key = detailsArray[i];
      const value = detailsArray[i + 1];
      detailsObject[key] = value;
    }
  
    return detailsObject;
  }

  return (
    <>
      <div className='task-header-unexpanded' onClick={handleToggleDetails}>
        <div className='dropdown-arrow'>
          <IoIosArrowBack fontSize='15px' />
        </div>
        <h3 className='task-title'>{task.title}</h3>
      </div>
      {expandedTask && (
        <div className={`task-details active`}>
          <p className='what-to-do'>What To Do</p>
          <p>{task.description}</p>
          <p className='what-to-do details'>DETAILS</p>
          <div className='specs'>
            {Object.entries(parseDetails(task.details)).map(([key, value]) => (
              <div className='specification' key={key}>
                <div className='spec-top'>
                  <p>{key}</p>
                </div>
                <div className='spec-bottom'>
                  <p>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ padding: '20px' }} className='notes-container-full'>
        <hr />
        <h1 className='font-bold text-3xl mb-2'>Notes</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '3vw' }}>
          <div className='select-container'>
            <p>Result</p>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className='option-selector'
            >
              <option value=''>Select</option>
              <option value='Pass'>Pass</option>
              <option value='Fail'>Fail</option>
              <option value='Other'>Other</option>
            </select>
          </div>
          <div className='select-container'>
            <p>Classification?</p>
            <select
              value={classification === null ? '' : classification}
              onChange={(e) => setClassification(e.target.value)}
              className='option-selector'
            >
              <option value=''>Select</option>
              <option value='Bug'>Bug</option>
              <option value='Insight'>Insight</option>
              <option value='Other'>Other</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '20px' }} className='notes-container'>
          <p>Notes</p>
          <input
            value={note}
            onChange={(e) => setNotes(e.target.value)}
            placeholder='Capture your notes here...'
            style={{ width: '34vw' }}
            className='notes'
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className='select-container'></div>
          <div className='select-container'>
            <div className='rounded-button' onClick={updateTask}>
              NEXT TASK
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskComponent;
