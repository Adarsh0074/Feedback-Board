const firebaseURL = "https://feedback-board-8a8d5-default-rtdb.asia-southeast1.firebasedatabase.app/feedback.json";

function FeedbackForm({ onAddFeedback }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [message, setMessage] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !comment) {
      setMessage('Please fill all fields!');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email!');
      return;
    }

    const feedback = {
      name,
      email,
      comment,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(firebaseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback)
    });

    if (response.ok) {
      setName('');
      setEmail('');
      setComment('');
      setMessage('Feedback submitted successfully!');
      onAddFeedback();
    } else {
      setMessage('Error submitting feedback!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="feedback-form">
      <h2>Submit Feedback</h2>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <textarea placeholder="Comment" value={comment} onChange={(e) => setComment(e.target.value)} />
      <button type="submit">Submit</button>
      {message && <p className="message">{message}</p>}
    </form>
  );
}

function FeedbackItem({ feedback, onDelete }) {
  return (
    <div className="feedback-card">
      <h3>{feedback.name}</h3>
      <p>{feedback.comment}</p>
      <small>{feedback.email}</small>
      <br />
      <button onClick={() => onDelete(feedback.id)}>Delete</button>
    </div>
  );
}

function FeedbackList({ feedbacks, onDelete }) {
  return (
    <div className="feedback-list">
      {feedbacks.map((fb) => (
        <FeedbackItem key={fb.id} feedback={fb} onDelete={onDelete} />
      ))}
    </div>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = React.useState('light');

  React.useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
      document.body.className = storedTheme;
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button onClick={toggleTheme} className="theme-toggle">
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
}

function App() {
  const [feedbacks, setFeedbacks] = React.useState([]);

  const fetchFeedbacks = async () => {
    const res = await fetch(firebaseURL);
    const data = await res.json();
    if (data) {
      const loadedFeedbacks = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      setFeedbacks(loadedFeedbacks.reverse());
    } else {
      setFeedbacks([]);
    }
  };

  React.useEffect(() => {
    fetchFeedbacks();
  }, []);

  const deleteFeedback = async (id) => {
    const deleteURL = `https://feedback-board-8a8d5-default-rtdb.asia-southeast1.firebasedatabase.app/feedback/${id}.json`;
    await fetch(deleteURL, { method: 'DELETE' });
    fetchFeedbacks();
  };

  return (
    <div className="container">
      <header>
        <h1>Feedback Board</h1>
        <ThemeToggle />
      </header>
      <FeedbackForm onAddFeedback={fetchFeedbacks} />
      <FeedbackList feedbacks={feedbacks} onDelete={deleteFeedback} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
