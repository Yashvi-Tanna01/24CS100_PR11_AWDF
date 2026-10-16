import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [assignedUser, setAssignedUser] = useState('Maitri Sheta (D25CS120)');
  const [priority, setPriority] = useState('medium');
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  const [health, setHealth] = useState({ status: 'checking', service: 'backend', database: { status: 'checking' } });
  const [logs, setLogs] = useState([]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  const addLog = useCallback((type, message) => {
    const time = new Date().toISOString();
    setLogs((prev) => [
      { id: Date.now() + Math.random(), time, type, message },
      ...prev.slice(0, 15)
    ]);
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch {
      // Fallback
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
      addLog('api', `[GET /api/health] Stack is healthy. MongoDB state: ${data.database?.status || 'connected'}`);
    } catch (err) {
      setHealth({ status: 'offline', service: 'backend', database: { status: 'disconnected' } });
      addLog('error', `[Health Error] Backend unreachable: ${err.message}`);
    }
  }, [addLog]);

  useEffect(() => {
    fetchTasks();
    checkHealth();
    addLog('start', '[Stack Init] Docker compose services mapped on bridge network "app-network"');
  }, [fetchTasks, checkHealth, addLog]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          assignedUser: assignedUser.trim(),
          priority
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Task created in MongoDB! Persisted via volume "mongo-data".`, 'success');
        addLog('complete', `[POST /tasks 201] Saved "${data.task.title}" to MongoDB container.`);
        setTitle('');
        fetchTasks();
      } else {
        showToast(data.message || 'Error creating task', 'error');
        addLog('error', `[POST /tasks Error] ${data.message}`);
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
      addLog('error', `[Network Error] ${err.message}`);
    }
  };

  const handleDeleteTask = async (id, taskTitle) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast('Task deleted successfully', 'info');
        addLog('complete', `[DELETE /tasks/${id} 200] Removed "${taskTitle}".`);
        fetchTasks();
      } else {
        showToast(data.message || 'Error deleting task', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const isHealthy = health.status === 'healthy';
  const isDbOnline = health.database?.status === 'connected';

  return (
    <div className="container">
      {/* Header matching Practical 10 */}
      <header>
        <h1>Practical 11: Containerization with Docker and Docker Compose</h1>
        <p>Multi-container orchestration for React frontend, Express API & MongoDB</p>
      </header>

      {/* Notification Banner */}
      <div className={`toast ${toast.type} ${toast.visible ? '' : 'hidden'}`}>
        {toast.message}
      </div>

      <div className="grid-layout">
        {/* Left Column: Task Creation & Tasks List */}
        <div className="column">
          <div className="card">
            <h2>➕ Create Task (Containerized)</h2>
            <p className="card-desc">Saved directly to MongoDB container with persistent volume storage</p>

            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label htmlFor="task-title">Task Title *</label>
                <input
                  type="text"
                  id="task-title"
                  placeholder="e.g. Verify container orchestration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="task-user">Assigned Student / ID</label>
                <input
                  type="text"
                  id="task-user"
                  value={assignedUser}
                  onChange={(e) => setAssignedUser(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Create Task (POST /tasks)
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Existing Tasks (MongoDB: taskdb)</h2>
            <p className="card-desc">
              Persisted across container restarts in <code>mongo-data</code> volume
            </p>

            <ul className="tasks-list">
              {tasks.length === 0 ? (
                <li style={{ color: '#888', textAlign: 'center', padding: '12px' }}>
                  No tasks available.
                </li>
              ) : (
                tasks.map((t) => (
                  <li key={t._id} className="task-item">
                    <div className="task-info">
                      <span className="task-title">{t.title}</span>
                      <div className="task-meta">
                        <span>Assigned: {t.assignedUser || 'Maitri Sheta (D25CS120)'}</span>
                        <span className={`badge badge-${t.priority || 'medium'}`}>
                          {t.priority || 'medium'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteTask(t._id, t.title)}
                    >
                      Delete
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Right Column: Docker Compose Status & Diagnostics */}
        <div className="column">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2>🐳 Docker Compose Stack Status</h2>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" className="btn btn-sm btn-primary" onClick={checkHealth}>
                  Ping Stack
                </button>
                <button type="button" className="btn btn-sm btn-secondary" onClick={clearLogs}>
                  Clear
                </button>
              </div>
            </div>
            <p className="card-desc">
              Bridge Network: <code>app-network</code> &bull; Single Command: <code>docker-compose up</code>
            </p>

            {/* 3 Service Status Tiles */}
            <div className="docker-tiles">
              <div className="tile">
                <strong>frontend</strong>
                <span>React Vite (:5173)</span>
                <span className="tile-status online">Healthy</span>
              </div>
              <div className="tile">
                <strong>backend</strong>
                <span>Express API (:5000)</span>
                <span className={`tile-status ${isHealthy ? 'online' : 'pending'}`}>
                  {isHealthy ? 'Connected' : 'Connecting'}
                </span>
              </div>
              <div className="tile">
                <strong>mongodb</strong>
                <span>Mongo DB (:27017)</span>
                <span className={`tile-status ${isDbOnline ? 'online' : 'pending'}`}>
                  {isDbOnline ? 'Mounted' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Logs Container */}
            <div className="logs-container">
              {logs.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
                  No logs yet. Click "Ping Stack" or create a task to observe container logs.
                </p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="log-entry">
                    <span className="log-time">{log.time}</span>
                    <span className={`log-type-${log.type}`}>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <h2>🧠 How It Works (Docker Orchestration)</h2>
            <ol style={{ fontSize: '0.85rem', paddingLeft: '20px', color: '#4a5568', lineHeight: 1.6 }}>
              <li>
                <strong>Step 1:</strong> Frontend (React container on port 5173) sends requests to <code>/api</code>.
              </li>
              <li>
                <strong>Step 2:</strong> Requests route over Docker bridge network <code>app-network</code> to backend container on port 5000.
              </li>
              <li>
                <strong>Step 3:</strong> Backend connects to MongoDB using Compose service name <code>mongodb://mongodb:27017/taskdb</code>.
              </li>
              <li>
                <strong>Step 4:</strong> MongoDB persists data inside named volume <code>mongo-data</code>, keeping tasks safe even after restart!
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Footer matching Practical 10 */}
      <footer>
        <p>AWDF Practical 11 &bull; Maitri Sheta (D25CS120) &bull; CSE, CSPIT &bull; Charotar University of Science and Technology</p>
      </footer>
    </div>
  );
}

export default App;
