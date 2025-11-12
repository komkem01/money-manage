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

// Get pending expense by ID
const getPendingExpenseById = async (id, userId) => {
  const query = `
    SELECT 
      pe.*,
      c.name as category_name,
      c.type_id,
      t.name as type_name
    FROM pending_expenses pe
    LEFT JOIN categories c ON pe.category_id = c.id
    LEFT JOIN types t ON c.type_id = t.id
    WHERE pe.id = $1 AND pe.user_id = $2
  `;
  
  const result = await pool.query(query, [id, userId]);
  
  if (result.rows.length === 0) {
    throw new Error('Pending expense not found');
  }
  
  const row = result.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    category_id: row.category_id,
    title: row.title,
    description: row.description,
    amount: row.amount,
    due_date: row.due_date,
    priority: row.priority,
    status: row.status,
    is_recurring: row.is_recurring,
    recurring_type: row.recurring_type,
    created_at: row.created_at.toString(),
    updated_at: row.updated_at.toString(),
    category: row.category_name ? {
      id: row.category_id,
      name: row.category_name,
      type_id: row.type_id,
      type: {
        id: row.type_id,
        name: row.type_name
      }
    } : null
  };
};

// Convert pending expense to transaction
const convertToTransaction = async (id, accountId, userId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get pending expense details
    const pendingExpense = await getPendingExpenseById(id, userId);
    
    if (pendingExpense.status === 'paid') {
      throw new Error('Pending expense already paid');
    }
    
    // Get expense type ID
    const typeQuery = "SELECT id FROM types WHERE name = 'Expense'";
    const typeResult = await client.query(typeQuery);
    
    if (typeResult.rows.length === 0) {
      throw new Error('Expense type not found');
    }
    
    const expenseTypeId = typeResult.rows[0].id;
    
    // Create transaction
    const transactionQuery = `
      INSERT INTO transactions (
        user_id, type_id, category_id, account_id, date, description, amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const transactionValues = [
      userId,
      expenseTypeId,
      pendingExpense.category_id,
      accountId,
      Date.now().toString(), // Current timestamp
      pendingExpense.description || pendingExpense.title,
      pendingExpense.amount
    ];
    
    const transactionResult = await client.query(transactionQuery, transactionValues);
    
    // Update account balance
    const updateAccountQuery = `
      UPDATE accounts 
      SET amount = amount - $1 
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    
    const accountResult = await client.query(updateAccountQuery, [
      pendingExpense.amount,
      accountId,
      userId
    ]);
    
    if (accountResult.rows.length === 0) {
      throw new Error('Account not found');
    }
    
    // Mark pending expense as paid
    const updatePendingQuery = `
      UPDATE pending_expenses 
      SET status = 'paid', updated_at = EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    
    await client.query(updatePendingQuery, [id, userId]);
    
    await client.query('COMMIT');
    
    return {
      transaction: transactionResult.rows[0],
      account: accountResult.rows[0],
      pendingExpense: pendingExpense
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
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

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`
      });
    }

    const { account_id } = req.body;
    
    if (!account_id) {
      return res.status(400).json({
        success: false,
        error: 'Account ID is required'
      });
    }
    
    const result = await convertToTransaction(id, account_id, userId);
    
    res.status(200).json({
      success: true,
      message: 'Successfully converted pending expense to transaction',
      data: result
    });

  } catch (error) {
    console.error('Convert to transaction API error:', error);
    
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
    } else if (error.message.includes('already paid')) {
      res.status(400).json({
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