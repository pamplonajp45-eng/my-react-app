import { useState, useEffect } from "react";

export default function ClickerTimer() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60); // Start at 25 minutes
  const [history, setHistory] = useState([]);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [showTaskInput, setShowTaskInput] = useState(false);

  const WORK_TIME = 25 * 60; // 25 minutes
  const SHORT_BREAK = 5 * 60; // 5 minutes
  const LONG_BREAK = 15 * 60; // 15 minutes

  const playSound = (type) => {
    let src = '';
    switch(type) {
      case 'click': src = 'click.mp3'; break;
      case 'delete': src = 'delete.wav'; break;
      case 'reminder': src = 'reminder.mp3'; break;
      case 'timer': src = 'timer.mp3'; break;
      default: src = ''; 
    }
    try {
      const audio = new Audio(src);
      audio.volume = 1;
      audio.play().catch(() => {});
    } catch(e) {}
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const countData = localStorage.getItem('clickCount');
    if (countData) setCount(Number(countData));

    const historyData = localStorage.getItem('clickHistory');
    if (historyData) setHistory(JSON.parse(historyData));

    const tasksData = localStorage.getItem('tasks');
    if (tasksData) setTasks(JSON.parse(tasksData));

    const pomodoroData = localStorage.getItem('pomodoroCount');
    if (pomodoroData) setPomodoroCount(Number(pomodoroData));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('clickHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('clickCount', count);
  }, [count]);

  useEffect(() => {
    localStorage.setItem('pomodoroCount', pomodoroCount);
  }, [pomodoroCount]);

  // Timer countdown logic
  useEffect(() => {
    if (!isRunning || isPaused) return;
    
    const interval = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          // Timer finished!
          handleTimerComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, isPaused, mode]);

  const handleTimerComplete = () => {
    playSound('reminder');
    
    if (mode === 'work') {
      // Work session completed
      const newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);
      
      // Save work session to history
      const session = {
        count,
        seconds: WORK_TIME,
        date: new Date().toLocaleString(),
        productivity: `Pomodoro #${newPomodoroCount}`
      };
      setHistory([...history, session]);
      
      // Decide break type
      if (newPomodoroCount % 4 === 0) {
        // Long break after 4 pomodoros
        setMode('longBreak');
        setSeconds(LONG_BREAK);
        alert("🎉 Great work! Time for a 15-minute long break!");
      } else {
        // Short break
        setMode('shortBreak');
        setSeconds(SHORT_BREAK);
        alert("✅ Pomodoro complete! Take a 5-minute break.");
      }
    } else {
      // Break completed
      setMode('work');
      setSeconds(WORK_TIME);
      setCount(0); // Reset task count for new work session
      alert("💪 Break's over! Ready for another focused session?");
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    if (mode === 'work') {
      setCount(0);
    }
    playSound('click');
  };

  const pauseTimer = () => {
    setIsPaused(true);
    playSound('click');
  };

  const resumeTimer = () => {
    setIsPaused(false);
    playSound('click');
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    playSound('reminder');
    
    // Save current session if it was a work session
    if (mode === 'work' && count > 0) {
      const session = {
        count,
        seconds: WORK_TIME - seconds,
        date: new Date().toLocaleString(),
        productivity: 'Incomplete'
      };
      setHistory([...history, session]);
    }
    
    // Reset to work mode
    setMode('work');
    setSeconds(WORK_TIME);
    setCount(0);
  };

  const skipToBreak = () => {
    if (mode === 'work') {
      const newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);
      
      if (newPomodoroCount % 4 === 0) {
        setMode('longBreak');
        setSeconds(LONG_BREAK);
      } else {
        setMode('shortBreak');
        setSeconds(SHORT_BREAK);
      }
      playSound('click');
    }
  };

  const skipToWork = () => {
    setMode('work');
    setSeconds(WORK_TIME);
    setCount(0);
    playSound('click');
  };

  const clearHistory = () => {
    playSound('delete');
    setHistory([]);
    localStorage.removeItem('clickHistory');
  };

  const resetPomodoros = () => {
    if (confirm('Reset pomodoro count to 0?')) {
      setPomodoroCount(0);
      localStorage.removeItem('pomodoroCount');
      playSound('delete');
    }
  };

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
      playSound('click');
    }
  }; 
  
  const toggleTask = (taskId) => {
    if (isPaused || mode !== 'work') return;
    
    const task = tasks.find(t => t.id === taskId);
    
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
    
    if (!task.completed && isRunning) {
      setCount(count + 1);
      playSound('click');
    }
  };

  const deleteTask = (taskId) => {
    playSound('delete');
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const clearCompletedTasks = () => {
    playSound('delete');
    setTasks(tasks.filter(task => !task.completed));
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getModeDisplay = () => {
    switch(mode) {
      case 'work': return { text: '🔥 Focus Time', color: '#00cc7a' };
      case 'shortBreak': return { text: '☕ Short Break', color: '#4facfe' };
      case 'longBreak': return { text: '🌴 Long Break', color: '#f093fb' };
      default: return { text: 'Work', color: '#00cc7a' };
    }
  };

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const modeDisplay = getModeDisplay();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.titleWrapper}>
          <h1 style={styles.title}>G!</h1>
          <span style={styles.version}>v2</span>
          <p style={styles.author}>by: JPDEV</p>
        </div>

        <div style={{...styles.modeIndicator, backgroundColor: modeDisplay.color}}>
          {modeDisplay.text}
        </div>

        <div style={styles.pomodoroCount}>
          🍅 Pomodoros: {pomodoroCount}
          {pomodoroCount > 0 && (
            <button style={styles.resetPomodoroBtn} onClick={resetPomodoros}>
              ↻
            </button>
          )}
        </div>

        {mode === 'work' && (
          <div
            key={count}
            style={{
              ...styles.count,
              animation: 'pulse 0.3s ease'
            }}
          >
            Tasks Completed: {count}
          </div>
        )}

        <p style={styles.timer}>
          {formatTime(seconds)} {isPaused && <span style={styles.pausedText}>(Paused)</span>}
        </p>

        {!isRunning ? (
          <button style={{ ...styles.btn, ...styles.startBtn }} onClick={startTimer}>
            Start {mode === 'work' ? 'Pomodoro' : 'Break'}
          </button>
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
              Stop & Reset
            </button>
          </>
        )}

        <div style={styles.skipButtons}>
          {mode === 'work' ? (
            <button style={{ ...styles.btn, ...styles.skipBtn }} onClick={skipToBreak}>
              Skip to Break →
            </button>
          ) : (
            <button style={{ ...styles.btn, ...styles.skipBtn }} onClick={skipToWork}>
              Skip to Work →
            </button>
          )}
        </div>

        {mode === 'work' && (
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
                  <div
                    key={task.id}
                    style={styles.taskItem}
                  >
                    <div style={styles.taskContent}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        style={styles.checkbox}
                        disabled={!isRunning || isPaused}
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
                  </div>
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
        )}

        {mode !== 'work' && (
          <div style={styles.breakMessage}>
            <p style={styles.breakText}>
              {mode === 'shortBreak' ? '☕ Take a short break! Stretch, hydrate, or rest your eyes.' : '🌴 Long break time! Step away and recharge for the next set.'}
            </p>
          </div>
        )}

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
                  <th style={styles.th}>Session</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((session, index) => (
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

        <button style={{ ...styles.btn, ...styles.clearBtn }} onClick={clearHistory}>
          Clear History
        </button>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    minHeight: "100vh",
    minHeight: "100dvh",
    height: "auto",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    padding: "20px",
    paddingBottom: "40px",
    width: "100%",
    boxSizing: "border-box",
    flexDirection: "column",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale"
  },
  container: {
    textAlign: "center",
    padding: "24px",
    borderRadius: "20px",
    backgroundColor: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    width: "100%",
    maxWidth: "540px",
    boxSizing: "border-box",
    overflow: "hidden",
    margin: "auto"
  },
  titleWrapper: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "16px",
    width: "100%"
  },
  title: { 
    position: "relative", 
    zIndex: 1, 
    fontSize: "clamp(48px, 12vw, 64px)", 
    margin: "0", 
    color: "#00cc7a",
    fontWeight: "800",
    letterSpacing: "-2px"
  },
  version: {
    position: "absolute",
    top: "-8px",
    right: "5%",
    fontSize: "clamp(18px, 5vw, 24px)",
    color: "rgba(255,255,255,0.2)",
    fontWeight: "bold",
    transform: "rotate(-20deg)",
    zIndex: 0
  },
  author: { 
    fontSize: "11px", 
    color: "rgba(187,187,187,0.4)", 
    margin: "8px 0 0 0",
    letterSpacing: "1px"
  },
  modeIndicator: {
    padding: "10px 20px",
    borderRadius: "25px",
    fontSize: "clamp(15px, 4vw, 18px)",
    fontWeight: "700",
    margin: "16px auto",
    display: "inline-block",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
  },
  pomodoroCount: {
    fontSize: "clamp(16px, 4vw, 18px)",
    margin: "12px 0",
    color: "#ffd700",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px"
  },
  resetPomodoroBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    borderRadius: "50%",
    color: "#fff",
    width: "28px",
    height: "28px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s ease"
  },
  count: { 
    fontSize: "clamp(18px, 5vw, 22px)", 
    margin: "16px 0", 
    color: "#f0f0f0",
    fontWeight: "600"
  },
  timer: { 
    fontSize: "clamp(56px, 16vw, 88px)", 
    margin: "12px 0",
    fontWeight: "700",
    letterSpacing: "-2px",
    lineHeight: "1.1",
    wordBreak: "normal"
  },
  pausedText: { 
    color: "#ffaa00", 
    fontWeight: "bold", 
    fontSize: "clamp(13px, 3.5vw, 16px)",
    display: "block",
    marginTop: "8px",
    letterSpacing: "0.5px"
  },
  btn: {
    padding: "14px 24px",
    fontSize: "clamp(15px, 4vw, 17px)",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    margin: "6px auto",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    width: "100%",
    maxWidth: "420px",
    boxSizing: "border-box",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
    fontWeight: "600",
    display: "block",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
  },
  startBtn: { 
    background: "linear-gradient(135deg, #00b09b, #96c93d)", 
    color: "#fff" 
  },
  pauseBtn: { 
    background: "linear-gradient(135deg, #f093fb, #f5576c)", 
    color: "#fff" 
  },
  resumeBtn: { 
    background: "linear-gradient(135deg, #4facfe, #00f2fe)", 
    color: "#fff" 
  },
  stopBtn: { 
    background: "linear-gradient(135deg, #fc5c7d, #6a82fb)", 
    color: "#fff" 
  },
  clearBtn: { 
    background: "rgba(255,255,255,0.95)", 
    color: "#000",
    marginTop: "16px"
  },
  skipButtons: {
    margin: "10px 0"
  },
  skipBtn: {
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    padding: "10px 20px",
    fontSize: "clamp(13px, 3.5vw, 15px)"
  },
  breakMessage: {
    margin: "24px 0",
    padding: "20px",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "12px",
    border: "2px dashed rgba(255,255,255,0.3)"
  },
  breakText: {
    fontSize: "clamp(14px, 3.8vw, 16px)",
    color: "#f0f0f0",
    margin: 0,
    lineHeight: "1.5"
  },
  taskSection: {
    marginTop: "24px",
    padding: "20px",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: "16px",
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid rgba(255,255,255,0.1)"
  },
  taskHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px"
  },
  sectionTitle: {
    fontSize: "clamp(17px, 4.5vw, 20px)",
    margin: "0",
    color: "#f0f0f0",
    fontWeight: "700"
  },
  addTaskBtn: {
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    padding: "10px 18px",
    fontSize: "clamp(13px, 3.5vw, 15px)",
    width: "auto",
    margin: "0",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
    fontWeight: "600"
  },
  taskInputWrapper: {
    display: "flex",
    gap: "10px",
    marginBottom: "16px",
    flexDirection: "column",
    width: "100%"
  },
  taskInput: {
    padding: "12px 14px",
    fontSize: "clamp(14px, 3.8vw, 16px)",
    borderRadius: "10px",
    border: "2px solid rgba(102, 126, 234, 0.5)",
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease"
  },
  saveTaskBtn: {
    background: "linear-gradient(135deg, #56ab2f, #a8e063)",
    color: "#fff",
    padding: "12px 20px",
    fontSize: "clamp(14px, 3.8vw, 16px)",
    margin: "0",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
    fontWeight: "600"
  },
  taskList: {
    maxHeight: "320px",
    overflowY: "auto",
    overflowX: "hidden",
    marginBottom: "12px",
    padding: "2px"
  },
  taskItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px",
    marginBottom: "10px",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    transition: "background-color 0.2s ease"
  },
  taskContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    textAlign: "left",
    overflow: "hidden",
    minWidth: 0
  },
  checkbox: {
    width: "20px",
    height: "20px",
    minWidth: "20px",
    cursor: "pointer",
    accentColor: "#667eea"
  },
  taskText: {
    fontSize: "clamp(14px, 3.8vw, 16px)",
    color: "#f0f0f0",
    wordBreak: "break-word",
    overflow: "hidden",
    flex: 1,
    lineHeight: "1.4"
  },
  taskCompleted: {
    textDecoration: "line-through",
    color: "#999",
    opacity: 0.6
  },
  deleteTaskBtn: {
    background: "rgba(255,100,100,0.35)",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    padding: "8px 12px",
    fontSize: "clamp(13px, 3.5vw, 15px)",
    transition: "background-color 0.2s ease",
    minWidth: "36px",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
    fontWeight: "600"
  },
  clearCompletedBtn: {
    background: "rgba(255,255,255,0.18)",
    color: "#fff",
    padding: "12px 20px",
    fontSize: "clamp(13px, 3.5vw, 15px)",
    margin: "6px auto",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
    fontWeight: "600"
  },
  emptyState: {
    color: "#aaa",
    fontSize: "clamp(13px, 3.8vw, 15px)",
    fontStyle: "italic",
    margin: "20px 0",
    lineHeight: "1.5"
  },
  historyTitle: { 
    marginTop: "24px",
    fontSize: "clamp(17px, 4.5vw, 20px)",
    fontWeight: "700"
  },
  historyTableWrapper: { 
    maxHeight: "300px",
    overflowY: "auto", 
    overflowX: "auto", 
    margin: "12px auto",
    width: "100%",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "12px",
    backgroundColor: "rgba(0,0,0,0.35)"
  },
  historyTable: { 
    width: "100%", 
    borderCollapse: "collapse",
    fontSize: "clamp(12px, 3.2vw, 14px)"
  },
  th: { 
    padding: "12px 8px", 
    backgroundColor: "#53c172", 
    border: "1px solid #4dab68",
    fontSize: "clamp(12px, 3.2vw, 14px)",
    position: "sticky",
    top: 0,
    zIndex: 10,
    fontWeight: "700"
  },
  td: { 
    padding: "10px 8px", 
    textAlign: "center",
    fontSize: "clamp(11px, 3vw, 13px)",
    wordBreak: "break-word",
    lineHeight: "1.4"
  },
  rowEven: { backgroundColor: "rgba(255,255,255,0.08)" },
  rowOdd: { backgroundColor: "rgba(255,255,255,0.14)" }
};