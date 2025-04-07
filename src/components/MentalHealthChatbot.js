// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import './MentalHealthChatbot.css'; // We'll create this CSS file separately

// // Main ChatBot component
// const MentalHealthChatbot = () => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [wellnessTips, setWellnessTips] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('general');
//   const [showTips, setShowTips] = useState(false);
//   const messagesEndRef = useRef(null);

//   // Categories for wellness tips
//   const categories = [
//     { id: 'general', name: 'General Wellness' },
//     { id: 'anxiety', name: 'Anxiety Relief' },
//     { id: 'stress', name: 'Stress Management' }
//   ];

//   // Fetch wellness tips based on category
//   const fetchWellnessTips = async (category) => {
//     try {
//       const response = await axios.get(`http://localhost:5000/wellness-tips?category=${category}`);
//       setWellnessTips(response.data.tips);
//     } catch (error) {
//       console.error('Error fetching wellness tips:', error);
//     }
//   };

//   // Change wellness tip category
//   const changeCategory = (category) => {
//     setSelectedCategory(category);
//     fetchWellnessTips(category);
//   };

//   // Initial greeting message
//   useEffect(() => {
//     const initialMessage = {
//       id: 'initial',
//       sender: 'bot',
//       text: "Hi there! I'm here to support your mental well-being. How are you feeling today?",
//       timestamp: new Date()
//     };
//     setMessages([initialMessage]);
//     fetchWellnessTips('general');
//   }, []);

//   // Auto scroll to bottom of chat
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   // Handle sending message
//   const handleSend = async () => {
//     if (input.trim() === '') return;

//     const userMessage = {
//       id: Date.now(),
//       sender: 'user',
//       text: input,
//       timestamp: new Date()
//     };

//     setMessages(prevMessages => [...prevMessages, userMessage]);
//     setInput('');
//     setIsTyping(true);

//     try {
//       // Prepare conversation history
//       const history = messages
//         .filter(msg => msg.id !== 'initial' && !msg.isResource)
//         .map(msg => ({
//           role: msg.sender === 'user' ? 'user' : 'assistant',
//           content: msg.text
//         }));

//       // Send message to backend
//       const response = await axios.post('http://localhost:5000/chat', {
//         message: userMessage.text,
//         history: history
//       });

//       // Add bot response
//       const botMessage = {
//         id: Date.now() + 1,
//         sender: 'bot',
//         text: response.data.message,
//         timestamp: new Date()
//       };

//       setMessages(prevMessages => [...prevMessages, botMessage]);

//       // Add crisis resources if provided
//       if (response.data.crisis_resources) {
//         const resourceMessage = {
//           id: Date.now() + 2,
//           sender: 'bot',
//           isResource: true,
//           resources: response.data.crisis_resources,
//           timestamp: new Date()
//         };
//         setMessages(prevMessages => [...prevMessages, resourceMessage]);
//       }
//     } catch (error) {
//       console.error('Error sending message:', error);
//       const errorMessage = {
//         id: Date.now() + 1,
//         sender: 'bot',
//         text: "I'm having trouble connecting right now. Please try again in a moment.",
//         timestamp: new Date(),
//         isError: true
//       };
//       setMessages(prevMessages => [...prevMessages, errorMessage]);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   // Handle input change
//   const handleInputChange = (e) => {
//     setInput(e.target.value);
//   };

//   // Handle Enter key press
//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSend();
//     }
//   };

//   // Format timestamp
//   const formatTime = (date) => {
//     return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   return (
//     <div className="chat-container">
//       <header className="chat-header">
//         <h1>Mental Wellness Assistant</h1>
//         <p>A safe space to talk and find support</p>
//       </header>

//       <div className="chat-main">
//         {/* Main chat area */}
//         <div className="chat-area">
//           <div className="messages-container">
//             {messages.map((message) => (
//               <div key={message.id} className={`message-wrapper ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}>
//                 {message.isResource ? (
//                   <div className="resource-message">
//                     <p className="resource-title">{message.resources.message}</p>
//                     <div className="resource-content">
//                       <p><span>Crisis Text Line:</span> {message.resources.text_line}</p>
//                       <p><span>Suicide Prevention:</span> {message.resources.suicide_prevention}</p>
//                     </div>
//                   </div>
//                 ) : (
//                   <div 
//                     className={`message ${
//                       message.sender === 'user' 
//                         ? 'user'
//                         : message.isError
//                           ? 'error'
//                           : 'bot'
//                     }`}
//                   >
//                     <p>{message.text}</p>
//                     <span className="timestamp">{formatTime(message.timestamp)}</span>
//                   </div>
//                 )}
//               </div>
//             ))}
//             {isTyping && (
//               <div className="typing-indicator-wrapper">
//                 <div className="typing-indicator">
//                   <div className="dot"></div>
//                   <div className="dot"></div>
//                   <div className="dot"></div>
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           <div className="input-area">
//             <div className="input-container">
//               <button
//                 onClick={() => setShowTips(!showTips)}
//                 className="tips-button"
//                 title="Show wellness tips"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="tips-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                 </svg>
//               </button>
//               <input
//                 type="text"
//                 value={input}
//                 onChange={handleInputChange}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Type your message here..."
//                 className="message-input"
//               />
//               <button
//                 onClick={handleSend}
//                 className="send-button"
//               >
//                 Send
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Wellness tips sidebar */}
//         {showTips && (
//           <div className="tips-sidebar">
//             <h3>Wellness Tips</h3>
            
