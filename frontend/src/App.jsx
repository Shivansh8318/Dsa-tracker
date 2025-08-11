import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Questions from './pages/Questions'
import QuestionDetail from './pages/QuestionDetail'
import AddQuestion from './pages/AddQuestion'
import EditQuestion from './pages/EditQuestion'
import Topics from './pages/Topics'
import TopicPage from './pages/TopicPage'
import Companies from './pages/Companies'
import AddCompany from './pages/AddCompany'

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/questions/add" element={<AddQuestion />} />
          <Route path="/questions/:id" element={<QuestionDetail />} />
          <Route path="/questions/:id/edit" element={<EditQuestion />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/topics/:topic" element={<TopicPage />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/add" element={<AddCompany />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}

export default App
