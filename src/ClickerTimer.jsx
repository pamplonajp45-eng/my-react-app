import {useState, useEffect} from "react";
import {motion} from "framer-motion"

export default function ClickerTimer() {
    const [ count, setCount ] = useState(() => {
        return Number (localStorage.getItem("clickCount")) || 0;
    });
    const [ isRunning, setIsRunning] = useState(false);
    const [ seconds, setSeconds] = useState(0);
    const [ history, setHistory ] = useState(() => {
        return JSON.parse(localStorage.getItem("clickHistory")) || [];
    });


    //Clicksound ngani
    const clickSound = new Audio("/click.mp3");
    const deleteSound = new Audio("/delete.wav");

useEffect(() => {
  if (!isRunning) return;

  const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
  return () => clearInterval(interval);
}, [isRunning]);


// para mag save sa local storage
useEffect(() => {
    localStorage.setItem("clickCount", count);
}, [count]);

    const startTimer = () =>{
        setIsRunning(true);
        setCount(0);
        setSeconds(0);
    };
    const stopTimer =() =>{
        setIsRunning(false);

        if (count > 0) {
            const session  = {
                count,
                seconds,
                date: new Date().toLocaleString(),
                productivity: seconds > 0 ? ((count / seconds  ) * 60).toFixed(1) : 0,
            };

            const newHistory  = [...history, session];
            setHistory(newHistory);
        
            localStorage.setItem("clickHistory", JSON.stringify(newHistory));
        }
    };
    const handleClick = () =>{
     if (isRunning) {
        setCount(count + 1 );
        clickSound.play();
     }
    };
    const clearHistory = ()=>{
        deleteSound.play();
        setHistory([]);
        localStorage.removeItem("clickHistory");
    };
    const productivity  = 
        seconds > 0 ? ((count / seconds ) * 60).toFixed(1) : 0;
        
    return ( 
        <div style={styles.page}>
        <div style = {styles.container}>
            <h1> My Productivity Timer </h1>
            
            <motion.p
            key={count}
            initial={{scale: 0.5, opacity: 0}}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            style={{ fontSize: "28px", margin: "10px 0" }}
            >
                Tasks Completed : {count}
               </motion.p>

            <p>Time: {seconds}s </p>
            <h2> Productivity Score : {productivity} tasks/min </h2>

            {!isRunning ? (
                <button style = {styles.startBtn} onClick ={startTimer}>
                 Start
                </button>): (
                    <>
                    <button style = {styles.clickBtn} onClick ={handleClick}>Add Task</button>
                    <button style = {styles.stopBtn} onClick  ={stopTimer}>Stop</button>
                    </>
                )}
                   <h2>History</h2>
    {history.length  === 0 ?(
        <p>No Previous sessions yet. </p>
    ) : (
        <table style ={{margin: "0 auto", borderCollapse: "collapse"}}>
            <thead>
                <tr>
                <th>Date</th>
                <th>Tasks</th>
                <th>Time</th>
                <th>Productivity (tasks/min)</th>
                </tr>
            </thead>
            <tbody>
                {history.map((session, index) => ( 
                    <tr key={index}>
                <td>{session.date}</td>
                <td>{session.count}</td>
                <td>{session.seconds}</td>
                <td>{session.productivity}</td>
                    </tr>
                ))}

            </tbody>
        </table>
    )} 
    <button onClick={clearHistory}>Clear History </button>
        </div>
        </div>

    );

    
}

const styles  ={
    page:{
        display:"flex",
        justifyContent:"center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#000000ff",
        fontFamily: "Arial",

    },
    container: {
    textAlign: "center",
    padding: "30px 50px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",

    },
    startBtn:{
        padding:"12px 20px",
        fontSize:"18px",
        background:"green",
        color: "white",
        border:"none",
        cursor:"pointer",
        margin:" 10px",

    },
    stopBtn:{
        padding:"12px 20px",
        fontSize:"18px",
        background:"red",
        color: "white",
        border:"none",
        cursor:"pointer",
        margin:" 10px",
    },
    clickBtn: {
        padding:"12px 20px",
        fontSize:"18px",
        background:"blue",
        color:"white",
        border:"none",
        cursor:"pointer",
        margin:"10px",
    }
};