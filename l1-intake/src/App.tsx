import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import IntakeFlow from './components/IntakeFlow';
import CEOAuditFlow from './components/CEOAuditFlow';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/intake" element={<IntakeFlow />} />
        <Route path="/ceo-audit" element={<CEOAuditFlow />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
