const { Note, NoteFolder } = require("../models/Note");

const seedNoteData = async () => {
    try {
        // Clear existing data
        await Note.deleteMany({});
        await NoteFolder.deleteMany({});

        // Create default folders
        const folders = await NoteFolder.insertMany([
            {
                label: "Tài chính",
                color: "#059669",
                icon: "dollar-sign",
                isDefault: true,
                sortOrder: 1,
            },
            {
                label: "Cá nhân",
                color: "#7C3AED",
                icon: "user",
                isDefault: true,
                sortOrder: 2,
            },
            {
                label: "Công việc",
                color: "#DC2626",
                icon: "briefcase",
                isDefault: false,
                sortOrder: 3,
            },
            {
                label: "Học tập",
                color: "#2563EB",
                icon: "book-open",
                isDefault: false,
                sortOrder: 4,
            },
            {
                label: "Ý tưởng",
                color: "#F59E0B",
                icon: "lightbulb",
                isDefault: false,
                sortOrder: 5,
            },
        ]);

        // Create sample notes
        const notes = [
            // Tài chính folder notes
            {
                title: "Báo cáo chi tiêu tháng 8",
                content: `
          <h3>Bảng tổng hợp chi tiêu</h3>
          <table>
            <thead><tr><th>Hạng mục</th><th>Số tiền</th><th>Ghi chú</th></tr></thead>
            <tbody>
              <tr><td>Ăn uống</td><td>3.000.000đ</td><td>Ăn ngoài và đi chợ</td></tr>
              <tr><td>Giải trí</td><td>1.200.000đ</td><td>Phim ảnh, sách vở</td></tr>
              <tr><td>Di chuyển</td><td>800.000đ</td><td>Xăng xe, Grab</td></tr>
              <tr><td>Quần áo</td><td>500.000đ</td><td>Mua sắm online</td></tr>
            </tbody>
          </table>
          <h4>Mục tiêu tiết kiệm:</h4>
          <ul>
            <li><strong>Tiết kiệm:</strong> 2.000.000đ ✅</li>
            <li><strong>Đầu tư:</strong> 1.000.000đ ✅</li>
            <li><strong>Emergency fund:</strong> 500.000đ ✅</li>
          </ul>
          <p><em>Tổng kết: Đã đạt mục tiêu tiết kiệm 25% thu nhập tháng này!</em></p>
        `,
                folderId: folders[0]._id,
                tags: ["báo cáo", "chi tiêu", "tháng 8"],
                isFavorite: true,
            },
            {
                title: "Kế hoạch tiết kiệm 2024",
                content: `
          <h3>Mục tiêu tài chính năm 2024</h3>
          <ol>
            <li><strong>Đặt mục tiêu tiết kiệm 20% thu nhập mỗi tháng</strong>
              <ul>
                <li>Thu nhập dự kiến: 15 triệu/tháng</li>
                <li>Mục tiêu tiết kiệm: 3 triệu/tháng</li>
                <li>Tổng tiết kiệm cả năm: 36 triệu</li>
              </ul>
            </li>
            <li><strong>Chia khoản tiết kiệm thành các mục tiêu nhỏ:</strong>
              <ul>
                <li>Emergency fund: 20 triệu (6 tháng chi tiêu)</li>
                <li>Đầu tư: 10 triệu</li>
                <li>Du lịch: 5 triệu</li>
                <li>Mua sắm lớn: 1 triệu</li>
              </ul>
            </li>
            <li><strong>Theo dõi tiến độ hàng tuần</strong></li>
            <li><strong>Review và điều chỉnh hàng tháng</strong></li>
          </ol>
        `,
                folderId: folders[0]._id,
                tags: ["kế hoạch", "tiết kiệm", "2024"],
                isFavorite: false,
            },

            // Cá nhân folder notes
            {
                title: "Danh sách việc cần làm hàng ngày",
                content: `
          <h3>Morning Routine (6:00 - 8:00)</h3>
          <ul>
            <li>☐ Thức dậy lúc 6:00</li>
            <li>☐ Uống nước, ăn sáng nhẹ</li>
            <li>☐ Đọc sách 30 phút</li>
            <li>☐ Tập thể dục 30 phút</li>
            <li>☐ Meditation 10 phút</li>
          </ul>
          
          <h3>Work Day (8:00 - 17:00)</h3>
          <ul>
            <li>☐ Check email và lên kế hoạch ngày</li>
            <li>☐ Làm việc tập trung (Pomodoro)</li>
            <li>☐ Ăn trưa healthy</li>
            <li>☐ Review công việc cuối ngày</li>
          </ul>
          
          <h3>Evening Routine (17:00 - 22:00)</h3>
          <ul>
            <li>☐ Thư giãn 1 tiếng</li>
            <li>☐ Ăn tối cùng gia đình</li>
            <li>☐ Học tiếng Nhật 1 tiếng</li>
            <li>☐ Viết nhật ký</li>
            <li>☐ Đi ngủ trước 22:30</li>
          </ul>
        `,
                folderId: folders[1]._id,
                tags: ["routine", "thói quen", "hàng ngày"],
                isFavorite: true,
            },
            {
                title: "Ghi chú meeting với sếp",
                content: `
          <h4>Meeting ngày 20/8/2024 - 14:00</h4>
          <p><strong>Người tham dự:</strong> Tôi, Manager, Tech Lead</p>
          
          <h4>Agenda:</h4>
          <ol>
            <li><strong>Thảo luận về dự án mới</strong>
              <ul>
                <li>Project A: E-commerce platform</li>
                <li>Timeline: 3 tháng</li>
                <li>Budget: 500 triệu</li>
                <li>Team size: 5 developers</li>
              </ul>
            </li>
            <li><strong>Phân công nhiệm vụ</strong>
              <ul>
                <li>Tôi: Frontend lead</li>
                <li>An: Backend lead</li>
                <li>Bình: DevOps</li>
                <li>Cúc: QA</li>
                <li>Dung: UI/UX support</li>
              </ul>
            </li>
            <li><strong>Thống nhất deadline</strong>
              <ul>
                <li>Phase 1: 30/9 - Basic features</li>
                <li>Phase 2: 31/10 - Advanced features</li>
                <li>Phase 3: 30/11 - Testing & deployment</li>
              </ul>
            </li>
          </ol>
          
          <h4>Action items:</h4>
          <ul>
            <li>☐ Tạo technical specification (Due: 25/8)</li>
            <li>☐ Set up project repository (Due: 22/8)</li>
            <li>☐ First sprint planning meeting (28/8)</li>
          </ul>
        `,
                folderId: folders[1]._id,
                tags: ["meeting", "dự án", "công việc"],
                isFavorite: false,
            },

            // Công việc folder notes
            {
                title: "Ý tưởng cải thiện workflow",
                content: `
          <h3>Vấn đề hiện tại:</h3>
          <ul>
            <li>Code review mất quá nhiều thời gian</li>
            <li>Deploy process còn thủ công</li>
            <li>Testing thiếu automation</li>
            <li>Documentation không được update</li>
          </ul>
          
          <h3>Giải pháp đề xuất:</h3>
          <ol>
            <li><strong>Automation CI/CD Pipeline</strong>
              <ul>
                <li>Setup GitHub Actions</li>
                <li>Automated testing on PR</li>
                <li>Auto-deploy to staging</li>
                <li>One-click production deploy</li>
              </ul>
            </li>
            <li><strong>Code Review Guidelines</strong>
              <ul>
                <li>Tạo template cho PR</li>
                <li>Checklist cho reviewer</li>
                <li>Time limit: 24h response</li>
                <li>Automated code quality checks</li>
              </ul>
            </li>
            <li><strong>Documentation as Code</strong>
              <ul>
                <li>README templates</li>
                <li>API documentation tự động</li>
                <li>Architecture decision records</li>
              </ul>
            </li>
          </ol>
          
          <h3>Timeline thực hiện:</h3>
          <table>
            <tr><th>Task</th><th>Timeline</th><th>Owner</th></tr>
            <tr><td>Setup CI/CD</td><td>2 weeks</td><td>DevOps team</td></tr>
            <tr><td>Code review process</td><td>1 week</td><td>Tech leads</td></tr>
            <tr><td>Documentation</td><td>3 weeks</td><td>All developers</td></tr>
          </table>
        `,
                folderId: folders[2]._id,
                tags: ["workflow", "automation", "cải thiện"],
                isFavorite: false,
            },

            // Học tập folder notes
            {
                title: "Kế hoạch học tiếng Nhật N3",
                content: `
          <h3>Mục tiêu: Đạt JLPT N3 vào tháng 12/2024</h3>
          
          <h4>Thời gian học: 2 tiếng/ngày</h4>
          <ul>
            <li>Sáng: 1 tiếng (6:30 - 7:30) - Kanji + Grammar</li>
            <li>Tối: 1 tiếng (20:00 - 21:00) - Listening + Reading</li>
          </ul>
          
          <h4>Tài liệu học:</h4>
          <ol>
            <li><strong>Kanji:</strong>
              <ul>
                <li>Remembering the Kanji Vol 3</li>
                <li>Kanji in Context N3</li>
                <li>Anki deck: Core 2K/6K</li>
              </ul>
            </li>
            <li><strong>Grammar:</strong>
              <ul>
                <li>Shin Kanzen Master N3 Grammar</li>
                <li>TRY! N3 Grammar</li>
                <li>YouTube: Nihongo no Mori</li>
              </ul>
            </li>
            <li><strong>Listening:</strong>
              <ul>
                <li>Shin Kanzen Master N3 Listening</li>
                <li>NHK News Easy</li>
                <li>Anime với Japanese subtitles</li>
              </ul>
            </li>
            <li><strong>Reading:</strong>
              <ul>
                <li>Shin Kanzen Master N3 Reading</li>
                <li>Graded readers Level 3</li>
                <li>Yahoo News Japan (easy articles)</li>
              </ul>
            </li>
          </ol>
          
          <h4>Lịch trình hàng tuần:</h4>
          <table>
            <tr><th>Thứ</th><th>Focus</th><th>Practice test</th></tr>
            <tr><td>T2, T4, T6</td><td>Kanji + Grammar</td><td>-</td></tr>
            <tr><td>T3, T5, T7</td><td>Listening + Reading</td><td>-</td></tr>
            <tr><td>CN</td><td>Review + Mock exam</td><td>✓</td></tr>
          </table>
        `,
                folderId: folders[3]._id,
                tags: ["tiếng nhật", "N3", "kế hoạch học"],
                isFavorite: true,
            },

            // Ý tưởng folder notes
            {
                title: "Ý tưởng app quản lý thời gian",
                content: `
          <h3>Concept: "TimeWise" - Smart Time Management App</h3>
          
          <h4>Problem Statement:</h4>
          <p>Mọi người thường bị overwhelm với quá nhiều task và không biết ưu tiên thế nào. Các app hiện tại chỉ là todo list đơn giản, không có AI assist.</p>
          
          <h4>Core Features:</h4>
          <ol>
            <li><strong>AI Task Prioritization</strong>
              <ul>
                <li>Phân tích độ urgent/important</li>
                <li>Suggest thời gian optimal để làm</li>
                <li>Auto-reschedule khi có conflict</li>
              </ul>
            </li>
            <li><strong>Smart Calendar Integration</strong>
              <ul>
                <li>Sync với Google Calendar</li>
                <li>Block time cho deep work</li>
                <li>Smart meeting scheduling</li>
              </ul>
            </li>
            <li><strong>Focus Mode</strong>
              <ul>
                <li>Pomodoro timer tích hợp</li>
                <li>Block social media apps</li>
                <li>Background music/noise</li>
              </ul>
            </li>
            <li><strong>Analytics & Insights</strong>
              <ul>
                <li>Productivity trends</li>
                <li>Time allocation report</li>
                <li>Goal achievement tracking</li>
              </ul>
            </li>
          </ol>
          
          <h4>Technology Stack:</h4>
          <ul>
            <li><strong>Frontend:</strong> React Native (cross-platform)</li>
            <li><strong>Backend:</strong> Node.js + Express</li>
            <li><strong>Database:</strong> MongoDB</li>
            <li><strong>AI:</strong> OpenAI API hoặc custom ML model</li>
            <li><strong>Cloud:</strong> AWS/GCP</li>
          </ul>
          
          <h4>Monetization:</h4>
          <ul>
            <li>Freemium model</li>
            <li>Free: Basic todo + 1 AI suggestion/day</li>
            <li>Premium ($5/month): Unlimited AI, analytics, integrations</li>
            <li>Business ($15/month): Team features, admin dashboard</li>
          </ul>
          
          <h4>Next Steps:</h4>
          <ol>
            <li>Market research + competitor analysis</li>
            <li>Create detailed wireframes</li>
            <li>Build MVP (3 months)</li>
            <li>Beta testing với 100 users</li>
            <li>Launch + marketing campaign</li>
          </ol>
        `,
                folderId: folders[4]._id,
                tags: ["app", "time management", "AI", "startup"],
                isFavorite: true,
            },
        ];

        // Insert notes with proper folder references
        await Note.insertMany(notes);

        console.log("✅ Note seed data created successfully!");
        console.log(`📁 Created ${folders.length} folders`);
        console.log(`📝 Created ${notes.length} notes`);

    } catch (error) {
        console.error("❌ Error seeding note data:", error);
        throw error;
    }
};

// Run seeding if this file is executed directly
if (require.main === module) {
    const mongoose = require("mongoose");
    require("dotenv").config();

    mongoose
        .connect(process.env.MONGODB_URI)
        .then(async () => {
            console.log("MongoDB connected for seeding...");
            await seedNoteData();
            process.exit(0);
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err);
            process.exit(1);
        });
}

module.exports = { seedNoteData };