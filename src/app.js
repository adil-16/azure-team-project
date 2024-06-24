const express = require('express');
const projectRoutes = require('./routes/projectRoutes');
const cors = require('cors'); // Import the cors package
const app = express();
require('dotenv').config();

app.use(cors()); // Use the cors middleware
app.use(express.json());
app.use('/api/projects', projectRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
