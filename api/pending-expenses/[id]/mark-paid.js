const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authentication token required');
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Mark pending expense as paid
const markAsPaid = async (id, userId) => {
  const query = `
    UPDATE pending_expenses 
    SET status = 'paid', updated_at = EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000
    WHERE id = $1 AND user_id = $2 AND status != 'paid'
    RETURNING *
  `;
  
  const result = await pool.query(query, [id, userId]);
  
  if (result.rows.length === 0) {
    throw new Error('Pending expense not found or already paid');
  }
  
  return result.rows[0];
};

// Main handler
export default async function handler(req, res) {
  try {
    const userId = verifyToken(req);
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Pending expense ID is required'
      });
    }

    if (req.method !== 'PATCH') {
      res.setHeader('Allow', ['PATCH']);
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`
      });
    }
    
    const updatedExpense = await markAsPaid(id, userId);
    
    res.status(200).json({
      success: true,
      message: 'Successfully marked as paid',
      data: updatedExpense
    });

  } catch (error) {
    console.error('Mark as paid API error:', error);
    
    if (error.message.includes('Authentication') || error.message.includes('token')) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    } else if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  }
}