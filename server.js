
const express = require('express');
const admin = require('firebase-admin');
require('dotenv').config(); 

const app = express();

app.use(express.json());

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://rpn-techworld.firebaseio.com', 
  });
}

app.post('/api/forms', async (req, res) => {
  const formData = req.body;
  console.log('Received form data:', formData);
  try {
    const newRef = admin.database().ref('forms').push();
    await newRef.set(formData);
    res.status(201).json({ status: 'success', message: 'Form created successfully!', data: { id: newRef.key, ...formData } });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ status: 'error', message: 'Error creating form.' });
  }
});

app.get('/api/forms', async (req, res) => {
  try {
    const formsSnapshot = await admin.database().ref('forms').once('value');
    const forms = formsSnapshot.val();
    res.status(200).json({ status: 'success', data: forms });
  } catch (error) {
    console.error('Error retrieving forms:', error);
    res.status(500).json({ status: 'error', message: 'Error retrieving forms.' });
  }
});

// PUT: Update an existing form
app.put('/api/forms/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    await admin.database().ref(`forms/${id}`).update(updateData);
    res.status(200).json({ status: 'success', message: 'Form updated successfully!', data: updateData });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ status: 'error', message: 'Error updating form.' });
  }
});

// DELETE: Delete a form by ID
app.delete('/api/forms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await admin.database().ref(`forms/${id}`).remove();
    res.status(200).json({ status: 'success', message: 'Form deleted successfully!' });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ status: 'error', message: 'Error deleting form.' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
