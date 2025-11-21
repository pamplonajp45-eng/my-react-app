import { useState } from "react";
import { motion} from "framer-motion";

function MyComponent() {
    const [count, setCount] = useState(0);
    
    return (
        <div style = {{padding:20}}>
           <motion.h2
           key={count}
           initial={{scale: 0.5, opacity: 0}}
           animate={{scale: 1, opacity: 1}}
           transition={{duration : 0.3}}
           >
            Counter: {count}
           </motion.h2>

            <button onClicik={() => setCount(count + 1 )}>
                + Increase
            </button>

            <button onClick={() => setCount(count - 1)} style={{marginLeft: 10}}>
                - Decrease
            </button>
            <button onClick={() => setCount(0)} style={{marginLeft:10}}>
                Reset
            </button>
            </div>
    );

}
export default MyComponent;