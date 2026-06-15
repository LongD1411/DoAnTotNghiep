import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/index';
import ScrollToTop from './components/common/ScrollToTop';

const App = () => (
  <BrowserRouter>
    <ScrollToTop />
    <AppRouter />
  </BrowserRouter>
);

export default App;
