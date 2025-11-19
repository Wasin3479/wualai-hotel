const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeAdminLoginHandler(pool, JWT_SECRET) {
    return async function adminLogin(req, res) {
        try {
            const { email, password } = req.body || {};
            if (!email || !password) {
                return res.status(400).json({ message: 'กรุณาระบุอีเมลและรหัสผ่าน' });
            }

            const [admins] = await pool.execute(
                `SELECT id, email, password_hash, full_name, phone, status
         FROM admins WHERE email = ?`,
                [email]
            );
            if (admins.length === 0) {
                return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
            }

            const admin = admins[0];

            if (admin.status !== 'active') {
                return res.status(403).json({ message: 'บัญชีถูกระงับ' });
            }

            const ok = await bcrypt.compare(password, admin.password_hash);
            if (!ok) {
                return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
            }

            const [roleRows] = await pool.execute(
                `SELECT r.code, r.name
         FROM admin_role_map m
         JOIN admin_roles r ON r.id = m.role_id
         WHERE m.admin_id = ?`,
                [admin.id]
            );
            const roleCodes = roleRows.map(r => r.code);

            const token = jwt.sign(
                { id: admin.id, email: admin.email, roles: roleCodes, typ: 'admin' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                message: 'เข้าสู่ระบบสำเร็จ',
                token,
                admin: {
                    id: admin.id,
                    email: admin.email,
                    full_name: admin.full_name,
                    phone: admin.phone,
                    roles: roleRows, //[{code,name}]
                },
            });
        } catch (err) {
            console.error('Admin login error:', err);
            res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' });
        }
    };
}


function makeAddAdminHandler(pool) {
    return async function addAdmin(req, res) {
        try {
            const devkey = req.headers['devkey'];
            if (devkey !== 'wasinjiri') {
                return res.status(403).json({ message: 'Forbidden: invalid devkey' });
            }

            const { email, password, full_name, phone, roles = [] } = req.body || {};
            if (!email || !password) {
                return res.status(400).json({ message: 'กรุณาระบุ email และ password' });
            }

            const [exists] = await pool.execute(`SELECT id FROM admins WHERE email=?`, [email]);
            if (exists.length > 0) {
                return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const [result] = await pool.execute(
                `INSERT INTO admins (email, password_hash, full_name, phone, status)
         VALUES (?, ?, ?, ?, 'active')`,
                [email, passwordHash, full_name || null, phone || null]
            );

            const adminId = result.insertId;

            if (Array.isArray(roles) && roles.length > 0) {
                for (const code of roles) {
                    const [[role]] = await pool.execute(`SELECT id FROM admin_roles WHERE code=?`, [code]);
                    if (role) {
                        await pool.execute(
                            `INSERT INTO admin_role_map (admin_id, role_id) VALUES (?, ?)`,
                            [adminId, role.id]
                        );
                    }
                }
            }

            res.status(201).json({
                message: 'สร้างผู้ดูแลระบบสำเร็จ',
                admin: {
                    id: adminId,
                    email,
                    full_name,
                    phone,
                    roles,
                },
            });
        } catch (err) {
            console.error('Add admin error:', err);
            res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' });
        }
    };
}


module.exports = { makeAdminLoginHandler, makeAddAdminHandler };
