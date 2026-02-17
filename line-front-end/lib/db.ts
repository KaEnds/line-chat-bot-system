import { Pool, QueryResult } from 'pg';

// ตั้งค่า Connection Pool ตามข้อมูลใน pgAdmin
const pool = new Pool({
  host: 'host.docker.internal',
  port: 5434,
  database: 'librairy', 
  user: 'admin',
  password: 'adminpass'
});

// ตรวจสอบ Error ขณะ Idle
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// ฟังก์ชันสำหรับ Execute Query
export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับ Get Client (กรณีใช้ Transaction)
export const getClient = async () => {
  return pool.connect();
};

// ฟังก์ชันทดสอบการเชื่อมต่อ
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Current database time:', result.rows[0].now);
    client.release();
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

export const getTestBib = async (limit: number = 100) => {
  const queryText = 'SELECT * FROM librairy.test_bib LIMIT $1';
  try {
    const res = await pool.query(queryText, [limit]);
    return res.rows;
  } catch (err) {
    console.error('Error executing query on test_bib:', err);
    throw err;
  }
};

export const insertBookRequest = async (data: any) => {
  const queryText = `
    WITH inserted_request AS (
        INSERT INTO librairy.book_requests (
            title, authors, isbn_issn, publication_year, publisher,
            branch, requester_name, requester_id, requester_role, 
            faculty_id, department_id, request_reason_category, 
            specify_reason, status, requested_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW() AT TIME ZONE 'UTC')
        RETURNING request_id
    ),
    insert_supporters AS (
        INSERT INTO librairy.request_supporters (request_id, requester_id, supported_at)
        SELECT request_id, $8, NOW() AT TIME ZONE 'UTC' FROM inserted_request
        RETURNING request_id
    ),
    active_batch AS (
        SELECT batch_id FROM librairy.batches 
        WHERE (NOW() AT TIME ZONE 'UTC') BETWEEN batch_start_date AND batch_end_date
          AND status = 'PROCESSING'
        LIMIT 1
    )
    INSERT INTO librairy.batch_requests (batch_id, request_id)
    SELECT 
        ab.batch_id, 
        ir.request_id
    FROM inserted_request ir
    CROSS JOIN active_batch ab
    RETURNING (SELECT request_id FROM inserted_request) AS new_id;
  `;

  const values = [
    data.title,
    data.authors || null,
    data.isbn_issn || null,
    data.publication_year || null,
    data.publisher || null,
    data.branch,
    data.requester_name,
    data.requester_id,
    data.requester_role,
    data.faculty_id,
    data.department_id,
    data.request_reason_category,
    data.specify_reason,
    data.status || 'PENDING'
  ];

  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (err) {
    console.error('Database Insert Error:', err);
    throw err;
  }
};

export const insertWebUser = async (userData: any) => {
  const queryText = `
    INSERT INTO librairy.web_user (
      username, password, user_role, account_status, name, surname
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    userData.username,
    userData.password, // ในระบบจริงควรมีการ hash รหัสผ่านก่อน
    userData.user_role,
    userData.account_status,
    userData.name,
    userData.surname
  ];

  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (err) {
    console.error('Insert User Error:', err);
    throw err;
  }
};

export const submitRequestForm = async (formData: any) => {
  console.log('Form Data Received:', formData);
};

export const getMyRequests = async (requesterID: string) => {
  const query = 'SELECT * FROM librairy.book_requests WHERE requester_id = $1'

  const values = [requesterID];

  try {
    const res = await pool.query(query, values);
    return res.rows;
  } catch (err) {
    console.error('Database Query Error:', err);
  }
};

export const getOthersRequests = async (requesterID: string) => {
  const query = 'SELECT * FROM librairy.book_requests WHERE requester_id != $1'

  const values = [requesterID];
  
  try {
    const res = await pool.query(query, values);
    return res.rows;
  } catch (err) {
    console.error('Database Query Error:', err);
  }
};

export const getFacultiesAndDepartment = async () => {

  const query = `
    SELECT 
      f.faculty_id, 
      f.faculty_name_en, 
      f.faculty_name_th, 
      d.department_id, 
      d.department_name_en, 
      d.department_name_th,
      d.degree
    FROM librairy.faculties f
    JOIN librairy.departments d ON f.faculty_id = d.faculty_id
    ORDER BY f.faculty_id, d.department_id
  `;

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    console.error('Database Query Error:', err);
  }
}

export const getSupporterRequest = async () => {
  const query = 'SELECT * FROM librairy.request_supporters'
  
  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    console.error('Database Query Error:', err);
  }
}

export const insertSupporterRequest = async (request_id: string, requester_id: string) => {
  try {
    const query = `
      INSERT INTO librairy.request_supporters (request_id, requester_id, supported_at)
      VALUES ($1, $2, NOW())
      RETURNING *;
    `;
    
    const values = [Number(request_id), requester_id];
    
    const res = await pool.query(query, values);
    return res.rows;
  } catch (err) {
    console.error("Error inserting supporter:", err);
  }
};

export const getBookDetailsByTitleInLibrary = async (title: string) => {
  try {
    const query = `
      SELECT * FROM librairy.test_bib3
      WHERE title ILIKE $1
    `;
    const values = [`%${title}%`];
    const res = await pool.query(query, values);
    return res.rows;
  } catch (err) {
    console.error("Error fetching book details:", err);
  }
}

export const getBookDetailsByTitleOutLibrary = async (title: string) => {
  try {
    const query = `
      SELECT * FROM librairy.book_api_cache
      WHERE title ILIKE $1
    `;
    const values = [`%${title}%`];
    const res = await pool.query(query, values);
    return res.rows;
  } catch (err) {
    console.error("Error fetching book details:", err);
  }
}

export default pool;