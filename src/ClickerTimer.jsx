import { useState, useEffect } from "react";
import { color, motion } from "framer-motion";

export default function ClickerTimer() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [history, setHistory] = useState([]);
  const [hasShown25MinReminder, setHasShown25MinReminder] = useState(false);
  
  
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [showTaskInput, setShowTaskInput] = useState(false);

  const clickSound = new Audio("click.mp3");
  clickSound.load();
  const deleteSound = new Audio("delete.wav");
  deleteSound.load();
  const breakReminder = new Audio("reminder.mp3");
  breakReminder.load();

  useEffect(() => {
    if (!isRunning || isPaused) return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  // Check for 25-minute break reminder
  useEffect(() => {
    if (isRunning && !isPaused && seconds === 1500 && !hasShown25MinReminder) { // 1500 seconds = 25 minutes
      breakReminder.play().catch(err => console.log(err));
      alert("⏰ Time for a break! You've been working for 25 minutes. Take a 5-minute break to recharge! 💪");
      setHasShown25MinReminder(true);
    }
  }, [seconds, isRunning, isPaused, hasShown25MinReminder]);

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    setCount(0);
    setSeconds(0);
    setHasShown25MinReminder(false);
    clickSound.play().catch(err => console.log(err));
  };

  const pauseTimer = () => {
    setIsPaused(true);
    clickSound.play().catch(err => console.log(err));
  };

  const resumeTimer = () => {
    setIsPaused(false);
    clickSound.play().catch(err => console.log(err));
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    breakReminder.play().catch(err => console.log(err));
    if (count > 0) {
      const tasksPerHour = seconds > 0 ? (count / seconds) * 3600 : 0;
      const productivityLevel = getProductivityLevel(tasksPerHour).level;
      
      const session = {
        count,
        seconds,
        date: new Date().toLocaleString(),
        productivity: productivityLevel
      };
      const newHistory = [...history, session];
      setHistory(newHistory);
    }
  };

  const clearHistory = () => {
    deleteSound.play().catch(err => console.log(err));
    setHistory([]);
  };

  // Task management functions
  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask = {
        id: Date.now(),
        text: newTaskText.trim(),
        completed: false,
        createdAt: new Date().toLocaleString()
      };
      setTasks([...tasks, newTask]);
      setNewTaskText("");
      setShowTaskInput(false);
      clickSound.play().catch(err => console.log(err));
    }
  };

  const toggleTask = (taskId) => {
    // Don't allow task completion while paused
    if (isPaused) return;
    clickSound.play().catch(err => console.log(err));
    
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    
    // If marking as complete and timer is running, increment count
    const task = tasks.find(t => t.id === taskId);
    if (!task.completed && isRunning) {
      setCount(count + 1);
      clickSound.play().catch(err => console.log(err));
    }
  };

  const deleteTask = (taskId) => {
    deleteSound.play().catch(err => console.log(err));
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const clearCompletedTasks = () => {
    deleteSound.play().catch(err => console.log(err));
    setTasks(tasks.filter(task => !task.completed));
  };
    // Format time as HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Get productivity level based on tasks per hour
  const getProductivityLevel = (tasksPerHour) => {
    if (tasksPerHour >= 3) return { level: "Super Productive", emoji: "🔥🔥", message: "You're on Fire! 🔥🔥" };
    if (tasksPerHour >= 1.5) return { level: "Productive", emoji: "💪", message: "Well Done, Keep Going 💪" };
    return { level: "Not Enough Productive", emoji: "⚡", message: "Warming Up ⚡" };
  };

  const tasksPerHour = seconds > 0 ? (count / seconds) * 3600 : 0;
  const productivity = seconds > 0 ? ((count / seconds) * 60).toFixed(1) : 0;
  const completedTasksCount = tasks.filter(t => t.completed).length;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Title with diagonal v2 watermark */}
        <div style={styles.titleWrapper}>
          <h1 style={styles.title}>G!</h1>
          <span style={styles.version}>v2</span>
          <p style={styles.author}>by: JPDEV</p>
        </div>
        

        <motion.p
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          style={styles.count}
        >
          Tasks Completed: {count}
        </motion.p>

        <p style={styles.timer}>
          {formatTime(seconds)} {isPaused && <span style={styles.pausedText}>(Paused)</span>}
        </p>
        <h2 style={styles.productivity}>Productivity Score: {getProductivityLevel(tasksPerHour).message}</h2>

        {!isRunning ? (
          <button style={{ ...styles.btn, ...styles.startBtn }} onClick={startTimer}>Start</button>
        ) : (
          <>
            {!isPaused ? (
              <button style={{ ...styles.btn, ...styles.pauseBtn }} onClick={pauseTimer}>
                Pause ⏸️
              </button>
            ) : (
              <button style={{ ...styles.btn, ...styles.resumeBtn }} onClick={resumeTimer}>
                Resume ▶️
              </button>
            )}
            <button style={{ ...styles.btn, ...styles.stopBtn }} onClick={stopTimer}>
              It's a wrap!
              <p style={styles.instruction}>Click this button if you're done.</p>
            </button>
          </>
        )}

        {/* Task Management Section */}
        <div style={styles.taskSection}>
          <div style={styles.taskHeader}>
            <h2 style={styles.sectionTitle}>My Tasks ({completedTasksCount}/{tasks.length})</h2>
            <button 
              style={{ ...styles.btn, ...styles.addTaskBtn }} 
              onClick={() => setShowTaskInput(!showTaskInput)}
            >
              {showTaskInput ? "Cancel" : "+ Add Task"}
            </button>
          </div>

          {showTaskInput && (
            <div style={styles.taskInputWrapper}>
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Enter your task..."
                style={styles.taskInput}
                autoFocus
              />
              <button style={{ ...styles.btn, ...styles.saveTaskBtn }} onClick={addTask}>
                Save
              </button>
            </div>
          )}

          {tasks.length === 0 ? (
            <p style={styles.emptyState}>Let the productivity begin! ✨</p>
          ) : (
            <div style={styles.taskList}>
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  style={styles.taskItem}
                >
                  <div style={styles.taskContent}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      style={styles.checkbox}
                    />
                    <span style={{
                      ...styles.taskText,
                      ...(task.completed ? styles.taskCompleted : {})
                    }}>
                      {task.text}
                    </span>
                  </div>
                  <button 
                    style={styles.deleteTaskBtn} 
                    onClick={() => deleteTask(task.id)}
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {tasks.some(t => t.completed) && (
            <button 
              style={{ ...styles.btn, ...styles.clearCompletedBtn }} 
              onClick={clearCompletedTasks}
            >
              Clear Completed
            </button>
          )}
        </div>

        <h2 style={styles.historyTitle}>History</h2>
        {history.length === 0 ? (
          <p style={styles.emptyState}>No previous sessions yet.</p>
        ) : (
          <div style={styles.historyTableWrapper}>
            <table style={styles.historyTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Tasks</th>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Productivity</th>
                </tr>
              </thead>
              <tbody>
                {history.map((session, index) => (
                  <tr key={index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={styles.td}>{session.date}</td>
                    <td style={styles.td}>{session.count}</td>
                    <td style={styles.td}>{formatTime(session.seconds)}</td>
                    <td style={styles.td}>{session.productivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button style={{ ...styles.btn, ...styles.clearBtn }} onClick={clearHistory}>Clear History</button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    fontFamily: "Inter, sans-serif",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    color: "#fff",
    padding: "20px"
  },
  container: {
    textAlign: "center",
    padding: "25px 35px",
    borderRadius: "15px",
    backgroundColor: "rgba(0,0,0,0.6)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
    minWidth: "320px",
    maxWidth: "500px",
    width: "100%"
  },
  titleWrapper: {
    position: "relative",
    display: "inline-block",
    marginBottom: "10px",
    width:"500px"
  },
  title: { position: "relative", zIndex: 1, fontSize: "50px", margin: "0", color:"#00cc7a"},
  version: {
    position: "absolute",
    top: "-5px",
    right: "-10px",
    fontSize: "20px",
    color: "#ffffff33",
    fontWeight: "bold",
    transform: "rotate(-25deg)",
    zIndex: 0
  },
  author: { fontSize: "10px", color: "#bbbbbb5b", margin: "1px 10px" },
  count: { fontSize: "20px", margin: "10px 0", color: "#f0f0f0" },
  timer: { fontSize: "80px", margin: "5px 0" },
  pausedText: { color: "#ffaa00", fontWeight: "bold", fontSize: "14px" },
  productivity: { fontSize: "20px", margin: "5px 10px", color: "#c0ffc0" },
  btn: {
    padding: "12px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    margin: "8px",
    transition: "all 0.2s ease",
    width: "90%"
  },
  startBtn: { background: "linear-gradient(to right, #00b09b, #96c93d)", color: "#fff" },
  pauseBtn: { background: "linear-gradient(to right, #f093fb, #f5576c)", color: "#fff" },
  resumeBtn: { background: "linear-gradient(to right, #4facfe, #00f2fe)", color: "#fff" },
  clickBtn: { background: "linear-gradient(to right, #4facfe, #00f2fe)", color: "#fff" },
  stopBtn: { background: "linear-gradient(to right, #fc5c7d, #6a82fb)", color: "#fff" },
  clearBtn: { background: "#ffffffff", color: "#000000ff" },
  instruction: { fontSize: "10px", color: "#dddddd", marginTop: "3px" },
  
  // Task management styles
  taskSection: {
    marginTop: "25px",
    padding: "15px",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "10px"
  },
  taskHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    flexWrap: "wrap",
    gap: "10px"
  },
  sectionTitle: {
    fontSize: "18px",
    margin: "0",
    color: "#f0f0f0"
  },
  addTaskBtn: {
    background: "linear-gradient(to right, #667eea, #764ba2)",
    color: "#fff",
    padding: "8px 16px",
    fontSize: "14px",
    width: "auto",
    margin: "0"
  },
  taskInputWrapper: {
    display: "flex",
    gap: "8px",
    marginBottom: "15px",
    flexDirection: "column"
  },
  taskInput: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "2px solid #667eea",
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box"
  },
  saveTaskBtn: {
    background: "linear-gradient(to right, #56ab2f, #a8e063)",
    color: "#fff",
    padding: "8px 16px",
    fontSize: "14px",
    margin: "0"
  },
  taskList: {
    maxHeight: "300px",
    overflowY: "auto",
    marginBottom: "10px"
  },
  taskItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    marginBottom: "8px",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: "6px",
    border: "1px solid rgba(255,255,255,0.1)"
  },
  taskContent: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    textAlign: "left"
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#667eea"
  },
  taskText: {
    fontSize: "14px",
    color: "#f0f0f0",
    wordBreak: "break-word"
  },
  taskCompleted: {
    textDecoration: "line-through",
    color: "#888",
    opacity: 0.6
  },
  deleteTaskBtn: {
    background: "rgba(255,100,100,0.3)",
    border: "none",
    borderRadius: "4px",
    color: "#fff",
    cursor: "pointer",
    padding: "4px 8px",
    fontSize: "14px",
    transition: "all 0.2s ease"
  },
  clearCompletedBtn: {
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    padding: "8px 16px",
    fontSize: "14px",
    margin: "5px 0 0 0"
  },
  emptyState: {
    color: "#aaa",
    fontSize: "14px",
    fontStyle: "italic",
    margin: "15px 0"
  },
  
  historyTitle: { marginTop: "20px" },
  historyTableWrapper: { maxHeight: "250px", overflowY: "auto", overflowX: "auto", margin: "0 auto" },
  historyTable: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "8px", backgroundColor: "#53c172ff", border: "1px solid #4dab68ff" },
  td: { padding: "8px", textAlign: "center" },
  rowEven: { backgroundColor: "#ffffff11" },
  rowOdd: { backgroundColor: "#ffffff22" }
};