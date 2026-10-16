import React, { useState } from 'react';
import './TaskForm.css';

function TaskForm({ onTaskCreated, onError }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      onError('Please provide a task title (minimum 3 characters).');
      return;
    }

    setLoading(true);
    try {
      await onTaskCreated({ title, description, priority });
      setTitle('');
      setDescription('');
      setPriority('medium');
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-card">
      <div className="task-form-header">
        <h3>Add New Task</h3>
        <span className="validation-pill">MongoDB Persisted 📦</span>
      </div>
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-row-main">
          <input
            type="text"
            className="task-input-title"
            placeholder="What needs to be done? (e.g. Verify multi-stage build & mongo volume)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
          />
          <select
            className="task-select-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button type="submit" className="task-submit-btn" disabled={loading}>
            {loading ? 'Adding...' : '+ Add Task'}
          </button>
        </div>
        <textarea
          className="task-textarea"
          placeholder="Optional notes, container verification notes or details..."
          rows="2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </div>
  );
}

export default TaskForm;