//             <div className="category-buttons">
//               {categories.map((category) => (
//                 <button
//                   key={category.id}
//                   onClick={() => changeCategory(category.id)}
//                   className={`category-button ${selectedCategory === category.id ? 'selected' : ''}`}
//                 >
//                   {category.name}
//                 </button>
//               ))}
//             </div>
            
//             <ul className="tips-list">
//               {wellnessTips.map((tip, index) => (
//                 <li key={index} className="tip-item">
//                   {tip}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MentalHealthChatbot;



import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './MentalHealthChatbot.css';

// Main ChatBot component
const MentalHealthChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [wellnessTips, setWellnessTips] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [showTips, setShowTips] = useState(false);
  const messagesEndRef = useRef(null);
  // Add a session ID to separate different conversation sessions
  const [sessionId, setSessionId] = useState('');

  // Categories for wellness tips
  const categories = [
    { id: 'general', name: 'General Wellness' },
    { id: 'anxiety', name: 'Anxiety Relief' },
    { id: 'stress', name: 'Stress Management' }
  ];

  // Generate a session ID if not present
  useEffect(() => {
    const existingSessionId = localStorage.getItem('chatSessionId');
    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      const newSessionId = 'session_' + Date.now();
      localStorage.setItem('chatSessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // Load previous messages from localStorage
  useEffect(() => {
    if (sessionId) {
      const savedMessages = localStorage.getItem(`chatMessages_${sessionId}`);
      if (savedMessages && JSON.parse(savedMessages).length > 0) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Set initial message only if no previous messages exist
        const initialMessage = {
          id: 'initial',
          sender: 'bot',
          text: "Hi there! I'm here to support your mental well-being. How are you feeling today?",
          timestamp: new Date()
        };
        setMessages([initialMessage]);
      }
    }
  }, [sessionId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      localStorage.setItem(`chatMessages_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  // Fetch wellness tips based on category
  const fetchWellnessTips = async (category) => {
    try {
      const response = await axios.get(`http://localhost:5000/wellness-tips?category=${category}`);
      setWellnessTips(response.data.tips);
    } catch (error) {
      console.error('Error fetching wellness tips:', error);
    }
  };

  // Change wellness tip category
  const changeCategory = (category) => {
    setSelectedCategory(category);
    fetchWellnessTips(category);
  };

  // Load wellness tips on component mount
  useEffect(() => {
    fetchWellnessTips('general');
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending message
  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Prepare conversation history - use the last 10 messages to prevent context window overflow
      const history = messages
        .filter(msg => msg.id !== 'initial' && !msg.isResource)
        .slice(-10) // Get only the last 10 messages
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      // Send message to backend
      const response = await axios.post('http://localhost:5000/chat', {
        message: userMessage.text,
        history: history
      });

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.data.message,
        timestamp: new Date()
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);

      // Add crisis resources if provided
      if (response.data.crisis_resources) {
        const resourceMessage = {
          id: Date.now() + 2,
          sender: 'bot',
          isResource: true,
          resources: response.data.crisis_resources,
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, resourceMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Format timestamp
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Clear conversation history
  const handleClearHistory = () => {
    // Create a new session ID
    const newSessionId = 'session_' + Date.now();
    localStorage.setItem('chatSessionId', newSessionId);
    setSessionId(newSessionId);
    
    // Add initial message to the new session
    const initialMessage = {
      id: 'initial',
      sender: 'bot',
      text: "I've cleared our previous conversation. How are you feeling today?",
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Mental Wellness Assistant</h1>
        <p>A safe space to talk and find support</p>
        <button onClick={handleClearHistory} className="clear-history-button">
          Start New Conversation
        </button>
      </header>

      <div className="chat-main">
        {/* Main chat area */}
        <div className="chat-area">
          <div className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className={`message-wrapper ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                {message.isResource ? (
                  <div className="resource-message">
                    <p className="resource-title">{message.resources.message}</p>
                    <div className="resource-content">
                      <p><span>Crisis Text Line:</span> {message.resources.text_line}</p>
                      <p><span>Suicide Prevention:</span> {message.resources.suicide_prevention}</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`message ${
                      message.sender === 'user' 
                        ? 'user'
                        : message.isError
                          ? 'error'
                          : 'bot'
                    }`}
                  >
                    <p>{message.text}</p>
                    <span className="timestamp">{formatTime(message.timestamp)}</span>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator-wrapper">
                <div className="typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <div className="input-container">
              <button
                onClick={() => setShowTips(!showTips)}
                className="tips-button"
                title="Show wellness tips"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="tips-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="message-input"
              />
              <button
                onClick={handleSend}
                className="send-button"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Wellness tips sidebar */}
        {showTips && (
          <div className="tips-sidebar">
            <h3>Wellness Tips</h3>
            
            <div className="category-buttons">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => changeCategory(category.id)}
                  className={`category-button ${selectedCategory === category.id ? 'selected' : ''}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <ul className="tips-list">
              {wellnessTips.map((tip, index) => (
                <li key={index} className="tip-item">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentalHealthChatbot;