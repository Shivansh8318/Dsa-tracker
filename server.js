const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

// Hardcoded environment variables
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_5XdfQMuEzm0F@ep-lucky-dream-adom5fsc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
process.env.PORT = "5000";
process.env.NODE_ENV = "development";

const app = express();
const prisma = new PrismaClient();
const PORT = 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // React dev servers
  credentials: true
}));

// Rate limiting (relaxed for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (much higher for development)
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  }
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Questions Routes
app.get('/api/questions', async (req, res) => {
  try {
    const { topic, difficulty, search, tags } = req.query;
    
    const where = {};
    
    if (topic) {
      where.topics = { has: topic };
    }
    
    if (difficulty) {
      where.difficulty = difficulty;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { explanation: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.tags = { hasSome: tagArray };
    }
    
    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.get('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const question = await prisma.question.findUnique({
      where: { id }
    });
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const {
      title,
      topics,
      difficulty,
      source,
      link,
      dateSolved,
      code,
      explanation,
      tags
    } = req.body;
    
    if (!title || !difficulty) {
      return res.status(400).json({ 
        error: 'Title and difficulty are required' 
      });
    }
    
    const question = await prisma.question.create({
      data: {
        title,
        topics: topics || [],
        difficulty,
        source,
        link,
        dateSolved: dateSolved ? new Date(dateSolved) : null,
        code,
        explanation,
        tags: tags || []
      }
    });
    
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

app.put('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      topics,
      difficulty,
      source,
      link,
      dateSolved,
      code,
      explanation,
      tags
    } = req.body;
    
    const existingQuestion = await prisma.question.findUnique({
      where: { id }
    });
    
    if (!existingQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    const question = await prisma.question.update({
      where: { id },
      data: {
        title,
        topics: topics || [],
        difficulty,
        source,
        link,
        dateSolved: dateSolved ? new Date(dateSolved) : null,
        code,
        explanation,
        tags: tags || []
      }
    });
    
    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

app.delete('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingQuestion = await prisma.question.findUnique({
      where: { id }
    });
    
    if (!existingQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    await prisma.question.delete({
      where: { id }
    });
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Statistics Routes
app.get('/api/stats', async (req, res) => {
  try {
    // Total solved count
    const totalSolved = await prisma.question.count({
      where: { dateSolved: { not: null } }
    });
    
    // Total questions count
    const totalQuestions = await prisma.question.count();
    
    // Difficulty distribution
    const difficultyStats = await prisma.question.groupBy({
      by: ['difficulty'],
      _count: { difficulty: true }
    });
    
    // Topic statistics
    const questions = await prisma.question.findMany({
      select: { topics: true, dateSolved: true }
    });
    
    const topicStats = {};
    questions.forEach(question => {
      question.topics.forEach(topic => {
        if (!topicStats[topic]) {
          topicStats[topic] = { total: 0, solved: 0 };
        }
        topicStats[topic].total++;
        if (question.dateSolved) {
          topicStats[topic].solved++;
        }
      });
    });
    
    // Heatmap data (questions solved by date)
    const solvedQuestions = await prisma.question.findMany({
      where: { dateSolved: { not: null } },
      select: { dateSolved: true }
    });
    
    const heatmapData = {};
    solvedQuestions.forEach(question => {
      const date = question.dateSolved.toISOString().split('T')[0];
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });
    
    res.json({
      totalSolved,
      totalQuestions,
      difficultyStats: difficultyStats.reduce((acc, stat) => {
        acc[stat.difficulty] = stat._count.difficulty;
        return acc;
      }, {}),
      topicStats,
      heatmapData
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all unique topics
app.get('/api/topics', async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      select: { topics: true }
    });
    
    const allTopics = new Set();
    questions.forEach(question => {
      question.topics.forEach(topic => allTopics.add(topic));
    });
    
    res.json(Array.from(allTopics).sort());
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// Get all unique tags
app.get('/api/tags', async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      select: { tags: true }
    });
    
    const allTags = new Set();
    questions.forEach(question => {
      question.tags.forEach(tag => allTags.add(tag));
    });
    
    res.json(Array.from(allTags).sort());
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ============ COMPANY ROUTES ============

// Get all companies
app.get('/api/companies', async (req, res) => {
  try {
    const { search, status } = req.query;
    
    let where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { feedback: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    const companies = await prisma.company.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' }
      ]
    });
    
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get company statistics
app.get('/api/companies/stats', async (req, res) => {
  try {
    const totalApplications = await prisma.company.count();
    
    const statusCounts = await prisma.company.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    const selectedCount = await prisma.company.count({
      where: { status: 'SELECTED' }
    });
    
    const rejectedCount = await prisma.company.count({
      where: { status: 'REJECTED' }
    });
    
    res.json({
      totalApplications,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      selectedCount,
      rejectedCount
    });
  } catch (error) {
    console.error('Error fetching company stats:', error);
    res.status(500).json({ error: 'Failed to fetch company statistics' });
  }
});

// Get single company
app.get('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({
      where: { id }
    });
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Create new company
app.post('/api/companies', async (req, res) => {
  try {
    const { name, salary, status, feedback } = req.body;
    
    const company = await prisma.company.create({
      data: {
        name,
        salary,
        status: status || 'APPLIED',
        feedback
      }
    });
    
    res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Update company
app.put('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, salary, status, feedback } = req.body;
    
    const company = await prisma.company.update({
      where: { id },
      data: {
        name,
        salary,
        status,
        feedback
      }
    });
    
    res.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Delete company
app.delete('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.company.delete({
      where: { id }
    });
    
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// 404 handler (must be after all routes)
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: development`);
});

module.exports = app;
