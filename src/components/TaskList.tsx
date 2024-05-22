import React, { useEffect, useState } from 'react';
import './TaskList.css'; // Import CSS file for styling
import { MdArrowForwardIos } from 'react-icons/md';
import { IoIosArrowUp, IoIosArrowBack } from 'react-icons/io';
import { basicAxios } from '@/services/basicAxios';
import API_ENDPOINTS from '@/services/apiEndpoints';
import { Task } from '@/types';

const TaskList = () => {
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [result, setResult] = useState('');
  const [classification, setClassification] = useState('');
  const [note, setNotes] = useState('');

  const [todoActive, setTodoActive] = useState('todo');
  const [expandedTask, setExpandedTask] = useState(null);

  const handleToggleDetails = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const handleOptionChange = (option) => {
    setTodoActive(option);
  };

  useEffect(() => {
    // Fetch task data from API
    const getTaskData = async () => {
      try {
        const res = await basicAxios(API_ENDPOINTS.GET_PROJECT_TASK + '/samosa');
        const data = res.data;
        console.log('Task data:', data, 'res', res);
        setTaskData(data);
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    };
    getTaskData();
  }, []);

  // const filteredTasks = taskData.filter(task => task.status === selectedOption);
  const updateTask = async () => {
    const body = {
      projectName: 'samosa',
      _id: expandedTask,
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
  };

  return (
    <div className='task-list-container'>
      <div className='heading'>Tasks</div>
      <div className='task-toggle'>
        <div
          className={`task-toggle-option ${todoActive === 'todo' && 'active'}`}
          onClick={() => handleOptionChange('todo')}
        >
          To Do
        </div>
        <div
          className={`task-toggle-option ${todoActive === 'completed' && 'active'}`}
          onClick={() => handleOptionChange('completed')}
        >
          Completed
        </div>
      </div>

      {expandedTask === null ? (
        <div className='task-list'>
          {taskData.map((task) => (
            <div key={task._id} className='task-item'>
              <div className='task-header' onClick={() => handleToggleDetails(task._id)}>
                <h3>{task.title}</h3>
                <div className='dropdown-arrow'>
                  {expandedTask === task._id ? (
                    <IoIosArrowUp fontSize='15px' />
                  ) : (
                    <MdArrowForwardIos fontSize='12px' />
                  )}
                </div>
              </div>
              <div className={`task-details ${expandedTask === task._id ? 'active' : ''}`}>
                <p>{task.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        taskData
          .filter((t) => t._id === expandedTask)
          .map((task) => (
            <>
              <div className='task-header-unexpanded' onClick={() => handleToggleDetails(task._id)}>
                <div className='dropdown-arrow'>
                  <IoIosArrowBack fontSize='15px' />
                </div>
                <h3>{task.title}</h3>
              </div>
              <div className={`task-details active`}>
                <p>{task.description}</p>
              </div>
              {/* Add you component here! */}
              <hr />
              <div style={{ padding: '20px' }}>
                <h1 className='font-bold text-2xl'>Note</h1>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className='select-container'>
                    <p>Result</p>
                    <select
                      value={result}
                      onChange={(e) => setResult(e.target.value)}
                      className='option-selector'
                    >
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
                    style={{ width: '100%' }}
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
          ))
      )}
    </div>
  );
};

export default TaskList;
