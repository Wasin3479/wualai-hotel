/** 
 * ตั้งค่าค่าเริ่มต้นของเมนูกลุ่มทั้งหมด
 * 'expanded' = ขยายทุกกลุ่ม / 'collapsed' = ย่อทุกกลุ่ม
 */
export const MENU_OPEN_DEFAULT = 'collapsed'; // ← เปลี่ยนเป็น 'collapsed' ได้


export const MENU = [
    { type: "link", label: "สรุปผล", to: "/view_dashboard" },

    {
        type: "group",
        id: "inventory",
        label: "จัดการห้องพัก",
        defaultOpen: true,
        items: [
            { type: "link", label: "ประเภทห้อง", to: "/room-types" },
            { type: "link", label: "ห้องพัก", to: "/rooms" },
            { type: "link", label: "การจอง", to: "/bookings" },
        ],
    },

    // การเงิน
    { type: "link", label: "การชำระเงิน", to: "/payments" },

    // ลูกค้า
    { type: "link", label: "รายการลูกค้า", to: "/users" },

    // สื่อ/คอนเทนต์
    {
        type: "group",
        id: "content",
        label: "สื่อ/คอนเทนต์",
        items: [
            { type: "link", label: "สไลด์หน้าแรก", to: "/content/home-slides" },
        ],
    },

    // รายงาน
    {
        type: "group",
        id: "reports",
        label: "รายงาน",
        items: [
            { type: "link", label: "สรุปรายได้", to: "/reports/revenue" },
            { type: "link", label: "อัตราเข้าพัก", to: "/reports/occupancy" },
            { type: "link", label: "รายงานการจอง", to: "/reports/bookings" },
        ],
    },

    // ผู้ดูแลระบบ (RBAC)
    {
        type: "group",
        id: "admin",
        label: "ผู้ดูแลระบบ",
        items: [
            { type: "link", label: "ผู้ดูแลทั้งหมด", to: "/admins" },
            { type: "link", label: "บทบาท (RBAC)", to: "/admins-roles" },
        ],
    },

    // ตั้งค่า
    {
        type: "group",
        id: "settings",
        label: "ตั้งค่า",
        items: [
            { type: "link", label: "บัญชีธนาคาร", to: "/settings-bankaccount" },
            { type: "link", label: "โปรไฟล์ของฉัน", to: "/settings-account" },
        ],
    },
];