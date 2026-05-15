const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new API client
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_name
 *               - email
 *               - password
 *             properties:
 *               company_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration successful
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

router.post('/register', async (req, res) => {
  console.log('BODY RECEIVED:', req.body);

  // Validate body exists
  if (!req.body) {
    return res.status(400).json({
      success: false,
      error: 'Request body missing'
    });
  }

  const { company_name, email, password } = req.body;

  // Required field validation
  if (!company_name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'company_name, email, password required'
    });
  }

  try {
    // Check existing email
    const existingUser = await db.query(
      'SELECT * FROM clients WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create client
    const clientResult = await db.query(
      `
      INSERT INTO clients (company_name, email, password)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [company_name, email, hashedPassword]
    );

    const client = clientResult.rows[0];

    // Generate API credentials
    const apiKey = `ak_${uuidv4().replace(/-/g, '')}`;
    const apiSecret = `as_${crypto.randomBytes(32).toString('hex')}`;

    // Store API credentials
    await db.query(
      `
      INSERT INTO api_users (
        company_name,
        api_key,
        api_secret,
        plan
      )
      VALUES ($1, $2, $3, 'free')
      `,
      [company_name, apiKey, apiSecret]
    );

    // JWT token
    const token = jwt.sign(
      {
        id: client.id,
        email: client.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Registration response
    res.json({
      success: true,
      token,
      api_key: apiKey,
      api_secret: apiSecret, // only shown once
      client: {
        id: client.id,
        company_name: client.company_name,
        email: client.email
      }
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login API client
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }

    // Find client
    const result = await db.query(
      'SELECT * FROM clients WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const client = result.rows[0];

    // Password compare
    const isMatch = await bcrypt.compare(password, client.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Get API user info
    const apiUserResult = await db.query(
      'SELECT * FROM api_users WHERE company_name = $1',
      [client.company_name]
    );

    const apiUser = apiUserResult.rows[0];

    // Generate JWT
    const token = jwt.sign(
      {
        id: client.id,
        email: client.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Login response (NO api_secret)
    res.json({
      success: true,
      token,
      api_key: apiUser.api_key,
      client: {
        id: client.id,
        company_name: client.company_name,
        email: client.email
      }
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;