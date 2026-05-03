const express = require('express');
const app = express();
const PORT = 3000;
const supabase = require('./supabase');
const authRouter = require('./routes/auth');

app.use(express.json());
app.use('/auth', authRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/test-supabase', async (req, res) => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ message: 'Supabase connected successfully', data });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
