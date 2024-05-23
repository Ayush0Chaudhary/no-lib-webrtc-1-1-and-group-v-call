import React, { useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import './TaskList.css';
import { basicAxios } from '@/services/basicAxios';
import API_ENDPOINTS from '@/services/apiEndpoints';

const TaskComponent = ({ task, closeTask }) => {
  const [expandedTask, setExpandedTask] = useState(false);
  const [result, setResult] = useState(task.result);
  const [classification, setClassification] = useState(task.classification);
  const [note, setNotes] = useState();



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

  const updateTask = async () => {
    const body = {
      projectName: 'samosa',
      _id: task._id,
      result: result,
      classification: classification,
      notes: note,
    };
    const config = {
      method: 'POST',
      data: body
    }
    console.log(expandedTask, 'ffffffffffffffffff');
    
    const res = await basicAxios(API_ENDPOINTS.UPDATE_TASK, config);
    console.log(res);
    setResult('');
    setClassification('');
    setNotes('');
    closeTask();
  };


  return (
    <>
      
        <div className={`task-details active`}>
          <p className='what-to-do'>WHAT TO DO</p>
          <p className='task-description'>{task.description}</p>
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
      
      <div style={{ padding: '10px' }} className='notes-container-full'>
        <hr />
        <h1 className='font-bold text-2xl mb-2'>Notes</h1>
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
        <div style={{ marginTop: '10px' }} className='notes-container'>
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
            <button className='rounded-button' disabled={result=='' || classification==''} onClick={updateTask}>
              NEXT TASK
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskComponent;
