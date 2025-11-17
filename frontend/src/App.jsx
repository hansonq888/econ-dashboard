import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import StoryMode from "./pages/StoryMode";
import FinancialCrisis2008 from "./pages/story/FinancialCrisis2008";
import DotComBubble from "./pages/story/DotComBubble";
import VolckerDisinflation from "./pages/story/VolckerDisinflation";
import OilShock1973 from "./pages/story/OilShock1973";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/story" element={<StoryMode />} />
        <Route path="/story/2008-financial-crisis" element={<FinancialCrisis2008 />} />
        <Route path="/story/dot-com-bubble" element={<DotComBubble />} />
        <Route path="/story/volcker-disinflation" element={<VolckerDisinflation />} />
        <Route path="/story/1973-oil-shock" element={<OilShock1973 />} />
      </Routes>
    </BrowserRouter>
  );
}
