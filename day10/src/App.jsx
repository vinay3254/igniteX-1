import Button from './button.jsx';
import List from './list.jsx';
import Student from './Student.jsx';
import UserGreeting from './UserGreeting.jsx';

const fruits = [
  { id: 1, name: 'Apple', calories: 95 },
  { id: 2, name: 'Orange', calories: 62 },
  { id: 3, name: 'Banana', calories: 105 },
];

const vegetables = [
  { id: 1, name: 'Potato', calories: 161 },
  { id: 2, name: 'Corn', calories: 96 },
  { id: 3, name: 'Carrot', calories: 25 },
];

function App() {
  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Day 10</p>
        <h1>React practice playground</h1>
        <p className="hero-copy">
          This page now renders all of your practice components in one place so
          each lesson example can be checked quickly.
        </p>
      </header>

      <section className="card">
        <h2>Button component</h2>
        <Button />
      </section>

      <section className="card">
        <h2>Student cards</h2>
        <div className="stack">
          <Student name="Doremon" age={30} isStudent />
          <Student name="Nobita" age={42} isStudent={false} />
          <Student name="Shizuka" age={60} isStudent={false} />
          <Student name="Gian" age={70} isStudent={false} />
          <Student />
        </div>
      </section>

      <section className="card">
        <h2>Conditional rendering</h2>
        <UserGreeting isLoggedIn username="Shanks" />
      </section>

      <section className="card">
        <h2>Rendered lists</h2>
        <div className="lists">
          <List items={fruits} category="Fruits" />
          <List items={vegetables} category="Vegetables" />
        </div>
      </section>
    </main>
  );
}

export default App;
