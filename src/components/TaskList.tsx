import React, { useEffect, useState } from 'react';
import './TaskList.css'; // Import CSS file for styling
import { MdArrowForwardIos } from 'react-icons/md';
import { IoIosArrowUp, IoIosArrowBack } from 'react-icons/io';
import { basicAxios } from '@/services/basicAxios';
import API_ENDPOINTS from '@/services/apiEndpoints';
import { Task } from '@/types';

const TaskList = () => {
  const [result, setResult] = useState('');
  const [classification, setClassification] = useState('');
  const [note, setNotes] = useState('');
  const [TaskType, setTaskType] = useState('todo');
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [ResultValue, setResultValue] = useState('');
  const [ClassificationValue, setClassificationValue] = useState('');
  const [inputValue1, setInputValue1] = useState('');
  const [inputValue2, setInputValue2] = useState('');
  const [additionalInput, setAdditionalInput] = useState('');


  const [todoActive, setTodoActive] = useState('todo');
  const [expandedTask, setExpandedTask] = useState(null);

  const handleToggleDetails = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const handleOptionChange = (option) => {
    setTodoActive(option);
  };

    const handleSelectChange1 = (event) => {
    setResultValue(event.target.value);
    if (event.target.value !== 'Other') {
      setInputValue1('');
    }
  };

  const handleSelectChange2 = (event) => {
    setClassificationValue(event.target.value);
    if (event.target.value !== 'Other') {
      setInputValue2('');
    }
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

  // const taskData = [
  //   {
  //     id: 1,
  //     title: 'Task 1',
  //     description: 'This is task 1 description...',
  //     status: 'todo'
  //   },
  //   {
  //     id: 2,
  //     title: 'Task 2',
  //     description: 'This is task 2 description...',
  //     status: 'todo'
  //   },
  //   {
  //     id: 3,
  //     title: 'Task 3',
  //     description: 'This is task 3 description...',
  //     status: 'todo'
  //   },
  //   {
  //     id: 4,
  //     title: 'Task 4',
  //     description: 'This is task 4 description...',
  //     status: 'todo'
  //   },
  //   {
  //     id: 5,
  //     title: 'Task 5',
  //     description: 'This is task 5 description...',
  //     status: 'todo'
  //   },
  //   {
  //     id: 6,
  //     title: 'Task 6',
  //     description: 'This is task 6 description...',
  //     status: 'todo'
  //   },
  //   {
  //     id: 7,
  //     title: 'Task 7',
  //     description: 'This is task 7 description...',
  //     status: 'todo'
  //   },
  //   {
  //     id: 8,
  //     title: 'Task 8',
  //     description: 'This is task 8 description...',
  //     status: 'todo'
  //   },
  //   {
  //     id: 9,
  //     title: 'Task 9',
  //     description: 'This is task 9 description...',
  //     status: 'todo'
  //   },
  //   {
  //     id: 10,
  //     title: 'Task 10',
  //     description: 'This is task 10 description...',
  //     status: 'todo'
  //   },
  //   {
  //     id: 11,
  //     title: 'Task 11',
  //     description: 'This is task 11 description...',
  //     status: 'completed'
  //   },
  //   {
  //     id: 12,
  //     title: 'Task 12',
  //     description: 'This is task 12 description...',
  //     status: 'completed'
  //   },
  //   {
  //     id: 13,
  //     title: 'Task 13',
  //     description: 'This is task 13 description...',
  //     status: 'completed'
  //   },
  //   {
  //     id: 14,
  //     title: 'Task 14',
  //     description: 'This is task 14 description...',
  //     status: 'completed'
  //   },
  //   {
  //     id: 15,
  //     title: 'Task 15',
  //     description: 'This is task 15 description...',
  //     status: 'completed'
  //   },
  //   {
  //     id: 16,
  //     title: 'Task 16',
  //     description: 'This is task 16 description...',
  //     status: 'completed'
  //   },
  //   {
  //     id: 17,
  //     title: 'Task 17',
  //     description: 'This is task 17 description...',
  //     status: 'completed'
  //   },
  //   {
  //     id: 18,
  //     title: 'Task 18',
  //     description: 'This is task 18 description...',
  //     status: 'completed'
  //   },
  //   {
  //     id: 19,
  //     title: 'Task 19',
  //     description: 'This is task 19 description...',
  //     status: 'completed'
  //   },
  //   {
  //     id: 20,
  //     title: 'Task 20',
  //     description: 'This is task 20 description...',
  //     status: 'completed'
  //   },
  // ];

  useEffect(() => {
    // Fetch task data from API
    const getTaskData = async () => {
      try {
        const res = await basicAxios('samosa/getTasks');
        const data = res.data;
        console.log('Task data:', data, 'res', res);
        setTaskData(data);
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    };
    getTaskData();
    const Task = {
        _id: 1,
        title: "Title",
        description: "desc cnisnciksnciknskcnksncksnck cnskcnskcnksncksnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn",
        details: "Device,Google Maps,Software Version,Android 13,Build Version,TD2A.230203.002 (95583342)",
        result: "",
        classification: "class",
        notes: "notes"
    };
    setTaskData([Task]);
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

  const todoTasks = taskData.filter(task => task.result === null);
  const CompletedTasks = taskData.filter(task => task.result !== null);
  const tasksToDisplay = todoActive === 'todo' ? todoTasks : CompletedTasks;
  return (
    <div className='task-list-container'>
      <div className='heading'>Tasks</div>
      {expandedTask === null ? (
        <div >
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
        <div className='task-list'>
          {tasksToDisplay.map((task) => (
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
                <h3 className='task-title'>{task.title}</h3>
              </div>
              <div className={`task-details active`}> 
                <p className='what-to-do'>What To Do</p>
                <p>{task.description}</p>
                <p className='what-to-do details'>DETAILS</p>
                <div className='specs'>
                    {Object.entries(parseDetails(task.details)).map(([key, value]) => (
                      <div className='specification'>
                        <div className="spec-top">
                          <p>{key}</p>
                        </div>
                        <div className="spec-bottom">
                          <p>{value}</p>
                        </div>
                     </div>
                             ))}
                </div>
              </div>
              {/* Add you component here! */}
              <div style={{ padding: '20px' }} className='notes-container-full'>
              <hr />
                <h1 className='font-bold text-3xl mb-2'>Notes</h1>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap:'3vw' }}>
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

              {/* Add you component here! */} 
              

            </>
          ))
      )}
    </div>
  );
};

export default TaskList;
