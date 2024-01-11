import { useState } from 'react';
import { insertData } from './api';

function App() {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await insertData(message);
      setMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Add to Database</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Message: 
          <input 
            type="text" 
            value={message}
            onChange={e => setMessage(e.target.value)} 
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;