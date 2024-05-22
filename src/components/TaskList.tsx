import React, { useEffect, useState } from 'react';
import './TaskList.css'; // Import CSS file for styling
import { MdArrowForwardIos } from 'react-icons/md';
import { IoIosArrowUp, IoIosArrowBack } from 'react-icons/io';
import { basicAxios } from '@/services/basicAxios';
import API_ENDPOINTS from '@/services/apiEndpoints';
import { Task } from '@/types';

const TaskList = () => {
  const [selectedOption, setSelectedOption] = useState('todo');
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [selectedOption1, setSelectedOption1] = useState('');
  const [selectedOption2, setSelectedOption2] = useState('');
  const [inputValue1, setInputValue1] = useState('');
  const [inputValue2, setInputValue2] = useState('');
  const [additionalInput, setAdditionalInput] = useState('');

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const [expandedTask, setExpandedTask] = useState(null);

  const handleToggleDetails = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

    const handleSelectChange1 = (event) => {
    setSelectedOption1(event.target.value);
    if (event.target.value !== 'Other') {
      setInputValue1('');
    }
  };

  const handleSelectChange2 = (event) => {
    setSelectedOption2(event.target.value);
    if (event.target.value !== 'Other') {
      setInputValue2('');
    }
  };

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
    // const getTaskData = async () => {
    //   try {
    //     const res = await basicAxios(API_ENDPOINTS.GET_PROJECT_TASK + '/samosa');
    //     const data = res.data;
    //     console.log('Task data:', data, 'res', res);
    //     setTaskData(data);
    //   } catch (error) {
    //     console.error('Error fetching task data:', error);
    //   }
    // };
    // getTaskData();
    const Task = {
      _id: 1,
      title: "TASK TITLE",
      description: "TASK DESCRIPTION",
      details: "details1",
      result: "results1",
      classification: "classification1",
      notes: "nottesss1"
    }
    setTaskData([Task]);
  }, []);

  // const filteredTasks = taskData.filter(task => task.status === selectedOption);

  return (
    <div className='task-list-container'>
      <div className='heading'>Tasks</div>
      <div className='task-toggle'>
        <div
          className={`task-toggle-option ${selectedOption === 'todo' && 'active'}`}
          onClick={() => handleOptionChange('todo')}
        >
          To Do
        </div>
        <div
          className={`task-toggle-option ${selectedOption === 'completed' && 'active'}`}
          onClick={() => handleOptionChange('completed')}
        >
          Completed
        </div>
      </div>
      
      { expandedTask === null ? (
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
      <div style={{ display: 'flex' ,justifyContent: 'space-between'}}>
        <div className='select-container'>
            <p>Result</p>
            <select value={selectedOption1} onChange={handleSelectChange1} className='option-selector'>
              <option value="Option1">Pass</option>
              <option value="Option2">Fail</option>
              <option value="Other">Other</option>
            </select>
        </div>
        <div className='select-container'>
            <p>Classification?</p>
            <select value={selectedOption2} onChange={handleSelectChange2} className='option-selector'>
              <option value="Option1">Bug</option>
              <option value="Option2">Insight</option>
              <option value="Other">Other</option>
            </select>
        </div>
      </div>
      <div style={{ marginTop: '20px' }} className='notes-container'>
        <p>Notes</p>
        <input
          value={additionalInput}
          onChange={(e) => setAdditionalInput(e.target.value)}
          placeholder="Capture your notes here..."
          style={{ width: '100%' }}
          className='notes'
        />
      </div>
    </div>
            </>
          ))
      )}
    </div>
  );
};

export default TaskList;
