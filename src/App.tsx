import { HashRouter, Routes, Route } from 'react-router-dom';
import { Shell } from './components/Shell';
import Home from './pages/Home';
import Record from './pages/Record';
import Processing from './pages/Processing';
import Sessions from './pages/Sessions';
import SessionDetail from './pages/SessionDetail';
import DeliveryDetail from './pages/DeliveryDetail';
import PitchMapPage from './pages/PitchMapPage';
import Analytics from './pages/Analytics';
import UmpireViewPage from './pages/UmpireViewPage';
import Settings from './pages/Settings';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Home />} />
          <Route path="/record" element={<Record />} />
          <Route path="/record/processing" element={<Processing />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
          <Route path="/sessions/:sessionId/deliveries/:deliveryId" element={<DeliveryDetail />} />
          <Route path="/pitch-map" element={<PitchMapPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/umpire-view" element={<UmpireViewPage />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
