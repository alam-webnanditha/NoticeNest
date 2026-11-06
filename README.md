# NoticeNest
A verified campus noticeboard for managing and sharing college announcements.
# 📢 NoticeNest – Verified Campus Noticeboard

NoticeNest is a web-based campus noticeboard designed to help students access important college announcements in one place.

It provides a centralized platform where students can view, search, and filter notices related to examinations, events, placements, and general announcements.

## 🎯 Problem Statement

College announcements are often shared through multiple WhatsApp groups, emails, and physical noticeboards. Students may miss important updates because information is scattered across different platforms.

NoticeNest solves this problem by providing a single, organized, and searchable noticeboard.

## ✨ Features

- **Centralized Noticeboard:** View college announcements in one place.
- **Add New Notices:** Publish notices with a title, category, date, and publisher.
- **Search Notices:** Find notices using keywords.
- **Category Filters:** Filter notices by Examination, Events, Placement, and General.
- **Verification System:** Mark notices as verified or unverified.
- **Urgent Notices:** Highlight important announcements.
- **Dashboard:** View total, verified, urgent, and archived notice counts.
- **Archived Notices:** Separate expired notices from active notices.
- **MongoDB Database:** Store notices persistently.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend |
| Vite | Frontend development server |
| Node.js | Backend runtime |
| Express.js | REST API |
| MongoDB Atlas | Database |
| Mongoose | Database management |
| CSS | User interface styling |

## ⚙️ How It Works

1. The user opens the NoticeNest website.
2. The frontend requests notice data from the backend API.
3. The backend communicates with MongoDB Atlas.
4. Notices are retrieved and displayed on the website.
5. Users can search, filter, and view notices.
6. New notices can be submitted through the form.
7. Notices can be verified using the verification feature.
8. Expired notices are displayed in the archived section.

## 📂 Project Structure

```text
NoticeNest/
│
├── backend/
│   ├── models/
│   │   └── Notice.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🚀 Installation and Setup

### Prerequisites

- Node.js
- npm
- MongoDB Atlas account

### 1. Clone the repository

```bash
git clone https://github.com/alam-webnanditha/NoticeNest.git
cd NoticeNest
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Start the backend:

```bash
npm start
```

### 3. Set up the frontend

Open another terminal:

```bash
cd NoticeNest/frontend
npm install
npm run dev
```

Open the local URL displayed in your terminal to access the application.

## 🔐 Security

Environment files containing database credentials are excluded from Git using `.gitignore`. Never publish database connection strings or passwords.

## 🔮 Future Enhancements

- Student and administrator login
- Role-based access control
- Email notifications for urgent notices
- Notice approval workflow
- Improved mobile experience

## 👩‍💻 Project Information

**Project Name:** NoticeNest  
**Project Type:** College Mini Project  
**Category:** Web Development  
**GitHub Repository:** https://github.com/alam-webnanditha/NoticeNest

---

*NoticeNest – Important campus updates, all in one place.*