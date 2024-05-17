import React, { useState } from 'react';
import './TaskList.css'; // Import CSS file for styling
import { MdArrowForwardIos } from "react-icons/md";
import { IoIosArrowUp } from "react-icons/io";

const TaskList = () => {
  const [selectedOption, setSelectedOption] = useState('todo');

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const [expandedTask, setExpandedTask] = useState(null);

  const handleToggleDetails = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const taskData = [
    {
      id: 1,
      title: 'Task 1',
      description: 'This is task 1 description...',
      status: 'todo'
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'This is task 2 description...',
      status: 'todo'
    },
    {
      id: 3,
      title: 'Task 3',
      description: 'This is task 3 description...',
      status: 'todo'
    },
    {
      id: 4,
      title: 'Task 4',
      description: 'This is task 4 description...',
      status: 'todo'
    },
    {
      id: 5,
      title: 'Task 5',
      description: 'This is task 5 description...',
      status: 'todo'
    },
    {
      id: 6,
      title: 'Task 6',
      description: 'This is task 6 description...',
      status: 'todo'
    },
    {
      id: 7,
      title: 'Task 7',
      description: 'This is task 7 description...',
      status: 'todo'
    },
    {
      id: 8,
      title: 'Task 8',
      description: 'This is task 8 description...',
      status: 'todo'
    },
    {
      id: 9,
      title: 'Task 9',
      description: 'This is task 9 description...',
      status: 'todo'
    },
    {
      id: 10,
      title: 'Task 10',
      description: 'This is task 10 description...',
      status: 'todo'
    },
    {
      id: 11,
      title: 'Task 11',
      description: 'This is task 11 description...',
      status: 'completed'
    },
    {
      id: 12,
      title: 'Task 12',
      description: 'This is task 12 description...',
      status: 'completed'
    },
    {
      id: 13,
      title: 'Task 13',
      description: 'This is task 13 description...',
      status: 'completed'
    },
    {
      id: 14,
      title: 'Task 14',
      description: 'This is task 14 description...',
      status: 'completed'
    },
    {
      id: 15,
      title: 'Task 15',
      description: 'This is task 15 description...',
      status: 'completed'
    },
    {
      id: 16,
      title: 'Task 16',
      description: 'This is task 16 description...',
      status: 'completed'
    },
    {
      id: 17,
      title: 'Task 17',
      description: 'This is task 17 description...',
      status: 'completed'
    },
    {
      id: 18,
      title: 'Task 18',
      description: 'This is task 18 description...',
      status: 'completed'
    },
    {
      id: 19,
      title: 'Task 19',
      description: 'This is task 19 description...',
      status: 'completed'
    },
    {
      id: 20,
      title: 'Task 20',
      description: 'This is task 20 description...',
      status: 'completed'
    },
  ];

  const filteredTasks = taskData.filter(task => task.status === selectedOption);

  return (
    <div className="task-list-container">
      <div className='heading'>Tasks</div>
      <div className="task-toggle">
        <div className={`task-toggle-option ${selectedOption === 'todo' && 'active'}`} onClick={() => handleOptionChange('todo')}>
          To Do
        </div>
        <div className={`task-toggle-option ${selectedOption === 'completed' && 'active'}`} onClick={() => handleOptionChange('completed')}>
          Completed
        </div>
      </div>
      <div className="task-list">
        {filteredTasks.map(task => (
          <div key={task.id} className="task-item">
            <div className="task-header" onClick={() => handleToggleDetails(task.id)}>
              <h3>{task.title}</h3>
              <div className="dropdown-arrow">{expandedTask === task.id ? <IoIosArrowUp fontSize="15px"/> : <MdArrowForwardIos fontSize="12px"/> }</div>
            </div>
            <div className={`task-details ${expandedTask === task.id ? 'active' : ''}`}>
              <p>{task.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
