const Announcement = require("../models/Announcement");

const seedAnnouncements = async () => {
  try {
    const count = await Announcement.countDocuments();
    if (count === 0) {
      console.log("Seeding default announcements...");
      await Announcement.insertMany([
        {
          title: "Thông báo nghỉ lễ Quốc khánh 2/9",
          content:
            "Trung tâm thông báo lịch nghỉ lễ Quốc khánh 2/9 từ ngày 01/09 đến hết ngày 03/09. Học sinh các lớp sẽ được nghỉ và học bù vào ngày khác theo sự sắp xếp của giảng viên.",
          targetRole: "ALL",
        },
        {
          title: "Cập nhật tính năng Cổng thông tin học sinh mới",
          content:
            "Chào mừng các em học sinh đến với giao diện Cổng thông tin học sinh mới! Các em hiện đã có thể theo dõi thời khóa biểu, tỷ lệ điểm danh và học phí trực tiếp ngay trên bảng điều khiển.",
          targetRole: "STUDENT",
        },
        {
          title: "Kỳ thi đánh giá năng lực định kỳ tháng 7",
          content:
            "Kỳ thi kiểm tra chất lượng học tập định kỳ sẽ được tổ chức vào ngày 15/07. Đề nghị tất cả học sinh ôn tập kỹ kiến thức các phần đã học để đạt kết quả tốt nhất.",
          targetRole: "STUDENT",
        },
        {
          title: "Họp hội đồng giảng viên và tập huấn chuyên môn",
          content:
            "Lịch họp định kỳ và tập huấn phương pháp giảng dạy mới sẽ diễn ra vào sáng Chủ Nhật tuần này lúc 9:00 tại phòng họp lớn.",
          targetRole: "TEACHER",
        },
      ]);
      console.log("✔ Seeded default announcements successfully.");
    }
  } catch (error) {
    console.error("Error seeding announcements:", error);
  }
};

module.exports = {
  seedAnnouncements,
};
