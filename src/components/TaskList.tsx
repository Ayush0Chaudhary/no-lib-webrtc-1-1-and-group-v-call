import React, { useEffect, useState } from 'react';
import './TaskList.css'; // Import CSS file for styling
import { MdArrowForwardIos } from 'react-icons/md';
import { IoIosArrowUp, IoIosArrowBack } from 'react-icons/io';
import { basicAxios } from '@/services/basicAxios';
import API_ENDPOINTS from '@/services/apiEndpoints';
import TaskComponent from '@/components/TaskComponent';
import { Task } from '@/types';

const TaskList = () => {
  const [result, setResult] = useState('');
  const [classification, setClassification] = useState('');
  const [note, setNotes] = useState('');
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [todoActive, setTodoActive] = useState('todo');
  const [expandedTask, setExpandedTask] = useState(null);

  const handleToggleDetails = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const handleOptionChange = (option) => {
    setTodoActive(option);
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
        result: "null",
        classification: "class",
        notes: "notes"
    };
    setTaskData([Task]);
  }, []);

  // const filteredTasks = taskData.filter(task => task.status === selectedOption);

  const todoTasks = taskData.filter(task => task.result === 'null');
  const CompletedTasks = taskData.filter(task => task.result !== 'null');
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
              <TaskComponent task={task}/>
            </>
          ))
      )}
    </div>
  );
};

export default TaskList;
