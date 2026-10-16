import React from 'react';
import './TaskList.css';

function TaskList({ tasks, onToggleComplete, onEditTask, onDeleteTask, filter, setFilter, search, setSearch }) {
  return (
    <div className="task-list-container">
      {/* Search and Filters Bar */}
      <div className="task-controls">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search container tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({tasks.length})
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐳</div>
          <h4>No Containerized Tasks Found</h4>
          <p>Create your first task above to verify end-to-end flow: Frontend ──► Backend ──► MongoDB.</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <div key={task._id} className={`task-item-card ${task.completed ? 'is-completed' : ''}`}>
              <div className="task-item-left">
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={task.completed}
                  onChange={() => onToggleComplete(task._id, !task.completed)}
                  title={task.completed ? 'Mark pending' : 'Mark completed'}
                />
                <div className="task-content">
                  <h4 className="task-title">{task.title}</h4>
                  {task.description && <p className="task-description">{task.description}</p>}
                  <div className="task-tags">
                    <span className={`priority-badge priority-${task.priority}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="date-tag">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                    <span className="mongo-tag">MongoDB: <code>taskdb</code></span>
                  </div>
                </div>
              </div>

              <div className="task-item-actions">
                <button
                  className="task-edit-btn"
                  onClick={() => onEditTask(task)}
                  title="Edit Task Details"
                >
                  ✏️ Edit
                </button>
                <button
                  className="task-delete-btn"
                  onClick={() => onDeleteTask(task._id)}
                  title="Delete Task"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;
